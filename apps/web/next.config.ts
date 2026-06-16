import type { NextConfig } from "next";
import withPWAInit from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'cbfkdemunhsawtxeeced.supabase.co',
        port: '',
        pathname: '/storage/v1/object/sign/**',
      },
      {
        protocol: 'https',
        hostname: 'cbfkdemunhsawtxeeced.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
      {
        protocol: 'https',
        hostname: 'encrypted-tbn0.gstatic.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin'
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://static.cloudflareinsights.com; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data: https:; font-src 'self'; connect-src 'self' https:;"
          }
        ],
      },
    ]
  },
  async redirects() {
    return [
      {
        source: '/products',
        destination: '/protected/products',
        permanent: true,
      },
      {
        source: '/categories',
        destination: '/protected/products',
        permanent: true,
      },
      {
        source: '/employees',
        destination: '/protected/settings/employees',
        permanent: true,
      },
      {
        source: '/account',
        destination: '/marketplace/profile',
        permanent: true,
      },
      {
        source: '/profile',
        destination: '/marketplace/profile',
        permanent: true,
      },
      {
        source: '/clients',
        destination: '/protected',
        permanent: true,
      }
    ];
  },
  transpilePackages: ['@fiado/core'],
  output: 'standalone', // Required for Docker multi-stage builds (Phase 2 IaC)
};


const withPWA = withPWAInit({
  dest: "public",
  disable: true, // process.env.NODE_ENV === "development",
  register: true,
  // @ts-expect-error - skipWaiting is not in the type definition but is supported
  skipWaiting: true,
  // Force caching for navigation to ensure offline validation works
  // CHANGED: Disabled aggressive caching to fix "Loading chunk failed" errors on Vercel
  cacheOnFrontEndNav: false,
  aggressiveFrontEndNavCaching: false,
  reloadOnOnline: false,
  swcMinify: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: ({ url }) => url.pathname === "/manifest.webmanifest",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "manifest",
          expiration: {
            maxEntries: 5,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      {
        urlPattern: ({ request }) => request.mode === "navigate",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "pages",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
          },
        },
      },
      {
        urlPattern: ({ url }) => url.pathname.startsWith("/_next/data/") || url.searchParams.has("_rsc"),
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "next-rsc-data",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 24 * 60 * 60, // 24 Hours
          },
        },
      },
      // Fallback for other assets (images, fonts, etc.)
      {
        urlPattern: ({ request }) =>
          request.destination === "style" ||
          request.destination === "script" ||
          request.destination === "worker",
        handler: "StaleWhileRevalidate",
        options: {
          cacheName: "assets",
        },
      },
      {
        urlPattern: ({ request }) => request.destination === "image",
        handler: "CacheFirst",
        options: {
          cacheName: "images",
          expiration: {
            maxEntries: 50,
            maxAgeSeconds: 30 * 24 * 60 * 60, // 30 Days
          },
        },
      },
      // API calls (exclude specific paths if needed)
    ],
  },
});

export default withSentryConfig(withPWA(nextConfig), {
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options

  // Suppresses source map uploading logs during build
  silent: true,
  org: "fiado", // Placeholder
  project: "fiado-saas", // Placeholder

  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,



  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",






});

// Trigger restart 3
