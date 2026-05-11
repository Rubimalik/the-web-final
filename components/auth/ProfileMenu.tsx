"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CircleUserRound, LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearAuthState, emitAuthRefresh, useAuth } from "@/lib/auth/useAuth";

export default function ProfileMenu() {
  const router = useRouter();
  const { user, access, loading } = useAuth();

  const [open, setOpen] = useState(false);
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
      if (event.key === "Escape") {
        setOpen(false);
      }
      if (event.key === "Tab") {
        setOpen(false);
      }
    };
    const onResize = () => setOpen(false);

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("touchstart", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    window.addEventListener("resize", onResize);

    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("touchstart", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  const isAuthed = !!user && !!access?.canAccessCustomer;

  async function handleLogout() {
    setOpen(false);
    try {
      await fetch("/api/auth/customer/logout", { method: "POST", cache: "no-store" });
    } catch {
      // ignore
    }

    try {
      await createSupabaseBrowserClient({ rememberMe: true }).auth.signOut({ scope: "local" });
    } catch {
      // ignore
    }
    try {
      await createSupabaseBrowserClient({ rememberMe: false }).auth.signOut({ scope: "local" });
    } catch {
      // ignore
    }

    try {
      localStorage.removeItem("buysupply_auth");
      sessionStorage.removeItem("buysupply_auth");
    } catch {
      // ignore
    }

    await clearAuthState();
    emitAuthRefresh();
    router.replace("/signin");
    router.refresh();
  }

  return (
    <div ref={rootRef} className="relative">
      {loading ? (
        <div className="h-10 w-10 rounded-full bg-black/5 animate-pulse border border-black/10" />
      ) : (
        <>
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/20 hover:border-[var(--brand-pink-hover)] transition-colors transition-transform duration-200 hover:scale-[1.03]"
            aria-haspopup="menu"
            aria-controls={menuId}
            aria-expanded={open}
            aria-label={isAuthed ? "Open user menu" : "Open account menu"}
            onClick={() => setOpen((v) => !v)}
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
              {isAuthed ? (
                <>
                  <Link
                    href="/account"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    My Profile
                  </Link>

                  <Link
                    href="/orders"
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
                </>
              ) : (
                <>
                  <Link
                    href="/signin"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Sign in
                  </Link>
                  <Link
                    href="/signup"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Sign up
                  </Link>
                </>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

