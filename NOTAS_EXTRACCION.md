# NOTAS DE EXTRACCIÓN — observaciones técnicas y recomendaciones

Documento para el equipo **antes** de arrancar desarrollo sobre `Fiado-Canal-Digital`.
Regla aplicada: durante la extracción **no se modificó lógica de negocio**; aquí se anota
lo detectado, sin cambiarlo.

---

## 1. Estado del repositorio: NO compila tal cual (esperado)

La extracción dejó **42 imports rotos** marcados con `// TODO [EXTRACCION]`.
Búscalos con: `grep -rn "TODO [EXTRACCION]" .`

Se dividen en dos categorías:

### A) Módulos EXCLUIDOS por restricción (no deben volver)
- `@/features/accounting` (contabilidad doble entrada)
- `@/features/sales` (POS)
- `@/lib/db` (Dexie / IndexedDB / offline)
- `@/store/sync.store` (sync engine)

**Acción recomendada:** *recortar* (no reimplementar) las llamadas. Ejemplos:
- En `supabase-marketplace.repository.ts`, los `recordSaleAction` / `recordPurchaseAction`
  (contabilidad) deben envolverse en un puerto/interfaz opcional o eliminarse: el canal
  digital trabaja a crédito; el asiento contable es responsabilidad del backoffice original.
- En `products/infrastructure/supabase-product.repository.ts` y `local-product.mapper.ts`,
  la ruta Dexie (`db`) corresponde al modo offline POS. Para el canal web (siempre online)
  debe sustituirse por la ruta Supabase directa que ya existe en el mismo repo.
- `sync-status-indicator` debe retirarse del `dashboard/header.tsx` (no hay sync aquí).

### B) Kernel compartido NO extraído (decisión de límite de alcance)
`auth`, `employee`, `person`, `currency`, `categories`, `audit-logs`, `rol`,
`notifications`.

Estos **no son excluidos** por la consigna, pero arrastrarlos transitivamente implicaba
copiar casi todo el monorepo. **Decisión:** detener el copiado y marcar con TODO.

**Acción recomendada (elige una por módulo):**
1. **Copiar el módulo** desde `T:\Fiado\packages\core\src\features\<modulo>` si la
   funcionalidad es necesaria (p. ej. `auth` es casi seguro necesario para sesión/login;
   `permissions` ya depende de `employee`).
2. **Stubear** con una interfaz mínima si solo se usa 1-2 funciones.
3. **Eliminar** la rama de código que lo usa si no aplica al canal digital.

> Prioridad realista para un MVP del canal: copiar **`auth`** y **`employee`** (los más
> entrelazados con permisos y BI), stubear `audit-logs` y `notifications`, y resolver
> `currency`/`categories`/`person`/`rol` según se necesiten en business/products.

---

## 2. Pagos — Lemon Squeezy no existe en el origen

El alcance asumía Lemon Squeezy + webhook, pero **en el código origen no hay ninguna
integración de pagos**. Los pedidos se registran **a crédito ("fiado")**:
`supabase-marketplace.repository.ts` → "Marketplace orders are usually pending payment
verification or credit".

- Se dejó `marketplace/payments/lemon-squeezy.placeholder.ts` con los puntos de
  integración documentados (webhook a crear, checkout a extender, env vars).
- **Recomendación:** decidir producto antes de implementar — ¿el canal cobra online
  (Lemon Squeezy) o mantiene el modelo a crédito? El código actual soporta solo crédito.

---

## 3. Deuda técnica detectada (NO modificada)

- **`products` mezcla offline y online:** el repositorio de productos tiene dos rutas
  (Dexie local + Supabase). Para el canal digital sobra la mitad. Refactor pendiente:
  separar `LocalProductRepository` (offline POS) de `SupabaseProductRepository` (web).
- **`business/create-business.use-case.ts` es un "god use-case":** crea Person + Employee
  + Business + asiento contable en una sola operación, acoplando 4 features. Difícil de
  extraer limpio. Considerar dividir responsabilidades.
