import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";

// POST /api/auth — login
export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const validEmail    = process.env.ADMIN_EMAIL;
    const validPassword = process.env.ADMIN_PASSWORD;

    if (!validEmail || !validPassword) {
      console.error("ADMIN_EMAIL or ADMIN_PASSWORD env vars not set");
      return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
    }

    if (email !== validEmail || password !== validPassword) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    const session = await getSession();
    session.isLoggedIn = true;
    session.email = email;
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