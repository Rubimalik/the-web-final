"use client";

import Link from "next/link";
import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { createSupabaseBrowserClient } from "@/lib/supabase-browser";
import { clearAuthState, emitAuthRefresh, useAuth } from "@/lib/auth/useAuth";

function getDisplayInitials(nameOrEmail: string) {
  const trimmed = nameOrEmail.trim();
  if (!trimmed) return "U";
  const words = trimmed.split(/\s+/).filter(Boolean);
  if (words.length >= 2) {
    return `${words[0][0] ?? ""}${words[1][0] ?? ""}`.toUpperCase();
  }
  return (words[0]?.slice(0, 2) ?? "U").toUpperCase();
}

export default function ProfileMenu() {
  const router = useRouter();
  const { user, profile, role, loading } = useAuth();

  const [open, setOpen] = useState(false);
  const [failedAvatarUrl, setFailedAvatarUrl] = useState<string | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const menuId = useId();

  const displayLetter = useMemo(() => {
    const name = profile?.full_name || user?.email || "";
    return getDisplayInitials(String(name));
  }, [profile?.full_name, user?.email]);

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

  const isAuthed = !!user;
  const avatarUrl = profile?.avatar_url ?? null;
  const showAvatar = !!avatarUrl && failedAvatarUrl !== avatarUrl;

  async function handleLogout() {
    setOpen(false);
    try {
      await fetch("/api/auth/logout", { method: "POST", cache: "no-store" });
    } catch {
      // ignore
    }

    try {
      await createSupabaseBrowserClient({ rememberMe: true }).auth.signOut({ scope: "global" });
    } catch {
      // ignore
    }
    try {
      await createSupabaseBrowserClient({ rememberMe: false }).auth.signOut({ scope: "global" });
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
            {showAvatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={profile.avatar_url ?? ""}
                alt="Profile avatar"
                className="h-10 w-10 rounded-full object-cover"
                onError={() => setFailedAvatarUrl(avatarUrl)}
              />
            ) : (
              <span className="text-black/70 font-bold text-sm">{displayLetter}</span>
            )}
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

                  {role === "admin" && (
                    <Link
                      href="/dashboard"
                      role="menuitem"
                      className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                      onClick={() => setOpen(false)}
                    >
                      Dashboard
                    </Link>
                  )}

                  <Link
                    href="/settings/profile"
                    role="menuitem"
                    className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                    onClick={() => setOpen(false)}
                  >
                    Settings
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
                <Link
                  href="/signin"
                  role="menuitem"
                  className="block px-4 py-2 text-sm text-black/70 hover:text-[var(--brand-pink-hover)] hover:bg-gray-50 transition-colors"
                  onClick={() => setOpen(false)}
                >
                  Sign in
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

