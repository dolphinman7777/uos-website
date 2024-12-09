import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { Redis } from '@upstash/redis';
import { Ratelimit } from '@upstash/ratelimit';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Initialize Upstash Redis
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// Create a rate limiter that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(10, '10 s'),
  analytics: true,
  prefix: 'chat_api',
});

// This should be in your .env file
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || 'vs_FmX9izAlvGMTTl28lsaNKQaf';
const QUEUE_KEY = 'chat_queue';
const PROCESSING_KEY = 'chat_processing';

interface QueueMessage {
  message: string;
  threadId?: string;
  requestId: string;
}

interface ChatResponse {
  response: string;
  threadId: string;
}

async function processQueue() {
  try {
    // Get next item from queue
    const nextRequest = await redis.lpop<QueueMessage>(QUEUE_KEY);
    if (!nextRequest) return;

    console.log('Processing message:', nextRequest);

    // No need to parse, Upstash returns parsed JSON
    const { message, threadId, requestId } = nextRequest;
    
    try {
      // Mark as processing
      await redis.set(`${PROCESSING_KEY}:${requestId}`, 'processing', { ex: 60 });

      // Process the request
      const currentThread = threadId ? threadId : (await openai.beta.threads.create()).id;
      console.log('Created/using thread:', currentThread);

      await openai.beta.threads.messages.create(currentThread, {
        role: 'user',
        content: message,
      });
      console.log('Added message to thread');

      const run = await openai.beta.threads.runs.create(currentThread, {
        assistant_id: ASSISTANT_ID,
      });
      console.log('Created run:', run.id);

      let runStatus = await openai.beta.threads.runs.retrieve(currentThread, run.id);
      let attempts = 0;
      const maxAttempts = 60; // Increased timeout to 60 seconds

      while (runStatus.status !== 'completed' && attempts < maxAttempts) {
        console.log('Run status:', runStatus.status, 'attempt:', attempts);
        await new Promise(resolve => setTimeout(resolve, 1000));
        runStatus = await openai.beta.threads.runs.retrieve(currentThread, run.id);
        attempts++;

        if (runStatus.status === 'failed' || runStatus.status === 'cancelled') {
          throw new Error(`Assistant run ${runStatus.status}: ${runStatus.last_error?.message || 'Unknown error'}`);
        }
      }

      if (attempts >= maxAttempts) {
        throw new Error('Assistant run timed out');
      }

      const messages = await openai.beta.threads.messages.list(currentThread);
      console.log('Got messages:', messages.data.length);
      
      const lastMessage = messages.data[0];
      if (!lastMessage?.content?.[0]) {
        throw new Error('No response from assistant');
      }

      const messageContent = lastMessage.content[0];
      if (messageContent.type !== 'text') {
        throw new Error('Unexpected response type from assistant');
      }

      console.log('Got response:', messageContent.text.value);

      // Store the result
      const response: ChatResponse = {
        response: messageContent.text.value,
        threadId: currentThread
      };

      await redis.set(`result:${requestId}`, JSON.stringify(response), { ex: 300 }); // expire in 5 minutes

    } catch (error) {
      console.error('Error processing message:', error);
      // Store the error
      await redis.set(`result:${requestId}`, JSON.stringify({
        error: error instanceof Error ? error.message : 'Failed to process chat message'
      }), { ex: 300 });
    } finally {
      // Clear processing status
      await redis.del(`${PROCESSING_KEY}:${requestId}`);
    }
  } catch (error) {
    console.error('Fatal queue error:', error);
  } finally {
    // Process next item - but wait a bit to prevent tight loops on errors
    setTimeout(() => processQueue(), 1000);
  }
}

export async function POST(request: Request) {
  try {
    const { message, threadId } = await request.json();
    console.log('Received message:', message, 'threadId:', threadId);
    
    // Check rate limit
    const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
    const rateLimitResult = await ratelimit.limit(ip);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': rateLimitResult.reset.toString(),
          }
        }
      );
    }

    // Generate unique request ID
    const requestId = crypto.randomUUID();
    console.log('Generated requestId:', requestId);

    // Add to queue
    const queueMessage: QueueMessage = { message, threadId, requestId };
    await redis.rpush(QUEUE_KEY, queueMessage); // Upstash will handle JSON stringification

    // Start queue processing if not already running
    processQueue().catch(error => console.error('Queue processing error:', error));

    // Return request ID for client to poll
    return NextResponse.json({ requestId });

  } catch (error) {
    console.error('Error in chat route:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to process chat message' },
      { status: 500 }
    );
  }
}

// Add polling endpoint
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const requestId = searchParams.get('requestId');
    console.log('Polling for requestId:', requestId);

    if (!requestId) {
      return NextResponse.json({ error: 'Missing requestId' }, { status: 400 });
    }

    const result = await redis.get<string>(`result:${requestId}`);
    if (!result) {
      const processing = await redis.get<string>(`${PROCESSING_KEY}:${requestId}`);
      console.log('Status for', requestId, ':', processing ? 'processing' : 'queued');
      return NextResponse.json({ status: processing ? 'processing' : 'queued' });
    }

    console.log('Got result for', requestId);
    // Parse the result before returning
    const parsedResult = typeof result === 'string' ? JSON.parse(result) : result;
    return NextResponse.json(parsedResult);
  } catch (error) {
    console.error('Error in polling:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get chat response' },
      { status: 500 }
    );
  }
} 