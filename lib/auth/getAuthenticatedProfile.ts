import { createSupabaseAnonClient, createSupabaseServiceRoleClient } from "@/lib/supabase";
import { getSession } from "@/lib/session";

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
    role: "user" | "admin";
    onboarding_step: number;
    onboarding_completed: boolean;
    created_at?: string | null;
    updated_at?: string | null;
  };
  role: "user" | "admin";
  onboarding_step: number;
  onboarding_completed: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  role: string;
  onboarding_step: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type UserMetadata = {
  full_name?: string | null;
  avatar_url?: string | null;
};

function assertRole(role: unknown): "user" | "admin" {
  if (role === "admin" || role === "user") return role;
  return "user";
}

function mergeAuthenticatedProfile(
  user: AuthenticatedProfile["user"],
  sourceProfile: ProfileRow,
): AuthenticatedProfile {
  const safeRole = assertRole(sourceProfile.role) as "user" | "admin";
  const onboarding_step = Number(sourceProfile.onboarding_step ?? 0);
  const onboarding_completed = onboarding_step >= 3;

  return {
    user,
    profile: {
      id: sourceProfile.id,
      full_name: sourceProfile.full_name,
      avatar_url: sourceProfile.avatar_url,
      role: safeRole,
      onboarding_step,
      onboarding_completed,
    },
    role: safeRole,
    onboarding_step,
    onboarding_completed,
  };
}

type GetAuthenticatedProfileOptions = {
  accessToken?: string;
  refreshToken?: string;
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
  onboarding_step: number | null;
  onboarding_completed: boolean;
  error: string | null;
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

function unauthenticated(error: string | null = null): AuthResolution {
  return {
    status: "unauthenticated",
    user: null,
    profile: null,
    role: null,
    onboarding_step: null,
    onboarding_completed: false,
    error,
  };
}

export async function getAuthenticatedProfile(
  options: GetAuthenticatedProfileOptions = {},
): Promise<AuthResolution> {
  // 1) Verify Supabase session (server-side, using stored tokens or provided tokens)
  const ironSession = options.accessToken ? null : await getSession();
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
      onboarding_step: null,
      onboarding_completed: false,
      error: "Email not verified",
    };
  }

  // 2) Fetch corresponding public.profiles row (DB source of truth)
  const cached = profileCache.get(user.id);
  if (cached) {
    if (cached.expiresAt > Date.now()) {
      return {
        status: "authenticated",
        user: cached.value.user,
        profile: cached.value.profile,
        role: cached.value.role,
        onboarding_step: cached.value.onboarding_step,
        onboarding_completed: cached.value.onboarding_completed,
        error: null,
      };
    }
    profileCache.delete(user.id);
  }

  const serviceSupabase = createSupabaseServiceRoleClient();
  const { data: profileRow, error: profileError } = await serviceSupabase
    .from("profiles")
    .select("id, full_name, avatar_url, role, onboarding_step")
    .eq("id", user.id)
    .single();

  if (profileError || !profileRow) {
    // Race-safe fallback: ensure a profile row exists.
    const userMetadata = (user.user_metadata ?? {}) as UserMetadata;
    const fullName = userMetadata.full_name ?? null;
    const avatarUrl = userMetadata.avatar_url ?? null;

    const initialOnboardingStep = fullName ? 1 : 0;

    await serviceSupabase.from("profiles").upsert({
      id: user.id,
      full_name: fullName,
      avatar_url: avatarUrl,
      onboarding_step: initialOnboardingStep,
    });

    const { data: createdProfile } = await serviceSupabase
      .from("profiles")
      .select("id, full_name, avatar_url, role, onboarding_step")
      .eq("id", user.id)
      .single();

    if (!createdProfile) {
      devLog("[getAuthenticatedProfile] Profile creation fallback failed", {
        userId: user.id,
      });
      return {
        status: "error",
        user: user as unknown as AuthenticatedProfile["user"],
        profile: null,
        role: null,
        onboarding_step: null,
        onboarding_completed: false,
        error: "Failed to resolve profile row",
      };
    }

    const finalProfile = createdProfile as unknown as ProfileRow;
    const merged = mergeAuthenticatedProfile(
      user as unknown as AuthenticatedProfile["user"],
      finalProfile,
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
      onboarding_step: merged.onboarding_step,
      onboarding_completed: merged.onboarding_completed,
      error: null,
    };
  }

  const resolvedProfile = profileRow as unknown as ProfileRow;
  const merged = mergeAuthenticatedProfile(
    user as unknown as AuthenticatedProfile["user"],
    resolvedProfile,
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
    onboarding_step: merged.onboarding_step,
    onboarding_completed: merged.onboarding_completed,
    error: null,
  };
}

