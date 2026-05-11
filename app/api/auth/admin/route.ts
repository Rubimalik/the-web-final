import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { adminSessionOptions, type SessionData } from "@/lib/session";
import { createSupabaseAnonClient } from "@/lib/supabase";
import { safeReadRequestJson } from "@/lib/safe-json";
import { normalizeEmailAddress } from "@/lib/supabase-auth";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { isApprovedAdmin } from "@/lib/admin-auth";

// POST /api/auth/admin — admin login only
export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<{ email?: string; password?: string }>(
      req,
      "POST /api/auth/admin"
    );
    if (!payload) {
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }
    const { email, password } = payload;

    const normalizedEmail =
      typeof email === "string" ? normalizeEmailAddress(email) : "";
    const normalizedPassword = typeof password === "string" ? password : "";

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Supabase login
    const supabase = createSupabaseAnonClient();

    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (error || !data.user || !data.session?.access_token) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify user has admin role in database
    const auth = await getAuthenticatedProfile({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    if (!isApprovedAdmin(auth)) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json(
        { error: "This account does not have admin access" },
        { status: 403 },
      );
    }

    // Create session
    const response = NextResponse.json({ success: true, role: auth.role, roles: auth.roles });
    const session = await getIronSession<SessionData>(req, response, adminSessionOptions);
    session.isLoggedIn = true;
    session.authRole = "admin";
    session.email = data.user.email ?? normalizedEmail;
    session.userId = data.user.id;
    session.supabaseAccessToken = data.session.access_token;
    session.supabaseRefreshToken = data.session.refresh_token;
    await session.save();

    return response;
  } catch (err) {
    console.error("[POST /api/auth/admin]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
