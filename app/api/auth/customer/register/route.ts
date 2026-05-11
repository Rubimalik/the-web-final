import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { safeReadRequestJson } from "@/lib/safe-json";
import { type SessionData, getSessionOptions } from "@/lib/session";
import { createSupabaseAnonClient, createSupabaseServiceRoleClient } from "@/lib/supabase";
import { normalizeEmailAddress } from "@/lib/supabase-auth";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { assignRoleToUser } from "@/lib/auth/getUserRoles";
import { isCustomerAuth } from "@/lib/customer-auth";

function isStrongPassword(password: string) {
  return (
    password.length >= 8 &&
    /[A-Z]/.test(password) &&
    /[a-z]/.test(password) &&
    /\d/.test(password) &&
    /[^A-Za-z0-9]/.test(password)
  );
}

async function emailAlreadyExists(email: string) {
  const supabase = createSupabaseServiceRoleClient();
  for (let page = 1; page <= 10; page += 1) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error) throw error;
    if (data.users.some((user) => user.email?.toLowerCase() === email)) return true;
    if (data.users.length < 1000) return false;
  }
  return false;
}

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<{
      fullName?: string;
      email?: string;
      password?: string;
      confirmPassword?: string;
    }>(req, "POST /api/auth/customer/register");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
    const email = typeof payload.email === "string" ? normalizeEmailAddress(payload.email) : "";
    const password = typeof payload.password === "string" ? payload.password : "";
    const confirmPassword =
      typeof payload.confirmPassword === "string" ? payload.confirmPassword : "";

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Enter a valid email address" }, { status: 400 });
    }
    if (!isStrongPassword(password)) {
      return NextResponse.json({ error: "Password does not meet the requirements" }, { status: 400 });
    }
    if (password !== confirmPassword) {
      return NextResponse.json({ error: "Passwords do not match" }, { status: 400 });
    }
    if (await emailAlreadyExists(email)) {
      return NextResponse.json({ error: "This email is already in use" }, { status: 409 });
    }

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Unable to create account. Please try again." },
        { status: 400 },
      );
    }

    const serviceSupabase = createSupabaseServiceRoleClient();
    await serviceSupabase.from("profiles").upsert({
      id: data.user.id,
      full_name: fullName,
      role: "user",
      onboarding_step: 3,
    });
    await assignRoleToUser(data.user.id, "customer", data.user.id, "Customer registration");

    if (!data.session?.access_token || !data.session.refresh_token) {
      return NextResponse.json({
        success: true,
        requiresVerification: true,
        message: "Account created. Please verify your email to sign in.",
      });
    }

    const auth = await getAuthenticatedProfile({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    if (!isCustomerAuth(auth)) {
      return NextResponse.json({ error: "Unable to create customer session" }, { status: 403 });
    }

    const response = NextResponse.json({
      success: true,
      requiresVerification: false,
      profile: auth.profile,
    });
    const session = await getIronSession<SessionData>(
      req,
      response,
      getSessionOptions(true, "customer"),
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
    console.error("[POST /api/auth/customer/register]", error);
    return NextResponse.json({ error: "Unable to create account right now" }, { status: 500 });
  }
}
