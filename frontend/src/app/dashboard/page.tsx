'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TickerTape } from '@/components/layout/TickerTape';
import { DashboardErrorBoundary } from '@/components/dashboard';
import { GreetingCard } from '@/components/dashboard/GreetingCard';
import { PatrimonioCard } from '@/components/dashboard/PatrimonioCard';
import { PerfilCard } from '@/components/dashboard/PerfilCard';
import { EvolucaoChart, type Periodo } from '@/components/dashboard/EvolucaoChart';
import { AlocacaoDonut } from '@/components/dashboard/AlocacaoDonut';
import { ChatPreviewWidget } from '@/components/dashboard/ChatPreviewWidget';
import { MercadoCard } from '@/components/dashboard/MercadoCard';
import { NoticiasCard } from '@/components/dashboard/NoticiasCard';

import { getPortfolioData, refreshAllPrices, type PortfolioData } from '@/services/portfolioService';
import { gerarEvolucao } from '@/lib/evolucao';

const SUGESTOES = [
  {
    emoji: '📊',
    titulo: 'Por que minha carteira caiu?',
    prompt:
      'Por que minha carteira caiu recentemente? Analise os ativos que mais impactaram negativamente e o que pode estar por trás disso.',
  },
  {
    emoji: '🎯',
    titulo: 'Devo rebalancear agora?',
    prompt:
      'Devo rebalancear minha carteira agora com base no meu perfil e na alocação atual? Aponte movimentos específicos se sim.',
  },
  {
    emoji: '💡',
    titulo: 'Próximas oportunidades',
    prompt:
      'Quais são as próximas oportunidades de investimento para meu perfil e carteira atual? Cite classes ou ativos específicos.',
  },
];

const ACOES_US_LABELS: Record<string, string> = {
  AAPL: 'Apple',
  MSFT: 'Microsoft',
  GOOGL: 'Google',
  AMZN: 'Amazon',
  TSLA: 'Tesla',
};

function DashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const { news, investorProfile, aiSuggestion, watchlist, refreshNews, refreshMarket } =
    useDashboardData();

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [carregandoPortfolio, setCarregandoPortfolio] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('7S');
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [refreshingNews, setRefreshingNews] = useState(false);
  const [refreshingMarket, setRefreshingMarket] = useState(false);

  // Auth guard
  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // Portfolio — mostra o saldo do banco imediatamente e atualiza os preços de mercado em background; se algo mudou, re-renderiza o saldo.
  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    getPortfolioData()
      .then((p) => active && setPortfolio(p))
      .catch(() => active && setPortfolio(null))
      .finally(() => active && setCarregandoPortfolio(false));
    refreshAllPrices(false)
      .then((updated) => {
        if (updated && active) getPortfolioData().then((p) => active && setPortfolio(p));
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const valorFinal = portfolio?.summary.totalValue ?? 0;
  const variacaoTotal = portfolio?.summary.profitPercentage ?? 0;

  const evolucao = useMemo(
    () => gerarEvolucao(periodo, valorFinal),
    [periodo, valorFinal]
  );
  const valorInicialPeriodo = evolucao[0]?.v ?? 0;

  // Mercado em tempo real — 5 acoes US. Tenta watchlist (Finnhub) real; se vazia, fallback mock.
  const acoesUS = useMemo(() => {
    const tickers = ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'];
    return tickers.map((t) => {
      const real = watchlist?.find(
        (w) => (w as { symbol?: string }).symbol === t
      ) as { symbol?: string; currentPrice?: number; changePercent?: number } | undefined;

      if (real?.currentPrice && typeof real.changePercent === 'number') {
        return {
          ticker: t,
          label: ACOES_US_LABELS[t],
          price: real.currentPrice,
          delta: real.changePercent,
        };
      }

      // Fallback determinista enquanto a API nao responde
      const seed = t.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      return {
        ticker: t,
        label: ACOES_US_LABELS[t],
        price: 200 + (seed % 250),
        delta: ((seed % 8) - 3) / 1,
      };
    });
  }, [watchlist]);

  const dataHoje = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const handleRefreshNews = async () => {
    setRefreshingNews(true);
    await refreshNews();
    setRefreshingNews(false);
  };

  const handleRefreshMarket = async () => {
    setRefreshingMarket(true);
    await refreshMarket();
    setRefreshingMarket(false);
  };

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--cyan)]" />
      </div>
    );
  }

  const nomeUsuario =
    profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Investidor';

  const perfilRaw = investorProfile?.perfil_risco || investorProfile?.perfilRisco || '';
  const perfilLabel =
    typeof perfilRaw === 'string' && perfilRaw.length > 0
      ? perfilRaw.charAt(0).toUpperCase() + perfilRaw.slice(1).toLowerCase()
      : 'Não definido';

  // News do useDashboardData usa { source: { name } }. NoticiasCard espera source: string.
  const newsForCard = (news ?? []).map((n) => ({
    title: n.title,
    url: n.url,
    source: n.source?.name,
    publishedAt: n.publishedAt,
  }));

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto space-y-4">
        {/* ============ Linha 1: Saudacao + Patrimonio + Perfil ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr_0.7fr] gap-4">
          <GreetingCard nome={nomeUsuario} dataHoje={dataHoje} />

          <PatrimonioCard
            valor={valorFinal}
            variacao={variacaoTotal}
            periodoLabel="12m"
            loading={carregandoPortfolio}
            mostrarSaldo={mostrarSaldo}
            onToggleMostrarSaldo={() => setMostrarSaldo((v) => !v)}
          />

          <PerfilCard perfil={perfilLabel} />
        </section>

        {/* ============ Ticker Tape ============ */}
        <TickerTape />

        {/* ============ Linha 2 (8+4): Evolucao + ChatPreview ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <EvolucaoChart
            valor={valorFinal}
            valorInicial={valorInicialPeriodo}
            periodo={periodo}
            onPeriodoChange={setPeriodo}
            data={evolucao}
          />
          <ChatPreviewWidget aiSuggestion={aiSuggestion} sugestoes={SUGESTOES} />
        </section>

        {/* ============ Linha 3 (8+4): Alocacao + Noticias ============ */}
        <section className="grid grid-cols-1 lg:grid-cols-[2fr_1fr] gap-4">
          <AlocacaoDonut byClass={portfolio?.byClass ?? []} total={valorFinal} />
          <NoticiasCard
            news={newsForCard}
            onRefresh={handleRefreshNews}
            loading={refreshingNews}
          />
        </section>

        {/* ============ Linha 4 (full): Mercado em Tempo Real ============ */}
        <MercadoCard
          acoes={acoesUS}
          onRefresh={handleRefreshMarket}
          loading={refreshingMarket}
        />
      </div>
    </DashboardLayout>
  );
}

export default function DashboardPage() {
  return (
    <DashboardErrorBoundary>
      <DashboardContent />
    </DashboardErrorBoundary>
  );
}
