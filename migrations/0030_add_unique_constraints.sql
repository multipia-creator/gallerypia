-- Migration: Add unique constraints for email and username
-- Date: 2025-11-25
-- Purpose: Prevent duplicate accounts and race conditions

-- Add unique index for email (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_unique ON users(email);

-- Add unique index for username (if not exists)
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_unique ON users(username);

-- Add index for session tokens for faster lookup
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires ON user_sessions(expires_at);

-- Add index for email lookups during login
CREATE INDEX IF NOT EXISTS idx_users_email_active ON users(email, is_active);

-- Add index for activity logs
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_created ON activity_logs(user_id, created_at DESC);

-- Comments
-- These indexes improve:
-- 1. Security: Prevent race condition in signup
-- 2. Performance: Faster email/username lookups
-- 3. Session management: Faster token validation
-- 4. Analytics: Faster activity log queries
