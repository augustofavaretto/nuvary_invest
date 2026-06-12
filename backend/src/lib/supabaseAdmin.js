import { createClient } from '@supabase/supabase-js';
import { config } from '../config/index.js';

// Cliente Supabase service-role (somente servidor) com init lazy — falha apenas no primeiro uso sem credenciais

let cached = null;

export function getSupabaseAdmin() {
  if (cached) return cached;

  const url = config.supabase.url;
  const serviceKey = config.supabase.serviceRoleKey;

  if (!url || !serviceKey) {
    throw new Error(
      'SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos no backend.'
    );
  }

  cached = createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  return cached;
}
