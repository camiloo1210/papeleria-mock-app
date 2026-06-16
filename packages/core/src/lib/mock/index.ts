export function isMockMode(): boolean {
  return process.env.NEXT_PUBLIC_USE_MOCK === 'true';
}

export { createMockSupabaseClient } from './mock-supabase-client';
export { getMockStore, resetMockStore, MOCK_AUTH_USER } from './mock-data';
