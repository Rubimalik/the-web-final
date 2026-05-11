import { NextRequest, NextResponse } from "next/server";

export function proxy(req: NextRequest) {
  const pathname = req.nextUrl.pathname;
  const adminSession = req.cookies.get("admin_session")?.value;
  const dealerSession = req.cookies.get("dealer_session")?.value;
  const customerSession = req.cookies.get("customer_session")?.value;

  if (pathname.startsWith("/admin") || pathname.startsWith("/dashboard")) {
    if (adminSession) return NextResponse.next();

    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname.replace(/^\/dashboard/, "/admin"));
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/dealer")) {
    if (
      pathname === "/dealer/login" ||
      pathname === "/dealer/pending" ||
      pathname === "/dealer/rejected" ||
      pathname === "/dealer/status"
    ) {
      return NextResponse.next();
    }

    if (dealerSession) return NextResponse.next();

    const loginUrl = new URL("/dealer/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (
    pathname.startsWith("/account") ||
    pathname.startsWith("/checkout") ||
    pathname.startsWith("/orders") ||
    pathname.startsWith("/settings/profile")
  ) {
    if (customerSession) return NextResponse.next();

    const loginUrl = new URL("/signin", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/account/:path*",
    "/checkout/:path*",
    "/orders/:path*",
    "/settings/profile/:path*",
    "/dealer",
    "/dealer/:path*",
  ],
};
