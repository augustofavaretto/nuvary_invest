'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { AssetClassData, formatCurrency, formatPercentage } from '@/services/portfolioService';

const CLASS_TO_FILTER: Record<string, string> = {
  'Renda Fixa': 'Renda Fixa',
  'Renda Variável': 'Ações B3',
  'Fundos Imobiliários': 'FIIs',
  'Internacional': 'Internac.',
};

interface PortfolioByClassCardProps {
  data: AssetClassData[];
  onClassClick?: (className: string) => void;
}

// Sua carteira por classe — visual fiel ao mockup (.wallet-section + .alloc-rows)
export function PortfolioByClassCard({ data, onClassClick }: PortfolioByClassCardProps) {
  const router = useRouter();
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

  const handleClick = (item: AssetClassData) => {
    onClassClick?.(item.name);
    const categoria = CLASS_TO_FILTER[item.name] ?? item.name;
    router.push(`/relatorios?aba=extratos&categoria=${encodeURIComponent(categoria)}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="rounded-[var(--r-lg)] px-6 py-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
      }}
    >
      <h3 className="text-[16px] font-semibold mb-5" style={{ color: 'var(--t1)' }}>
        Sua carteira por classe
      </h3>

      <div className="flex flex-col lg:flex-row lg:items-center gap-8">
        <div className="flex-shrink-0 mx-auto lg:mx-0">
          <DonutChart
            data={data}
            size="lg"
            centerValue={formatCurrency(totalValue)}
            centerLabel="Total"
          />
        </div>

        <div className="flex-1 w-full space-y-1">
          {data.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => handleClick(item)}
              className="w-full grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] transition-colors text-left hover:bg-[var(--surface-2)] group"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: item.color }}
              />
              <span
                className="text-[13.5px] font-medium truncate"
                style={{ color: 'var(--t1)' }}
              >
                {item.name}
              </span>
              <span
                className="text-[13px] tabular-nums"
                style={{ color: 'var(--t2)' }}
              >
                {formatPercentage(item.percentage)}
              </span>
              <span className="flex items-center gap-2 justify-end">
                <span
                  className="text-[13.5px] font-semibold tabular-nums"
                  style={{ color: 'var(--t1)' }}
                >
                  {formatCurrency(item.value)}
                </span>
                <ChevronRight
                  className="w-3.5 h-3.5 transition-colors group-hover:text-[var(--cyan)]"
                  style={{ color: 'var(--t3)' }}
                />
              </span>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
