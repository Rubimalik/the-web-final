import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { createSupabaseAnonClient, createSupabaseServiceRoleClient } from "@/lib/supabase";
import { safeReadRequestJson } from "@/lib/safe-json";
import {
  ensureBootstrapAdminUser,
  normalizeEmailAddress,
} from "@/lib/supabase-auth";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { updateUserRole } from "@/lib/auth/updateUserRole";

// POST /api/auth — login
export async function POST(req: Request) {
  try {
    const res = new Response();

    const payload = await safeReadRequestJson<{ email?: string; password?: string }>(
      req,
      "POST /api/auth"
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

    // Ensure admin exists
    await ensureBootstrapAdminUser(normalizedEmail, normalizedPassword);

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

    // ✅ FIXED SESSION (IMPORTANT PART)
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    session.isLoggedIn = true;
    session.email = data.user.email ?? normalizedEmail;
    session.userId = data.user.id;

    // Server-side admin assignment: DB is the source of truth.
    // We ignore any metadata role and set `public.profiles.role` explicitly.
    const serviceSupabase = createSupabaseServiceRoleClient();
    const userMetadata = (data.user.user_metadata ?? {}) as {
      full_name?: string | null;
      avatar_url?: string | null;
    };
    const fullName = userMetadata.full_name ?? null;
    const avatarUrl = userMetadata.avatar_url ?? null;

    await serviceSupabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      onboarding_step: 3,
    });

    await updateUserRole(data.user.id, "admin");

    // Verify DB-backed role via unified helper.
    const auth = await getAuthenticatedProfile({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    if (auth.status !== "authenticated" || auth.role !== "admin" || !auth.onboarding_completed) {
      return NextResponse.json(
        { error: "This account does not have admin access" },
        { status: 403 },
      );
    }

    session.supabaseAccessToken = data.session.access_token;
    session.supabaseRefreshToken = data.session.refresh_token;
    await session.save();

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/auth]", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

// DELETE /api/auth — logout
export async function DELETE(req: Request) {
  const res = new Response();

  const session = await getIronSession<SessionData>(req, res, sessionOptions);
  session.destroy();

  return NextResponse.json({ success: true });
}
