"use client"

import React from 'react'

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string
  alt?: string
  fallback?: string
  className?: string
}

export function Avatar({ src, alt, fallback, className = '', ...props }: AvatarProps) {
  const [error, setError] = React.useState(false)

  return (
    <div 
      className={`relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full shadow-lg ${className}`}
      {...props}
    >
      <div className="absolute inset-0 bg-blue-500/20 backdrop-blur-sm"></div>
      {src && !error ? (
        <>
          <div className="absolute inset-0 bg-blue-500/10 animate-pulse"></div>
          <img
            src={src}
            alt={alt}
            className="relative h-full w-full object-cover"
            onError={() => setError(true)}
          />
          <div className="absolute inset-0 ring-1 ring-white/20 rounded-full"></div>
          <div className="absolute inset-0 bg-gradient-to-t from-blue-500/20 to-transparent"></div>
        </>
      ) : (
        <div className="flex h-full w-full items-center justify-center bg-blue-500 text-white text-sm font-medium">
          {fallback?.slice(0, 2) || 'AI'}
        </div>
      )}
    </div>
  )
}

export function AvatarImage({ src, alt, className = '' }: { src?: string; alt?: string; className?: string }) {
  return (
    <img
      src={src}
      alt={alt}
      className={`aspect-square h-full w-full object-cover ${className}`}
    />
  )
}

export function AvatarFallback({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`flex h-full w-full items-center justify-center bg-blue-500 text-white ${className}`}>
      {children}
    </div>
  )
}
