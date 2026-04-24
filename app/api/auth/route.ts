import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { sessionOptions, type SessionData } from "@/lib/session";
import { createSupabaseAnonClient } from "@/lib/supabase";
import { safeReadRequestJson } from "@/lib/safe-json";
import {
  ensureBootstrapAdminUser,
  isAdminAuthUser,
  normalizeEmailAddress,
} from "@/lib/supabase-auth";

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

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    if (!isAdminAuthUser(data.user)) {
      return NextResponse.json(
        { error: "This account does not have admin access" },
        { status: 403 },
      );
    }

    // ✅ FIXED SESSION (IMPORTANT PART)
    const session = await getIronSession<SessionData>(req, res, sessionOptions);

    session.isLoggedIn = true;
    session.email = data.user.email ?? normalizedEmail;
    session.userId = data.user.id;

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
