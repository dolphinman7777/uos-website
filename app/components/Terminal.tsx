'use client'

import React, { useState } from 'react'
import { Send, Home } from 'lucide-react'

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

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Terminal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<TrustAnalysis | null>(null);
  const [currentToken, setCurrentToken] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [threadId, setThreadId] = useState<string | null>(null);

  const handleReset = () => {
    setInput('');
    setAnalysis(null);
    setCurrentToken('');
    setMessages([]);
    setThreadId(null);
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
    } catch (error) {
      console.error('Error analyzing token:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async (message: string) => {
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: message }]);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message, threadId }),
      });

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setThreadId(data.threadId);
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error in chat:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
      setInput('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Check if input looks like a Solana address
    const isSolanaAddress = /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(input.trim());
    
    if (isSolanaAddress) {
      analyzeToken(input.trim());
    } else {
      handleChat(input.trim());
    }
    setInput('');
  };

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
          <div className="flex-1 overflow-y-auto p-4 font-mono">
            {messages.map((msg, index) => (
              <div key={index} className="mb-4 whitespace-pre-wrap">
                {msg.role === 'user' ? (
                  <div className="text-black">
                    <span className="text-black/50">{'> '}</span>
                    {msg.content}
                  </div>
                ) : (
                  <div>
                    <span className="text-black/90">UOS: </span>
                    {msg.content}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-black/50">Processing...</div>
            )}

            {analysis && (
              <div className="grid grid-cols-12 gap-4 mt-4">
                {/* Analysis content */}
                {/* ... rest of the analysis UI ... */}
              </div>
            )}

            {!loading && !analysis && messages.length === 0 && (
              <div className="text-black/50">
                Enter your command...
              </div>
            )}
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex p-4 bg-white/5 border-t border-white/10">
            <div className="flex-1 flex items-center bg-white/5 rounded-l-md px-4">
              <span className="text-black/50 font-mono mr-2">{'>'}</span>
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                className="flex-1 bg-transparent text-black font-mono placeholder-black/30 py-3 focus:outline-none"
                placeholder="Enter your command..."
              />
            </div>
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
              title="Clear"
            >
              <Home className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

function shortenAddress(address: string | undefined): string {
  if (!address || address === 'Unknown') return 'Unknown';
  return `${address.slice(0, 4)}...${address.slice(-4)}`;
}

