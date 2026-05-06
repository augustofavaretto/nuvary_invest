-- =========================================================================
-- Setup do bucket "avatars" no Supabase Storage
--
-- Como rodar:
--   1. Abra o Supabase Studio do projeto
--   2. Vá em SQL Editor → New query
--   3. Cole este arquivo inteiro e execute
--
-- O que faz:
--   - Cria o bucket "avatars" público (caso ainda não exista)
--   - Define as Row Level Security policies de Storage para permitir que
--     cada usuário faça upload, atualize, leia e remova apenas a sua
--     própria foto, dentro de uma pasta com o id dele (ex: <uid>/avatar.png)
--   - Mantém leitura pública (qualquer um pode visualizar avatares)
-- =========================================================================

-- 1. Cria o bucket (idempotente). public = true permite getPublicUrl
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 2. Limpa policies antigas com mesmo nome (idempotente)
DROP POLICY IF EXISTS "avatars_select_public" ON storage.objects;
DROP POLICY IF EXISTS "avatars_insert_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_update_own"   ON storage.objects;
DROP POLICY IF EXISTS "avatars_delete_own"   ON storage.objects;

-- 3. Leitura pública (necessário para que o avatar apareça no app)
CREATE POLICY "avatars_select_public"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

-- 4. INSERT: usuário só pode fazer upload em uma pasta com o próprio uid
--    Path esperado pelo app: "<auth.uid()>/avatar.<ext>"
CREATE POLICY "avatars_insert_own"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 5. UPDATE: idem (necessário porque o app usa upsert: true)
CREATE POLICY "avatars_update_own"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

-- 6. DELETE: só na própria pasta
CREATE POLICY "avatars_delete_own"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'avatars'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
