

import { type EmailOtpType } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { AuthRepositoryImpl } from '@/features/auth/infrastructure/adapters/AuthRepositoryImpl';
// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { VerifyEmailUseCase } from '@/features/auth/application/use-cases/VerifyEmailUseCase';
import { ratelimit } from '@fiado/core';

export async function GET(request: NextRequest) {
  // 0. Rate Limit
  const ip = request.headers.get('x-forwarded-for') ?? '127.0.0.1';
  const { success } = await ratelimit.limit(ip);
  if (!success) {
    return new NextResponse('Too Many Requests', { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const token_hash = searchParams.get('token_hash');
  const type = searchParams.get('type') as EmailOtpType | null;
  const next = searchParams.get('next') || '/';

  const redirectTo = request.nextUrl.clone();
  redirectTo.pathname = next;
  redirectTo.searchParams.delete('token_hash');
  redirectTo.searchParams.delete('type');

  if (token_hash && type) {
    const supabase = await createClient();
    const authRepository = new AuthRepositoryImpl(supabase);
    const verifyEmailUseCase = new VerifyEmailUseCase(authRepository);

    try {
      await verifyEmailUseCase.execute(token_hash);
      redirectTo.pathname = '/auth/login';
      return NextResponse.redirect(redirectTo);
    } catch (error) {
      console.error('Email verification failed:', error);
      redirectTo.pathname = '/auth/error'; // Redirect to an error page
      return NextResponse.redirect(redirectTo);
    }
  }

  redirectTo.pathname = '/auth/error'; // Redirect to an error page if token or type are missing
  return NextResponse.redirect(redirectTo);
}
