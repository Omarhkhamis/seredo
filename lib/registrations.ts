import "server-only";

import type { Pool } from "pg";
import { getDatabasePool } from "@/lib/db";

export const REGISTRATION_CONFIG = {
  VISITOR_PREFIX: "SEREDO-VIS-2026-",
  EXHIBITOR_PREFIX: "SEREDO-EXH-2026-",
  ATTENDANCE_ABSENT: "لم يحضر",
  ATTENDANCE_PRESENT: "تم الحضور",
} as const;

export type RegistrationType = "visitor" | "exhibitor";

export type RegistrationInput = {
  full_name: string;
  phone: string;
  job_title: string;
  email: string;
  company: string;
  city: string;
};

export type RegistrationRecord = {
  id: number;
  type: RegistrationType;
  registrationId: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  email: string;
  company: string;
  city: string;
  verifyUrl: string;
  attendanceStatus: string;
  registeredAt: string;
};

type RegistrationRow = {
  id: number;
  type: RegistrationType;
  registration_id: string;
  full_name: string;
  phone: string;
  job_title: string;
  email: string;
  company: string;
  city: string;
  verify_url: string;
  attendance_status: string;
  created_at: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var seredoRegistrationTablesReady: Promise<void> | undefined;
}

function requirePool() {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error("DATABASE_URL is not configured. Registrations require PostgreSQL.");
  }

  return pool;
}

