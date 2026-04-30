import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";

const ALLOWED_ROLES = ["user", "admin"] as const;
export type UserRole = (typeof ALLOWED_ROLES)[number];

export async function updateUserRole(userId: string, role: string): Promise<void> {
  if (!userId) return;

  const normalizedRole = role === "admin" ? "admin" : "user";
  if (!ALLOWED_ROLES.includes(normalizedRole)) return;

  const supabase = createSupabaseServiceRoleClient();

  const { error } = await supabase
    .from("profiles")
    .upsert(
      {
        id: userId,
        role: normalizedRole,
      },
      { onConflict: "id" }
    );

  if (error) {
    throw new Error(error.message || "Failed to update user role");
  }

  // Ensure subsequent authorization decisions reflect the updated role.
  invalidateAuthenticatedProfileCache(userId);
}

