'use client'

import React, { useState } from 'react'
import { Send, Home, Info, Clock, LineChart } from 'lucide-react'

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

export default function Terminal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TrustAnalysis | null>(null);
  const [currentToken, setCurrentToken] = useState('');
  const [view, setView] = useState<'home' | 'analysis'>('home');

  const handleReset = () => {
    setView('home');
    setInput('');
    setAnalysis(null);
    setCurrentToken('');
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const analyzeToken = async (address: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/trust?tokenAddress=${address}&network=solana`);
      const data = await response.json();
      setAnalysis(data);
      setCurrentToken(address);
      setView('analysis');
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim()) {
      analyzeToken(input.trim());
      setInput('');
    }
  };

  const renderHomeView = () => (
    <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
      <button 
        onClick={() => handleInputChange({ target: { value: 'Explain UOS?' } } as any)}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-colors text-left"
      >
        <h2 className="text-xl font-mono mb-2 flex items-center gap-2">
          <Info className="w-5 h-5" />
          Explain UOS?
        </h2>
        <p className="text-black/70 text-sm">
          Learn about Universal OS and its features
        </p>
      </button>

      <button 
        onClick={() => handleInputChange({ target: { value: 'Roadmap?' } } as any)}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-colors text-left"
      >
        <h2 className="text-xl font-mono mb-2 flex items-center gap-2">
          <Clock className="w-5 h-5" />
          Roadmap?
        </h2>
        <p className="text-black/70 text-sm">
          View our development timeline and future plans
        </p>
      </button>

      <button 
        onClick={() => setView('analysis')}
        className="bg-white/10 backdrop-blur-sm p-6 rounded-lg hover:bg-white/20 transition-colors text-left"
      >
        <h2 className="text-xl font-mono mb-2 flex items-center gap-2">
          <LineChart className="w-5 h-5" />
          Live trading data 📈
        </h2>
        <p className="text-black/70 text-sm">
          View real-time token analysis and metrics
        </p>
      </button>
    </div>
  );

  return (
    <div className="fixed inset-x-0 top-0 bottom-24 p-4 md:p-8">
      <div className="relative h-full">
        <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-lg" />
        <div className="relative h-full bg-white/10 backdrop-blur-xl rounded-lg overflow-hidden shadow-2xl border border-white/20 flex flex-col">
          {/* Terminal Header */}
          <div className="flex items-center justify-between px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex items-center">
              <div className="w-3 h-3 rounded-full bg-rose-500/80 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-amber-500/80 mr-2"></div>
              <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
            </div>
            <div className="text-black text-xs">Universal OS v1.0</div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {view === 'home' ? (
              renderHomeView()
            ) : (
              <>
                {currentToken && (
                  <div className="mb-4 text-sm text-black/70">
                    Currently analyzing: {currentToken}
                  </div>
                )}

                {loading ? (
                  <div className="text-center py-4">Analyzing token...</div>
                ) : analysis ? (
                  <div className="grid grid-cols-12 gap-4">
                    {/* Left Panel - Key Metrics */}
                    <div className="col-span-3 grid grid-cols-2 gap-4">
                      {/* Trust Score */}
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-sm text-black/70 mb-1">Trust Score</h3>
                        <p className="text-2xl font-bold">{analysis.trustScore}</p>
                        <span className={`mt-1 inline-block px-2 py-1 rounded text-sm ${
                          analysis.rugPullRisk.includes('HIGH') ? 'bg-red-100 text-red-800' : 
                          analysis.rugPullRisk.includes('Medium') ? 'bg-yellow-100 text-yellow-800' :
                          'bg-green-100 text-green-800'
                        }`}>
                          {analysis.rugPullRisk}
                        </span>
                      </div>

                      {/* Market Cap */}
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-sm text-black/70 mb-1">Market Cap</h3>
                        <p className="text-2xl font-bold">{analysis.marketCapTrend}</p>
                        <p className="text-sm text-black/50">24h movement</p>
                      </div>

                      {/* 24h Volume */}
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-sm text-black/70 mb-1">Volume (24h)</h3>
                        <p className="text-2xl font-bold">{analysis.volumeAnalysis}</p>
                        <p className="text-sm text-black/50">Trading volume</p>
                      </div>

                      {/* Liquidity */}
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="text-sm text-black/70 mb-1">Liquidity</h3>
                        <p className="text-2xl font-bold">{analysis.liquidityHealth.value}</p>
                        <p className="text-sm text-black/50">{analysis.liquidityHealth.change} change</p>
                      </div>
                    </div>

                    {/* Right Panel - Market Data */}
                    <div className="col-span-9 space-y-4">
                      {/* Token Info Box */}
                      <div className="bg-white/5 p-4 rounded-lg">
                        <h3 className="font-semibold mb-3">Token Overview</h3>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">Mint</span>
                            <a 
                              href={`https://solscan.io/token/${analysis.tokenInfo.mint}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {shortenAddress(analysis.tokenInfo.mint)}
                            </a>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">Supply</span>
                            <p>{analysis.tokenInfo.supply}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">Creator</span>
                            <a 
                              href={`https://solscan.io/account/${analysis.tokenInfo.creator}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-blue-600 hover:text-blue-800 hover:underline"
                            >
                              {shortenAddress(analysis.tokenInfo.creator)}
                            </a>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">Market Cap</span>
                            <p>{analysis.tokenInfo.marketCap}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">Mint Authority</span>
                            <p>{analysis.tokenInfo.mintAuthority}</p>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-black/50">LP Locked</span>
                            <p>{analysis.tokenInfo.lpLocked}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-black/50">
                    Enter a token address to analyze
                  </div>
                )}
              </>
            )}
          </div>

          {/* Search Input */}
          <form onSubmit={handleSubmit} className="flex p-4 bg-white/5 border-t border-white/10">
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter token address..."
              className="flex-1 bg-white/5 text-black placeholder-black/50 px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black/30"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black/10 hover:bg-black/20 text-black border-l border-white/10 transition-colors duration-200 disabled:opacity-50"
            >
              <Send className="w-5 h-5" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-black/10 hover:bg-black/20 text-black rounded-r-md border-l border-white/10 transition-colors duration-200"
              title="Return to home"
            >
              <Home className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function shortenAddress(address: string): string {
  if (!address || address === 'Unknown') return 'Unknown';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

