"use client";

import { FormEvent, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { AlertCircle, Loader2, ShieldCheck } from "lucide-react";
import { safeReadJsonResponse } from "@/lib/safe-json";

export default function DealerLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromParam = searchParams.get("from");
  const from = fromParam?.startsWith("/dealer") ? fromParam : "/dealer";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth/dealer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const payload = await safeReadJsonResponse<{
        error?: string;
        redirectTo?: string;
        dealerStatus?: string;
      }>(
        response,
        "DealerLoginForm login",
      );

      if (!response.ok) {
        setError(payload?.error || "Login failed");
        return;
      }

      const redirectTo =
        payload?.dealerStatus === "approved"
          ? from
          : payload?.redirectTo || "/dealer/status";

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-2xl brand-surface p-6 sm:p-7">
      <div className="mb-6">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-full bg-cyan-50 text-[var(--brand-cyan)]">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold text-black">Account Login</h2>
        <p className="mt-1 text-sm text-black/60">
          Use your approved account email and password.
        </p>
      </div>

      <form onSubmit={(event) => void handleSubmit(event)} className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-black/75">Email</label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            required
            autoComplete="email"
            placeholder="account@example.com"
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 text-sm text-black placeholder:text-black/40 focus:border-[var(--brand-cyan)] focus:outline-none"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-black/75">Password</label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            required
            autoComplete="current-password"
            placeholder="Enter your password"
            className="mt-2 w-full rounded-lg border border-black/15 bg-white px-3 py-3 text-sm text-black placeholder:text-black/40 focus:border-[var(--brand-cyan)] focus:outline-none"
          />
        </div>

        {error ? (
          <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg brand-button py-3 text-sm disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Verifying...
            </>
          ) : (
            "Sign In"
          )}
        </button>
      </form>

      <p className="mt-5 text-center text-xs text-black/50">
        Not approved yet?{" "}
        <Link href="/contact" className="font-semibold hover:text-[var(--brand-pink-hover)]">
          Contact BuySupply
        </Link>
      </p>
    </section>
  );
}
