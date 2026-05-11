import pg from 'pg';
import { readFileSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const { Client } = pg;

async function runMigrations() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
  });

  try {
    await client.connect();
    console.log('Connected to database');

    const migrations = [
      '20260429_profiles.sql',
      '20260429_profiles_onboarding_step_secure.sql',
      '20260429_profiles_rls_insert_hardening.sql',
      '20260429_profiles_role_onboarding.sql',
      '20260507_profiles_dealer_fields.sql',
      '20260508_admin_profiles_hardening.sql',
      '20260508_user_roles_rbac.sql',
      '20260508_zz_access_control_refinement.sql',
      '20260508_zzz_dealer_revoked_status.sql',
      '20260508_zzzz_dealer_access_code.sql',
    ];

    for (const migration of migrations) {
      console.log(`Running migration: ${migration}`);
      const sql = readFileSync(join(__dirname, '../supabase/migrations', migration), 'utf-8');
      await client.query(sql);
      console.log(`✓ Completed: ${migration}`);
    }

    console.log('All migrations completed successfully');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

runMigrations();
