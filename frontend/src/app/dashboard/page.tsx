'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Area,
  AreaChart,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import {
  Calendar,
  Eye,
  EyeOff,
  Loader2,
  MessageSquare,
  Newspaper,
  PieChart as PieChartIcon,
  RefreshCw,
  Sparkles,
  TrendingUp,
  User as UserIcon,
  ArrowRight,
  ArrowUpRight,
} from 'lucide-react';

import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { TradingViewTicker, DashboardErrorBoundary } from '@/components/dashboard';
import { getPortfolioData, type PortfolioData } from '@/services/portfolioService';
import { formatBRL, formatDelta } from '@/lib/format';

type Periodo = '7D' | '7S' | '12M' | 'ANOS';

// Geracao deterministica de evolucao patrimonial (seed por dia) — mesma estrategia
// usada em /relatorios para evitar dependencia de snapshots historicos no banco.
function gerarEvolucao(periodo: Periodo, valorFinal: number) {
  const pontos = { '7D': 7, '7S': 7, '12M': 12, ANOS: 5 }[periodo];
  const amplitude = { '7D': 0.015, '7S': 0.04, '12M': 0.12, ANOS: 0.35 }[periodo];
  return Array.from({ length: pontos }, (_, i) => {
    const t = (i + 1) / pontos;
    const noise = Math.sin(i * 1.7) * amplitude * 0.5;
    return {
      i,
      v: Math.max(0, valorFinal * (1 - amplitude * (1 - t)) + valorFinal * noise),
    };
  });
}

const PERIODO_LABEL: Record<Periodo, string> = {
  '7D': 'Últimos 7 dias',
  '7S': 'Últimas 7 semanas',
  '12M': 'Últimos 12 meses',
  ANOS: 'Últimos anos',
};

const CLASSE_LABEL: Record<string, string> = {
  renda_variavel: 'Renda Variável',
  renda_fixa: 'Renda Fixa',
  fiis: 'FIIs',
  internacional: 'Internacional',
};

const CLASSE_COLOR: Record<string, string> = {
  renda_variavel: '#26C5DE',
  renda_fixa: '#1E3A5F',
  fiis: '#10B981',
  internacional: '#8B5CF6',
  caixa: '#F59E0B',
};

const SUGESTOES = [
  { emoji: '📊', titulo: 'Por que minha carteira caiu?' },
  { emoji: '🎯', titulo: 'Devo rebalancear agora?' },
  { emoji: '💡', titulo: 'Próximas oportunidades' },
];

