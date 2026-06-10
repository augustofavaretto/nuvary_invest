-- Adiciona a data de aplicação/compra do ativo, usada para calcular o
-- rendimento acumulado da renda fixa desde a compra real (não a data de
-- cadastro no app). Nullable — ativos antigos caem no created_at como fallback.
ALTER TABLE public.portfolio_assets
  ADD COLUMN IF NOT EXISTS data_aplicacao DATE;
