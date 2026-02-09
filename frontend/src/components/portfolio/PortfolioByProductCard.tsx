'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, TrendingUp, TrendingDown, Trash2 } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { Asset, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioByProductCardProps {
  rendaFixa: Asset[];
  rendaVariavel: Asset[];
  fiis: Asset[];
  internacional: Asset[];
  onRemoveAsset?: (assetId: string) => void;
}

const TABS = [
  { id: 'rendaFixa', label: 'Renda Fixa', color: '#1e3a5f' },
  { id: 'rendaVariavel', label: 'Renda Variavel', color: '#00B8D9' },
  { id: 'fiis', label: 'FIIs', color: '#10b981' },
  { id: 'internacional', label: 'Internacional', color: '#6366f1' },
];

export function PortfolioByProductCard({
  rendaFixa,
  rendaVariavel,
  fiis,
  internacional,
  onRemoveAsset,
}: PortfolioByProductCardProps) {
  const [activeTab, setActiveTab] = useState('rendaFixa');

  const dataMap: Record<string, Asset[]> = {
    rendaFixa,
    rendaVariavel,
    fiis,
    internacional,
  };

  const currentData = dataMap[activeTab] || [];
  const currentTab = TABS.find(t => t.id === activeTab);
  const totalValue = currentData.reduce((sum, item) => sum + item.totalValue, 0);

  // Prepare chart data
  const chartData = currentData.map((item, index) => ({
    name: item.ticker,
    value: item.totalValue,
    percentage: item.percentageOfProduct,
    color: `hsl(${210 + index * 30}, 70%, ${40 + index * 10}%)`,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="bg-white rounded-xl border border-[#E5E7EB] p-6"
    >
      <h3 className="text-lg font-semibold text-[#0B1F33] mb-4">
        Sua carteira por produto
      </h3>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((tab) => {
          const tabData = dataMap[tab.id] || [];
          const hasData = tabData.length > 0;
          return (
            <button
              key={tab.id}
              onClick={() => hasData && setActiveTab(tab.id)}
              disabled={!hasData}
              className={`
                flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                ${activeTab === tab.id
                  ? 'bg-[#00B8D9] text-white'
                  : hasData
                    ? 'bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB]'
                    : 'bg-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed'
                }
              `}
            >
              <span
                className={`w-3 h-3 rounded-full ${activeTab === tab.id ? 'bg-white' : ''}`}
                style={{ backgroundColor: activeTab === tab.id ? undefined : tab.color }}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {currentData.length > 0 ? (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Chart */}
          <div className="flex-shrink-0 flex justify-center">
            <DonutChart
              data={chartData}
              size="md"
              centerValue={formatCurrency(totalValue)}
              centerLabel={currentTab?.label}
            />
          </div>

          {/* Asset List */}
          <div className="flex-1 space-y-2">
            {currentData.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-[#F3F4F6] transition-colors group cursor-pointer"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: chartData[index]?.color }}
                  />
                  <div className="min-w-0">
                    <p className="font-medium text-[#0B1F33] truncate">{asset.name}</p>
                    <p className="text-sm text-[#6B7280]">{asset.ticker}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="font-semibold text-[#0B1F33]">{formatCurrency(asset.totalValue)}</p>
                    <div className="flex items-center justify-end gap-1">
                      {asset.variation >= 0 ? (
                        <TrendingUp className="w-3 h-3 text-green-500" />
                      ) : (
                        <TrendingDown className="w-3 h-3 text-red-500" />
                      )}
                      <span className={`text-sm ${asset.variation >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {asset.variation >= 0 ? '+' : ''}{asset.variation.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                  <div className="text-right hidden sm:block">
                    <p className="text-sm text-[#6B7280]">
                      {formatPercentage(asset.percentageOfProduct)} do produto
                    </p>
                    <p className="text-sm text-[#6B7280]">
                      {formatPercentage(asset.percentageOfPortfolio)} da carteira
                    </p>
                  </div>
                  {onRemoveAsset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAsset(asset.id);
                      }}
                      className="p-2 text-[#D1D5DB] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                      title="Remover ativo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                  <ChevronRight className="w-5 h-5 text-[#D1D5DB] group-hover:text-[#00B8D9] transition-colors" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-[#6B7280]">
          Nenhum ativo nesta categoria
        </div>
      )}
    </motion.div>
  );
}
