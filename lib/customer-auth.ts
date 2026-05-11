import { NextResponse } from "next/server";
import { getAuthenticatedProfile, type AuthResolution } from "@/lib/auth/getAuthenticatedProfile";

export function isCustomerAuth(auth: AuthResolution) {
  const hasCustomerRole =
    auth.roles.includes("customer") ||
    (auth.roles.length === 0 && auth.role === "user");

  return (
    auth.status === "authenticated" &&
    Boolean(auth.user?.id) &&
    Boolean(auth.profile) &&
    hasCustomerRole &&
    auth.access.canAccessCustomer
  );
}

export async function getCustomerAuth() {
  const auth = await getAuthenticatedProfile({ sessionKind: "customer" });
  return isCustomerAuth(auth) ? auth : null;
}

export function unauthorizedCustomerResponse() {
  return NextResponse.json({ error: "Customer sign in required" }, { status: 401 });
}
