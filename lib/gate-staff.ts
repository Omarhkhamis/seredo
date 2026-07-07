import "server-only";

import { randomUUID } from "node:crypto";
import type { Pool } from "pg";
import { getDatabasePool } from "@/lib/db";

export type GateStaff = {
  id: string;
  name: string;
  pin: string;
  createdAt: string;
  updatedAt: string;
};

type GateStaffRow = {
  id: string;
  name: string;
  pin: string;
  created_at: Date;
  updated_at: Date;
};

declare global {
  // eslint-disable-next-line no-var
  var seredoGateStaffTablesReady: Promise<void> | undefined;
}

function requirePool() {
  const pool = getDatabasePool();

  if (!pool) {
    throw new Error("DATABASE_URL is not configured. Gate staff requires PostgreSQL.");
  }

  return pool;
}

async function ensureGateStaffTables(pool: Pool) {
  if (!globalThis.seredoGateStaffTablesReady) {
    globalThis.seredoGateStaffTablesReady = (async () => {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS gate_staff (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          pin TEXT UNIQUE NOT NULL,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `);
    })();
  }

  await globalThis.seredoGateStaffTablesReady;
}

function mapGateStaff(row: GateStaffRow): GateStaff {
  return {
    id: row.id,
    name: row.name,
    pin: row.pin,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

export function validateGateStaffInput(name: string, pin: string) {
  if (!name.trim()) {
    throw new Error("اكتب اسم موظف البوابة.");
  }

  if (!/^\d{4,8}$/.test(pin.trim())) {
    throw new Error("رمز الموظف يجب أن يكون من 4 إلى 8 أرقام.");
  }
}

export async function listGateStaff() {
  const pool = requirePool();
  await ensureGateStaffTables(pool);

  const result = await pool.query<GateStaffRow>(
    "SELECT id, name, pin, created_at, updated_at FROM gate_staff ORDER BY created_at ASC",
  );

  return result.rows.map(mapGateStaff);
}

export async function createGateStaff(name: string, pin: string) {
  const pool = requirePool();
  await ensureGateStaffTables(pool);

  validateGateStaffInput(name, pin);

  const result = await pool.query<GateStaffRow>(
    `
    INSERT INTO gate_staff (id, name, pin)
    VALUES ($1, $2, $3)
    RETURNING id, name, pin, created_at, updated_at
    `,
    [randomUUID(), name.trim(), pin.trim()],
  );

  return mapGateStaff(result.rows[0]);
}

export async function updateGateStaff(id: string, name: string, pin: string) {
  const pool = requirePool();
  await ensureGateStaffTables(pool);

  validateGateStaffInput(name, pin);

  const result = await pool.query<GateStaffRow>(
    `
    UPDATE gate_staff
    SET name = $2, pin = $3, updated_at = NOW()
    WHERE id = $1
    RETURNING id, name, pin, created_at, updated_at
    `,
    [id, name.trim(), pin.trim()],
  );

  if (!result.rows[0]) {
    throw new Error("لم يتم العثور على موظف البوابة.");
  }

  return mapGateStaff(result.rows[0]);
}

export async function deleteGateStaff(id: string) {
  const pool = requirePool();
  await ensureGateStaffTables(pool);

  const result = await pool.query("DELETE FROM gate_staff WHERE id = $1", [id]);

  if (!result.rowCount) {
    throw new Error("لم يتم العثور على موظف البوابة.");
  }
}

// الرمز صالح إذا طابق الرمز الرئيسي في GATE_PIN أو رمز أي موظف بوابة مسجل.
export async function isValidGatePin(pin: string) {
  const clean = String(pin || "").trim();

  if (!clean) {
    return false;
  }

  const masterPin = (process.env.GATE_PIN || "2026").trim();

  if (masterPin && clean === masterPin) {
    return true;
  }

  const pool = getDatabasePool();

  if (!pool) {
    return false;
  }

  await ensureGateStaffTables(pool);

  const result = await pool.query("SELECT 1 FROM gate_staff WHERE pin = $1", [clean]);

  return Boolean(result.rowCount);
}
