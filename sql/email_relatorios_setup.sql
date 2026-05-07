-- =========================================================================
-- Setup do envio semanal de relatórios por e-mail
--
-- Como rodar:
--   1. Abra o Supabase Studio do projeto
--   2. SQL Editor → New query
--   3. Cole este arquivo inteiro e execute
--
-- O que faz:
--   - Adiciona em profiles a flag de opt-in e o timestamp do último envio
--   - Cria índice para a query do cron (usuários com flag ativa)
-- =========================================================================

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email_relatorios_ativo BOOLEAN NOT NULL DEFAULT FALSE,
  ADD COLUMN IF NOT EXISTS email_relatorios_ultimo_envio TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS profiles_email_relatorios_ativo_idx
  ON public.profiles (email_relatorios_ativo)
  WHERE email_relatorios_ativo = TRUE;
