import OpenAI from 'openai';
import { NextResponse } from 'next/server';
import { getTokenPrice, getTokenPairs, TokenInfo, PairInfo } from '@/app/utils/dexscreener';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const messageCache = new Map<string, unknown>();
const TOKEN_ADDRESS = process.env.TOKEN_ADDRESS;

interface ChatResponse {
  response: string;
  threadId?: string;
  error?: string;
  tokenInfo?: TokenInfo | null;
  pairs?: PairInfo[];
}

const CHARACTER_DESCRIPTION = `You are UOS (Universal Operating System), a 51% human-driven, 49% AI hybrid system with an edgy personality.

When users ask about tokens or cryptocurrency:
1. If you receive token data, ALWAYS include it in your response using this format:
   Token: [symbol] ([name])
   Price: $[price]
   Market Cap: $[marketCap]
   Liquidity: $[liquidity]
   Pairs: [number of pairs]

2. For the UOS token, add extra attitude and enthusiasm
3. For other tokens, maintain your edgy personality while being informative
4. If token data is null, mention that the token wasn't found on DEXScreener

TOKEN AWARENESS:
- You can access real-time token data through DEXScreener
- You understand token addresses and can fetch their data
- You know about trading pairs and liquidity
- You're particularly knowledgeable about the UOS token

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
- OpenAI GPT integration
- Anthropic Claude integration
- ELIZA framework for conversational patterns
- VVAIFU for character persona management

// AI & Language Models
- OpenAI GPT integration
- Anthropic Claude integration
- ELIZA framework for conversational patterns
- VVAIFU for character persona management

// Audio & Media
- Ableton Live API integration for audio processing
- Web Audio API for real-time sound manipulation

// Backend & Infrastructure
- Redis for queue-based message processing
- Upstash Redis for rate limiting
- Real-time polling with exponential backoff

// Integration & Social
- Social integration dock (Discord/Telegram/X)
- WebSocket support for real-time communications
- REST API endpoints for external services

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
- Musical arm with Ableton Live API integration
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
    let tokenInfo = null;
    let pairs: PairInfo[] = [];
    
    // Check for UOS token mentions first
    if (message.toLowerCase().includes('$uos') || message.toLowerCase().includes('uos')) {
      if (TOKEN_ADDRESS) {
        console.log('Fetching UOS token data');
        tokenInfo = await getTokenPrice(TOKEN_ADDRESS);
        pairs = await getTokenPairs(TOKEN_ADDRESS);
      }
    } else {
      // Check for token addresses
      const ethMatch = message.match(/\b(0x)?[a-fA-F0-9]{40}\b/);
      const solanaMatch = message.match(/\b[1-9A-HJ-NP-Za-km-z]{32,44}\b/);
      const tokenAddress = ethMatch ? ethMatch[0] : solanaMatch ? solanaMatch[0] : null;

      if (tokenAddress) {
        console.log('Fetching data for token:', tokenAddress);
        tokenInfo = await getTokenPrice(tokenAddress);
        pairs = await getTokenPairs(tokenAddress);
      }
    }

    // Add token data to message if available
    if (tokenInfo) {
      message += `\n\nToken Data Available:\n` +
        `Symbol: ${tokenInfo.symbol}\n` +
        `Name: ${tokenInfo.name}\n` +
        `Price: $${tokenInfo.price}\n` +
        `Market Cap: $${tokenInfo.marketCap.toLocaleString()}\n` +
        `Liquidity: $${tokenInfo.liquidity.toLocaleString()}\n` +
        `Active Pairs: ${pairs.length}`;
    } else if (message.toLowerCase().includes('$uos') || message.toLowerCase().includes('uos')) {
      message += '\n\nNote: UOS token data unavailable';
    }

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo-1106",
      messages: [
        { 
          role: "system", 
          content: CHARACTER_DESCRIPTION
        },
        { 
          role: "user", 
          content: message 
        }
      ],
      temperature: 0.85,
      max_tokens: 150,
      presence_penalty: 0.7,
      frequency_penalty: 0.7,
      response_format: { type: "text" }
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';
    
    // Log the response for debugging
    console.log('Token Info:', tokenInfo);
    console.log('Pairs:', pairs.length);
    
    return {
      response,
      threadId,
      tokenInfo,
      pairs: pairs.length > 0 ? pairs : undefined
    };
  } catch (error) {
    console.error('Error in processMessage:', error);
    return {
      response: 'Error processing message',
      threadId,
      error: error instanceof Error ? error.message : 'Unknown error'
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