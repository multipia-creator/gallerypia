-- Phase 9 & 10: Advanced Features Migration

-- User activity logs table (without foreign key constraints to avoid circular dependency)
CREATE TABLE IF NOT EXISTS user_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  event_type TEXT NOT NULL, -- 'page_view', 'artwork_view', 'artwork_like', 'search', 'click', etc.
  event_data TEXT, -- JSON string
  page_url TEXT,
  referrer TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_activity_user_id ON user_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_event_type ON user_activity_logs(event_type);
CREATE INDEX IF NOT EXISTS idx_activity_created_at ON user_activity_logs(created_at DESC);

-- Phase 9 & 10 complete!
