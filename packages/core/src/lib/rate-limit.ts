import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Create a new ratelimiter, that calls the Upstash Redis REST API
const redis = process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

if (!redis) {
    console.warn("⚠️ Upstash Redis not configured. Rate limiting is DISABLED.");
}

// Fallback for when Redis is not configured — fail open (allow requests)
const failOpenLimiter = {
    limit: async () => {
        return { success: true, limit: 0, remaining: 0, reset: 0 };
    },
} as unknown as Ratelimit;

// Auth Rate Limiter (Login/SignUp — brute force protection)
// 5 requests per 60 seconds per IP
export const authRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(5, "60 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/auth",
    })
    : failOpenLimiter;

// Standard API Rate Limiter (e.g. Protected routes)
// 30 requests per 10 seconds per IP
export const ratelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(30, "10 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/api",
    })
    : failOpenLimiter;

// Webhook Rate Limiter (WhatsApp, Stripe, etc.)
// 1000 requests per 60 seconds (High throughput for batch updates)
export const webhookRatelimit = redis
    ? new Ratelimit({
        redis,
        limiter: Ratelimit.slidingWindow(1000, "60 s"),
        analytics: true,
        prefix: "@upstash/ratelimit/webhook",
    })
    : failOpenLimiter;

