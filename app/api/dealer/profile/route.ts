import { NextResponse } from "next/server";
import { getApprovedDealerAuth, logDealerAuthDebug } from "@/lib/dealer-session";

export async function GET() {
  const auth = await getApprovedDealerAuth();

  if (!auth?.user || !auth.profile) {
    return NextResponse.json(
      { error: "Approved dealer session required" },
      { status: 401 },
    );
  }

  logDealerAuthDebug("profile-api", auth, {
    queryIdField: "profiles.id",
    queryIdValue: auth.user.id,
    resultReturned: true,
  });

  return NextResponse.json({
    data: {
      id: auth.profile.id,
      userId: auth.user.id,
      email: auth.user.email ?? null,
      fullName: auth.profile.full_name,
      companyName: auth.profile.company_name,
      phone: auth.profile.phone,
      address: auth.profile.address,
      avatarUrl: auth.profile.avatar_url,
      role: auth.role,
      roles: auth.roles,
      dealerStatus: auth.profile.dealer_status,
      accountStatus: auth.profile.account_status,
      approved: auth.access.canAccessDealer,
      createdAt: auth.profile.created_at,
      updatedAt: auth.profile.updated_at,
    },
  });
}
