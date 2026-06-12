# Nuvary Invest

Plataforma de consultoria de investimentos com assistente de IA, voltada ao investidor brasileiro.

---

## Visão Geral

A Nuvary Invest reúne em um só lugar o acompanhamento de carteira, educação financeira e consultoria assistida por inteligência artificial. O usuário cadastra seus ativos (renda fixa, ações da B3, FIIs, internacional e criptomoedas), responde a um questionário de perfil de investidor e passa a contar com um dashboard consolidado, relatórios, alertas de variação e um chat de IA com contexto da carteira real e de indicadores de mercado em tempo real (Selic, CDI, IPCA, IGP-M).

O projeto é dividido em duas aplicações independentes:

- **Frontend** — Next.js (App Router), responsável pela interface, autenticação e acesso direto ao Supabase.
- **Backend** — API Express que centraliza as integrações externas (cotações, indicadores, IA e pagamentos).

---

## Funcionalidades

- **Dashboard** — patrimônio consolidado, evolução, alocação por classe, notícias e mercado em tempo real
- **Minha Carteira** — cadastro e venda de ativos com preços atualizados por APIs de mercado
- **Chat IA** — assistente de investimentos com contexto do perfil, da carteira e de indicadores do BCB
- **Questionário de Perfil** — classificação em Conservador, Moderado, Arrojado ou Agressivo
- **Relatórios** — performance, extratos (XLS/PDF) e Informe de Rendimentos (PDF)
- **Trilhas Educativas** — aulas em vídeo organizadas por categoria
- **Alertas de variação** — notificação quando um ativo varia ≥5%
- **Relatório diário por e-mail** — enviado via cron (Gmail SMTP)
- **Plano Premium** — assinatura via Mercado Pago (cartão recorrente, PIX ou boleto)

### Funcionalidades por plano

| Recurso | Free | Premium |
|---|:---:|:---:|
| Dashboard + carteira | ✅ | ✅ |
| Chat IA (limitado) | ✅ | ✅ ilimitado |
| Trilhas educativas | ✅ | ✅ |
| Relatórios on-screen | ✅ | ✅ |
| Alertas de variação ≥5% | 🔒 | ✅ |
| Relatório diário por e-mail | 🔒 | ✅ |
| Exportar extratos (XLS/PDF) | 🔒 | ✅ |
| Baixar Informe IR (PDF) | 🔒 | ✅ |
| Suporte 24h | ❌ | ✅ |

---

## Tecnologias Utilizadas

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind CSS v4 |
| **Backend** | Node.js + Express (ESM) — porta 3001 |
| **Banco de dados** | Supabase PostgreSQL (auth, portfólio, chat, perfil, alertas, premium) com RLS |
| **IA** | OpenAI (chat e sugestões de investimento) |
| **Pagamentos** | Mercado Pago (assinatura recorrente + PIX/Boleto) |
| **E-mail** | Gmail SMTP (nodemailer) + Vercel Cron (relatório diário) |
| **APIs de mercado** | BCB SGS (indicadores) · Brapi (B3) · Finnhub (EUA) · CoinGecko (cripto) · News API |
| **UI** | lucide-react · Framer Motion · Recharts · shadcn/ui |

---

## Estrutura do Projeto

```
nuvary_invest/
├── backend/                       # API Express (ESM)
│   ├── api/index.js               # Entry point serverless (Vercel)
│   └── src/
│       ├── app.js                 # Registro de middlewares e rotas
│       ├── server.js              # Servidor local (porta 3001)
│       ├── config/                # Variáveis de ambiente centralizadas
│       ├── routes/                # ai, bcb, brapi, crypto, finnhub, news, riskProfile, mercadopago
│       ├── controllers/           # Lógica de cada rota
│       ├── services/              # Integrações (OpenAI, Finnhub, CoinGecko, News API, Mercado Pago)
│       ├── middleware/            # errorHandler, rateLimiter
│       ├── lib/                   # Cliente Supabase service-role
│       └── data/                  # Questionário de perfil de investidor
│
└── frontend/                      # Next.js 16 App Router
    ├── public/brand/              # Logos oficiais
    └── src/
        ├── app/                   # Rotas (dashboard, carteira, chat, relatorios, trilhas,
        │   │                      #   perfil, configuracoes, suporte, premium, auth, legais)
        │   └── api/               # Route handlers: cron do relatório diário + teste de e-mail
        ├── components/            # layout, dashboard, portfolio, chat, questionnaire, ui
        ├── contexts/              # AuthContext, ThemeContext
        ├── hooks/                 # useDashboardData, usePremium
        ├── services/              # portfolioService, chatService, alertasService, etc.
        ├── lib/                   # format, evolucao, cpf, e-mail, supabase
        ├── styles/tokens.css      # Design tokens (dark/light)
        └── constants/strings.ts   # Strings pt-BR centralizadas
```

### Tabelas Supabase

| Tabela | Função |
|---|---|
| `profiles` | Perfil básico (nome, e-mail, CPF) + status da assinatura + toggles |
| `portfolio_assets` | Carteira do usuário |
| `portfolio_transactions` | Operações de venda (base para IR) |
| `chat_historico` | Histórico de conversas do assistente IA |
| `perfil_investidor` | Resultado do questionário de perfil de risco |
| `alertas_variacao` | Alertas de variação ≥5% |
| `subscription_payments` | Histórico de pagamentos do Mercado Pago |

Todas com **RLS habilitado** filtrando por `auth.uid()`.

---

## Instalação

Pré-requisitos: Node.js 20+ e um projeto Supabase configurado.

```bash
# Clonar o repositório
git clone https://github.com/augustofavaretto/nuvary_invest.git
cd nuvary_invest

# Backend (porta 3001)
cd backend
npm install
cp .env.example .env   # preencher as chaves
npm run dev

# Frontend (porta 3000) — em outro terminal
cd frontend
npm install
npm run dev
```

O frontend lê `NEXT_PUBLIC_API_URL=http://localhost:3001/api` para acessar o backend.

### Variáveis de ambiente

Os valores abaixo são para **desenvolvimento local**. Em produção, troque as URLs pelas dos deploys na Vercel (ver seção Deploy).

**Frontend**
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api   # produção: https://<backend>.vercel.app/api
NEXT_PUBLIC_APP_URL=http://localhost:3000       # produção: https://<frontend>.vercel.app
GMAIL_USER=...            # conta Gmail usada para enviar os relatórios
GMAIL_APP_PASSWORD=...    # App Password de 16 dígitos
CRON_SECRET=...
```

**Backend** — ver `backend/.env.example` (Finnhub, News API, OpenAI, Brapi, Mercado Pago e Supabase).

---

## Deploy

O projeto é hospedado na **Vercel** em dois deploys independentes:

1. **Backend** — projeto Vercel apontando para `backend/` (entry serverless em `backend/api/index.js`).
2. **Frontend** — projeto Vercel apontando para `frontend/`, com as variáveis de ambiente configuradas e o cron do relatório diário habilitado.

Após o deploy, configurar:
- `NEXT_PUBLIC_API_URL` do frontend apontando para a URL pública do backend.
- Webhook do Mercado Pago apontando para `<backend>/api/mercadopago/webhook`.

---

## Equipe

| Integrante | Papel |
|---|---|
| Augusto Favaretto | Desenvolvimento |
| Vitor Girardi | Desenvolvimento |

---

## Licença

Projeto acadêmico (TCC) — uso educacional. Todos os direitos reservados aos autores.
