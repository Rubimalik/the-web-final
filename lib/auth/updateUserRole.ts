import {
  assignRoleToUser,
  revokeRoleFromUser,
  type UserRole,
} from "@/lib/auth/getUserRoles";

const ALLOWED_ROLES = ["user", "dealer", "admin"] as const;
export type LegacyUserRole = (typeof ALLOWED_ROLES)[number];

export async function updateUserRole(userId: string, role: string): Promise<void> {
  if (!userId) return;

  const normalizedRole: LegacyUserRole =
    role === "admin" || role === "dealer" ? role : "user";

  if (!ALLOWED_ROLES.includes(normalizedRole)) return;

  if (normalizedRole === "user") {
    await Promise.all([
      revokeRoleFromUser(userId, "admin", userId),
      revokeRoleFromUser(userId, "dealer", userId),
    ]);
    return;
  }

  const result = await assignRoleToUser(
    userId,
    normalizedRole as UserRole,
    userId,
    "Legacy role update",
  );

  if (!result.success) {
    throw new Error(result.error || "Failed to update user role");
  }
}
