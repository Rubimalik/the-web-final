import { createSupabaseServiceRoleClient } from "@/lib/supabase";
import {
  getDashboardOverview,
  type DashboardOverview,
} from "@/lib/catalog-store";
import { query } from "@/lib/db";
import { getOrderStats } from "@/lib/orders-store";
import {
  assignRoleToUser,
  revokeRoleFromUser,
  type UserRole,
} from "@/lib/auth/getUserRoles";
import { invalidateAuthenticatedProfileCache } from "@/lib/auth/getAuthenticatedProfile";
import { randomUUID } from "node:crypto";

export type AdminProfileRole = "user" | "dealer" | "admin";
export type DealerStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "revoked";
export type AccountStatus = "active" | "suspended";
export type AdminUserFilter = "admin" | "dealer" | "customer" | "suspended";

export type AdminProfileRecord = {
  id: string;
  user_id: string;
  email: string | null;
  full_name: string | null;
  avatar_url: string | null;
  role: AdminProfileRole;
  active_roles: UserRole[];
  active_role_count: number;
  onboarding_step: number;
  onboarding_completed: boolean;
  dealer_status: DealerStatus;
  account_status: AccountStatus;
  company_name: string | null;
  dealer_notes: string | null;
  dealer_access_code: string | null;
  approved_at: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

export type AdminProfileListResult = {
  data: AdminProfileRecord[];
  total: number;
};

export type AdminDashboardStats = {
  products: {
    total: number;
    active: number;
    draft: number;
    archived: number;
    categories: number;
  };
  orders: {
    total: number;
    pending: number;
    paid: number;
    fulfilled: number;
  };
  users: {
    total: number;
    admins: number;
    dealers: number;
    pendingDealers: number;
  };
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
  onboarding_step: number | null;
  onboarding_completed: boolean | null;
  dealer_status: string | null;
  account_status: string | null;
  company_name: string | null;
  dealer_notes: string | null;
  dealer_access_code: string | null;
  approved_at: string | null;
  suspended_at: string | null;
  suspended_by: string | null;
  suspension_reason: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type UserRoleRow = {
  user_id: string;
  role: string;
};

const PROFILE_COLUMNS = [
  "id",
  "full_name",
  "avatar_url",
  "role",
  "onboarding_step",
  "onboarding_completed",
  "dealer_status",
  "account_status",
  "company_name",
  "dealer_notes",
  "dealer_access_code",
  "approved_at",
  "suspended_at",
  "suspended_by",
  "suspension_reason",
  "created_at",
  "updated_at",
].join(", ");

const ACCESS_ROLE_ORDER: UserRole[] = ["customer", "dealer", "admin"];

function normalizeAccessRole(role: unknown): UserRole | null {
  if (role === "customer" || role === "dealer" || role === "admin") return role;
  return null;
}

function normalizeProfileRole(role: unknown): AdminProfileRole {
  if (role === "admin" || role === "dealer") return role;
  return "user";
}

function roleFromAccessRoles(roles: UserRole[]): AdminProfileRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("dealer")) return "dealer";
  return "user";
}

function normalizeDealerStatus(status: unknown): DealerStatus {
  if (
    status === "none" ||
    status === "pending" ||
    status === "approved" ||
    status === "rejected" ||
    status === "suspended" ||
    status === "revoked"
  ) {
    return status;
  }
  return "none";
}

function normalizeAccountStatus(status: unknown): AccountStatus {
  return status === "suspended" ? "suspended" : "active";
}

function sortRoles(roles: UserRole[]) {
  const uniqueRoles = Array.from(new Set(roles));
  return ACCESS_ROLE_ORDER.filter((role) => uniqueRoles.includes(role));
}

function displayRolesForAccount(roles: UserRole[]) {
  return roles.length > 0 ? sortRoles(roles) : (["customer"] as UserRole[]);
}

async function listAuthEmailsById() {
  const supabase = createSupabaseServiceRoleClient();
  const emails = new Map<string, string | null>();
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    data.users.forEach((user) => {
      emails.set(user.id, user.email ?? null);
    });

    if (data.users.length < perPage) break;
    page += 1;
  }

  return emails;
}

