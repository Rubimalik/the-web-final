import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/session";
import fs from "fs";
import path from "path";

export async function GET() {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ email: process.env.ADMIN_EMAIL ?? "" });
}

export async function PUT(req: NextRequest) {
  const session = await getSession();
  if (!session.isLoggedIn) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { currentPassword, newEmail, newPassword } = await req.json();

  // Verify current password
  if (currentPassword !== process.env.ADMIN_PASSWORD) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 403 }
    );
  }

  const envPath = path.resolve(process.cwd(), ".env");
  let envContent = fs.readFileSync(envPath, "utf-8");

  if (newEmail) {
    envContent = envContent.replace(
      /^ADMIN_EMAIL=.*/m,
      `ADMIN_EMAIL=${newEmail}`
    );
    process.env.ADMIN_EMAIL = newEmail;

    // Update session email
    session.email = newEmail;
    await session.save();
  }

  if (newPassword) {
    envContent = envContent.replace(
      /^ADMIN_PASSWORD=.*/m,
      `ADMIN_PASSWORD=${newPassword}`
    );
    process.env.ADMIN_PASSWORD = newPassword;
  }

  fs.writeFileSync(envPath, envContent, "utf-8");

  return NextResponse.json({ success: true });
}
