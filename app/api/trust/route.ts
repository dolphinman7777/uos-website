import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get('tokenAddress') || '79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY';
  const network = searchParams.get('network') || 'solana';

  try {
    // Here we'll analyze the Solana token specifically
    // This is where you'd integrate with your Solana data providers
    const mockPerformance = {
      priceChange24h: 5.23,
      volumeChange24h: 12.45,
      trade_24h_change: 8.32,
      liquidity: 500000,
      liquidityChange24h: 3.12,
      holderChange24h: 42,
      rugPull: false,
      isScam: false,
      marketCapChange24h: 6.78,
      sustainedGrowth: true,
      rapidDump: false,
      suspiciousVolume: false,
      validationTrust: 0.85, // 85% trust score
      lastUpdated: new Date()
    };

    // In a real implementation, you'd fetch this data from:
    // - Solana RPC nodes
    // - DEX APIs (Raydium, Serum, etc.)
    // - Token metadata
    // - Holder analytics
    // - Trading volume data
    // - Liquidity pool information

    return NextResponse.json(mockPerformance);
  } catch (error) {
    console.error('Error analyzing Solana token:', error);
    return NextResponse.json(
      { error: 'Failed to analyze token' },
      { status: 500 }
    );
  }
}

function normalizePerformance(performance: number): number {
  // Add min/max bounds
  const MIN_PERFORMANCE = -100;
  const MAX_PERFORMANCE = 1000;
  
  return Math.max(MIN_PERFORMANCE, Math.min(performance, MAX_PERFORMANCE));
}

function calculateTimeDecay(lastActiveDate: Date): number {
  const MAX_DECAY_DAYS = 365;
  const now = new Date();
  const daysSinceActive = (now.getTime() - lastActiveDate.getTime()) / (1000 * 60 * 60 * 24);
  
  return Math.max(0, 1 - (daysSinceActive / MAX_DECAY_DAYS));
}

async function calculateTrustScore(
  recommenderId: string, 
  metrics: RecommenderMetrics
): Promise<number> {
  // Input validation
  if (!validateMetrics(metrics)) {
    throw new Error('Invalid metrics');
  }

  const weights = {
    successRate: 0.3,
    avgPerformance: 0.2,
    consistency: 0.2,
    riskMetric: 0.15,
    timeDecay: 0.15,
  };

  // Handle division by zero
  const successRate = metrics.totalRecommendations === 0 ? 
    0 : 
    metrics.successfulRecs / metrics.totalRecommendations;

  // Normalize and bound performance
  const normalizedPerformance = normalizePerformance(metrics.avgTokenPerformance);
  
  // Calculate time decay with timezone handling
  const timeDecayFactor = calculateTimeDecay(new Date(metrics.lastActiveDate));

  // Calculate final score with precision handling
  const score = Number(
    (successRate * weights.successRate +
    normalizedPerformance * weights.avgPerformance +
    metrics.consistencyScore * weights.consistency +
    (1 - metrics.riskScore) * weights.riskMetric +
    timeDecayFactor * weights.timeDecay) * 100
  ).toFixed(2);

  return Math.max(0, Math.min(100, parseFloat(score)));
} 