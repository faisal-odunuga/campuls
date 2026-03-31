import { createClient as createSupabaseClient } from '@supabase/supabase-js';

function getEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL ?? process.env.SUPABASE_URL;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? process.env.SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  return { url, key };
}

export async function createClient(accessToken?: string) {
  const env = getEnv();
  if (!env) {
    throw new Error('Supabase environment variables are missing.');
  }

  return createSupabaseClient(env.url, env.key, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    },
    global: accessToken
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      : undefined
  });
}

export function supabaseConfigured() {
  return Boolean(getEnv());
}

export function createAdminClient() {
  const env = getEnv();
  if (!env || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error('Supabase admin environment variables are missing.');
  }

  return createSupabaseClient(env.url, process.env.SUPABASE_SERVICE_ROLE_KEY, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
      detectSessionInUrl: false
    }
  });
}
