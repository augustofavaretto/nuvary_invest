'use client';

import { useEffect, useRef } from 'react';

export function TradingViewTicker() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    containerRef.current.innerHTML = '';

    const script = document.createElement('script');
    script.src = 'https://widgets.tradingview-widget.com/w/br/tv-ticker-tape.js';
    script.type = 'module';
    script.async = true;

    const widget = document.createElement('tv-ticker-tape');
    widget.setAttribute('symbols', 'BMFBOVESPA:PETR4,BMFBOVESPA:VALE3,BMFBOVESPA:ITUB4,BMFBOVESPA:BBDC4,BMFBOVESPA:BBAS3,BMFBOVESPA:WEGE3,BMFBOVESPA:ABEV3,BMFBOVESPA:B3SA3,BMFBOVESPA:RENT3,BMFBOVESPA:SUZB3,BITSTAMP:BTCUSD,BITSTAMP:ETHUSD,FOREXCOM:SPXUSD,CMCMARKETS:GOLD');
    widget.setAttribute('hide-chart', '');
    widget.setAttribute('line-chart-type', 'Line');
    widget.setAttribute('item-size', 'compact');

    containerRef.current.appendChild(widget);
    containerRef.current.appendChild(script);

    return () => {
      if (containerRef.current) {
        containerRef.current.innerHTML = '';
      }
    };
  }, []);

  return (
    <div className="tradingview-ticker rounded-xl overflow-hidden border border-[#E5E7EB] bg-white">
      <style jsx global>{`
        .tradingview-ticker [class*="copyright"],
        .tradingview-ticker a[href*="tradingview"],
        .tradingview-ticker div:last-child:not(:first-child) {
          display: none !important;
          height: 0 !important;
          overflow: hidden !important;
        }
      `}</style>
      <div ref={containerRef} />
    </div>
  );
}
