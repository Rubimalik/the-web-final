import { createSupabaseAnonClient, createSupabaseServiceRoleClient } from "@/lib/supabase";
import { getSession, type AuthSessionKind } from "@/lib/session";

const PROFILE_CACHE_TTL_MS = 20_000; // short-lived performance cache

const profileCache = new Map<
  string,
  {
    expiresAt: number;
    value: AuthenticatedProfile;
  }
>();

export function invalidateAuthenticatedProfileCache(userId: string) {
  profileCache.delete(userId);
}

export type UserAccessRole = "customer" | "dealer" | "admin";
export type ProfileRole = "user" | "admin" | "dealer";
export type DealerStatus =
  | "none"
  | "pending"
  | "approved"
  | "rejected"
  | "suspended"
  | "revoked";
export type AccountStatus = "active" | "suspended";

export type AccessSummary = {
  canAccessCustomer: boolean;
  canAccessDealer: boolean;
  canAccessAdmin: boolean;
  isSuspended: boolean;
};

export type AuthenticatedProfile = {
  user: {
    id: string;
    email?: string | null;
    email_confirmed_at?: string | null;
    user_metadata?: Record<string, unknown> | null;
    app_metadata?: Record<string, unknown> | null;
  };
  profile: {
    id: string;
    full_name: string | null;
    avatar_url: string | null;
    role: ProfileRole;
    roles: UserAccessRole[];
    dealer_status: DealerStatus;
    account_status: AccountStatus;
    is_suspended: boolean;
    company_name: string | null;
    phone: string | null;
    address: string | null;
    onboarding_step: number;
    onboarding_completed: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
  role: ProfileRole;
  roles: UserAccessRole[];
  access: AccessSummary;
  onboarding_step: number;
  onboarding_completed: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role?: string | null;
  dealer_status?: string | null;
  account_status?: string | null;
  company_name?: string | null;
  phone?: string | null;
  address?: string | null;
  onboarding_step: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

const FULL_PROFILE_COLUMNS =
  "id, full_name, avatar_url, role, dealer_status, account_status, company_name, phone, address, onboarding_step, created_at, updated_at";

const LEGACY_PROFILE_COLUMNS =
  "id, full_name, avatar_url, role, dealer_status, company_name, onboarding_step, created_at, updated_at";

const BASIC_PROFILE_COLUMNS = "id, full_name, avatar_url, created_at, updated_at";

type UserMetadata = {
  full_name?: string | null;
  avatar_url?: string | null;
};

function assertRole(role: unknown): ProfileRole {
  if (role === "admin" || role === "user" || role === "dealer") return role;
  return "user";
}

function assertAccessRole(role: unknown): UserAccessRole | null {
  if (role === "customer" || role === "dealer" || role === "admin") return role;
  return null;
}

function assertDealerStatus(status: unknown): DealerStatus {
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

function assertAccountStatus(status: unknown): AccountStatus {
  return status === "suspended" ? "suspended" : "active";
}

function getPrimaryRole(roles: UserAccessRole[]): ProfileRole {
  if (roles.includes("admin")) return "admin";
  if (roles.includes("dealer")) return "dealer";
  return "user";
}

function legacyAccessRoleFromProfileRole(role: ProfileRole): UserAccessRole | null {
  if (role === "admin" || role === "dealer") return role;
  return null;
}

function buildAccessSummary(
  roles: UserAccessRole[],
  accountStatus: AccountStatus,
  dealerStatus: DealerStatus,
): AccessSummary {
  const isSuspended = accountStatus === "suspended";

  return {
    canAccessCustomer: !isSuspended && (roles.includes("customer") || roles.length === 0),
    canAccessDealer: !isSuspended && roles.includes("dealer") && dealerStatus === "approved",
    canAccessAdmin: !isSuspended && roles.includes("admin"),
    isSuspended,
  };
}

function mergeAuthenticatedProfile(
  user: AuthenticatedProfile["user"],
  sourceProfile: ProfileRow,
  roles: UserAccessRole[],
): AuthenticatedProfile {
  const legacyRole = assertRole(sourceProfile.role);
  const primaryRole = getPrimaryRole(roles);
  const dealerStatus = assertDealerStatus(sourceProfile.dealer_status);
  const resolvedRole =
    primaryRole === "user" && legacyRole === "dealer" && dealerStatus !== "none"
      ? "dealer"
      : primaryRole || legacyRole;
  const accountStatus = assertAccountStatus(sourceProfile.account_status);
  const access = buildAccessSummary(roles, accountStatus, dealerStatus);
  const onboarding_step = Number(sourceProfile.onboarding_step ?? 0);
  const onboarding_completed = onboarding_step >= 3;

  return {
    user,
    profile: {
      id: sourceProfile.id,
      full_name: sourceProfile.full_name,
      avatar_url: sourceProfile.avatar_url,
      role: resolvedRole,
      roles,
      dealer_status: dealerStatus,
      account_status: accountStatus,
      is_suspended: access.isSuspended,
      company_name: sourceProfile.company_name ?? null,
      phone: sourceProfile.phone ?? null,
      address: sourceProfile.address ?? null,
      onboarding_step,
      onboarding_completed,
      created_at: sourceProfile.created_at ?? null,
      updated_at: sourceProfile.updated_at ?? null,
    },
    role: resolvedRole,
    roles,
    access,
    onboarding_step,
    onboarding_completed,
  };
}

function mergeLegacyProfileRole(
  profileRole: ProfileRole,
  activeRoles: UserAccessRole[],
  revokedRoles: UserAccessRole[],
): UserAccessRole[] {
  const roles = new Set(activeRoles);
  const legacyAccessRole = legacyAccessRoleFromProfileRole(profileRole);

  // Compatibility for accounts created before the user_roles table existed.
  // An explicit revoked user_roles row wins over the legacy profiles.role value.
  if (legacyAccessRole && !roles.has(legacyAccessRole) && !revokedRoles.includes(legacyAccessRole)) {
    roles.add(legacyAccessRole);
  }

  return Array.from(roles);
}

type GetAuthenticatedProfileOptions = {
  accessToken?: string;
  refreshToken?: string;
  sessionKind?: AuthSessionKind;
};

export type AuthResolutionStatus =
  | "authenticated"
  | "unauthenticated"
  | "unverified"
  | "error";

export type AuthResolution = {
  status: AuthResolutionStatus;
  user: AuthenticatedProfile["user"] | null;
  profile: AuthenticatedProfile["profile"] | null;
  role: AuthenticatedProfile["role"] | null;
  roles: UserAccessRole[];
  access: AccessSummary;
  onboarding_step: number | null;
  onboarding_completed: boolean;
  error: string | null;
};

const EMPTY_ACCESS: AccessSummary = {
  canAccessCustomer: false,
  canAccessDealer: false,
  canAccessAdmin: false,
  isSuspended: false,
};

function devLog(message: string, payload?: unknown) {
  if (process.env.NODE_ENV === "development") {
    if (payload !== undefined) {
      console.log(message, payload);
      return;
    }
    console.log(message);
  }
}

async function fetchRolesForUser(userId: string): Promise<{
  activeRoles: UserAccessRole[];
  revokedRoles: UserAccessRole[];
}> {
  try {
    const supabase = createSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from("user_roles")
      .select("role, revoked_at")
      .eq("user_id", userId)
      .order("assigned_at", { ascending: false });

    if (error) {
      devLog("[getAuthenticatedProfile] Failed to fetch roles", {
        userId,
        error: error.message,
      });
      return { activeRoles: [], revokedRoles: [] };
    }

    const activeRoles = new Set<UserAccessRole>();
    const revokedRoles = new Set<UserAccessRole>();
    (data ?? []).forEach((row) => {
      const role = assertAccessRole(row.role);
      if (!role) return;
      if (row.revoked_at) {
        revokedRoles.add(role);
        return;
      }
      activeRoles.add(role);
    });

    return {
      activeRoles: Array.from(activeRoles),
      revokedRoles: Array.from(revokedRoles),
    };
  } catch (error) {
    devLog("[getAuthenticatedProfile] Role fetch exception", {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return { activeRoles: [], revokedRoles: [] };
  }
}

async function fetchProfileByUserId(userId: string): Promise<{
  profile: ProfileRow | null;
  error: string | null;
}> {
  const supabase = createSupabaseServiceRoleClient();
  const profileSelects = [
    FULL_PROFILE_COLUMNS,
    LEGACY_PROFILE_COLUMNS,
    BASIC_PROFILE_COLUMNS,
  ];
  let lastError: string | null = null;

  for (const columns of profileSelects) {
    const { data, error } = await supabase
      .from("profiles")
      .select(columns)
      .eq("id", userId)
      .maybeSingle();

    if (!error) {
      return { profile: (data as unknown as ProfileRow | null) ?? null, error: null };
    }

    lastError = error.message;
    devLog("[getAuthenticatedProfile] Profile select failed", {
      userId,
      columns,
      error: error.message,
    });
  }

  return { profile: null, error: lastError };
}

async function ensureProfileRow(
  user: AuthenticatedProfile["user"],
): Promise<ProfileRow | null> {
  const supabase = createSupabaseServiceRoleClient();
  const userMetadata = (user.user_metadata ?? {}) as UserMetadata;
  const fullName = userMetadata.full_name ?? null;
  const avatarUrl = userMetadata.avatar_url ?? null;
  const initialOnboardingStep = fullName ? 1 : 0;

  const upsertPayloads: Record<string, unknown>[] = [
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      onboarding_step: initialOnboardingStep,
    },
    {
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
    },
  ];

  for (const payload of upsertPayloads) {
    const { error } = await supabase.from("profiles").upsert(payload);
    if (!error) {
      const { profile } = await fetchProfileByUserId(user.id);
      if (profile) return profile;
    }

    if (error) {
      devLog("[getAuthenticatedProfile] Profile upsert failed", {
        userId: user.id,
        fields: Object.keys(payload),
        error: error.message,
      });
    }
  }

  return null;
}

function unauthenticated(error: string | null = null): AuthResolution {
  return {
    status: "unauthenticated",
    user: null,
    profile: null,
    role: null,
    roles: [],
    access: EMPTY_ACCESS,
    onboarding_step: null,
    onboarding_completed: false,
    error,
  };
}

export async function getAuthenticatedProfile(
  options: GetAuthenticatedProfileOptions = {},
): Promise<AuthResolution> {
  // 1) Verify Supabase session (server-side, using stored tokens or provided tokens)
  const ironSession = options.accessToken
    ? null
    : await getSession(options.sessionKind ?? "legacy");
  const supabaseAccessToken = options.accessToken ?? ironSession?.supabaseAccessToken;
  const supabaseRefreshToken = options.refreshToken ?? ironSession?.supabaseRefreshToken;

  if (!supabaseAccessToken) {
    devLog("[getAuthenticatedProfile] Missing access token");
    return unauthenticated("Missing access token");
  }
  if (!supabaseRefreshToken) {
    devLog("[getAuthenticatedProfile] Missing refresh token");
    return unauthenticated("Missing refresh token");
  }

  const anonSupabase = createSupabaseAnonClient();
  const sessionRes = await anonSupabase.auth.setSession({
    access_token: supabaseAccessToken,
    refresh_token: supabaseRefreshToken,
  });

  if (sessionRes.error || !sessionRes.data.session) {
    devLog("[getAuthenticatedProfile] setSession failed", {
      error: sessionRes.error?.message ?? null,
    });
    return unauthenticated("Invalid or expired session");
  }

  if (!options.accessToken && ironSession) {
    // Best-effort cache refresh (role is always DB source of truth).
    ironSession.supabaseAccessToken = sessionRes.data.session.access_token;
    ironSession.supabaseRefreshToken = sessionRes.data.session.refresh_token;
    try {
      await ironSession.save();
    } catch {
      // Ignore cookie write failures; authorization still uses DB profile.
    }
  }

  const userResult = await anonSupabase.auth.getUser();
  if (userResult.error || !userResult.data?.user) {
    devLog("[getAuthenticatedProfile] getUser failed", {
      error: userResult.error?.message ?? null,
    });
    return {
      status: "error",
      user: null,
      profile: null,
      role: null,
      roles: [],
      access: EMPTY_ACCESS,
      onboarding_step: null,
      onboarding_completed: false,
      error: userResult.error?.message ?? "Failed to resolve Supabase user",
    };
  }

  const user = userResult.data.user;

  // Security: do not allow unverified email sessions to access protected routes.
  if (!user.email_confirmed_at) {
    devLog("[getAuthenticatedProfile] Email not verified", { userId: user.id });
    return {
      status: "unverified",
      user: user as unknown as AuthenticatedProfile["user"],
      profile: null,
      role: null,
      roles: [],
      access: EMPTY_ACCESS,
      onboarding_step: null,
      onboarding_completed: false,
      error: "Email not verified",
    };
  }

  // 2) Fetch corresponding public.profiles row (DB source of truth)
  if (!options.accessToken) {
    const cached = profileCache.get(user.id);
    if (cached) {
      if (cached.expiresAt > Date.now()) {
        return {
          status: "authenticated",
          user: cached.value.user,
          profile: cached.value.profile,
          role: cached.value.role,
          roles: cached.value.roles,
          access: cached.value.access,
          onboarding_step: cached.value.onboarding_step,
          onboarding_completed: cached.value.onboarding_completed,
          error: null,
        };
      }
      profileCache.delete(user.id);
    }
  }

  const { profile: profileRow, error: profileError } = await fetchProfileByUserId(user.id);

  if (profileError || !profileRow) {
    // Race-safe fallback: ensure a profile row exists.
    const createdProfile = await ensureProfileRow(
      user as unknown as AuthenticatedProfile["user"],
    );

    if (!createdProfile) {
      devLog("[getAuthenticatedProfile] Profile creation fallback failed", {
        userId: user.id,
        error: profileError,
      });
      return {
        status: "error",
        user: user as unknown as AuthenticatedProfile["user"],
        profile: null,
        role: null,
        roles: [],
        access: EMPTY_ACCESS,
        onboarding_step: null,
        onboarding_completed: false,
        error: "Failed to resolve profile row",
      };
    }

    const finalProfile = createdProfile as unknown as ProfileRow;
    const profileRole = assertRole(finalProfile.role);
    const { activeRoles, revokedRoles } = await fetchRolesForUser(user.id);
    const roles = mergeLegacyProfileRole(profileRole, activeRoles, revokedRoles);
    const merged = mergeAuthenticatedProfile(
      user as unknown as AuthenticatedProfile["user"],
      finalProfile,
      roles,
    );

    profileCache.set(user.id, {
      expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
      value: merged,
    });

    devLog("User:", merged.user);
    devLog("Profile:", merged.profile);
    return {
      status: "authenticated",
      user: merged.user,
      profile: merged.profile,
      role: merged.role,
      roles: merged.roles,
      access: merged.access,
      onboarding_step: merged.onboarding_step,
      onboarding_completed: merged.onboarding_completed,
      error: null,
    };
  }

  const resolvedProfile = profileRow as unknown as ProfileRow;
  const profileRole = assertRole(resolvedProfile.role);
  const { activeRoles, revokedRoles } = await fetchRolesForUser(user.id);
  const roles = mergeLegacyProfileRole(profileRole, activeRoles, revokedRoles);
  const merged = mergeAuthenticatedProfile(
    user as unknown as AuthenticatedProfile["user"],
    resolvedProfile,
    roles,
  );

  profileCache.set(user.id, {
    expiresAt: Date.now() + PROFILE_CACHE_TTL_MS,
    value: merged,
  });

  devLog("User:", merged.user);
  devLog("Profile:", merged.profile);
  return {
    status: "authenticated",
    user: merged.user,
    profile: merged.profile,
    role: merged.role,
    roles: merged.roles,
    access: merged.access,
    onboarding_step: merged.onboarding_step,
    onboarding_completed: merged.onboarding_completed,
    error: null,
  };
}

