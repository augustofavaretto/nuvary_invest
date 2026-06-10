'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, TrendingDown as SellIcon } from 'lucide-react';
import { DonutChart } from './DonutChart';
import { Asset, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioByProductCardProps {
  rendaFixa: Asset[];
  rendaVariavel: Asset[];
  fiis: Asset[];
  internacional: Asset[];
  onRemoveAsset?: (assetId: string) => void;
  onSellAsset?: (asset: Asset) => void;
}

const TABS = [
  { id: 'rendaFixa', label: 'Renda Fixa', color: '#1e3a5f' },
  { id: 'rendaVariavel', label: 'Renda Variável', color: '#00B8D9' },
  { id: 'fiis', label: 'FIIs', color: '#10b981' },
  { id: 'internacional', label: 'Internacional', color: '#7C3AED' },
];

// Sua carteira por produto — visual fiel ao mockup
// (.classe-filter + .product-row + .row-actions)
export function PortfolioByProductCard({
  rendaFixa,
  rendaVariavel,
  fiis,
  internacional,
  onRemoveAsset,
  onSellAsset,
}: PortfolioByProductCardProps) {
  const [activeTab, setActiveTab] = useState('rendaFixa');

  const dataMap: Record<string, Asset[]> = {
    rendaFixa,
    rendaVariavel,
    fiis,
    internacional,
  };

  const currentData = dataMap[activeTab] || [];
  const currentTab = TABS.find((t) => t.id === activeTab);
  const totalValue = currentData.reduce((sum, item) => sum + item.totalValue, 0);

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
      className="rounded-[var(--r-lg)] px-6 py-5"
      style={{
        background: 'var(--surface-1)',
        border: '1px solid var(--border)',
      }}
    >
      <h3 className="text-[16px] font-semibold mb-4" style={{ color: 'var(--t1)' }}>
        Sua carteira por produto
      </h3>

      {/* Tabs — classe-pill do mockup */}
      <div className="flex gap-2 mb-5 flex-wrap">
        {TABS.map((tab) => {
          const tabData = dataMap[tab.id] || [];
          const hasData = tabData.length > 0;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => hasData && setActiveTab(tab.id)}
              disabled={!hasData}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-[var(--r-pill)] text-[13px] font-medium transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              style={
                isActive
                  ? {
                      background: 'var(--cyan)',
                      color: 'white',
                      border: '1px solid var(--cyan)',
                    }
                  : {
                      background: 'var(--surface-2)',
                      color: 'var(--t2)',
                      border: '1px solid var(--border)',
                    }
              }
            >
              <span
                className="w-2 h-2 rounded-full"
                style={{ background: isActive ? 'white' : tab.color }}
              />
              {tab.label}
            </button>
          );
        })}
      </div>

      {currentData.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-6 items-start">
          <div className="flex justify-center lg:justify-start">
            <DonutChart
              data={chartData}
              size="md"
              centerValue={formatCurrency(totalValue)}
              centerLabel={currentTab?.label}
            />
          </div>

          <div className="w-full">
            {currentData.map((asset, index) => (
              <motion.div
                key={asset.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="grid grid-cols-[1fr_auto_auto_auto] items-center gap-4 py-3.5"
                style={{
                  borderTop: index === 0 ? 'none' : '1px solid var(--border)',
                }}
              >
                {/* Nome + ticker */}
                <div className="min-w-0">
                  <div
                    className="text-[14px] font-semibold truncate"
                    style={{ color: 'var(--t1)' }}
                  >
                    {asset.name}
                  </div>
                  <div className="text-[11.5px] mt-0.5" style={{ color: 'var(--t2)' }}>
                    {asset.ticker}
                  </div>
                </div>

                {/* Valor + variacao */}
                <div className="text-right tabular-nums">
                  <div
                    className="text-[14px] font-semibold"
                    style={{ color: 'var(--t1)' }}
                  >
                    {formatCurrency(asset.totalValue)}
                  </div>
                  <div
                    className="text-[11.5px]"
                    style={{ color: asset.variation >= 0 ? 'var(--gain)' : 'var(--loss)' }}
                  >
                    {asset.variation >= 0 ? '▴ +' : '▾ '}
                    {asset.variation.toFixed(2)}%
                  </div>
                </div>

                {/* Share — % do produto / % da carteira */}
                <div
                  className="text-right text-[12px] leading-tight hidden md:block"
                  style={{ color: 'var(--t2)' }}
                >
                  <strong
                    className="block text-[13px] font-semibold"
                    style={{ color: 'var(--t1)' }}
                  >
                    {formatPercentage(asset.percentageOfProduct)}
                  </strong>
                  do produto
                  <br />
                  {formatPercentage(asset.percentageOfPortfolio)} da carteira
                </div>

                {/* Acoes — vender + remover */}
                <div className="flex items-center gap-2">
                  {onSellAsset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSellAsset(asset);
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md text-[11.5px] font-semibold transition-colors"
                      style={{
                        background: 'rgba(239, 68, 68, 0.08)',
                        color: 'var(--loss)',
                        border: '1px solid rgba(239, 68, 68, 0.30)',
                      }}
                      title="Vender ativo"
                    >
                      <SellIcon className="w-3 h-3" />
                      Vender
                    </button>
                  )}
                  {onRemoveAsset && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveAsset(asset.id);
                      }}
                      className="w-7 h-7 grid place-items-center rounded-md transition-colors"
                      style={{ color: 'var(--t3)' }}
                      title="Remover ativo"
                      aria-label="Remover ativo"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-[13px]" style={{ color: 'var(--t2)' }}>
          Nenhum ativo nesta categoria
        </div>
      )}
    </motion.div>
  );
}
