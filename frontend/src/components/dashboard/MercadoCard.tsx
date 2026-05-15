'use client';

import { RefreshCw, TrendingUp } from 'lucide-react';
import { formatDelta } from '@/lib/format';

interface Acao {
  ticker: string;
  label: string;
  price: number;
  delta: number;
}

interface MercadoCardProps {
  acoes: Acao[];
  onRefresh?: () => void;
  loading?: boolean;
}

// Mercado em Tempo Real — 5 cards horizontais com nome, preco e delta.
// Fiel ao mockup (.market-card + .market-row + .market-stock).
export function MercadoCard({ acoes, onRefresh, loading = false }: MercadoCardProps) {
  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--t1)]">
          <TrendingUp className="w-5 h-5 text-[var(--cyan)]" />
          Mercado em Tempo Real
        </h2>
        {onRefresh && (
          <button
            type="button"
            onClick={onRefresh}
            disabled={loading}
            className="w-9 h-9 grid place-items-center rounded-[var(--r-pill)] text-[var(--t2)] hover:text-[var(--cyan)] hover:bg-[rgba(0,184,217,0.08)] transition-colors disabled:opacity-50"
            aria-label="Atualizar mercado"
          >
            <RefreshCw className={`w-4.5 h-4.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        )}
      </div>

      {/* Grid 5 colunas (responsivo) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {acoes.map((a) => {
          const up = a.delta >= 0;
          return (
            <div
              key={a.ticker}
              className="rounded-[var(--r-md)] bg-[var(--surface-2)] border border-[var(--border)] p-4 hover:border-[var(--border-hi)] transition-colors"
            >
              <p className="text-[12px] text-[var(--t2)]">{a.label}</p>
              <p
                data-mono
                className="font-mono text-[18px] font-semibold text-[var(--t1)] mt-1"
              >
                ${a.price.toFixed(2)}
              </p>
              <p
                className={`text-[12px] font-semibold mt-1 inline-flex items-center gap-1 ${
                  up ? 'text-[var(--gain)]' : 'text-[var(--loss)]'
                }`}
              >
                {up ? '▴' : '▾'} {formatDelta(a.delta)}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
