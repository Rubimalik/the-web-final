import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  email?: string;
  userId?: string;

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

export function getSessionOptions(rememberMe: boolean) {
  return {
    ...sessionOptions,
    cookieOptions: {
      ...sessionOptions.cookieOptions,
      // If "remember me" is disabled, use a session cookie (no maxAge).
      maxAge: rememberMe ? sessionOptions.cookieOptions.maxAge : undefined,
    },
  };
}

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}
