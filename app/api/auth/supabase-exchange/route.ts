import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { safeReadRequestJson } from "@/lib/safe-json";
import { type SessionData, getSessionOptions } from "@/lib/session";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { createSupabaseAnonClient } from "@/lib/supabase";

type Payload = {
  access_token?: string;
  refresh_token?: string;
  rememberMe?: boolean;
};

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<Payload>(req, "POST /api/auth/supabase-exchange");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const accessToken = typeof payload.access_token === "string" ? payload.access_token.trim() : "";
    const refreshToken = typeof payload.refresh_token === "string" ? payload.refresh_token.trim() : "";
    const rememberMe = payload.rememberMe ?? true;

    if (!accessToken) {
      return NextResponse.json({ error: "Missing access token" }, { status: 400 });
    }
    if (!refreshToken) {
      return NextResponse.json(
        { error: "Missing refresh token. Please sign in again." },
        { status: 400 },
      );
    }

    const anonSupabase = createSupabaseAnonClient();
    if (process.env.NODE_ENV === "development") {
      console.log("[supabase-exchange] token presence", {
        hasAccessToken: Boolean(accessToken),
        hasRefreshToken: Boolean(refreshToken),
      });
    }

    let verifiedAccessToken = accessToken;
    let verifiedRefreshToken = refreshToken;

    const sessionResult = await anonSupabase.auth.setSession({
      access_token: verifiedAccessToken,
      refresh_token: verifiedRefreshToken,
    });
    if (process.env.NODE_ENV === "development") {
      console.log("[supabase-exchange] setSession result", {
        hasSession: Boolean(sessionResult.data.session),
        error: sessionResult.error?.message ?? null,
      });
    }

    if (sessionResult.error || !sessionResult.data.session) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 },
      );
    }

    verifiedAccessToken = sessionResult.data.session.access_token;
    verifiedRefreshToken = sessionResult.data.session.refresh_token;

    const userResult = await anonSupabase.auth.getUser();
    if (process.env.NODE_ENV === "development") {
      console.log("[supabase-exchange] getUser after setSession", {
        hasUser: Boolean(userResult.data?.user),
        error: userResult.error?.message ?? null,
      });
    }

    if (userResult.error || !userResult.data.user) {
      return NextResponse.json(
        { error: "Invalid or expired session. Please sign in again." },
        { status: 401 },
      );
    }
    if (!userResult.data.user.email_confirmed_at) {
      return NextResponse.json(
        { error: "Email not verified" },
        { status: 403 },
      );
    }

    const auth = await getAuthenticatedProfile({
      accessToken: verifiedAccessToken,
      refreshToken: verifiedRefreshToken,
    });

    if (auth.status !== "authenticated" || !auth.user || !auth.profile) {
      return NextResponse.json(
        { error: auth.error || "Invalid or expired session. Please sign in again." },
        { status: auth.status === "unverified" ? 403 : 401 },
      );
    }

    const response = NextResponse.json({
      success: true,
      profile: auth.profile,
    });

    // Mirror Supabase auth -> existing iron-session cookie so protected routes keep working.
    const session = await getIronSession<SessionData>(
      req,
      response,
      getSessionOptions(rememberMe),
    );

    session.isLoggedIn = true;
    session.email = auth.user.email ?? "";
    session.userId = auth.user.id;
    // Cache tokens for server-side verification; DB remains the source of truth.
    session.supabaseAccessToken = verifiedAccessToken;
    session.supabaseRefreshToken = verifiedRefreshToken;
    await session.save();

    return response;
  } catch (err) {
    console.error("[POST /api/auth/supabase-exchange]", err);
    return NextResponse.json({ error: "Failed to exchange session" }, { status: 500 });
  }
}

