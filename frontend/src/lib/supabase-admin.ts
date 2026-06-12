import { createClient, SupabaseClient } from '@supabase/supabase-js';

// Cliente Supabase com service-role key. SO USAR EM ROUTE HANDLERS / SERVER. Nunca importar deste arquivo a partir de um componente client-side. Inicializacao lazy: as env vars nao sao validadas no import, apenas na primeira chamada. Isso evita quebrar o build do Next.js quando as vars ainda nao foram configuradas no ambiente de deploy.

let cached: SupabaseClient | null = null;

export function getSupabaseAdmin(): SupabaseClient {
  if (cached) return cached;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error(
      'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos.'
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
