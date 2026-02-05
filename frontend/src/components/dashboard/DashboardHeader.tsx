'use client';

import { useState, useEffect } from 'react';
import { User, Calendar, Eye, EyeOff, Wallet, TrendingUp, TrendingDown } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { PerfilInvestidor } from '@/services/perfilService';
import { getPortfolioSummary, formatCurrency, PortfolioSummary } from '@/services/portfolioService';

interface DashboardHeaderProps {
  userName: string;
  investorProfile: PerfilInvestidor | null;
}

const profileColors: Record<string, { bg: string; text: string; label: string }> = {
  conservador: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Conservador' },
  moderado: { bg: 'bg-green-100', text: 'text-green-700', label: 'Moderado' },
  arrojado: { bg: 'bg-amber-100', text: 'text-amber-700', label: 'Arrojado' },
  agressivo: { bg: 'bg-red-100', text: 'text-red-700', label: 'Agressivo' },
};

export function DashboardHeader({ userName, investorProfile }: DashboardHeaderProps) {
  const [showBalance, setShowBalance] = useState(true);
  const [portfolioSummary, setPortfolioSummary] = useState<PortfolioSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load visibility preference from localStorage
    const savedPreference = localStorage.getItem('nuvary_show_balance');
    if (savedPreference !== null) {
      setShowBalance(savedPreference === 'true');
    }

    // Load portfolio summary
    async function loadSummary() {
      try {
        const summary = await getPortfolioSummary();
        setPortfolioSummary(summary);
      } catch (error) {
        console.error('Erro ao carregar resumo:', error);
      } finally {
        setLoading(false);
      }
    }
    loadSummary();
  }, []);

  const toggleBalance = () => {
    const newValue = !showBalance;
    setShowBalance(newValue);
    localStorage.setItem('nuvary_show_balance', String(newValue));
  };

  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const profileType = investorProfile?.perfil_risco?.toLowerCase() || '';
  const profileStyle = profileColors[profileType] || profileColors.conservador;

  const isProfit = portfolioSummary ? portfolioSummary.totalProfit >= 0 : true;

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-[#E5E7EB] mb-6">
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        {/* Left side - Greeting and Date */}
        <div className="flex-1">
          <h1 className="text-2xl md:text-3xl font-bold text-[#0B1F33]">
            Ola, {userName || 'Investidor'}!
          </h1>
          <p className="text-[#6B7280] flex items-center gap-2 mt-1">
            <Calendar className="w-4 h-4" />
            {today}
          </p>
        </div>

        {/* Center - Portfolio Balance */}
        <div className="flex-1">
          <div className="bg-gradient-to-r from-[#0B1F33] to-[#1e3a5f] rounded-xl p-4 text-white">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Wallet className="w-4 h-4 text-[#00B8D9]" />
                <span className="text-sm text-white/70">Patrimonio Total</span>
              </div>
              <button
                onClick={toggleBalance}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
                title={showBalance ? 'Ocultar saldo' : 'Mostrar saldo'}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-white/70" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/70" />
                )}
              </button>
            </div>

            <div className="flex items-end justify-between">
              <div>
                {loading ? (
                  <div className="h-8 w-32 bg-white/10 rounded animate-pulse" />
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={showBalance ? 'visible' : 'hidden'}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="text-2xl font-bold"
                    >
                      {showBalance
                        ? formatCurrency(portfolioSummary?.totalValue || 0)
                        : 'R$ ••••••'}
                    </motion.p>
                  </AnimatePresence>
                )}
              </div>

              {portfolioSummary && showBalance && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex items-center gap-1"
                >
                  {isProfit ? (
                    <TrendingUp className="w-4 h-4 text-green-400" />
                  ) : (
                    <TrendingDown className="w-4 h-4 text-red-400" />
                  )}
                  <span className={`text-sm font-medium ${isProfit ? 'text-green-400' : 'text-red-400'}`}>
                    {isProfit ? '+' : ''}{portfolioSummary.profitPercentage.toFixed(1)}%
                  </span>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Right side - Profile Badge */}
        {investorProfile && (
          <div className="flex items-center gap-3 lg:justify-end">
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-[#6B7280]" />
              <span className="text-sm text-[#6B7280]">Seu perfil:</span>
            </div>
            <span
              className={`px-4 py-2 rounded-full font-semibold text-sm ${profileStyle.bg} ${profileStyle.text}`}
            >
              {profileStyle.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
