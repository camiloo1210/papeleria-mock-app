# REPORTE DE EXTRACCIÓN — Fiado → Fiado Canal Digital

**Fecha:** 2026-06-03
**Origen:** `T:\Fiado` (monorepo `fiado-monorepo`, pnpm + turbo)
**Destino:** `T:\Fiado-Canal-Digital`
**Alcance:** MARKETPLACE (canal de ventas digital) + DASHBOARD ANALÍTICO del administrador.
**Naturaleza:** Copia selectiva. **No se eliminó ni modificó nada en el origen.** No se reescribió lógica de negocio.

---

## 0. Hallazgos que cambiaron el alcance (decisiones confirmadas con el usuario)

| # | Hallazgo | Decisión aplicada |
|---|----------|-------------------|
| 1 | **Lemon Squeezy NO existe en el origen.** No hay webhook ni cliente de pagos. Los pedidos del marketplace se registran **a crédito ("fiado")** — ver `supabase-marketplace.repository.ts` ("pending payment verification or credit"). | Extraer el flujo real a crédito **tal cual** + dejar un **placeholder con TODO** para una futura integración (`marketplace/payments/lemon-squeezy.placeholder.ts`). No se inventó código de pagos. |
| 2 | El feature `dashboard/` **solo contiene chrome de layout** (sidebar, header, user-nav). El **dashboard analítico real** (KPIs, gráficos, agregaciones, `PredictiveInventoryService`, ruta `/protected/bi`) vive en el feature **`bi/`**. | Se extrajeron **ambos**: `bi/` (analítica) **y** `dashboard/` (layout). |
| 3 | El marketplace depende en cadena de `business`, `relationships`, `products`, `permissions`, `procurement` y de un **kernel compartido** (`person`, `employee`, `auth`, `currency`, `categories`, `audit-logs`, `rol`) y de módulos **excluidos** (`accounting`, `sales/pos`, `sync`). | Se copiaron **completos** los features adyacentes realmente usados (business, relationships, products, permissions + 1 pieza de procurement). Los imports a módulos **excluidos** y al **kernel no extraído** se marcaron con `// TODO [EXTRACCION]`. |

---

## 1. Archivos copiados (origen → destino)

> La ruta es idéntica en origen y destino (se preservó la estructura del monorepo). Origen = `T:\Fiado\<ruta>`, Destino = `T:\Fiado-Canal-Digital\<ruta>`.

### 1.1 Módulo MARKETPLACE (objetivo) — `packages/core/src/features/marketplace/`
- `actions/` → get-checkout-context, get-supplier-products, place-marketplace-order, profile, sync-marketplace-product, validate-cart-suppliers
- `application/cart.store.ts`, `application/use-cases/create-marketplace-order.use-case.ts`
- `domain/` → marketplace-business.entity, marketplace-order.entity, marketplace-product.entity
- `infrastructure/supabase-marketplace.repository.ts`
- `ui/profile-form.tsx`
- `whatsapp/` → actions/save-whatsapp-config.action, application/command-parser.service, application/use-cases/handle-incoming-message.use-case, domain/whatsapp.types, infrastructure/whatsapp-client.adapter, infrastructure/whatsapp.repository, ui/config-form
- `payments/lemon-squeezy.placeholder.ts` *(NUEVO — placeholder, ver §0.1)*

### 1.2 Rutas web del marketplace — `apps/web/app/`
- `marketplace/` (storefront público): page, layout, `[businessId]/` (page, business-info-sheet, connect-supplier-button), `checkout/` (page, success/page), `components/` (add-to-cart-button, cart-trigger, marketplace-cart-sheet, marketplace-search), `profile/page`, `whatsapp/page`
- `protected/marketplace/requests/` → page, request-list
- `protected/settings/marketplace/` → page, business-profile-form
- `api/marketplace/business/[uuid]/products/route.ts`
- `api/webhooks/whatsapp/route.ts` *(webhook de WhatsApp — verificación + firma HMAC)*

### 1.3 DASHBOARD ANALÍTICO (objetivo) — feature `bi/`
- `bi/actions/get-bi-dashboard-data.action.ts`
- `bi/application/get-bi-dashboard-data.use-case.ts`
- `bi/domain/bi.types.ts`, `bi/domain/services/PredictiveInventoryService.ts`
- `bi/infrastructure/supabase-bi.repository.ts`
- `bi/ui/bi-dashboard.tsx`
- `bi/scripts/` → apply-bi-schema, inspect-bi-schema, verify-bi-triggers *(scripts de mantenimiento de esquema BI)*
- Ruta: `apps/web/app/protected/bi/page.tsx`
- API: `apps/web/app/api/bi/insights/route.ts` *(insights con `@ai-sdk/google` / Gemini)*
- Componentes de gráficos: `packages/core/src/components/bi/` → ai-insights-card, bi-filter-controls, customer-retention-heatmap, product-success-chart, sales-chart

### 1.4 DASHBOARD layout — feature `dashboard/`
- `dashboard/components/` → dashboard-branch-selector, header, mobile-sidebar, sidebar, sidebar-container, user-nav

