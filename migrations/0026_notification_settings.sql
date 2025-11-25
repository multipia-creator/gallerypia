-- ============================================
-- Migration 0026: Notification Settings Table
-- ============================================
-- Add notification settings for user preferences

CREATE TABLE IF NOT EXISTS notification_settings (
  user_id INTEGER PRIMARY KEY,
  notify_new_artwork INTEGER DEFAULT 1,
  notify_price_change INTEGER DEFAULT 1,
  notify_bid INTEGER DEFAULT 1,
  notify_evaluation INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_notification_settings_user_id ON notification_settings(user_id);

-- Add bio and profile_image_url columns to users table if they don't exist
-- Note: SQLite doesn't support IF NOT EXISTS for ALTER TABLE ADD COLUMN
-- These will be skipped if columns already exist (will show error but continue)

-- ALTER TABLE users ADD COLUMN bio TEXT;
-- ALTER TABLE users ADD COLUMN profile_image_url TEXT;
