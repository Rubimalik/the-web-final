import { NextResponse } from "next/server";
import {
  getAuthenticatedProfile,
  type AuthResolution,
} from "@/lib/auth/getAuthenticatedProfile";

export type AdminAccessDecision =
  | { allowed: true; auth: AuthResolution }
  | { allowed: false; redirectTo: string; auth: AuthResolution };

export function isApprovedAdmin(auth: AuthResolution) {
  return (
    auth.status === "authenticated" &&
    Boolean(auth.user?.id) &&
    Boolean(auth.profile) &&
    auth.roles.includes("admin") &&
    auth.access.canAccessAdmin
  );
}

export async function getApprovedAdmin() {
  const auth = await getAuthenticatedProfile({ sessionKind: "admin" });
  return isApprovedAdmin(auth) ? auth : null;
}

export function resolveAdminAccess(auth: AuthResolution): AdminAccessDecision {
  if (isApprovedAdmin(auth)) {
    return { allowed: true, auth };
  }

  if (auth.status !== "authenticated" || !auth.profile) {
    return { allowed: false, redirectTo: "/login", auth };
  }

  return { allowed: false, redirectTo: "/login", auth };
}

export async function getAdminAccessDecision() {
  return resolveAdminAccess(await getAuthenticatedProfile({ sessionKind: "admin" }));
}

export function unauthorizedAdminResponse() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}
