'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { X, TrendingDown, ChevronRight } from 'lucide-react';
import { Asset, formatCurrency } from '@/services/portfolioService';

interface SellAssetPickerProps {
  isOpen: boolean;
  assets: Asset[];
  onClose: () => void;
  onSelect: (asset: Asset) => void;
}

// Seletor de ativo para venda — lista os ativos da carteira; ao escolher um, abre o SellAssetModal. Acionado pelo botão "Vender Ativo" do cabeçalho.
export function SellAssetPicker({ isOpen, assets, onClose, onSelect }: SellAssetPickerProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(2,8,23,0.6)' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.18 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-[var(--r-lg)] shadow-2xl overflow-hidden"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-2.5">
                <div
                  className="w-9 h-9 rounded-[var(--r-md)] grid place-items-center"
                  style={{ background: 'rgba(239,68,68,0.12)', color: 'var(--loss)' }}
                >
                  <TrendingDown className="w-4.5 h-4.5" />
                </div>
                <div>
                  <h3 className="text-[15px] font-semibold" style={{ color: 'var(--t1)' }}>
                    Vender ativo
                  </h3>
                  <p className="text-[12px]" style={{ color: 'var(--t2)' }}>
                    Escolha qual ativo deseja vender ou resgatar
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Fechar"
                className="w-8 h-8 grid place-items-center rounded-full transition-colors hover:bg-[var(--glass)]"
                style={{ color: 'var(--t2)' }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Lista de ativos */}
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {assets.length === 0 ? (
                <p className="px-3 py-8 text-center text-[13px]" style={{ color: 'var(--t2)' }}>
                  Sua carteira está vazia — não há ativos para vender.
                </p>
              ) : (
                assets.map((asset) => (
                  <button
                    key={asset.id}
                    type="button"
                    onClick={() => onSelect(asset)}
                    className="w-full flex items-center justify-between gap-3 px-3 py-3 rounded-[var(--r-md)] transition-colors hover:bg-[var(--glass)] text-left"
                  >
                    <div className="min-w-0">
                      <strong className="text-[14px] font-semibold block truncate" style={{ color: 'var(--t1)' }}>
                        {asset.name}
                      </strong>
                      <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                        {asset.ticker} · {formatCurrency(asset.totalValue)}
                      </span>
                    </div>
                    <ChevronRight className="w-4 h-4 shrink-0" style={{ color: 'var(--t2)' }} />
                  </button>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
