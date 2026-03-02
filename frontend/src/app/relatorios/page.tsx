'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, BarChart3, TrendingUp, FileText,
  Download, FileBarChart, AlertCircle,
  CheckCircle, ArrowUpRight, ArrowDownRight, DollarSign,
  Search, ChevronDown,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, BarChart, Bar, Cell,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';

// ── Tipos ─────────────────────────────────────────────────────────────────────
type Aba = 'performance' | 'extratos' | 'ir';

// ── Dados Mock ────────────────────────────────────────────────────────────────
const performanceMensal = [
  { mes: 'Ago/24', carteira: 1.2, cdi: 0.87, ibov: -2.1, ipca: 0.44 },
  { mes: 'Set/24', carteira: 2.1, cdi: 0.88, ibov: 0.9,  ipca: 0.44 },
  { mes: 'Out/24', carteira: -0.8, cdi: 0.91, ibov: -1.7, ipca: 0.56 },
  { mes: 'Nov/24', carteira: 3.4, cdi: 0.89, ibov: -3.1, ipca: 0.39 },
  { mes: 'Dez/24', carteira: 1.8, cdi: 0.91, ibov: -4.8, ipca: 0.52 },
  { mes: 'Jan/25', carteira: 2.6, cdi: 0.93, ibov: 4.9,  ipca: 0.16 },
  { mes: 'Fev/25', carteira: 1.1, cdi: 0.90, ibov: 1.2,  ipca: 1.31 },
];

const rentabilidadePorCategoria = [
  { categoria: 'Renda Fixa',  rentabilidade: 14.2, cor: '#00B8D9' },
  { categoria: 'Tesouro',     rentabilidade: 13.8, cor: '#6366f1' },
  { categoria: 'Ações B3',    rentabilidade: 8.4,  cor: '#10b981' },
  { categoria: 'FIIs',        rentabilidade: 11.2, cor: '#f59e0b' },
  { categoria: 'BDRs / Intl', rentabilidade: 6.9,  cor: '#8b5cf6' },
  { categoria: 'Cripto',      rentabilidade: 22.1, cor: '#ef4444' },
];

const transacoesMock = [
  { id: 1, data: '2025-02-20', tipo: 'Compra',    ativo: 'PETR4',       categoria: 'Ações B3',    qtd: 100,  preco: 38.50,  total: 3850.00  },
  { id: 2, data: '2025-02-18', tipo: 'Dividendo', ativo: 'HGLG11',      categoria: 'FIIs',        qtd: 50,   preco: 1.82,   total: 91.00    },
  { id: 3, data: '2025-02-15', tipo: 'Compra',    ativo: 'CDB Inter',   categoria: 'Renda Fixa',  qtd: 1,    preco: 5000,   total: 5000.00  },
  { id: 4, data: '2025-02-10', tipo: 'Venda',     ativo: 'VALE3',       categoria: 'Ações B3',    qtd: 50,   preco: 64.20,  total: 3210.00  },
  { id: 5, data: '2025-02-05', tipo: 'Compra',    ativo: 'Tesouro IPCA+', categoria: 'Tesouro',   qtd: 1,    preco: 2000,   total: 2000.00  },
  { id: 6, data: '2025-01-28', tipo: 'Dividendo', ativo: 'ITUB4',       categoria: 'Ações B3',    qtd: 200,  preco: 0.32,   total: 64.00    },
  { id: 7, data: '2025-01-22', tipo: 'Compra',    ativo: 'BTC',         categoria: 'Cripto',      qtd: 0.01, preco: 52000,  total: 520.00   },
  { id: 8, data: '2025-01-15', tipo: 'Compra',    ativo: 'MXRF11',      categoria: 'FIIs',        qtd: 100,  preco: 10.20,  total: 1020.00  },
  { id: 9, data: '2025-01-08', tipo: 'Venda',     ativo: 'NVDA',        categoria: 'BDRs / Intl', qtd: 5,    preco: 142.00, total: 710.00   },
  { id: 10, data: '2024-12-20', tipo: 'Compra',   ativo: 'PETR4',       categoria: 'Ações B3',    qtd: 200,  preco: 36.10,  total: 7220.00  },
];

