'use client';

import React from 'react';
import Terminal from '@/components/Terminal';
import { useSearchParams } from 'next/navigation';

export default function TerminalPage() {
  const searchParams = useSearchParams();
  const initialPrompt = searchParams.get('prompt');

  return (
    <div className="min-h-screen bg-black">
      <Terminal initialPrompt={initialPrompt || ''} />
    </div>
  );
} 