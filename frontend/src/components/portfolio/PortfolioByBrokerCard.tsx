'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { Broker, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioByBrokerCardProps {
  data: Broker[];
}

const BROKER_COLORS = ['#1E3A5F', '#00B8D9', '#10B981', '#7C3AED', '#F59E0B', '#EF4444'];

// Sua carteira por corretora — wallet-section + alloc-rows do mockup
export function PortfolioByBrokerCard({ data }: PortfolioByBrokerCardProps) {
  const router = useRouter();

  const chartData = data.map((broker, index) => ({
    name: broker.name,
    value: broker.value,
    percentage: broker.percentage,
    color: BROKER_COLORS[index % BROKER_COLORS.length],
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="rounded-[var(--r-lg)] px-6 py-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
      }}
    >
      <h3 className="text-[16px] font-semibold mb-5" style={{ color: 'var(--t1)' }}>
        Sua carteira por corretora
      </h3>

      <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-center">
        <div className="flex justify-center lg:justify-start">
          <DonutChart
            data={chartData}
            size="md"
            centerValue={data.length.toString()}
            centerLabel="Corretoras"
          />
        </div>

        <div className="w-full space-y-1">
          {chartData.map((broker, index) => (
            <motion.button
              key={broker.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() =>
                router.push(`/relatorios?aba=extratos&corretora=${encodeURIComponent(broker.name)}`)
              }
              className="w-full grid grid-cols-[auto_1fr_auto_auto] items-center gap-3 px-3 py-2.5 rounded-[var(--r-md)] transition-colors text-left hover:bg-[var(--surface-2)] group"
            >
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ background: broker.color }}
              />
              <span
                className="text-[13.5px] font-medium truncate"
                style={{ color: 'var(--t1)' }}
              >
                {broker.name}
              </span>
              <span className="text-[13px] tabular-nums" style={{ color: 'var(--t2)' }}>
                {formatPercentage(broker.percentage)}
              </span>
              <span className="flex items-center gap-2 justify-end">
                <span
                  className="text-[13.5px] font-semibold tabular-nums"
                  style={{ color: 'var(--t1)' }}
                >
                  {formatCurrency(broker.value)}
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
