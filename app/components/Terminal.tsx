'use client'

import React, { useState, useEffect, useRef } from 'react';
import { Home, RotateCw } from 'lucide-react';
import { Command, Suggestion, filterCommands, filterSuggestions } from '@/app/lib/commands';
import { Avatar } from '@/app/components/ui/avatar';

const loadingMessages = [
  "Consulting the digital oracle...",
  "Crunching numbers at light speed...",
  "Assembling bytes of wisdom...",
  "Computing in progress, stand by...",
  "Searching the knowledge matrix..."
];

const errorMessages = {
  default: "⚠️ Universal OS encountered a quantum fluctuation. Recalibrating systems...",
  network: "🌐 Connection to the digital realm disrupted. Attempting to stabilize neural pathways...",
  timeout: "⏳ Time dilation detected in processing queue. Please reinitiate your request...",
  validation: "🔍 Input parameters outside expected dimensional boundaries. Please realign and try again...",
  server: "🔮 The digital oracle is experiencing temporary interference. Restoring cosmic harmony...",
  unauthorized: "🔒 Access protocols require additional authentication. Please verify your quantum signature..."
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export default function Terminal() {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1);
  const [threadId, setThreadId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (loading) {
      const randomIndex = Math.floor(Math.random() * loadingMessages.length);
      setLoadingMessage(loadingMessages[randomIndex]);
    }
  }, [loading]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (input.trim()) {
      const filteredSuggestions = filterSuggestions(input.trim());
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  }, [input]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
    setSelectedSuggestionIndex(-1);
  };

  const getErrorMessage = (error: any): string => {
    if (!error) return errorMessages.default;
    
    if (error.message?.includes('Failed to fetch') || error.message?.includes('network'))
      return errorMessages.network;
    
    if (error.message?.includes('timeout'))
      return errorMessages.timeout;
    
    if (error.message?.includes('validation'))
      return errorMessages.validation;
    
    if (error.status === 401 || error.message?.includes('unauthorized'))
      return errorMessages.unauthorized;
    
    if (error.status >= 500)
      return errorMessages.server;
    
    return errorMessages.default;
  };

  const executeCommand = async (command: string) => {
    setMessages(prev => [...prev, { role: 'user', content: command }]);
    setInput('');
    setSuggestions([]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: command,
          threadId: threadId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get response');
      }

      setThreadId(data.threadId);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: data.response 
      }]);
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: getErrorMessage(error)
      }]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (suggestions.length > 0) {
      if (e.key === 'Tab' || e.key === 'ArrowRight') {
        e.preventDefault();
        if (selectedSuggestionIndex >= 0) {
          executeCommand(suggestions[selectedSuggestionIndex].prompt);
        } else if (suggestions.length > 0) {
          executeCommand(suggestions[0].prompt);
        }
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => 
          prev < suggestions.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedSuggestionIndex(prev => prev > -1 ? prev - 1 : prev);
      } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
        e.preventDefault();
        executeCommand(suggestions[selectedSuggestionIndex].prompt);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    executeCommand(input.trim());
  };

  const handleReset = () => {
    setInput('');
    setMessages([]);
    setSuggestions([]);
    setThreadId(null);
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
              <div key={index} className="mb-6">
                {msg.role === 'user' ? (
                  <div className="text-black">
                    <span className="text-black">{'> '}</span>
                    <span className="text-black">{msg.content}</span>
                  </div>
                ) : (
                  <div className="flex items-start gap-4">
                    <Avatar
                      src="/uos-avatar.png"
                      alt="UOS AI"
                      fallback="UOS"
                      className="w-10 h-10"
                    />
                    <div className="flex-1 min-w-0">
                      <span className="text-black/90 font-semibold">UOS: </span>
                      {msg.content}
                    </div>
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="text-black/70">{loadingMessage}</div>
            )}

            {!loading && messages.length === 0 && (
              <div className="flex items-start gap-4">
                <Avatar
                  src="/uos-avatar.png"
                  alt="UOS AI"
                  fallback="UOS"
                  className="w-10 h-10"
                />
                <div className="flex-1 min-w-0">
                  <div className="text-black/90">
                    Welcome to Universal OS v1.0!
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="flex p-4 bg-white/5 border-t border-white/10">
            <div className="flex-1 flex items-center bg-white/5 rounded-l-md px-4 relative">
              <span className="text-black font-mono mr-2">{'>'}</span>
              <div className="flex-1 relative">
                {suggestions.length > 0 && (
                  <div className="absolute bottom-full left-0 right-0 mb-2 bg-white/95 rounded-md shadow-lg border border-white/20 overflow-hidden">
                    {suggestions.map((suggestion, index) => (
                      <div
                        key={suggestion.prompt}
                        className={`px-4 py-2 hover:bg-black/5 cursor-pointer ${
                          index === selectedSuggestionIndex ? 'bg-black/10' : ''
                        }`}
                        onClick={() => {
                          executeCommand(suggestion.prompt);
                        }}
                      >
                        <div className="font-bold text-sm text-black">{suggestion.prompt}</div>
                        <div className="text-xs text-black/70 mt-0.5">{suggestion.description}</div>
                      </div>
                    ))}
                  </div>
                )}
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  className="w-full bg-transparent text-black font-mono placeholder-black/50 py-3 focus:outline-none relative z-10"
                  placeholder="Ask a question..."
                />
              </div>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-black/10 hover:bg-black/20 text-black border-l border-white/10 transition-colors duration-200 disabled:opacity-50"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M7 17L17 7M17 7H10M17 7V14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="px-6 py-3 bg-black/10 hover:bg-black/20 text-black rounded-r-md border-l border-white/10 transition-colors duration-200"
              title="Clear"
            >
              <RotateCw className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
