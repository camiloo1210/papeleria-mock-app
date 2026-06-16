import { createClient } from '@supabase/supabase-js';
import { createMockSupabaseClient } from '../mock/mock-supabase-client';

export function createServiceRoleClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockSupabaseClient() as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('❌ CRÍTICO: Faltan variables de entorno SUPABASE_URL o SERVICE_ROLE_KEY.');
  }

  // ✅ USAMOS createClient DE SUPABASE-JS (NO SSR)
  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false, // ⛔ IMPORTANTE: Esto evita que busque cookies
    },
  });
}