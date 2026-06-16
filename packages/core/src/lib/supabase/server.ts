import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
import { cookies } from "next/headers";
import { getSupabaseEnv, getSupabaseServiceRoleKey } from "./env";
import { createMockSupabaseClient } from "../mock/mock-supabase-client";

/**
 * Cliente normal de Supabase para Server Components
 * Usa la sesión del usuario autenticado (respeta RLS)
 */
export async function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockSupabaseClient() as any;
  }

  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  return createServerClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options),
            );
          } catch {
            // The `setAll` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          }
        },
      },
    },
  );
}

/**
 * Cliente Service Role de Supabase
 * Se salta RLS completamente - Solo para operaciones administrativas
 * ⚠️ NUNCA usar en operaciones normales de usuarios
 */
export function createServiceRoleClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockSupabaseClient() as any;
  }

  const { url } = getSupabaseEnv();
  const serviceRoleKey = getSupabaseServiceRoleKey();

  // ✅ CORRECCIÓN: Usar createClient sin cookies
  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}