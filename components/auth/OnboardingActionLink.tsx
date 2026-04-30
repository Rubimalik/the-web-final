"use client";

import { useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingActionLink({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <a
      href={href}
      onClick={async (e) => {
        if (loading) return;
        e.preventDefault();
        setLoading(true);
        try {
          await fetch("/api/onboarding/complete", { method: "POST" });
        } catch {
          // Even if it fails, still allow navigation.
        } finally {
          setLoading(false);
          router.push(href);
        }
      }}
      className={className}
      aria-busy={loading}
    >
      {loading ? children : children}
    </a>
  );
}

