import { createServerClient as createSSRClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabaseEnv } from './env';

export async function updateSession(request: NextRequest) {
  // Mock mode: skip real auth, inject fake tenant context and allow all routes
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    const path = request.nextUrl.pathname;
    if (path === '/' || path.startsWith('/auth')) {
      const url = request.nextUrl.clone();
      url.pathname = '/protected';
      return NextResponse.redirect(url);
    }
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('X-Tenant-ID', '1');
    requestHeaders.set('x-pathname', path);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  // 1. Inicializar la respuesta base
  let supabaseResponse = NextResponse.next({
    request,
  });

  const { url, key } = getSupabaseEnv();

  // 2. Crear el cliente de Supabase para el Middleware
  const supabase = createSSRClient(
    url,
    key,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          );
          supabaseResponse = NextResponse.next({
            request,
          });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          );
        },
      },
    },
  );

  // 3. Obtener el usuario autenticado (Protegido contra errores de red)
  // 3. Obtener el usuario autenticado (Protegido contra errores de red)
  let user = null;
  let authError = null;
  try {
    // SECURITY: Use getUser instead of getSession to validate JWT signature via API 
    // and prevent spoofed cookies from returning fake metadata to server components.
    const { data: { user: currentUser }, error: sessionError } = await supabase.auth.getUser();
    user = currentUser || null;

    if (sessionError) {
      authError = sessionError;
      // Suppress "Auth session missing" logs
      if (!sessionError.message?.includes('Auth session missing')) {
        console.warn("Middleware Auth Error:", sessionError);
      }
    }
  } catch (error) {
    console.warn("Middleware Auth Warning (Offline Thrown):", error);
    authError = error;
  }

  const path = request.nextUrl.pathname;

  // 4. Definir rutas públicas
  // Se usa '/auth' para cubrir /auth/login, /auth/sign-up, /auth/callback, etc.
  // const publicPaths = ['/onboarding', '/auth', '/client', '/marketplace']; // Added marketplace to public paths effectively (though it needs auth usually? No, marketplace is public? User said "Global Users", implying auth. Let's refine.)
  // Actually, if they are NOT logged in, they should go to login. 
  // User said: "Que usuarios sin tenant inicien sesion". So they MUST be logged in. 
  // So /marketplace is NOT public for unauthenticated. It's public for Authenticated Global Users.

  const isAuthPath = path.startsWith('/auth');
  const isOnboardingPath = path.startsWith('/onboarding');
  // const isMarketplacePath = path.startsWith('/marketplace'); // This variable is not used

  const isRoot = path === '/';

  // 5. LÓGICA DE REDIRECCIÓN: USUARIO NO AUTENTICADO
  if (!user) {
    // OFF-LINE BYPASS: Si hubo error de red O error de sesión (400) pero tenemos cookies, asumimos Offline.
    // Verificamos si existe una cookie de Supabase (sb-*-auth-token)
    const hasAuthCookie = request.cookies.getAll().some(c => c.name.startsWith('sb-') && c.name.endsWith('-auth-token'));

    if (authError && hasAuthCookie && !isAuthPath && !isOnboardingPath && !path.startsWith('/client')) {
      // SECURITY CRITICAL: 
      // 1. BLOCK all non-GET methods (POST, PUT, DELETE, PATCH).
      // 2. BLOCK all API requests (`/api/*` or `/trpc/*`).
      // 3. Allow only navigation requests (GET /dashboard, /settings, etc) so the PWA shell loads.

      const isApiRequest = path.startsWith('/api') || path.includes('/api/');
      const isMethodSafe = request.method === 'GET';

      if (!isMethodSafe || isApiRequest) {
        console.warn(`🔒 Offline Bypass BLOCKED for sensitive request: ${request.method} ${path}`);
        return NextResponse.json({ error: 'Authentication required (Offline Mode)' }, { status: 401 });
      }

      console.warn("⚠️ Offline Bypass Activated: Serving App Shell Only");
      // Add header to let client know we are in offline/stale mode
      supabaseResponse.headers.set('X-Offline-Mode', 'true');
      return supabaseResponse;
    }


    // Si no es una ruta pública y no es la raíz, mandar al Login
    // Rutas permitidas sin login: /auth/* (para login/register), /client/* (posiblemente portal de pago externo?), /marketplace (public catalog?)
    // Vamos a asumir que el Marketplace requiere LOGIN para ver precios o comprar, pero tal vez el catálogo es público? 
    // "Usuarios inicien sesion...". Ok, asumamos que para "navegar" como GlobalUser DEBEN estar logueados.

    const isPublic = isAuthPath || isOnboardingPath || path.startsWith('/client'); // Only Auth and Client portal are truly public?

    if (!isPublic && !isRoot) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/login';
      return NextResponse.redirect(url);
    }
    // Si es pública o es la raíz, dejar pasar para que llegue al login
    return supabaseResponse;
  }

  // 6. LÓGICA DE USUARIO AUTENTICADO
  if (user) {
    // OPTIMIZATION: Try to get tenant_id from JWT metadata first
    let tenantId = user.app_metadata?.tenant_id || user.user_metadata?.tenant_id;

    if (!tenantId) {
      // Fallback: Query DB (Slow path for legacy users or if metadata is missing)
      // This should rarely happen if we sync metadata correctly on login/update.
      const { data, error } = await supabase
        .schema('core')
        .from('users')
        .select('tenant_id')
        .eq('uuid', user.id)
        .maybeSingle();

      if (error) {
        console.error('Middleware: Error obteniendo usuario/tenant:', error.message);
      }
      tenantId = data?.tenant_id;
    }
    const isSignOutPath = path === '/auth/signout';

    // --- MFA ENFORCEMENT ---
    const isMfaChallengePath = path === '/auth/mfa/challenge';
    const aal = user.app_metadata?.aal;
    const enrolledFactors = user.factors || [];
    const hasVerifiedFactors = enrolledFactors.some(f => f.status === 'verified');

    // If user has verified factors but is only AAL1, force them to challenge page
    // Unless they are already on the challenge page or signing out
    if (hasVerifiedFactors && aal === 'aal1' && !isMfaChallengePath && !isSignOutPath) {
      const url = request.nextUrl.clone();
      url.pathname = '/auth/mfa/challenge';
      return NextResponse.redirect(url);
    }

    // --- CASO A: Usuario GLOBAL (Sin Tenant - Consumer/Marketplace) ---
    if (!tenantId) {

      // If they are strictly on MFA challenge but somehow have AAL2 (already verified), send them home
      if (isMfaChallengePath && aal === 'aal2') {
        const url = request.nextUrl.clone();
        url.pathname = '/marketplace';
        return NextResponse.redirect(url);
      }

      // 3. WHITELIST: Permitir acceso SOLO a rutas específicas para Global Users
      const allowedGlobalPaths = ['/marketplace', '/onboarding', '/profile', '/settings', '/auth'];
      const isAllowed = allowedGlobalPaths.some(p => path.startsWith(p));

      if (!isAllowed) {
        const url = request.nextUrl.clone();
        url.pathname = '/marketplace';
        return NextResponse.redirect(url);
      }

      return supabaseResponse;
    }

    // --- CASO B: Usuario DE NEGOCIO (Con Tenant - Admin/Employee) ---
    if (tenantId) {

      // 1. Si intenta entrar a Login/Root/Onboarding y NO es logout -> Dashboard
      // (Onboarding lo bloqueamos porque ya tiene tenant? O lo dejamos por si quiere ver estado? Generalmente ya tiene negocio completado)
      // 1. Si intenta entrar a Login/Root/Onboarding y NO es logout -> Dashboard
      // (Onboarding lo bloqueamos porque ya tiene tenant? O lo dejamos por si quiere ver estado? Generalmente ya tiene negocio completado)
      if ((isAuthPath || isOnboardingPath || isRoot) && !isSignOutPath && !isMfaChallengePath) {
        const url = request.nextUrl.clone();
        url.pathname = '/protected';
        return NextResponse.redirect(url);
      }

      // 2. SETEAR CONTEXTO DE TENANT EN HEADERS (Solo para rutas /protected o API)
      const requestHeaders = new Headers(request.headers);
      requestHeaders.set('X-Tenant-ID', tenantId.toString());
      requestHeaders.set('x-pathname', request.nextUrl.pathname);

      if (path.startsWith('/marketplace')) {
        requestHeaders.set('x-is-marketplace', 'true');
      }

      const finalResponse = NextResponse.next({
        request: {
          headers: requestHeaders,
        },
      });

      const allCookies = supabaseResponse.cookies.getAll();
      allCookies.forEach(cookie => finalResponse.cookies.set(cookie));

      return finalResponse;
    }
  }

  return supabaseResponse;
}

export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Coincide con todas las rutas excepto:
     * - api/auth (callbacks internos de Supabase)
     * - _next/static (archivos estáticos)
     * - _next/image (optimización de imágenes)
     * - archivos en la raíz pública (favicon.ico, etc.)
     */
    '/((?!api/auth|_next/static|_next/image|favicon.ico|manifest.webmanifest|robots.txt).*)',
  ],
};