function normalizeEmail(value: string) {
  return value.trim().toLowerCase();
}

async function findAuthUserByEmail(email: string) {
  const supabase = createSupabaseServiceRoleClient();
  const normalizedEmail = normalizeEmail(email);
  let page = 1;
  const perPage = 1000;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage,
    });

    if (error) throw error;

    const user = data.users.find(
      (item) => item.email && normalizeEmail(item.email) === normalizedEmail,
    );
    if (user) return user;

    if (data.users.length < perPage) return null;
    page += 1;
  }
}

async function listActiveRolesByUserId() {
  const supabase = createSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from("user_roles")
    .select("user_id, role")
    .is("revoked_at", null);

  if (error) throw error;

  const rolesByUser = new Map<string, UserRole[]>();
  ((data ?? []) as UserRoleRow[]).forEach((row) => {
    const role = normalizeAccessRole(row.role);
    if (!role) return;

    const roles = rolesByUser.get(row.user_id) ?? [];
    roles.push(role);
    rolesByUser.set(row.user_id, roles);
  });

  rolesByUser.forEach((roles, userId) => {
    rolesByUser.set(userId, sortRoles(roles));
  });

  return rolesByUser;
}

function mapProfile(
  row: ProfileRow,
  email: string | null,
  assignedRoles: UserRole[],
): AdminProfileRecord {
  const activeRoles = displayRolesForAccount(assignedRoles);
  const accountStatus = normalizeAccountStatus(row.account_status);

  return {
    id: row.id,
    user_id: row.id,
    email,
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    role: assignedRoles.length > 0 ? roleFromAccessRoles(assignedRoles) : normalizeProfileRole(row.role),
    active_roles: activeRoles,
    active_role_count: activeRoles.length,
    onboarding_step: Number(row.onboarding_step ?? 0),
    onboarding_completed:
      row.onboarding_completed ?? Number(row.onboarding_step ?? 0) >= 3,
    dealer_status: normalizeDealerStatus(row.dealer_status),
    account_status: accountStatus,
    company_name: row.company_name,
    dealer_notes: row.dealer_notes,
    dealer_access_code: row.dealer_access_code,
    approved_at: row.approved_at,
    suspended_at: row.suspended_at,
    suspended_by: row.suspended_by,
    suspension_reason: row.suspension_reason,
    created_at: row.created_at,
    updated_at: row.updated_at,
  };
}

function matchesSearch(profile: AdminProfileRecord, search?: string) {
  if (!search) return true;
  const needle = search.toLowerCase();
  return [
    profile.email,
    profile.full_name,
    profile.company_name,
    profile.role,
    profile.dealer_status,
    profile.account_status,
    ...profile.active_roles,
  ].some((value) => value?.toLowerCase().includes(needle));
}

function matchesUserFilter(profile: AdminProfileRecord, filter?: AdminUserFilter) {
  if (!filter) return true;
  if (filter === "suspended") return profile.account_status === "suspended";
  if (filter === "customer") {
    return (
      profile.account_status !== "suspended" &&
      profile.active_roles.includes("customer") &&
      !profile.active_roles.includes("admin") &&
      !profile.active_roles.includes("dealer")
    );
  }
  return profile.account_status !== "suspended" && profile.active_roles.includes(filter);
}

async function listMappedProfiles() {
  const supabase = createSupabaseServiceRoleClient();
  const profilesQuery = supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .order("created_at", { ascending: false });

  const [{ data, error }, emailById, rolesById] = await Promise.all([
    profilesQuery,
    listAuthEmailsById(),
    listActiveRolesByUserId(),
  ]);

  if (error) throw error;

  return ((data ?? []) as unknown as ProfileRow[]).map((row) =>
    mapProfile(row, emailById.get(row.id) ?? null, rolesById.get(row.id) ?? []),
  );
}

