-- =========================================================================
-- Setup do schema para assinaturas Mercado Pago (Premium)
--
-- Como rodar:
--   1. Supabase Studio → SQL Editor → New query
--   2. Cole este arquivo inteiro e execute
--
-- O que faz:
--   1. Adiciona colunas em profiles para status da assinatura, plano,
--      método de pagamento, IDs do MP, datas de início/expiração
--   2. Cria tabela subscription_payments com histórico de cobranças
--      (cartão recorrente + PIX/Boleto único) para auditoria e relatório
--   3. RLS: usuário só vê os próprios pagamentos; insert/update da tabela
--      só pelo backend via service-role
--   4. Índices: status (parcial) e user_id+created_at
--
-- Como o app le esses dados:
--   Premium ATIVO  ↔  subscription_status = 'active'
--                  AND (subscription_expires_at IS NULL OR > NOW())
--
--   Para cartao recorrente: o webhook do MP atualiza expires_at a cada
--   pagamento bem-sucedido. Se a assinatura for cancelada/pausada,
--   status muda para 'cancelled' ou 'paused' e o acesso expira no fim
--   do periodo ja pago.
--
--   Para PIX/Boleto unico: expires_at é definido na hora da aprovacao
--   (NOW() + 30 dias para mensal, NOW() + 365 dias para anual). Quando
--   passa essa data, o backend (ou um cron) muda status para 'free'.
-- =========================================================================

-- ============================================================
-- 1. Colunas em profiles
-- ============================================================
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_status TEXT NOT NULL DEFAULT 'free',
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT,
  ADD COLUMN IF NOT EXISTS subscription_payment_method TEXT,
  ADD COLUMN IF NOT EXISTS mp_preapproval_id TEXT,
  ADD COLUMN IF NOT EXISTS mp_payer_id TEXT,
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_updated_at TIMESTAMPTZ;

-- Constraints de valor para evitar status invalido
ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_status_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_status_check
  CHECK (subscription_status IN ('free', 'active', 'cancelled', 'past_due', 'paused', 'pending'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_plan_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_plan_check
  CHECK (subscription_plan IS NULL OR subscription_plan IN ('mensal', 'anual'));

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_subscription_payment_method_check;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_subscription_payment_method_check
  CHECK (subscription_payment_method IS NULL OR subscription_payment_method IN ('credit_card', 'pix', 'boleto'));

-- Indice parcial — query "quem e premium ativo" e a mais frequente
CREATE INDEX IF NOT EXISTS profiles_subscription_status_idx
  ON public.profiles (subscription_status, subscription_expires_at)
  WHERE subscription_status = 'active';

-- ============================================================
-- 2. Tabela subscription_payments (historico/auditoria)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.subscription_payments (
  id                  UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mp_payment_id       TEXT         UNIQUE NOT NULL,
  mp_preapproval_id   TEXT,
  amount              NUMERIC(10,2) NOT NULL,
  currency            TEXT         NOT NULL DEFAULT 'BRL',
  status              TEXT         NOT NULL,
  payment_method      TEXT,
  description         TEXT,
  raw_event           JSONB,
  created_at          TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- Constraints de valor
ALTER TABLE public.subscription_payments
  DROP CONSTRAINT IF EXISTS subscription_payments_status_check;

ALTER TABLE public.subscription_payments
  ADD CONSTRAINT subscription_payments_status_check
  CHECK (status IN ('approved', 'pending', 'in_process', 'rejected', 'refunded', 'cancelled', 'charged_back'));

ALTER TABLE public.subscription_payments
  DROP CONSTRAINT IF EXISTS subscription_payments_payment_method_check;

ALTER TABLE public.subscription_payments
  ADD CONSTRAINT subscription_payments_payment_method_check
  CHECK (payment_method IS NULL OR payment_method IN ('credit_card', 'pix', 'boleto', 'debit_card', 'account_money'));

-- Indices
CREATE INDEX IF NOT EXISTS subscription_payments_user_idx
  ON public.subscription_payments (user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS subscription_payments_preapproval_idx
  ON public.subscription_payments (mp_preapproval_id)
  WHERE mp_preapproval_id IS NOT NULL;

-- ============================================================
-- 3. RLS — Row Level Security
-- ============================================================
ALTER TABLE public.subscription_payments ENABLE ROW LEVEL SECURITY;

-- Usuario autenticado le os proprios pagamentos
DROP POLICY IF EXISTS "subscription_payments_select_own" ON public.subscription_payments;
CREATE POLICY "subscription_payments_select_own"
  ON public.subscription_payments FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- INSERT/UPDATE/DELETE: NENHUMA policy criada -> so service-role consegue.
-- Backend usa supabase-admin (SUPABASE_SERVICE_ROLE_KEY) ao processar
-- webhooks do MP e inserir/atualizar registros.
