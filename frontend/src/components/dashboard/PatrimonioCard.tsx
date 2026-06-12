'use client';

import { Eye, EyeOff, Wallet } from 'lucide-react';
import { formatBRL, formatDelta } from '@/lib/format';

interface PatrimonioCardProps {
  valor: number;
  variacao: number;
  periodoLabel?: string; // ex: "12m" | "total"
  loading?: boolean;
  mostrarSaldo: boolean;
  onToggleMostrarSaldo: () => void;
}

// Patrimonio Total — saldo enriquecido com brilho ciano de fundo e badge de delta colorido (gain/loss). Fiel ao mockup (.balance-card).
export function PatrimonioCard({
  valor,
  variacao,
  periodoLabel = '12m',
  loading = false,
  mostrarSaldo,
  onToggleMostrarSaldo,
}: PatrimonioCardProps) {
  const up = variacao >= 0;
  const reais = Math.trunc(valor);
  const centavos = Math.abs(valor - reais).toFixed(2).slice(2);

  return (
    <div
      className="relative overflow-hidden rounded-[var(--r-lg)] px-6 py-5 border"
      style={{
        background:
          'linear-gradient(135deg, rgba(0, 184, 217, 0.18) 0%, rgba(0, 126, 167, 0.10) 60%, transparent 100%), var(--surface-1)',
        borderColor: 'rgba(0, 184, 217, 0.22)',
        boxShadow: 'inset 0 1px 0 var(--edge)',
      }}
    >
      {/* Glow ciano no canto superior direito */}
      <span
        aria-hidden
        className="absolute -top-[40%] -right-[20%] w-[280px] h-[280px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,184,217,0.35), transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between mb-2.5">
        <span className="inline-flex items-center gap-2 text-[12.5px] font-medium text-[var(--t2)] uppercase tracking-[0.08em]">
          <Wallet className="w-4 h-4 text-[var(--cyan)]" />
          Patrimônio Total
        </span>
        <button
          type="button"
          onClick={onToggleMostrarSaldo}
          aria-label={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
          className="w-7 h-7 grid place-items-center rounded-md text-[var(--t2)] hover:text-[var(--cyan)] transition-colors"
        >
          {mostrarSaldo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
        </button>
      </div>

      {/* Valor */}
      {loading ? (
        <div className="h-9 w-44 bg-[var(--glass)] rounded animate-pulse" />
      ) : (
        <div
          className="relative z-10 text-[36px] font-extrabold text-[var(--t1)] leading-none tracking-[-0.025em] tabular-nums"
        >
          {mostrarSaldo ? (
            <>
              {formatBRL(reais, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              <small className="text-[22px] font-semibold text-[var(--t2)]">,{centavos}</small>
            </>
          ) : (
            'R$ ••••••'
          )}
        </div>
      )}

      {/* Chips */}
      <div className="relative z-10 mt-2.5 flex items-center gap-1.5 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-[var(--r-pill)] border ${
            up
              ? 'bg-[var(--gain-soft)] border-[rgba(16,185,129,0.3)] text-[var(--gain)]'
              : 'bg-[var(--loss-soft)] border-[rgba(239,68,68,0.3)] text-[var(--loss)]'
          }`}
        >
          {up ? '▴' : '▾'} {formatDelta(variacao)}
        </span>
        <span className="inline-flex items-center text-[12px] font-semibold px-3 py-1 rounded-[var(--r-pill)] border border-[var(--border)] text-[var(--t2)] bg-[var(--glass)]">
          {periodoLabel}
        </span>
      </div>
    </div>
  );
}
