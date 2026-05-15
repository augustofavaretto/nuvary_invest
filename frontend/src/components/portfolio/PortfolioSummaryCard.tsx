'use client';

import { motion } from 'framer-motion';
import { Wallet, Calendar } from 'lucide-react';
import { PortfolioSummary, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
}

// Patrimonio Total — visual fiel ao .wallet-total do mockup
// (gradient ciano + glow radial, valor 40px e 3 celulas surface-2)
export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const isProfit = summary.totalProfit >= 0;
  const lastUpdate = new Date(summary.lastUpdate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="relative overflow-hidden rounded-[var(--r-lg)] px-7 py-6"
      style={{
        background:
          'linear-gradient(135deg, rgba(0,184,217,0.12) 0%, rgba(11,31,51,0) 70%), var(--surface-1)',
        border: '1px solid rgba(0,184,217,0.2)',
      }}
    >
      {/* Glow radial decorativo (canto superior direito) */}
      <div
        aria-hidden
        className="absolute -top-[30%] -right-[10%] w-[360px] h-[360px] pointer-events-none"
        style={{
          background: 'radial-gradient(circle, rgba(0,184,217,0.2), transparent 60%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="relative z-10 flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-[var(--r-md)] grid place-items-center"
            style={{ background: 'var(--surface-2)', color: 'var(--cyan)' }}
          >
            <Wallet className="w-[22px] h-[22px]" />
          </div>
          <div>
            <h2 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
              Patrimônio Total
            </h2>
            <p className="text-[12.5px]" style={{ color: 'var(--t2)' }}>
              Consolidado da carteira
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-[12.5px]" style={{ color: 'var(--t2)' }}>
          <Calendar className="w-[14px] h-[14px]" style={{ color: 'var(--cyan)' }} />
          <span>Atualizado em {lastUpdate.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div
        className="relative z-10 text-[40px] font-extrabold mb-5 leading-none tracking-tight tabular-nums"
        style={{ color: 'var(--t1)' }}
      >
        {formatCurrency(summary.totalValue)}
      </div>

      <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-3">
        <SummaryCell label="Investido" value={formatCurrency(summary.totalInvested)} />
        <SummaryCell
          label="Lucro / Prejuízo"
          value={`${isProfit ? '▴' : '▾'} ${formatCurrency(Math.abs(summary.totalProfit))}`}
          tone={isProfit ? 'up' : 'down'}
        />
        <SummaryCell
          label="Rentabilidade"
          value={`${isProfit ? '▴' : '▾'} ${isProfit ? '+' : ''}${formatPercentage(summary.profitPercentage)}`}
          tone={isProfit ? 'up' : 'down'}
        />
      </div>
    </motion.div>
  );
}

function SummaryCell({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: 'up' | 'down';
}) {
  const color =
    tone === 'up' ? 'var(--gain)' : tone === 'down' ? 'var(--loss)' : 'var(--t1)';
  return (
    <div
      className="px-[18px] py-3.5 rounded-[var(--r-md)]"
      style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
    >
      <div className="text-[12px] mb-1" style={{ color: 'var(--t2)' }}>
        {label}
      </div>
      <div className="text-[18px] font-bold tabular-nums" style={{ color }}>
        {value}
      </div>
    </div>
  );
}
