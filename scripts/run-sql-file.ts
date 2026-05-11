import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: ".env.local", override: true });
dotenv.config();

const { Client } = pg;

function resolveConnectionString() {
  const connectionString =
    process.env.DATABASE_URL ?? process.env.POSTGRES_URL ?? process.env.DIRECT_URL;

  if (!connectionString) {
    throw new Error("DATABASE_URL, POSTGRES_URL, or DIRECT_URL is required");
  }

  return connectionString;
}

async function main() {
  const filePath = process.argv[2];
  if (!filePath) {
    throw new Error("Usage: npx tsx scripts/run-sql-file.ts <path-to-sql-file>");
  }

  const connectionString = resolveConnectionString();
  const isLocalDatabase =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");
  const sql = readFileSync(resolve(filePath), "utf8");

  const client = new Client({
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
  });

  await client.connect();
  try {
    await client.query(sql);
    console.log(`Applied SQL file: ${filePath}`);
  } finally {
    await client.end();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
