import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import { createSupabaseAnonClient } from "@/lib/supabase";
import {
  ensureBootstrapAdminUser,
  isAdminAuthUser,
  normalizeEmailAddress,
} from "@/lib/supabase-auth";

// POST /api/auth — login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();
    const normalizedEmail =
      typeof email === "string" ? normalizeEmailAddress(email) : "";
    const normalizedPassword =
      typeof password === "string" ? password : "";

    if (!normalizedEmail || !normalizedPassword) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    await ensureBootstrapAdminUser(normalizedEmail, normalizedPassword);

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email: normalizedEmail,
      password: normalizedPassword,
    });

    if (error || !data.user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!isAdminAuthUser(data.user)) {
      return NextResponse.json(
        { error: "This account does not have admin access" },
        { status: 403 }
      );
    }

    const session = await getSession();
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
export async function DELETE() {
  const session = await getSession();
  session.destroy();
  return NextResponse.json({ success: true });
}
