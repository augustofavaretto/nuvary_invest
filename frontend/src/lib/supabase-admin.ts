import { createClient } from '@supabase/supabase-js';

// Cliente Supabase com service-role key. SO USAR EM ROUTE HANDLERS / SERVER.
// Nunca importar deste arquivo a partir de um componente client-side.
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  throw new Error(
    'NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY precisam estar definidos.'
  );
}

export const supabaseAdmin = createClient(url, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});
