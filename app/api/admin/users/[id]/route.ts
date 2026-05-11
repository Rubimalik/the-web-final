import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import {
  updateUserAccountStatus,
  type AccountStatus,
} from "@/lib/auth/getUserRoles";
import { safeReadRequestJson } from "@/lib/safe-json";

const ACCOUNT_STATUSES = new Set(["active", "suspended"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApprovedAdmin();
  if (!auth?.user?.id) return unauthorizedAdminResponse();

  try {
    const { id } = await params;
    const payload = await safeReadRequestJson<{
      account_status?: string;
      reason?: string | null;
    }>(req, "PATCH /api/admin/users/:id");

    if (
      !payload?.account_status ||
      !ACCOUNT_STATUSES.has(payload.account_status)
    ) {
      return NextResponse.json(
        { error: "Valid account_status is required" },
        { status: 400 },
      );
    }

    const result = await updateUserAccountStatus(
      id,
      payload.account_status as AccountStatus,
      auth.user.id,
      payload.reason,
    );

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update user status" },
        { status: 400 },
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/admin/users/:id]", error);
    return NextResponse.json(
      { error: "Failed to update user status" },
      { status: 500 },
    );
  }
}
