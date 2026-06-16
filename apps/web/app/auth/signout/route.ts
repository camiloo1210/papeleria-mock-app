import { createServerClient } from '@supabase/ssr';
import { type NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { getSupabaseEnv } from '@/lib/supabase/env';

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const { url, key } = getSupabaseEnv();

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });

  // Cerramos la sesión en Supabase (esto borra la cookie)
  const { error } = await supabase.auth.signOut();

  if (error) {
    console.error("Error signing out:", error);
  }

  // Redirigimos al Login
  return NextResponse.redirect(new URL('/auth/login', request.url), {
    status: 302,
  });
}

export async function GET(request: NextRequest) {
  // Reutilizamos la misma lógica para GET (Link navigation)
  return POST(request);
}