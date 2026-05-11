"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertCircle, CircleUserRound, LogOut } from "lucide-react";

type DealerProfileResponse = {
  data?: {
    email: string | null;
    fullName: string | null;
    companyName: string | null;
    dealerStatus: string;
  };
  error?: string;
};

export default function DealerProfileMenu() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [dealerName, setDealerName] = useState<string | null>(null);
  const [dealerEmail, setDealerEmail] = useState<string | null>(null);
  const [profileError, setProfileError] = useState("");
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;

    const onPointerDown = (event: MouseEvent | TouchEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Tab") {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  useEffect(() => {
    let cancelled = false;

    async function loadDealerProfile() {
      try {
        setProfileError("");
        const response = await fetch("/api/dealer/profile", {
          method: "GET",
          cache: "no-store",
          credentials: "include",
          headers: { "cache-control": "no-store" },
        });
        const payload = (await response.json().catch(() => null)) as DealerProfileResponse | null;

        if (cancelled) return;

        if (!response.ok || !payload?.data) {
          setDealerName(null);
          setDealerEmail(null);
          setProfileError(payload?.error || "Unable to load account.");
          return;
        }

        setDealerName(payload.data.companyName || payload.data.fullName || payload.data.email || "Account");
        setDealerEmail(payload.data.email);
      } catch {
        if (!cancelled) {
          setDealerName(null);
          setDealerEmail(null);
          setProfileError("Unable to load account.");
        }
      }
    }

    void loadDealerProfile();

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleLogout() {
    setOpen(false);
    try {
      await fetch("/api/auth/dealer/logout", {
        method: "POST",
        cache: "no-store",
      });
    } catch {
      // Local navigation still moves the user away from protected dealer routes.
    }

    try {
      localStorage.removeItem("buysupply_auth");
      sessionStorage.removeItem("buysupply_auth");
    } catch {
      // Ignore storage cleanup failures.
    }

    router.replace("/dealer/login");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 hover:border-[var(--brand-pink-hover)] transition-colors transition-transform duration-200 hover:scale-[1.03]"
        aria-haspopup="menu"
        aria-controls={menuId}
        aria-expanded={open}
        aria-label="Open profile menu"
        onClick={() => setOpen((value) => !value)}
        onKeyDown={(event) => {
          if (event.key === "ArrowDown" || event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            setOpen(true);
          }
        }}
      >
        <CircleUserRound className="h-5 w-5 text-black/70" />
      </button>

      {open && (
        <div
          id={menuId}
          role="menu"
          className="absolute right-0 top-full mt-2 bg-white shadow-lg rounded-md py-2 min-w-[210px] w-56 max-w-[calc(100vw-2rem)] z-50 border border-black/5 origin-top-right"
        >
          <Link
            href="/dealer/profile"
            role="menuitem"
            className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            <span className="block font-semibold text-black/80">
              {dealerName || "Account"}
            </span>
            <span className="block truncate text-xs text-black/45">
              {dealerEmail || "View profile"}
            </span>
          </Link>
          {profileError ? (
            <div className="mx-3 my-2 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              <span>{profileError}</span>
            </div>
          ) : null}
          <Link
            href="/dealer/orders"
            role="menuitem"
            className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>
          <button
            type="button"
            role="menuitem"
            className="w-full text-left flex items-center gap-2 px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
            onClick={() => void handleLogout()}
          >
            <LogOut className="h-4 w-4" />
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
