import { NextRequest, NextResponse } from "next/server";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";
import { getApprovedAdmin } from "@/lib/admin-auth";
import { assignRoleToUser, type UserRole } from "@/lib/auth/getUserRoles";
import { safeReadRequestJson } from "@/lib/safe-json";

export async function POST(req: NextRequest) {
  try {
    const auth = await getApprovedAdmin();
    const adminUserId = auth?.user?.id ?? null;
    if (!adminUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const payload = await safeReadRequestJson<{
      userId?: string;
      role?: string;
      notes?: string;
    }>(req, "POST /api/admin/roles/grant");

    if (!payload) {
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 },
      );
    }

    const { userId, role, notes } = payload;

    if (!userId || !role) {
      return NextResponse.json(
        { error: "userId and role are required" },
        { status: 400 },
      );
    }

    if (!["customer", "dealer", "admin"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role" },
        { status: 400 },
      );
    }

    const result = await assignRoleToUser(
      userId,
      role as UserRole,
      adminUserId,
      notes,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error },
        { status: 400 },
      );
    }

    invalidateAuthenticatedProfileCache(userId);

    return NextResponse.json({
      success: true,
      message: `Role '${role}' assigned to user`,
    });
  } catch (err) {
    console.error("[POST /api/admin/roles/grant]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
