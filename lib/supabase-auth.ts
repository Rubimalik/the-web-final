import { createSupabaseServiceRoleClient } from "@/lib/supabase";

const USERS_PER_PAGE = 1000;

export function normalizeEmailAddress(email: string) {
  return email.trim().toLowerCase();
}

async function findAuthUserByEmail(email: string) {
  const normalizedEmail = normalizeEmailAddress(email);
  const supabase = createSupabaseServiceRoleClient();
  let page = 1;

  while (true) {
    const { data, error } = await supabase.auth.admin.listUsers({
      page,
      perPage: USERS_PER_PAGE,
    });

    if (error) {
      throw error;
    }

    const user = data.users.find(
      (item) => item.email && normalizeEmailAddress(item.email) === normalizedEmail
    );

    if (user) {
      return user;
    }

    if (data.users.length < USERS_PER_PAGE) {
      return null;
    }

    page += 1;
  }
}

export async function ensureBootstrapAdminUser(email: string, password: string) {
  const envEmail = process.env.ADMIN_EMAIL;
  const envPassword = process.env.ADMIN_PASSWORD;

  if (!envEmail || !envPassword) {
    return null;
  }

  if (
    normalizeEmailAddress(email) !== normalizeEmailAddress(envEmail) ||
    password !== envPassword
  ) {
    return null;
  }

  const supabase = createSupabaseServiceRoleClient();
  let user = await findAuthUserByEmail(envEmail);

  if (!user) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: normalizeEmailAddress(envEmail),
      password: envPassword,
      email_confirm: true,
    });

    if (error) {
      throw error;
    }

    user = data.user;
  }

  return user;
}
