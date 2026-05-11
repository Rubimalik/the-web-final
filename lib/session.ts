import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export type AuthSessionKind = "admin" | "dealer" | "customer" | "legacy";

export interface SessionData {
  isLoggedIn: boolean;
  email?: string;
  userId?: string;
  authRole?: AuthSessionKind;

  // Supabase tokens for server-side session verification.
  // Authorization decisions must ALWAYS be made from `public.profiles`.
  supabaseAccessToken?: string;
  supabaseRefreshToken?: string;
}

export type AuthenticatedSession = IronSession<
  SessionData & {
    email: string;
    userId: string;
  }
>;

export const sessionOptions = {
  cookieName: "dashboard_session",
  password: process.env.SESSION_SECRET!,
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax" as const,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export const adminSessionOptions = {
  ...sessionOptions,
  cookieName: "admin_session",
};

export const dealerSessionOptions = {
  ...sessionOptions,
  cookieName: "dealer_session",
  cookieOptions: {
    ...sessionOptions.cookieOptions,
    maxAge: 60 * 60 * 12,
  },
};

export const customerSessionOptions = {
  ...sessionOptions,
  cookieName: "customer_session",
};

export function getSessionOptions(
  rememberMe: boolean,
  kind: AuthSessionKind = "legacy",
) {
  const baseOptions = getSessionOptionsForKind(kind);
  return {
    ...baseOptions,
    cookieOptions: {
      ...baseOptions.cookieOptions,
      // If "remember me" is disabled, use a session cookie (no maxAge).
      maxAge: rememberMe ? baseOptions.cookieOptions.maxAge : undefined,
    },
  };
}

export function getSessionOptionsForKind(kind: AuthSessionKind = "legacy") {
  if (kind === "admin") return adminSessionOptions;
  if (kind === "dealer") return dealerSessionOptions;
  if (kind === "customer") return customerSessionOptions;
  return sessionOptions;
}

export async function getSession(kind: AuthSessionKind = "legacy") {
  return getIronSession<SessionData>(await cookies(), getSessionOptionsForKind(kind));
}
