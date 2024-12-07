'use client'

import React from 'react'
import { useSearchParams } from 'next/navigation'
import TrustAndTrading from '../../components/TrustAndTrading'
import { Dock } from '../../components/Dock'

export default function TrustPage() {
  const searchParams = useSearchParams()
  const address = searchParams.get('address')

  return (
    <main className="min-h-screen bg-gradient-to-b from-sky-200 to-sky-300">
      <div className="container mx-auto p-4">
        <TrustAndTrading tokenAddress={address || undefined} />
      </div>
      <Dock />
    </main>
  )
} 