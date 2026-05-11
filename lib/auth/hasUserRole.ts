import { userHasAnyRole, type UserRole } from "./getUserRoles";

/**
 * Check if a user has admin role
 * Called during admin panel access
 */
export async function hasAdminRole(userId: string): Promise<boolean> {
  return userHasAnyRole(userId, ["admin"]);
}

/**
 * Check if a user has dealer role
 * Called during dealer panel access
 */
export async function hasDealerRole(userId: string): Promise<boolean> {
  return userHasAnyRole(userId, ["dealer"]);
}

/**
 * Check if a user has customer access (default for all users)
 * Everyone has customer access unless explicitly disabled
 */
export async function hasCustomerAccess(userId: string): Promise<boolean> {
  void userId;
  // All authenticated users have customer access by default
  return true;
}

/**
 * Check if user can access a specific role-protected route
 */
export async function canAccessRole(
  userId: string,
  requiredRole: UserRole,
): Promise<boolean> {
  return userHasAnyRole(userId, [requiredRole]);
}

/**
 * Get user's access summary
 */
export async function getUserAccessSummary(userId: string) {
  const [hasAdmin, hasDealer] = await Promise.all([
    hasAdminRole(userId),
    hasDealerRole(userId),
  ]);

  return {
    canAccessAdmin: hasAdmin,
    canAccessDealer: hasDealer,
    canAccessCustomer: true, // Always true
  };
}
