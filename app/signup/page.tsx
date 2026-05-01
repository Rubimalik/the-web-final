"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import type { AuthError } from "@supabase/supabase-js";
import AuthLayout from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import PasswordInput from "@/components/auth/PasswordInput";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { safeReadJsonResponse } from "@/lib/safe-json";

function satisfiesPasswordRules(password: string) {
  return {
    minLength: password.length >= 8,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumber: /\d/.test(password),
    hasSymbol: /[^A-Za-z0-9]/.test(password),
  };
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

function SignUpContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const from = searchParams.get("from") || "/onboarding";

  const [supabaseClient, setSupabaseClient] = useState<ReturnType<
    typeof createSupabaseBrowserClient
  > | null>(null);
  useEffect(() => {
    setSupabaseClient(createSupabaseBrowserClient({ rememberMe: true }));
  }, []);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [acceptTerms, setAcceptTerms] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState<string>("");

  const [fieldErrors, setFieldErrors] = useState<{
    fullName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    acceptTerms?: string;
  }>({});

  const rules = satisfiesPasswordRules(password);
  const passwordOk = Object.values(rules).every(Boolean);
  const derivedConfirmError =
    confirmPassword.length > 0 && password !== confirmPassword ? "Passwords do not match." : undefined;

  useEffect(() => {
    setError("");
    setSuccess("");
    setFieldErrors({});
  }, []);

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

  async function exchangeSessionAndRedirect(
    sessionAccessToken: string,
    sessionRefreshToken: string | null,
  ) {
    if (!supabaseClient) {
      throw new Error("Authentication is still initializing. Please try again.");
    }

    const exchangeRes = await fetch("/api/auth/supabase-exchange", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        access_token: sessionAccessToken,
        refresh_token: sessionRefreshToken,
        rememberMe: true,
      }),
    });

    const data = await safeReadJsonResponse<{
      error?: string;
      profile?: ExchangeProfile;
    }>(exchangeRes, "SignUpPage exchange");
    if (!exchangeRes.ok) throw new Error(data?.error || "Failed to finalize application session.");

    const redirectTo = getRedirectPath(data?.profile, from);
    router.replace(redirectTo);
  }

  async function onSubmit(e: React.FormEvent) {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    e.preventDefault();
    if (loading) return;

    setError("");
    setSuccess("");
    setResendSuccess("");

    const nextFieldErrors: typeof fieldErrors = {};
    if (!fullName.trim() || fullName.trim().length < 2) nextFieldErrors.fullName = "Please enter your name.";
    if (!email.trim()) nextFieldErrors.email = "Please enter your email.";
    if (!passwordOk) nextFieldErrors.password = "Password doesn't meet the security requirements.";
    if (!confirmPassword) nextFieldErrors.confirmPassword = "Please confirm your password.";
    if (password && confirmPassword && password !== confirmPassword) {
      nextFieldErrors.confirmPassword = "Passwords do not match.";
    }
    if (!acceptTerms) nextFieldErrors.acceptTerms = "You must accept Terms & Privacy.";

    if (Object.keys(nextFieldErrors).length > 0) {
      setFieldErrors(nextFieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await supabaseClient.auth.signUp({
        email: email.trim().toLowerCase(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          // After email confirmation, Supabase redirects back to `/signin`
          // (where we detect the session and exchange it for the protected-route cookie).
          emailRedirectTo: `${window.location.origin}/signin?from=${encodeURIComponent(from)}&signup=1`,
        },
      });

      if (res.error || !res.data.user) {
        const err = res.error as AuthError | null;
        if (err) {
          const msg = err.message.toLowerCase();
          if (msg.includes("user already registered") || msg.includes("already registered")) {
            setError("This email is already in use. Try signing in instead.");
            return;
          }
          setError(err.message || "Sign up failed. Please try again.");
          return;
        }

        setError("Sign up failed. Please try again.");
        return;
      }

      const { data: latestSessionData, error: latestSessionError } =
        await supabaseClient.auth.getSession();
      if (latestSessionError) {
        throw latestSessionError;
      }
      const session = latestSessionData.session ?? res.data.session;

      // Email verification flow: may return user but no active session.
      if (!session?.access_token || !session.refresh_token) {
        setSuccess("Account created. Please verify your email to activate your account.");
        return;
      }

      await exchangeSessionAndRedirect(session.access_token, session.refresh_token);
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleResendVerification() {
    if (!supabaseClient) {
      setError("Authentication is still initializing. Please try again.");
      return;
    }

    if (!email.trim()) return;
    setResendLoading(true);
    setResendSuccess("");
    setError("");
    try {
      const { error: resendError } = await supabaseClient.auth.resend({
        type: "signup",
        email: email.trim().toLowerCase(),
      });
      if (resendError) throw resendError;
      setResendSuccess("Verification email sent. Please check your inbox.");
    } catch (err) {
      setError(friendlyAuthError(err));
    } finally {
      setResendLoading(false);
    }
  }

  return (
    <AuthLayout eyebrow="Create your account">
      <AuthForm
        title="Sign up"
        description="Join in minutes. You'll verify your email to activate your account."
        footer={
          <p className="text-sm text-black/60">
            Already have an account?{" "}
            <Link className="brand-accent-link font-semibold" href={`/signin?from=${encodeURIComponent(from)}`}>
              Sign in
            </Link>
          </p>
        }
      >
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="signup-fullName" className="text-sm font-semibold text-black/75">
                Name
              </label>
              <input
                id="signup-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Alex Smith"
                autoComplete="name"
                aria-invalid={!!fieldErrors.fullName}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
              />
              {fieldErrors.fullName ? (
                <p className="text-sm text-red-600" role="alert">
                  {fieldErrors.fullName}
                </p>
              ) : null}
            </div>

            <div className="space-y-2">
              <label htmlFor="signup-email" className="text-sm font-semibold text-black/75">
                Email
              </label>
              <input
                id="signup-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                autoComplete="email"
                aria-invalid={!!fieldErrors.email}
                className="w-full rounded-xl border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none transition focus:border-[var(--brand-cyan)] focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
              />
              {fieldErrors.email ? (
                <p className="text-sm text-red-600" role="alert">
                  {fieldErrors.email}
                </p>
              ) : null}
            </div>
          </div>

          <div className="space-y-2">
            <PasswordInput
              label="Password"
              value={password}
              onChange={(v) => setPassword(v)}
              placeholder="Create a strong password"
              autoComplete="new-password"
              required
              disabled={loading}
              error={fieldErrors.password}
            />

            <div className="rounded-xl border border-black/10 bg-white/60 p-4">
              <p className="text-sm font-semibold text-black/70 mb-3">Password requirements</p>
              <ul className="space-y-2 text-sm">
                <li className={rules.minLength ? "text-emerald-700" : "text-black/60"}>• At least 8 characters</li>
                <li className={rules.hasUpper ? "text-emerald-700" : "text-black/60"}>• 1 uppercase letter (A-Z)</li>
                <li className={rules.hasLower ? "text-emerald-700" : "text-black/60"}>• 1 lowercase letter (a-z)</li>
                <li className={rules.hasNumber ? "text-emerald-700" : "text-black/60"}>• 1 number (0-9)</li>
                <li className={rules.hasSymbol ? "text-emerald-700" : "text-black/60"}>• 1 symbol</li>
              </ul>
            </div>

            <PasswordInput
              label="Confirm password"
              value={confirmPassword}
              onChange={(v) => setConfirmPassword(v)}
              placeholder="Re-enter your password"
              autoComplete="new-password"
              required
              disabled={loading}
              error={fieldErrors.confirmPassword ?? derivedConfirmError}
            />
          </div>

          <div className="space-y-2">
            <label className="flex items-start gap-3 text-sm text-black/70 select-none">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-1 h-4 w-4 accent-[var(--brand-cyan)]"
              />
              <span>
                I agree to the{" "}
                <Link className="brand-accent-link font-semibold" href="/terms">
                  Terms
                </Link>{" "}
                and{" "}
                <Link className="brand-accent-link font-semibold" href="/privacy">
                  Privacy Policy
                </Link>
                .
              </span>
            </label>
            {fieldErrors.acceptTerms ? (
              <p className="text-sm text-red-600" role="alert">
                {fieldErrors.acceptTerms}
              </p>
            ) : null}
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-3 text-sm text-red-700" role="alert">
              {error}
            </div>
          ) : null}

          {success ? (
            <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm text-emerald-800" role="status">
              {success}
              <div className="mt-3 flex gap-3 flex-col sm:flex-row">
                <button
                  type="button"
                  onClick={() => void handleResendVerification()}
                  disabled={resendLoading}
                  className="w-full sm:w-auto brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {resendLoading ? (
                    <span className="inline-flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </span>
                  ) : (
                    "Resend verification email"
                  )}
                </button>
                <Link
                  href={`/signin?from=${encodeURIComponent(from)}`}
                  className="w-full sm:w-auto rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] transition text-center focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25"
                >
                  Go to Sign in
                </Link>
              </div>
              {resendSuccess ? <p className="mt-2 text-sm text-emerald-800">{resendSuccess}</p> : null}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className="w-full brand-button rounded-xl px-4 py-3 text-sm font-semibold text-black shadow-sm focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center justify-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Creating account...
              </span>
            ) : (
              "Create account"
            )}
          </button>

          <div className="text-xs text-black/45 pt-1">
            By creating an account, you agree to our Terms & Privacy.
          </div>
        </form>
      </AuthForm>
    </AuthLayout>
  );
}

export default function SignUpPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <SignUpContent />
    </Suspense>
  );
}

