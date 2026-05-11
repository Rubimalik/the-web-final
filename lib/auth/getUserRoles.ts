import { createSupabaseServiceRoleClient } from "@/lib/supabase";

export type UserRole = "customer" | "dealer" | "admin";
export type AccountStatus = "active" | "suspended";

export interface AssignedRole {
  role: UserRole;
  assigned_at: string;
  assigned_by: string | null;
}

function normalizeAccessRole(role: unknown): UserRole | null {
  if (role === "customer" || role === "dealer" || role === "admin") return role;
  return null;
}

function legacyAccessRoleFromProfileRole(role: unknown): UserRole | null {
  if (role === "admin" || role === "dealer") return role;
  return null;
}

function sortRoles(roles: Iterable<UserRole>) {
  const roleSet = new Set(roles);
  return (["customer", "dealer", "admin"] as UserRole[]).filter((role) =>
    roleSet.has(role),
  );
}

/**
 * Get all active roles assigned to a user
 * Server-side only - uses service role
 */
export async function getUserRoles(userId: string): Promise<UserRole[]> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const [{ data: roleRows, error }, { data: profileRow }] = await Promise.all([
      supabase
        .from("user_roles")
        .select("role, revoked_at")
        .eq("user_id", userId)
        .order("assigned_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("role")
        .eq("id", userId)
        .maybeSingle(),
    ]);

    if (error) {
      console.error("[getUserRoles] Error fetching roles:", error);
      const legacyRole = legacyAccessRoleFromProfileRole(profileRow?.role);
      return sortRoles(legacyRole ? [legacyRole] : []);
    }

    const activeRoles = new Set<UserRole>();
    const revokedRoles = new Set<UserRole>();

    (roleRows ?? []).forEach((row) => {
      const role = normalizeAccessRole(row.role);
      if (!role) return;
      if (row.revoked_at) {
        revokedRoles.add(role);
        return;
      }
      activeRoles.add(role);
    });

    const legacyRole = legacyAccessRoleFromProfileRole(profileRow?.role);
    if (legacyRole && !revokedRoles.has(legacyRole)) {
      activeRoles.add(legacyRole);
    }

    return sortRoles(activeRoles);
  } catch (err) {
    console.error("[getUserRoles] Exception:", err);
    return [];
  }
}

/**
 * Get detailed role assignment information
 */
export async function getUserRolesDetailed(
  userId: string,
): Promise<AssignedRole[]> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, assigned_at, assigned_by")
      .eq("user_id", userId)
      .is("revoked_at", null)
      .order("assigned_at", { ascending: false });

    if (error) {
      console.error("[getUserRolesDetailed] Error fetching roles:", error);
      return [];
    }

    return data ?? [];
  } catch (err) {
    console.error("[getUserRolesDetailed] Exception:", err);
    return [];
  }
}

/**
 * Check if a user has at least one of the specified roles
 */
export async function userHasAnyRole(
  userId: string,
  roles: UserRole[],
): Promise<boolean> {
  try {
    const userRoles = await getUserRoles(userId);
    return roles.some((role) => userRoles.includes(role));
  } catch {
    return false;
  }
}

/**
 * Check if a user has all of the specified roles
 */
export async function userHasAllRoles(
  userId: string,
  roles: UserRole[],
): Promise<boolean> {
  try {
    const userRoles = await getUserRoles(userId);
    return roles.every((role) => userRoles.includes(role));
  } catch {
    return false;
  }

}

/**
 * Assign a role to a user
 * Only admins can call this via API
 */
export async function assignRoleToUser(
  userId: string,
  role: UserRole,
  assignedByUserId: string,
  notes?: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServiceRoleClient();

    // Check if role already exists and is active
    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id, revoked_at")
      .eq("user_id", userId)
      .eq("role", role)
      .single();

    if (existingRole && !existingRole.revoked_at) {
      return { success: false, error: `User already has ${role} role` };
    }

    // If role was revoked, we need to create a new entry (unique constraint on user_id, role)
    // So we'll update the revoked one or insert a new one
    if (existingRole && existingRole.revoked_at) {
      const { error } = await supabase
        .from("user_roles")
        .update({
          revoked_at: null,
          revoked_by: null,
          assigned_by: assignedByUserId,
          assigned_at: new Date().toISOString(),
          notes: notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", existingRole.id);

      if (error) {
        return { success: false, error: error.message };
      }
    } else {
      const { error } = await supabase.from("user_roles").insert({
        user_id: userId,
        role,
        assigned_by: assignedByUserId,
        notes: notes || null,
      });

      if (error) {
        return { success: false, error: error.message };
      }
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

/**
 * Revoke a role from a user
 * Only admins can call this via API
 */
export async function revokeRoleFromUser(
  userId: string,
  role: UserRole,
  revokedByUserId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServiceRoleClient();

    const { data: existingRole } = await supabase
      .from("user_roles")
      .select("id, revoked_at")
      .eq("user_id", userId)
      .eq("role", role)
      .single();

    if (!existingRole) {
      return { success: false, error: `User does not have ${role} role` };
    }

    if (existingRole.revoked_at) {
      return { success: false, error: `${role} role is already revoked` };
    }

    const { error } = await supabase
      .from("user_roles")
      .update({
        revoked_at: new Date().toISOString(),
        revoked_by: revokedByUserId,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingRole.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}

export async function updateUserAccountStatus(
  userId: string,
  accountStatus: AccountStatus,
  updatedByUserId: string,
  reason?: string | null,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const now = new Date().toISOString();

    const update =
      accountStatus === "suspended"
        ? {
            account_status: accountStatus,
            suspended_at: now,
            suspended_by: updatedByUserId,
            suspension_reason: reason || null,
            updated_at: now,
          }
        : {
            account_status: accountStatus,
            suspended_at: null,
            suspended_by: null,
            suspension_reason: reason || null,
            updated_at: now,
          };

    const { error } = await supabase
      .from("profiles")
      .update(update)
      .eq("id", userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return { success: false, error: message };
  }
}
