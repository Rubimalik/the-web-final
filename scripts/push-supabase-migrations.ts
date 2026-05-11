/**
 * Push Supabase migrations directly using the Supabase Management API.
 * This script reads migration files and executes them via the Supabase REST API.
 */

import { readFileSync, readdirSync } from 'fs';
import { join } from 'path';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

async function executeSql(sql: string, migrationName: string) {
  const response = await fetch(`${SUPABASE_URL}/rest/v1/rpc/execute_sql`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY || '',
    },
    body: JSON.stringify({ sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute ${migrationName}: ${error}`);
  }

  return response.json();
}

async function pushMigrations() {
  const migrationsDir = join(__dirname, '../supabase/migrations');
  const files = readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && f !== 'combined_profiles_migration.sql')
    .sort();

  console.log(`Found ${files.length} migration(s) to push:`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('');

  for (const file of files) {
    console.log(`Executing: ${file}`);
    const sql = readFileSync(join(migrationsDir, file), 'utf-8');
    try {
      await executeSql(sql, file);
      console.log(`  ✓ Success`);
    } catch (error: any) {
      console.error(`  ✗ Failed: ${error.message}`);
      // Continue with next migration
    }
  }

  console.log('\nMigration push complete.');
}

pushMigrations().catch(console.error);
