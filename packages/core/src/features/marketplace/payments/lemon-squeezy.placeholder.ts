/**
 * =============================================================================
 *  PLACEHOLDER — Integración de pagos con Lemon Squeezy
 * =============================================================================
 *
 * IMPORTANTE (decisión de extracción):
 * En el repositorio ORIGEN (T:\Fiado) NO existe ninguna integración con Lemon
 * Squeezy ni con ningún procesador de pagos. El flujo real del marketplace
 * registra los pedidos A CRÉDITO ("fiado"): ver
 *   ../infrastructure/supabase-marketplace.repository.ts
 *   (los pedidos quedan "pending payment verification or credit").
 *
 * Este archivo es SOLO un marcador para una futura integración. No contiene
 * lógica funcional (por la regla "no inventar código" durante la extracción).
 *
 * Para implementar Lemon Squeezy más adelante, los puntos de integración son:
 *
 *   1. Webhook de Lemon Squeezy:
 *        apps/web/app/api/webhooks/lemon-squeezy/route.ts   (POR CREAR)
 *        - Verificar firma HMAC con LEMON_SQUEEZY_SIGNING_SECRET.
 *        - Mapear `order_created` / `subscription_payment_success` al pedido
 *          del marketplace y marcarlo como pagado.
 *
 *   2. Creación de checkout:
 *        marketplace/actions/get-checkout-context.action.ts (existe)
 *        marketplace/actions/place-marketplace-order.action.ts (existe)
 *        - Reemplazar/extender el flujo a crédito por la creación de un
 *          checkout de Lemon Squeezy con LEMON_SQUEEZY_API_KEY.
 *
 *   3. Variables de entorno (ver .env.example):
 *        LEMON_SQUEEZY_API_KEY
 *        LEMON_SQUEEZY_SIGNING_SECRET
 *        LEMON_SQUEEZY_STORE_ID
 *
 * TODO [EXTRACCION]: Implementar la integración real con Lemon Squeezy.
 * =============================================================================
 */

export const LEMON_SQUEEZY_NOT_IMPLEMENTED = true as const;
