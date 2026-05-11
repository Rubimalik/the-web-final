import { NextResponse } from "next/server";
import { getApprovedAdmin, unauthorizedAdminResponse } from "@/lib/admin-auth";
import { getAdminDashboardStats } from "@/lib/admin-store";

export async function GET() {
  const auth = await getApprovedAdmin();
  if (!auth) return unauthorizedAdminResponse();

  try {
    const stats = await getAdminDashboardStats();
    return NextResponse.json({ data: stats });
  } catch (error) {
    console.error("[GET /api/admin/dashboard]", error);
    return NextResponse.json(
      { error: "Failed to load admin dashboard" },
      { status: 500 },
    );
  }
}
