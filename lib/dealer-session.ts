import { getIronSession, type IronSession } from "iron-session";
import { cookies } from "next/headers";
import { dealerSessionOptions, getSession } from "@/lib/session";
import {
  getAuthenticatedProfile,
  type AuthResolution,
  type DealerStatus,
} from "@/lib/auth/getAuthenticatedProfile";

export type DealerAccessDecision =
  | { allowed: true; auth: AuthResolution }
  | { allowed: false; redirectTo: string; auth: AuthResolution };

export type DealerSessionData = {
  isDealerAuthenticated?: boolean;
  authenticatedAt?: number;
};

function shouldLogDealerAuthDebug() {
  return (
    process.env.NODE_ENV === "development" ||
    process.env.DEALER_AUTH_DEBUG === "true"
  );
}

export function logDealerAuthDebug(
  scope: string,
  auth: AuthResolution,
  extra: Record<string, unknown> = {},
) {
  if (!shouldLogDealerAuthDebug()) return;

  console.info(`[dealer-auth:${scope}]`, {
    authenticated: auth.status === "authenticated",
    status: auth.status,
    hasUser: Boolean(auth.user?.id),
    userId: auth.user?.id ?? null,
    profileId: auth.profile?.id ?? null,
    role: auth.role,
    roles: auth.roles,
    dealerStatus: auth.profile?.dealer_status ?? null,
    accountStatus: auth.profile?.account_status ?? null,
    canAccessDealer: auth.access.canAccessDealer,
    canAccessAdmin: auth.access.canAccessAdmin,
    canAccessCustomer: auth.access.canAccessCustomer,
    error: auth.error,
    ...extra,
  });
}

export async function getDealerSession() {
  return getIronSession<DealerSessionData>(await cookies(), dealerSessionOptions);
}

export async function getApprovedDealerAuth(): Promise<AuthResolution | null> {
  const auth = await getAuthenticatedProfile({ sessionKind: "dealer" });
  if (shouldLogDealerAuthDebug()) {
    const session = await getSession("dealer");
    logDealerAuthDebug("approved-check", auth, {
      dealerSessionExists: Boolean(session.isLoggedIn),
      sessionUserId: session.userId ?? null,
      queryProfileId: auth.user?.id ?? null,
      resultReturned: Boolean(auth.profile),
    });
  }
  return isApprovedDealerAuth(auth) ? auth : null;
}

export async function hasDealerAccess(
  _session?: IronSession<DealerSessionData>,
) {
  void _session;
  return Boolean(await getApprovedDealerAuth());
}

function dealerStatusRedirect(status: DealerStatus) {
  if (status === "pending") return "/dealer/pending";
  if (status === "rejected") return "/dealer/rejected";
  if (status === "suspended" || status === "revoked") return "/dealer/status";
  return "/dealer/login";
}

export function isApprovedDealerAuth(auth: AuthResolution) {
  return (
    auth.status === "authenticated" &&
    Boolean(auth.user?.id) &&
    Boolean(auth.profile) &&
    auth.roles.includes("dealer") &&
    auth.profile?.dealer_status === "approved" &&
    auth.access.canAccessDealer
  );
}

export function resolveDealerAccess(auth: AuthResolution): DealerAccessDecision {
  if (isApprovedDealerAuth(auth)) {
    return { allowed: true, auth };
  }

  if (auth.status !== "authenticated" || !auth.profile) {
    return { allowed: false, redirectTo: "/dealer/login", auth };
  }

  if (auth.role === "dealer" || auth.roles.includes("dealer") || auth.profile.dealer_status !== "none") {
    return {
      allowed: false,
      redirectTo: dealerStatusRedirect(auth.profile.dealer_status),
      auth,
    };
  }

  return { allowed: false, redirectTo: "/signin", auth };
}

export async function getDealerAccessDecision() {
  const auth = await getAuthenticatedProfile({ sessionKind: "dealer" });
  const decision = resolveDealerAccess(auth);
  logDealerAuthDebug("access-decision", auth, {
    allowed: decision.allowed,
    redirectTo: decision.allowed ? null : decision.redirectTo,
  });
  return decision;
}
