import { createClient } from "@supabase/supabase-js";

const authOptions = {
  autoRefreshToken: false,
  persistSession: false,
  detectSessionInUrl: false,
};

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function requireSupabaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL ||
    process.env.SUPABASE_URL ||
    (() => {
      throw new Error("SUPABASE_URL is not configured");
    })()
  );
}

function requireSupabaseAnonKey() {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.SUPABASE_ANON_KEY ||
    (() => {
      throw new Error("SUPABASE_ANON_KEY is not configured");
    })()
  );
}

export function createSupabaseAnonClient() {
  return createClient(
    requireSupabaseUrl(),
    requireSupabaseAnonKey(),
    {
      auth: authOptions,
    }
  );
}

export function createSupabaseServiceRoleClient() {
  return createClient(
    requireSupabaseUrl(),
    requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    {
      auth: authOptions,
    }
  );
}
