import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseEnv } from "./env";
import { createMockSupabaseClient } from "../mock/mock-supabase-client";

export function createClient() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return createMockSupabaseClient() as any;
  }
  const { url, key } = getSupabaseEnv();
  return createBrowserClient(url, key);
}
