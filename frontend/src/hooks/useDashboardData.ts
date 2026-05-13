'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  dashboardService,
  MarketQuote,
  NewsItem,
  WatchlistStock,
} from '@/services/dashboardService';
import { buscarPerfilInvestidor, PerfilInvestidor } from '@/services/perfilService';
import { getPortfolioData, getTransactions, type PortfolioData, type Transaction } from '@/services/portfolioService';

// Monta o objeto de contexto da carteira no formato esperado por getAISuggestions
function buildContexto(portfolio: PortfolioData | null, transacoes: Transaction[]) {
  if (!portfolio) return undefined;
  const numAtivos =
    portfolio.byProduct.rendaFixa.length +
    portfolio.byProduct.rendaVariavel.length +
    portfolio.byProduct.fiis.length +
    portfolio.byProduct.internacional.length;
  return {
    totalValue: portfolio.summary.totalValue,
    totalInvested: portfolio.summary.totalInvested,
    profitPercentage: portfolio.summary.profitPercentage,
    byClass: portfolio.byClass.map((c) => ({ name: c.name, percentage: c.percentage })),
    numAtivos,
    ultimasMovimentacoes: transacoes.slice(0, 5).map((t) => ({
      tipo: t.tipo,
      ticker: t.ticker,
      quantity: t.quantity,
      price: t.price,
      created_at: t.created_at,
    })),
  };
}

interface DashboardData {
  marketData: MarketQuote[];
  watchlist: WatchlistStock[];
  news: NewsItem[];
  investorProfile: PerfilInvestidor | null;
  aiSuggestion: string;
  loading: boolean;
  error: string | null;
  refreshMarket: () => Promise<void>;
  refreshNews: () => Promise<void>;
  refreshAI: () => Promise<void>;
}

export function useDashboardData(): DashboardData {
  const [marketData, setMarketData] = useState<MarketQuote[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistStock[]>([]);
  const [news, setNews] = useState<NewsItem[]>([]);
  const [investorProfile, setInvestorProfile] = useState<PerfilInvestidor | null>(null);
  const [aiSuggestion, setAiSuggestion] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Ref para controlar se o componente está montado
  const isMountedRef = useRef(true);
  const profileRef = useRef<PerfilInvestidor | null>(null);
  const portfolioRef = useRef<PortfolioData | null>(null);
  const transacoesRef = useRef<Transaction[]>([]);

  // Buscar dados de mercado
  const refreshMarket = useCallback(async () => {
    try {
      const [market, stocks] = await Promise.all([
        dashboardService.getMarketOverview(),
        dashboardService.getWatchlist(),
      ]);
      if (isMountedRef.current) {
        setMarketData(market);
        setWatchlist(stocks);
      }
    } catch (err) {
      // Ignorar erros de abort
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao atualizar mercado:', err);
    }
  }, []);

  // Buscar notícias
  const refreshNews = useCallback(async () => {
    try {
      const newsData = await dashboardService.getFinancialNews(6);
      if (isMountedRef.current) {
        setNews(newsData);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao atualizar notícias:', err);
    }
  }, []);

  // Buscar sugestões da IA
  const refreshAI = useCallback(async () => {
    const profile = profileRef.current;
    if (!profile?.perfil_risco) return;
    try {
      // Recarrega portfolio + transacoes para usar dado fresco
      const [portfolio, transacoes] = await Promise.all([
        getPortfolioData().catch(() => null),
        getTransactions().catch(() => [] as Transaction[]),
      ]);
      if (isMountedRef.current) {
        portfolioRef.current = portfolio;
        transacoesRef.current = transacoes;
      }
      const contexto = buildContexto(portfolio, transacoes);
      const suggestion = await dashboardService.getAISuggestions(profile.perfil_risco, contexto);
      if (isMountedRef.current) {
        setAiSuggestion(suggestion);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao atualizar sugestões IA:', err);
    }
  }, []);

  // Carregar todos os dados iniciais
  useEffect(() => {
    isMountedRef.current = true;

    async function fetchAllData() {
      if (!isMountedRef.current) return;

      setLoading(true);
      setError(null);

      try {
        // Buscar perfil do investidor primeiro
        const profile = await buscarPerfilInvestidor();

        if (!isMountedRef.current) return;

        setInvestorProfile(profile);
        profileRef.current = profile;

        // Buscar dados em paralelo (mercado + noticias + carteira + transacoes)
        const [market, stocks, newsData, portfolio, transacoes] = await Promise.all([
          dashboardService.getMarketOverview(),
          dashboardService.getWatchlist(),
          dashboardService.getFinancialNews(6),
          getPortfolioData().catch(() => null),
          getTransactions().catch(() => [] as Transaction[]),
        ]);

        if (!isMountedRef.current) return;

        setMarketData(market);
        setWatchlist(stocks);
        setNews(newsData);
        portfolioRef.current = portfolio;
        transacoesRef.current = transacoes;

        // Buscar sugestões da IA se tiver perfil — agora com contexto da carteira
        if (profile?.perfil_risco) {
          const contexto = buildContexto(portfolio, transacoes);
          const suggestion = await dashboardService.getAISuggestions(profile.perfil_risco, contexto);
          if (isMountedRef.current) {
            setAiSuggestion(suggestion);
          }
        }
      } catch (err) {
        // Ignorar erros de abort (React Strict Mode)
        if (err instanceof Error && err.name === 'AbortError') return;

        if (isMountedRef.current) {
          console.error('Erro ao carregar dashboard:', err);
          setError('Erro ao carregar dados do dashboard. Tente novamente.');
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    }

    fetchAllData();

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Auto-refresh dos dados de mercado a cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      if (isMountedRef.current) {
        refreshMarket();
      }
    }, 60000);

    return () => clearInterval(interval);
  }, [refreshMarket]);

  return {
    marketData,
    watchlist,
    news,
    investorProfile,
    aiSuggestion,
    loading,
    error,
    refreshMarket,
    refreshNews,
    refreshAI,
  };
}
