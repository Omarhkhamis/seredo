import "server-only";

import { randomBytes, randomUUID, scryptSync, timingSafeEqual, createHash } from "node:crypto";
import { cookies } from "next/headers";
import type { Pool } from "pg";
import { getDatabasePool } from "@/lib/db";

export const ADMIN_SESSION_COOKIE = "seredo_admin_session";

const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_EMAIL = "admin@admin.com";
const DEFAULT_ADMIN_PASSWORD = "123456";

declare global {
  // eslint-disable-next-line no-var
  var seredoAuthTablesReady: Promise<void> | undefined;
}

type AdminUserRow = {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};

type SessionRow = {
  id: string;
  email: string;
  created_at: Date;
  updated_at: Date;
};

export type AdminUser = {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
};

export type CurrentAdmin = {
  id: string;
  email: string;
};

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function hashToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("base64url");
  const hash = scryptSync(password, salt, 64).toString("base64url");

  return `scrypt$${salt}$${hash}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [algorithm, salt, storedHash] = passwordHash.split("$");

  if (algorithm !== "scrypt" || !salt || !storedHash) {
    return false;
  }

  const actual = Buffer.from(scryptSync(password, salt, 64).toString("base64url"));
  const expected = Buffer.from(storedHash);

  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

function mapAdmin(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function requirePool() {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error("DATABASE_URL is not configured. Admin login requires PostgreSQL.");
  }

  return pool;
}

async function ensureAdminTables(pool: Pool) {
  if (!globalThis.seredoAuthTablesReady) {
    globalThis.seredoAuthTablesReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_users (
          id TEXT PRIMARY KEY,
          email TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE TABLE IF NOT EXISTS admin_sessions (
          token_hash TEXT PRIMARY KEY,
          admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
          expires_at TIMESTAMPTZ NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS admin_sessions_admin_id_idx
          ON admin_sessions (admin_id)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx
          ON admin_sessions (expires_at)
      `);

      const count = await pool.query<{ count: string }>("SELECT COUNT(*) FROM admin_users");

      if (Number(count.rows[0]?.count ?? 0) === 0) {
        await pool.query(
          `
          INSERT INTO admin_users (id, email, password_hash)
          VALUES ($1, $2, $3)
          `,
          [randomUUID(), DEFAULT_ADMIN_EMAIL, hashPassword(DEFAULT_ADMIN_PASSWORD)],
        );
      }
    })();
  }

  await globalThis.seredoAuthTablesReady;
}

export async function ensureAdminAuthReady() {
  const pool = requirePool();
  await ensureAdminTables(pool);
}

async function getAdminByToken(token: string): Promise<CurrentAdmin | null> {
  if (!token) {
    return null;
  }

  const pool = getDatabasePool();

  if (!pool) {
    return null;
  }

  await ensureAdminTables(pool);

  const tokenHash = hashToken(token);
  const result = await pool.query<SessionRow>(
    `
    SELECT admin_users.id, admin_users.email, admin_users.created_at, admin_users.updated_at
    FROM admin_sessions
    JOIN admin_users ON admin_users.id = admin_sessions.admin_id
    WHERE admin_sessions.token_hash = $1
      AND admin_sessions.expires_at > NOW()
    `,
    [tokenHash],
  );

  const admin = result.rows[0];

  if (!admin) {
    return null;
  }

  await pool.query("UPDATE admin_sessions SET last_seen_at = NOW() WHERE token_hash = $1", [tokenHash]);

  return {
    id: admin.id,
    email: admin.email,
  };
}

export async function getCurrentAdminFromCookies() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  return getAdminByToken(token ?? "");
}

export async function getCurrentAdminFromRequest(request: Request) {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const token = cookieHeader
    .split(";")
    .map((cookie) => cookie.trim())
    .find((cookie) => cookie.startsWith(`${ADMIN_SESSION_COOKIE}=`))
    ?.slice(ADMIN_SESSION_COOKIE.length + 1);

  return getAdminByToken(token ? decodeURIComponent(token) : "");
}

export async function loginAdmin(email: string, password: string) {
  const pool = requirePool();
  await ensureAdminTables(pool);

  const normalizedEmail = normalizeEmail(email);
  const result = await pool.query<{ id: string; email: string; password_hash: string }>(
    "SELECT id, email, password_hash FROM admin_users WHERE email = $1",
    [normalizedEmail],
  );
  const admin = result.rows[0];

  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return null;
  }

  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE_SECONDS * 1000);

  await pool.query(
    `
    INSERT INTO admin_sessions (token_hash, admin_id, expires_at)
    VALUES ($1, $2, $3)
    `,
    [tokenHash, admin.id, expiresAt],
  );

  return {
    token,
    expiresAt,
    maxAge: SESSION_MAX_AGE_SECONDS,
    admin: {
      id: admin.id,
      email: admin.email,
    },
  };
}

export async function logoutAdmin(token: string) {
  const pool = getDatabasePool();

  if (!pool || !token) {
    return;
  }

  await ensureAdminTables(pool);
  await pool.query("DELETE FROM admin_sessions WHERE token_hash = $1", [hashToken(token)]);
}

export async function listAdminUsers() {
  const pool = requirePool();
  await ensureAdminTables(pool);

  const result = await pool.query<AdminUserRow>(
    "SELECT id, email, created_at, updated_at FROM admin_users ORDER BY created_at ASC",
  );

  return result.rows.map(mapAdmin);
}

export async function createAdminUser(email: string, password: string) {
  const pool = requirePool();
  await ensureAdminTables(pool);

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.includes("@")) {
    throw new Error("أدخل بريد إلكتروني صحيح.");
  }

  if (password.length < 6) {
    throw new Error("كلمة السر يجب أن تكون 6 أحرف على الأقل.");
  }

  const result = await pool.query<AdminUserRow>(
    `
    INSERT INTO admin_users (id, email, password_hash)
    VALUES ($1, $2, $3)
    RETURNING id, email, created_at, updated_at
    `,
    [randomUUID(), normalizedEmail, hashPassword(password)],
  );

  return mapAdmin(result.rows[0]);
}

export async function updateAdminUser(id: string, email: string, password?: string) {
  const pool = requirePool();
  await ensureAdminTables(pool);

  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail.includes("@")) {
    throw new Error("أدخل بريد إلكتروني صحيح.");
  }

  if (password && password.length < 6) {
    throw new Error("كلمة السر يجب أن تكون 6 أحرف على الأقل.");
  }

  const result = password
    ? await pool.query<AdminUserRow>(
        `
        UPDATE admin_users
        SET email = $2, password_hash = $3, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, created_at, updated_at
        `,
        [id, normalizedEmail, hashPassword(password)],
      )
    : await pool.query<AdminUserRow>(
        `
        UPDATE admin_users
        SET email = $2, updated_at = NOW()
        WHERE id = $1
        RETURNING id, email, created_at, updated_at
        `,
        [id, normalizedEmail],
      );

  if (!result.rows[0]) {
    throw new Error("لم يتم العثور على المدير.");
  }

  return mapAdmin(result.rows[0]);
}

export function getAdminSessionCookieOptions(maxAge = SESSION_MAX_AGE_SECONDS) {
  const secureCookie =
    process.env.ADMIN_COOKIE_SECURE === "false" ? false : process.env.NODE_ENV === "production";

  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookie,
    path: "/",
    maxAge,
  };
}
