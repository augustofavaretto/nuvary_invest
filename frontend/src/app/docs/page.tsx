'use client';

import Link from 'next/link';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Sparkles,
  Lock,
  Bell,
  Mail,
  Palette,
  CreditCard,
  Wallet,
  FileText,
  Brain,
  Database,
} from 'lucide-react';

interface Section {
  id: string;
  version: string;
  title: string;
  date: string;
  status: 'Atual' | 'Concluído' | 'Roadmap';
  icon: React.ElementType;
  overview: string;
  blocks: Block[];
}

interface Block {
  heading: string;
  body: string[];
  steps?: string[];
  files?: string[];
}

const SECTIONS: Section[] = [
  // ─── v4.5 ────────────────────────────────────────────────────────────────────
  {
    id: 'v450',
    version: '4.5.0',
    title: 'Gates Premium e Banner de Upsell',
    date: 'Maio 2026',
    status: 'Atual',
    icon: Lock,
    overview:
      'Conversão do plano Free → Premium. Adiciona banner global de upsell e bloqueia funcionalidades premium em /configurações e /relatórios, sempre redirecionando para a página /premium.',
    blocks: [
      {
        heading: 'Banner global de upsell',
        body: [
          'Faixa horizontal entre o TopBar e o conteúdo da página, visível em todas as rotas autenticadas, apenas para usuários no plano Free.',
          'Visual: gradient ciano translúcido com glow radial, ícone Sparkles em gradient cyan, título "Desbloqueie todo o potencial do Nuvary Invest" e CTA "Fazer upgrade →".',
          'Dismissível via botão X — fica escondido pelo resto da sessão (sessionStorage). Reaparece quando o usuário abre uma nova sessão do navegador.',
          'Ocultado automaticamente em /premium, /login, /cadastro e /questionario para não poluir fluxos sensíveis.',
        ],
        files: ['frontend/src/components/layout/PremiumUpgradeBanner.tsx'],
      },
      {
        heading: 'Gates em /configurações',
        body: [
          'A seção "Funcionalidades Premium" recebe um banner com cadeado convidando o upgrade. Os toggles ganham badge inline "🔒 PREMIUM", opacidade reduzida e estado forçado em OFF.',
        ],
        steps: [
          'Usuário Free clica no toggle de Alertas de Variação ou Relatórios Diários',
          'O handler verifica `isPremium` via hook usePremium()',
          'Se Free → router.push("/premium")',
          'Se Premium → toggle persiste no Supabase (alertas_variacao_enabled / email_relatorios_ativo)',
        ],
        files: ['frontend/src/app/configuracoes/page.tsx', 'frontend/src/hooks/usePremium.ts'],
      },
      {
        heading: 'Gates em /relatórios',
        body: [
          'Botão "Exportar" na aba Extratos e botão "Baixar Informe (PDF)" na aba IR ganham cadeado + badge "Premium" quando o usuário é Free. Clicar redireciona para /premium em vez de disparar o download.',
        ],
        files: ['frontend/src/app/relatorios/page.tsx'],
      },
      {
        heading: 'Diagnóstico do envio de e-mail',
        body: [
          'Endpoint POST /api/email/send-test autentica via session do Supabase e dispara o relatório imediatamente para o e-mail do usuário, retornando JSON detalhado: status do envio, RESEND_ID, ou mensagem de erro específica (RESEND_API_KEY ausente, profile.email vazio, Resend recusou, etc).',
          'Acoplado a um botão "Enviar teste agora" em /configurações (visível apenas para Premium).',
        ],
        files: [
          'frontend/src/app/api/email/send-test/route.ts',
          'frontend/src/app/configuracoes/page.tsx',
        ],
      },
      {
        heading: 'Notificações globais de variação',
        body: [
          'Antes os alertas só rodavam quando o usuário visitava /carteira ou /relatórios (únicos lugares que chamavam refreshAllPrices). Agora o NotificationBell, que vive no layout global, dispara o check em background ao montar e a cada 5 minutos.',
          'Adicionado botão "Verificar agora" no dropdown da campainha, força refreshAllPrices(true) ignorando o cache.',
        ],
        files: [
          'frontend/src/components/dashboard/NotificationBell.tsx',
          'frontend/src/services/alertasService.ts',
        ],
      },
      {
        heading: 'Padronização de valores monetários',
        body: [
          'formatCurrency() agora força minimumFractionDigits: 2 e maximumFractionDigits: 2. Todas as ~36 chamadas toLocaleString("pt-BR", { minimumFractionDigits: 2 }) ganharam também maximumFractionDigits: 2. Adeus aos R$ 23.430,621 e R$ 1.735,633 com 3 casas.',
        ],
        files: [
          'frontend/src/services/portfolioService.ts',
          'frontend/src/app/relatorios/page.tsx',
        ],
      },
    ],
  },

  // ─── v4.4 ────────────────────────────────────────────────────────────────────
  {
    id: 'v440',
    version: '4.4.0',
    title: 'Rebrand Frontend Completo — 8 Fases',
    date: 'Maio 2026',
    status: 'Concluído',
    icon: Palette,
    overview:
      'Reescrita visual de todas as páginas para seguir o mockup "exemplo frontend.html". Sistema de tokens unificado para Light e Dark, novo shell (Sidebar 96px + TopBar 80px + TickerTape custom) e componentes extraídos por área.',
    blocks: [
      {
        heading: 'Fase 0 — Setup de tokens',
        body: [
          'Sistema de tokens em frontend/src/styles/tokens.css: surface-1/2/3, glass, grad-brand-h, cyan, gain/loss/warn (+ versões soft), r-md/lg/pill, ease, sidebar-w (96px), topbar-h (80px). Definidos em :root (Light) e .dark (Dark).',
        ],
        files: ['frontend/src/styles/tokens.css', 'frontend/public/brand/'],
      },
      {
        heading: 'Fase 1 — Shell (Sidebar + TopBar + TickerTape)',
        body: [
          'Sidebar 96px fixa com brand mark + 6 nav items vertical (ícone + label embaixo).',
          'TopBar 80px sticky com slot de notificações (sino) e user pill (avatar + nome + email + dropdown).',
          'TickerTape custom em CSS (keyframes em globals.css devido a bug do Turbopack com style jsx) — substitui o TradingViewTicker.',
        ],
        files: ['frontend/src/components/layout/Sidebar.tsx', 'frontend/src/components/layout/TopBar.tsx', 'frontend/src/components/layout/TickerTape.tsx'],
      },
      {
        heading: 'Fase 2 — Dashboard',
        body: [
          'Dashboard remontado a partir de 7 componentes extraídos: GreetingCard, PatrimonioCard, PerfilCard, EvolucaoChart, AlocacaoDonut, MercadoCard, NoticiasCard, ChatPreviewWidget. Página passou de 510 → 200 linhas montando os blocos.',
        ],
      },
      {
        heading: 'Fase 3 — Chat IA',
        body: [
          'ChatSidebar com brand pill, "Nova conversa" + lixeira separados, busca surface-2, lista agrupada (Hoje/Ontem/Últimos 7/30 dias) com 3-dot menu.',
          'ChatMessage com avatares circulares (branco + logo natural para bot, surface-2 para user).',
          'QuickActions em pills compactas (Meu perfil, Alocação, Insights da carteira, Mercado hoje, Análise, Renda fixa, Ações, Diversificação, Ajuda).',
          'Botão enviar mensagem virou circle ciano com sombra.',
        ],
      },
      {
        heading: 'Fase 4 — Carteira',
        body: [
          'PatrimonioSummaryCard com gradient ciano + glow radial, valor 40px, 3 células surface-2 (Investido, Lucro/Prejuízo, Rentabilidade).',
          'PortfolioByClassCard e PortfolioByBrokerCard usam DonutChart (Recharts) com legenda em rows compactas.',
          'PortfolioByProductCard com pills de filtro (Renda Fixa, Renda Variável, FIIs, Internacional) e cards de ativos com badge de variação.',
        ],
      },
      {
        heading: 'Fase 5 — Relatórios',
        body: [
          '3 abas em pill ciano: Performance (Recharts + 4 KPIs + barras divergentes por ativo e categoria), Extratos (filtros + tabela tx-chip), Imposto de Renda (tax-summary cyan + informe-banner + tabela de vendas).',
        ],
      },
      {
        heading: 'Fase 6 — Trilhas Educativas',
        body: [
          'Hero gradient ciano com badge + h1 grande + CTA branco em pill + dots de carrossel.',
          'Categorias em underline ciano (Jornada, Mais populares, Renda Fixa, Renda Variável, FIIs, Imposto de Renda).',
          'Lesson cards com thumb gradient t1–t5, play overlay com blur, level chip e botão "Marcar concluído" embaixo.',
          'Indicador visual para vídeos concluídos: check verde grande no centro do thumb + overlay escuro + borda verde do card.',
        ],
      },
      {
        heading: 'Fase 7 — Configurações',
        body: [
          'Settings-wrap 760px centralizado. Aparência com grid 2 cols (Claro/Escuro), toggle Light/Dark funcional via ThemeContext que aplica/remove a classe .dark no documentElement.',
          'Funcionalidades Premium com toggles surface-2 (Alertas + Relatórios diários).',
          'Conta e Segurança com row-links para /perfil.',
        ],
      },
      {
        heading: 'Fase 8 — Cleanup pós-rebrand',
        body: [
          'Removidos components/bento, components/glass, app/preview-redesign e 8 componentes legados em components/dashboard (AISuggestionsCard, DashboardHeader, InvestorProfileCard, MarketOverview, NewsWidget, QuickActionsPanel, StockList, TradingViewTicker).',
          'Total: 1736 linhas deletadas, type-check limpo, nenhum import quebrado.',
        ],
      },
    ],
  },

  // ─── v4.3 ────────────────────────────────────────────────────────────────────
  {
    id: 'v430',
    version: '4.3.0',
    title: 'Sistema de Alertas e Relatório Diário por E-mail',
    date: 'Abril–Maio 2026',
    status: 'Concluído',
    icon: Bell,
    overview:
      'Notifica o usuário quando um ativo varia ≥5% e envia um resumo diário da carteira por e-mail. Toda a infraestrutura roda no Vercel (Cron) + Supabase (RLS) + Resend (entrega).',
    blocks: [
      {
        heading: 'Alertas de variação',
        body: [
          'Cada usuário tem uma coluna alert_baseline_price em portfolio_assets que guarda o preço da última verificação. A cada refresh de preços (a cada 15 min, cacheado), o sistema compara o currentPrice com o baseline.',
          'Se |variação| ≥ 5%, insere uma linha em alertas_variacao. Dedupe de 24h por ticker+direção evita spam. Sanity check de 50% descarta variações irreais silenciosamente (proteção contra bug de preço médio cadastrado errado).',
        ],
        steps: [
          'refreshAllPrices() chama checkAlertsForAssets() ao final',
          'Para cada ativo: lê alert_baseline_price atual',
          'Se variação ≥ 5% e < 50% e não há dedupe → INSERT em alertas_variacao + dispatch CustomEvent',
          'Baseline é atualizado para o currentPrice (próxima comparação parte daqui)',
          'NotificationBell escuta o evento + Realtime Supabase + polling 30s, atualiza contador e dropdown',
          'AlertToastContainer escuta o evento e mostra um toast por 8s',
        ],
        files: [
          'frontend/src/services/alertasService.ts',
          'frontend/src/components/dashboard/NotificationBell.tsx',
          'frontend/src/components/dashboard/AlertToastContainer.tsx',
          'sql/alertas_variacao.sql',
          'sql/portfolio_assets_alert_baseline.sql',
        ],
      },
      {
        heading: 'Relatório diário por e-mail',
        body: [
          'Vercel Cron dispara GET /api/cron/weekly-report todos os dias às 11h UTC (8h BRT). O endpoint consulta profiles.email_relatorios_ativo = true e envia via Resend para cada candidato.',
          'Idempotência de 20h em profiles.email_relatorios_ultimo_envio — se o cron rodar 2x no mesmo dia, o segundo envio é skipado.',
        ],
        steps: [
          'Vercel Cron → GET /api/cron/weekly-report (com Bearer CRON_SECRET)',
          'Endpoint consulta profiles com email_relatorios_ativo = true',
          'Para cada usuário: monta dados (portfolio, alertas semana, variação) e renderiza HTML do template',
          'Envia via Resend com from = EMAIL_FROM',
          'Atualiza email_relatorios_ultimo_envio para now()',
        ],
        files: [
          'frontend/src/app/api/cron/weekly-report/route.ts',
          'frontend/src/lib/email-templates/weekly-report.ts',
          'frontend/vercel.json',
          'sql/email_relatorios_setup.sql',
        ],
      },
    ],
  },

  // ─── v4.2 ────────────────────────────────────────────────────────────────────
  {
    id: 'v420',
    version: '4.2.0',
    title: 'Integração Mercado Pago — Premium',
    date: 'Abril 2026',
    status: 'Concluído',
    icon: CreditCard,
    overview:
      'Monetização via Mercado Pago. Planos Mensal (R$ 79,99) e Anual (R$ 849,99) com 11,5% de desconto. Suporta cartão (subscription recorrente), PIX e Boleto (one-time payment).',
    blocks: [
      {
        heading: 'Fluxo de assinatura',
        body: [
          'Página /premium tem 2 colunas: comparação Free vs Premium e seletor de plano + método.',
          'Cartão → createCreditCardSubscription() chama POST /api/mercadopago/subscription que cria uma Preapproval no MP. Usuário é redirecionado para o init_point.',
          'PIX/Boleto → createOneTimePayment() chama POST /api/mercadopago/preference que cria uma Preference. Mesmo redirect.',
        ],
        files: [
          'frontend/src/app/premium/page.tsx',
          'frontend/src/services/premiumService.ts',
          'frontend/src/app/api/mercadopago/subscription/route.ts',
          'frontend/src/app/api/mercadopago/preference/route.ts',
        ],
      },
      {
        heading: 'Webhook + atualização de status',
        body: [
          'POST /api/webhooks/mercadopago recebe notificação (assinada por MP_WEBHOOK_SECRET), busca dados do recurso na API do MP e faz upsert em mercadopago_subscriptions.',
          'Hook usePremium() lê essa tabela via getSubscriptionState() e expõe isPremium para todos os gates.',
        ],
        files: [
          'frontend/src/app/api/webhooks/mercadopago/route.ts',
          'frontend/src/hooks/usePremium.ts',
          'sql/mercadopago_subscriptions_setup.sql',
        ],
      },
      {
        heading: 'Páginas de retorno',
        body: [
          '/premium/sucesso, /premium/pendente e /premium/erro recebem o callback do MP e mostram o estado apropriado.',
        ],
      },
    ],
  },

  // ─── v4.1 ────────────────────────────────────────────────────────────────────
  {
    id: 'v410',
    version: '4.1.0',
    title: 'Página Relatórios e PDFs Fiscais',
    date: 'Março 2026',
    status: 'Concluído',
    icon: FileText,
    overview:
      'Aba Relatórios com 3 sub-páginas: Performance (gráficos), Extratos (operações com filtros) e Imposto de Renda (DARF + Informe). Exports em XLS e PDF.',
    blocks: [
      {
        heading: 'Performance',
        body: [
          'Recharts AreaChart de Evolução Patrimonial com seletor de período (7D/7S/12M/Anos) e toggle linha/barra.',
          'Lista lateral com últimos 7 valores diários e total acumulado em ciano.',
          '4 KPIs (Patrimônio Atual, Lucro/Prejuízo, Rentabilidade Total, % do CDI) com ícone ciano.',
          'Duas listas com barras divergentes: Variação % por Ativo e Rentabilidade por Categoria (com CDI como referência).',
        ],
      },
      {
        heading: 'Extratos',
        body: [
          'Filtros surface-2: busca por ticker/nome + selects Tipo (Compra/Venda) + Categoria + Corretora.',
          'Tabela com tx-chip verde (compra) e vermelho (venda), formato Data, Tipo, Ticker, Nome, Categoria, Qtd/R$, Preço/Taxa, Total.',
          'Botão Exportar com dropdown XLS / PDF.',
        ],
      },
      {
        heading: 'Imposto de Renda',
        body: [
          'tax-summary com 2 cards: Total em Vendas (gradient cyan) e IR Estimado 15% (cinza quando zero).',
          'informe-banner com botão "Baixar Informe (PDF)" — gera HTML formatado em window.open + window.print.',
          'Tabela de vendas com agrupamento por categoria.',
          'DARF e Informe usam profile.cpf formatado como XXX.XXX.XXX-XX.',
        ],
      },
    ],
  },

  // ─── v4.0 ────────────────────────────────────────────────────────────────────
  {
    id: 'v400',
    version: '4.0.0',
    title: 'Migração Vercel + Supabase Completo',
    date: 'Março 2026',
    status: 'Concluído',
    icon: Database,
    overview:
      'Saída de Railway/SQLite para Vercel/Supabase. Frontend e backend deployados em projetos Vercel separados. Toda persistência migrada para PostgreSQL com RLS.',
    blocks: [
      {
        heading: 'Migração de infraestrutura',
        body: [
          'Frontend e backend Express movidos para Vercel (projetos separados). SQLite removido (era efêmero no Railway). NEXT_PUBLIC_API_URL aponta para o backend Vercel.',
        ],
      },
      {
        heading: 'Carteira migrada para Supabase',
        body: [
          'Tabela portfolio_assets criada. Função migrateLocalStorageToSupabase() roda na primeira carga de /carteira e transfere ativos do localStorage para o Supabase, depois marca uma flag para não rodar de novo.',
          'Tipos isFixedIncome (renda_fixa, tesouro): quantity = R$ investido, averagePrice = taxa % a.a.',
        ],
        files: ['frontend/src/services/portfolioService.ts'],
      },
      {
        heading: 'Outras mudanças',
        body: [
          'Google OAuth removido — foco em e-mail/senha via Supabase Auth (mais previsível, sem dependência externa).',
          'Reset de senha: hard redirect via window.location.href = "/" para evitar loop de sessão expirada.',
        ],
      },
    ],
  },

  // ─── v3.x ────────────────────────────────────────────────────────────────────
  {
    id: 'v3x',
    version: '3.x',
    title: 'Núcleo Inicial do Projeto',
    date: 'Janeiro–Fevereiro 2026',
    status: 'Concluído',
    icon: Brain,
    overview:
      'Construção do produto: dashboard com mercado em tempo real, Chat IA com OpenAI, carteira, trilhas educativas, questionário de perfil e integrações com BCB, Brapi, Finnhub e Alpha Vantage.',
    blocks: [
      {
        heading: 'Dashboard e mercado',
        body: [
          'Cards de patrimônio, perfil de risco, evolução, alocação por classe, mercado em tempo real (5 ações US) e notícias.',
          'Integrações backend: BCB SGS (Selic, CDI, IPCA, IGP-M), Tesouro Direto (Portal JSON + CSV fallback), Brapi (B3), Finnhub (US), Alpha Vantage (cripto), News API.',
        ],
      },
      {
        heading: 'Chat IA',
        body: [
          'Assistente com OpenAI alimentado por contexto: perfil de investidor + carteira atual + últimas transações.',
          'Histórico no Supabase (tabela chat_historico) com múltiplas conversas, renomear (localStorage), deletar e busca.',
        ],
      },
      {
        heading: 'Trilhas Educativas',
        body: [
          '48 vídeos do YouTube em 8 categorias (Jornada, Populares, Renda Fixa, Renda Variável, FIIs, Cripto, Análise, IR).',
          'Hero carousel automático, navegação por categoria, modal player com iframe YouTube, marcação de concluído por usuário.',
        ],
      },
      {
        heading: 'Carteira e renda fixa',
        body: [
          'Modal AddAssetModal suporta 5 categorias (renda fixa, ações, FIIs, internacional, cripto).',
          'Cálculo automático de taxa CDI: regex (\\d+%\\s*CDI) extrai percentual e multiplica pelo CDI do BCB. Ex: "CDB Inter 120% CDI" + CDI 14,90% = 17,88% a.a.',
        ],
        files: [
          'frontend/src/components/portfolio/AddAssetModal.tsx',
          'frontend/src/services/portfolioService.ts',
        ],
      },
      {
        heading: 'Outros',
        body: [
          'Questionário de perfil de risco (10 perguntas → Conservador / Moderado / Arrojado).',
          'Strings pt-BR centralizadas em frontend/src/constants/strings.ts (objeto STRINGS com domínios: carteira, dashboard, trilhas, nav, perfil, auth, common).',
        ],
      },
    ],
  },
];