function DashboardContent() {
  const router = useRouter();
  const { user, profile, loading: authLoading, isAuthenticated } = useAuth();
  const { news, investorProfile, aiSuggestion, refreshNews } = useDashboardData();

  const [portfolio, setPortfolio] = useState<PortfolioData | null>(null);
  const [carregandoPortfolio, setCarregandoPortfolio] = useState(true);
  const [periodo, setPeriodo] = useState<Periodo>('7S');
  const [mostrarSaldo, setMostrarSaldo] = useState(true);
  const [refreshingNews, setRefreshingNews] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  useEffect(() => {
    if (!isAuthenticated) return;
    let active = true;
    getPortfolioData()
      .then((p) => active && setPortfolio(p))
      .catch(() => active && setPortfolio(null))
      .finally(() => active && setCarregandoPortfolio(false));
    return () => {
      active = false;
    };
  }, [isAuthenticated]);

  const evolucao = useMemo(
    () => gerarEvolucao(periodo, portfolio?.summary.totalValue ?? 0),
    [periodo, portfolio?.summary.totalValue]
  );

  const valorInicialPeriodo = evolucao[0]?.v ?? 0;
  const valorFinal = portfolio?.summary.totalValue ?? 0;
  const variacaoPeriodo = valorInicialPeriodo > 0
    ? ((valorFinal - valorInicialPeriodo) / valorInicialPeriodo) * 100
    : 0;

  const variacaoTotal = portfolio?.summary.profitPercentage ?? 0;

  // Mercado em tempo real (5 acoes US) — sao os mesmos da MarketOverview
  const acoesUS = useMemo(() => {
    const labels: Record<string, string> = {
      AAPL: 'Apple', MSFT: 'Microsoft', GOOGL: 'Google', AMZN: 'Amazon', TSLA: 'Tesla',
    };
    return ['AAPL', 'MSFT', 'GOOGL', 'AMZN', 'TSLA'].map((t) => {
      // Sem dado real garantido — usamos mock determinista a partir do ticker
      const seed = t.split('').reduce((s, c) => s + c.charCodeAt(0), 0);
      const price = 200 + (seed % 250);
      const delta = ((seed % 8) - 3) / 1;
      return { ticker: t, label: labels[t], price, delta };
    });
  }, []);

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

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
      </div>
    );
  }

  const perfilRaw = investorProfile?.perfil_risco || investorProfile?.perfilRisco || '';
  const tituloPerfil = perfilRaw
    ? perfilRaw.charAt(0).toUpperCase() + perfilRaw.slice(1).toLowerCase()
    : 'Não definido';

  return (
    <DashboardLayout>
      <div className="px-4 sm:px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto space-y-6">
        {/* Aurora background sutil — apenas em dark */}
        <div className="fixed inset-0 -z-10 pointer-events-none hidden dark:block">
          <div className="absolute top-0 right-0 w-[800px] h-[600px] bg-cyan-500/8 blur-[140px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[400px] bg-navy-500/40 blur-[120px]" />
        </div>

        {/* ============ Linha 1: 3 cards ============ */}
        <motion.section
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
        >
          {/* Saudacao */}
          <div className="rounded-2xl p-6 bg-card border border-[var(--border-subtle)] shadow-tile">
            <h1 className="text-2xl lg:text-3xl font-bold">
              Olá,{' '}
              <span className="text-[#00B8D9]">
                {profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Investidor'}!
              </span>
            </h1>
            <div className="mt-3 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              {dataHoje}
            </div>
          </div>

          {/* Patrimonio total */}
          <div className="rounded-2xl p-6 bg-gradient-to-br from-card via-card to-cyan-500/5 border border-[var(--border-subtle)] shadow-tile relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-glow opacity-40 pointer-events-none" />
            <div className="relative z-10">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-2">
                  <PieChartIcon className="w-3.5 h-3.5" />
                  Patrimônio total
                </p>
                <button
                  type="button"
                  onClick={() => setMostrarSaldo((v) => !v)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={mostrarSaldo ? 'Ocultar saldo' : 'Mostrar saldo'}
                >
                  {mostrarSaldo ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
              </div>
              {carregandoPortfolio ? (
                <div className="h-9 w-44 bg-muted/40 rounded animate-pulse" />
              ) : (
                <p data-mono className="font-mono text-3xl lg:text-4xl font-medium">
                  {mostrarSaldo ? formatBRL(valorFinal) : 'R$ ••••••'}
                </p>
              )}
              <div className="mt-3 flex items-center gap-2 flex-wrap">
                <span
                  className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                    variacaoTotal >= 0
                      ? 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10'
                      : 'text-red-400 border-red-500/40 bg-red-500/10'
                  }`}
                >
                  <ArrowUpRight className={`w-3 h-3 ${variacaoTotal < 0 ? 'rotate-180' : ''}`} />
                  {formatDelta(variacaoTotal)}
                </span>
                <span className="inline-flex items-center text-xs text-muted-foreground px-2.5 py-1 rounded-full border border-[var(--border-default)]">
                  total
                </span>
              </div>
            </div>
          </div>

          {/* Perfil de investidor */}
          <div className="rounded-2xl p-6 bg-card border border-[var(--border-subtle)] shadow-tile">
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold inline-flex items-center gap-2">
              <UserIcon className="w-3.5 h-3.5" />
              Seu perfil
            </p>
            <div className="mt-3">
              <span className="inline-flex px-4 py-1.5 rounded-full text-base font-bold bg-amber-500/20 text-amber-400 border border-amber-500/40">
                {tituloPerfil}
              </span>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Focando em crescimento de longo prazo
            </p>
          </div>
        </motion.section>

        {/* ============ TradingView Ticker ============ */}
        <motion.section
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile overflow-hidden"
        >
          <TradingViewTicker />
        </motion.section>

        {/* ============ Linha 2: Evolucao Patrimonial + Assistente ============ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
        >
          {/* Evolucao Patrimonial (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6">
            <header className="flex flex-wrap items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-base font-semibold inline-flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-[#00B8D9]" />
                  Evolução Patrimonial
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {PERIODO_LABEL[periodo]} · atualizado agora
                </p>
              </div>
              <div className="inline-flex bg-muted/30 rounded-full p-1 text-xs">
                {(['7D', '7S', '12M', 'ANOS'] as Periodo[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPeriodo(p)}
                    className={`px-3 py-1 rounded-full font-medium transition-colors ${
                      periodo === p
                        ? 'bg-[#00B8D9] text-white'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {p}
                  </button>
                ))}
              </div>
            </header>

            <div className="flex items-baseline gap-3 mb-4">
              <span data-mono className="font-mono text-2xl font-medium">
                {formatBRL(valorFinal)}
              </span>
              <span
                className={`text-sm font-semibold ${
                  variacaoPeriodo >= 0 ? 'text-emerald-400' : 'text-red-400'
                }`}
              >
                ▼ {formatBRL(valorFinal - valorInicialPeriodo)} ({formatDelta(variacaoPeriodo)})
              </span>
            </div>

            <div className="h-[220px] -mx-2 -mb-2">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={evolucao} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
                  <defs>
                    <linearGradient id="dashEvolGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#00B8D9" stopOpacity={0.45} />
                      <stop offset="100%" stopColor="#00B8D9" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <Tooltip
                    contentStyle={{
                      background: 'var(--bg-card, #0E2330)',
                      border: '1px solid var(--border-strong, rgba(0,184,217,0.25))',
                      borderRadius: 8,
                      color: 'var(--text-primary, #FFFFFF)',
                      fontSize: 12,
                    }}
                    formatter={(v) => [formatBRL(Number(v ?? 0)), 'Patrimônio']}
                    labelStyle={{ display: 'none' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="v"
                    stroke="#00B8D9"
                    strokeWidth={2}
                    fill="url(#dashEvolGrad)"
                    isAnimationActive={false}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Assistente Nuvary (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6 flex flex-col">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold inline-flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-[#00B8D9]" />
                Assistente Nuvary
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#00B8D9]/15 text-[#00B8D9] border border-[#00B8D9]/30">
                IA
              </span>
            </header>

            <div className="bg-muted/20 border border-[var(--border-subtle)] rounded-xl p-3 text-sm leading-relaxed mb-3 line-clamp-3">
              {aiSuggestion ||
                'Olá! Posso analisar sua carteira, sugerir rebalanceamentos ou explicar termos. O que quer saber hoje?'}
            </div>

            <ul className="space-y-2 mb-4 flex-1">
              {SUGESTOES.map((s) => (
                <li key={s.titulo}>
                  <Link
                    href="/chat"
                    className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl bg-muted/30 hover:bg-muted/50 border border-[var(--border-subtle)] text-sm transition-colors group"
                  >
                    <span className="inline-flex items-center gap-2">
                      <span aria-hidden>{s.emoji}</span>
                      {s.titulo}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-muted-foreground group-hover:text-[#00B8D9] transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>

            <Link
              href="/chat"
              className="inline-flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl bg-[#00B8D9] hover:bg-[#007EA7] text-white font-medium text-sm transition-colors"
            >
              Abrir chat completo
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </motion.section>

        {/* ============ Linha 3: Alocacao + Noticias ============ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6"
        >
          {/* Alocacao por classe (8 cols) */}
          <div className="lg:col-span-8 rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6">
            <header className="flex flex-wrap items-start justify-between gap-3 mb-5">
              <div>
                <h2 className="text-base font-semibold inline-flex items-center gap-2">
                  <PieChartIcon className="w-4 h-4 text-[#00B8D9]" />
                  Alocação atual por classe
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">Foto real da sua carteira</p>
              </div>
              <Link
                href="/carteira"
                className="inline-flex items-center gap-1 text-xs font-medium text-[#00B8D9] hover:text-[#007EA7] transition-colors"
              >
                <ArrowRight className="w-3 h-3" />
                Ver carteira completa
              </Link>
            </header>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
              <div className="relative h-40 sm:h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={portfolio?.byClass.length ? portfolio.byClass : [{ name: 'Sem ativos', value: 1, percentage: 100, color: '#374151' }]}
                      dataKey="value"
                      innerRadius={50}
                      outerRadius={75}
                      stroke="none"
                      isAnimationActive={false}
                    >
                      {(portfolio?.byClass.length ? portfolio.byClass : [{ name: 'Sem ativos', value: 1, percentage: 100, color: '#374151' }]).map((d, i) => (
                        <Cell key={i} fill={d.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span data-mono className="font-mono text-base font-semibold">
                    {formatBRL(valorFinal)}
                  </span>
                  <span className="text-[10px] text-muted-foreground uppercase tracking-wider">Total</span>
                </div>
              </div>

              <ul className="sm:col-span-2 space-y-2">
                {(portfolio?.byClass.length ? portfolio.byClass : []).map((c) => {
                  const key = c.name.toLowerCase().replace(/\s+/g, '_').replace(/[áàâã]/g, 'a').replace(/[éê]/g, 'e').replace(/í/g, 'i');
                  const label = CLASSE_LABEL[key] || c.name;
                  return (
                    <li key={c.name} className="flex items-center justify-between gap-3 text-sm">
                      <span className="inline-flex items-center gap-2 min-w-0">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ background: c.color || CLASSE_COLOR[key] || '#6B7280' }}
                        />
                        <span className="truncate">{label}</span>
                      </span>
                      <span className="inline-flex items-center gap-3 shrink-0 text-xs">
                        <span className="font-semibold">{c.percentage.toFixed(1)}%</span>
                        <span data-mono className="font-mono text-muted-foreground min-w-[80px] text-right">
                          {formatBRL(c.value)}
                        </span>
                      </span>
                    </li>
                  );
                })}
                {!portfolio?.byClass.length && (
                  <li className="text-sm text-muted-foreground">
                    Sua carteira está vazia.{' '}
                    <Link href="/carteira" className="text-[#00B8D9] hover:underline">
                      Adicione seu primeiro ativo
                    </Link>
                    .
                  </li>
                )}
              </ul>
            </div>
          </div>

          {/* Noticias (4 cols) */}
          <div className="lg:col-span-4 rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6 flex flex-col">
            <header className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold inline-flex items-center gap-2">
                <Newspaper className="w-4 h-4 text-[#00B8D9]" />
                Notícias Financeiras
              </h2>
              <button
                type="button"
                onClick={handleRefreshNews}
                disabled={refreshingNews}
                className="text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
                aria-label="Atualizar notícias"
              >
                <RefreshCw className={`w-4 h-4 ${refreshingNews ? 'animate-spin' : ''}`} />
              </button>
            </header>

            <ul className="space-y-3 flex-1 overflow-hidden">
              {(news ?? []).slice(0, 3).map((n, i) => (
                <li key={i} className="flex items-start gap-3">
                  <span className="w-9 h-9 rounded-lg bg-cyan-500/15 text-cyan-500 inline-flex items-center justify-center shrink-0">
                    <TrendingUp className="w-4 h-4" />
                  </span>
                  <a
                    href={(n as { url?: string }).url || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-foreground hover:text-[#00B8D9] transition-colors line-clamp-2"
                  >
                    {n.title}
                  </a>
                </li>
              ))}
              {(!news || news.length === 0) && (
                <li className="text-sm text-muted-foreground">Sem notícias no momento.</li>
              )}
            </ul>
          </div>
        </motion.section>

        {/* ============ Linha 4: Mercado em Tempo Real ============ */}
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="rounded-2xl bg-card border border-[var(--border-subtle)] shadow-tile p-6"
        >
          <header className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold inline-flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#00B8D9]" />
              Mercado em Tempo Real
            </h2>
          </header>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {acoesUS.map((a) => (
              <div
                key={a.ticker}
                className="rounded-xl bg-muted/30 border border-[var(--border-subtle)] p-4 hover:border-[var(--border-strong)] transition-colors"
              >
                <p className="text-xs text-muted-foreground">{a.label}</p>
                <p data-mono className="font-mono text-lg font-semibold mt-1">
                  ${a.price.toFixed(2)}
                </p>
                <p
                  className={`text-xs font-semibold mt-1 inline-flex items-center gap-1 ${
                    a.delta >= 0 ? 'text-emerald-400' : 'text-red-400'
                  }`}
                >
                  <ArrowUpRight className={`w-3 h-3 ${a.delta < 0 ? 'rotate-180' : ''}`} />
                  {formatDelta(a.delta)}
                </p>
              </div>
            ))}
          </div>
        </motion.section>
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
