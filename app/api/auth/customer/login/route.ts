import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { safeReadRequestJson } from "@/lib/safe-json";
import { type SessionData, getSessionOptions } from "@/lib/session";
import { createSupabaseAnonClient } from "@/lib/supabase";
import { normalizeEmailAddress } from "@/lib/supabase-auth";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { isCustomerAuth } from "@/lib/customer-auth";

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<{
      email?: string;
      password?: string;
      rememberMe?: boolean;
    }>(req, "POST /api/auth/customer/login");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const email = typeof payload.email === "string" ? normalizeEmailAddress(payload.email) : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const rememberMe = payload.rememberMe ?? true;

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user || !data.session?.access_token || !data.session.refresh_token) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const auth = await getAuthenticatedProfile({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    if (!isCustomerAuth(auth)) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json(
        { error: "This account is not a customer account." },
        { status: 403 },
      );
    }

    const response = NextResponse.json({
      success: true,
      profile: auth.profile,
      roles: auth.roles,
      access: auth.access,
    });
    const session = await getIronSession<SessionData>(
      req,
      response,
      getSessionOptions(rememberMe, "customer"),
    );
    session.isLoggedIn = true;
    session.authRole = "customer";
    session.email = data.user.email ?? email;
    session.userId = data.user.id;
    session.supabaseAccessToken = data.session.access_token;
    session.supabaseRefreshToken = data.session.refresh_token;
    await session.save();

    return response;
  } catch (error) {
    console.error("[POST /api/auth/customer/login]", error);
    return NextResponse.json({ error: "Unable to sign in right now" }, { status: 500 });
  }
}
