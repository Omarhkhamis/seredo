CREATE TABLE IF NOT EXISTS site_content (
  id TEXT PRIMARY KEY,
  content JSONB NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS site_content_content_gin_idx
  ON site_content
  USING GIN (content);

CREATE TABLE IF NOT EXISTS admin_users (
  id TEXT PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  -- 'admin' مدير عام بكل الصلاحيات، 'event_manager' يستعرض تسجيلات الزوار والعارضين فقط
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE admin_users
  ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'admin';

CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  admin_id TEXT NOT NULL REFERENCES admin_users(id) ON DELETE CASCADE,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS admin_sessions_admin_id_idx
  ON admin_sessions (admin_id);

CREATE INDEX IF NOT EXISTS admin_sessions_expires_at_idx
  ON admin_sessions (expires_at);

CREATE TABLE IF NOT EXISTS gate_staff (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  pin TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

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
);

CREATE INDEX IF NOT EXISTS registrations_type_idx
  ON registrations (type);

CREATE INDEX IF NOT EXISTS registrations_created_at_idx
  ON registrations (created_at);
