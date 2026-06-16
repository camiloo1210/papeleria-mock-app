const MOCK_URL = 'https://mock.supabase.co';
const MOCK_KEY = 'mock-anon-key';

/**
 * Validates and returns Supabase environment variables.
 * In mock mode (USE_MOCK=true) returns dummy values so no real connection is made.
 */
export function getSupabaseEnv() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return { url: MOCK_URL, key: MOCK_KEY };
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_URL environment variable.\n' +
      'Please add it to your .env.local file:\n' +
      'NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url\n' +
      'Get your URL from: https://supabase.com/dashboard/project/_/settings/api'
    );
  }

  if (!key) {
    throw new Error(
      'Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable.\n' +
      'Please add it to your .env.local file:\n' +
      'NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key\n' +
      'Get your key from: https://supabase.com/dashboard/project/_/settings/api'
    );
  }

  return { url, key };
}

export function getSupabaseServiceRoleKey() {
  if (process.env.NEXT_PUBLIC_USE_MOCK === 'true') {
    return 'mock-service-role-key';
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error(
      'Missing SUPABASE_SERVICE_ROLE_KEY environment variable.\n' +
      'Please add it to your .env.local file:\n' +
      'SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key\n' +
      'Get your key from: https://supabase.com/dashboard/project/_/settings/api'
    );
  }

  return serviceRoleKey;
}
