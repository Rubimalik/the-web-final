"use client";

import Link from "next/link";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error boundary]", error);
  }, [error]);

  return (
    <main className="min-h-screen bg-white px-4 py-10 text-black font-myriad">
      <section className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-2xl flex-col items-center justify-center text-center">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/logo.png" alt="BuySupply" className="mb-7 h-auto w-28 sm:w-32" />
        <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--brand-cyan)]">
          Something went wrong
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight brand-title sm:text-5xl">
          We could not load this page.
        </h1>
        <p className="mt-5 max-w-lg text-sm leading-6 text-black/65 sm:text-base">
          Please try again. If the problem continues, our team can still help with products, orders, or enquiries.
        </p>
        {error.digest ? (
          <p className="mt-4 text-xs font-semibold text-black/45">Reference: {error.digest}</p>
        ) : null}
        <div className="mt-8 flex w-full flex-col items-center justify-center gap-3 sm:w-auto sm:flex-row">
          <button
            type="button"
            onClick={reset}
            className="brand-button inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-bold sm:w-auto"
          >
            Try again
          </button>
          <Link
            href="/"
            className="inline-flex w-full items-center justify-center rounded-lg border border-black/20 bg-white px-5 py-3 text-sm font-bold text-black transition hover:border-[var(--brand-cyan)] hover:text-[var(--brand-cyan)] sm:w-auto"
          >
            Go home
          </Link>
        </div>
      </section>
    </main>
  );
}
