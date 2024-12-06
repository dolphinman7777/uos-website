'use client'

import React, { useRef, useEffect } from 'react'
import { useChat } from 'ai/react'
import { Send, Home } from 'lucide-react'

export default function Terminal() {
  const { messages, input, handleInputChange, handleSubmit, isLoading, error, reload, setMessages } = useChat()
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const handleReset = () => {
    setMessages([])
    handleInputChange({ target: { value: '' } } as any)
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

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

          {/* Terminal Content */}
          <div className="flex-1 overflow-y-auto p-4 font-mono text-sm text-black scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {messages.length === 0 && (
              <div className="text-black/70 text-center py-20">
                <p className="mb-4">Welcome to Universal OS. I am your AI assistant. How may I assist you today?</p>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <button
                    onClick={() => handleInputChange({ target: { value: 'Explain UOS?' } } as any)}
                    className="text-black/80 hover:text-black hover:underline cursor-pointer"
                  >
                    Explain UOS?
                  </button>
                  <button
                    onClick={() => handleInputChange({ target: { value: 'Roadmap?' } } as any)}
                    className="text-black/80 hover:text-black hover:underline cursor-pointer"
                  >
                    Roadmap?
                  </button>
                </div>
              </div>
            )}
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 ${
                  message.role === 'user'
                    ? 'bg-white/5 rounded-lg p-3'
                    : 'text-black/90'
                }`}
              >
                <span className="font-bold text-black">
                  {message.role === 'user' ? '> ' : 'UOS: '}
                </span>
                <span className="whitespace-pre-wrap text-black/90">{message.content}</span>
              </div>
            ))}
            {isLoading && (
              <div className="text-black/70">
                Processing your request...
              </div>
            )}
            {error && (
              <div className="text-red-500">
                Error: {error.message || 'An error occurred. Please try again.'}
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Terminal Input */}
          <form
            onSubmit={handleSubmit}
            className="flex p-4 bg-white/5 border-t border-white/10"
          >
            <input
              type="text"
              value={input}
              onChange={handleInputChange}
              placeholder="Enter your command..."
              className="flex-1 bg-white/5 text-black placeholder-black/50 px-4 py-3 rounded-l-md focus:outline-none focus:ring-2 focus:ring-black/30"
            />
            <button
              type="submit"
              disabled={isLoading}
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
  )
}

