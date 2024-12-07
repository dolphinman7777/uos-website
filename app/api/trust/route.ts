import { NextResponse } from 'next/server';

// Define types for our response
interface TrustAnalysis {
  trustScore: string;
  rugPullRisk: string;
  volumeAnalysis: string;
  holderDistribution: string;
  growthPattern: string;
  liquidityHealth: {
    value: string;
    change: string;
  };
  marketImpact: string;
  marketCapTrend: string;
  lastUpdated: string;
  tokenInfo: {
    mint: string;
    supply: string;
    creator: string;
    marketCap: string;
    mintAuthority: string;
    lpLocked: string;
  };
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  let tokenAddress = searchParams.get('tokenAddress');

  if (!tokenAddress) {
    return NextResponse.json({
      error: 'Please provide a token address'
    }, { status: 400 });
  }

  try {
    // Get DexScreener data
    const dexResponse = await fetch(
      `https://api.dexscreener.com/latest/dex/tokens/${tokenAddress}`
    );
    const dexData = await dexResponse.json();
    const pair = dexData.pairs?.[0] || {};

    // Transform the data using DexScreener values
    const analysis: TrustAnalysis = {
      trustScore: determineRiskScore(pair),
      rugPullRisk: determineRiskLevel(pair),
      volumeAnalysis: formatUSD(pair.volume?.h24 || 0),
      holderDistribution: `${pair.holders || 0} holders`,
      growthPattern: determineGrowthPattern(pair),
      marketImpact: `${pair.priceChange?.h24 || 0}%`,
      marketCapTrend: formatUSD(pair.marketCap || 0),
      liquidityHealth: {
        value: formatUSD(pair.liquidity?.usd || 0),
        change: `${pair.liquidity?.h24ChangePercent || 0}%`
      },
      lastUpdated: new Date().toLocaleString(),
      tokenInfo: {
        mint: pair.baseToken?.address || tokenAddress,
        supply: formatSupply(pair.baseToken?.totalSupply),
        creator: pair.baseToken?.creator || 'Unknown',
        marketCap: formatUSD(pair.marketCap || 0),
        mintAuthority: pair.baseToken?.mintAuthority || '-',
        lpLocked: `${pair.liquidity?.locked ? '100.00' : '0.00'}%`
      }
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({
      trustScore: 'N/A%',
      rugPullRisk: 'Unknown',
      volumeAnalysis: 'N/A',
      holderDistribution: 'N/A',
      growthPattern: 'Unknown',
      marketImpact: 'N/A',
      marketCapTrend: 'N/A',
      liquidityHealth: {
        value: 'N/A',
        change: 'N/A'
      },
      lastUpdated: new Date().toLocaleString()
    });
  }
}

function determineRiskScore(pair: any): string {
  if (!pair) return 'N/A%';
  
  let score = 100;
  
  // Deduct points based on metrics
  if (pair.liquidity?.usd < 10000) score -= 30;
  if (pair.volume?.h24 < 1000) score -= 20;
  if (Math.abs(pair.priceChange?.h24 || 0) > 30) score -= 20;
  if (!pair.liquidity?.locked) score -= 15;
  
  return `${Math.max(0, score)}%`;
}

function determineRiskLevel(pair: any): string {
  if (!pair) return 'Unknown';
  
  const liquidity = pair.liquidity?.usd || 0;
  const priceChange = Math.abs(pair.priceChange?.h24 || 0);
  const volume = pair.volume?.h24 || 0;

  if (liquidity < 10000 || priceChange > 50 || volume < 1000) return 'HIGH RISK';
  if (liquidity < 50000 || priceChange > 20 || volume < 5000) return 'Medium Risk';
  return 'Low Risk';
}

function determineGrowthPattern(pair: any): string {
  if (!pair) return 'Unknown';
  
  const volume24Change = pair.volume?.h24ChangePercent || 0;
  const priceChange = pair.priceChange?.h24 || 0;

  if (volume24Change > 20 && priceChange > 0) return 'Rapid Growth';
  if (volume24Change > 0 && priceChange > 0) return 'Steady Growth';
  if (volume24Change < 0 || priceChange < 0) return 'Declining';
  return 'Volatile';
}

function formatUSD(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(value);
}

function formatSupply(supply: number | undefined): string {
  if (!supply) return 'Unknown';
  if (supply >= 1e9) return `${(supply / 1e9).toFixed(0)}B`;
  if (supply >= 1e6) return `${(supply / 1e6).toFixed(0)}M`;
  if (supply >= 1e3) return `${(supply / 1e3).toFixed(0)}K`;
  return supply.toString();
} 