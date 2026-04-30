import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";
import { createSupabaseAnonClient } from "@/lib/supabase";

export async function POST(req: Request) {
  try {
    const res = new Response();
    const session = await getIronSession<SessionData>(req, res, sessionOptions);
    const userId = session.userId;
    const accessToken = session.supabaseAccessToken;
    const refreshToken = session.supabaseRefreshToken;

    if (accessToken && refreshToken) {
      try {
        const supabase = createSupabaseAnonClient();
        await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken,
        });
        await supabase.auth.signOut({ scope: "global" });
      } catch {
        // Best-effort server-side signout.
      }
    }

    await session.destroy();
    if (userId) {
      invalidateAuthenticatedProfileCache(userId);
    }
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