const STATUS_STYLES: Record<Section['status'], { bg: string; color: string; label: string }> = {
  Atual: { bg: 'var(--cyan)', color: 'white', label: 'Versão atual' },
  Concluído: { bg: 'rgba(16,185,129,0.15)', color: 'var(--gain)', label: 'Concluído' },
  Roadmap: { bg: 'rgba(245,158,11,0.15)', color: 'var(--warn)', label: 'Roadmap' },
};

export default function DocsPage() {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Header */}
      <header
        className="relative overflow-hidden px-6 lg:px-10 py-14"
        style={{ background: 'var(--grad-brand-h)', color: 'white' }}
      >
        <div
          aria-hidden
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(circle at 80% 20%, rgba(255,255,255,0.15), transparent 50%), radial-gradient(circle at 20% 80%, rgba(11,31,51,0.4), transparent 50%)',
          }}
        />
        <div className="relative z-10 max-w-[1200px] mx-auto">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-[13px] font-medium opacity-90 hover:opacity-100 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Voltar ao app
          </Link>
          <h1 className="flex items-center gap-3 text-[34px] font-extrabold tracking-tight">
            <BookOpen className="w-8 h-8" />
            Documentação
          </h1>
          <p className="text-[14px] opacity-90 mt-1 max-w-[640px]">
            Histórico de releases do Nuvary Invest, explicando passo a passo o que mudou, como
            funciona e onde está no código.
          </p>
        </div>
      </header>

      <div className="max-w-[1200px] mx-auto px-6 lg:px-10 py-10 grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-8">
        {/* TOC lateral (sticky em desktop) */}
        <aside className="lg:sticky lg:top-6 self-start">
          <div
            className="rounded-[var(--r-lg)] p-4"
            style={{ background: 'var(--surface-1)', border: '1px solid var(--border)' }}
          >
            <h3
              className="text-[11px] font-bold uppercase tracking-[0.08em] mb-3"
              style={{ color: 'var(--t3)' }}
            >
              Releases
            </h3>
            <nav className="flex flex-col gap-1">
              {SECTIONS.map((s) => (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  className="flex items-center justify-between px-2 py-1.5 rounded-[var(--r-sm)] text-[13px] font-medium transition-colors hover:bg-[var(--glass)]"
                  style={{ color: 'var(--t2)' }}
                >
                  <span>v{s.version}</span>
                  {s.status === 'Atual' && (
                    <span
                      className="w-1.5 h-1.5 rounded-full"
                      style={{ background: 'var(--cyan)' }}
                    />
                  )}
                </a>
              ))}
            </nav>
          </div>
        </aside>

        {/* Conteúdo das seções */}
        <main className="space-y-6 min-w-0">
          {SECTIONS.map((section) => {
            const status = STATUS_STYLES[section.status];
            const Icon = section.icon;
            return (
              <section
                key={section.id}
                id={section.id}
                className="rounded-[var(--r-lg)] px-7 py-7 scroll-mt-6"
                style={{
                  background: 'var(--surface-1)',
                  border: '1px solid var(--border)',
                }}
              >
                {/* Cabeçalho da seção */}
                <header className="flex items-start gap-4 mb-5 pb-5" style={{ borderBottom: '1px solid var(--border)' }}>
                  <div
                    className="w-12 h-12 rounded-[var(--r-md)] grid place-items-center shrink-0"
                    style={{ background: 'rgba(0,184,217,0.15)', color: 'var(--cyan)' }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h2 className="text-[22px] font-extrabold tracking-tight" style={{ color: 'var(--t1)' }}>
                        v{section.version}
                      </h2>
                      <span
                        className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider"
                        style={{ background: status.bg, color: status.color }}
                      >
                        {section.status === 'Atual' && <Sparkles className="w-3 h-3" />}
                        {status.label}
                      </span>
                      <span
                        className="inline-flex items-center gap-1.5 text-[12.5px] ml-auto"
                        style={{ color: 'var(--t2)' }}
                      >
                        <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                        {section.date}
                      </span>
                    </div>
                    <h3
                      className="text-[18px] font-bold mt-1.5"
                      style={{ color: 'var(--t1)' }}
                    >
                      {section.title}
                    </h3>
                    <p className="text-[13.5px] mt-2 leading-relaxed" style={{ color: 'var(--t2)' }}>
                      {section.overview}
                    </p>
                  </div>
                </header>

                {/* Blocos do release */}
                <div className="space-y-6">
                  {section.blocks.map((block, i) => (
                    <article key={i}>
                      <h4
                        className="text-[15px] font-bold mb-2.5 flex items-center gap-2"
                        style={{ color: 'var(--t1)' }}
                      >
                        <span
                          className="w-1 h-5 rounded-sm"
                          style={{ background: 'var(--cyan)' }}
                        />
                        {block.heading}
                      </h4>

                      {/* Parágrafos */}
                      <div className="space-y-2 mb-3">
                        {block.body.map((p, j) => (
                          <p
                            key={j}
                            className="text-[13.5px] leading-relaxed"
                            style={{ color: 'var(--t2)' }}
                          >
                            {p}
                          </p>
                        ))}
                      </div>

                      {/* Passo a passo (quando aplicável) */}
                      {block.steps && (
                        <ol
                          className="rounded-[var(--r-md)] px-4 py-3 mb-3 space-y-1.5"
                          style={{
                            background: 'var(--surface-2)',
                            border: '1px solid var(--border)',
                          }}
                        >
                          {block.steps.map((step, k) => (
                            <li key={k} className="flex gap-3 text-[13px] leading-relaxed">
                              <span
                                className="flex-shrink-0 w-5 h-5 rounded-full grid place-items-center text-[11px] font-bold mt-0.5"
                                style={{
                                  background: 'rgba(0,184,217,0.15)',
                                  color: 'var(--cyan)',
                                }}
                              >
                                {k + 1}
                              </span>
                              <span style={{ color: 'var(--t1)' }}>{step}</span>
                            </li>
                          ))}
                        </ol>
                      )}

                      {/* Arquivos relacionados */}
                      {block.files && block.files.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {block.files.map((f, m) => (
                            <code
                              key={m}
                              className="inline-block px-2 py-1 rounded text-[11.5px] font-mono"
                              style={{
                                background: 'var(--glass)',
                                color: 'var(--t2)',
                                border: '1px solid var(--border)',
                              }}
                            >
                              {f}
                            </code>
                          ))}
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              </section>
            );
          })}
        </main>
      </div>

      <footer
        className="text-center py-8 text-[12px]"
        style={{ color: 'var(--t3)' }}
      >
        Nuvary Invest — Documentação do projeto
      </footer>
    </div>
  );
}
