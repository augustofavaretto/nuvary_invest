# Prompt — Alertas de Variação (Nuvary Invest)

## Contexto do Projeto

A Nuvary Invest é um sistema web de consultoria de investimentos com IA. O projeto usa:

- **Frontend:** Next.js (React 19) + Tailwind CSS v4 + shadcn/ui + Framer Motion
- **Backend:** Express.js serverless no Vercel (`nuvary-invest-backend.vercel.app`)
- **Banco:** Supabase PostgreSQL com Row Level Security (RLS)
- **APIs de cotação:** Brapi (B3), Finnhub (EUA), Alpha Vantage (cripto), BCB SGS (CDI/Selic)
- **Repositório:** `https://github.com/augustofavaretto/nuvary_invest.git`
- **Deploy:** Vercel (frontend + backend serverless)

### Tabelas Supabase existentes

- `portfolio_assets` — posição atual de cada ativo (user_id, ticker, type, quantity, average_price, current_price, total_value, variation)
- `portfolio_transactions` — histórico de vendas
- `profiles` — dados do usuário
- `perfil_investidor` — perfil de risco
- `chat_historico` — mensagens do chat IA

### Mecanismo de preços existente

O `portfolioService.ts` já tem:
- `refreshAllPrices(force)` — atualiza preços de ativos de renda variável, FIIs e internacional
- `fetchAssetPrice(ticker, type)` — busca preço atual via Brapi/Finnhub/Alpha Vantage
- Cache de 15 minutos em localStorage

### Página de configurações existente

A página `/configuracoes` já possui toggles de preferências de notificação e seleção de tema.

---

## Tarefa: Implementar "Alertas de Variação"

Implementar o sistema completo de **alertas de variação** para notificar o usuário quando um ativo da sua carteira variar mais de 5% (para cima ou para baixo) em relação ao preço médio de compra.

### Referência Visual

1. **Toggle na página de configurações** — Card escuro com ícone de gráfico (TrendingUp), texto "Alertas de variação", descrição "Notificação quando um ativo variar mais de 5%", e um toggle on/off
2. **Notificação push** — Exemplo: "Ethereum subiu 5% 📈 — Chegou a R$10.665,03 — há 13m"

---

## Requisitos Funcionais

### 1. Banco de Dados (Supabase)

Criar tabela `alertas_variacao` no Supabase:

```sql
CREATE TABLE alertas_variacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  asset_type VARCHAR(30) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
  variation_pct NUMERIC(8,2) NOT NULL,
  previous_price NUMERIC(18,2) NOT NULL,
  current_price NUMERIC(18,2) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS
ALTER TABLE alertas_variacao ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view own alerts"
  ON alertas_variacao FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update own alerts"
  ON alertas_variacao FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Service can insert alerts"
  ON alertas_variacao FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Índices
CREATE INDEX idx_alertas_user_id ON alertas_variacao(user_id);
CREATE INDEX idx_alertas_created ON alertas_variacao(created_at DESC);
```

Adicionar coluna na tabela `profiles` (se não existir):

```sql
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS alertas_variacao_enabled BOOLEAN DEFAULT TRUE;
```

### 2. Backend — Endpoint de Verificação

Criar `backend/src/controllers/alertasController.js`:

- **`GET /api/alertas/check`** — Chamado pelo frontend a cada refresh de preços. Para cada ativo do usuário:
  1. Buscar preço atual via `fetchAssetPrice` existente
  2. Calcular variação: `((currentPrice - averagePrice) / averagePrice) * 100`
  3. Se `|variação| >= 5%` e não existe alerta duplicado nas últimas 24h para o mesmo ticker+direction → inserir na tabela `alertas_variacao`
  4. Retornar lista de novos alertas criados

- **`GET /api/alertas`** — Listar alertas do usuário (últimos 30 dias, paginado)
- **`PATCH /api/alertas/:id/read`** — Marcar alerta como lido
- **`DELETE /api/alertas/:id`** — Deletar alerta individual

### 3. Frontend — Componentes

#### 3.1. Toggle de Alertas (`/configuracoes`)

Adicionar na página de configurações existente um card com:
- Ícone `TrendingUp` (lucide-react)
- Título: "Alertas de variação"
- Descrição: "Notificação quando um ativo variar mais de 5%"
- Toggle Switch (shadcn/ui) ligado/desligado
- Persiste em `profiles.alertas_variacao_enabled` no Supabase
- Estilo: card com fundo escuro (`bg-slate-800`), texto branco, consistente com o design system existente

#### 3.2. Sino de Notificações no Header (`DashboardHeader`)

