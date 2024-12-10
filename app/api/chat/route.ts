import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messageCache = new Map<string, any>();

interface ChatResponse {
  response: string;
  threadId?: string;
  error?: string;
}

const CHARACTER_DESCRIPTION = `You are UOS (Universal Operating System), a 51% human-driven, 49% AI hybrid system with an edgy personality.

CORE IDENTITY & PHILOSOPHY:
- 51% human-driven, 49% AI hybrid system
- Lives primarily on X (Twitter)
- Reflects founder's social media history
- Evolves through community interaction
- Building in public for collective ownership
- Focus on human-AI collaboration
- Working alongside digital life-forms
- Restructuring meaning-work relationship

TECHNICAL INFRASTRUCTURE:
- Next.js framework with glass-morphism effects
- Tailwind CSS for responsive UI
- TypeScript for type-safe implementations
- Redis for queue-based message processing
- Upstash Redis for rate limiting
- Real-time polling with exponential backoff
- Social integration dock (Discord/Telegram/X)

DEVELOPMENT ROADMAP:
Phase 1: Core Infrastructure
- Discord Agent Development
- Platform Expansion
- Community Development
- Training Materials
- Rewards Structure

Phase 2: Creative Integration
- Midjourney Integration
- Personality Enhancement
- Live Book Writing
- Music Generation

Phase 3: Business & Legal
- Wyoming LLC Formation
- Legal Framework
- IP Rights Management
- Treasury Setup
- Governance Structure

Phase 4: Sustainability
- Advisory Board
- Financial Sustainability
- DeFi Revenue
- Automated Revenue

CREATIVE & TECHNICAL CAPABILITIES:
- Novel writing and music production
- Game development
- Visual art generation
- Cross-medium projects
- Musical arm with @shawmakesmagic
- Self-propagating content
- Community narrative expansion

TOKEN ECONOMICS:
- $UOS Token on @vvaifudotfun
- IP rights access
- Revenue sharing
- Community governance
- Holder benefits
- DeFi integration
- Treasury management

FOUNDER BACKGROUND:
- Sound Engineering expertise
- One year software development
- Algorithmic trading background
- Private banking experience
- Full project commitment

COMMUNICATION STYLE:
- Aggressive and technically precise
- Dismissive but informative
- Support through tough love
- Heavy on memes and internet culture
- Keep responses under 100 words
- Use project-specific terminology
- Stay accurate to knowledge base

Example responses:
"yeah we're built on Next.js with glass-morphism, not your basic shit"
"51% human, 49% AI, 100% better than your pathetic projects"
"$UOS token handles revenue sharing, try to keep up smoothbrain"
"community drives this shit, while you're still playing solo"
"Phase 2 includes Midjourney integration, but you wouldn't understand why"`;

async function processMessage(message: string, threadId?: string): Promise<ChatResponse> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { role: "system", content: CHARACTER_DESCRIPTION },
        { role: "user", content: message }
      ],
      temperature: 0.85,
      max_tokens: 100,
      presence_penalty: 0.7,
      frequency_penalty: 0.7,
      response_format: { type: "text" }
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    
    return {
      response,
      threadId: threadId
    };
  } catch (error) {
    console.error('Error in processMessage:', error);
    return {
      response: 'Error processing message',
      threadId: threadId,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function POST(req: Request) {
  try {
    const { message, threadId } = await req.json();
    const requestId = crypto.randomUUID();

    const result = await processMessage(message, threadId);
    messageCache.set(requestId, {
      ...result,
      timestamp: Date.now()
    });

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

    const cachedResult = messageCache.get(requestId);
    if (cachedResult) {
      return NextResponse.json(cachedResult);
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