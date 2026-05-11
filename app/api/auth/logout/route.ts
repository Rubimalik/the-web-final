import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { customerSessionOptions, type SessionData } from "@/lib/session";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ success: true });
    const session = await getIronSession<SessionData>(req, response, customerSessionOptions);
    const userId = session.userId;

    await session.destroy();
    if (userId) {
      invalidateAuthenticatedProfileCache(userId);
    }
    return response;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}

