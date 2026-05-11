import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { safeReadRequestJson } from "@/lib/safe-json";
import {
  updateDealerProfile,
  type DealerStatus,
} from "@/lib/admin-store";

const DEALER_STATUSES = new Set(["none", "pending", "approved", "rejected", "suspended", "revoked"]);

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const { id } = await params;
    const payload = await safeReadRequestJson<{
      dealer_status?: string;
      company_name?: string | null;
      dealer_notes?: string | null;
      dealer_access_code?: string | null;
    }>(req, "PATCH /api/admin/dealers/:id");

    if (!payload || !payload.dealer_status || !DEALER_STATUSES.has(payload.dealer_status)) {
      return NextResponse.json({ error: "Valid dealer_status is required" }, { status: 400 });
    }

    const profile = await updateDealerProfile(id, {
      dealer_status: payload.dealer_status as DealerStatus,
      company_name:
        payload.company_name === undefined
          ? undefined
          : typeof payload.company_name === "string"
            ? payload.company_name
            : null,
      dealer_notes:
        payload.dealer_notes === undefined
          ? undefined
          : typeof payload.dealer_notes === "string"
            ? payload.dealer_notes
            : null,
      dealer_access_code:
        "dealer_access_code" in payload
          ? typeof payload.dealer_access_code === "string"
            ? payload.dealer_access_code
            : null
          : undefined,
    }, auth.user!.id);

    return NextResponse.json({ data: profile });
  } catch (error) {
    console.error("[PATCH /api/admin/dealers/:id]", error);
    return NextResponse.json({ error: "Failed to update dealer" }, { status: 500 });
  }
}
