'use client';

import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { AssetClassData, formatCurrency, formatPercentage } from '@/services/portfolioService';

// Mapa de nome da classe → valor do filtro em /relatorios
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
      className="bg-card rounded-xl border border-border p-6"
    >
      <h3 className="text-lg font-semibold text-foreground mb-6">
        Sua carteira por Classe
      </h3>

      <div className="flex flex-col lg:flex-row items-center gap-8">
        {/* Chart */}
        <div className="flex-shrink-0">
          <DonutChart
            data={data}
            size="lg"
            centerValue={formatCurrency(totalValue)}
            centerLabel="Total"
          />
        </div>

        {/* Legend */}
        <div className="flex-1 w-full space-y-3">
          {data.map((item, index) => (
            <motion.button
              key={item.name}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 + index * 0.05 }}
              onClick={() => handleClick(item)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors group"
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="font-medium text-foreground">{item.name}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="font-semibold text-foreground">{formatCurrency(item.value)}</p>
                  <p className="text-sm text-muted-foreground">{formatPercentage(item.percentage)} da carteira</p>
                </div>
                <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#00B8D9] group-hover:border-[#00B8D9] transition-colors">
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                </div>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
