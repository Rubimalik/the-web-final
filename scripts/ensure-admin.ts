import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";

dotenv.config({ path: ".env.local", override: true });
dotenv.config();

function requiredEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function findUserByEmail(
  supabase: SupabaseClient,
  email: string,
) {
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

async function main() {
  const supabaseUrl =
    process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");
  const adminEmail = normalizeEmail(requiredEnv("ADMIN_EMAIL"));
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!supabaseUrl) {
    throw new Error("SUPABASE_URL or NEXT_PUBLIC_SUPABASE_URL is required");
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  let user = await findUserByEmail(supabase, adminEmail);

  if (!user) {
    if (!adminPassword) {
      throw new Error("ADMIN_PASSWORD is required when creating a new admin user");
    }

    const { data, error } = await supabase.auth.admin.createUser({
      email: adminEmail,
      password: adminPassword,
      email_confirm: true,
    });

    if (error || !data.user) {
      throw error ?? new Error("Failed to create admin user");
    }

    user = data.user;
  } else if (adminPassword) {
    const { error } = await supabase.auth.admin.updateUserById(user.id, {
      password: adminPassword,
      email_confirm: true,
    });

    if (error) throw error;
  }

  const { error: profileError } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      role: "admin",
      onboarding_step: 3,
      onboarding_completed: true,
      dealer_status: "none",
    },
    { onConflict: "id" },
  );

  if (profileError) throw profileError;

  const { error: roleError } = await supabase.from("user_roles").upsert(
    {
      user_id: user.id,
      role: "admin",
      assigned_by: user.id,
      revoked_at: null,
      revoked_by: null,
      notes: "Bootstrap admin access",
      updated_at: new Date().toISOString(),
    },
    { onConflict: "user_id,role" },
  );

  if (roleError) throw roleError;

  console.log(`Admin user is ready: ${adminEmail}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
