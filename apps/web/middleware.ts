// middleware.ts (raíz del proyecto)
import { updateSession } from "@/lib/supabase/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { authRatelimit, ratelimit } from "@/lib/rate-limit";

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? request.headers.get("x-real-ip")
    ?? "127.0.0.1";

  // --- RATE LIMITING ---
  try {
    // Auth routes: strict limit (brute force protection)
    if (path.startsWith("/auth/") || path.startsWith("/api/auth")) {
      const { success, limit, remaining, reset } = await authRatelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Demasiados intentos. Intente de nuevo más tarde." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }

    // API routes: standard limit
    if (path.startsWith("/api/") && !path.startsWith("/api/auth")) {
      const { success, limit, remaining, reset } = await ratelimit.limit(ip);
      if (!success) {
        return NextResponse.json(
          { error: "Rate limit exceeded." },
          {
            status: 429,
            headers: {
              "X-RateLimit-Limit": limit.toString(),
              "X-RateLimit-Remaining": remaining.toString(),
              "X-RateLimit-Reset": reset.toString(),
              "Retry-After": Math.ceil((reset - Date.now()) / 1000).toString(),
            },
          }
        );
      }
    }
  } catch (error) {
    // If rate limiting fails (Redis down), fail open — don't block users
    console.warn("⚠️ Rate limiting error (failing open):", error);
  }

  // --- SESSION & AUTH ---
  return await updateSession(request);
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api/auth (for Supabase auth callbacks)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api/auth|api/marketplace|monitoring|_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
