'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Wallet, Calendar, RefreshCw, Plus, Trash2,
  PiggyBank, Landmark, TrendingUp, Building, Globe, Coins, ChevronRight,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import {
  PortfolioSummaryCard,
  PortfolioByClassCard,
  PortfolioByProductCard,
  PortfolioByBrokerCard,
  AddAssetModal,
} from '@/components/portfolio';
import type { NewAssetData } from '@/components/portfolio';
import {
  getPortfolioData,
  addAsset,
  removeAsset,
  PortfolioData,
} from '@/services/portfolioService';

export default function CarteiraPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async () => {
    try {
      const data = await getPortfolioData();
      setPortfolioData(data);
    } catch (error) {
      console.error('Erro ao carregar portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData();
    }
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const handleAddAsset = (assetData: NewAssetData) => {
    addAsset(assetData);
    handleRefresh();
  };

  const handleRemoveAsset = (assetId: string) => {
    if (confirm('Tem certeza que deseja remover este ativo?')) {
      removeAsset(assetId);
      handleRefresh();
    }
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
          <p className="text-muted-foreground">Carregando...</p>
        </div>
      </div>
    );
  }

  const hasAssets = portfolioData && portfolioData.summary.totalValue > 0;

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
            <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
              <Wallet className="w-7 h-7 text-[#00B8D9]" />
              Minha Carteira
            </h1>
            <p className="text-muted-foreground mt-1">
              Visão geral dos seus investimentos
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="w-4 h-4" />
              <span>Valores até {new Date().toLocaleDateString('pt-BR')}</span>
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
            <Button
              onClick={() => {
                setSelectedModalCategory(null);
                setIsAddModalOpen(true);
              }}
              size="sm"
              className="bg-[#00B8D9] hover:bg-[#007EA7]"
            >
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Ativo
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
              <div key={i} className="bg-card rounded-xl p-6 border border-border animate-pulse">
                <div className="h-6 bg-muted rounded w-1/4 mb-4" />
                <div className="h-40 bg-muted rounded" />
              </div>
            ))}
          </div>
        ) : hasAssets && portfolioData ? (
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
              onRemoveAsset={handleRemoveAsset}
            />

            {/* Portfolio by Broker */}
            <PortfolioByBrokerCard data={portfolioData.byBroker} />

            {/* Disclaimer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="text-center text-sm text-muted-foreground py-4"
            >
              <p>
                Os preços atuais são simulados para demonstração.
                <br />
                Em produção, os dados serão sincronizados com APIs de mercado.
              </p>
            </motion.div>
          </div>
        ) : (
          // Empty state - lista de categorias
          <div className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-card rounded-xl border border-border p-6"
            >
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-[#00B8D9]/10 rounded-full flex items-center justify-center">
                  <Wallet className="w-5 h-5 text-[#00B8D9]" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Sua carteira está vazia
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Selecione uma categoria para adicionar seu primeiro ativo
                  </p>
                </div>
              </div>
            </motion.div>

            {[
              { id: 'renda_fixa', name: 'Renda Fixa', description: 'CDBs, LCIs, LCAs e Debêntures', icon: PiggyBank, color: '#1e3a5f' },
              { id: 'tesouro', name: 'Tesouro Direto', description: 'Títulos públicos federais', icon: Landmark, color: '#047857' },
              { id: 'renda_variavel', name: 'Renda Variável', description: 'Ações, ETFs e BDRs', icon: TrendingUp, color: '#6366f1' },
              { id: 'fiis', name: 'Fundos Imobiliários', description: 'FIIs listados na B3', icon: Building, color: '#10b981' },
              { id: 'internacional', name: 'Internacional', description: 'BDRs e ETFs globais', icon: Globe, color: '#00B8D9' },
              { id: 'cripto', name: 'Criptomoedas', description: 'Bitcoin, Ethereum e altcoins', icon: Coins, color: '#f59e0b' },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (index + 1) }}
                  onClick={() => {
                    setSelectedModalCategory(category.id);
                    setIsAddModalOpen(true);
                  }}
                  className="w-full bg-card rounded-xl border border-border p-5 flex items-center gap-4 hover:shadow-md hover:border-[#00B8D9]/30 transition-all group text-left"
                >
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                    style={{ backgroundColor: `${category.color}15` }}
                  >
                    <Icon className="w-6 h-6" style={{ color: category.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-base">
                      {category.name}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {category.description}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-full border border-border flex items-center justify-center group-hover:bg-[#00B8D9] group-hover:border-[#00B8D9] transition-colors flex-shrink-0">
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-white transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      {/* Add Asset Modal */}
      <AddAssetModal
        isOpen={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setSelectedModalCategory(null);
        }}
        onAdd={handleAddAsset}
        initialCategory={selectedModalCategory}
      />
    </DashboardLayout>
  );
}
