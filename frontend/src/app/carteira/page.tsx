'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2, Wallet, Calendar, RefreshCw } from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  PortfolioSummaryCard,
  PortfolioByClassCard,
  PortfolioByProductCard,
  PortfolioByBrokerCard,
} from '@/components/portfolio';
import {
  getPortfolioData,
  PortfolioData,
} from '@/services/portfolioService';

export default function CarteiraPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    async function loadData() {
      try {
        const data = await getPortfolioData();
        setPortfolioData(data);
      } catch (error) {
        console.error('Erro ao carregar portfolio:', error);
      } finally {
        setLoading(false);
      }
    }

    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const data = await getPortfolioData();
      setPortfolioData(data);
    } catch (error) {
      console.error('Erro ao atualizar portfolio:', error);
    } finally {
      setRefreshing(false);
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#F3F4F6] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
          <p className="text-[#6B7280]">Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6"
        >
          <div>
            <h1 className="text-2xl font-bold text-[#0B1F33] flex items-center gap-3">
              <Wallet className="w-7 h-7 text-[#00B8D9]" />
              Minha Carteira
            </h1>
            <p className="text-[#6B7280] mt-1">
              Visao geral dos seus investimentos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-[#6B7280]">
              <Calendar className="w-4 h-4" />
              <span>Valores ate {new Date().toLocaleDateString('pt-BR')}</span>
            </div>
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              variant="outline"
              size="sm"
              className="border-[#00B8D9] text-[#00B8D9] hover:bg-[#00B8D9] hover:text-white"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </motion.div>

        {loading ? (
          // Loading skeleton
          <div className="space-y-6">
            <div className="bg-[#0B1F33] rounded-xl p-6 animate-pulse">
              <div className="h-8 bg-white/10 rounded w-1/4 mb-4" />
              <div className="h-12 bg-white/10 rounded w-1/2 mb-6" />
              <div className="grid grid-cols-3 gap-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-white/10 rounded" />
                ))}
              </div>
            </div>
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-white rounded-xl p-6 border border-[#E5E7EB] animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4" />
                <div className="h-40 bg-gray-200 rounded" />
              </div>
            ))}
          </div>
        ) : portfolioData ? (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <PortfolioSummaryCard summary={portfolioData.summary} />

            {/* Portfolio by Class */}
            <PortfolioByClassCard data={portfolioData.byClass} />

            {/* Portfolio by Product */}
            <PortfolioByProductCard
              rendaFixa={portfolioData.byProduct.rendaFixa}
              rendaVariavel={portfolioData.byProduct.rendaVariavel}
              fiis={portfolioData.byProduct.fiis}
              internacional={portfolioData.byProduct.internacional}
            />

            {/* Portfolio by Broker */}
            <PortfolioByBrokerCard data={portfolioData.byBroker} />

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-[#6B7280] py-4"
            >
              <p>
                Os valores exibidos sao ilustrativos para demonstracao do sistema.
                <br />
                Em producao, os dados serao sincronizados com suas corretoras.
              </p>
            </motion.div>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-[#E5E7EB] p-8 text-center">
            <Wallet className="w-16 h-16 text-[#D1D5DB] mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-[#0B1F33] mb-2">
              Nenhum dado disponivel
            </h2>
            <p className="text-[#6B7280] mb-6">
              Nao foi possivel carregar os dados da carteira.
            </p>
            <Button onClick={handleRefresh} className="bg-[#00B8D9] hover:bg-[#007EA7]">
              Tentar novamente
            </Button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
