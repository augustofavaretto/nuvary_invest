'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  dashboardService,
  MarketQuote,
  NewsItem,
  WatchlistStock,
} from '@/services/dashboardService';
import { buscarPerfilInvestidor, PerfilInvestidor } from '@/services/perfilService';

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

  // Ref para controlar se o componente esta montado
  const isMountedRef = useRef(true);
  const profileRef = useRef<PerfilInvestidor | null>(null);

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

  // Buscar noticias
  const refreshNews = useCallback(async () => {
    try {
      const newsData = await dashboardService.getFinancialNews(6);
      if (isMountedRef.current) {
        setNews(newsData);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao atualizar noticias:', err);
    }
  }, []);

  // Buscar sugestoes da IA
  const refreshAI = useCallback(async () => {
    const profile = profileRef.current;
    if (!profile?.perfil_risco) return;
    try {
      const suggestion = await dashboardService.getAISuggestions(profile.perfil_risco);
      if (isMountedRef.current) {
        setAiSuggestion(suggestion);
      }
    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') return;
      console.error('Erro ao atualizar sugestoes IA:', err);
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

        // Buscar dados em paralelo
        const [market, stocks, newsData] = await Promise.all([
          dashboardService.getMarketOverview(),
          dashboardService.getWatchlist(),
          dashboardService.getFinancialNews(6),
        ]);

        if (!isMountedRef.current) return;

        setMarketData(market);
        setWatchlist(stocks);
        setNews(newsData);

        // Buscar sugestoes da IA se tiver perfil
        if (profile?.perfil_risco) {
          const suggestion = await dashboardService.getAISuggestions(profile.perfil_risco);
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
