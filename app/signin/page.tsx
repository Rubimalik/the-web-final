"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import PasswordInput from "@/components/auth/PasswordInput";
import SocialLoginButton from "@/components/auth/SocialLoginButton";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeReadJsonResponse } from "@/lib/safe-json";
import type { AuthError } from "@supabase/supabase-js";
import { Loader2 } from "lucide-react";

function isLikelyEmailError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const s = msg.toLowerCase();
  return (
    s.includes("invalid login credentials") ||
    s.includes("invalid email") ||
    s.includes("incorrect email") ||
    s.includes("email or password") ||
    s.includes("invalid") ||
    s.includes("wrong password")
  );
}

function isUnverifiedEmailError(err: unknown) {
  const msg = err instanceof Error ? err.message : String(err);
  const s = msg.toLowerCase();
  return s.includes("email") && (s.includes("confirm") || s.includes("not confirmed") || s.includes("unverified"));
}

function GoogleIcon() {
  return (
    <span
      aria-hidden="true"
      className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-black/10 bg-white"
    >
      <span className="text-[11px] font-black text-black/70">G</span>
    </span>
  );
}

function friendlyAuthError(err: unknown) {
  if (!(err instanceof Error)) return "Something went wrong. Please try again.";
  const msg = err.message || "";
  const m = msg.toLowerCase();

  if (m.includes("supabase_url") || m.includes("supabase anon key") || m.includes("supabase_anon_key")) {
    return "Supabase isn't configured. Please try again later.";
  }

  if (m.includes("failed to exchange session") || m.includes("exchange session")) {
    return "We couldn't establish your session. Please try signing in again.";
  }

  return msg || "Something went wrong. Please try again.";
}