### 1.5 Features adyacentes copiados completos (dependencias directas del marketplace)
- **business/** (perfiles de negocio, ratings y reviews) — 31 archivos
- **relationships/** (conexión B2B proveedor↔cliente: solicitudes, aceptar/rechazar) — 8 archivos
- **products/** (catálogo, variantes) — 13 archivos
- **permissions/** (roles/permisos del canal: PermissionGate, AccessControlContext, usePermission) — 5 archivos
- **procurement/ui/marketplace-cart-sidebar.tsx** — **solo este archivo** (lo usa el flujo de pedidos). El resto de `procurement/` (órdenes de compra, proveedores POS) NO se copió.

### 1.6 Infraestructura compartida — `packages/core/src/`
- `features/shared/` (pruned): value-objects (Money, CurrencyCode, TaxId, Email, EcuadorianId, Password), strategies (national-id / tax-id), theme (provider, generator, marketplace-theme-reset, business-theme-enforcer), utils/format, domain/PaginationOptions
- `lib/` → supabase/* (client, server, service, middleware, env), rate-limit, utils.ts, utils/feedback, utils/retry  *(se EXCLUYÓ `lib/db.ts` = Dexie)*
- `shared/` → errors/app-error, utils/auth.utils, utils/logger
- `hooks/` → use-media-query, use-toast  *(se EXCLUYÓ `useSync.ts`)*
- `components/ui/` → 29 componentes shadcn (design system)
- `components/layout/page-header.tsx`
- `components/sync-status-indicator.tsx`  *(copiado pero su dep de sync está rota — ver TODO)*
- `types/images.d.ts`, `index.ts` (barrel `@fiado/core`)

### 1.7 Shell del frontend y configuración
- `apps/web/app/` → layout, providers, globals.css, page, error, global-error, manifest, `protected/` (layout, page, loading), `auth/` (login, callback, confirm, signout, mfa, forgot/update-password, error, layout)
- `apps/web/` → middleware.ts, next.config.ts, tailwind.config.ts, postcss.config.mjs, components.json, tsconfig.json, next-env.d.ts, global.d.ts
- Raíz → package.json *(curado)*, pnpm-workspace.yaml, turbo.json, .npmrc, .gitignore, .env.example *(nuevo)*

**Total copiado:** 228 archivos (119 en features de core, 52 de soporte en core, 49 en apps/web, 8 de config/raíz).

---

## 2. Dependencias compartidas copiadas y justificación

| Dependencia | Origen | Justificación |
|-------------|--------|---------------|
| `features/business/**` | feature completo | Marketplace muestra perfiles, ratings y reviews de negocios; el storefront y settings los consumen directamente. |
| `features/relationships/**` | feature completo | Núcleo del canal B2B: conexión proveedor↔comprador (solicitudes). |
| `features/products/**` | feature completo | Catálogo con precios al por mayor y variantes — corazón del marketplace. |
| `features/permissions/**` | feature completo | "Gestión de perfiles y permisos por rol del canal" está explícitamente en alcance. |
| `procurement/ui/marketplace-cart-sidebar.tsx` | 1 archivo | Único artefacto de procurement usado por el flujo de pedidos del marketplace. |
| `features/shared/` (value-objects, theme, utils) | parcial | `Money`/`CurrencyCode`/`TaxId` los usan business y products; `marketplace-theme-reset` lo usa el storefront. Se **excluyeron** las estrategias de invoicing/SRI, pdf-generation y email-provider. |
| `lib/supabase/*`, `lib/utils*`, `lib/rate-limit` | parcial | Acceso a datos y utilidades base. Se excluyó `lib/db.ts` (Dexie/offline). |
| `shared/{errors,auth.utils,logger}` | completo | Manejo de errores, sesión y logging usados transversalmente. |
| `hooks/{use-media-query,use-toast}` | parcial | UI responsiva y toasts. Se excluyó `useSync`. |
| `components/ui/**` (29) | completo | Design system shadcn compartido por todas las vistas. |
| `components/bi/**` (5) | completo | Gráficos/KPIs del dashboard analítico. |

---

## 3. Imports rotos detectados (42) — con su TODO

Cada uno tiene un comentario `// TODO [EXTRACCION]: ...` insertado en la línea **anterior** al import dentro del archivo correspondiente. Resumen por módulo destino:

### 3.1 Módulos EXCLUIDOS (restricción absoluta — no se copian)
| Módulo | Archivos afectados (línea) |
|--------|----------------------------|
| `@/features/accounting` (contabilidad) | `marketplace/infrastructure/supabase-marketplace.repository.ts:6,7` (recordSale/recordPurchase) · `business/actions/create-business.ts:14,15` · `business/application/create-business.use-case.ts:13` |
| `@/features/sales` (POS) | `procurement/ui/marketplace-cart-sidebar.tsx:6` (PosCartItem) |
| `@/lib/db` (Dexie/offline) | `products/infrastructure/supabase-product.repository.ts:2` · `products/infrastructure/mappers/local-product.mapper.ts:2` |
| `@/store/sync.store` (sync engine) | `components/sync-status-indicator.tsx:3` |

### 3.2 Kernel compartido NO extraído (fuera de alcance, no excluido)
| Módulo | Dónde se referencia |
|--------|---------------------|
| `@/features/auth` | `apps/web/app/layout.tsx` · rutas `auth/*` (login, confirm, mfa, forgot/update-password) · `business/actions/create-business.ts` · `business/application/create-business.use-case.ts` |
| `@/features/employee` | `apps/web/app/protected/page.tsx` · `bi/actions/get-bi-dashboard-data.action.ts` · `business/actions/create-business.ts` · `dashboard/components/sidebar-container.tsx` · `permissions/actions/get-user-permissions.ts` |
| `@/features/person` | `business/actions/create-business.ts` · `business/application/create-business.use-case.ts` |
| `@/features/audit-logs` | `business/actions/create-business.ts` · `business/ui/components/business-edit-wrapper.tsx` |
| `@/features/rol` | `apps/web/app/protected/page.tsx` · `bi/actions/get-bi-dashboard-data.action.ts` |
| `@/features/currency` | `business/ui/components/business-form.tsx` · `business/ui/components/business-edit-form.tsx` |
| `@/features/notifications` | `dashboard/components/header.tsx` |
| `@/features/categories` | `products/infrastructure/components/product-forms.tsx` |

> Detalle completo con `// TODO [EXTRACCION]`: buscar `TODO [EXTRACCION]` en el repo (42 ocurrencias).

---

## 4. Archivos de configuración generados / curados

| Archivo | Acción |
|---------|--------|
| `package.json` (raíz) | **Curado**: renombrado a `fiado-canal-digital`, eliminados scripts/overrides de mobile y deps de SRI. |
| `packages/core/package.json` | **Curado**: eliminadas deps de módulos excluidos (ver §6). |
| `apps/web/package.json` | **Curado**: ídem + sin OpenTelemetry extra, bcryptjs, puppeteer, etc. |
| `.env.example` | **NUEVO** (ver §5). |
| `pnpm-workspace.yaml`, `turbo.json`, `.npmrc`, `.gitignore` | Copiados tal cual. |
| `apps/web/{tsconfig.json, next.config.ts, tailwind.config.ts, postcss.config.mjs, components.json}` | Copiados tal cual (alias `@/*` y `@fiado/core` siguen siendo válidos porque se preservó la estructura). |

---

## 5. Variables de entorno requeridas (por servicio)

```
# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# WhatsApp Business Cloud API   (phone_number_id y access_token por tenant -> en BD)
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_APP_SECRET=

# Google Generative AI (insights del dashboard BI)
GOOGLE_GENERATIVE_AI_API_KEY=

# Upstash Redis (rate limiting)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Lemon Squeezy (PLACEHOLDER — no existe integración en origen)
LEMON_SQUEEZY_API_KEY=
LEMON_SQUEEZY_SIGNING_SECRET=
LEMON_SQUEEZY_STORE_ID=

# Sentry (opcional) / App
NEXT_PUBLIC_SENTRY_DSN=
NEXT_PUBLIC_SITE_URL=
```

---

## 6. Advertencias y decisiones de diseño

- **Lemon Squeezy es ficticio en el origen.** No se generó webhook `/api/webhooks/lemon-squeezy` (habría sido inventar). Solo placeholder documentado. Las variables `LEMON_SQUEEZY_*` quedan en `.env.example` para el futuro.
- **El dashboard analítico = `bi`**, no `dashboard`. Se mantuvieron ambos nombres de feature (no se renombró `bi`→`dashboard` para respetar "no refactorizar").
- **Límite de profundidad de copia:** copiar transitivamente todo el kernel (`person`, `employee`, `auth`, `currency`, `categories`, `audit-logs`, `rol`) habría arrastrado casi el monorepo completo. Se detuvo el copiado en los features adyacentes directos y se marcó el resto con TODO. **El repo NO compila tal cual**: requiere resolver los 42 TODOs (copiar/stubear el kernel o recortar las funciones que lo usan). Ver `NOTAS_EXTRACCION.md`.
- **`components/sync-status-indicator.tsx`** se copió porque `dashboard/header.tsx` lo importa, pero depende de `@/store/sync.store` (excluido). Marcado con TODO: quitar el indicador o stubear el store.
- **`bi/domain/services/PredictiveInventoryService.ts`** se incluyó por pertenecer al feature `bi`; conceptualmente roza "inventario" pero es analítica predictiva, no gestión de stock POS.
- **`package.json` curado**: se eliminaron deps de módulos excluidos. Si al resolver TODOs se reintroduce alguna pieza, puede ser necesario re-añadir su dependencia.
- **Casos dudosos:** ver `NOTAS_EXTRACCION.md` §"Casos dudosos".

---

## 7. Restricciones cumplidas
- ✅ No se copió nada de POS, offline/Dexie/sync, nómina, contabilidad doble entrada, facturación SRI, ni `apps/mobile`.
- ✅ No se modificó lógica de negocio (solo se insertaron comentarios TODO sobre imports rotos).
- ✅ No se inventaron archivos/funcionalidades (Lemon Squeezy quedó como placeholder documentado).
- ✅ No se eliminó nada del origen.
