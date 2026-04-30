"use client";

import type { ReactNode } from "react";

export default function SocialLoginButton({
  label,
  onClick,
  disabled,
  loading,
  icon,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  icon?: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled || loading}
      className="w-full inline-flex items-center justify-center gap-3 rounded-xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-black/80 hover:border-[var(--brand-cyan)]/60 hover:text-black transition focus:outline-none focus:ring-2 focus:ring-[var(--brand-cyan)]/25 disabled:opacity-60 disabled:cursor-not-allowed"
    >
      {loading ? (
        <span className="inline-flex items-center gap-2">
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-black/20 border-t-[var(--brand-cyan)]" />
          {label}
        </span>
      ) : (
        <>
          {icon ? <span className="flex h-5 w-5 items-center justify-center">{icon}</span> : null}
          {label}
        </>
      )}
    </button>
  );
}

