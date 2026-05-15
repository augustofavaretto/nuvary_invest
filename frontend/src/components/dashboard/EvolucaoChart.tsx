'use client';

import { Area, AreaChart, ResponsiveContainer, Tooltip } from 'recharts';
import { TrendingUp } from 'lucide-react';
import { formatBRL, formatDelta } from '@/lib/format';

export type Periodo = '7D' | '7S' | '12M' | 'ANOS';

const PERIODO_LABEL: Record<Periodo, string> = {
  '7D': 'Últimos 7 dias',
  '7S': 'Últimas 7 semanas',
  '12M': 'Últimos 12 meses',
  ANOS: 'Últimos anos',
};

interface EvolucaoChartProps {
  valor: number;
  valorInicial: number;
  periodo: Periodo;
  onPeriodoChange: (p: Periodo) => void;
  data: Array<{ i: number; v: number }>;
}

// Evolucao Patrimonial — card-header com title + period-tabs pill,
// valor + delta colorido, AreaChart Recharts com gradient ciano.
// Fiel ao mockup (.evo-card + .period-tabs).
export function EvolucaoChart({
  valor,
  valorInicial,
  periodo,
  onPeriodoChange,
  data,
}: EvolucaoChartProps) {
  const delta = valor - valorInicial;
  const deltaPct = valorInicial > 0 ? (delta / valorInicial) * 100 : 0;
  const up = deltaPct >= 0;

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] pb-5">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 px-6 pt-5 mb-4">
        <div>
          <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--t1)]">
            <TrendingUp className="w-5 h-5 text-[var(--cyan)]" />
            Evolução Patrimonial
          </h2>
          <p className="text-[12.5px] text-[var(--t2)] mt-0.5">
            {PERIODO_LABEL[periodo]} · atualizado agora
          </p>
        </div>

        <div className="inline-flex gap-1 p-[3px] bg-[var(--surface-2)] border border-[var(--border)] rounded-[var(--r-pill)]">
          {(['7D', '7S', '12M', 'ANOS'] as Periodo[]).map((p) => {
            const active = periodo === p;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPeriodoChange(p)}
                className={`px-3 py-[5px] rounded-[var(--r-pill)] text-[11.5px] font-semibold transition-colors ${
                  active
                    ? 'bg-[var(--cyan)] text-white'
                    : 'text-[var(--t2)] hover:text-[var(--t1)]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="flex items-baseline gap-4 px-6 mb-3">
        <span
          data-mono
          className="text-[24px] font-bold text-[var(--t1)] tracking-[-0.02em] font-mono"
        >
          {formatBRL(valor)}
        </span>
        <span
          className={`text-[13px] font-semibold ${
            up ? 'text-[var(--gain)]' : 'text-[var(--loss)]'
          }`}
        >
          {up ? '▴' : '▾'} {formatBRL(Math.abs(delta))} ({formatDelta(deltaPct)})
        </span>
      </div>

      {/* Chart */}
      <div className="h-[240px] px-6">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="dashEvolGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#00B8D9" stopOpacity={0.55} />
                <stop offset="100%" stopColor="#00B8D9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <Tooltip
              contentStyle={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border-hi)',
                borderRadius: 8,
                color: 'var(--t1)',
                fontSize: 12,
              }}
              formatter={(v) => [formatBRL(Number(v ?? 0)), 'Patrimônio']}
              labelStyle={{ display: 'none' }}
            />
            <Area
              type="monotone"
              dataKey="v"
              stroke="#00B8D9"
              strokeWidth={2.5}
              strokeLinecap="round"
              fill="url(#dashEvolGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
