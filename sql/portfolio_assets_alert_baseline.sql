-- =========================================================================
-- Adiciona coluna alert_baseline_price em portfolio_assets
--
-- Como rodar:
--   1. Supabase Studio → SQL Editor → New query
--   2. Cole este arquivo e execute
--
-- Por que:
--   Antes, alertas de variação ≥5% comparavam currentPrice vs averagePrice
--   (preço de compra do usuário). Isso disparava alertas absurdos quando o
--   usuário cadastrava um preço médio errado (ex: BTC com averagePrice = R$ 1
--   dispara "subiu 3474%" — na verdade é só lucro acumulado).
--
--   Agora a comparação será: currentPrice atual vs alert_baseline_price (o
--   preço da última verificação que disparou alerta ou da primeira leitura).
--   Isso reflete variação de mercado REAL, não lucro da posição.
-- =========================================================================

ALTER TABLE public.portfolio_assets
  ADD COLUMN IF NOT EXISTS alert_baseline_price NUMERIC;
