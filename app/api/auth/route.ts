import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";
import { adminSessionOptions, type SessionData } from "@/lib/session";
import { POST as adminLogin } from "./admin/route";

// Keep the legacy endpoint admin-only. Public sign-in uses Supabase exchange.
export const POST = adminLogin;

export async function DELETE(req: Request) {
  const response = NextResponse.json({ success: true });
  const session = await getIronSession<SessionData>(req, response, adminSessionOptions);
  const userId = session.userId;

  session.destroy();
  if (userId) {
    invalidateAuthenticatedProfileCache(userId);
  }

  return response;
}
