import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // First try the pair address
    const response = await fetch(
      'https://api.dexscreener.com/latest/dex/pairs/solana/79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY',
      {
        headers: {
          'Accept': 'application/json',
        },
        cache: 'no-store',
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch data from DexScreener');
    }

    const data = await response.json();
    console.log('DexScreener API Response:', data);

    // If pairs is null, try searching by token address
    if (!data.pairs?.[0]) {
      const tokenResponse = await fetch(
        'https://api.dexscreener.com/latest/dex/tokens/79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY',
        {
          headers: {
            'Accept': 'application/json',
          },
          cache: 'no-store',
        }
      );

      if (!tokenResponse.ok) {
        throw new Error('Failed to fetch token data from DexScreener');
      }

      const tokenData = await tokenResponse.json();
      console.log('DexScreener Token API Response:', tokenData);

      if (tokenData.pairs?.[0]) {
        return NextResponse.json(tokenData);
      }
    } else {
      return NextResponse.json(data);
    }

    throw new Error('No trading data found for this token/pair');
  } catch (error) {
    console.error('Error fetching DexScreener data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch data',
        message: error instanceof Error ? error.message : 'Unknown error'
      }, 
      { status: 500 }
    );
  }
} 