// ── Componente principal ──────────────────────────────────────────────────────
export default function RelatoriosPage() {
  const router = useRouter();
  const { loading: authLoading, isAuthenticated } = useAuth();
  const [aba, setAba] = useState<Aba>('performance');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [busca, setBusca] = useState('');

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#00B8D9]" />
      </div>
    );
  }

  const transacoesFiltradas = transacoesMock.filter(t => {
    const matchTipo = filtroTipo === 'Todos' || t.tipo === filtroTipo;
    const matchCat  = filtroCategoria === 'Todas' || t.categoria === filtroCategoria;
    const matchBusca = busca === '' || t.ativo.toLowerCase().includes(busca.toLowerCase());
    return matchTipo && matchCat && matchBusca;
  });

  const totalMes = performanceMensal[performanceMensal.length - 1].carteira;
  const total6m  = performanceMensal.slice(-6).reduce((s, m) => s + m.carteira, 0);
  const total12m = performanceMensal.reduce((s, m) => s + m.carteira, 0);
  const vsCDI    = (total12m / performanceMensal.reduce((s, m) => s + m.cdi, 0) * 100).toFixed(0);

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
            { id: 'performance', label: 'Performance', icon: TrendingUp },
            { id: 'extratos',    label: 'Extratos',    icon: FileText    },
            { id: 'ir',          label: 'Imposto de Renda', icon: FileBarChart },
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

        {/* ── ABA: PERFORMANCE ─────────────────────────────────────────────── */}
        {aba === 'performance' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Cards de rentabilidade */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                { label: 'Mês atual',    valor: totalMes,  sufixo: '%', cor: totalMes >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Últimos 6M',   valor: total6m,   sufixo: '%', cor: total6m  >= 0 ? '#10b981' : '#ef4444' },
                { label: 'Últimos 12M',  valor: total12m,  sufixo: '%', cor: total12m >= 0 ? '#10b981' : '#ef4444' },
                { label: '% do CDI',     valor: Number(vsCDI), sufixo: '%', cor: '#00B8D9' },
              ].map(c => (
                <div key={c.label} className="bg-card border border-border rounded-xl p-4">
                  <p className="text-xs text-muted-foreground mb-1">{c.label}</p>
                  <p className="text-2xl font-bold" style={{ color: c.cor }}>
                    {c.valor >= 0 ? '+' : ''}{c.valor.toFixed(1)}{c.sufixo}
                  </p>
                  {c.valor >= 0
                    ? <ArrowUpRight className="w-4 h-4 mt-1" style={{ color: c.cor }} />
                    : <ArrowDownRight className="w-4 h-4 mt-1" style={{ color: c.cor }} />}
                </div>
              ))}
            </div>

            {/* Gráfico linha — Rentabilidade vs Benchmarks */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Rentabilidade vs Benchmarks (% a.m.)
              </h2>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={performanceMensal} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number | undefined) => v != null ? `${v.toFixed(2)}%` : ''} />
                  <Legend />
                  <Line dataKey="carteira" name="Minha Carteira" stroke="#00B8D9" strokeWidth={2.5} dot={{ r: 4 }} />
                  <Line dataKey="cdi"      name="CDI"            stroke="#10b981" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line dataKey="ibov"     name="IBOV"           stroke="#6366f1" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                  <Line dataKey="ipca"     name="IPCA"           stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico barras — Rentabilidade por Categoria */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4">
                Rentabilidade por Categoria (12M acumulado)
              </h2>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={rentabilidadePorCategoria} margin={{ top: 5, right: 20, bottom: 5, left: -10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="categoria" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `${v}%`} />
                  <Tooltip formatter={(v: number | undefined) => v != null ? `${v.toFixed(1)}%` : ''} />
                  <Bar dataKey="rentabilidade" name="Rentabilidade %" radius={[6, 6, 0, 0]}>
                    {rentabilidadePorCategoria.map((entry, i) => (
                      <Cell key={i} fill={entry.cor} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              {/* Legenda manual */}
              <div className="flex flex-wrap gap-3 mt-4">
                {rentabilidadePorCategoria.map(c => (
                  <div key={c.categoria} className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ background: c.cor }} />
                    <span className="text-xs text-muted-foreground">{c.categoria}</span>
                    <span className="text-xs font-semibold" style={{ color: c.cor }}>+{c.rentabilidade}%</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ABA: EXTRATOS ─────────────────────────────────────────────────── */}
        {aba === 'extratos' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">

            {/* Filtros */}
            <div className="bg-card border border-border rounded-xl p-4">
              <div className="flex flex-wrap gap-3 items-center">
                {/* Busca */}
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

                {/* Filtro Tipo */}
                <div className="relative">
                  <select
                    value={filtroTipo}
                    onChange={e => setFiltroTipo(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9] appearance-none cursor-pointer"
                  >
                    {['Todos', 'Compra', 'Venda', 'Dividendo'].map(t => (
                      <option key={t} value={t}>{t}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Filtro Categoria */}
                <div className="relative">
                  <select
                    value={filtroCategoria}
                    onChange={e => setFiltroCategoria(e.target.value)}
                    className="pl-3 pr-8 py-2 text-sm bg-muted border border-border rounded-lg text-foreground focus:outline-none focus:ring-2 focus:ring-[#00B8D9] appearance-none cursor-pointer"
                  >
                    {['Todas', 'Ações B3', 'FIIs', 'Renda Fixa', 'Tesouro', 'BDRs / Intl', 'Cripto'].map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                </div>

                {/* Exportar */}
                <button className="ml-auto flex items-center gap-2 px-4 py-2 text-sm font-medium bg-[#00B8D9] hover:bg-[#007EA7] text-white rounded-lg transition-colors">
                  <Download className="w-4 h-4" />
                  Exportar
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
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Ativo</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground">Categoria</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Qtd</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Preço</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-muted-foreground">
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    ) : transacoesFiltradas.map((t, i) => (
                      <tr key={t.id} className={`border-b border-border/50 hover:bg-muted/30 transition-colors ${i % 2 === 0 ? '' : 'bg-muted/20'}`}>
                        <td className="px-4 py-3 text-muted-foreground">
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            t.tipo === 'Compra'   ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
                            t.tipo === 'Venda'    ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' :
                                                   'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                          }`}>
                            {t.tipo === 'Compra' && <ArrowUpRight className="w-3 h-3 mr-1" />}
                            {t.tipo === 'Venda'  && <ArrowDownRight className="w-3 h-3 mr-1" />}
                            {t.tipo === 'Dividendo' && <DollarSign className="w-3 h-3 mr-1" />}
                            {t.tipo}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-semibold text-foreground">{t.ativo}</td>
                        <td className="px-4 py-3 text-muted-foreground">{t.categoria}</td>
                        <td className="px-4 py-3 text-right text-foreground">{t.qtd}</td>
                        <td className="px-4 py-3 text-right text-foreground">
                          R$ {t.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className={`px-4 py-3 text-right font-semibold ${
                          t.tipo === 'Venda' || t.tipo === 'Dividendo' ? 'text-emerald-500' : 'text-foreground'
                        }`}>
                          {t.tipo === 'Compra' ? '- ' : '+ '}
                          R$ {t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="px-4 py-3 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">{transacoesFiltradas.length} transações</span>
                <span className="text-xs text-muted-foreground">Dados demonstrativos — integração com corretora em breve</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── ABA: IMPOSTO DE RENDA ─────────────────────────────────────────── */}
        {aba === 'ir' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

            {/* Aviso */}
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 flex gap-3">
              <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-amber-700 dark:text-amber-400">Dados Demonstrativos</p>
                <p className="text-xs text-amber-600 dark:text-amber-500 mt-0.5">
                  Os valores abaixo são estimativas baseadas nos dados da carteira. Consulte sempre um contador para declaração oficial do IR.
                </p>
              </div>
            </div>

            {/* Cards IR */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Ganho de Capital',     valor: 'R$ 2.847,50',  cor: '#10b981', icon: TrendingUp,    desc: 'Lucro em vendas no ano' },
                { label: 'IR a Recolher (DARF)',  valor: 'R$ 427,12',   cor: '#ef4444', icon: FileBarChart,  desc: 'Alíquota 15% — swing trade' },
                { label: 'Dividendos Recebidos',  valor: 'R$ 642,30',   cor: '#00B8D9', icon: DollarSign,    desc: 'Isentos de IR (pessoa física)' },
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

            {/* Tabela de operações tributáveis */}
            <div className="bg-card border border-border rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-foreground">Operações Tributáveis 2025</h2>
                <button className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-[#00B8D9] hover:bg-[#007EA7] text-white rounded-lg transition-colors">
                  <Download className="w-3 h-3" />
                  Exportar DARF
                </button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left pb-3 text-xs font-semibold text-muted-foreground">Mês</th>
                      <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">Vendas</th>
                      <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">Custo</th>
                      <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">Ganho</th>
                      <th className="text-right pb-3 text-xs font-semibold text-muted-foreground">IR (15%)</th>
                      <th className="text-center pb-3 text-xs font-semibold text-muted-foreground">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { mes: 'Jan/25', vendas: 0,       custo: 0,       ganho: 0,      ir: 0,      pago: null },
                      { mes: 'Fev/25', vendas: 3210.00, custo: 2990.00, ganho: 220.00, ir: 33.00,  pago: false },
                      { mes: 'Mar/25', vendas: 710.00,  custo: 580.00,  ganho: 130.00, ir: 19.50,  pago: false },
                    ].map(r => (
                      <tr key={r.mes} className="border-b border-border/50 hover:bg-muted/30">
                        <td className="py-3 font-medium text-foreground">{r.mes}</td>
                        <td className="py-3 text-right text-foreground">
                          {r.vendas > 0 ? `R$ ${r.vendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-3 text-right text-foreground">
                          {r.custo > 0 ? `R$ ${r.custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className={`py-3 text-right font-semibold ${r.ganho > 0 ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                          {r.ganho > 0 ? `R$ ${r.ganho.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className={`py-3 text-right font-semibold ${r.ir > 0 ? 'text-red-500' : 'text-muted-foreground'}`}>
                          {r.ir > 0 ? `R$ ${r.ir.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : '—'}
                        </td>
                        <td className="py-3 text-center">
                          {r.pago === null ? (
                            <span className="text-xs text-muted-foreground">Isento</span>
                          ) : r.pago ? (
                            <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium">
                              <CheckCircle className="w-3 h-3" /> Pago
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-xs text-red-500 font-medium">
                              <AlertCircle className="w-3 h-3" /> Pendente
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Isenções */}
            <div className="bg-card border border-border rounded-xl p-6">
              <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-500" />
                Isenções e Rendimentos não Tributáveis
              </h2>
              <div className="space-y-3">
                {[
                  { desc: 'Dividendos de ações (PF)', valor: 'R$ 336,00', isento: true },
                  { desc: 'Rendimentos de FIIs (isenção PF)',  valor: 'R$ 306,30', isento: true },
                  { desc: 'Vendas de ações ≤ R$20.000/mês',   valor: 'R$ 0,00',   isento: true },
                  { desc: 'Rendimento caderneta poupança',     valor: 'R$ 0,00',   isento: true },
                ].map(item => (
                  <div key={item.desc} className="flex items-center justify-between py-2 border-b border-border/50 last:border-0">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-emerald-500 flex-shrink-0" />
                      <span className="text-sm text-foreground">{item.desc}</span>
                    </div>
                    <span className="text-sm font-semibold text-emerald-500">{item.valor}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

      </div>
    </DashboardLayout>
  );
}
