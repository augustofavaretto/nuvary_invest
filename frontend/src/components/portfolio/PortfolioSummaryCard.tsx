'use client';

import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, Calendar } from 'lucide-react';
import { PortfolioSummary, formatCurrency, formatPercentage } from '@/services/portfolioService';

interface PortfolioSummaryCardProps {
  summary: PortfolioSummary;
}

export function PortfolioSummaryCard({ summary }: PortfolioSummaryCardProps) {
  const isProfit = summary.totalProfit >= 0;
  const lastUpdate = new Date(summary.lastUpdate);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-[#0B1F33] to-[#1e3a5f] rounded-xl p-6 text-white"
    >
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
            <Wallet className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Patrimonio Total</h2>
            <p className="text-sm text-white/70">Consolidado da carteira</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm text-white/70">
          <Calendar className="w-4 h-4" />
          <span>Atualizado em {lastUpdate.toLocaleDateString('pt-BR')}</span>
        </div>
      </div>

      <div className="mb-6">
        <p className="text-4xl font-bold">{formatCurrency(summary.totalValue)}</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-white/70 mb-1">Investido</p>
          <p className="text-lg font-semibold">{formatCurrency(summary.totalInvested)}</p>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-white/70 mb-1">Lucro/Prejuizo</p>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <p className={`text-lg font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {formatCurrency(Math.abs(summary.totalProfit))}
            </p>
          </div>
        </div>
        <div className="bg-white/10 rounded-lg p-4">
          <p className="text-sm text-white/70 mb-1">Rentabilidade</p>
          <div className="flex items-center gap-2">
            {isProfit ? (
              <TrendingUp className="w-5 h-5 text-green-400" />
            ) : (
              <TrendingDown className="w-5 h-5 text-red-400" />
            )}
            <p className={`text-lg font-semibold ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
              {isProfit ? '+' : ''}{formatPercentage(summary.profitPercentage)}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
