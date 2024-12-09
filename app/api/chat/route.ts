import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'asst_S9t6Xm5W0KUDqq9VXhn5TPY9';

// Initialize Redis with error handling
let redis: Redis | null = null;
let ratelimit: Ratelimit | null = null;

try {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL!,
    token: process.env.UPSTASH_REDIS_REST_TOKEN!,
  });

  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.fixedWindow(50, '10 s'),
    prefix: 'chat_api',
    analytics: false,
  });
} catch (error) {
  console.error('Failed to initialize Redis:', error);
}

// In-memory fallback cache
const messageCache = new Map<string, any>();

interface ChatResponse {
  response: string;
  threadId: string;
  error?: string;
}

async function processMessage(message: string, threadId?: string): Promise<ChatResponse> {
  try {
    // Reuse thread if provided, otherwise create new
    const currentThread = threadId ? threadId : (await openai.beta.threads.create()).id;
    
    // Add message to thread
    await openai.beta.threads.messages.create(currentThread, {
      role: 'user',
      content: message,
    });

    // Create and monitor run
    const run = await openai.beta.threads.runs.create(currentThread, {
      assistant_id: ASSISTANT_ID,
    });

    const response = await waitForCompletion(currentThread, run.id);
    
    return {
      response,
      threadId: currentThread,
    };
  } catch (error) {
    console.error('Error in processMessage:', error);
    return {
      response: 'Error processing message',
      threadId: threadId || '',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

async function waitForCompletion(threadId: string, runId: string, maxAttempts = 30): Promise<string> {
  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const runStatus = await openai.beta.threads.runs.retrieve(threadId, runId);
    
    if (runStatus.status === 'completed') {
      const messages = await openai.beta.threads.messages.list(threadId);
      const lastMessage = messages.data[0];
      
      if (!lastMessage?.content?.[0] || lastMessage.content[0].type !== 'text') {
        throw new Error('Invalid response format from assistant');
      }
      
      return lastMessage.content[0].text.value;
    }
    
    if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
      throw new Error(`Run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
    }
    
    attempts++;
    await new Promise(resolve => setTimeout(resolve, 1000));
  }
  
  throw new Error('Assistant run timed out');
}

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json();
    const requestId = crypto.randomUUID();

    // Try rate limiting if Redis is available
    if (ratelimit) {
      try {
        const { success } = await ratelimit.limit(requestId);
        if (!success) {
          return NextResponse.json(
            { error: 'Too many requests. Please try again later.' },
            { status: 429 }
          );
        }
      } catch (error) {
        console.error('Rate limit error:', error);
        // Continue without rate limiting if Redis fails
      }
    }

    // Process message
    const result = await processMessage(message, threadId);
    
    // Store in memory cache
    messageCache.set(requestId, {
      ...result,
      timestamp: Date.now()
    });

    // Try to store in Redis if available
    if (redis) {
      try {
        await redis.set(`result:${requestId}`, result, { ex: 3600 });
      } catch (error) {
        console.error('Redis storage error:', error);
        // Continue with in-memory cache if Redis fails
      }
    }

    return NextResponse.json({ 
      requestId, 
      ...result 
    });
  } catch (error) {
    console.error('Error in POST:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get('requestId');

    if (!requestId) {
      return NextResponse.json(
        { error: 'Missing requestId' },
        { status: 400 }
      );
    }

    // Check in-memory cache first
    const cachedResult = messageCache.get(requestId);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
    }

    // Try Redis if available
    if (redis) {
      try {
        const result = await redis.get(`result:${requestId}`);
        if (result) {
          messageCache.set(requestId, result);
          return NextResponse.json(result);
        }
      } catch (error) {
        console.error('Redis fetch error:', error);
        // Continue without Redis if it fails
      }
    }

    return NextResponse.json({ status: 'not_found' });
  } catch (error) {
    console.error('Error in GET:', error);
    return NextResponse.json(
      { error: 'Failed to fetch result' },
      { status: 500 }
    );
  }
} 