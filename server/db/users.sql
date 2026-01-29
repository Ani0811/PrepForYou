-- PostgreSQL schema for user authentication and profile management
-- This schema supports Firebase authentication with custom username and avatar upload

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Enable case-insensitive text
CREATE EXTENSION IF NOT EXISTS citext;

-- Main users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  firebase_uid text NOT NULL UNIQUE,          -- Firebase UID (primary login identifier)
  email citext NOT NULL UNIQUE,               -- Case-insensitive email
  display_name text,                          -- Display name from provider or custom
  username text,                              -- User-chosen handle (optional)
  avatar_url text,                            -- Public URL (Google avatar or uploaded custom)
  avatar_storage_path text,                   -- Internal storage path (e.g., s3://bucket/avatars/...)
  avatar_provider text DEFAULT 'google',      -- 'google' | 'custom' | 'none'
  email_verified boolean DEFAULT false,
  sign_in_count integer DEFAULT 0,
  last_sign_in_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb,         -- Flexible metadata storage
  is_active boolean DEFAULT true
);

-- Add column 'role' for user authorization: 'owner', 'admin' or 'user'
ALTER TABLE users
ADD COLUMN role text DEFAULT 'user'
CHECK (role IN ('owner', 'admin', 'user'));


-- Case-insensitive unique username index
CREATE UNIQUE INDEX IF NOT EXISTS users_username_lower_idx 
  ON users (lower(username)) 
  WHERE username IS NOT NULL;

-- Performance indexes
CREATE INDEX IF NOT EXISTS users_email_idx ON users (email);
CREATE INDEX IF NOT EXISTS users_firebase_uid_idx ON users (firebase_uid);
CREATE INDEX IF NOT EXISTS users_last_sign_in_idx ON users (last_sign_in_at);
CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at);

-- Optional: Username format constraint (3-30 chars, alphanumeric + ._-)
ALTER TABLE users 
  ADD CONSTRAINT username_format 
  CHECK (username ~ '^[a-zA-Z0-9._-]{3,30}$' OR username IS NULL);

-- Function to update updated_at timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Comments for documentation
COMMENT ON TABLE users IS 'User authentication and profile management table';
COMMENT ON COLUMN users.firebase_uid IS 'Unique Firebase authentication UID';
COMMENT ON COLUMN users.email IS 'User email (case-insensitive)';
COMMENT ON COLUMN users.username IS 'Custom username handle';
COMMENT ON COLUMN users.avatar_provider IS 'Source of avatar: google, custom, or none';
