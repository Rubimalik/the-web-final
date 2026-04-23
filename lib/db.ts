import { Pool, type PoolClient, type PoolConfig, type QueryResultRow } from "pg";

function requireEnv(name: string) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is not configured`);
  }

  return value;
}

function resolvePoolConfig(): PoolConfig {
  const connectionString = requireEnv("DATABASE_URL");
  const isLocalDatabase =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return {
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
  };
}

const globalForDb = globalThis as typeof globalThis & {
  __buysupplyPool?: Pool;
};

export const pool =
  globalForDb.__buysupplyPool ?? new Pool(resolvePoolConfig());

if (process.env.NODE_ENV !== "production") {
  globalForDb.__buysupplyPool = pool;
}

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return pool.query<T>(text, params);
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");
    const result = await callback(client);
    await client.query("COMMIT");
    return result;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
