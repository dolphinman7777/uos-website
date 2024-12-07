'use client';
import React from 'react';

interface TradingViewWidgetProps {
  symbol: string;
}

export default function TradingViewWidget({ symbol }: TradingViewWidgetProps) {
  return (
    <div className="tradingview-widget-container h-full">
      <div id="tradingview_widget" className="h-full">
        <iframe
          src={`https://s.tradingview.com/widgetembed/?frameElementId=tradingview_widget&symbol=${symbol}&interval=D&hidesidetoolbar=0&symboledit=1&saveimage=1&toolbarbg=f1f3f6&studies=[]&theme=dark&style=1&timezone=exchange`}
          className="w-full h-full"
          style={{ border: 'none' }}
          allowTransparency={true}
        />
      </div>
    </div>
  );
} 