import { NextResponse } from "next/server";
import { getIronSession } from "iron-session";
import { dealerSessionOptions, type SessionData } from "@/lib/session";
import { createSupabaseAnonClient } from "@/lib/supabase";
import {
  isApprovedDealerAuth,
  logDealerAuthDebug,
  resolveDealerAccess,
  type DealerSessionData,
} from "@/lib/dealer-session";
import { safeReadRequestJson } from "@/lib/safe-json";
import { normalizeEmailAddress } from "@/lib/supabase-auth";
import {
  getAuthenticatedProfile,
  invalidateAuthenticatedProfileCache,
} from "@/lib/auth/getAuthenticatedProfile";

export async function POST(req: Request) {
  try {
    const payload = await safeReadRequestJson<{ email?: string; password?: string }>(
      req,
      "POST /api/auth/dealer",
    );
    if (!payload) {
      return NextResponse.json({ error: "Invalid or empty request body" }, { status: 400 });
    }

    const email =
      typeof payload.email === "string"
        ? normalizeEmailAddress(payload.email)
        : "";
    const password = typeof payload.password === "string" ? payload.password : "";

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    const supabase = createSupabaseAnonClient();
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user || !data.session?.access_token) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    const auth = await getAuthenticatedProfile({
      accessToken: data.session.access_token,
      refreshToken: data.session.refresh_token,
    });

    const decision = resolveDealerAccess(auth);
    logDealerAuthDebug("login", auth, {
      loginUserId: data.user.id,
      decisionAllowed: decision.allowed,
      redirectTo: decision.allowed ? null : decision.redirectTo,
      sessionWillBeCreated:
        auth.status === "authenticated" &&
        Boolean(auth.profile) &&
        auth.roles.includes("dealer") &&
        auth.profile?.dealer_status !== "none",
    });

    if (
      auth.status !== "authenticated" ||
      !auth.profile ||
      !auth.roles.includes("dealer") ||
      auth.profile.dealer_status === "none"
    ) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json(
        { error: "This account is not a dealer account" },
        { status: 403 },
      );
    }

    if (auth.profile.dealer_status === "approved" && !isApprovedDealerAuth(auth)) {
      await supabase.auth.signOut({ scope: "local" });
      return NextResponse.json(
        { error: "This account is not approved for dealer access" },
        { status: 403 },
      );
    }

    const redirectTo = decision.allowed ? "/dealer" : decision.redirectTo;
    const response = NextResponse.json({
      success: true,
      role: auth.role,
      roles: auth.roles,
      dealerStatus: auth.profile.dealer_status,
      access: auth.access,
      redirectTo,
    });
    const session = await getIronSession<SessionData>(req, response, dealerSessionOptions);
    session.isLoggedIn = true;
    session.authRole = "dealer";
    session.email = data.user.email ?? email;
    session.userId = data.user.id;
    session.supabaseAccessToken = data.session.access_token;
    session.supabaseRefreshToken = data.session.refresh_token;
    await session.save();
    logDealerAuthDebug("login-session-saved", auth, {
      dealerSessionCreated: true,
      sessionUserId: session.userId,
    });

    return response;
  } catch (err) {
    console.error("[POST /api/auth/dealer]", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const response = NextResponse.json({ success: true });
  const appSession = await getIronSession<SessionData>(req, response, dealerSessionOptions);
  const userId = appSession.userId;
  const session = await getIronSession<DealerSessionData>(
    req,
    response,
    dealerSessionOptions,
  );
  appSession.destroy();
  session.destroy();
  if (userId) {
    invalidateAuthenticatedProfileCache(userId);
  }
  return response;
}
