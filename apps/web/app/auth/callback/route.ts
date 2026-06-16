import { createServerClient } from '@supabase/ssr';
import { type EmailOtpType } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { getSupabaseEnv } from '@/lib/supabase/env';
import { ratelimit } from '@fiado/core';

function buildSupabaseClient(url: string, key: string, cookieStore: Awaited<ReturnType<typeof cookies>>) {
  return createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) =>
          cookieStore.set(name, value, options)
        );
      },
    },
  });
}

export async function GET(request: Request) {
  // 0. Rate Limit
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const { url, key } = getSupabaseEnv();
  const cookieStore = await cookies();
  const supabase = buildSupabaseClient(url, key, cookieStore);

  // ── OAuth PKCE flow ──────────────────────────────────────────────────────
  const code = searchParams.get('code');
  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (error || !data.user) {
      console.error('OAuth code exchange error:', error?.message);
      const errRedirect = new URL('/auth/login', request.url);
      errRedirect.searchParams.set('error', 'oauth_failed');
      return NextResponse.redirect(errRedirect);
    }

    // Check if user already completed onboarding (has a core.users record)
    const { data: coreUser } = await supabase
      .schema('core')
      .from('users')
      .select('id')
      .eq('uuid', data.user.id)
      .maybeSingle();

    if (!coreUser) {
      // New OAuth user → complete business onboarding
      return NextResponse.redirect(new URL('/onboarding?provider=google', request.url));
    }

    // Existing user → app
    return NextResponse.redirect(new URL('/protected', request.url));
  }

  // ── Email OTP flow ───────────────────────────────────────────────────────
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;

  if (token_hash && type) {
    const { error } = await supabase.auth.verifyOtp({ type, token_hash });

    if (!error) {
      return NextResponse.redirect(new URL('/products', request.url));
    } else {
      console.error('Error verificando email:', error);
    }
  }

  const redirectTo = new URL('/auth/login', request.url);
  redirectTo.searchParams.set('error', 'Could not verify email');
  return NextResponse.redirect(redirectTo);
}