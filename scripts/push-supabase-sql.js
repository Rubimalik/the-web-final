/**
 * Push Supabase migrations via direct SQL execution using Management API.
 * This script reads migration files and executes them against the Supabase database.
 * 
 * Usage: node scripts/push-supabase-sql.js
 * Requires: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env.local
 */

/* eslint-disable @typescript-eslint/no-require-imports */

const fs = require('fs');
const path = require('path');

// Read .env.local manually since dotenv may not work with gitignore
const envPath = path.join(__dirname, '../.env.local');
let envVars = {};

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const match = line.match(/^([A-Za-z0-9_]+)=(.*)$/);
    if (match) {
      envVars[match[1]] = match[2].replace(/^["']|["']$/g, '');
    }
  });
}

const SUPABASE_URL = envVars.SUPABASE_URL || envVars.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = envVars.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing required environment variables:');
  console.error('   SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL)');
  console.error('   SUPABASE_SERVICE_ROLE_KEY');
  console.error('');
  console.error('Please add these to your .env.local file');
  process.exit(1);
}

const projectRef = SUPABASE_URL.match(/https:\/\/([a-z0-9-]+)\.supabase\.co/)?.[1];

if (!projectRef) {
  console.error('❌ Could not extract project ref from SUPABASE_URL');
  console.error('   URL should be like: https://xxxxx.supabase.co');
  process.exit(1);
}

async function executeSql(sql) {
  const managementApiUrl = `https://api.supabase.com/v1/projects/${projectRef}/database/query`;
  
  const response = await fetch(managementApiUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
    },
    body: JSON.stringify({ query: sql }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`${error}`);
  }

  return response.json();
}

async function pushMigrations() {
  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  
  if (!fs.existsSync(migrationsDir)) {
    console.error('❌ Migrations directory not found:', migrationsDir);
    process.exit(1);
  }

  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql') && !f.includes('combined'))
    .sort();

  if (files.length === 0) {
    console.log('No migration files found');
    return;
  }

  console.log(`Found ${files.length} migration(s) to push:\n`);
  files.forEach(f => console.log(`  - ${f}`));
  console.log('');

  let successCount = 0;
  let failCount = 0;

  for (const file of files) {
    console.log(`Executing: ${file}`);
    const sql = fs.readFileSync(path.join(migrationsDir, file), 'utf-8');
    try {
      await executeSql(sql);
      console.log(`  ✅ Success\n`);
      successCount++;
    } catch (error) {
      console.error(`  ❌ Failed: ${error.message}\n`);
      failCount++;
    }
  }

  console.log('═══════════════════════════════════════');
  console.log('Migration push complete');
  console.log(`  ✅ Success: ${successCount}`);
  console.log(`  ❌ Failed:  ${failCount}`);
  console.log('═══════════════════════════════════════');
}

pushMigrations().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
