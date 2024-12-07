'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface TrustAndTradingProps {
  tokenAddress: string;
}

interface TokenPerformance {
  priceChange24h: number | null;
  volumeChange24h: number | null;
  trade_24h_change: number | null;
  liquidity: number | null;
  liquidityChange24h: number | null;
  holderChange24h: number | null;
  rugPull: boolean;
  isScam: boolean;
  marketCapChange24h: number | null;
  sustainedGrowth: boolean;
  rapidDump: boolean;
  suspiciousVolume: boolean;
  validationTrust: number;
  lastUpdated: Date;
}

const MotionDiv = motion.div as React.ComponentType<any>;

export default function TrustAndTrading({ 
  tokenAddress = '79HZeHkX9A5WfBg72ankd1ppTXGepoSGpmkxW63wsrHY' 
}: Partial<TrustAndTradingProps>) {
  const [currentAddress, setCurrentAddress] = React.useState(tokenAddress);
  const [inputValue, setInputValue] = React.useState('');
  const [performance, setPerformance] = React.useState<TokenPerformance | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  // Safe number formatting helper
  const formatNumber = (value: number | null, decimals: number = 2): string => {
    if (value === null || isNaN(value)) return 'N/A';
    return value.toFixed(decimals);
  };

  // Safe currency formatting helper
  const formatCurrency = (value: number | null): string => {
    if (value === null || isNaN(value)) return 'N/A';
    return `$${value.toLocaleString('en-US', { 
      minimumFractionDigits: 2,
      maximumFractionDigits: 2 
    })}`;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputValue.trim()) {
      setCurrentAddress(inputValue.trim());
    }
  };

  React.useEffect(() => {
    fetchTokenAnalysis();
  }, [currentAddress]);

  const fetchTokenAnalysis = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Add network parameter to specify Solana
      const response = await fetch(`/api/trust?tokenAddress=${currentAddress}&network=solana`);
      if (!response.ok) throw new Error('Failed to fetch token data');
      
      const data = await response.json();
      setPerformance(data);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred');
      console.error('Error fetching trust data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-600 animate-pulse">Analyzing token security...</div>
      </div>
    );
  }

  if (error || !performance) {
    return (
      <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
        <h3 className="text-lg font-bold text-red-600 mb-2">Analysis Error</h3>
        <p className="text-gray-700">{error || 'Failed to load token analysis'}</p>
      </div>
    );
  }

  const riskLevel = performance.validationTrust > 0.7 ? 'LOW' : 
                   performance.validationTrust > 0.4 ? 'MEDIUM' : 'HIGH';

  const securityChecks = [
    {
      label: 'Rug Pull Risk',
      status: performance.rugPull ? 'high' : 'low',
      detail: performance.rugPull ? 'High risk detected' : 'No risk detected'
    },
    {
      label: 'Volume Analysis',
      status: performance.suspiciousVolume ? 'high' : 'low',
      detail: `${formatNumber(performance.volumeChange24h)}% 24h change`
    },
    {
      label: 'Holder Distribution',
      status: performance.holderChange24h && performance.holderChange24h > 0 ? 'low' : 'medium',
      detail: `${performance.holderChange24h || 0} new holders in 24h`
    },
    {
      label: 'Growth Pattern',
      status: performance.sustainedGrowth ? 'low' : 'medium',
      detail: performance.sustainedGrowth ? 'Sustainable growth' : 'Volatile growth'
    }
  ];

  const marketMetrics = [
    {
      label: 'Liquidity Health',
      value: formatCurrency(performance.liquidity),
      change: performance.liquidityChange24h,
      detail: 'Liquidity depth and stability'
    },
    {
      label: 'Market Impact',
      value: `${formatNumber(performance.trade_24h_change)}%`,
      change: performance.trade_24h_change,
      detail: 'Trading impact on price'
    },
    {
      label: 'Market Cap Trend',
      value: `${formatNumber(performance.marketCapChange24h)}%`,
      change: performance.marketCapChange24h,
      detail: '24h market cap movement'
    }
  ];

  return (
    <div className="space-y-4 p-4 bg-sky-100/90 rounded-lg">
      {/* Add Search Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          placeholder="Enter token address..."
          className="flex-1 p-2 rounded-lg border border-sky-300 bg-sky-50 text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sky-400"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-sky-500 text-white rounded-lg hover:bg-sky-600 transition-colors"
        >
          Analyze
        </button>
      </form>

      {/* Current Token Display */}
      <div className="text-sm text-gray-600 bg-sky-200/80 p-2 rounded-lg">
        Currently analyzing: <span className="font-mono">{currentAddress}</span>
      </div>

      {/* Trust Score Overview */}
      <MotionDiv
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-sky-200/80 p-4 rounded-lg border border-sky-300"
      >
        <div className="flex justify-between items-start">
          <div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">Trust Analysis</h2>
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded text-sm ${
                riskLevel === 'LOW' ? 'bg-green-100 text-green-600' :
                riskLevel === 'MEDIUM' ? 'bg-yellow-100 text-yellow-600' :
                'bg-red-100 text-red-600'
              }`}>
                {riskLevel} RISK
              </div>
              <span className="text-gray-600 text-sm">
                Trust Score: {formatNumber(performance.validationTrust * 100)}%
              </span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-sm text-gray-600">Last Updated</span>
            <div className="text-gray-800">
              {new Date(performance.lastUpdated).toLocaleString()}
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Security Checks */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {securityChecks.map((check, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-sky-200/80 p-4 rounded-lg border border-sky-300"
          >
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-2 h-2 rounded-full ${
                check.status === 'low' ? 'bg-green-500' :
                check.status === 'medium' ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              <span className="text-gray-800">{check.label}</span>
            </div>
            <p className="text-sm text-gray-600">{check.detail}</p>
          </MotionDiv>
        ))}
      </div>

      {/* Market Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {marketMetrics.map((metric, index) => (
          <MotionDiv
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-sky-200/80 p-4 rounded-lg border border-sky-300"
          >
            <span className="text-sm text-gray-600">{metric.label}</span>
            <div className="text-xl font-bold text-gray-800 mt-1">
              {metric.value}
            </div>
            {metric.change !== null && (
              <div className={`text-sm ${
                (metric.change || 0) > 0 ? 'text-green-600' :
                (metric.change || 0) < 0 ? 'text-red-600' :
                'text-gray-600'
              }`}>
                {(metric.change || 0) > 0 ? '↑' : '↓'} {Math.abs(metric.change || 0).toFixed(2)}%
              </div>
            )}
            <p className="text-xs text-gray-500 mt-1">{metric.detail}</p>
          </MotionDiv>
        ))}
      </div>

      {/* Alerts Section */}
      {(performance.rapidDump || performance.suspiciousVolume) && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-red-600 mb-2">⚠️ High Risk Alerts</h3>
          <ul className="space-y-2 text-sm text-gray-700">
            {performance.rapidDump && (
              <li>• Rapid price movement detected - Exercise caution</li>
            )}
            {performance.suspiciousVolume && (
              <li>• Unusual trading volume patterns observed</li>
            )}
          </ul>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center p-8">
          <div className="text-gray-600 animate-pulse">Analyzing token security...</div>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className="bg-red-100 border border-red-300 p-4 rounded-lg">
          <h3 className="text-lg font-bold text-red-600 mb-2">Analysis Error</h3>
          <p className="text-gray-700">{error}</p>
        </div>
      )}
    </div>
  );
} 