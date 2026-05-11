"use client";

import { useCallback, useEffect, useState } from "react";
import type { AuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";

const AUTH_REFRESH_EVENT = "buysupply:auth-refresh";

type UseAuthResult = {
  user: AuthenticatedProfile["user"] | null;
  profile: AuthenticatedProfile["profile"] | null;
  role: AuthenticatedProfile["role"] | null;
  roles: AuthenticatedProfile["roles"];
  access: AuthenticatedProfile["access"] | null;
  onboarding_step: number | null;
  loading: boolean;
  refresh: () => Promise<void>;
};

let authSnapshot: AuthenticatedProfile | null = null;
let loadingSnapshot = true;
let initialized = false;
let inFlightRefresh: Promise<void> | null = null;
const subscribers = new Set<() => void>();

function notifySubscribers() {
  subscribers.forEach((subscriber) => subscriber());
}

async function runRefresh() {
  loadingSnapshot = true;
  notifySubscribers();
  try {
    const res = await fetch("/api/auth/profile", {
      method: "GET",
      cache: "no-store",
      headers: { "cache-control": "no-store" },
    });
    const data = (await res.json()) as {
      authenticated: boolean;
      status?: string;
      error?: string | null;
      user: AuthenticatedProfile["user"];
      profile: AuthenticatedProfile["profile"];
      role: AuthenticatedProfile["role"];
      roles: AuthenticatedProfile["roles"];
      access: AuthenticatedProfile["access"];
      onboarding_step: number;
      onboarding_completed: boolean;
    };

    if (res.ok && data?.authenticated) {
      authSnapshot = {
        user: data.user,
        profile: data.profile,
        role: data.role,
        roles: data.roles ?? [],
        access: data.access,
        onboarding_step: data.onboarding_step,
        onboarding_completed: data.onboarding_completed,
      };
    } else {
      authSnapshot = null;
    }
  } catch {
    authSnapshot = null;
  } finally {
    loadingSnapshot = false;
    initialized = true;
    notifySubscribers();
  }
}

export async function refreshAuthState() {
  if (!inFlightRefresh) {
    inFlightRefresh = runRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

export async function clearAuthState() {
  authSnapshot = null;
  loadingSnapshot = false;
  initialized = true;
  notifySubscribers();
}

export function emitAuthRefresh() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(AUTH_REFRESH_EVENT));
  }
}

export function useAuth(): UseAuthResult {
  const [auth, setAuth] = useState<AuthenticatedProfile | null>(authSnapshot);
  const [loading, setLoading] = useState(loadingSnapshot);

  const refresh = useCallback(async () => {
    await refreshAuthState();
  }, []);

  useEffect(() => {
    const syncFromSnapshot = () => {
      setAuth(authSnapshot);
      setLoading(loadingSnapshot);
    };

    subscribers.add(syncFromSnapshot);
    syncFromSnapshot();

    const onVisibilityRefresh = () => {
      if (document.visibilityState === "visible") {
        void refreshAuthState();
      }
    };
    const onWindowFocus = () => {
      void refreshAuthState();
    };
    const onRequestedRefresh = () => {
      void refreshAuthState();
    };

    document.addEventListener("visibilitychange", onVisibilityRefresh);
    window.addEventListener("focus", onWindowFocus);
    window.addEventListener(AUTH_REFRESH_EVENT, onRequestedRefresh);

    if (!initialized) {
      void refreshAuthState();
    }

    return () => {
      subscribers.delete(syncFromSnapshot);
      document.removeEventListener("visibilitychange", onVisibilityRefresh);
      window.removeEventListener("focus", onWindowFocus);
      window.removeEventListener(AUTH_REFRESH_EVENT, onRequestedRefresh);
    };
  }, [refresh]);

  return {
    user: auth?.user ?? null,
    profile: auth?.profile ?? null,
    role: auth?.role ?? null,
    roles: auth?.roles ?? [],
    access: auth?.access ?? null,
    onboarding_step: auth?.onboarding_step ?? null,
    loading,
    refresh,
  };
}

