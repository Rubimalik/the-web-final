import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { safeReadRequestJson } from "@/lib/safe-json";
import {
  getCustomerAuth,
  unauthorizedCustomerResponse,
} from "@/lib/customer-auth";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

export async function GET() {
  const auth = await getCustomerAuth();
  if (!auth?.user || !auth.profile) return unauthorizedCustomerResponse();

  return NextResponse.json({
    data: {
      fullName: auth.profile.full_name,
      email: auth.user.email,
      phone: auth.profile.phone,
      address: auth.profile.address,
    },
  });
}

export async function PATCH(req: Request) {
  const auth = await getCustomerAuth();
  if (!auth?.user) return unauthorizedCustomerResponse();

  try {
    const payload = await safeReadRequestJson<{
      fullName?: string;
      phone?: string | null;
      address?: string | null;
    }>(req, "PATCH /api/customer/profile");
    if (!payload) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
    const phone = typeof payload.phone === "string" ? payload.phone.trim() : "";
    const address = typeof payload.address === "string" ? payload.address.trim() : "";

    if (fullName.length < 2) {
      return NextResponse.json({ error: "Full name is required" }, { status: 400 });
    }
    if (phone.length > 40) {
      return NextResponse.json({ error: "Phone number is too long" }, { status: 400 });
    }
    if (address.length > 500) {
      return NextResponse.json({ error: "Address is too long" }, { status: 400 });
    }

    const supabase = createSupabaseServiceRoleClient();
    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: fullName,
        phone: phone || null,
        address: address || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", auth.user.id);

    if (error) {
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
    }

    invalidateAuthenticatedProfileCache(auth.user.id);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[PATCH /api/customer/profile]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
