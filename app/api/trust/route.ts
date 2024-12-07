import { NextResponse } from 'next/server';

interface RecommenderMetrics {
  successfulRecs: number;
  totalRecommendations: number;
  avgTokenPerformance: number;
  consistencyScore: number;
  riskScore: number;
  lastActiveDate: string | Date;
}

function validateMetrics(metrics: RecommenderMetrics): boolean {
  return (
    typeof metrics.successfulRecs === 'number' &&
    typeof metrics.totalRecommendations === 'number' &&
    typeof metrics.avgTokenPerformance === 'number' &&
    typeof metrics.consistencyScore === 'number' &&
    typeof metrics.riskScore === 'number' &&
    metrics.lastActiveDate !== undefined
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tokenAddress = searchParams.get('tokenAddress') || '79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY';
  const network = searchParams.get('network') || 'solana';

  try {
    // Use tokenAddress and network in the mock data
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
      validationTrust: 0.85,
      lastUpdated: new Date(),
      tokenAddress, // Include the token address
      network      // Include the network
    };

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

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const tokenAddress = data.tokenAddress || '79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY';
    const network = data.network || 'solana';

    // Use both tokenAddress and network in the response
    const trustScore = await calculateTrustScore('default', {
      successfulRecs: 100,
      totalRecommendations: 120,
      avgTokenPerformance: 15.5,
      consistencyScore: 0.85,
      riskScore: 0.2,
      lastActiveDate: new Date().toISOString()
    });

    return NextResponse.json({ 
      trustScore,
      tokenAddress,
      network
    });
  } catch (error) {
    console.error('Error calculating trust score:', error);
    return NextResponse.json(
      { error: 'Failed to calculate trust score' },
      { status: 500 }
    );
  }
} 