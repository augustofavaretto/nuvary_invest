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
    description: 'Autenticação social com Google, campos CPF, data de nascimento e telefone com validação',
    date: 'Fevereiro 2026',
    version: '2.3.0',
    status: 'Concluído',
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
    description: 'Assistente IA com OpenAI, contexto de perfil e sugestões personalizadas',
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
