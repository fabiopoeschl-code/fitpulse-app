import { createClient, type SupabaseClient, type User } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
    supabaseKey &&
    !supabaseUrl.includes('dein-projekt') &&
    supabaseUrl.startsWith('http')
);

let supabaseInstance: SupabaseClient | null = null;

export function getSupabaseClient(): SupabaseClient | null {
  if (!isSupabaseConfigured) return null;
  if (!supabaseInstance) {
    supabaseInstance = createClient(supabaseUrl, supabaseKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
      },
    });
  }
  return supabaseInstance;
}

export async function signInWithGoogle() {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error(
      'Supabase ist noch nicht in .env.local konfiguriert. Bitte trage NEXT_PUBLIC_SUPABASE_URL und NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ein.'
    );
  }
  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

  return client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'consent',
      },
    },
  });
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export type { User };
