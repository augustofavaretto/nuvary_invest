'use client';

import Link from 'next/link';
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts';
import { PieChart as PieChartIcon, ArrowRight } from 'lucide-react';
import { formatBRL } from '@/lib/format';
import type { AssetClassData } from '@/services/portfolioService';

interface AlocacaoDonutProps {
  byClass: AssetClassData[];
  total: number;
}

const CLASSE_LABEL: Record<string, string> = {
  renda_variavel: 'Renda Variável',
  renda_fixa: 'Renda Fixa',
  fiis: 'FIIs',
  internacional: 'Internacional',
};

const CLASSE_COLOR: Record<string, string> = {
  renda_variavel: '#00B8D9',
  renda_fixa: '#0B1F33',
  fiis: '#10B981',
  internacional: '#7C3AED',
  caixa: '#F59E0B',
};

function classeKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[áàâã]/g, 'a')
    .replace(/[éê]/g, 'e')
    .replace(/í/g, 'i');
}

// Alocacao atual por classe — donut Recharts com legenda lateral. Fiel ao mockup (.alloc-card + .donut + .alloc-rows).
export function AlocacaoDonut({ byClass, total }: AlocacaoDonutProps) {
  const hasData = byClass.length > 0;
  const data = hasData
    ? byClass
    : [{ name: 'Sem ativos', value: 1, percentage: 100, color: '#374151' }];

  return (
    <div className="bg-[var(--surface-1)] border border-[var(--border)] rounded-[var(--r-lg)] p-6">
      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
        <div>
          <h2 className="flex items-center gap-2.5 text-[16px] font-semibold text-[var(--t1)]">
            <PieChartIcon className="w-5 h-5 text-[var(--cyan)]" />
            Alocação atual por classe
          </h2>
          <p className="text-[12.5px] text-[var(--t2)] mt-0.5">Foto real da sua carteira</p>
        </div>

        <Link
          href="/carteira"
          className="inline-flex items-center gap-1.5 text-[12px] font-semibold px-3 py-1 rounded-[var(--r-pill)] border bg-[rgba(0,184,217,0.12)] border-[rgba(0,184,217,0.4)] text-[var(--cyan)] hover:bg-[rgba(0,184,217,0.18)] transition-colors"
        >
          <ArrowRight className="w-3 h-3" />
          Ver carteira completa
        </Link>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 sm:grid-cols-[200px_1fr] gap-6 items-center">
        {/* Donut */}
        <div className="relative w-[200px] h-[200px] mx-auto sm:mx-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                dataKey="value"
                innerRadius={68}
                outerRadius={95}
                stroke="none"
                isAnimationActive={false}
              >
                {data.map((d, i) => (
                  <Cell key={i} fill={d.color || '#374151'} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
            <span className="text-[14px] font-semibold text-[var(--t1)] whitespace-nowrap tabular-nums">
              {formatBRL(total)}
            </span>
            <span className="text-[9px] text-[var(--t3)] uppercase tracking-wider mt-0.5">
              Total
            </span>
          </div>
        </div>

        {/* Legenda */}
        <ul className="space-y-2.5">
          {hasData ? (
            byClass.map((c) => {
              const key = classeKey(c.name);
              const label = CLASSE_LABEL[key] || c.name;
              const color = c.color || CLASSE_COLOR[key] || '#6B7280';
              return (
                <li
                  key={c.name}
                  className="grid grid-cols-[12px_1fr_auto_auto] items-center gap-3 text-sm"
                >
                  <span
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ background: color }}
                  />
                  <span className="text-[var(--t1)] truncate">{label}</span>
                  <span className="text-[var(--t1)] font-semibold">{c.percentage.toFixed(1)}%</span>
                  <span
                    className="text-[var(--t2)] min-w-[80px] text-right text-[13px] tabular-nums"
                  >
                    {formatBRL(c.value)}
                  </span>
                </li>
              );
            })
          ) : (
            <li className="text-sm text-[var(--t2)]">
              Sua carteira está vazia.{' '}
              <Link href="/carteira" className="text-[var(--cyan)] hover:underline">
                Adicione seu primeiro ativo
              </Link>
              .
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
