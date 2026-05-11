import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { type DealerSessionData } from "@/lib/dealer-session";
import { dealerSessionOptions, type SessionData } from "@/lib/session";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

export async function POST(req: Request) {
  try {
    const response = NextResponse.json({ success: true });
    const session = await getIronSession<DealerSessionData>(
      req,
      response,
      dealerSessionOptions,
    );
    const appSession = await getIronSession<SessionData>(req, response, dealerSessionOptions);
    const userId = appSession.userId;

    session.destroy();
    appSession.destroy();
    if (userId) {
      invalidateAuthenticatedProfileCache(userId);
    }
    return response;
  } catch {
    return NextResponse.json({ success: false }, { status: 500 });
  }
}
