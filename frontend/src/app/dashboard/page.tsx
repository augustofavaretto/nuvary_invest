'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { Header } from '@/components/layout/Header';
import {
  DashboardHeader,
  InvestorProfileCard,
  MarketOverview,
  StockList,
  NewsWidget,
  QuickActionsPanel,
  AISuggestionsCard,
  DashboardErrorBoundary,
} from '@/components/dashboard';

// Nota: AbortError e suprimido globalmente pelo ErrorSuppressor no layout.tsx

function DashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const {
    marketData,
    watchlist,
    news,
    investorProfile,
    aiSuggestion,
    loading: dataLoading,
    refreshMarket,
    refreshNews,
    refreshAI,
  } = useDashboardData();

  const [refreshingMarket, setRefreshingMarket] = useState(false);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [refreshingAI, setRefreshingAI] = useState(false);

  // Verificar autenticacao
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  // Handlers de refresh
  const handleRefreshMarket = async () => {
    setRefreshingMarket(true);
    await refreshMarket();
    setRefreshingMarket(false);
  };

  const handleRefreshNews = async () => {
    setRefreshingNews(true);
    await refreshNews();
    setRefreshingNews(false);
  };

  const handleRefreshAI = async () => {
    setRefreshingAI(true);
    await refreshAI();
    setRefreshingAI(false);
  };

  // Loading state
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
    <div className="min-h-screen bg-[#F3F4F6]">
      <Header />

      <main className="container mx-auto px-4 py-6 max-w-7xl">
        {/* Dashboard Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <DashboardHeader
            userName={profile?.nome || user?.email?.split('@')[0] || 'Investidor'}
            investorProfile={investorProfile}
          />
        </motion.div>

        {/* Loading skeleton para dados */}
        {dataLoading ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white rounded-xl p-6 border border-[#E5E7EB] animate-pulse"
              >
                <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
                <div className="space-y-3">
                  <div className="h-4 bg-gray-200 rounded" />
                  <div className="h-4 bg-gray-200 rounded w-5/6" />
                  <div className="h-4 bg-gray-200 rounded w-4/6" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Coluna Esquerda - Perfil e Acoes Rapidas */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="space-y-6"
            >
              <InvestorProfileCard profile={investorProfile} />
              <QuickActionsPanel />
              <AISuggestionsCard
                suggestion={aiSuggestion}
                onRefresh={handleRefreshAI}
                loading={refreshingAI}
              />
            </motion.div>

            {/* Coluna Central e Direita - Mercado e Noticias */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="lg:col-span-2 space-y-6"
            >
              <MarketOverview
                data={marketData}
                onRefresh={handleRefreshMarket}
                loading={refreshingMarket}
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <StockList stocks={watchlist} />
                <NewsWidget
                  news={news}
                  onRefresh={handleRefreshNews}
                  loading={refreshingNews}
                />
              </div>
            </motion.div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-[#6B7280] text-sm">
        <p>Nuvary Invest - Dashboard do Investidor</p>
      </footer>
    </div>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
