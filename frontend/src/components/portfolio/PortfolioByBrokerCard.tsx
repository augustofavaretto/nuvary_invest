'use client';

import { motion } from 'framer-motion';
import { DonutChart } from './DonutChart';
import { Broker, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioByBrokerCardProps {
  data: Broker[];
}

const BROKER_COLORS = ['#1e3a5f', '#00B8D9', '#10b981', '#6366f1', '#f59e0b', '#ef4444'];

export function PortfolioByBrokerCard({ data }: PortfolioByBrokerCardProps) {
  const totalValue = data.reduce((sum, item) => sum + item.value, 0);

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
      className="bg-white rounded-xl border border-[#E5E7EB] p-6"
    >
      <h3 className="text-lg font-semibold text-[#0B1F33] mb-6">
        Sua carteira por corretora
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Chart */}
        <div className="flex-shrink-0">
          <DonutChart
            data={chartData}
            size="md"
            centerValue={data.length.toString()}
            centerLabel="Corretoras"
          />
        </div>

        {/* Broker List */}
        <div className="flex-1 w-full space-y-3">
          {chartData.map((broker, index) => (
            <motion.div
              key={broker.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F3F4F6] transition-colors"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: broker.color }}
                />
                <span className="font-medium text-[#0B1F33]">{broker.name}</span>
              </div>

              <div className="text-right">
                <p className="font-semibold text-[#0B1F33]">{formatCurrency(broker.value)}</p>
                <p className="text-sm text-[#6B7280]">{formatPercentage(broker.percentage)} da carteira</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
