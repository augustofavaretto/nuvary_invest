'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, Wallet, Calendar, RefreshCw, Plus,
  PiggyBank, TrendingUp, Building, Globe, Coins, ChevronRight, Lock,
} from 'lucide-react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { usePremium } from '@/hooks/usePremium';
import { FREE_LIMITS } from '@/lib/freeLimits';
import {
  PortfolioSummaryCard,
  PortfolioByClassCard,
  PortfolioByProductCard,
  PortfolioByBrokerCard,
  AddAssetModal,
  SellAssetModal,
} from '@/components/portfolio';
import type { NewAssetData } from '@/components/portfolio';
import {
  getPortfolioData,
  addAsset,
  removeAsset,
  updateAsset,
  saveTransaction,
  refreshAllPrices,
  migrateLocalStorageToSupabase,
  PortfolioData,
  Asset,
} from '@/services/portfolioService';

export default function CarteiraPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const { isPremium, loading: premiumLoading } = usePremium();
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedModalCategory, setSelectedModalCategory] = useState<string | null>(null);
  const [assetToSell, setAssetToSell] = useState<Asset | null>(null);

  // Conta total de ativos para o gate de 10 do plano free
  const totalAtivos = portfolioData
    ? portfolioData.byProduct.rendaFixa.length +
      portfolioData.byProduct.rendaVariavel.length +
      portfolioData.byProduct.fiis.length +
      portfolioData.byProduct.internacional.length
    : 0;
  const limiteAtingido = !isPremium && !premiumLoading && totalAtivos >= FREE_LIMITS.MAX_ATIVOS;

  const tentarAdicionarAtivo = (categoryId: string | null) => {
    if (limiteAtingido) {
      router.push('/premium');
      return;
    }
    setSelectedModalCategory(categoryId);
    setIsAddModalOpen(true);
  };

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [authLoading, isAuthenticated, router]);

  const loadData = async (runMigration = false, forceRefresh = false) => {
    try {
      if (runMigration) await migrateLocalStorageToSupabase();

      // 1) Renderiza imediatamente com os valores já salvos no banco —
      //    o gráfico aparece sem esperar as APIs de preço externas.
      const data = await getPortfolioData();
      setPortfolioData(data);
      setLoading(false);

      // 2) Atualiza preços de mercado em background; só re-renderiza se mudou.
      const updated = await refreshAllPrices(forceRefresh);
      if (updated) {
        const fresh = await getPortfolioData();
        setPortfolioData(fresh);
      }
    } catch (error) {
      console.error('Erro ao carregar portfolio:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadData(true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isAuthenticated]);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadData(false, true);
    setRefreshing(false);
  };

  const handleAddAsset = async (assetData: NewAssetData) => {
    try { await addAsset(assetData); } catch (e) { console.error(e); }
    await handleRefresh();
  };

  const handleRemoveAsset = async (assetId: string) => {
    if (confirm('Tem certeza que deseja remover este ativo?')) {
      await removeAsset(assetId);
      await handleRefresh();
    }
  };

  const handleSellAsset = async (assetId: string, qtd: number, vendaTotal: boolean) => {
    const allAssets = [
      ...(portfolioData?.byProduct.rendaFixa || []),
      ...(portfolioData?.byProduct.rendaVariavel || []),
      ...(portfolioData?.byProduct.fiis || []),
      ...(portfolioData?.byProduct.internacional || []),
    ];
    const asset = allAssets.find(a => a.id === assetId);
    if (asset) {
      const isFixed = asset.type === 'renda_fixa';
      await saveTransaction({
        tipo: 'venda',
        ticker: asset.ticker,
        name: asset.name,
        asset_type: asset.type,
        quantity: qtd,
        price: isFixed ? qtd : asset.currentPrice,
        total_value: isFixed ? qtd : qtd * asset.currentPrice,
        cost_basis: isFixed ? qtd : qtd * asset.averagePrice,
      });
      if (vendaTotal) {
        await removeAsset(assetId);
      } else {
        const newQty = asset.quantity - qtd;
        const newTotal = isFixed ? newQty : newQty * asset.currentPrice;
        await updateAsset(assetId, { quantity: newQty, totalValue: newTotal });
      }
    }
    await handleRefresh();
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cyan)' }} />
          <p className="text-[13px]" style={{ color: 'var(--t2)' }}>Carregando...</p>
        </div>
      </div>
    );
  }

  const hasAssets = portfolioData && portfolioData.summary.totalValue > 0;
  const dataHoje = new Date().toLocaleDateString('pt-BR');

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto space-y-4">
        {/* page-head — Minha Carteira + acoes (atualizar/adicionar) */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4 mb-2"
        >
          <div>
            <h1
              className="flex items-center gap-3 text-[26px] font-bold tracking-tight"
              style={{ color: 'var(--t1)' }}
            >
              <Wallet className="w-[26px] h-[26px]" style={{ color: 'var(--cyan)' }} />
              Minha Carteira
            </h1>
            <p className="text-[13px] mt-1" style={{ color: 'var(--t2)' }}>
              Visão geral dos seus investimentos
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <span
              className="inline-flex items-center gap-1.5 text-[13px]"
              style={{ color: 'var(--t2)' }}
            >
              <Calendar className="w-[14px] h-[14px]" style={{ color: 'var(--cyan)' }} />
              Valores até {dataHoje}
            </span>
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13.5px] font-semibold transition-colors disabled:opacity-50"
              style={{
                background: 'var(--glass)',
                color: 'var(--t1)',
                border: '1px solid var(--border)',
              }}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
              Atualizar
            </button>
            <button
              onClick={() => tentarAdicionarAtivo(null)}
              title={
                limiteAtingido
                  ? `Limite de ${FREE_LIMITS.MAX_ATIVOS} ativos do plano Free — clique para fazer upgrade`
                  : 'Adicionar novo ativo'
              }
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13.5px] font-semibold text-white transition-colors"
              style={{
                background: 'var(--cyan)',
                boxShadow: '0 4px 14px rgba(0, 184, 217, 0.28)',
              }}
            >
              {limiteAtingido ? <Lock className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
              Adicionar Ativo
              {limiteAtingido && (
                <span
                  className="ml-1 px-1.5 py-0.5 rounded-[var(--r-pill)] text-[9.5px] font-bold uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,0.25)', color: 'white' }}
                >
                  Premium
                </span>
              )}
            </button>
          </div>
        </motion.div>

        {/* Aviso de limite Free atingido */}
        {!isPremium && !premiumLoading && portfolioData && totalAtivos > 0 && (
          <div
            className="flex items-center justify-between gap-3 px-4 py-3 rounded-[var(--r-md)]"
            style={{
              background: limiteAtingido
                ? 'linear-gradient(135deg, rgba(239,68,68,0.10), transparent 60%), var(--surface-1)'
                : 'var(--surface-1)',
              border: `1px solid ${limiteAtingido ? 'rgba(239,68,68,0.30)' : 'var(--border)'}`,
            }}
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <Lock
                className="w-4 h-4 shrink-0"
                style={{ color: limiteAtingido ? 'var(--loss)' : 'var(--cyan)' }}
              />
              <span className="text-[13px]" style={{ color: 'var(--t2)' }}>
                Plano Free: <strong style={{ color: 'var(--t1)' }}>{totalAtivos} de {FREE_LIMITS.MAX_ATIVOS}</strong> ativos.
                {limiteAtingido
                  ? ' Faça upgrade para ativos ilimitados.'
                  : ` Restam ${FREE_LIMITS.MAX_ATIVOS - totalAtivos}.`}
              </span>
            </div>
            <button
              onClick={() => router.push('/premium')}
              className="text-[12px] font-semibold px-3 py-1.5 rounded-[var(--r-pill)] transition-colors shrink-0"
              style={{ background: 'var(--cyan)', color: 'white' }}
            >
              Fazer upgrade
            </button>
          </div>
        )}

        {loading ? (
          <div className="space-y-4">
            <div
              className="rounded-[var(--r-lg)] p-6 animate-pulse h-[220px]"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            />
            {[1, 2, 3].map(i => (
              <div
                key={i}
                className="rounded-[var(--r-lg)] p-6 animate-pulse h-[200px]"
                style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
              />
            ))}
          </div>
        ) : hasAssets && portfolioData ? (
          <div className="space-y-4">
            <PortfolioSummaryCard summary={portfolioData.summary} />
            <PortfolioByClassCard data={portfolioData.byClass} />
            <PortfolioByProductCard
              rendaFixa={portfolioData.byProduct.rendaFixa}
              rendaVariavel={portfolioData.byProduct.rendaVariavel}
              fiis={portfolioData.byProduct.fiis}
              internacional={portfolioData.byProduct.internacional}
              onRemoveAsset={handleRemoveAsset}
              onSellAsset={(asset) => setAssetToSell(asset)}
            />
            <PortfolioByBrokerCard data={portfolioData.byBroker} />
          </div>
        ) : (
          // Empty state — categorias para 1o ativo
          <div className="space-y-3">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-[var(--r-lg)] p-6"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full grid place-items-center"
                  style={{ background: 'rgba(0,184,217,0.1)', color: 'var(--cyan)' }}
                >
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
                    Sua carteira está vazia
                  </h2>
                  <p className="text-[13px]" style={{ color: 'var(--t2)' }}>
                    Selecione uma categoria para adicionar seu primeiro ativo
                  </p>
                </div>
              </div>
            </motion.div>

            {[
              { id: 'renda_fixa', name: 'Renda Fixa', description: 'CDBs, LCIs, LCAs e Debêntures', icon: PiggyBank, color: '#1E3A5F' },
              { id: 'renda_variavel', name: 'Renda Variável', description: 'Ações, ETFs e BDRs', icon: TrendingUp, color: '#00B8D9' },
              { id: 'fiis', name: 'Fundos Imobiliários', description: 'FIIs listados na B3', icon: Building, color: '#10B981' },
              { id: 'internacional', name: 'Internacional', description: 'BDRs e ETFs globais', icon: Globe, color: '#7C3AED' },
              { id: 'cripto', name: 'Criptomoedas', description: 'Bitcoin, Ethereum e altcoins', icon: Coins, color: '#F59E0B' },
            ].map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.button
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * (index + 1) }}
                  onClick={() => tentarAdicionarAtivo(category.id)}
                  className="w-full rounded-[var(--r-lg)] p-5 flex items-center gap-4 transition-colors text-left group"
                  style={{
                    background: 'var(--surface-1)',
                    border: '1px solid var(--border)',
                  }}
                >
                  <div
                    className="w-12 h-12 rounded-[var(--r-md)] grid place-items-center flex-shrink-0"
                    style={{ background: `${category.color}1F`, color: category.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-[15px] font-semibold" style={{ color: 'var(--t1)' }}>
                      {category.name}
                    </h3>
                    <p className="text-[13px]" style={{ color: 'var(--t2)' }}>
                      {category.description}
                    </p>
                  </div>
                  <div
                    className="w-8 h-8 rounded-full grid place-items-center transition-colors group-hover:bg-[var(--cyan)]"
                    style={{ border: '1px solid var(--border)', color: 'var(--t3)' }}
                  >
                    <ChevronRight className="w-4 h-4 group-hover:text-white transition-colors" />
                  </div>
                </motion.button>
              );
            })}
          </div>
        )}
      </div>

      <SellAssetModal
        asset={assetToSell}
        onClose={() => setAssetToSell(null)}
        onSell={handleSellAsset}
      />

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
