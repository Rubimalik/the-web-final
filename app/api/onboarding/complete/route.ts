import { NextResponse } from "next/server";
import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

export async function POST() {
  try {
    const auth = await getAuthenticatedProfile();
    if (auth.status !== "authenticated") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = createSupabaseServiceRoleClient();

    // Server-side step progression validation:
    // - Admins can always complete (bootstrapped with step=3).
    // - Regular users must reach step 2 before step 3 completion.
    const canComplete = auth.role === "admin" || auth.onboarding_step >= 2;
    if (!canComplete) {
      return NextResponse.json(
        { error: "Please complete the previous onboarding step(s) first." },
        { status: 409 },
      );
    }

    const { error } = await supabase
      .from("profiles")
      .update({ onboarding_step: 3 })
      .eq("id", auth.user.id);

    if (error) {
      return NextResponse.json(
        { error: error.message || "Failed to complete onboarding" },
        { status: 500 },
      );
    }

    invalidateAuthenticatedProfileCache(auth.user.id);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("[POST /api/onboarding/complete]", err);
    return NextResponse.json({ error: "Failed to complete onboarding" }, { status: 500 });
  }
}

