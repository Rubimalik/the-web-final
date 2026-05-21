/**
 * Push Supabase migrations using the Supabase SQL REST API.
 * Usage: node scripts/push-migrations.js
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set in .env.local');
  process.exit(1);
}

async function executeSql(sql, migrationName) {
  // First try to use the PostgREST query endpoint
  const response = await fetch(`${SUPABASE_URL}/rest/v1/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      'apikey': SUPABASE_SERVICE_ROLE_KEY,
      'Prefer': 'tx=commit',
    },
    body: JSON.stringify({
      query: sql
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to execute ${migrationName}: ${error}`);
  }

  return response.json();
}

async function pushMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('combined'))
    .sort();

  console.log(`Found ${files.length} migration(s) to push:`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('');

  for (const file of files) {
    console.log(`Executing: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      await executeSql(sql, file);
      console.log(`  ✓ Success`);
    } catch (error) {
      console.error(`  ✗ Failed: ${error.message}`);
    }
  }

  console.log('\nMigration push complete.');
}

pushMigrations().catch(console.error);
