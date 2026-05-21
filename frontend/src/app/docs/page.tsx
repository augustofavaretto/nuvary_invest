import Link from 'next/link';

interface DocItem {
  number: string;
  title: string;
  description: string;
  date: string;
  version: string;
  status: 'Concluído' | 'Substituído' | 'Roadmap';
  gradient: string;
  href: string;
}

const docs: DocItem[] = [
  {
    number: '37',
    title: 'Animações Landing + Chat IA Preview',
    description: '4 efeitos no scroll (reveal, hero animado, CTA pulse, parallax) + seção dedicada com mock animado do Chat IA em loop',
    date: 'Maio 2026',
    version: '4.10.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #4c1d95 0%, #06b6d4 100%)',
    href: '/docs-html/doc37.html'
  },
  {
    number: '36',
    title: 'Premium Gates, Limites Free e Whitelist',
    description: 'Banner global, gates em /configurações e /relatórios, limites do plano free (10 ativos, 10 conversas, só trilhas populares) + whitelist de e-mails com Premium vitalício',
    date: 'Maio 2026',
    version: '4.9.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #06b6d4 100%)',
    href: '/docs-html/doc36.html'
  },
  {
    number: '35',
    title: 'Frontend Público Reescrito',
    description: 'Landing, autenticação e páginas legais com novo design dark + ciano, fontes Manrope + Inter e logos PNG oficiais',
    date: 'Maio 2026',
    version: '4.8.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #020817 0%, #0a1428 60%, #06b6d4 100%)',
    href: '/docs-html/doc35.html'
  },
  {
    number: '34',
    title: 'Dashboard Redesign + IA Contextualizada',
    description: 'Tarefa 6 do briefing rebrand no /dashboard; sugestões da IA usam carteira + extratos; textarea do chat com auto-resize',
    date: 'Maio 2026',
    version: '4.7.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #06b6d4 100%)',
    href: '/docs-html/doc34.html'
  },
  {
    number: '33',
    title: 'Refinamentos UX',
    description: 'Chat IA renovado, configurações simplificadas, AddAssetModal limpo e CPF nos PDFs fiscais',
    date: 'Maio 2026',
    version: '4.6.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
    href: '/docs-html/doc33.html'
  },
  {
    number: '32',
    title: 'Foundation Glass + Bento',
    description: 'Tarefas 1-4 do briefing de rebrand: tokens, fonts, logo, glass primitives e Bento Grid',
    date: 'Maio 2026',
    version: '4.6.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0e7490 0%, #06b6d4 100%)',
    href: '/docs-html/doc32.html'
  },
  {
    number: '31',
    title: 'Relatório Semanal por E-mail',
    description: 'Cron Vercel + Resend para envio automático, idempotência 20h e opt-in via profiles.email_relatorios_ativo',
    date: 'Maio 2026',
    version: '4.5.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0d9488 0%, #14b8a6 100%)',
    href: '/docs-html/doc31.html'
  },
  {
    number: '30',
    title: 'UX, Tema e Avatar',
    description: 'Refinamentos no modal de adicionar ativo, detecção automática do tema e foto de perfil no header',
    date: 'Maio 2026',
    version: '4.5.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #4338ca 0%, #6366f1 100%)',
    href: '/docs-html/doc30.html'
  },
  {
    number: '29',
    title: 'Alertas de Variação & Trilhas Educativas',
    description: 'Tabela alertas_variacao com RLS, baseline_price para evitar falsos alertas, NotificationBell global + 48 vídeos em 8 categorias',
    date: 'Abril 2026',
    version: '4.4.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #f59e0b 0%, #ef4444 100%)',
    href: '/docs-html/doc29.html'
  },
  {
    number: '28',
    title: 'Operações da Carteira',
    description: 'Cálculos de rentabilidade, lucro/prejuízo e todas as operações disponíveis em Minha Carteira',
    date: 'Abril 2026',
    version: '4.3.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
    href: '/docs-html/doc28.html'
  },
  {
    number: '27',
    title: 'Prompt Engineering — Chat IA',
    description: 'Arquitetura completa do sistema de prompts: camadas, dados em tempo real, personalização e parâmetros da API OpenAI',
    date: 'Março 2026',
    version: '4.1.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
    href: '/docs-html/doc27.html'
  },
  {
    number: '26',
    title: 'Deploy Vercel e Autenticação',
    description: 'Migração Railway → Vercel, remoção Google OAuth, correção reset de senha com hard redirect',
    date: 'Março 2026',
    version: '4.0.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 50%, #0066CC 100%)',
    href: '/docs-html/doc26.html'
  },
  {
    number: '25',
    title: 'PDF Fiscal, LGPD e UX Fixes',
    description: 'DARF e informe de rendimentos em PDF, páginas /termos e /privacidade, dark mode no questionário',
    date: 'Março 2026',
    version: '3.9.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #134e4a 0%, #0d9488 100%)',
    href: '/docs-html/doc25.html'
  },
  {
    number: '24',
    title: 'Migração Supabase PostgreSQL',
    description: 'Carteira migrada do localStorage para Supabase, SQLite removido, 4 tabelas com RLS',
    date: 'Março 2026',
    version: '3.8.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1C1C1C 0%, #3ECF8E 100%)',
    href: '/docs-html/doc24.html'
  },
  {
    number: '23',
    title: 'Página Relatórios Completa',
    description: '3 abas: Performance (Recharts), Extratos com filtros, IR com DARF e isenções PF',
    date: 'Março 2026',
    version: '3.7.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #7c3aed 100%)',
    href: '/docs-html/doc23.html'
  },
  {
    number: '22',
    title: 'UX & UI — Sidebar, Perfil e Chat',
    description: 'Sidebar compacta 80px, upload de foto, renomear conversas, página /configuracoes completa',
    date: 'Fevereiro 2026',
    version: '3.6.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #0066CC 100%)',
    href: '/docs-html/doc22.html'
  },
  {
    number: '21',
    title: 'Análise Técnica e Roadmap v4.0',
    description: 'Mapeamento de 14 páginas, identificação de débitos técnicos e roadmap de persistência Supabase',
    date: 'Fevereiro 2026',
    version: '3.5.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #4f46e5 100%)',
    href: '/docs-html/doc21.html'
  },
  {
    number: '20',
    title: 'Trilhas Educacionais e Renda Fixa',
    description: '48 vídeos em 8 categorias, campo taxa % a.a., BCB SGS + Tesouro Direto, cálculo CDI automático',
    date: 'Fevereiro 2026',
    version: '3.4.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #064e3b 0%, #10b981 100%)',
    href: '/docs-html/doc20.html'
  },
  {
    number: '19',
    title: 'Centralização de Strings pt-BR',
    description: 'strings.ts com 7 domínios, 15 componentes refatorados, TypeScript as const zero erros',
    date: 'Fevereiro 2026',
    version: '3.3.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #92400e 0%, #f59e0b 100%)',
    href: '/docs-html/doc19.html'
  },
  {
    number: '18',
    title: 'TradingView Widget e Correções UTF-8',
    description: 'Widget de cotações em tempo real da TradingView e padronização UTF-8 para português brasileiro',
    date: 'Fevereiro 2026',
    version: '3.2.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #2962FF 0%, #1976D2 50%, #0D47A1 100%)',
    href: '/docs-html/doc18.html'
  },
  {
    number: '17',
    title: 'Integração ANBIMA API (Renda Fixa)',
    description: 'Títulos públicos, CRI/CRA e letras financeiras com autenticação OAuth2',
    date: 'Fevereiro 2026',
    version: '3.1.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0066CC 50%, #00B8D9 100%)',
    href: '/docs-html/doc17.html'
  },
  {
    number: '16',
    title: 'Integração Brapi API (B3)',
    description: 'Cotações de ações, FIIs e BDRs da B3 em tempo real com cache',
    date: 'Fevereiro 2026',
    version: '3.0.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #34d399 100%)',
    href: '/docs-html/doc16.html'
  },
  {
    number: '15',
    title: 'Layout Sidebar e Minha Carteira',
    description: 'Portfolio completo com busca automática de preços via Finnhub e Alpha Vantage',
    date: 'Fevereiro 2026',
    version: '2.8.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0B1F33 0%, #1e3a5f 50%, #00B8D9 100%)',
    href: '/docs-html/doc15.html'
  },
  {
    number: '14',
    title: 'Dashboard Principal',
    description: 'Painel completo com dados de mercado em tempo real, notícias financeiras e sugestões de IA',
    date: 'Fevereiro 2026',
    version: '2.5.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #0B1F33 0%, #00B8D9 100%)',
    href: '/docs-html/doc14.html'
  },
  {
    number: '13',
    title: 'Próximos Passos - Roadmap do Projeto',
    description: 'Visão completa de todas as tarefas concluídas, pendentes e melhorias futuras',
    date: 'Fevereiro 2026',
    version: '2.4.0',
    status: 'Roadmap',
    gradient: 'linear-gradient(135deg, #1e1b4b 0%, #6366f1 100%)',
    href: '/docs-html/doc13.html'
  },
  {
    number: '12',
    title: 'Google OAuth e Campos de Cadastro',
    description: 'Autenticação social com Google (removido em v4.0), campos CPF, data de nascimento e telefone',
    date: 'Fevereiro 2026',
    version: '2.3.0',
    status: 'Substituído',
    gradient: 'linear-gradient(135deg, #EA4335 0%, #FBBC05 100%)',
    href: '/docs-html/doc12.html'
  },
  {
    number: '11',
    title: 'Página de Perfil do Usuário',
    description: 'Gerenciamento de dados pessoais, perfil de investidor e configurações de segurança',
    date: 'Janeiro 2026',
    version: '2.2.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)',
    href: '/docs-html/doc11.html'
  },
  {
    number: '10',
    title: 'Chatbot Sidebar e Sistema de Conversas',
    description: 'Interface redesenhada com sidebar lateral, múltiplas conversas e histórico organizado',
    date: 'Janeiro 2026',
    version: '2.1.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #171717 0%, #0066CC 100%)',
    href: '/docs-html/doc10.html'
  },
  {
    number: '09',
    title: 'Integração Supabase',
    description: 'Autenticação, banco de dados PostgreSQL, perfil de investidor e histórico do chat',
    date: 'Janeiro 2026',
    version: '2.0.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1C1C1C 0%, #3ECF8E 100%)',
    href: '/docs-html/doc09.html'
  },
  {
    number: '08',
    title: 'Sistema de Autenticação (Legacy)',
    description: 'Cadastro, login, recuperação de senha com JWT, bcrypt e conformidade LGPD',
    date: 'Janeiro 2026',
    version: '1.7.0',
    status: 'Substituído',
    gradient: 'linear-gradient(135deg, #dc2626 0%, #991b1b 100%)',
    href: '/docs-html/doc08.html'
  },
  {
    number: '07',
    title: 'Chatbot de Investimentos',
    description: 'Assistente Nuvary com OpenAI, contexto de perfil e sugestões personalizadas',
    date: 'Janeiro 2026',
    version: '1.6.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #8b5cf6 0%, #6d28d9 100%)',
    href: '/docs-html/doc07.html'
  },
  {
    number: '06',
    title: 'Frontend Next.js',
    description: 'Interface moderna com React 19, Tailwind CSS v4, shadcn/ui e identidade visual da marca',
    date: 'Janeiro 2026',
    version: '1.5.0',
    status: 'Concluído',
    gradient: 'linear-gradient(180deg, #00B8D9 0%, #007EA7 100%)',
    href: '/docs-html/doc06.html'
  },
  {
    number: '05',
    title: 'Questionário de Perfil de Risco',
    description: '10 perguntas objetivas para classificação de perfil de investidor',
    date: 'Janeiro 2026',
    version: '1.4.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    href: '/docs-html/doc05.html'
  },
  {
    number: '04',
    title: 'Integração OpenAI',
    description: 'IA para análise financeira, assistente virtual e educação sobre investimentos',
    date: 'Janeiro 2026',
    version: '1.3.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)',
    href: '/docs-html/doc04.html'
  },
  {
    number: '03',
    title: 'Integração News API',
    description: 'Notícias globais de 150.000+ fontes: manchetes, busca e categorias',
    date: 'Janeiro 2026',
    version: '1.2.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #7c3aed 0%, #ec4899 100%)',
    href: '/docs-html/doc03.html'
  },
  {
    number: '02',
    title: 'Integração Finnhub API',
    description: 'Nova fonte de dados: cotações real-time, notícias, recomendações e indicadores técnicos',
    date: 'Janeiro 2026',
    version: '1.1.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #1e3a5f 0%, #0d9488 100%)',
    href: '/docs-html/doc02.html'
  },
  {
    number: '01',
    title: 'Estrutura do Backend - Alpha Vantage API',
    description: 'Criação da API Node.js para integração com dados financeiros internacionais',
    date: 'Janeiro 2026',
    version: '1.0.0',
    status: 'Concluído',
    gradient: 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)',
    href: '/docs-html/doc01.html'
  }
];

