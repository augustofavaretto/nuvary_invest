'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, BarChart3, TrendingUp, FileText,
  Download, FileBarChart, AlertCircle,
  CheckCircle, ArrowUpRight, ArrowDownRight, DollarSign,
  Search, ChevronDown, Wallet, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, ReferenceLine,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllAssets, getPortfolioData, Asset, PortfolioData } from '@/services/portfolioService';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Aba = 'performance' | 'extratos' | 'ir';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

// Nomes de exibição por tipo de ativo
const TYPE_LABEL: Record<string, string> = {
  renda_fixa:    'Renda Fixa',
  renda_variavel: 'Ações B3',
  fiis:          'FIIs',
  internacional: 'Internac.',
};
const TYPE_COLOR: Record<string, string> = {
  renda_fixa:    '#00B8D9',
  renda_variavel: '#10b981',
  fiis:          '#f59e0b',
  internacional: '#8b5cf6',
};

// ── Componente principal ──────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();

  const [aba, setAba] = useState<Aba>('performance');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busca, setBusca] = useState('');

  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [cdiAnual, setCdiAnual] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // Carrega dados reais
  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      setLoadingData(true);
      try {
        const [pd, a] = await Promise.all([getPortfolioData(), getAllAssets()]);
        setPortfolioData(pd);
        setAssets(a);
        // Busca CDI atual do backend
        try {
          const res = await fetch(`${API_URL}/bcb/rates`);
          if (res.ok) {
            const data = await res.json();
            setCdiAnual(data.cdi?.taxa ?? null);
          }
        } catch { /* CDI ficará null */ }
      } finally {
        setLoadingData(false);
      }
    }
    load();
  }, [isAuthenticated]);

  // ── Dados derivados ──────────────────────────────────────────────────────
  // Variação por ativo (para o gráfico de barras)
  const variacaoPorAtivo = useMemo(() =>
    assets
      .filter(a => a.type !== 'renda_fixa')            // variação não se aplica a renda fixa da mesma forma
      .map(a => ({ nome: a.ticker, variacao: Number(a.variation.toFixed(2)), cor: TYPE_COLOR[a.type] ?? '#6366f1' }))
      .sort((a, b) => b.variacao - a.variacao),
  [assets]);

  // Rentabilidade por categoria (variação média ponderada por valor)
  const rentabilidadePorCategoria = useMemo(() => {
    const map: Record<string, { total: number; valor: number }> = {};
    assets.forEach(a => {
      if (!map[a.type]) map[a.type] = { total: 0, valor: 0 };
      map[a.type].total += a.variation * a.totalValue;
      map[a.type].valor += a.totalValue;
    });
    return Object.entries(map)
      .filter(([, v]) => v.valor > 0)
      .map(([type, v]) => ({
        categoria: TYPE_LABEL[type] ?? type,
        rentabilidade: Number((v.total / v.valor).toFixed(2)),
        cor: TYPE_COLOR[type] ?? '#6366f1',
      }));
  }, [assets]);

  // Extratos: cada ativo da carteira como transação "Compra"
  const transacoes = useMemo(() =>
    [...assets]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .map((a, i) => ({
        id: i + 1,
        data: a.createdAt ?? new Date().toISOString(),
        tipo: 'Compra' as const,
        ativo: a.ticker,
        nome: a.name,
        categoria: TYPE_LABEL[a.type] ?? a.type,
        qtd: a.quantity,
        preco: a.averagePrice,
        total: a.totalValue,
        type: a.type,
      })),
  [assets]);

  const transacoesFiltradas = useMemo(() => {
    const catMap: Record<string, string> = {
      renda_fixa: 'Renda Fixa', renda_variavel: 'Ações B3',
      fiis: 'FIIs', internacional: 'Internac.',
    };
    return transacoes.filter(t => {
      const matchTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo;
      const matchCat  = filtroCategoria === 'Todas' || catMap[t.type] === filtroCategoria || t.categoria === filtroCategoria;
      const matchBusca = busca === '' ||
        t.ativo.toLowerCase().includes(busca.toLowerCase()) ||
        t.nome.toLowerCase().includes(busca.toLowerCase());
      return matchTipo && matchCat && matchBusca;
    });
  }, [transacoes, filtroTipo, filtroCategoria, busca]);

  // KPIs
  const summary = portfolioData?.summary;
  const lucroTotal  = summary?.totalProfit ?? 0;
  const rentTotal   = summary?.profitPercentage ?? 0;
  const totalAtual  = summary?.totalValue ?? 0;
  const totalAport  = summary?.totalInvested ?? 0;
  const vsCDI = cdiAnual && cdiAnual > 0 && rentTotal !== 0
    ? Number(((rentTotal / cdiAnual) * 100).toFixed(0))
    : null;

  // ── Estados de carregamento / vazio ──────────────────────────────────────
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 py-6 max-w-7xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="w-7 h-7 text-[#00B8D9]" />
            Relatórios
          </h1>
          <p className="text-muted-foreground mt-1">Análises de performance, extratos e imposto de renda</p>
        </motion.div>

        {/* Tabs */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.05 }}
          className="flex gap-1 bg-muted p-1 rounded-xl mb-6 w-fit">
          {([
            { id: 'performance', label: 'Performance',      icon: TrendingUp    },
            { id: 'extratos',    label: 'Extratos',         icon: FileText      },
            { id: 'ir',          label: 'Imposto de Renda', icon: FileBarChart  },
          ] as { id: Aba; label: string; icon: React.ElementType }[]).map(tab => (
            <button key={tab.id} onClick={() => setAba(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                aba === tab.id
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}>
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </motion.div>

        {/* Loading */}
        {loadingData && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin text-[#00B8D9]" />
            <span className="ml-3 text-muted-foreground text-sm">Carregando dados da carteira…</span>
          </div>
        )}

        {/* Carteira vazia */}
        {!loadingData && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="w-14 h-14 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-semibold text-foreground">Sua carteira está vazia</p>
            <p className="text-sm text-muted-foreground mt-1">Adicione ativos na página <strong>Carteira</strong> para ver os relatórios.</p>
          </div>
        )}

        {!loadingData && assets.length > 0 && (

        <motion.div key={aba} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

        {/* ── ABA: PERFORMANCE ─────────────────────────────────────────────── */}
        {aba === 'performance' && (
          <div className="space-y-6">

            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  label: 'Patrimônio Atual',
                  valor: `R$ ${totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  sub: `Aportado: R$ ${totalAport.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  cor: '#00B8D9',
                  icon: Wallet,
                },
                {
                  label: 'Lucro / Prejuízo',
                  valor: `${lucroTotal >= 0 ? '+' : ''}R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  sub: lucroTotal >= 0 ? 'Rendimento positivo' : 'Resultado negativo',
                  cor: lucroTotal >= 0 ? '#10b981' : '#ef4444',
                  icon: lucroTotal >= 0 ? TrendingUp : TrendingDown,
                },
                {
                  label: 'Rentabilidade Total',
                  valor: `${rentTotal >= 0 ? '+' : ''}${rentTotal.toFixed(2)}%`,
                  sub: 'Desde o primeiro aporte',
                  cor: rentTotal >= 0 ? '#10b981' : '#ef4444',
                  icon: rentTotal >= 0 ? ArrowUpRight : ArrowDownRight,
                },
                {
                  label: '% do CDI',
                  valor: vsCDI !== null ? `${vsCDI}%` : '—',
                  sub: cdiAnual ? `CDI atual: ${cdiAnual.toFixed(2)}% a.a.` : 'CDI indisponível',
                  cor: '#6366f1',
                  icon: BarChart3,
                },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs text-muted-foreground">{c.label}</p>
                    <c.icon className="w-4 h-4" style={{ color: c.cor }} />
                  </div>
                  <p className="text-xl font-bold" style={{ color: c.cor }}>{c.valor}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.sub}</p>
                </div>
              ))}
            </div>

            {/* Gráfico: Variação % por ativo */}
            {variacaoPorAtivo.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Variação % por Ativo (dados reais)
                </h2>
                <ResponsiveContainer width="100%" height={Math.max(200, variacaoPorAtivo.length * 36)}>
                  <BarChart
                    data={variacaoPorAtivo}
                    layout="vertical"
                    margin={{ top: 0, right: 40, bottom: 0, left: 10 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <YAxis type="category" dataKey="nome" tick={{ fontSize: 11 }} width={60} />
                    <Tooltip formatter={(v: number | undefined) => v != null ? `${v.toFixed(2)}%` : ''} />
                    <ReferenceLine x={0} stroke="#94a3b8" />
                    <Bar dataKey="variacao" name="Variação %" radius={[0, 6, 6, 0]}>
                      {variacaoPorAtivo.map((entry, i) => (
                        <Cell key={i} fill={entry.variacao >= 0 ? '#10b981' : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Gráfico: Rentabilidade por Categoria */}
            {rentabilidadePorCategoria.length > 0 && (
              <div className="bg-card border border-border rounded-xl p-6">
                <h2 className="text-base font-semibold text-foreground mb-4">
                  Rentabilidade por Categoria (média ponderada)
                </h2>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={rentabilidadePorCategoria} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                    <Tooltip formatter={(v: number | undefined) => v != null ? `${v.toFixed(2)}%` : ''} />
                    <ReferenceLine y={0} stroke="#94a3b8" />
                    <Bar dataKey="rentabilidade" name="Rentabilidade %" radius={[6, 6, 0, 0]}>
                      {rentabilidadePorCategoria.map((entry, i) => (
                        <Cell key={i} fill={entry.rentabilidade >= 0 ? entry.cor : '#ef4444'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-4">
                  {rentabilidadePorCategoria.map(c => (
                    <div key={c.categoria} className="flex items-center gap-1.5">
                      <div className="w-3 h-3 rounded-full" style={{ background: c.rentabilidade >= 0 ? c.cor : '#ef4444' }} />
                      <span className="text-xs text-muted-foreground">{c.categoria}</span>
                      <span className="text-xs font-semibold" style={{ color: c.rentabilidade >= 0 ? c.cor : '#ef4444' }}>
                        {c.rentabilidade >= 0 ? '+' : ''}{c.rentabilidade}%
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── ABA: EXTRATOS ─────────────────────────────────────────────────── */}
        {aba === 'extratos' && (
          <div className="space-y-4">

            {/* Filtros */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-wrap gap-3 items-center">
                <div className="relative flex-1 min-w-[180px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Buscar ativo..."
                    value={busca}
                    onChange={e => setBusca(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-muted border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9]"
                  />
                </div>

                <div className="relative">
                  <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9] appearance-none cursor-pointer"
                  >
                    {['Todos', 'Compra'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9] appearance-none cursor-pointer"
                  >
                    {['Todas', 'Renda Fixa', 'Ações B3', 'FIIs', 'Internac.'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                <button
                  onClick={() => {
                    const linhas = transacoesFiltradas.map(t =>
                      `${new Date(t.data).toLocaleDateString('pt-BR')};${t.tipo};${t.ativo};${t.nome};${t.categoria};${t.qtd};${t.preco.toFixed(2)};${t.total.toFixed(2)}`
                    );
                    const csv = ['Data;Tipo;Ticker;Nome;Categoria;Qtd;Preço;Total', ...linhas].join('\n');
                    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a'); a.href = url; a.download = 'extratos_nuvary.csv'; a.click();
                    URL.revokeObjectURL(url);
                  }}
                  className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#00B8D9] hover:bg-[#007EA7] text-white rounded-lg transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Exportar CSV
                </button>
              </div>
            </div>

            {/* Tabela */}
            <div className="bg-card border border-border rounded-xl overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-muted/50">
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Data</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Tipo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ticker</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Nome</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Categoria</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Qtd / R$</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Preço / Taxa</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-muted-foreground">
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    ) : transacoesFiltradas.map((t, i) => (
                      <tr key={t.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Compra
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{t.ativo}</td>
                        <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">{t.nome}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.categoria}</td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {t.type === 'renda_fixa'
                            ? `R$ ${t.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : t.qtd}
                        </td>
                        <td className="px-4 py-3 text-right text-foreground">
                          {t.type === 'renda_fixa'
                            ? `${t.preco.toFixed(2)}% a.a.`
                            : `R$ ${t.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="px-4 py-3 text-right font-semibold text-foreground">
                          R$ {t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{transacoesFiltradas.length} registro(s)</span>
                <span className="text-xs text-muted-foreground">
                  Total: R$ {transacoesFiltradas.reduce((s, t) => s + t.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA: IMPOSTO DE RENDA ─────────────────────────────────────────── */}
        {aba === 'ir' && (
          <div className="space-y-6">

            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Dados Demonstrativos</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  O cálculo completo de IR requer histórico de vendas (não rastreado ainda). Os valores abaixo são estimativas.
                  Consulte sempre um contador para declaração oficial.
                </p>
              </div>
            </div>

            {/* Cards IR estimados */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  label: 'Lucro Total (estimado)',
                  valor: `${lucroTotal >= 0 ? '+' : ''}R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                  cor: lucroTotal >= 0 ? '#10b981' : '#ef4444',
                  icon: TrendingUp,
                  desc: 'Diferença entre patrimônio atual e total aportado',
                },
                {
                  label: 'IR Estimado (15%)',
                  valor: lucroTotal > 0 ? `R$ ${(lucroTotal * 0.15).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ 0,00',
                  cor: '#ef4444',
                  icon: FileBarChart,
                  desc: 'Estimativa sobre lucro realizado (swing trade)',
                },
                {
                  label: 'FIIs na Carteira',
                  valor: `${assets.filter(a => a.type === 'fiis').length} ativos`,
                  cor: '#00B8D9',
                  icon: DollarSign,
                  desc: 'Rendimentos de FIIs são isentos de IR (pessoa física)',
                },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-5">
                  <div className="flex items-start justify-between mb-3">
                    <p className="text-sm text-muted-foreground">{c.label}</p>
                    <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: `${c.cor}20` }}>
                      <c.icon className="w-5 h-5" style={{ color: c.cor }} />
                    </div>
                  </div>
                  <p className="text-2xl font-bold" style={{ color: c.cor }}>{c.valor}</p>
                  <p className="text-xs text-muted-foreground mt-1">{c.desc}</p>
                </div>
              ))}
            </div>

            {/* Isenções */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Isenções e Rendimentos não Tributáveis
              </h2>
              <div className="space-y-3">
                {[
                  { desc: 'Dividendos de ações (pessoa física)', isento: true },
                  { desc: 'Rendimentos de FIIs (isenção PF)',     isento: true },
                  { desc: 'Vendas de ações ≤ R$20.000/mês',       isento: true },
                  { desc: 'Rendimento caderneta poupança',        isento: true },
                  { desc: 'Rendimentos Renda Fixa (LCI/LCA/CRI/CRA)', isento: true },
                ].map(item => (
                  <div key={item.desc} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{item.desc}</span>
                    </div>
                    <span className="text-xs font-semibold text-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-full">Isento</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Aviso sobre rastreamento futuro */}
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-blue-700 dark:text-blue-400">Histórico de Vendas</p>
                <p className="text-xs text-blue-600 dark:text-blue-500 mt-0.5">
                  Para calcular o IR com precisão, o sistema precisará registrar cada operação de venda.
                  Esta funcionalidade será adicionada em breve.
                </p>
              </div>
            </div>
          </div>
        )}

        </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}
