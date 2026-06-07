# Nuvary Invest

Plataforma de consultoria de investimentos com assistente IA, voltada ao investidor brasileiro.

**Versão atual:** v4.12.0 — Remoção da feature de Tesouro Direto (API de taxas com problema) + documentação `/docs` organizada por categorias com abas.

---

## Stack

| Camada | Tecnologia |
|---|---|
| **Frontend** | Next.js 16 (App Router) · React 19 · TypeScript 5 · Tailwind v4 (`@theme inline`) |
| **Backend** | Node.js + Express (ESM) — porta 3001 |
| **Banco** | Supabase PostgreSQL (auth + portfólio + chat + perfil + alertas + premium) |
| **Hosting** | Vercel (frontend) + Vercel (backend separado) |
| **Pagamento** | Mercado Pago (subscription recorrente + PIX/Boleto one-time) |
| **E-mail** | Resend + Vercel Cron (relatório diário 8h BRT) |
| **IA** | OpenAI (Chat) |
| **APIs externas** | BCB SGS, Brapi (B3), Finnhub (US), Alpha Vantage (cripto), News API |
| **UI** | lucide-react · Framer Motion · Recharts |

---

## Como rodar localmente

```bash
# Backend (porta 3001)
cd backend
npm install
node src/server.js

# Frontend (porta 3000)
cd frontend
npm install
npm run dev
```

O frontend lê `NEXT_PUBLIC_API_URL=http://localhost:3001/api` para acessar o backend.

---

## Estrutura do projeto

```
nuvary-invest/
├── backend/                     # Express ESM — APIs externas (BCB, Brapi, etc.)
│   └── src/
│       ├── server.js            # Registra todas as rotas
│       └── controllers/         # bcbController, brapiController, etc.
│
├── frontend/                    # Next.js 16 App Router
│   ├── public/
│   │   └── brand/               # Logos oficiais (icon, vertical, horizontal)
│   └── src/
│       ├── app/                 # Rotas
│       │   ├── dashboard/       # Painel principal
│       │   ├── carteira/        # Portfólio
│       │   ├── chat/            # Assistente IA
│       │   ├── relatorios/      # Performance + Extratos + IR
│       │   ├── trilhas/         # Aulas em vídeo
│       │   ├── perfil/          # Dados pessoais + questionário
│       │   ├── configuracoes/   # Theme toggle + premium gates
│       │   ├── premium/         # Página de upgrade (planos + checkout MP)
│       │   ├── docs/            # Histórico de releases (inline)
│       │   └── api/
│       │       ├── cron/weekly-report/    # Vercel Cron diário 8h BRT
│       │       └── email/send-test/       # Diagnóstico manual de e-mail
│       │       # (webhook + cancelamento do Mercado Pago ficam no backend)
│       ├── components/
│       │   ├── layout/          # Sidebar, TopBar, TickerTape, PremiumUpgradeBanner
│       │   ├── dashboard/       # GreetingCard, PatrimonioCard, EvolucaoChart, etc.
│       │   ├── portfolio/      # Donuts, AddAssetModal, SellAssetModal
│       │   └── chat/           # Chatbot, ChatSidebar, QuickActions
│       ├── contexts/           # AuthContext, ThemeContext
│       ├── hooks/              # useDashboardData, usePremium
│       ├── services/           # portfolioService, alertasService, emailReportService, etc.
│       ├── styles/tokens.css   # Tokens unificados Light + Dark
│       └── constants/strings.ts # Strings pt-BR centralizadas
│
├── sql/                         # Migrations Supabase
│   ├── alertas_variacao.sql
│   ├── portfolio_assets_alert_baseline.sql
│   ├── email_relatorios_setup.sql
│   ├── mercadopago_subscriptions_setup.sql
│   └── avatars_storage.sql
│
├── supabase_setup.sql           # Setup inicial (profiles + triggers)
└── manual_marca_nuvaryinvest.md # Identidade visual da marca
```

---

## Tabelas Supabase

| Tabela | Função |
|---|---|
| `profiles` | Perfil básico (nome, e-mail, CPF) + toggles de alertas e e-mail |
| `portfolio_assets` | Carteira do usuário (renda fixa, ações, FIIs, internacional, cripto) |
| `chat_historico` | Histórico de conversas do assistente IA |
| `perfil_investidor` | Resposta do questionário (perfil de risco) |
| `alertas_variacao` | Alertas quando ativo varia ≥5% |
| `portfolio_transactions` | Operações de venda (base para IR) |
| `subscription_payments` | Histórico de pagamentos do Mercado Pago (estado da assinatura fica em colunas de `profiles`) |

Todas com **RLS habilitado** filtrando por `auth.uid()`.

---

## Variáveis de ambiente (Vercel)

### Frontend
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
NEXT_PUBLIC_API_URL=https://nuvary-invest-backend.vercel.app/api
NEXT_PUBLIC_APP_URL=https://nuvary-invest.vercel.app
RESEND_API_KEY=...
EMAIL_FROM=Nuvary Invest <relatorios@seudominio.com>
CRON_SECRET=...
MERCADOPAGO_ACCESS_TOKEN=...
MERCADOPAGO_WEBHOOK_SECRET=...
OPENAI_API_KEY=...
```

### Backend
```
BRAPI_API_TOKEN=...   # token Brapi (brapi.dev) — obrigatório para FIIs; ações funcionam sem
FINNHUB_API_KEY=...
ALPHAVANTAGE_API_KEY=...
NEWS_API_KEY=...
```

---

## Funcionalidades por plano

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

## Histórico de releases

Veja `/docs` no app rodando, ou consulte `frontend/src/app/docs/page.tsx` para a versão de código.

---

## Convenções de código

- **Strings pt-BR** centralizadas em `frontend/src/constants/strings.ts` (`STRINGS.dominio.chave`)
- **Tokens visuais** em `frontend/src/styles/tokens.css` — sempre usar `var(--surface-1)`, `var(--cyan)`, etc.
- **Valores monetários** sempre via `formatCurrency()` ou `formatBRL()` (2 casas decimais)
- **Componentes Premium** usam `usePremium()` para gates; caminho default é redirecionar para `/premium`
- **Commits**: `feat()`, `fix()`, `chore()` com mensagem em português

---

## Licença

Projeto acadêmico — uso interno.
