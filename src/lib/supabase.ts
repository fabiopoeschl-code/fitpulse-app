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

export async function signInWithEmail(email: string, password: string) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase Cloud ist nicht konfiguriert.');
  }
  const { data, error } = await client.auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) {
    throw error;
  }
  return data;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
) {
  const client = getSupabaseClient();
  if (!client) {
    throw new Error('Supabase Cloud ist nicht konfiguriert.');
  }
  const cleanEmail = email.trim().toLowerCase();
  const cleanName =
    displayName?.trim() || cleanEmail.split('@')[0] || 'FitPulse Athlet';

  const { data, error } = await client.auth.signUp({
    email: cleanEmail,
    password,
    options: {
      data: {
        display_name: cleanName,
        full_name: cleanName,
      },
    },
  });

  if (error) {
    throw error;
  }

  // Falls trotz Auto-Confirm-Trigger noch keine Session zurückkam, direkt einloggen
  if (data.user && !data.session) {
    const signInRes = await client.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (!signInRes.error) {
      return signInRes.data;
    }
  }

  return data;
}

export async function signOutUser() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
}

export type { User };