export default function DocsPage() {
  return (
    <div className="min-h-screen bg-[#f1f5f9]">
      {/* Header */}
      <header className="bg-gradient-to-br from-[#1e1b4b] via-[#4f46e5] to-[#6366f1] text-white py-16 text-center">
        <div className="max-w-[900px] mx-auto px-5">
          <h1 className="text-4xl font-bold mb-2">Nuvary Invest</h1>
          <p className="text-lg opacity-90">Histórico de Documentações do Projeto</p>
          <span className="inline-block bg-[#10b981] text-white px-4 py-1.5 rounded-full text-sm mt-4 font-medium">
            {docs.length} Documentos
          </span>
        </div>
      </header>

      {/* Navigation */}
      <nav className="bg-white py-4 sticky top-0 shadow-md z-50">
        <div className="max-w-[900px] mx-auto px-5">
          <ul className="flex justify-center gap-8 flex-wrap">
            <li>
              <Link href="/" className="text-[#10b981] font-semibold hover:underline">
                ← Voltar ao App
              </Link>
            </li>
            <li>
              <a
                href="/docs-html/index.html"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#6366f1] font-medium hover:underline"
              >
                Ver HTML Original
              </a>
            </li>
          </ul>
        </div>
      </nav>

      {/* Content */}
      <main className="max-w-[900px] mx-auto px-5 py-10">
        <ul className="list-none">
          {docs.map((doc) => (
            <a
              key={doc.number}
              href={doc.href}
              target="_blank"
              rel="noopener noreferrer"
              className="
                bg-white rounded-xl p-6 mb-5 flex items-center gap-5
                shadow-sm hover:shadow-lg hover:-translate-y-1
                transition-all duration-200 no-underline text-inherit
                max-[600px]:flex-col max-[600px]:text-center
              "
            >
              {/* Number Badge */}
              <div
                className="
                  w-[60px] h-[60px] rounded-xl flex items-center justify-center
                  text-2xl font-bold text-white flex-shrink-0
                "
                style={{ background: doc.gradient }}
              >
                {doc.number}
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-[#1e1b4b] text-xl font-semibold mb-1">
                  {doc.title}
                </h3>
                <p className="text-[#64748b] text-sm mb-2">
                  {doc.description}
                </p>
                <span
                  className={`
                    inline-block px-3 py-1 rounded-full text-xs text-white
                    ${doc.status === 'Concluído' ? 'bg-[#10b981]' : doc.status === 'Roadmap' ? 'bg-gradient-to-r from-[#6366f1] to-[#8b5cf6]' : 'bg-[#6B7280]'}
                  `}
                >
                  {doc.status}
                </span>
              </div>

              {/* Date */}
              <div className="text-right text-[#64748b] text-sm max-[600px]:text-center max-[600px]:ml-0 ml-auto">
                {doc.date}
                <br />
                <small>Versão {doc.version}</small>
              </div>
            </a>
          ))}
        </ul>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-[#64748b]">
        <p>Nuvary Invest - Documentação do Projeto</p>
      </footer>
    </div>
  );
}
