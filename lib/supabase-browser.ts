import { createClient, type SupabaseClient } from "@supabase/supabase-js";

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

type CreateSupabaseBrowserClientOptions = {
  /**
   * When `false`, tokens are stored in `sessionStorage` so they are cleared when the
   * tab/window is closed.
   *
   * When `true`, tokens are stored in `localStorage` for cross-tab persistence.
   */
  rememberMe: boolean;
};

/**
 * Browser client for Supabase Auth.
 *
 * - `detectSessionInUrl: true` is required to handle OAuth redirects.
 * - We intentionally use a client-side storage medium so the auth SDK can keep
 *   the session alive in the browser.
 */
export function createSupabaseBrowserClient(
  options: CreateSupabaseBrowserClientOptions,
): SupabaseClient {
  if (typeof window === "undefined") {
    throw new Error("createSupabaseBrowserClient() must run in the browser");
  }

  const supabaseUrl = requireSupabaseUrl();
  const supabaseAnonKey = requireSupabaseAnonKey();

  const storage = options.rememberMe ? window.localStorage : window.sessionStorage;

  // A fixed storageKey ensures we can reliably read/write the same auth blob.
  const storageKey = "buysupply_auth";

  return createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storageKey,
      persistSession: options.rememberMe,
      detectSessionInUrl: true,
      autoRefreshToken: options.rememberMe,
      storage,
      // We use PKCE with OAuth providers.
      flowType: "pkce",
    },
  });
}

