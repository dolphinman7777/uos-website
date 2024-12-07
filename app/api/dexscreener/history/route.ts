import { NextResponse } from 'next/server';

interface PriceDataPoint {
  time: number;
  value: number;
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '24h';
    const currentPrice = parseFloat(searchParams.get('price') || '0');
    const h1Change = parseFloat(searchParams.get('h1') || '0');
    const h24Change = parseFloat(searchParams.get('h24') || '0');
    const d7Change = parseFloat(searchParams.get('d7') || '0');

    // Allow zero price for initial state
    if (isNaN(currentPrice)) {
      throw new Error('Invalid price data');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Calculate price changes based on the period
    let timeRange: number;
    let points: number;
    let priceChange: number;
    
    switch (period) {
      case '1h':
        timeRange = 60 * 60;
        points = 60;
        priceChange = h1Change / 100;
        break;
      case '7d':
        timeRange = 7 * 24 * 60 * 60;
        points = 168;
        priceChange = d7Change / 100;
        break;
      default: // 24h
        timeRange = 24 * 60 * 60;
        points = 96;
        priceChange = h24Change / 100;
    }

    // Calculate start price based on the price change percentage
    const startPrice = currentPrice / (1 + priceChange);
    const priceData: PriceDataPoint[] = [];

    // Generate price points with realistic movement
    for (let i = 0; i <= points; i++) {
      const timePoint = now - timeRange + (i * (timeRange / points));
      const progress = i / points;
      
      // Calculate price with weighted randomness for natural movement
      const basePrice = startPrice + (currentPrice - startPrice) * progress;
      const volatility = Math.abs(priceChange) * 0.1;
      const randomFactor = (Math.random() - 0.5) * 2 * volatility;
      const weightedRandom = randomFactor * Math.sin(progress * Math.PI);
      
      const price = basePrice * (1 + weightedRandom);
      
      priceData.push({
        time: Math.floor(timePoint),
        value: Number(price.toFixed(8))
      });
    }

    // Ensure the last point matches current price exactly
    if (priceData.length > 0) {
      priceData[priceData.length - 1] = {
        time: now,
        value: currentPrice
      };
    }

    // Sort data points by time
    priceData.sort((a, b) => a.time - b.time);

    return NextResponse.json({ priceHistory: priceData });
  } catch (error) {
    console.error('Error generating price history:', error);
    return NextResponse.json({ 
      error: 'Failed to generate price history',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
} 