export async function listAdminUsers(options: {
  limit: number;
  offset: number;
  filter?: AdminUserFilter;
  search?: string;
}): Promise<AdminProfileListResult> {
  const profiles = (await listMappedProfiles())
    .filter((profile) => matchesSearch(profile, options.search))
    .filter((profile) => matchesUserFilter(profile, options.filter));

  return {
    data: profiles.slice(options.offset, options.offset + options.limit),
    total: profiles.length,
  };
}

export async function listAdminProfiles(options: {
  page: number;
  limit: number;
  role?: AdminProfileRole;
  search?: string;
}): Promise<AdminProfileListResult> {
  const filter =
    options.role === "admin" || options.role === "dealer"
      ? options.role
      : options.role === "user"
        ? "customer"
        : undefined;

  return listAdminUsers({
    limit: options.limit,
    offset: (options.page - 1) * options.limit,
    filter,
    search: options.search,
  });
}

export async function listDealerProfiles(options: {
  page: number;
  limit: number;
  status?: DealerStatus | "all";
  search?: string;
}): Promise<AdminProfileListResult> {
  const profiles = (await listMappedProfiles())
    .filter(
      (profile) =>
        profile.active_roles.includes("dealer") || profile.dealer_status !== "none",
    )
    .filter((profile) => {
      if (!options.status || options.status === "all") return true;
      return profile.dealer_status === options.status;
    })
    .filter((profile) => matchesSearch(profile, options.search))
    .sort((a, b) => {
      const aDate = a.updated_at ? Date.parse(a.updated_at) : 0;
      const bDate = b.updated_at ? Date.parse(b.updated_at) : 0;
      return bDate - aDate;
    });

  const offset = (options.page - 1) * options.limit;

  return {
    data: profiles.slice(offset, offset + options.limit),
    total: profiles.length,
  };
}

async function revokeDealerRoleIfPresent(profileId: string, actorUserId: string) {
  const result = await revokeRoleFromUser(profileId, "dealer", actorUserId);
  if (
    !result.success &&
    result.error &&
    !result.error.includes("does not have") &&
    !result.error.includes("already revoked")
  ) {
    throw new Error(result.error);
  }
}

export async function updateDealerProfile(
  profileId: string,
  input: {
    dealer_status: DealerStatus;
    company_name?: string | null;
    dealer_notes?: string | null;
    dealer_access_code?: string | null;
  },
  actorUserId: string,
) {
  const supabase = createSupabaseServiceRoleClient();
  const dealerStatus = normalizeDealerStatus(input.dealer_status);

  if (dealerStatus === "approved") {
    const result = await assignRoleToUser(
      profileId,
      "dealer",
      actorUserId,
      "Dealer access approved",
    );
    if (!result.success) throw new Error(result.error || "Failed to grant dealer role");
  }

  if (
    dealerStatus === "pending" ||
    dealerStatus === "rejected" ||
    dealerStatus === "revoked" ||
    dealerStatus === "none"
  ) {
    await revokeDealerRoleIfPresent(profileId, actorUserId);
  }

  const update: Record<string, unknown> = {
    role: dealerStatus === "none" ? "user" : "dealer",
    dealer_status: dealerStatus,
    approved_at: dealerStatus === "approved" ? new Date().toISOString() : null,
  };

  if (input.company_name !== undefined) {
    update.company_name = input.company_name;
  }

  if (input.dealer_notes !== undefined) {
    update.dealer_notes = input.dealer_notes;
  }

  if (input.dealer_access_code !== undefined) {
    update.dealer_access_code = input.dealer_access_code;
  }

  const { data, error } = await supabase
    .from("profiles")
    .update(update)
    .eq("id", profileId)
    .select(PROFILE_COLUMNS)
    .single();

  if (error) throw error;
  invalidateAuthenticatedProfileCache(profileId);

  const [emailById, rolesById] = await Promise.all([
    listAuthEmailsById(),
    listActiveRolesByUserId(),
  ]);

  return mapProfile(
    data as unknown as ProfileRow,
    emailById.get(profileId) ?? null,
    rolesById.get(profileId) ?? [],
  );
}

