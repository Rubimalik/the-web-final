import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const loginUrl = new URL("/login", req.url);

  // ✅ iron-session cookie check (REAL COOKIE)
  const sessionCookie = req.cookies.get("dashboard_session")?.value;

  // if no session cookie → redirect
  if (!sessionCookie) {
    loginUrl.searchParams.set("from", req.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

// Protect only dashboard routes
export const config = {
  matcher: ["/dashboard/:path*"],
};
