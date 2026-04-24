import { getIronSession, IronSession } from "iron-session";
import { cookies } from "next/headers";

export interface SessionData {
  isLoggedIn: boolean;
  email?: string;
  userId?: string;
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

export async function getSession() {
  return getIronSession<SessionData>(await cookies(), sessionOptions);
}

export async function requireAdminSession(): Promise<AuthenticatedSession | null> {
  const session = await getSession();

  if (!session.isLoggedIn || !session.email || !session.userId) {
    return null;
  }

  return session as AuthenticatedSession;
}
