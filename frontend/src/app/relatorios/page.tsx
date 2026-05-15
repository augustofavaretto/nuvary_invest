'use client';

import { useEffect, useState, useMemo, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Loader2, BarChart3, TrendingUp, FileText,
  Download, FileBarChart, ArrowUpRight, ArrowDownRight,
  Search, ChevronDown, Wallet, TrendingDown,
} from 'lucide-react';
import {
  BarChart, Bar, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { useAuth } from '@/contexts/AuthContext';
import { getAllAssets, getPortfolioData, getTransactions, refreshAllPrices, Asset, PortfolioData, Transaction } from '@/services/portfolioService';

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
function RelatoriosContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading, isAuthenticated, profile } = useAuth();

  const [aba, setAba] = useState<Aba>((searchParams.get('aba') as Aba) || 'performance');
  const [filtroTipo, setFiltroTipo] = useState('Todos');
  const [filtroCategoria, setFiltroCategoria] = useState(searchParams.get('categoria') || 'Todas');
  const [filtroCorretora, setFiltroCorretora] = useState(searchParams.get('corretora') || 'Todas');
  const [busca, setBusca] = useState('');

  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [sellTransactions, setSellTransactions] = useState<Transaction[]>([]);
  const [cdiAnual, setCdiAnual] = useState<number | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [periodoEvolucao, setPeriodoEvolucao] = useState<'7D' | '7S' | '12M' | 'ANOS'>('7D');
  const [tipoGraficoEvolucao, setTipoGraficoEvolucao] = useState<'line' | 'bar'>('line');
  const [showExportMenu, setShowExportMenu] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.push('/login');
  }, [authLoading, isAuthenticated, router]);

  // Carrega dados reais
  useEffect(() => {
    if (!isAuthenticated) return;
    async function load() {
      setLoadingData(true);
      try {
        await refreshAllPrices(false);
        const [pd, a, txs] = await Promise.all([getPortfolioData(), getAllAssets(), getTransactions()]);
        setPortfolioData(pd);
        setAssets(a);
        setSellTransactions(txs.filter(t => t.tipo === 'venda'));
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

  // Extratos: compras (ativos na carteira) + vendas (portfolio_transactions)
  const transacoes = useMemo(() => {
    const compras = [...assets]
      .sort((a, b) => {
        const da = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const db = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return db - da;
      })
      .map((a, i) => ({
        id: `c-${i}`,
        data: a.createdAt ?? new Date().toISOString(),
        tipo: 'Compra' as 'Compra' | 'Venda',
        ativo: a.ticker,
        nome: a.name,
        categoria: TYPE_LABEL[a.type] ?? a.type,
        qtd: a.quantity,
        preco: a.averagePrice,
        total: a.totalValue,
        type: a.type,
        broker: a.broker ?? '',
      }));
    const vendas = sellTransactions.map((t, i) => ({
      id: `v-${i}`,
      data: t.created_at,
      tipo: 'Venda' as 'Compra' | 'Venda',
      ativo: t.ticker,
      nome: t.name,
      categoria: TYPE_LABEL[t.asset_type] ?? t.asset_type,
      qtd: t.quantity,
      preco: t.price,
      total: t.total_value,
      type: t.asset_type,
      broker: '',
    }));
    return [...compras, ...vendas].sort((a, b) =>
      new Date(b.data).getTime() - new Date(a.data).getTime()
    );
  }, [assets, sellTransactions]);

  const corretoras = useMemo(() => {
    const set = new Set(assets.map(a => a.broker).filter(Boolean));
    return ['Todas', ...Array.from(set).sort()];
  }, [assets]);

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
      const matchCorretora = filtroCorretora === 'Todas' || t.broker === filtroCorretora;
      return matchTipo && matchCat && matchBusca && matchCorretora;
    });
  }, [transacoes, filtroTipo, filtroCategoria, filtroCorretora, busca]);

  // KPIs
  const summary = portfolioData?.summary;
  const lucroTotal  = summary?.totalProfit ?? 0;
  const rentTotal   = summary?.profitPercentage ?? 0;
  const totalAtual  = summary?.totalValue ?? 0;
  const totalAport  = summary?.totalInvested ?? 0;
  const vsCDI = cdiAnual && cdiAnual > 0 && rentTotal !== 0
    ? Number(((rentTotal / cdiAnual) * 100).toFixed(0))
    : null;

  // Evolução Patrimonial: gera pontos históricos determinísticos a partir do totalAtual
  const evolucaoData = useMemo(() => {
    if (totalAtual === 0) return [];
    const periodos = {
      '7D':  { pontos: 7,  offsetDias: 1  },
      '7S':  { pontos: 7,  offsetDias: 7  },
      '12M': { pontos: 12, offsetDias: 30 },
      'ANOS': { pontos: 8, offsetDias: 90 },
    };
    const { pontos, offsetDias } = periodos[periodoEvolucao];
    const result: { data: string; valor: number }[] = [];
    for (let i = pontos; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i * offsetDias);
      const label = periodoEvolucao === '12M' || periodoEvolucao === 'ANOS'
        ? date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
        : date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
      if (i === 0) {
        result.push({ data: label, valor: totalAtual });
      } else {
        const s = date.getDate() * 7 + (date.getMonth() + 1) * 31 + (date.getFullYear() % 10) * 17;
        const pseudo = (Math.sin(s) + 1) / 2;
        const pct = (pseudo - 0.5) * (i * 0.8);
        result.push({ data: label, valor: Math.max(0, Math.round(totalAtual * (1 - pct / 100) * 100) / 100) });
      }
    }
    return result;
  }, [totalAtual, periodoEvolucao]);

  // ── Geração de documentos PDF ─────────────────────────────────────────
  function abrirJanelaPDF(html: string, titulo: string) {
    const win = window.open('', '_blank', 'width=900,height=700');
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.document.title = titulo;
    win.focus();
    setTimeout(() => { win.print(); }, 500);
  }

  function gerarDARF() {
    const agora = new Date();
    const mes = String(agora.getMonth() + 1).padStart(2, '0');
    const ano = agora.getFullYear();
    const periodoApuracao = `${mes}/${ano}`;
    // Vencimento: último dia útil do mês seguinte (aproximado: dia 30)
    const mesVenc = String((agora.getMonth() + 2) > 12 ? 1 : agora.getMonth() + 2).padStart(2, '0');
    const anoVenc = agora.getMonth() + 2 > 12 ? ano + 1 : ano;
    const vencimento = `${String(new Date(anoVenc, Number(mesVenc) - 1, 0).getDate()).padStart(2, '0')}/${mesVenc}/${anoVenc}`;
    const valorIR = lucroTotal > 0 ? lucroTotal * 0.15 : 0;
    const nomeUsuario = profile?.nome || 'Contribuinte';
    const emailUsuario = profile?.email || '';

    // CPF do cadastro formatado como XXX.XXX.XXX-XX (fallback se nao informado)
    const cpfLimpo = (profile?.cpf || '').replace(/\D/g, '');
    const cpfFormatado = cpfLimpo.length === 11
      ? cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
      : '___.___.___-__';

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>DARF - Nuvary Invest</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 20px; }
  .header { border: 2px solid #000; padding: 8px 12px; margin-bottom: 0; }
  .header-top { display: flex; justify-content: space-between; align-items: center; }
  .header h1 { font-size: 14px; font-weight: bold; }
  .header h2 { font-size: 11px; font-weight: normal; }
  .rfb { font-size: 10px; text-align: right; }
  .titulo-darf { background: #000; color: #fff; text-align: center; font-size: 13px; font-weight: bold; padding: 4px; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; }
  td, th { border: 1px solid #000; padding: 4px 6px; vertical-align: top; }
  .label { font-size: 8px; color: #333; display: block; margin-bottom: 2px; }
  .valor { font-size: 11px; font-weight: bold; }
  .valor-destaque { font-size: 14px; font-weight: bold; color: #000; }
  .footer { border: 1px solid #000; border-top: none; padding: 6px 8px; font-size: 9px; color: #555; }
  .aviso { margin-top: 16px; border: 1px solid #aaa; padding: 8px; font-size: 9px; color: #555; background: #f9f9f9; }
  .logo-area { font-size: 9px; text-align: center; margin-top: 2px; }
  @media print {
    body { padding: 10px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>
<div class="header">
  <div class="header-top">
    <div>
      <div class="logo-area">MINISTÉRIO DA FAZENDA</div>
      <h1>RECEITA FEDERAL DO BRASIL</h1>
      <h2>Secretaria Especial da Receita Federal do Brasil</h2>
    </div>
    <div class="rfb">
      <strong>DARF</strong><br/>
      Documento de Arrecadação<br/>de Receitas Federais
    </div>
  </div>
</div>
<div class="titulo-darf">DARF — DOCUMENTO DE ARRECADAÇÃO DE RECEITAS FEDERAIS</div>
<table>
  <tr>
    <td colspan="3">
      <span class="label">01 — PERÍODO DE APURAÇÃO</span>
      <span class="valor">${periodoApuracao}</span>
    </td>
    <td colspan="3">
      <span class="label">02 — NÚMERO DO CPF / CNPJ</span>
      <span class="valor">${cpfFormatado}</span>
    </td>
    <td colspan="4">
      <span class="label">03 — CÓDIGO DA RECEITA</span>
      <span class="valor">6015 — Ganhos Líquidos em Operações em Bolsa</span>
    </td>
  </tr>
  <tr>
    <td colspan="10">
      <span class="label">04 — NOME DO CONTRIBUINTE</span>
      <span class="valor">${nomeUsuario.toUpperCase()}</span>
    </td>
  </tr>
  <tr>
    <td colspan="4">
      <span class="label">05 — DATA DE VENCIMENTO</span>
      <span class="valor">${vencimento}</span>
    </td>
    <td colspan="3">
      <span class="label">06 — VALOR DO PRINCIPAL (R$)</span>
      <span class="valor-destaque">${valorIR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </td>
    <td colspan="3">
      <span class="label">07 — MULTA (R$)</span>
      <span class="valor">0,00</span>
    </td>
  </tr>
  <tr>
    <td colspan="4">
      <span class="label">08 — JUROS / ENCARGOS (R$)</span>
      <span class="valor">0,00</span>
    </td>
    <td colspan="3">
      <span class="label">09 — TOTAL (R$)</span>
      <span class="valor-destaque">${valorIR.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
    </td>
    <td colspan="3">
      <span class="label">10 — AUTENTICAÇÃO BANCÁRIA</span>
      <span class="valor" style="font-size:9px;">Gerado em ${agora.toLocaleDateString('pt-BR')} às ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
    </td>
  </tr>
  <tr>
    <td colspan="10" style="padding:6px 8px;">
      <span class="label">INFORMAÇÕES COMPLEMENTARES</span>
      <span style="font-size:10px;">
        Contribuinte: ${nomeUsuario} ${emailUsuario ? '| E-mail: ' + emailUsuario : ''}<br/>
        Lucro estimado no período: R$ ${lucroTotal > 0 ? lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}<br/>
        Alíquota: 15% — Swing Trade / Renda Variável (Art. 2º da Lei 11.033/2004)<br/>
        Base de cálculo: Resultado positivo entre patrimônio atual e valor total aportado
      </span>
    </td>
  </tr>
</table>
<div class="footer">
  * Este DARF foi gerado pela plataforma Nuvary Invest com fins demonstrativos. Os valores são estimativas baseadas nos ativos cadastrados na carteira.
  Para declaração oficial, consulte um contador ou utilize o programa GCAP (Receita Federal). Código de receita 6015 aplicável a renda variável (ações, FIIs).
</div>
<div class="aviso">
  <strong>ATENÇÃO:</strong> Este documento tem caráter <strong>informativo e demonstrativo</strong>. Não substitui a apuração oficial do Imposto de Renda.
  O cálculo correto de IR exige o histórico completo de operações de compra e venda. Consulte sempre um profissional contábil habilitado.
</div>
<div style="text-align:center;margin-top:12px;font-size:9px;color:#999;">
  Gerado por Nuvary Invest em ${agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
</div>
<div class="no-print" style="text-align:center;margin-top:20px;">
  <button onclick="window.print()" style="padding:10px 24px;background:#1a56db;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Imprimir / Salvar PDF</button>
</div>
</body>
</html>`;

    abrirJanelaPDF(html, 'DARF - Nuvary Invest');
  }

  function gerarInformeRendimentos() {
    const agora = new Date();
    const anoBase = agora.getFullYear() - (agora.getMonth() < 2 ? 1 : 0); // ano-calendário
    const nomeUsuario = profile?.nome || 'Investidor';
    const emailUsuario = profile?.email || '';

    // CPF do cadastro: aceita "12345678900" ou "123.456.789-00"; formata para XXX.XXX.XXX-XX.
    // Fallback para placeholder quando o usuario nao informou.
    const cpfLimpo = (profile?.cpf || '').replace(/\D/g, '');
    const cpfFormatado = cpfLimpo.length === 11
      ? cpfLimpo.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, '$1.$2.$3-$4')
      : '___.___.___-__';

    // Agrupamento por categoria
    const grupos: Record<string, { ativos: Asset[]; totalInvestido: number; totalAtual: number; rendimento: number }> = {};
    assets.forEach(a => {
      if (!grupos[a.type]) grupos[a.type] = { ativos: [], totalInvestido: 0, totalAtual: 0, rendimento: 0 };
      grupos[a.type].ativos.push(a);
      grupos[a.type].totalInvestido += a.type === 'renda_fixa' ? a.quantity : a.quantity * a.averagePrice;
      grupos[a.type].totalAtual += a.totalValue;
      grupos[a.type].rendimento += a.totalValue - (a.type === 'renda_fixa' ? a.quantity : a.quantity * a.averagePrice);
    });

    const linhasAtivos = assets.map(a => {
      const custo = a.type === 'renda_fixa' ? a.quantity : a.quantity * a.averagePrice;
      const result = a.totalValue - custo;
      const isento = a.type === 'fiis' || a.type === 'renda_fixa';
      return `<tr>
        <td>${a.ticker}</td>
        <td>${a.name.length > 40 ? a.name.substring(0, 40) + '...' : a.name}</td>
        <td>${TYPE_LABEL[a.type] ?? a.type}</td>
        <td style="text-align:right">R$ ${custo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right">R$ ${a.totalValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right;color:${result >= 0 ? '#166534' : '#991b1b'}">${result >= 0 ? '+' : ''}R$ ${result.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:center">${isento ? '✓ Isento' : '15%'}</td>
      </tr>`;
    }).join('');

    const totalCusto = assets.reduce((s, a) => s + (a.type === 'renda_fixa' ? a.quantity : a.quantity * a.averagePrice), 0);
    const irEstimado = lucroTotal > 0 ? lucroTotal * 0.15 : 0;

    const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8"/>
<title>Informe de Rendimentos ${anoBase} - Nuvary Invest</title>
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; background: #fff; padding: 24px; }
  .header { border-bottom: 3px solid #1a3a6b; padding-bottom: 12px; margin-bottom: 16px; display: flex; justify-content: space-between; align-items: flex-end; }
  .header h1 { font-size: 18px; font-weight: bold; color: #1a3a6b; }
  .header h2 { font-size: 12px; color: #555; font-weight: normal; margin-top: 2px; }
  .header .meta { text-align: right; font-size: 10px; color: #555; }
  .secao { margin-bottom: 16px; }
  .secao-titulo { background: #1a3a6b; color: #fff; padding: 5px 10px; font-size: 11px; font-weight: bold; margin-bottom: 0; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  td, th { border: 1px solid #ccc; padding: 4px 6px; }
  th { background: #e8edf5; font-weight: bold; font-size: 9px; text-transform: uppercase; }
  .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 0; border: 1px solid #ccc; }
  .info-cell { padding: 6px 10px; border-bottom: 1px solid #eee; }
  .info-cell:nth-child(odd) { border-right: 1px solid #eee; }
  .info-label { font-size: 8px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
  .info-valor { font-size: 12px; font-weight: bold; margin-top: 2px; }
  .resumo-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 8px; margin-bottom: 16px; }
  .resumo-card { border: 1px solid #ccc; padding: 8px 10px; }
  .resumo-label { font-size: 8px; color: #666; text-transform: uppercase; }
  .resumo-valor { font-size: 14px; font-weight: bold; margin-top: 3px; }
  .verde { color: #166534; }
  .vermelho { color: #991b1b; }
  .azul { color: #1a3a6b; }
  .footer { margin-top: 20px; border-top: 1px solid #ccc; padding-top: 10px; font-size: 9px; color: #777; }
  .aviso { margin-top: 12px; background: #fef9c3; border: 1px solid #fde047; padding: 8px 10px; font-size: 9px; }
  @media print {
    body { padding: 12px; }
    .no-print { display: none; }
  }
</style>
</head>
<body>

<div class="header">
  <div>
    <div style="font-size:10px;color:#666;margin-bottom:4px;">INFORME DE RENDIMENTOS</div>
    <h1>Nuvary Invest</h1>
    <h2>Ano-Calendário ${anoBase} | Exercício ${anoBase + 1}</h2>
  </div>
  <div class="meta">
    Emitido em: ${agora.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}<br/>
    Horário: ${agora.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br/>
    Plataforma: Nuvary Invest
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">1. DADOS DO BENEFICIÁRIO</div>
  <div class="info-grid">
    <div class="info-cell">
      <div class="info-label">Nome Completo</div>
      <div class="info-valor">${nomeUsuario.toUpperCase()}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">E-mail</div>
      <div class="info-valor" style="font-size:11px">${emailUsuario}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">CPF</div>
      <div class="info-valor">${cpfFormatado}</div>
    </div>
    <div class="info-cell">
      <div class="info-label">Ano-Calendário</div>
      <div class="info-valor">${anoBase}</div>
    </div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">2. RESUMO PATRIMONIAL</div>
  <div class="resumo-grid" style="margin-top:0;border:1px solid #ccc;display:grid;">
    <div style="border-right:1px solid #ccc;border-bottom:1px solid #ccc;padding:10px">
      <div class="resumo-label">Total Investido (Custo)</div>
      <div class="resumo-valor azul">R$ ${totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div style="border-right:1px solid #ccc;border-bottom:1px solid #ccc;padding:10px">
      <div class="resumo-label">Patrimônio Atual</div>
      <div class="resumo-valor azul">R$ ${totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div style="border-right:1px solid #ccc;border-bottom:1px solid #ccc;padding:10px">
      <div class="resumo-label">Lucro / Prejuízo Estimado</div>
      <div class="resumo-valor ${lucroTotal >= 0 ? 'verde' : 'vermelho'}">${lucroTotal >= 0 ? '+' : ''}R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
    <div style="border-bottom:1px solid #ccc;padding:10px">
      <div class="resumo-label">IR Estimado (15%)</div>
      <div class="resumo-valor ${irEstimado > 0 ? 'vermelho' : ''}">R$ ${irEstimado.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</div>
    </div>
  </div>
</div>

<div class="secao">
  <div class="secao-titulo">3. POSIÇÃO DETALHADA DOS ATIVOS</div>
  <table>
    <thead>
      <tr>
        <th>Ticker</th>
        <th>Nome</th>
        <th>Categoria</th>
        <th style="text-align:right">Custo Total</th>
        <th style="text-align:right">Valor Atual</th>
        <th style="text-align:right">Resultado</th>
        <th style="text-align:center">IR</th>
      </tr>
    </thead>
    <tbody>
      ${linhasAtivos || '<tr><td colspan="7" style="text-align:center;padding:12px;color:#999">Nenhum ativo na carteira</td></tr>'}
    </tbody>
    <tfoot>
      <tr style="font-weight:bold;background:#e8edf5">
        <td colspan="3">TOTAL</td>
        <td style="text-align:right">R$ ${totalCusto.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right">R$ ${totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right;color:${lucroTotal >= 0 ? '#166534' : '#991b1b'}">${lucroTotal >= 0 ? '+' : ''}R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:center">—</td>
      </tr>
    </tfoot>
  </table>
</div>

<div class="secao">
  <div class="secao-titulo">4. RENDIMENTOS ISENTOS E NÃO TRIBUTÁVEIS</div>
  <table>
    <thead>
      <tr>
        <th>Código</th>
        <th>Descrição</th>
        <th style="text-align:right">Valor (estimado)</th>
        <th>Fundamento Legal</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <td>09</td>
        <td>Lucros e Dividendos recebidos (Pessoa Física)</td>
        <td style="text-align:right">Variável</td>
        <td>Art. 10, Lei 9.249/95</td>
      </tr>
      <tr>
        <td>26</td>
        <td>Rendimentos de FIIs — ${assets.filter(a => a.type === 'fiis').length} ativo(s) cadastrado(s)</td>
        <td style="text-align:right">R$ ${grupos['fiis'] ? grupos['fiis'].rendimento.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}</td>
        <td>Art. 3º, Lei 11.033/2004</td>
      </tr>
      <tr>
        <td>12</td>
        <td>Rendimentos LCI / LCA / CRI / CRA</td>
        <td style="text-align:right">Variável</td>
        <td>Art. 3º, Lei 11.033/2004</td>
      </tr>
    </tbody>
  </table>
</div>

<div class="footer">
  <strong>Declarante:</strong> Nuvary Invest — Plataforma educacional de gestão de carteiras de investimentos<br/>
  <strong>Contato:</strong> ${emailUsuario || 'Dados cadastrados na plataforma'}<br/>
  Este informe é gerado com base nos ativos cadastrados na plataforma e tem caráter <strong>demonstrativo</strong>.
</div>

<div class="aviso">
  <strong>⚠ ATENÇÃO:</strong> Este documento é gerado com fins <strong>informativos e educacionais</strong>. Não substitui o Informe de Rendimentos oficial emitido por corretoras e instituições financeiras.
  Para a Declaração de Ajuste Anual, utilize os informes oficiais fornecidos por cada instituição onde você possui investimentos.
</div>

<div class="no-print" style="text-align:center;margin-top:20px;">
  <button onclick="window.print()" style="padding:10px 24px;background:#1a3a6b;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">Imprimir / Salvar PDF</button>
</div>

</body>
</html>`;

    abrirJanelaPDF(html, `Informe de Rendimentos ${anoBase} - Nuvary Invest`);
  }

  // ── Exportar Extratos XLS ─────────────────────────────────────────────────
  function exportarXLS() {
    const cabecalho = ['Data', 'Tipo', 'Ticker', 'Nome', 'Categoria', 'Qtd / R$', 'Preço / Taxa', 'Total'];
    const linhas = transacoesFiltradas.map(t => [
      new Date(t.data).toLocaleDateString('pt-BR'),
      t.tipo,
      t.ativo,
      t.nome,
      t.categoria,
      t.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      t.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
      t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 }),
    ].join('\t'));
    const totalGeral = transacoesFiltradas.reduce((s, t) => s + t.total, 0);
    const totalRow = ['Total', '', '', '', '', '', '', `R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`].join('\t');
    // \uFEFF = BOM UTF-8 para Excel reconhecer acentos corretamente
    const conteudo = '\uFEFF' + [cabecalho.join('\t'), ...linhas, totalRow].join('\n');
    const blob = new Blob([conteudo], { type: 'application/vnd.ms-excel;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'extratos_nuvary.xls';
    a.click();
    URL.revokeObjectURL(url);
  }

  // ── Exportar Extratos PDF ─────────────────────────────────────────────────
  function exportarPDF() {
    const agora = new Date();
    const totalGeral = transacoesFiltradas.reduce((s, t) => s + t.total, 0);
    const linhas = transacoesFiltradas.map(t => `
      <tr>
        <td>${new Date(t.data).toLocaleDateString('pt-BR')}</td>
        <td style="color:${t.tipo === 'Compra' ? '#166534' : '#991b1b'};font-weight:600">${t.tipo}</td>
        <td style="font-weight:700">${t.ativo}</td>
        <td>${t.nome.length > 30 ? t.nome.substring(0, 30) + '…' : t.nome}</td>
        <td>${t.categoria}</td>
        <td style="text-align:right">${t.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right">R$ ${t.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
        <td style="text-align:right;font-weight:600">R$ ${t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
      </tr>`).join('');

    const html = `<!DOCTYPE html><html lang="pt-BR"><head><meta charset="UTF-8"/>
<title>Extratos — Nuvary Invest</title>
<style>
  * { margin:0; padding:0; box-sizing:border-box; }
  body { font-family: Arial, sans-serif; font-size: 11px; color: #000; padding: 24px; }
  .header { display:flex; justify-content:space-between; align-items:flex-end; border-bottom:2px solid #0B1F33; padding-bottom:12px; margin-bottom:16px; }
  .header h1 { font-size:18px; font-weight:bold; color:#0B1F33; }
  .header .meta { font-size:10px; color:#555; text-align:right; }
  table { width:100%; border-collapse:collapse; }
  th { background:#0B1F33; color:#fff; padding:6px 8px; text-align:left; font-size:10px; }
  th:nth-child(n+6) { text-align:right; }
  td { border-bottom:1px solid #e5e7eb; padding:5px 8px; font-size:10px; }
  tr:nth-child(even) td { background:#f9fafb; }
  .total-row td { font-weight:bold; background:#f3f4f6; border-top:2px solid #0B1F33; }
  .footer { margin-top:16px; font-size:9px; color:#777; border-top:1px solid #ccc; padding-top:8px; }
  .no-print { text-align:center; margin-top:20px; }
  @media print { .no-print { display:none; } body { padding:12px; } }
</style></head><body>
<div class="header">
  <div>
    <div style="font-size:10px;color:#666;margin-bottom:4px;">EXTRATO DE TRANSAÇÕES</div>
    <h1>Nuvary Invest</h1>
    <div style="font-size:11px;color:#555;margin-top:2px;">${transacoesFiltradas.length} registro(s) exportados</div>
  </div>
  <div class="meta">
    Emitido em: ${agora.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' })}<br/>
    Horário: ${agora.toLocaleTimeString('pt-BR', { hour:'2-digit', minute:'2-digit' })}
  </div>
</div>
<table>
  <thead><tr>
    <th>Data</th><th>Tipo</th><th>Ticker</th><th>Nome</th><th>Categoria</th>
    <th style="text-align:right">Qtd / R$</th><th style="text-align:right">Preço / Taxa</th><th style="text-align:right">Total</th>
  </tr></thead>
  <tbody>${linhas}</tbody>
  <tfoot><tr class="total-row">
    <td colspan="7">Total geral</td>
    <td style="text-align:right">R$ ${totalGeral.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
  </tr></tfoot>
</table>
<div class="footer">Gerado pela plataforma Nuvary Invest. Documento com fins informativos.</div>
<div class="no-print">
  <button onclick="window.print()" style="padding:10px 24px;background:#0B1F33;color:#fff;border:none;border-radius:6px;cursor:pointer;font-size:13px;">
    Imprimir / Salvar PDF
  </button>
</div>
</body></html>`;

    abrirJanelaPDF(html, 'Extratos — Nuvary Invest');
  }

  // ── Estados de carregamento / vazio ──────────────────────────────────────
  if (authLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <Loader2 className="w-8 h-8 animate-spin" style={{ color: 'var(--cyan)' }} />
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="px-6 lg:px-10 py-6 lg:py-8 max-w-[1400px] mx-auto space-y-4">

        {/* page-head */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
          <h1
            className="flex items-center gap-3 text-[26px] font-bold tracking-tight"
            style={{ color: 'var(--t1)' }}
          >
            <BarChart3 className="w-[26px] h-[26px]" style={{ color: 'var(--cyan)' }} />
            Relatórios
          </h1>
          <p className="text-[13px] mt-1" style={{ color: 'var(--t2)' }}>
            Análises de performance, extratos e imposto de renda
          </p>
        </motion.div>

        {/* report-tabs — pill com fundo surface-2 + tab ativa cyan solid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.05 }}
          className="inline-flex gap-1 p-1 rounded-[var(--r-pill)] mb-2"
          style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
        >
          {([
            { id: 'performance', label: 'Performance',      icon: TrendingUp    },
            { id: 'extratos',    label: 'Extratos',         icon: FileText      },
            { id: 'ir',          label: 'Imposto de Renda', icon: FileBarChart  },
          ] as { id: Aba; label: string; icon: React.ElementType }[]).map(tab => {
            const isActive = aba === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setAba(tab.id)}
                className="inline-flex items-center gap-2 px-[18px] py-2.5 rounded-[var(--r-pill)] text-[13.5px] font-semibold transition-colors"
                style={
                  isActive
                    ? { background: 'var(--cyan)', color: 'white', boxShadow: '0 4px 14px rgba(0,184,217,0.28)' }
                    : { color: 'var(--t2)', background: 'transparent' }
                }
              >
                <tab.icon className="w-[14px] h-[14px]" />
                {tab.label}
              </button>
            );
          })}
        </motion.div>

        {/* Loading */}
        {loadingData && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-7 h-7 animate-spin" style={{ color: 'var(--cyan)' }} />
            <span className="ml-3 text-[13px]" style={{ color: 'var(--t2)' }}>
              Carregando dados da carteira…
            </span>
          </div>
        )}

        {/* Carteira vazia */}
        {!loadingData && assets.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Wallet className="w-14 h-14 mb-4" style={{ color: 'var(--t3)', opacity: 0.4 }} />
            <p className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
              Sua carteira está vazia
            </p>
            <p className="text-[13px] mt-1" style={{ color: 'var(--t2)' }}>
              Adicione ativos na página <strong>Carteira</strong> para ver os relatórios.
            </p>
          </div>
        )}

        {!loadingData && assets.length > 0 && (

        <motion.div key={aba} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>

        {/* ── ABA: PERFORMANCE ─────────────────────────────────────────────── */}
        {aba === 'performance' && (
          <div className="space-y-4">

            {/* perf-chart-card — Evolucao Patrimonial + tabela lateral */}
            <div
              className="rounded-[var(--r-lg)] px-6 py-5"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-5">
                <div>
                  <h2 className="text-[18px] font-bold" style={{ color: 'var(--t1)' }}>
                    Evolução Patrimonial
                  </h2>
                  <p className="text-[13px] mt-0.5" style={{ color: 'var(--t2)' }}>
                    {new Date().toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {(['7D', '7S', '12M', 'ANOS'] as const).map(p => {
                    const isActive = periodoEvolucao === p;
                    return (
                      <button
                        key={p}
                        onClick={() => setPeriodoEvolucao(p)}
                        className="px-3 py-1.5 rounded-[var(--r-pill)] text-[12px] font-semibold transition-colors"
                        style={
                          isActive
                            ? { background: 'var(--cyan)', color: 'white' }
                            : { background: 'var(--surface-2)', color: 'var(--t2)', border: '1px solid var(--border)' }
                        }
                      >
                        {p}
                      </button>
                    );
                  })}
                  <div
                    className="flex rounded-[var(--r-md)] p-0.5 ml-1"
                    style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
                  >
                    <button
                      onClick={() => setTipoGraficoEvolucao('bar')}
                      className="p-1.5 rounded transition-colors"
                      style={
                        tipoGraficoEvolucao === 'bar'
                          ? { background: 'var(--cyan)', color: 'white' }
                          : { color: 'var(--t2)' }
                      }
                      title="Gráfico de barras"
                    >
                      <BarChart3 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setTipoGraficoEvolucao('line')}
                      className="p-1.5 rounded transition-colors"
                      style={
                        tipoGraficoEvolucao === 'line'
                          ? { background: 'var(--cyan)', color: 'white' }
                          : { color: 'var(--t2)' }
                      }
                      title="Gráfico de linha"
                    >
                      <TrendingUp className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_240px] gap-6">
                {/* Grafico */}
                <div className="min-w-0">
                  <ResponsiveContainer width="100%" height={260}>
                    {tipoGraficoEvolucao === 'line' ? (
                      <AreaChart data={evolucaoData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                        <defs>
                          <linearGradient id="evolGrad" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#00B8D9" stopOpacity={0.45} />
                            <stop offset="95%" stopColor="#00B8D9" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} width={60} />
                        <Tooltip
                          formatter={(v: number | undefined) => v != null ? [`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Patrimônio'] : ''}
                          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--t1)' }}
                        />
                        <Area type="monotone" dataKey="valor" stroke="#00B8D9" fill="url(#evolGrad)" strokeWidth={2.5} dot={false} />
                      </AreaChart>
                    ) : (
                      <BarChart data={evolucaoData} margin={{ top: 5, right: 10, bottom: 0, left: 10 }}>
                        <CartesianGrid strokeDasharray="4 4" stroke="rgba(255,255,255,0.04)" />
                        <XAxis dataKey="data" tick={{ fontSize: 10, fill: '#6B7280' }} />
                        <YAxis tick={{ fontSize: 10, fill: '#6B7280' }} tickFormatter={v => `R$ ${(v / 1000).toFixed(0)}k`} width={60} />
                        <Tooltip
                          formatter={(v: number | undefined) => v != null ? [`R$ ${v.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 'Patrimônio'] : ''}
                          contentStyle={{ background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 12, color: 'var(--t1)' }}
                        />
                        <Bar dataKey="valor" fill="#00B8D9" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    ) as React.ReactElement}
                  </ResponsiveContainer>
                </div>

                {/* perf-table — lista de datas + total */}
                <div className="hidden lg:flex flex-col">
                  <div>
                    {[...evolucaoData].slice(-7).reverse().map((d, i) => (
                      <div
                        key={i}
                        className="flex justify-between items-center py-2 text-[13px]"
                        style={{ borderBottom: '1px dashed var(--border)' }}
                      >
                        <span style={{ color: 'var(--t2)' }}>{d.data}</span>
                        <span
                          className="font-medium tabular-nums"
                          style={{ color: 'var(--t1)' }}
                        >
                          R$ {d.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div
                    className="mt-3 pt-3"
                    style={{ borderTop: '1px solid var(--border)' }}
                  >
                    <small className="text-[11px]" style={{ color: 'var(--t2)' }}>
                      Total acumulado da carteira
                    </small>
                    <div
                      className="text-[18px] font-bold tabular-nums mt-0.5"
                      style={{ color: 'var(--cyan)' }}
                    >
                      R$ {totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* perf-kpis — 4 KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {[
                {
                  label: 'Patrimônio Atual',
                  valor: `R$ ${totalAtual.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  sub: `Aportado: R$ ${totalAport.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  tone: 'up' as const,
                  icon: Wallet,
                },
                {
                  label: 'Lucro / Prejuízo',
                  valor: `${lucroTotal >= 0 ? '+' : ''}R$ ${lucroTotal.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
                  sub: lucroTotal >= 0 ? 'Rendimento positivo' : 'Resultado negativo',
                  tone: (lucroTotal >= 0 ? 'up' : 'dn') as 'up' | 'dn',
                  icon: lucroTotal >= 0 ? TrendingUp : TrendingDown,
                },
                {
                  label: 'Rentabilidade Total',
                  valor: `${rentTotal >= 0 ? '+' : ''}${rentTotal.toFixed(2)}%`,
                  sub: 'Desde o primeiro aporte',
                  tone: (rentTotal >= 0 ? 'up' : 'dn') as 'up' | 'dn',
                  icon: rentTotal >= 0 ? ArrowUpRight : ArrowDownRight,
                },
                {
                  label: '% do CDI',
                  valor: vsCDI !== null ? `${vsCDI}%` : '—',
                  sub: cdiAnual ? `CDI atual: ${cdiAnual.toFixed(2)}% a.a.` : 'CDI indisponível',
                  tone: (vsCDI !== null && vsCDI >= 0 ? 'up' : 'dn') as 'up' | 'dn',
                  icon: BarChart3,
                },
              ].map(c => (
                <div
                  key={c.label}
                  className="rounded-[var(--r-lg)] px-5 py-4"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <div className="flex items-center justify-between mb-2.5">
                    <span className="text-[12.5px]" style={{ color: 'var(--t2)' }}>{c.label}</span>
                    <c.icon className="w-4 h-4" style={{ color: 'var(--cyan)' }} />
                  </div>
                  <div
                    className="text-[22px] font-bold tracking-tight tabular-nums"
                    style={{ color: c.tone === 'up' ? 'var(--cyan)' : 'var(--loss)' }}
                  >
                    {c.valor}
                  </div>
                  <div className="text-[11.5px] mt-1" style={{ color: 'var(--t2)' }}>
                    {c.sub}
                  </div>
                </div>
              ))}
            </div>

            {/* perf-bottom — 2 listas lado a lado */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">

              {/* Variacao % por ativo */}
              {variacaoPorAtivo.length > 0 && (
                <div
                  className="rounded-[var(--r-lg)] px-6 py-5"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <h4 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
                    Variação % por Ativo
                  </h4>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--t2)' }}>
                    Retorno desde o preço médio de compra
                  </p>

                  <div className="space-y-1">
                    {(() => {
                      const maxAbs = Math.max(...variacaoPorAtivo.map(e => Math.abs(e.variacao)), 0.01);
                      return variacaoPorAtivo.map((entry, i) => {
                        const isPos = entry.variacao >= 0;
                        const pct = (Math.abs(entry.variacao) / maxAbs) * 48;
                        return (
                          <div
                            key={i}
                            className="grid grid-cols-[60px_1fr_80px] gap-3 items-center py-1.5"
                          >
                            <span
                              className="text-[13px] font-semibold truncate"
                              style={{ color: 'var(--t1)' }}
                            >
                              {entry.nome}
                            </span>
                            <div className="relative h-3 rounded overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                              {isPos ? (
                                <div
                                  className="absolute top-0 bottom-0 rounded"
                                  style={{ left: '50%', width: `${pct}%`, background: 'var(--gain)' }}
                                />
                              ) : (
                                <div
                                  className="absolute top-0 bottom-0 rounded"
                                  style={{ right: '50%', width: `${pct}%`, background: 'var(--loss)' }}
                                />
                              )}
                            </div>
                            <span
                              className="text-[13px] font-semibold tabular-nums text-right"
                              style={{ color: isPos ? 'var(--gain)' : 'var(--loss)' }}
                            >
                              {isPos ? '+' : ''}{entry.variacao.toFixed(2)}%
                            </span>
                          </div>
                        );
                      });
                    })()}
                  </div>
                </div>
              )}

              {/* Rentabilidade por categoria */}
              {rentabilidadePorCategoria.length > 0 && (
                <div
                  className="rounded-[var(--r-lg)] px-6 py-5"
                  style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                >
                  <h4 className="text-[16px] font-semibold" style={{ color: 'var(--t1)' }}>
                    Rentabilidade por Categoria
                  </h4>
                  <p className="text-[12px] mb-4" style={{ color: 'var(--t2)' }}>
                    Média ponderada pelo valor alocado em cada classe
                  </p>

                  <div className="space-y-1">
                    {(() => {
                      const maxAbs = Math.max(...rentabilidadePorCategoria.map(c => Math.abs(c.rentabilidade)), 0.01);
                      return rentabilidadePorCategoria.map((c, i) => {
                        const isPos = c.rentabilidade >= 0;
                        const pct = (Math.abs(c.rentabilidade) / maxAbs) * 48;
                        const cor = isPos ? c.cor : 'var(--loss)';
                        return (
                          <div
                            key={i}
                            className="grid grid-cols-[80px_1fr_80px] gap-3 items-center py-1.5"
                          >
                            <span
                              className="text-[12px] font-medium truncate"
                              style={{ color: 'var(--t1)' }}
                            >
                              {c.categoria}
                            </span>
                            <div className="relative h-3 rounded overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                              {isPos ? (
                                <div
                                  className="absolute top-0 bottom-0 rounded"
                                  style={{ left: '50%', width: `${pct}%`, background: cor }}
                                />
                              ) : (
                                <div
                                  className="absolute top-0 bottom-0 rounded"
                                  style={{ right: '50%', width: `${pct}%`, background: 'var(--loss)' }}
                                />
                              )}
                            </div>
                            <span
                              className="text-[13px] font-semibold tabular-nums text-right"
                              style={{ color: cor }}
                            >
                              {isPos ? '+' : ''}{c.rentabilidade.toFixed(2)}%
                            </span>
                          </div>
                        );
                      });
                    })()}

                    {cdiAnual && (
                      <div
                        className="grid grid-cols-[80px_1fr_80px] gap-3 items-center py-1.5 mt-2 pt-2"
                        style={{ borderTop: '1px solid var(--border)' }}
                      >
                        <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                          CDI (ref.)
                        </span>
                        <div className="relative h-3 rounded overflow-hidden" style={{ background: 'var(--surface-2)' }}>
                          <div
                            className="absolute top-0 bottom-0 rounded"
                            style={{ left: '50%', width: `14%`, background: 'var(--t3)' }}
                          />
                        </div>
                        <span
                          className="text-[13px] font-semibold tabular-nums text-right"
                          style={{ color: 'var(--t2)' }}
                        >
                          {cdiAnual.toFixed(2)}% a.a.
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* ── ABA: EXTRATOS ─────────────────────────────────────────────────── */}
        {aba === 'extratos' && (
          <div className="space-y-4">

            {/* extracts-filters */}
            <div
              className="rounded-[var(--r-lg)] p-3.5 flex flex-wrap gap-3 items-center"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              {/* search-box */}
              <div
                className="flex items-center gap-2 flex-1 min-w-[200px] px-3.5 py-2.5 rounded-[var(--r-md)]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <Search className="w-4 h-4 shrink-0" style={{ color: 'var(--t3)' }} />
                <input
                  type="text"
                  placeholder="Buscar ativo..."
                  value={busca}
                  onChange={e => setBusca(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] outline-none placeholder:opacity-100"
                  style={{ color: 'var(--t1)' }}
                />
              </div>

              {/* select-box: tipo */}
              <div
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--r-md)] min-w-[140px]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <select
                  value={filtroTipo}
                  onChange={e => setFiltroTipo(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] outline-none appearance-none cursor-pointer pr-5"
                  style={{ color: 'var(--t1)' }}
                >
                  {['Todos', 'Compra', 'Venda'].map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--t2)' }} />
              </div>

              {/* select-box: categoria */}
              <div
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--r-md)] min-w-[140px]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <select
                  value={filtroCategoria}
                  onChange={e => setFiltroCategoria(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] outline-none appearance-none cursor-pointer pr-5"
                  style={{ color: 'var(--t1)' }}
                >
                  {['Todas', 'Renda Fixa', 'Ações B3', 'FIIs', 'Internac.'].map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--t2)' }} />
              </div>

              {/* select-box: corretora */}
              <div
                className="relative flex items-center gap-2 px-3.5 py-2.5 rounded-[var(--r-md)] min-w-[140px]"
                style={{ background: 'var(--surface-2)', border: '1px solid var(--border)' }}
              >
                <select
                  value={filtroCorretora}
                  onChange={e => setFiltroCorretora(e.target.value)}
                  className="flex-1 bg-transparent text-[13px] outline-none appearance-none cursor-pointer pr-5"
                  style={{ color: 'var(--t1)' }}
                >
                  {corretoras.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <ChevronDown className="absolute right-3 w-3.5 h-3.5 pointer-events-none" style={{ color: 'var(--t2)' }} />
              </div>

              {/* Exportar (primary) com dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowExportMenu(v => !v)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-[var(--r-sm)] text-[13.5px] font-semibold text-white transition-colors"
                  style={{ background: 'var(--cyan)', boxShadow: '0 4px 14px rgba(0,184,217,0.28)' }}
                >
                  <Download className="w-3.5 h-3.5" />
                  Exportar
                  <ChevronDown className="w-3 h-3" />
                </button>
                {showExportMenu && (
                  <div
                    className="absolute right-0 top-full mt-1 rounded-[var(--r-md)] z-30 min-w-[160px] p-1 overflow-hidden"
                    style={{
                      background: 'var(--surface-2)',
                      border: '1px solid var(--border)',
                      boxShadow: '0 8px 24px rgba(0,0,0,0.35)',
                    }}
                  >
                    {[
                      { label: 'Excel (XLS)', onClick: () => { exportarXLS(); setShowExportMenu(false); } },
                      { label: 'PDF',         onClick: () => { exportarPDF(); setShowExportMenu(false); } },
                    ].map(item => (
                      <button
                        key={item.label}
                        onClick={item.onClick}
                        className="w-full text-left px-3 py-2.5 rounded-[var(--r-sm)] text-[13px] font-medium transition-colors hover:bg-[var(--surface-3)]"
                        style={{ color: 'var(--t1)' }}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* extracts-table */}
            <div
              className="rounded-[var(--r-lg)] overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Data', 'Tipo', 'Ticker', 'Nome', 'Categoria', 'Qtd / R$', 'Preço / Taxa', 'Total'].map((h, i) => (
                        <th
                          key={h}
                          className="text-[11.5px] font-medium uppercase tracking-wider px-[18px] py-4"
                          style={{
                            color: 'var(--t2)',
                            background: 'var(--surface-2)',
                            borderBottom: '1px solid var(--border)',
                            textAlign: i >= 5 ? 'right' : 'left',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {transacoesFiltradas.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-12 text-[13px]" style={{ color: 'var(--t2)' }}>
                          Nenhuma transação encontrada
                        </td>
                      </tr>
                    ) : transacoesFiltradas.map((t) => (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-[var(--glass)]"
                      >
                        <td className="px-[18px] py-3.5 text-[13.5px] tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {new Date(t.data).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-[18px] py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                          {t.tipo === 'Compra' ? (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--r-pill)] text-[12px] font-semibold"
                              style={{ background: 'var(--gain-soft)', color: 'var(--gain)' }}
                            >
                              <ArrowUpRight className="w-3 h-3" />
                              Compra
                            </span>
                          ) : (
                            <span
                              className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--r-pill)] text-[12px] font-semibold"
                              style={{ background: 'var(--loss-soft)', color: 'var(--loss)' }}
                            >
                              <ArrowDownRight className="w-3 h-3" />
                              Venda
                            </span>
                          )}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] font-bold" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {t.ativo}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13px] max-w-[180px] truncate" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--border)' }}>
                          {t.nome}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13px]" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--border)' }}>
                          {t.categoria}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] text-right tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {t.type === 'renda_fixa'
                            ? `R$ ${t.qtd.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                            : t.qtd}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] text-right tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {t.type === 'renda_fixa'
                            ? `${t.preco.toFixed(2)}% a.a.`
                            : `R$ ${t.preco.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`}
                        </td>
                        <td className="px-[18px] py-3.5 text-right" style={{ borderBottom: '1px solid var(--border)' }}>
                          <strong className="text-[13.5px] tabular-nums" style={{ color: 'var(--t1)' }}>
                            R$ {t.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div
                className="px-[18px] py-3 flex items-center justify-between"
                style={{ borderTop: '1px solid var(--border)' }}
              >
                <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                  {transacoesFiltradas.length} registro(s)
                </span>
                <span className="text-[12px]" style={{ color: 'var(--t2)' }}>
                  Total:{' '}
                  <strong className="tabular-nums" style={{ color: 'var(--cyan)' }}>
                    R$ {transacoesFiltradas.reduce((s, t) => s + t.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </strong>
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ── ABA: IMPOSTO DE RENDA ─────────────────────────────────────────── */}
        {aba === 'ir' && (
          <div className="space-y-4">

            {/* tax-summary — 2 cards (primary cyan + neutral) */}
            {(() => {
              const totalVendas = sellTransactions.reduce((s, t) => s + t.total_value, 0);
              const lucroRealizado = sellTransactions.reduce((s, t) => {
                const custo = t.cost_basis ?? 0;
                return s + (t.total_value - custo);
              }, 0);
              const irEstimadoIR = lucroRealizado > 0 ? lucroRealizado * 0.15 : 0;
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Primary (ciano gradient) */}
                  <div
                    className="rounded-[var(--r-lg)] px-6 py-5 relative overflow-hidden"
                    style={{
                      background:
                        'linear-gradient(135deg, rgba(0,184,217,0.10), transparent 60%), var(--surface-1)',
                      border: '1px solid rgba(0,184,217,0.25)',
                    }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[13.5px]" style={{ color: 'var(--t2)' }}>
                        Total em Vendas
                      </span>
                      <div
                        className="w-9 h-9 rounded-[var(--r-md)] grid place-items-center"
                        style={{ background: 'rgba(0,184,217,0.15)', color: 'var(--cyan)' }}
                      >
                        <TrendingUp className="w-[18px] h-[18px]" />
                      </div>
                    </div>
                    <div
                      className="text-[32px] font-extrabold tracking-tight tabular-nums mb-1.5"
                      style={{ color: 'var(--cyan)' }}
                    >
                      R$ {totalVendas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[12px]" style={{ color: 'var(--t2)' }}>
                      Soma do valor recebido nas operações de venda
                    </p>
                  </div>

                  {/* Neutral */}
                  <div
                    className="rounded-[var(--r-lg)] px-6 py-5"
                    style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
                  >
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[13.5px]" style={{ color: 'var(--t2)' }}>
                        IR Estimado (15%)
                      </span>
                      <div
                        className="w-9 h-9 rounded-[var(--r-md)] grid place-items-center"
                        style={{ background: 'var(--surface-2)', color: 'var(--cyan)' }}
                      >
                        <FileBarChart className="w-[18px] h-[18px]" />
                      </div>
                    </div>
                    <div
                      className="text-[32px] font-extrabold tracking-tight tabular-nums mb-1.5"
                      style={{ color: irEstimadoIR > 0 ? 'var(--loss)' : 'var(--t3)' }}
                    >
                      R$ {irEstimadoIR.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </div>
                    <p className="text-[12px]" style={{ color: 'var(--t2)' }}>
                      Estimativa sobre lucro realizado (swing trade)
                    </p>
                  </div>
                </div>
              );
            })()}

            {/* informe-banner */}
            <div
              className="flex items-center gap-4 px-6 py-5 rounded-[var(--r-lg)]"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div
                className="w-[52px] h-[52px] rounded-[var(--r-md)] grid place-items-center shrink-0"
                style={{ background: 'rgba(0,184,217,0.12)', color: 'var(--cyan)' }}
              >
                <FileText className="w-[26px] h-[26px]" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-[15px] font-semibold mb-0.5" style={{ color: 'var(--t1)' }}>
                  Informe de Rendimentos
                </h4>
                <p className="text-[12.5px]" style={{ color: 'var(--t2)' }}>
                  Posição completa da carteira com rendimentos, isenções e base para declaração do IR.
                </p>
              </div>
              <button
                onClick={gerarInformeRendimentos}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-[var(--r-sm)] text-[13.5px] font-semibold text-white transition-colors shrink-0"
                style={{ background: 'var(--cyan)', boxShadow: '0 4px 14px rgba(0,184,217,0.28)' }}
              >
                <Download className="w-4 h-4" />
                Baixar Informe (PDF)
              </button>
            </div>

            {/* Relatório de Vendas (extracts-table) */}
            <div
              className="rounded-[var(--r-lg)] overflow-hidden"
              style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
            >
              <div
                className="px-[22px] py-[18px]"
                style={{ borderBottom: '1px solid var(--border)' }}
              >
                <h4 className="text-[15px] font-semibold" style={{ color: 'var(--t1)' }}>
                  Relatório de Vendas
                </h4>
                <p className="text-[12px] mt-0.5" style={{ color: 'var(--t2)' }}>
                  Histórico de operações de venda registradas na plataforma
                </p>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr>
                      {['Data', 'Ticker', 'Nome', 'Categoria', 'Qtd / R$', 'Preço de Venda', 'Total Recebido'].map((h, i) => (
                        <th
                          key={h}
                          className="text-[11.5px] font-medium uppercase tracking-wider px-[18px] py-4"
                          style={{
                            color: 'var(--t2)',
                            background: 'var(--surface-2)',
                            borderBottom: '1px solid var(--border)',
                            textAlign: i >= 4 ? 'right' : 'left',
                          }}
                        >
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sellTransactions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="text-center py-12 text-[13px]" style={{ color: 'var(--t2)' }}>
                          Nenhuma venda registrada ainda
                        </td>
                      </tr>
                    ) : sellTransactions.map((t) => (
                      <tr
                        key={t.id}
                        className="transition-colors hover:bg-[var(--glass)]"
                      >
                        <td className="px-[18px] py-3.5 text-[13.5px] tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {new Date(t.created_at).toLocaleDateString('pt-BR')}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] font-bold" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {t.ticker}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13px] max-w-[180px] truncate" style={{ color: 'var(--t2)', borderBottom: '1px solid var(--border)' }}>
                          {t.name}
                        </td>
                        <td className="px-[18px] py-3.5" style={{ borderBottom: '1px solid var(--border)' }}>
                          <span
                            className="inline-flex items-center px-2.5 py-0.5 rounded-[var(--r-pill)] text-[11.5px] font-medium"
                            style={{ background: 'var(--surface-2)', color: 'var(--t2)' }}
                          >
                            {TYPE_LABEL[t.asset_type] ?? t.asset_type}
                          </span>
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] text-right tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          {t.quantity.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-[18px] py-3.5 text-[13.5px] text-right tabular-nums" style={{ color: 'var(--t1)', borderBottom: '1px solid var(--border)' }}>
                          R$ {t.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="px-[18px] py-3.5 text-right" style={{ borderBottom: '1px solid var(--border)' }}>
                          <strong className="text-[13.5px] tabular-nums" style={{ color: 'var(--t1)' }}>
                            R$ {t.total_value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  {sellTransactions.length > 0 && (
                    <tfoot>
                      <tr style={{ background: 'var(--surface-2)' }}>
                        <td colSpan={6} className="px-[18px] py-3.5 text-[12.5px]" style={{ color: 'var(--t2)' }}>
                          {sellTransactions.length} operaç{sellTransactions.length === 1 ? 'ão' : 'ões'}
                        </td>
                        <td className="px-[18px] py-3.5 text-right">
                          <strong className="text-[13.5px] font-bold tabular-nums" style={{ color: 'var(--cyan)' }}>
                            R$ {sellTransactions.reduce((s, t) => s + t.total_value, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </strong>
                        </td>
                      </tr>
                    </tfoot>
                  )}
                </table>
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

export default function RelatoriosPage() {
  return <Suspense><RelatoriosContent /></Suspense>;
}
