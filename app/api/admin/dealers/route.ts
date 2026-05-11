import { NextRequest, NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import {
  createDealerProfile,
  listDealerProfiles,
  type DealerStatus,
} from "@/lib/admin-store";
import { safeReadRequestJson } from "@/lib/safe-json";

const DEALER_FILTER_STATUSES = new Set([
  "all",
  "none",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "revoked",
]);
const DEALER_WRITE_STATUSES = new Set([
  "none",
  "pending",
  "approved",
  "rejected",
  "suspended",
  "revoked",
]);

export async function GET(req: NextRequest) {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const { searchParams } = new URL(req.url);
    const page = Math.max(1, Number.parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Number.parseInt(searchParams.get("limit") || "20", 10));
    const search = searchParams.get("search") || undefined;
    const rawStatus = searchParams.get("status") || "all";
    const status = DEALER_FILTER_STATUSES.has(rawStatus)
      ? (rawStatus as DealerStatus | "all")
      : "all";

    const result = await listDealerProfiles({ page, limit, search, status });

    return NextResponse.json({
      data: result.data,
      pagination: {
        page,
        limit,
        total: result.total,
        totalPages: Math.ceil(result.total / limit),
      },
    });
  } catch (error) {
    console.error("[GET /api/admin/dealers]", error);
    return NextResponse.json({ error: "Failed to load dealers" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = await getApprovedAdmin();
  if (!auth?.user?.id) return unauthorizedAdminResponse();

  try {
    const payload = await safeReadRequestJson<{
      email?: string;
      full_name?: string | null;
      company_name?: string | null;
      dealer_notes?: string | null;
      dealer_access_code?: string | null;
      dealer_status?: string;
    }>(req, "POST /api/admin/dealers");

    if (!payload?.email) {
      return NextResponse.json({ error: "Dealer email is required" }, { status: 400 });
    }

    const dealerStatus =
      payload.dealer_status && DEALER_WRITE_STATUSES.has(payload.dealer_status)
        ? (payload.dealer_status as DealerStatus)
        : "pending";

    const profile = await createDealerProfile(
      {
        email: payload.email,
        full_name: payload.full_name,
        company_name: payload.company_name,
        dealer_notes: payload.dealer_notes,
        dealer_access_code: payload.dealer_access_code,
        dealer_status: dealerStatus,
      },
      auth.user.id,
    );

    return NextResponse.json({ data: profile }, { status: 201 });
  } catch (error) {
    console.error("[POST /api/admin/dealers]", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create dealer" },
      { status: 500 },
    );
  }
}
