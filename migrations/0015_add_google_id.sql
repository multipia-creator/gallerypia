-- ============================================
-- Add Google ID for OAuth Login
-- ============================================

-- Add google_id column to users table
ALTER TABLE users ADD COLUMN google_id TEXT;

-- Create unique index for google_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_google_id ON users(google_id);
