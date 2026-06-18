import "server-only";

import { unstable_noStore as noStore } from "next/cache";
import type { Pool } from "pg";
import { defaultSiteContent, type SiteContent } from "@/data/site";
import { getDatabasePool } from "@/lib/db";

export { hasDatabaseConnection } from "@/lib/db";

declare global {
  // eslint-disable-next-line no-var
  var seredoTableReady: Promise<void> | undefined;
}

const CONTENT_ID = "main";

type PlainRecord = Record<string, unknown>;

function isPlainRecord(value: unknown): value is PlainRecord {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function mergeWithDefaults<T>(defaults: T, value: unknown): T {
  if (Array.isArray(defaults)) {
    return Array.isArray(value) ? (value as T) : defaults;
  }

  if (isPlainRecord(defaults)) {
    const incoming = isPlainRecord(value) ? value : {};
    const merged: PlainRecord = {};

    for (const [key, defaultValue] of Object.entries(defaults)) {
      merged[key] = mergeWithDefaults(defaultValue, incoming[key]);
    }

    return merged as T;
  }

  if (typeof defaults === "number") {
    return (typeof value === "number" && Number.isFinite(value) ? value : defaults) as T;
  }

  if (typeof defaults === "boolean") {
    return (typeof value === "boolean" ? value : defaults) as T;
  }

  if (typeof defaults === "string") {
    return (typeof value === "string" ? value : defaults) as T;
  }

  return (value ?? defaults) as T;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  return mergeWithDefaults(defaultSiteContent, value);
}

async function ensureSiteContentTable(pool: Pool) {
  if (!globalThis.seredoTableReady) {
    globalThis.seredoTableReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS site_content (
          id TEXT PRIMARY KEY,
          content JSONB NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(
        `
        INSERT INTO site_content (id, content)
        VALUES ($1, $2::jsonb)
        ON CONFLICT (id) DO NOTHING
        `,
        [CONTENT_ID, JSON.stringify(defaultSiteContent)],
      );
    })();
  }

  await globalThis.seredoTableReady;
}

export async function getSiteContent(): Promise<SiteContent> {
  noStore();

  const pool = getDatabasePool();

  if (!pool) {
    return defaultSiteContent;
  }

  try {
    await ensureSiteContentTable(pool);

    const result = await pool.query<{ content: unknown }>(
      "SELECT content FROM site_content WHERE id = $1",
      [CONTENT_ID],
    );

    return normalizeSiteContent(result.rows[0]?.content);
  } catch (error) {
    console.error("Failed to read site content from Postgres", error);
    return defaultSiteContent;
  }
}

export async function saveSiteContent(content: SiteContent) {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error("DATABASE_URL is not configured. Add it to .env.local before saving dashboard changes.");
  }

  await ensureSiteContentTable(pool);

  await pool.query(
    `
    INSERT INTO site_content (id, content, updated_at)
    VALUES ($1, $2::jsonb, NOW())
    ON CONFLICT (id)
    DO UPDATE SET content = EXCLUDED.content, updated_at = NOW()
    `,
    [CONTENT_ID, JSON.stringify(normalizeSiteContent(content))],
  );
}
