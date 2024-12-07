export interface TokenPerformance {
  priceChange24h: number;
  volumeChange24h: number;
  trade_24h_change: number;
  liquidity: number;
  liquidityChange24h: number;
  holderChange24h: number;
  rugPull: boolean;
  isScam: boolean;
  marketCapChange24h: number;
  sustainedGrowth: boolean;
  rapidDump: boolean;
  suspiciousVolume: boolean;
  validationTrust: number;
  lastUpdated: Date;
}

export interface TrustScoreDatabase {
  score: number;
  riskLevel: string;
  metrics: {
    [key: string]: number;
  };
} 