function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/dashboard";

  type ExchangeProfile = {
    role?: string;
    onboarding_completed?: boolean;
  };

  function getRedirectPath(profile: ExchangeProfile | null | undefined, fallback: string) {
    if (!profile) return fallback;
    if (profile.onboarding_completed === false) return "/onboarding";
    if (profile.role === "admin") return "/dashboard";
    return "/products";
  }

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);

  const [loading, setLoading] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  // Forgot password UI
  const [showReset, setShowReset] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState<string>("");

  const [showVerification, setShowVerification] = useState(false);
  const [verificationLoading, setVerificationLoading] = useState(false);
  const [verificationSuccess, setVerificationSuccess] = useState<string>("");

  const [supabaseClient, setSupabaseClient] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);

  useEffect(() => {
    setSupabaseClient(createSupabaseBrowserClient({ rememberMe }));
  }, [rememberMe]);

  useEffect(() => {
    // If Supabase has already established a session (e.g. after email confirmation),
    // we can exchange it into the app's iron-session cookie.
    let cancelled = false;

    async function tryExchange() {
      if (!supabaseClient) return;
      try {
        setError("");
        setSubmitSuccess("");

        const { data: sessionData, error: sessionError } = await supabaseClient.auth.getSession();
        if (sessionError) return;

        const session = sessionData.session;
        if (!session?.access_token || !session.refresh_token) return;

        // Avoid exchange loops during navigation/remount.
        const key = `buysupply_auth_exchanged_${session.user.id}`;
        if (sessionStorage.getItem(key) === "1") {
          router.replace(from);
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

        const data = await safeReadJsonResponse<{ error?: string; profile?: ExchangeProfile }>(
          res,
          "SignInPage auto-exchange",
        );
        if (!res.ok) throw new Error(data?.error || "Failed to finalize session.");

        sessionStorage.setItem(key, "1");
        router.replace(getRedirectPath(data?.profile, from));
      } catch (e) {
        if (cancelled) return;
        // Don't block rendering, but show a friendly message for configuration issues.
        console.warn("[SignInPage tryExchange]", e);
        setError(friendlyAuthError(e));
      }
    }

    void tryExchange();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, rememberMe, router, supabaseClient]);

  async function handleEmailPasswordSignIn(e: React.FormEvent) {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    e.preventDefault();
    if (loading) return;

    setError("");
    setSubmitSuccess("");
    setFieldErrors({});
    setShowVerification(false);
    setVerificationSuccess("");

    const nextFieldErrors: typeof fieldErrors = {};
    if (!email.trim()) nextFieldErrors.email = "Email is required.";
    if (!password) nextFieldErrors.password = "Password is required.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await supabaseClient.auth.signInWithPassword({
        email: email.trim().toLowerCase(),
        password,
      });

      if (res.error || !res.data.user) {
        const err = res.error as AuthError | null;
        if (err) {
          if (isUnverifiedEmailError(err)) {
            setError("Please verify your email address before signing in.");
          } else if (isLikelyEmailError(err)) {
            setError("Invalid email or password.");
          } else {
            setError(err.message || "Sign in failed. Please try again.");
          }
          return;
        }

        setError("Invalid email or password.");
        return;
      }

      // Read the active session from the auth client to ensure both tokens are present.
      const { data: latestSessionData, error: latestSessionError } =
        await supabaseClient.auth.getSession();
      if (latestSessionError) {
        throw latestSessionError;
      }
      const session = latestSessionData.session ?? res.data.session;
      if (!session?.access_token || !session.refresh_token) {
        setShowVerification(true);
        setError("Please verify your email address before signing in.");
        return;
      }

      const exchangeRes = await fetch("/api/auth/supabase-exchange", {
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
      }>(exchangeRes, "SignInPage exchange");
      if (!exchangeRes.ok) {
        throw new Error(data?.error || "Failed to finalize application session.");
      }

      setSubmitSuccess("Signed in successfully.");

      // Tiny delay for perceived responsiveness.
      setTimeout(() => router.replace(getRedirectPath(data?.profile, from)), 250);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleOAuth() {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    setError("");
    setSubmitSuccess("");

    try {
      setLoading(true);

      // Supabase Google OAuth setup notes:
      // - Enable the "Google" provider in Supabase Auth.
      // - In Supabase OAuth redirect URLs, allow: `${origin}/auth/callback` (and include query params if needed).
      // - This app finishes OAuth in `app/auth/callback/page.tsx` and then exchanges the Supabase session
      //   for the server-side iron-session cookie used by protected routes.
      const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(from)}&remember=${
        rememberMe ? "1" : "0"
      }`;

      const res = await supabaseClient.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });

      if (res.error) {
        setError(res.error.message || "Google sign-in failed. Please try again.");
      }
      // signInWithOAuth triggers redirect. If it doesn't, we show a friendly message.
      if (!res.data?.url) {
        setError("Google sign-in did not redirect. Please try again.");
      }
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResetPassword() {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    if (resetLoading) return;
    setResetSuccess("");
    setError("");

    const trimmed = email.trim().toLowerCase();
    if (!trimmed) {
      setFieldErrors((v) => ({ ...v, email: "Enter your email to reset your password." }));
      return;
    }

    try {
      setResetLoading(true);

      const redirectTo = `${window.location.origin}/signin?from=${encodeURIComponent(from)}&reset=1`;
      const { error: resetError } = await supabaseClient.auth.resetPasswordForEmail(trimmed, {
        redirectTo,
      });

      if (resetError) {
        setError(resetError.message || "Failed to send reset email.");
        return;
      }

      setResetSuccess("Check your inbox for a password reset link.");
      setShowReset(false);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setResetLoading(false);
    }
  }

  useEffect(() => {
    const reset = searchParams.get("reset");
    if (reset === "1") {
  setResetSuccess("If an account exists for that email, you'll receive a reset link shortly.");
      setShowReset(false);
    }
  }, [searchParams]);

  async function handleResendVerification() {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    if (verificationLoading) return;
    setVerificationLoading(true);
    setVerificationSuccess("");
    setError("");
    try {
      const targetEmail = email.trim().toLowerCase();
      const { error: resendError } = await supabaseClient.auth.resend({
        type: "signup",
        email: targetEmail,
      });
      if (resendError) throw resendError;
      setVerificationSuccess("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to resend verification email.");
    } finally {
      setVerificationLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Account access">
      <AuthForm
        title="Sign in"
        description="Use your email & password or continue with Google."
        footer={
          <p className="text-sm text-black/60">
            New here?{" "}
            <Link className="brand-accent-link font-semibold" href="/signup">
              Create an account
            </Link>
          </p>
        }
      >
        <form onSubmit={handleEmailPasswordSignIn} className="space-y-4">
          <div className="space-y-2">
            <label htmlFor="signin-email" className="text-sm font-semibold text-black/75">
              Email
            </label>
            <input
              id="signin-email"
              name="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              autoComplete="email"
              aria-invalid={!!fieldErrors.email}
              aria-describedby={fieldErrors.email ? "signin-email-error" : undefined}
              className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
            />
            {fieldErrors.email ? (
              <p id="signin-email-error" className="text-sm text-red-600" role="alert">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <PasswordInput
            label="Password"
            value={password}
            onChange={setPassword}
            placeholder="Your password"
            autoComplete="current-password"
            required
            disabled={loading}
            error={fieldErrors.password}
            name="password"
          />

          <div className="flex items-center justify-between gap-3">
            <label className="inline-flex items-center gap-2 text-sm text-black/70 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[var(--brand-cyan)]"
              />
              Remember me
            </label>

            <button
              type="button"
              onClick={() => {
                setError("");
                setFieldErrors({});
                setShowReset((v) => !v);
              }}
              className="text-sm font-semibold text-black/70 hover:text-[var(--brand-cyan)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 rounded-lg px-2 py-1"
            >
              Forgot password?
            </button>
          </div>

          {showReset ? (
            <div className="rounded-xl border border-black/10 bg-white/60 p-4 space-y-3 animate-[fadeIn_200ms_ease-out]">
              <p className="text-sm text-black/70 font-semibold">
                We&apos;ll email you a reset link.
              </p>
              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={() => setShowReset(false)}
                  disabled={resetLoading}
                  className="w-full sm:w-auto rounded-xl border border-black/15 bg-white px-4 py-3 text-sm font-semibold text-black/75 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-60"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleResetPassword()}
                  disabled={resetLoading}
                  className="w-full sm:w-auto brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {resetLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Send reset link"
                  )}
                </button>
              </div>
              {resetSuccess ? (
                <p className="text-sm text-emerald-700" role="status">
                  {resetSuccess}
                </p>
              ) : null}
            </div>
          ) : null}

          {showVerification ? (
            <div className="rounded-xl border border-black/10 bg-white/60 p-4 space-y-3 animate-[fadeIn_200ms_ease-out]">
              <p className="text-sm text-black/70 font-semibold">
                Check your inbox to verify your email.
              </p>

              <div className="flex gap-3 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={verificationLoading}
                  className="w-full sm:w-auto brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {verificationLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Resend verification email"
                  )}
                </button>

                <Link
                  href={`/signup?from=${encodeURIComponent(from)}`}
                  className="w-full sm:w-auto rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition text-center focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
                >
                  Create another account
                </Link>
              </div>

              {verificationSuccess ? (
                <p className="text-sm text-emerald-800" role="status">
                  {verificationSuccess}
                </p>
              ) : null}
            </div>
          ) : null}

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          {submitSuccess ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-800" role="status">
              {submitSuccess}
            </div>
          ) : null}

          {resetSuccess && !showReset ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-800" role="status">
              {resetSuccess}
            </div>
          ) : null}

          <div className="pt-1 space-y-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </span>
              ) : (
                "Sign in"
              )}
            </button>

            <div className="relative">
              <div className="absolute inset-0 flex items-center" aria-hidden="true">
                <span className="w-full border-t border-black/10" />
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-3 text-xs text-black/50 font-semibold">or</span>
              </div>
            </div>

            <SocialLoginButton
              label={loading ? "Redirecting..." : "Continue with Google"}
              disabled={false}
              loading={loading}
              icon={<GoogleIcon />}
              onClick={() => void handleGoogleOAuth()}
            />
          </div>
        </form>

        <div className="mt-4 text-xs text-black/45 leading-relaxed">
          By continuing, you agree to our Terms & Privacy.
        </div>
      </AuthForm>
    </AuthLayout>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignInContent />
    </Suspense>
  );
}

