'use client';

import Link from 'next/link';
import { ArrowLeft, BookOpen, Calendar, Sparkles } from 'lucide-react';

interface Release {
  version: string;
  title: string;
  date: string;
  status: 'Atual' | 'Concluído' | 'Roadmap';
  highlights: string[];
}

// Historico narrativo de releases. Cada entrada conta o que mudou
// naquela versao sem depender de HTMLs externos — fonte unica de verdade
// para mudancas relevantes do projeto.
const RELEASES: Release[] = [
  {
    version: '4.5.0',
    title: 'Gates Premium e Banner de Upsell',
    date: 'Maio 2026',
    status: 'Atual',
    highlights: [
      'Banner global de upsell para usuário free no DashboardLayout (dismissível por sessão)',
      'Gates Premium em /configuracoes: toggles de Alertas e Relatórios diários redirecionam para /premium',
      'Gates Premium em /relatorios: botões "Exportar" (Extratos) e "Baixar Informe (PDF)" (IR) com badge "Premium" e redirecionam para /premium',
      'Endpoint POST /api/email/send-test para validar pipeline Resend com diagnóstico detalhado',
      'Botão "Verificar agora" no NotificationBell força refreshAllPrices imediato',
      'NotificationBell roda verificação global de variação em background (5 min) — alertas funcionam em qualquer página',
      'Padronização de valores monetários: sempre 2 casas decimais (R$ 1.234,56)',
    ],
  },
  {
    version: '4.4.0',
    title: 'Rebrand Frontend Completo (8 Fases)',
    date: 'Maio 2026',
    status: 'Concluído',
    highlights: [
      'Sistema de tokens unificado (surface-1/2/3, glass, grad-brand-h, r-md/lg/pill, ease) baseado em "exemplo frontend.html"',
      'Fase 1 — Shell: Sidebar 96px + TopBar 80px + TickerTape custom',
      'Fase 2 — Dashboard: 7 componentes extraídos (Greeting, Patrimonio, Perfil, Evolucao, Alocacao, Mercado, Noticias, ChatPreview)',
      'Fase 3 — Chat IA: brand pill ciano, avatares circulares, quick prompts em pills, botão enviar circular',
      'Fase 4 — Carteira: PatrimonioTotal com gradient + 3 donuts (Classe/Produto/Corretora) com tokens',
      'Fase 5 — Relatórios: 3 abas em pill ciano (Performance, Extratos, IR) com tabela tx-chip',
      'Fase 6 — Trilhas: hero ciano com badge + lesson cards thumb t1-t5 + check verde para vídeos concluídos',
      'Fase 7 — Configurações: theme toggle Light/Dark funcional + premium gates',
      'Fase 8 — Cleanup: removido components/bento, components/glass, preview-redesign, 8 componentes legados (1736 linhas)',
    ],
  },
  {
    version: '4.3.0',
    title: 'Sistema de Alertas e Relatório Diário',
    date: 'Abril–Maio 2026',
    status: 'Concluído',
    highlights: [
      'Tabela alertas_variacao no Supabase com RLS por auth.uid()',
      'Coluna alert_baseline_price em portfolio_assets (corrige falsos alertas de 3000% em cripto)',
      'NotificationBell com Realtime Supabase + polling 30s + custom event window',
      'AlertToastContainer dispara toast quando ativo varia ≥5% (com dedupe 24h e sanity check 50%)',
      'Relatório diário por e-mail via Vercel Cron (0 11 * * * UTC = 8h BRT)',
      'Resend como provedor de e-mail, opt-in via profiles.email_relatorios_ativo',
      'Idempotência de 20h: cron não duplica envio mesmo se rodar 2x no mesmo dia',
    ],
  },
  {
    version: '4.2.0',
    title: 'Integração Mercado Pago Premium',
    date: 'Abril 2026',
    status: 'Concluído',
    highlights: [
      'Planos Mensal (R$ 79,99) e Anual (R$ 849,99) com 11,5% de desconto',
      'Métodos: Cartão (subscription recorrente) + PIX/Boleto (one-time payment)',
      'Webhook /api/webhooks/mercadopago atualiza subscription_state em mercadopago_subscriptions',
      'Hook usePremium centraliza lógica de gates de feature',
      'Páginas /premium, /premium/sucesso, /premium/pendente, /premium/erro',
    ],
  },
  {
    version: '4.1.0',
    title: 'Página Relatórios e PDFs Fiscais',
    date: 'Março 2026',
    status: 'Concluído',
    highlights: [
      '3 abas: Performance (Recharts AreaChart + KPIs + barras divergentes), Extratos (filtros + export XLS/PDF), Imposto de Renda',
      'Geração de DARF e Informe de Rendimentos em PDF via window.open + window.print',
      'CPF do cadastro (profiles.cpf) embutido nos PDFs com formatação XXX.XXX.XXX-XX',
      'Cálculo de IR estimado (15% swing trade) e isenção de FIIs',
    ],
  },
  {
    version: '4.0.0',
    title: 'Migração Vercel + Supabase Completo',
    date: 'Março 2026',
    status: 'Concluído',
    highlights: [
      'Frontend deployado no Vercel (substitui Railway)',
      'Backend Express dedicado em outro projeto Vercel',
      'Carteira migrada do localStorage → Supabase (tabela portfolio_assets com RLS)',
      'SQLite removido (era efêmero no Railway)',
      'Google OAuth removido (foco em e-mail/senha via Supabase Auth)',
      'Hard redirect no reset de senha para evitar loop',
    ],
  },
  {
    version: '3.x',
    title: 'Núcleo Inicial do Projeto',
    date: 'Janeiro–Fevereiro 2026',
    status: 'Concluído',
    highlights: [
      'Dashboard com dados de mercado em tempo real (Brapi B3, Finnhub US, Alpha Vantage cripto)',
      'Chat IA com OpenAI + contexto de perfil de investidor + histórico no Supabase',
      'Trilhas Educativas com 48 vídeos do YouTube em 8 categorias',
      'Questionário de perfil de risco (10 perguntas → Conservador/Moderado/Arrojado)',
      'Integração BCB SGS para Selic, CDI, IPCA, IGP-M consolidados',
      'Tesouro Direto via Portal JSON + CSV fallback',
      'Cálculo automático de taxa CDI: "CDB Inter 120% CDI" → 17,88% a.a.',
      'Centralização de strings pt-BR em constants/strings.ts',
    ],
  },
];