Adicionar no header do dashboard (ao lado do toggle de saldo e do menu do usuário):
- Ícone `Bell` (lucide-react)
- Badge com contador de alertas não lidos (círculo vermelho com número)
- Ao clicar: dropdown/popover com lista dos últimos alertas
- Cada item mostra: ícone de seta (↑ verde ou ↓ vermelho), nome do ativo, variação %, preço atual em R$, tempo relativo ("há 5m", "há 2h")
- Botão "Marcar todas como lidas"
- Link "Ver todos" que leva para uma listagem completa

#### 3.3. Toast de Notificação em Tempo Real

Quando um novo alerta é detectado durante o refresh de preços:
- Exibir toast (shadcn/ui `Toaster`) no canto inferior direito
- Formato: "[Nome do Ativo] subiu/caiu X% 📈/📉 — Chegou a R$XX.XXX,XX"
- Auto-dismiss após 8 segundos
- Clicável — leva para a página da carteira

#### 3.4. Integração com `refreshAllPrices`

No `portfolioService.ts`, após o refresh de preços:
1. Verificar se `alertas_variacao_enabled` está ativo para o usuário
2. Para cada ativo atualizado, calcular a variação vs. preço médio
3. Se variação >= 5% (positiva ou negativa):
   - Chamar `POST /api/alertas` para registrar
   - Disparar toast no frontend
   - Incrementar badge do sino

### 4. Lógica Anti-Spam

- Não repetir alerta do mesmo ativo+direção dentro de 24 horas
- Se o ativo já tem alerta não lido do mesmo tipo, não criar novo
- Threshold configurável (começar com 5%, futuramente permitir o usuário escolher)

---

## Arquivos a Criar/Modificar

### Criar:
- `backend/src/controllers/alertasController.js` — Controller com 4 endpoints
- `backend/src/routes/alertas.js` — Rotas Express
- `frontend/src/services/alertasService.ts` — Service com chamadas à API
- `frontend/src/components/dashboard/NotificationBell.tsx` — Sino com dropdown
- `frontend/src/components/dashboard/AlertItem.tsx` — Item individual do alerta

### Modificar:
- `backend/src/app.js` — Registrar rota `/api/alertas`
- `frontend/src/components/dashboard/DashboardHeader.tsx` — Adicionar `<NotificationBell />`
- `frontend/src/pages/configuracoes.tsx` (ou equivalente) — Adicionar toggle de alertas
- `frontend/src/services/portfolioService.ts` — Integrar verificação de alertas no `refreshAllPrices`

---

## Padrões do Projeto (Seguir Obrigatoriamente)

- **Strings em português** — Usar o arquivo `strings.ts` existente. Adicionar novas strings no domínio adequado
- **Supabase RLS** — Toda tabela nova precisa de RLS habilitada com policy por `auth.uid()`
- **Tipos TypeScript** — Criar interface `Alert` com campos tipados
- **Framer Motion** — Animar entrada/saída do dropdown e dos toasts
- **shadcn/ui** — Usar componentes existentes (Switch, Popover, Badge, Toast)
- **Cores** — Seguir o design system: fundo escuro `slate-800/900`, accent `teal/cyan`, texto `white/slate-200`
- **Responsivo** — Dropdown do sino deve funcionar em mobile (slide-out ou bottom sheet)
- **Cache** — Respeitar cache de 15min do refreshAllPrices. Alertas são verificados junto com o refresh, não em polling separado
- **Console.log** — Não adicionar em produção (débito técnico existente)
- **Tratamento de erros** — Try/catch em todas as chamadas, feedback visual ao usuário

---

## Ordem de Implementação Sugerida

1. SQL no Supabase (tabela + RLS + coluna em profiles)
2. Backend: controller + rotas de alertas
3. Frontend: `alertasService.ts`
4. Frontend: `NotificationBell.tsx` + `AlertItem.tsx`
5. Frontend: Integração no `DashboardHeader.tsx`
6. Frontend: Toggle em `/configuracoes`
7. Frontend: Integração com `refreshAllPrices` + toast
8. Testes manuais do fluxo completo

---

## Critérios de Aceite

- [ ] Toggle liga/desliga alertas nas configurações, persiste no Supabase
- [ ] Ao atualizar preços da carteira, se algum ativo variar ≥5%, gera alerta
- [ ] Sino no header mostra badge com contagem de não lidos
- [ ] Dropdown do sino lista alertas com ícone, nome, variação, preço e tempo relativo
- [ ] Toast aparece em tempo real quando novo alerta é gerado
- [ ] Alertas não se repetem para o mesmo ativo+direção em 24h
- [ ] Marcar como lido funciona (individual e "marcar todas")
- [ ] Funciona em mobile (responsivo)
- [ ] RLS ativo — usuário só vê seus próprios alertas
