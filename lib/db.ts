import { Pool, type PoolClient, type PoolConfig, type QueryResultRow } from "pg";

function resolveConnectionString() {
  const candidates = ["DATABASE_URL", "POSTGRES_URL", "DIRECT_URL"] as const;
  for (const key of candidates) {
    const value = process.env[key];
    if (value) {
      return value;
    }
  }

  throw new Error(
    "Database connection string is not configured. Set DATABASE_URL (or POSTGRES_URL / DIRECT_URL).",
  );
}

function resolvePoolConfig(): PoolConfig {
  const connectionString = resolveConnectionString();
  const isLocalDatabase =
    connectionString.includes("localhost") ||
    connectionString.includes("127.0.0.1");

  return {
    connectionString,
    ssl: isLocalDatabase ? false : { rejectUnauthorized: false },
    max: Number.parseInt(process.env.DB_POOL_MAX || "3", 10),
    idleTimeoutMillis: 10_000,
    connectionTimeoutMillis: 15_000,
    keepAlive: true,
  };
}

const globalForDb = globalThis as typeof globalThis & {
  __buysupplyPool?: Pool;
};

function getPool() {
  if (!globalForDb.__buysupplyPool) {
    globalForDb.__buysupplyPool = new Pool(resolvePoolConfig());
  }

  return globalForDb.__buysupplyPool;
}

export const pool = {
  query<T extends QueryResultRow = QueryResultRow>(
    text: string,
    params: unknown[] = [],
  ) {
    return getPool().query<T>(text, params);
  },
  connect() {
    return getPool().connect();
  },
  end() {
    return getPool().end();
  },
} as Pick<Pool, "query" | "connect" | "end">;

export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params: unknown[] = [],
) {
  return runWithTransientRetry(() => getPool().query<T>(text, params));
}

function isTransientDbError(error: unknown) {
  if (!(error instanceof Error)) return false;

  const message = error.message.toLowerCase();
  const code = "code" in error ? String(error.code).toLowerCase() : "";

  return (
    code === "econnreset" ||
    code === "econnrefused" ||
    code === "etimedout" ||
    code === "eauthtimeout" ||
    message.includes("eauthtimeout") ||
    message.includes("timeout while waiting for message") ||
    message.includes("read econnreset") ||
    message.includes("connection terminated unexpectedly")
  );
}

async function runWithTransientRetry<T>(operation: () => Promise<T>) {
  const maxAttempts = 3;

  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      if (!isTransientDbError(error) || attempt === maxAttempts) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, 250 * attempt));
    }
  }

  return operation();
}

export async function withTransaction<T>(
  callback: (client: PoolClient) => Promise<T>,
) {
  const client = await getPool().connect();

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
