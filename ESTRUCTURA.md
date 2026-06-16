# ESTRUCTURA DEL NUEVO REPOSITORIO

Árbol real de `T:\Fiado-Canal-Digital` (excluye `node_modules`). 228 archivos.

```
fiado-canal-digital/
├── .env.example                      # plantilla de variables (sin valores)
├── .gitignore
├── .npmrc
├── package.json                      # raíz (curado)
├── pnpm-workspace.yaml
├── turbo.json
├── REPORTE_EXTRACCION.md
├── ESTRUCTURA.md
├── NOTAS_EXTRACCION.md
│
├── apps/
│   └── web/                          # Next.js 15 App Router
│       ├── package.json              # (curado)
│       ├── next.config.ts · middleware.ts · tailwind.config.ts
│       ├── postcss.config.mjs · components.json · tsconfig.json
│       ├── global.d.ts · next-env.d.ts
│       └── app/
│           ├── layout.tsx · providers.tsx · page.tsx · globals.css
│           ├── error.tsx · global-error.tsx · manifest.ts
│           ├── auth/                 # login, callback, confirm, mfa, signout,
│           │                         #   forgot/update-password, error, layout
│           ├── marketplace/          # STOREFRONT PÚBLICO
│           │   ├── page.tsx · layout.tsx
│           │   ├── [businessId]/     # page, business-info-sheet, connect-supplier-button
│           │   ├── checkout/         # page + success/page
│           │   ├── components/       # add-to-cart, cart-trigger, cart-sheet, search
│           │   ├── profile/page.tsx
│           │   └── whatsapp/page.tsx
│           ├── protected/
│           │   ├── layout.tsx · page.tsx · loading.tsx
│           │   ├── bi/page.tsx                       # DASHBOARD ANALÍTICO
│           │   ├── marketplace/requests/             # page + request-list
│           │   └── settings/marketplace/             # page + business-profile-form
│           └── api/
│               ├── bi/insights/route.ts              # Gemini insights
│               ├── marketplace/business/[uuid]/products/route.ts
│               └── webhooks/whatsapp/route.ts        # WEBHOOK WhatsApp
│
└── packages/
    └── core/
        ├── package.json              # (curado) · tsconfig.json
        └── src/
            ├── index.ts              # barrel @fiado/core
            ├── components/
            │   ├── ui/               # 29 componentes shadcn (design system)
            │   ├── bi/               # 5 gráficos: sales-chart, retention-heatmap,
            │   │                     #   product-success-chart, ai-insights-card, filters
            │   ├── layout/page-header.tsx
            │   └── sync-status-indicator.tsx   # (dep de sync ROTA — TODO)
            ├── hooks/                # use-media-query, use-toast
            ├── lib/
            │   ├── supabase/         # client, server, service, middleware, env
            │   ├── utils.ts · utils/feedback · utils/retry · rate-limit
            │   └── (db.ts EXCLUIDO — Dexie)
            ├── shared/               # errors/app-error, utils/auth.utils, utils/logger
            ├── types/images.d.ts
            └── features/
                ├── marketplace/                       ← OBJETIVO
                │   ├── actions/ (6)
                │   ├── application/ (cart.store + use-case)
                │   ├── domain/ (business, order, product entities)
                │   ├── infrastructure/supabase-marketplace.repository.ts
                │   ├── ui/profile-form.tsx
                │   ├── payments/lemon-squeezy.placeholder.ts   # NUEVO (placeholder)
                │   └── whatsapp/ (actions, application, domain, infrastructure, ui)
                ├── bi/                                ← OBJETIVO (analítica)
                │   ├── actions · application · domain (+ services) · infrastructure
                │   ├── scripts/ (apply/inspect/verify schema)
                │   └── ui/bi-dashboard.tsx
                ├── dashboard/                         ← OBJETIVO (layout)
                │   └── components/ (sidebar, header, user-nav, mobile-sidebar,
                │                     sidebar-container, branch-selector)
                ├── business/        # adyacente (perfiles, ratings, reviews)
                ├── relationships/   # adyacente (conexión B2B proveedor↔cliente)
                ├── products/        # adyacente (catálogo + variantes)
                ├── permissions/     # adyacente (roles/permisos del canal)
                ├── procurement/
                │   └── ui/marketplace-cart-sidebar.tsx   # SOLO este archivo
                └── shared/          # value-objects, theme, strategies, utils (pruned)

EXCLUIDOS (no copiados): apps/mobile, features/{accounting, payroll, finance,
  inventory, invoicing, electronic-billing, sales/POS, auth*, employee*, person*,
  audit-logs*, rol*, currency*, categories*, notifications*, onboarding, ...},
  lib/db.ts (Dexie), store/sync.store, hooks/useSync.
  (* = kernel referenciado por TODO, no copiado por límite de alcance)
```