- **Acoplamiento UI ↔ infraestructura en `products`:** los formularios viven en
  `products/infrastructure/components/` (capa equivocada según la propia arquitectura
  domain/application/infrastructure/ui). Mover a `ui/` en un refactor futuro.
- **Scripts de BI versionados dentro del feature:** `bi/scripts/*` usan `dotenv`/`fs` y
  son utilidades de mantenimiento de esquema; no son código de runtime. Considerar
  moverlos a `tools/` o `scripts/` del repo.
- **`@radix-ui/react-visually-hidden`** lo usa una vista de marketplace pero no está en
  `packages/core` sino solo en `apps/web`; verificar que quede en el `package.json` correcto.
- **`package.json` curado de forma conservadora:** si al resolver los TODOs se reintroduce
  una pieza del kernel, puede faltar su dependencia (p. ej. `bcryptjs` si se copia `auth`).

---

## 4. Casos dudosos (incluidos pero a revisar) — NO copiar más sin confirmar

| Caso | Qué se hizo | Recomendación |
|------|-------------|---------------|
| `bi/domain/services/PredictiveInventoryService.ts` | Copiado (es parte de `bi`) | Roza "inventario". Confirmar que la analítica predictiva es deseada en el canal; si no, eliminar. |
| `bi/scripts/*` (apply/inspect/verify schema) | Copiados | Son utilidades DevOps de BD, no runtime. Mover fuera del paquete o excluir. |
| `procurement/ui/marketplace-cart-sidebar.tsx` | Copiado (1 archivo) | Importa `@/features/sales/ui/pos/types` (POS, EXCLUIDO). Definir `PosCartItem` localmente o usar el tipo de `marketplace/domain`. |
| `dashboard/` (sidebar/header/user-nav) | Copiado completo | El sidebar lista enlaces a módulos NO extraídos (POS, nómina, etc.). Habrá que **podar el menú** a solo Marketplace + BI. |
| `auth/*` rutas web | Copiadas | Dependen del feature `auth` no extraído. Copiar el feature o sustituir por auth de Supabase directo. |
| `features/shared/strategies` (national-id / tax-id Ecuador) | Copiadas | Llegaron porque `TaxId` value-object las usa. Son de validación de cédula/RUC, no de SRI; OK mantener. Se EXCLUYERON las de *invoicing-rules* (SRI). |

---

## 5. Recomendaciones antes de arrancar

1. **Resolver primero los TODOs de la categoría A (excluidos):** son los que garantizan
   que no se reintroduzca POS/offline/contabilidad. Recortar, no reimplementar.
2. **Decidir el kernel (categoría B):** copiar `auth` + `employee` desde el origen es el
   camino más corto a un build verde. Hacerlo en un commit aparte y rastreable.
3. **Podar el `dashboard/sidebar`** a Marketplace + BI.
4. **Definir el modelo de pagos** (crédito vs Lemon Squeezy) antes de tocar checkout.
5. `pnpm install` y luego `pnpm type-check` para obtener la lista viva de errores que
   complementa los 42 TODOs (habrá errores de tipos por los módulos faltantes).
6. **Verificar el esquema de Supabase**: las tablas (`whatsapp_config`, marketplace,
   business_ratings, business_relationship, bi_*) deben existir en el proyecto destino.
   Revisar `T:\Fiado\supabase` para las migraciones correspondientes (no se copiaron).

---

## 6. Lo que explícitamente NO se copió (restricciones absolutas)
POS / punto de venta · offline-first / IndexedDB / Dexie / sync engine · nómina (payroll)
· contabilidad doble entrada (accounting) · facturación electrónica SRI
(electronic-billing, invoicing, xml-crypto, node-forge) · `apps/mobile` · cualquier feature
fuera de marketplace / bi / dashboard y sus adyacentes directos.
