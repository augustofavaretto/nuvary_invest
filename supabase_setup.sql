-- ============================================================
-- NUVARY INVEST — Setup completo do banco de dados
-- Execute no SQL Editor do Supabase (novo projeto)
-- ============================================================

-- ============================================================
-- 1. TABELA: profiles
-- ============================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id                 UUID         PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome               TEXT         NOT NULL DEFAULT 'Usuário',
  email              TEXT,
  cpf                TEXT,
  data_nascimento    TEXT,
  telefone           TEXT,
  aceite_termos      BOOLEAN      NOT NULL DEFAULT FALSE,
  data_aceite_termos TIMESTAMPTZ,
  avatar_url         TEXT,
  created_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at         TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 2. TABELA: portfolio_assets
-- ============================================================
CREATE TABLE IF NOT EXISTS public.portfolio_assets (
  id            TEXT         PRIMARY KEY,
  user_id       UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT         NOT NULL,
  ticker        TEXT         NOT NULL,
  type          TEXT         NOT NULL,
  quantity      NUMERIC      NOT NULL DEFAULT 0,
  average_price NUMERIC      NOT NULL DEFAULT 0,
  current_price NUMERIC      NOT NULL DEFAULT 0,
  total_value   NUMERIC      NOT NULL DEFAULT 0,
  variation     NUMERIC               DEFAULT 0,
  broker        TEXT         NOT NULL DEFAULT '',
  created_at    TIMESTAMPTZ           DEFAULT NOW()
);

-- ============================================================
-- 3. TABELA: chat_historico
-- ============================================================
CREATE TABLE IF NOT EXISTS public.chat_historico (
  id           UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id      UUID         NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role         TEXT         NOT NULL CHECK (role IN ('user', 'assistant')),
  content      TEXT         NOT NULL,
  conversa_id  UUID,
  created_at   TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- ============================================================
-- 4. TABELA: perfil_investidor
-- ============================================================
CREATE TABLE IF NOT EXISTS public.perfil_investidor (
  id                      UUID         PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id                 UUID         NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  perfil_risco            TEXT         CHECK (perfil_risco IN ('conservador', 'moderado', 'arrojado', 'agressivo')),
  objetivo_principal      TEXT,
  horizonte_investimento  TEXT,
  nivel_conhecimento      NUMERIC,
  renda_mensal            TEXT,
  idade                   TEXT,
  respostas_completas     JSONB,
  created_at              TIMESTAMPTZ  DEFAULT NOW(),
  updated_at              TIMESTAMPTZ  DEFAULT NOW()
);

-- ============================================================
-- 5. TRIGGER: criar perfil automaticamente no signup
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    nome,
    email,
    cpf,
    data_nascimento,
    telefone,
    aceite_termos,
    data_aceite_termos
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome', 'Usuário'),
    NEW.email,
    NEW.raw_user_meta_data->>'cpf',
    NEW.raw_user_meta_data->>'data_nascimento',
    NEW.raw_user_meta_data->>'telefone',
    COALESCE((NEW.raw_user_meta_data->>'aceite_termos')::BOOLEAN, FALSE),
    CASE
      WHEN (NEW.raw_user_meta_data->>'aceite_termos')::BOOLEAN = TRUE
      THEN NOW()
      ELSE NULL
    END
  )
  ON CONFLICT (id) DO UPDATE SET
    nome               = COALESCE(EXCLUDED.nome, public.profiles.nome),
    cpf                = COALESCE(EXCLUDED.cpf, public.profiles.cpf),
    data_nascimento    = COALESCE(EXCLUDED.data_nascimento, public.profiles.data_nascimento),
    telefone           = COALESCE(EXCLUDED.telefone, public.profiles.telefone),
    aceite_termos      = EXCLUDED.aceite_termos,
    data_aceite_termos = COALESCE(EXCLUDED.data_aceite_termos, public.profiles.data_aceite_termos),
    updated_at         = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 6. ÍNDICES para performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_portfolio_assets_user_id  ON public.portfolio_assets(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_historico_user_id    ON public.chat_historico(user_id);
CREATE INDEX IF NOT EXISTS idx_chat_historico_conversa   ON public.chat_historico(conversa_id);
CREATE INDEX IF NOT EXISTS idx_perfil_investidor_user_id ON public.perfil_investidor(user_id);

-- ============================================================
-- 7. HABILITAR RLS em todas as tabelas
-- ============================================================
ALTER TABLE public.profiles          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.portfolio_assets  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_historico    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.perfil_investidor ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- 8. POLÍTICAS RLS — profiles
-- ============================================================
DROP POLICY IF EXISTS "profiles_select" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update" ON public.profiles;

CREATE POLICY "profiles_select" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "profiles_insert" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- 9. POLÍTICAS RLS — portfolio_assets
-- ============================================================
DROP POLICY IF EXISTS "portfolio_select" ON public.portfolio_assets;
DROP POLICY IF EXISTS "portfolio_insert" ON public.portfolio_assets;
DROP POLICY IF EXISTS "portfolio_update" ON public.portfolio_assets;
DROP POLICY IF EXISTS "portfolio_delete" ON public.portfolio_assets;

CREATE POLICY "portfolio_select" ON public.portfolio_assets
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "portfolio_insert" ON public.portfolio_assets
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "portfolio_update" ON public.portfolio_assets
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "portfolio_delete" ON public.portfolio_assets
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 10. POLÍTICAS RLS — chat_historico
-- ============================================================
DROP POLICY IF EXISTS "chat_select" ON public.chat_historico;
DROP POLICY IF EXISTS "chat_insert" ON public.chat_historico;
DROP POLICY IF EXISTS "chat_delete" ON public.chat_historico;

CREATE POLICY "chat_select" ON public.chat_historico
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "chat_insert" ON public.chat_historico
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "chat_delete" ON public.chat_historico
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- 11. POLÍTICAS RLS — perfil_investidor
-- ============================================================
DROP POLICY IF EXISTS "perfil_select" ON public.perfil_investidor;
DROP POLICY IF EXISTS "perfil_insert" ON public.perfil_investidor;
DROP POLICY IF EXISTS "perfil_update" ON public.perfil_investidor;

CREATE POLICY "perfil_select" ON public.perfil_investidor
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "perfil_insert" ON public.perfil_investidor
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "perfil_update" ON public.perfil_investidor
  FOR UPDATE USING (auth.uid() = user_id);

-- ============================================================
-- Concluído! Todas as tabelas, triggers, índices e RLS criados.
-- ============================================================