const STATUS_STYLES: Record<Release['status'], { bg: string; color: string; label: string }> = {
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
        <div className="relative z-10 max-w-[900px] mx-auto">
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
          <p className="text-[14px] opacity-90 mt-1">
            Histórico de releases do Nuvary Invest — o que mudou, quando e por quê.
          </p>
        </div>
      </header>

      {/* Releases */}
      <main className="max-w-[900px] mx-auto px-6 lg:px-10 py-10 space-y-4">
        {RELEASES.map((release) => {
          const status = STATUS_STYLES[release.status];
          return (
            <article
              key={release.version}
              className="rounded-[var(--r-lg)] px-7 py-6"
              style={{
                background: 'var(--surface-1)',
                border: '1px solid var(--border)',
              }}
            >
              <div className="flex flex-wrap items-start justify-between gap-3 mb-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h2 className="text-[20px] font-bold tracking-tight" style={{ color: 'var(--t1)' }}>
                      v{release.version}
                    </h2>
                    <span
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-[var(--r-pill)] text-[11px] font-bold uppercase tracking-wider"
                      style={{ background: status.bg, color: status.color }}
                    >
                      {release.status === 'Atual' && <Sparkles className="w-3 h-3" />}
                      {status.label}
                    </span>
                  </div>
                  <p
                    className="text-[15px] font-semibold mt-1"
                    style={{ color: 'var(--t1)' }}
                  >
                    {release.title}
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 text-[12.5px]"
                  style={{ color: 'var(--t2)' }}
                >
                  <Calendar className="w-3.5 h-3.5" style={{ color: 'var(--cyan)' }} />
                  {release.date}
                </span>
              </div>

              <ul className="space-y-1.5">
                {release.highlights.map((h, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-2 text-[13.5px] leading-relaxed"
                    style={{ color: 'var(--t2)' }}
                  >
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full mt-2 shrink-0"
                      style={{ background: 'var(--cyan)' }}
                    />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </article>
          );
        })}
      </main>

      <footer
        className="text-center py-8 text-[12px]"
        style={{ color: 'var(--t3)' }}
      >
        Nuvary Invest — Documentação do projeto
      </footer>
    </div>
  );
}
