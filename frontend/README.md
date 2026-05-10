# Nuvary Invest — Frontend

App Next.js 16 da plataforma Nuvary Invest. Stack: Next.js + React 19 + TypeScript + Tailwind v4 + Supabase.

## Desenvolvimento local

```bash
# 1. Instale as dependências
npm install

# 2. Configure as variáveis de ambiente (copie .env.example se houver, ou crie)
# Frontend (.env.local)
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
NEXT_PUBLIC_API_URL=http://localhost:3001/api

# 3. Suba o servidor (porta 3000)
npm run dev
```

O backend Express precisa rodar em paralelo na porta 3001 (`cd ../backend && node src/server.js`).

## Estrutura

| Pasta | Conteúdo |
|---|---|
| `src/app/` | Rotas (App Router): `/dashboard`, `/carteira`, `/relatorios`, `/configuracoes`, `/perfil`, `/trilhas`, etc. |
| `src/app/api/cron/` | Route handlers de cron jobs do Vercel |
| `src/components/` | Componentes React (layout, dashboard, carteira, ui) |
| `src/services/` | Lógica de dados (portfolio, alertas, chat, perfil, email reports) |
| `src/lib/` | Clientes Supabase, templates de e-mail, utilities |
| `src/contexts/` | AuthContext, ThemeContext |
| `src/constants/strings.ts` | Strings centralizadas pt-BR |
| `public/docs-html/` | Documentação técnica HTML servida em `/docs-html/index.html` |

## Deploy no Vercel

O app está hospedado em **nuvary-invest.vercel.app**. Configurações no painel do Vercel:

| Setting | Valor |
|---|---|
| Framework Preset | Next.js (auto-detect) |
| **Root Directory** | **`frontend`** |
| Build Command | auto-detect (`npm run build`) |
| Install Command | auto-detect (`npm install`) |
| Node.js Version | 20.x |

> ⚠️ Por causa do Root Directory `frontend`, o `vercel.json` (que declara o cron) precisa estar dentro de `frontend/` — não na raiz do repo. O da raiz é ignorado.

### Environment Variables (Vercel)

| Variável | Necessária para |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | App + cron |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | App (cliente) |
| `NEXT_PUBLIC_API_URL` | Chamadas ao backend Express |
| `SUPABASE_SERVICE_ROLE_KEY` | Cron de relatórios (bypassa RLS) |
| `RESEND_API_KEY` | Cron de relatórios (envio de e-mail) |
| `CRON_SECRET` | Auth do cron (`Authorization: Bearer ${CRON_SECRET}`) |
| `NEXT_PUBLIC_APP_URL` | URL exibida no botão "Abrir Dashboard" do e-mail |
| `EMAIL_FROM` | Sender (opcional, default `Nuvary Invest <onboarding@resend.dev>`) |

### Cron Jobs ativos

| Path | Schedule | Descrição |
|---|---|---|
| `/api/cron/weekly-report` | `0 11 * * 0` | Domingo 8h BRT — envia resumo semanal por e-mail |

Detalhes: [docs-html/doc31.html](public/docs-html/doc31.html).

## Setup inicial do Supabase

Antes de rodar pela primeira vez, execute no SQL Editor do Supabase (na ordem):

1. `../supabase_setup.sql` — tabelas base (`profiles`, `portfolio_assets`, `chat_historico`, `perfil_investidor`)
2. `../sql/alertas_variacao.sql` — sistema de alertas ≥5%
3. `../sql/avatars_storage.sql` — bucket de fotos de perfil
4. `../sql/email_relatorios_setup.sql` — colunas para o cron de relatório semanal

## Documentação técnica

Servida em `/docs-html/index.html` (em produção: `https://nuvary-invest.vercel.app/docs-html/`). Lista cronológica de todas as versões, com o **Roadmap** ([doc13.html](public/docs-html/doc13.html)) sempre no topo.
