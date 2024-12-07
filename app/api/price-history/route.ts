import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get('tokenAddress');

  if (!tokenAddress) {
    return NextResponse.json({
      error: 'Please provide a token address'
    }, { status: 400 });
  }

  try {
    // First get the pair address from DexScreener
    const dexScreenerResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    const dexScreenerData = await dexScreenerResponse.json();
    const pair = dexScreenerData.pairs?.[0];

    if (!pair) {
      return NextResponse.json({
        prices: []
      });
    }

    // Then fetch detailed price history from DexTools
    const now = Math.floor(Date.now() / 1000);
    const oneDayAgo = now - (24 * 60 * 60);
    
    const dexToolsResponse = await fetch(
      `https://api.dextools.io/v1/pair/${pair.chainId}/${pair.pairAddress}/candles?from=${oneDayAgo}&to=${now}&resolution=5`,
      {
        headers: {
          'X-API-Key': process.env.DEXTOOLS_API_KEY || ''
        }
      }
    );
    
    const priceData = await dexToolsResponse.json();
    
    // Transform the candle data into price points
    const prices = priceData.data?.map((candle: any) => parseFloat(candle.close)) || [];

    return NextResponse.json({
      prices,
      pairInfo: {
        address: pair.pairAddress,
        chain: pair.chainId,
        dex: pair.dexId
      }
    });
  } catch (error) {
    console.error('Error fetching price history:', error);
    return NextResponse.json({
      prices: []
    });
  }
} 