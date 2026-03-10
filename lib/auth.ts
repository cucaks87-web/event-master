'use client';

import { getSupabaseBrowserClient } from '@/lib/supabase';

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error('Supabase nije podešen.');
  const { error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
}

export async function sendMagicLink(email: string) {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) throw new Error('Supabase nije podešen.');
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
    }
  });
  if (error) throw error;
}

export async function signOutSupabase() {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return;
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function getSessionEmail(): Promise<string | null> {
  const supabase = getSupabaseBrowserClient();
  if (!supabase) return null;
  const { data, error } = await supabase.auth.getSession();
  if (error) throw error;
  return data.session?.user?.email ?? null;
}
