'use client'

import React from 'react'

export function Dock() {
  return (
    <div className="fixed bottom-0 left-0 right-0 flex justify-center p-4 pointer-events-none">
      <div className="flex items-center gap-4 p-4 bg-white/20 backdrop-blur-xl rounded-2xl border border-white/20 pointer-events-auto">
        <DockIcon 
          icon="twitter" 
          href="https://x.com/Universal_O_S" 
        />
        <DockIcon 
          icon="dexscreener" 
          href="https://dexscreener.com/solana/7xhhhvbtzwqqnyqubkbmu8t6cjoqmguzcgd2xku2sdst" 
        />
        <DockIcon 
          icon="discord" 
          href="https://discord.com/invite/8kRvPg9pRd"
        />
        <DockIcon 
          icon="telegram" 
          href="https://t.me/UniversalOperatingSystem" 
        />
      </div>
    </div>
  )
}

function DockIcon({ 
  icon,
  href
}: { 
  icon: string
  href?: string
}) {
  const IconWrapper = ({ children }: { children: React.ReactNode }) => {
    if (href) {
      return (
        <a 
          href={href} 
          target="_blank" 
          rel="noopener noreferrer"
          className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 transform group-hover:scale-125 group-hover:-translate-y-2"
        >
          {children}
        </a>
      )
    }
    return (
      <div className="w-12 h-12 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-xl transition-all duration-200 transform group-hover:scale-125 group-hover:-translate-y-2">
        {children}
      </div>
    )
  }

  return (
    <div className="relative group">
      <IconWrapper>
        {icon === 'twitter' && (
          <svg className="w-6 h-6 text-black transition-transform duration-200 transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="currentColor" d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        )}
        {icon === 'dexscreener' && (
          <svg className="w-6 h-6 text-black transition-transform duration-200 transform group-hover:scale-110" viewBox="0 0 32 32" fill="none">
            <path fillRule="evenodd" clipRule="evenodd" d="M16 32C24.8366 32 32 24.8366 32 16C32 7.16344 24.8366 0 16 0C7.16344 0 0 7.16344 0 16C0 24.8366 7.16344 32 16 32ZM15.4284 8.01721C15.4284 7.45492 15.8864 7 16.4487 7C17.011 7 17.4691 7.45492 17.4691 8.01721V12.0861L20.5202 10.1066C21.0084 9.79301 21.6701 9.93246 21.9837 10.4207C22.2973 10.9089 22.1579 11.5706 21.6696 11.8842L18.6185 13.8637L21.6696 15.8432C22.1579 16.1568 22.2973 16.8185 21.9837 17.3067C21.6701 17.795 21.0084 17.9344 20.5202 17.6208L17.4691 15.6413V19.7102C17.4691 20.2725 17.011 20.7274 16.4487 20.7274C15.8864 20.7274 15.4284 20.2725 15.4284 19.7102V15.6413L12.3773 17.6208C11.8891 17.9344 11.2274 17.795 10.9138 17.3067C10.6002 16.8185 10.7396 16.1568 11.2279 15.8432L14.279 13.8637L11.2279 11.8842C10.7396 11.5706 10.6002 10.9089 10.9138 10.4207C11.2274 9.93246 11.8891 9.79301 12.3773 10.1066L15.4284 12.0861V8.01721Z" fill="currentColor"/>
          </svg>
        )}
        {icon === 'discord' && (
          <svg className="w-6 h-6 text-black transition-transform duration-200 transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="currentColor" d="M20.317 4.492c-1.53-.69-3.17-1.2-4.885-1.49a.075.075 0 0 0-.079.036c-.21.369-.444.85-.608 1.23a18.566 18.566 0 0 0-5.487 0 12.36 12.36 0 0 0-.617-1.23A.077.077 0 0 0 8.562 3c-1.714.29-3.354.8-4.885 1.491a.07.07 0 0 0-.032.027C.533 9.093-.32 13.555.099 17.961a.08.08 0 0 0 .031.055 20.03 20.03 0 0 0 5.993 2.98.078.078 0 0 0 .084-.026c.462-.62.874-1.275 1.226-1.963.021-.04.001-.088-.041-.104a13.201 13.201 0 0 1-1.872-.878.075.075 0 0 1-.008-.125c.126-.093.252-.19.372-.287a.075.075 0 0 1 .078-.01c3.927 1.764 8.18 1.764 12.061 0a.075.075 0 0 1 .079.009c.12.098.245.195.372.288a.075.075 0 0 1-.006.125c-.598.344-1.22.635-1.873.877a.075.075 0 0 0-.041.105c.36.687.772 1.341 1.225 1.962a.077.077 0 0 0 .084.028 19.963 19.963 0 0 0 6.002-2.981.076.076 0 0 0 .032-.054c.5-5.094-.838-9.52-3.549-13.442a.06.06 0 0 0-.031-.028zM8.02 15.278c-1.182 0-2.157-1.069-2.157-2.38 0-1.312.956-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.956 2.38-2.157 2.38zm7.975 0c-1.183 0-2.157-1.069-2.157-2.38 0-1.312.955-2.38 2.157-2.38 1.21 0 2.176 1.077 2.157 2.38 0 1.312-.946 2.38-2.157 2.38z"/>
          </svg>
        )}
        {icon === 'telegram' && (
          <svg className="w-6 h-6 text-black transition-transform duration-200 transform group-hover:scale-110" viewBox="0 0 24 24">
            <path fill="currentColor" d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
          </svg>
        )}
      </IconWrapper>
    </div>
  )
}

