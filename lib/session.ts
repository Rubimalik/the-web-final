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
  password: process.env.SESSION_SECRET as string,
  cookieName: "dashboard_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7, // 7 days
  },
};

export async function getSession(): Promise<IronSession<SessionData>> {
  const cookieStore = await cookies();
  return getIronSession<SessionData>(cookieStore, sessionOptions);
}

export async function requireAdminSession(): Promise<AuthenticatedSession | null> {
  const session = await getSession();
  if (!session.isLoggedIn || !session.email || !session.userId) {
    return null;
  }

  return session as AuthenticatedSession;
}