export async function createDealerProfile(
  input: {
    email: string;
    full_name?: string | null;
    company_name?: string | null;
    dealer_notes?: string | null;
    dealer_access_code?: string | null;
    dealer_status?: DealerStatus;
  },
  actorUserId: string,
) {
  const supabase = createSupabaseServiceRoleClient();
  const email = normalizeEmail(input.email);
  if (!email || !email.includes("@")) {
    throw new Error("A valid dealer email is required");
  }

  let user = await findAuthUserByEmail(email);
  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password: randomUUID(),
      email_confirm: true,
      user_metadata: {
        full_name: input.full_name?.trim() || input.company_name?.trim() || null,
      },
    });

    if (error || !data.user) {
      throw error ?? new Error("Failed to create dealer user");
    }

    user = data.user;
  }

  const dealerStatus = normalizeDealerStatus(input.dealer_status ?? "pending");
  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: input.full_name?.trim() || null,
      role: dealerStatus === "none" ? "user" : "dealer",
      company_name: input.company_name?.trim() || null,
      dealer_notes: input.dealer_notes?.trim() || null,
      dealer_access_code: input.dealer_access_code?.trim() || null,
      dealer_status: dealerStatus,
      account_status: "active",
      approved_at: dealerStatus === "approved" ? new Date().toISOString() : null,
    },
    { onConflict: "id" },
  );

  if (error) throw error;
  invalidateAuthenticatedProfileCache(user.id);

  if (dealerStatus === "approved") {
    const result = await assignRoleToUser(
      user.id,
      "dealer",
      actorUserId,
      "Dealer access created by admin",
    );
    if (!result.success) {
      throw new Error(result.error || "Failed to grant dealer access");
    }
  }

  const [emailById, rolesById] = await Promise.all([
    listAuthEmailsById(),
    listActiveRolesByUserId(),
  ]);
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select(PROFILE_COLUMNS)
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    throw profileError ?? new Error("Failed to load dealer profile");
  }

  return mapProfile(
    profile as unknown as ProfileRow,
    emailById.get(user.id) ?? user.email ?? email,
    rolesById.get(user.id) ?? [],
  );
}

async function getProfileStats() {
  const result = await query<{
    totalUsers: number;
    admins: number;
    dealers: number;
    pendingDealers: number;
  }>(`
    SELECT
      COUNT(DISTINCT p.id)::int AS "totalUsers",
      COUNT(DISTINCT p.id) FILTER (
        WHERE ur.role = 'admin'
          AND ur.revoked_at IS NULL
          AND COALESCE(p.account_status, 'active') = 'active'
      )::int AS "admins",
      COUNT(DISTINCT p.id) FILTER (
        WHERE ur.role = 'dealer'
          AND ur.revoked_at IS NULL
          AND p.dealer_status = 'approved'
          AND COALESCE(p.account_status, 'active') = 'active'
      )::int AS "dealers",
      COUNT(DISTINCT p.id) FILTER (WHERE p.dealer_status = 'pending')::int AS "pendingDealers"
    FROM public.profiles p
    LEFT JOIN public.user_roles ur ON ur.user_id = p.id
  `);

  return result.rows[0] ?? {
    totalUsers: 0,
    admins: 0,
    dealers: 0,
    pendingDealers: 0,
  };
}

export async function getAdminDashboardStats(
  catalogue?: DashboardOverview,
): Promise<AdminDashboardStats> {
  const resolvedCatalogue = catalogue ?? (await getDashboardOverview());
  const orders = await getOrderStats();
  const profiles = await getProfileStats();

  return {
    products: {
      total: resolvedCatalogue.totalProducts,
      active: resolvedCatalogue.activeProducts,
      draft: resolvedCatalogue.draftProducts,
      archived: resolvedCatalogue.archivedProducts,
      categories: resolvedCatalogue.totalCategories,
    },
    orders: {
      total: orders.totalOrders,
      pending: orders.pendingOrders,
      paid: orders.paidOrders,
      fulfilled: orders.fulfilledOrders,
    },
    users: {
      total: profiles.totalUsers,
      admins: profiles.admins,
      dealers: profiles.dealers,
      pendingDealers: profiles.pendingDealers,
    },
  };
}
