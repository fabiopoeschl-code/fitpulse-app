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
    throw new Error('Supabase Cloud ist nicht konfiguriert.');
  }

  // Check if Google OAuth provider is enabled in Supabase Auth settings so the user never lands on a raw 400 JSON page
  try {
    const res = await fetch(`${supabaseUrl}/auth/v1/settings`, {
      headers: {
        apikey: supabaseKey,
      },
    });
    if (res.ok) {
      const settings = await res.json();
      if (settings?.external && settings.external.google === false) {
        const notEnabledError = new Error('GOOGLE_PROVIDER_NOT_ENABLED');
        throw notEnabledError;
      }
    }
  } catch (err) {
    if (err instanceof Error && err.message === 'GOOGLE_PROVIDER_NOT_ENABLED') {
      throw err;
    }
  }

  const redirectTo =
    typeof window !== 'undefined' ? `${window.location.origin}/` : undefined;

  const { data, error } = await client.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      queryParams: {
        access_type: 'offline',
        prompt: 'select_account',
      },
    },
  });

  if (error) {
    throw error;
  }
  return data;
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
