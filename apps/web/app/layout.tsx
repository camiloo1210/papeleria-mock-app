// TODO [EXTRACCION]: import a modulo no incluido en este repo -> auth (kernel NO extraido). Resolver: copiar/stubear o eliminar.
import { AuthProvider } from "@/features/auth/ui/context/AuthContext";
import * as Sentry from "@sentry/nextjs";
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { BrandThemeProvider } from "@/features/shared/theme/theme-provider";
import { BusinessProvider } from "@/features/business/ui/context/BusinessContext";
import "./globals.css";
// ... existing metadata and font ...

import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { SupabaseBusinessRepository } from "@/features/business/infrastructure/supabase-business.repository";
import { Toaster } from 'sonner';
import { AccessControlProvider } from "@/features/permissions/ui/context/AccessControlContext";
import { Providers } from "./providers";

import { getUserPermissions } from "@/features/permissions/actions/get-user-permissions";

import { ClientErrorBoundary } from "@/components/ui/client-error-boundary";

export const dynamic = 'force-dynamic';

const defaultUrl = process.env.VERCEL_URL
  ? `https://${process.env.VERCEL_URL}`
  : "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(defaultUrl),
  title: "Papelería El Estudiante",
  description: "A resilient, offline-first Point of Sale (POS) system designed for small businesses with unstable internet. Built with Next.js and Supabase.",
  icons: {
    icon: '/Logo.svg',
  },
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  let brandColor: string | undefined = undefined;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let userThemeSettings: Record<string, any> = {};
  let businessName = 'Papelería El Estudiante';
  let logoUrl = undefined;
  let cssVariables = '';
  let permissions: string[] = [];
  let tenantId: number | undefined;

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      try {
        const { data: userData } = await supabase
          .schema('core')
          .from('users')
          .select('id, theme_settings') // Select ID
          .eq('uuid', user.id)
          .single();
        userThemeSettings = userData?.theme_settings || {};
      } catch (e) {
        console.error("Error fetching user data:", e);
      }
    }


    const headersList = await headers();
    const tenantIdStr = headersList.get('X-Tenant-ID');

    if (tenantIdStr) {
      tenantId = Number(tenantIdStr);
      if (tenantId) {
        // Use Standard Client for Business Info (Public data usually)
        const businessRepo = new SupabaseBusinessRepository(supabase);
        // Only fetch business details if NOT in marketplace context (or keep fetching but ignore color)
        const isMarketplace = headersList.get('x-is-marketplace') === 'true';

        if (!isMarketplace) {
          const business = await businessRepo.findById(tenantId);
          brandColor = business?.getBrandColor();
          if (business) {
            businessName = business.getTradeName();
            logoUrl = business.getLogoUrl();
          }
        }

        // Permissions Logic
        // Permissions Logic
        permissions = await getUserPermissions(tenantId);
      }
    }

    // ... (Theme generation logic remains same, implicit in ... )
    const { generateFullTheme } = await import('@/features/shared/theme/theme-generator');
    const lightTheme = generateFullTheme({ primary: brandColor || '#18181b', background: userThemeSettings?.light?.background || '#ffffff', foreground: undefined });
    const darkTheme = generateFullTheme({ primary: brandColor || '#fafafa', background: userThemeSettings?.dark?.background || '#020817', foreground: undefined });
    let lightVars = ''; for (const [key, value] of Object.entries(lightTheme)) { lightVars += `--${key}: ${value};`; }
    let darkVars = ''; for (const [key, value] of Object.entries(darkTheme)) { darkVars += `--${key}: ${value};`; }
    cssVariables = `:root { ${lightVars} } .dark { ${darkVars} }`;

    // Sentry Context Enrichment
    if (Sentry && user) {
      Sentry.setUser({ id: user.id, email: user.email });
      if (tenantId) {
        Sentry.setTag("tenant_id", tenantId);
      }
    }

  } catch (error) {
    console.error("Error fetching data in RootLayout:", error);
    Sentry.captureException(error);
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased h-screen overflow-hidden`}>
        <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <BrandThemeProvider initialBrandColor={brandColor} userThemeSettings={userThemeSettings}>
            <BusinessProvider initialBusinessName={businessName} initialLogoUrl={logoUrl} tenantId={tenantId}>
              <AccessControlProvider initialPermissions={permissions}>
                <AuthProvider>
                  <Providers>
                    <ClientErrorBoundary>
                      {children}
                      </ClientErrorBoundary>
                  </Providers>
                  <Toaster />
                </AuthProvider>
              </AccessControlProvider>
            </BusinessProvider>
          </BrandThemeProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}