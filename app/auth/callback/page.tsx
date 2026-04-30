"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeReadJsonResponse } from "@/lib/safe-json";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const nextPath = searchParams.get("next") || "/dashboard";
  const remember = searchParams.get("remember") ?? "1";
  const rememberMe = remember !== "0";

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const [supabase, setSupabase] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  const oauthError = searchParams.get("error");
  const oauthErrorDescription = searchParams.get("error_description");

  type ExchangeProfile = {
    role?: string;
    onboarding_completed?: boolean;
  };

  const getRedirectPath = useCallback(
    (profile: ExchangeProfile | null | undefined, fallback: string) => {
      if (!profile) return fallback;
      if (profile.onboarding_completed === false) return "/onboarding";
      if (profile.role === "admin") return "/dashboard";
      return "/products";
    },
    [],
  );

  useEffect(() => {
    setSupabase(createSupabaseBrowserClient({ rememberMe }));
  }, [rememberMe]);

  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!supabase) return;
      try {
        if (oauthError || oauthErrorDescription) {
          throw new Error(
            oauthErrorDescription ||
              oauthError ||
              "OAuth sign-in failed. Please try again.",
          );
        }

        // `detectSessionInUrl: true` allows the Supabase client to finalize OAuth.
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) throw sessionError;

        const session = sessionData.session;
        if (!session?.access_token || !session.refresh_token || !session.user) {
          throw new Error("No active session found. Please try signing in again.");
        }

        // Prevent repeated exchange on remount based on actual user id.
        const userCacheKey = `buysupply_auth_callback_exchanged_${session.user.id}`;
        if (typeof window !== "undefined" && sessionStorage.getItem(userCacheKey) === "1") {
          router.replace(nextPath);
          return;
        }

        const res = await fetch("/api/auth/supabase-exchange", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            access_token: session.access_token,
            refresh_token: session.refresh_token,
            rememberMe,
          }),
        });

        const data = await safeReadJsonResponse<{
          error?: string;
          profile?: ExchangeProfile;
        }>(res, "AuthCallback exchange");
        if (!res.ok) {
          throw new Error(data?.error || "Failed to establish application session.");
        }

        if (typeof window !== "undefined") sessionStorage.setItem(userCacheKey, "1");
        router.replace(getRedirectPath(data?.profile, nextPath));
      } catch (e) {
        if (cancelled) return;
        setError(e instanceof Error ? e.message : "Authentication failed. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    run();
    return () => {
      cancelled = true;
    };
  }, [nextPath, rememberMe, router, oauthError, oauthErrorDescription, supabase, getRedirectPath]);

  return (
    <AuthLayout eyebrow="Authentication">
      <div className="w-full rounded-2xl border border-black/10 bg-white/80 p-6 sm:p-7 shadow-sm">
        <div className="space-y-3">
          <h1 className="text-2xl font-bold leading-tight">Signing you in</h1>
          <p className="text-sm text-black/65">
            Finishing Google OAuth. Please wait...
          </p>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          <div className="pt-2">
            <SocialLoginButton
              label={loading ? "Processing..." : "Continue"}
              disabled
              loading={loading}
              onClick={() => {}}
            />
          </div>

          {!loading ? (
            <p className="text-xs text-black/45 pt-2">
              If you were redirected from an OAuth provider and still see an error, try signing in again.
            </p>
          ) : null}
        </div>
      </div>
    </AuthLayout>
  );
}

