import { NextResponse } from "next/server";
import { getAuthenticatedProfile } from "@/lib/auth/getAuthenticatedProfile";

export async function GET() {
  try {
    const auth = await getAuthenticatedProfile();
    if (auth.status !== "authenticated" || !auth.user || !auth.profile || !auth.role) {
      return NextResponse.json({
        authenticated: false,
        status: auth.status,
        error: auth.error,
      });
    }

    return NextResponse.json({
      authenticated: true,
      user: auth.user,
      profile: auth.profile,
      role: auth.role,
      onboarding_step: auth.onboarding_step,
      onboarding_completed: auth.onboarding_completed,
    });
  } catch {
    return NextResponse.json({ authenticated: false }, { status: 500 });
  }
}