async function ensureRegistrationTables(pool: Pool) {
  if (!globalThis.seredoRegistrationTablesReady) {
    globalThis.seredoRegistrationTablesReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS registrations (
          id SERIAL PRIMARY KEY,
          type TEXT NOT NULL CHECK (type IN ('visitor', 'exhibitor')),
          registration_id TEXT UNIQUE NOT NULL,
          full_name TEXT NOT NULL,
          phone TEXT NOT NULL,
          job_title TEXT NOT NULL,
          email TEXT NOT NULL,
          company TEXT NOT NULL,
          city TEXT NOT NULL,
          verify_url TEXT NOT NULL DEFAULT '',
          attendance_status TEXT NOT NULL DEFAULT 'لم يحضر',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS registrations_type_idx
          ON registrations (type)
      `);

      await pool.query(`
        CREATE INDEX IF NOT EXISTS registrations_created_at_idx
          ON registrations (created_at)
      `);
    })();
  }

  await globalThis.seredoRegistrationTablesReady;
}

function mapRegistration(row: RegistrationRow): RegistrationRecord {
  return {
    id: row.id,
    type: row.type,
    registrationId: row.registration_id,
    fullName: row.full_name,
    phone: row.phone,
    jobTitle: row.job_title,
    email: row.email,
    company: row.company,
    city: row.city,
    verifyUrl: row.verify_url,
    attendanceStatus: row.attendance_status || REGISTRATION_CONFIG.ATTENDANCE_ABSENT,
    registeredAt: row.created_at.toISOString(),
  };
}

function registrationPrefix(type: RegistrationType) {
  return type === "exhibitor"
    ? REGISTRATION_CONFIG.EXHIBITOR_PREFIX
    : REGISTRATION_CONFIG.VISITOR_PREFIX;
}

function isUniqueViolation(error: unknown) {
  return Boolean(error && typeof error === "object" && "code" in error && error.code === "23505");
}

export async function createRegistration(
  type: RegistrationType,
  data: RegistrationInput,
  buildVerifyUrl: (registrationId: string) => string,
) {
  const pool = requirePool();
  await ensureRegistrationTables(pool);

  const prefix = registrationPrefix(type);

  // نفس نمط nextId في example.gs: رقم تسلسلي بست خانات لكل نوع.
  // القيد UNIQUE يمنع تكرار الرقم عند تسجيلين متزامنين، ونعيد المحاولة عندها.
  let result: { rows: RegistrationRow[] } | null = null;

  for (let attempt = 0; attempt < 3; attempt += 1) {
    try {
      result = await pool.query<RegistrationRow>(
        `
        INSERT INTO registrations (
          type, registration_id, full_name, phone, job_title, email, company, city,
          verify_url, attendance_status
        )
        VALUES (
          $1,
          $2 || LPAD(
            (
              SELECT COALESCE(MAX(NULLIF(SUBSTRING(registration_id FROM LENGTH($2) + 1), '')::INT), 0) + 1
              FROM registrations
              WHERE type = $1
            )::TEXT,
            6,
            '0'
          ),
          $3, $4, $5, $6, $7, $8, '', $9
        )
        RETURNING id, type, registration_id, full_name, phone, job_title, email, company, city,
          verify_url, attendance_status, created_at
        `,
        [
          type,
          prefix,
          data.full_name,
          data.phone,
          data.job_title,
          data.email,
          data.company,
          data.city,
          REGISTRATION_CONFIG.ATTENDANCE_ABSENT,
        ],
      );
      break;
    } catch (error) {
      if (!isUniqueViolation(error) || attempt === 2) {
        throw error;
      }
    }
  }

  if (!result?.rows[0]) {
    throw new Error("تعذر حفظ التسجيل.");
  }

  let record = mapRegistration(result.rows[0]);

  if (type === "visitor") {
    const verifyUrl = buildVerifyUrl(record.registrationId);
    const updated = await pool.query<RegistrationRow>(
      `
      UPDATE registrations
      SET verify_url = $2
      WHERE id = $1
      RETURNING id, type, registration_id, full_name, phone, job_title, email, company, city,
        verify_url, attendance_status, created_at
      `,
      [record.id, verifyUrl],
    );

    record = mapRegistration(updated.rows[0]);
  }

  return record;
}

export async function listRegistrations(type?: RegistrationType) {
  const pool = requirePool();
  await ensureRegistrationTables(pool);

  const result = type
    ? await pool.query<RegistrationRow>(
        `
        SELECT id, type, registration_id, full_name, phone, job_title, email, company, city,
          verify_url, attendance_status, created_at
        FROM registrations
        WHERE type = $1
        ORDER BY created_at DESC
        `,
        [type],
      )
    : await pool.query<RegistrationRow>(
        `
        SELECT id, type, registration_id, full_name, phone, job_title, email, company, city,
          verify_url, attendance_status, created_at
        FROM registrations
        ORDER BY created_at DESC
        `,
      );

  return result.rows.map(mapRegistration);
}

export async function findVisitorByRegistrationId(registrationId: string) {
  const pool = requirePool();
  await ensureRegistrationTables(pool);

  const result = await pool.query<RegistrationRow>(
    `
    SELECT id, type, registration_id, full_name, phone, job_title, email, company, city,
      verify_url, attendance_status, created_at
    FROM registrations
    WHERE type = 'visitor' AND registration_id = $1
    `,
    [registrationId.trim()],
  );

  const row = result.rows[0];

  return row ? mapRegistration(row) : null;
}

export async function markVisitorAttended(registrationId: string) {
  const pool = requirePool();
  await ensureRegistrationTables(pool);

  const result = await pool.query<RegistrationRow>(
    `
    UPDATE registrations
    SET attendance_status = $2
    WHERE type = 'visitor' AND registration_id = $1
    RETURNING id, type, registration_id, full_name, phone, job_title, email, company, city,
      verify_url, attendance_status, created_at
    `,
    [registrationId.trim(), REGISTRATION_CONFIG.ATTENDANCE_PRESENT],
  );

  const row = result.rows[0];

  return row ? mapRegistration(row) : null;
}

export type ImportRegistrationRow = {
  type: RegistrationType;
  registrationId: string;
  fullName: string;
  phone: string;
  jobTitle: string;
  email: string;
  company: string;
  city: string;
  attendanceStatus: string;
  registeredAt: Date | null;
};

export async function importRegistrations(
  rows: ImportRegistrationRow[],
  buildVerifyUrl: (registrationId: string) => string,
) {
  const pool = requirePool();
  await ensureRegistrationTables(pool);

  let inserted = 0;
  let skipped = 0;

  for (const row of rows) {
    const result = await pool.query(
      `
      INSERT INTO registrations (
        type, registration_id, full_name, phone, job_title, email, company, city,
        verify_url, attendance_status, created_at
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, COALESCE($11, NOW()))
      ON CONFLICT (registration_id) DO NOTHING
      RETURNING id
      `,
      [
        row.type,
        row.registrationId,
        row.fullName,
        row.phone,
        row.jobTitle,
        row.email,
        row.company,
        row.city,
        row.type === "visitor" ? buildVerifyUrl(row.registrationId) : "",
        row.attendanceStatus,
        row.registeredAt,
      ],
    );

    if (result.rowCount) {
      inserted += 1;
    } else {
      skipped += 1;
    }
  }

  return { inserted, skipped };
}
