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

const legacyInternalLinks: Record<string, string> = {
  "https://seredoexpo.sa/%d8%a7%d9%84%d8%b9%d8%a7%d8%b1%d8%b6%d9%8a%d9%86/": "/exhibitors",
  "https://seredoexpo.sa/العارضين/": "/exhibitors",
  "https://seredoexpo.sa/%d8%b5%d9%81%d8%ad%d8%a9-%d9%84%d9%84%d8%b2%d9%88%d8%a7%d8%b1-visitors/": "/visitors",
  "https://seredoexpo.sa/صفحة-للزوار-visitors/": "/visitors",
  "https://seredoexpo.sa/%d8%b5%d9%81%d8%ad%d8%a9-%d8%a7%d9%84%d8%b1%d8%b9%d8%a7%d8%a9/": "/sponsors",
  "https://seredoexpo.sa/صفحة-الرعاة/": "/sponsors",
  "https://seredoexpo.sa/%D8%B3%D9%8A%D8%A7%D8%B3%D8%A9-%D8%A7%D9%84%D8%AE%D8%B5%D9%88%D8%B5%D9%8A%D8%A9/": "/privacy",
  "https://seredoexpo.sa/سياسة-الخصوصية/": "/privacy",
  "#seredo-top": "/#seredo-top",
  "#seredo-contact": "/#seredo-contact",
  "#seredo-about": "/#seredo-about",
};

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

function migrateHref(href: string) {
  return legacyInternalLinks[href] ?? href;
}

function migrateLegacyContent(content: SiteContent): SiteContent {
  const next = JSON.parse(JSON.stringify(content)) as SiteContent;

  next.links.exhibitorsPage = migrateHref(next.links.exhibitorsPage);
  next.links.visitorsPage = migrateHref(next.links.visitorsPage);
  next.links.sponsorsPage = migrateHref(next.links.sponsorsPage);
  next.links.mediaPage = next.links.mediaPage || defaultSiteContent.links.mediaPage;
  next.links.privacy = migrateHref(next.links.privacy);

  next.header.navItems = next.header.navItems.map((item) => ({
    ...item,
    href: migrateHref(item.href),
  }));

  if (!next.header.navItems.some((item) => item.href === next.links.mediaPage)) {
    next.header.navItems.splice(Math.max(next.header.navItems.length - 1, 0), 0, {
      label: "المركز الإعلامي",
      href: next.links.mediaPage,
    });
  }

  next.tracksSection.items = next.tracksSection.items.map((item) => ({
    ...item,
    href: migrateHref(item.href),
  }));

  if (next.hero.primaryButton.href === next.links.visitorRegistration) {
    next.hero.primaryButton.href = next.links.visitorsPage;
  }

  if (next.hero.secondaryButton.href === next.links.exhibitorRegistration) {
    next.hero.secondaryButton.href = next.links.exhibitorsPage;
  }

  next.finalCta.buttons = next.finalCta.buttons.map((button) => {
    if (button.href === next.links.visitorRegistration && button.label.includes("زائر")) {
      return { ...button, href: next.links.visitorsPage };
    }

    return {
      ...button,
      href: migrateHref(button.href),
    };
  });

  next.footer.navLinks = next.footer.navLinks.map((item) => ({
    ...item,
    href: migrateHref(item.href),
  }));

  if (!next.footer.navLinks.some((item) => item.href === next.links.mediaPage)) {
    next.footer.navLinks.splice(Math.min(3, next.footer.navLinks.length), 0, {
      label: "المركز الإعلامي",
      href: next.links.mediaPage,
    });
  }

  return next;
}

export function normalizeSiteContent(value: unknown): SiteContent {
  return migrateLegacyContent(mergeWithDefaults(defaultSiteContent, value));
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
