import "server-only";

import { Pool } from "pg";

declare global {
  // eslint-disable-next-line no-var
  var seredoPgPool: Pool | undefined;
}

export function getDatabasePool() {
  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    return null;
  }

  if (!globalThis.seredoPgPool) {
    globalThis.seredoPgPool = new Pool({
      connectionString,
      ssl:
        process.env.POSTGRES_SSL === "true"
          ? {
              rejectUnauthorized: false,
            }
          : undefined,
    });
  }

  return globalThis.seredoPgPool;
}

export function hasDatabaseConnection() {
  return Boolean(process.env.DATABASE_URL);
}
