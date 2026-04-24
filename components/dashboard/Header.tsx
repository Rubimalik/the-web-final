"use client";

import Link from "next/link";
import { Bell, Loader2, LogOut, Search } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";
import { safeReadJsonResponse } from "@/lib/safe-json";

type NotificationItem = {
  id: string;
  title: string;
  description: string;
  href: string;
  tone: "neutral" | "warning" | "accent";
};

const PRODUCTS_ROUTE = "/dashboard/products/all-products";

function buildRoute(pathname: string, params: URLSearchParams) {
  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const searchParamsString = searchParams.toString();

  const [loggingOut, setLoggingOut] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loadingNotifications, setLoadingNotifications] = useState(true);
  const [notificationsError, setNotificationsError] = useState("");

  const currentSearch = searchParams.get("search") ?? "";

  const loadNotifications = useCallback(async () => {
    try {
      setNotificationsError("");
      setLoadingNotifications(true);

      const response = await fetch("/api/dashboard/notifications", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });
      const payload = await safeReadJsonResponse<{ error?: string; items?: NotificationItem[] }>(
        response,
        "Header notifications"
      );

      if (!response.ok) {
        throw new Error(payload?.error || "Failed to load notifications");
      }

      setNotifications(payload?.items ?? []);
    } catch (error) {
      setNotifications([]);
      setNotificationsError(
        error instanceof Error ? error.message : "Failed to load notifications",
      );
    } finally {
      setLoadingNotifications(false);
    }
  }, []);

  useEffect(() => {
    if (pathname === PRODUCTS_ROUTE) {
      setSearchValue(currentSearch);
      return;
    }

    setSearchValue("");
  }, [currentSearch, pathname]);

  useEffect(() => {
    void loadNotifications();

    const interval = window.setInterval(() => {
      void loadNotifications();
    }, 60000);

    return () => window.clearInterval(interval);
  }, [loadNotifications]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    void loadNotifications();
  }, [loadNotifications, notificationsOpen]);

  useEffect(() => {
    if (!notificationsOpen) {
      return;
    }

    const handlePointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setNotificationsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [notificationsOpen]);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [pathname, searchParamsString]);

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth", { method: "DELETE" });
    router.push("/login");
    router.refresh();
  };

  const handleSearchSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const nextSearch = searchValue.trim();
    const params = new URLSearchParams(
      pathname.startsWith("/dashboard/products") ? searchParamsString : "",
    );

    if (nextSearch) {
      params.set("search", nextSearch);
    } else {
      params.delete("search");
    }

    params.delete("page");

    const targetRoute = buildRoute(PRODUCTS_ROUTE, params);

    if (pathname === PRODUCTS_ROUTE) {
      router.replace(targetRoute, { scroll: false });
      return;
    }

    router.push(targetRoute);
  };

  return (
    <header className="h-16 border-b border-zinc-800/60 bg-[#0c0c0f]/80 backdrop-blur-md flex items-center justify-between gap-4 px-4 md:px-6 shrink-0">
      <form
        onSubmit={handleSearchSubmit}
        className="flex-1 max-w-xl"
      >
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            value={searchValue}
            onChange={(event) => setSearchValue(event.target.value)}
            placeholder="Search products, drafts, or tags..."
            className="w-full rounded-xl border border-zinc-700/70 bg-zinc-900/60 pl-10 pr-20 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-500 focus:border-indigo-500/60 focus:outline-none transition-all"
          />
          <button
            type="submit"
            className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg border border-zinc-700/70 bg-zinc-900/80 px-2.5 py-1.5 text-[11px] font-medium text-zinc-300 transition-colors hover:border-zinc-500 hover:text-white"
          >
            Search
          </button>
        </div>
      </form>

      <div className="flex items-center gap-3">
        <div className="relative" ref={dropdownRef}>
          <button
            type="button"
            onClick={() => setNotificationsOpen((open) => !open)}
            className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700/70 bg-zinc-900/60 text-zinc-400 transition-all hover:border-zinc-500 hover:text-white"
            aria-label="Open reminders"
            aria-expanded={notificationsOpen}
          >
            <Bell className="h-4 w-4" />
            {!loadingNotifications && notifications.length > 0 && (
              <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold text-black">
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-zinc-800 bg-[#13131a] shadow-2xl shadow-black/40">
              <div className="border-b border-zinc-800/70 px-4 py-3">
                <p className="text-sm font-semibold text-white">Reminders</p>
                <p className="mt-1 text-xs text-zinc-500">
                  Live admin notices for catalogue upkeep.
                </p>
              </div>

              <div className="max-h-[360px] overflow-y-auto">
                {loadingNotifications ? (
                  <div className="flex items-center gap-2 px-4 py-5 text-sm text-zinc-400">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading reminders...
                  </div>
                ) : notificationsError ? (
                  <div className="px-4 py-5 text-sm text-red-400">
                    {notificationsError}
                  </div>
                ) : notifications.length === 0 ? (
                  <div className="px-4 py-5 text-sm text-zinc-400">
                    No reminders right now.
                  </div>
                ) : (
                  <div className="divide-y divide-zinc-800/70">
                    {notifications.map((item) => (
                      <Link
                        key={item.id}
                        href={item.href}
                        onClick={() => setNotificationsOpen(false)}
                        className="block px-4 py-3 transition-colors hover:bg-zinc-900/50"
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`mt-1 h-2.5 w-2.5 rounded-full ${
                              item.tone === "warning"
                                ? "bg-amber-400"
                                : item.tone === "accent"
                                  ? "bg-indigo-400"
                                  : "bg-zinc-500"
                            }`}
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-100">
                              {item.title}
                            </p>
                            <p className="mt-1 text-xs leading-5 text-zinc-500">
                              {item.description}
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 text-xs font-bold text-white">
              A
            </div>
            <div className="hidden sm:block">
              <p className="text-xs font-medium text-zinc-300">Admin</p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Sign out"
            className="ml-1 flex h-8 w-8 items-center justify-center rounded-lg text-zinc-500 transition-all hover:bg-red-500/10 hover:text-red-400 disabled:opacity-50"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
