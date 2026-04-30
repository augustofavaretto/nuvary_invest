-- ============================================================================
-- Alertas de Variação — Nuvary Invest
-- Execute este script no SQL Editor do Supabase
-- ============================================================================

-- 1. Tabela principal
CREATE TABLE IF NOT EXISTS alertas_variacao (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ticker VARCHAR(20) NOT NULL,
  asset_name VARCHAR(100) NOT NULL,
  asset_type VARCHAR(30) NOT NULL,
  direction VARCHAR(10) NOT NULL CHECK (direction IN ('up', 'down')),
  variation_pct NUMERIC(14,2) NOT NULL,
  previous_price NUMERIC(20,8) NOT NULL,
  current_price NUMERIC(20,8) NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. RLS
ALTER TABLE alertas_variacao ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own alerts" ON alertas_variacao;
CREATE POLICY "Users can view own alerts"
  ON alertas_variacao FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own alerts" ON alertas_variacao;
CREATE POLICY "Users can update own alerts"
  ON alertas_variacao FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own alerts" ON alertas_variacao;
CREATE POLICY "Users can insert own alerts"
  ON alertas_variacao FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own alerts" ON alertas_variacao;
CREATE POLICY "Users can delete own alerts"
  ON alertas_variacao FOR DELETE USING (auth.uid() = user_id);

-- 3. Índices
CREATE INDEX IF NOT EXISTS idx_alertas_user_id ON alertas_variacao(user_id);
CREATE INDEX IF NOT EXISTS idx_alertas_created ON alertas_variacao(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_alertas_user_ticker_dir
  ON alertas_variacao(user_id, ticker, direction, created_at DESC);

-- 4. Coluna de preferência em profiles
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS alertas_variacao_enabled BOOLEAN DEFAULT TRUE;
