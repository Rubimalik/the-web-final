import { NextRequest, NextResponse } from "next/server";
import { requireAdminSession } from "@/lib/session";
import { createSupabaseAnonClient, createSupabaseServiceRoleClient } from "@/lib/supabase";
import { normalizeEmailAddress } from "@/lib/supabase-auth";
import { safeReadRequestJson } from "@/lib/safe-json";

export async function GET() {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ email: session.email });
}

export async function PUT(req: NextRequest) {
  const session = await requireAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const payload = await safeReadRequestJson<{
    currentPassword?: string;
    newEmail?: string;
    newPassword?: string;
  }>(req, "PUT /api/settings");
  if (!payload) {
    return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
  }
  const { currentPassword, newEmail, newPassword } = payload;
  const normalizedCurrentPassword =
    typeof currentPassword === "string" ? currentPassword : "";
  const normalizedNewEmail =
    typeof newEmail === "string" && newEmail.trim()
      ? normalizeEmailAddress(newEmail)
      : "";
  const normalizedNewPassword =
    typeof newPassword === "string" ? newPassword : "";

  if (!normalizedCurrentPassword) {
    return NextResponse.json(
      { error: "Current password is required" },
      { status: 400 }
    );
  }

  if (!normalizedNewEmail && !normalizedNewPassword) {
    return NextResponse.json({ success: true });
  }

  if (normalizedNewPassword && normalizedNewPassword.length < 6) {
    return NextResponse.json(
      { error: "New password must be at least 6 characters" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseAnonClient();
  const { error: authError } = await supabase.auth.signInWithPassword({
    email: session.email,
    password: normalizedCurrentPassword,
  });

  if (authError) {
    return NextResponse.json(
      { error: "Current password is incorrect" },
      { status: 403 }
    );
  }

  const updatePayload: {
    email?: string;
    email_confirm?: boolean;
    password?: string;
  } = {};

  if (normalizedNewEmail && normalizedNewEmail !== session.email) {
    updatePayload.email = normalizedNewEmail;
    updatePayload.email_confirm = true;
  }

  if (normalizedNewPassword) {
    updatePayload.password = normalizedNewPassword;
  }

  if (Object.keys(updatePayload).length === 0) {
    return NextResponse.json({ success: true });
  }

  const adminSupabase = createSupabaseServiceRoleClient();
  const { data, error } = await adminSupabase.auth.admin.updateUserById(
    session.userId,
    updatePayload
  );

  if (error || !data.user) {
    return NextResponse.json(
      { error: error?.message ?? "Failed to update account settings" },
      { status: 500 }
    );
  }

  session.email = data.user.email ?? session.email;
  await session.save();

  return NextResponse.json({ success: true });
}
