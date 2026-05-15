'use client';

import type { MarketQuote } from '@/services/dashboardService';

// Cotacoes de exemplo usadas como fallback quando a API ainda nao respondeu.
// Sao os mesmos tickers que costumam vir do useDashboardData.marketData.
const SAMPLE: MarketQuote[] = [
  { symbol: 'B3SA3', name: 'B3 ON',     currentPrice: 17.29, change: -0.30, changePercent: -1.71, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'RENT3', name: 'Localiza',  currentPrice: 46.33, change: -0.70, changePercent: -1.47, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'SUZB3', name: 'Suzano',    currentPrice: 42.83, change: -0.30, changePercent: -0.70, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'BTC',   name: 'Bitcoin',   currentPrice: 96412, change: 2058, changePercent: 2.18, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'PETR4', name: 'Petrobras', currentPrice: 37.84, change: 0.35, changePercent: 0.92, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'VALE3', name: 'Vale',      currentPrice: 54.12, change: -0.18, changePercent: -0.33, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
  { symbol: 'ITUB4', name: 'Itau',      currentPrice: 32.21, change: 0.20, changePercent: 0.62, highPrice: 0, lowPrice: 0, openPrice: 0, previousClose: 0, timestamp: 0 },
];

interface TickerTapeProps {
  /** Lista de cotacoes (vem do useDashboardData.marketData). Se vazia, usa SAMPLE. */
  quotes?: MarketQuote[];
}

// Determina a unidade de moeda a partir do simbolo. Cripto fica USD, B3 fica BRL.
function unitFor(symbol: string): string {
  if (['BTC', 'ETH', 'AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].some((s) => symbol.startsWith(s))) {
    return 'USD';
  }
  return 'BRL';
}

function formatPrice(symbol: string, price: number): string {
  if (unitFor(symbol) === 'USD') return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return price.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ── TickerTape — fita de cotacoes scroll horizontal infinito ─────────────────
// Padrao do mockup: scroll suave da direita pra esquerda, com mascaras de
// gradient nas pontas. Anima via CSS keyframes; respeita prefers-reduced-motion
// (definido em tokens.css globalmente).
export function TickerTape({ quotes }: TickerTapeProps) {
  const list = quotes && quotes.length > 0 ? quotes : SAMPLE;
  // Duplicamos a lista para a animacao loop sem "salto"
  const doubled = [...list, ...list];

  return (
    <div className="relative overflow-hidden bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-md)] py-3 pb-2">
      {/* Mascaras de fade nas extremidades */}
      <span
        aria-hidden
        className="absolute left-0 top-0 bottom-0 w-[60px] z-10 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, var(--surface-1), transparent)' }}
      />
      <span
        aria-hidden
        className="absolute right-0 top-0 bottom-0 w-[60px] z-10 pointer-events-none"
        style={{ background: 'linear-gradient(-90deg, var(--surface-1), transparent)' }}
      />

      <div className="nv-ticker-track flex gap-9 whitespace-nowrap pl-6">
        {doubled.map((q, i) => {
          const up = q.changePercent >= 0;
          return (
            <span key={`${q.symbol}-${i}`} className="inline-flex items-center gap-2 text-[13px]">
              <strong className="font-bold text-[var(--t1)]">{q.symbol}</strong>
              <span className="text-[var(--t1)] font-medium">
                {formatPrice(q.symbol, q.currentPrice)}
              </span>
              <span className="text-[11px] text-[var(--t3)]">{unitFor(q.symbol)}</span>
              <span
                className={`font-semibold text-[12.5px] ${
                  up ? 'text-[var(--gain)]' : 'text-[var(--loss)]'
                }`}
              >
                {up ? '▴' : '▾'} {up ? '+' : ''}
                {q.changePercent.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>

      <div className="text-center text-[11px] text-[var(--t3)] pt-1.5">
        Fita de cotações <span className="text-[var(--cyan)]">por TradingView</span>
      </div>
    </div>
  );
}
