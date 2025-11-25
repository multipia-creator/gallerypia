-- Authentication Security Enhancements (New Tables Only)
-- Does not modify existing users table to avoid breaking dependencies

-- Create revoked tokens table (for JWT blacklist)
CREATE TABLE IF NOT EXISTS revoked_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  jti TEXT NOT NULL UNIQUE,
  user_id INTEGER,
  expires_at INTEGER NOT NULL,
  revoked_at INTEGER NOT NULL,
  reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_revoked_tokens_jti ON revoked_tokens(jti);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_expires_at ON revoked_tokens(expires_at);
CREATE INDEX IF NOT EXISTS idx_revoked_tokens_user_id ON revoked_tokens(user_id);

-- Create email verification tokens table
CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  token TEXT NOT NULL UNIQUE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  used_at INTEGER DEFAULT NULL
);

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_expires_at ON email_verification_tokens(expires_at);

-- Create login history table
CREATE TABLE IF NOT EXISTS login_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  email TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  login_successful INTEGER NOT NULL,
  failure_reason TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_login_history_user_id ON login_history(user_id);
CREATE INDEX IF NOT EXISTS idx_login_history_created_at ON login_history(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_login_history_ip_address ON login_history(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_history_email ON login_history(email);

-- Create security events table
CREATE TABLE IF NOT EXISTS security_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  event_type TEXT NOT NULL,
  event_data TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_security_events_user_id ON security_events(user_id);
CREATE INDEX IF NOT EXISTS idx_security_events_event_type ON security_events(event_type);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at DESC);

-- Create user_security_data table (stores security-related user data)
CREATE TABLE IF NOT EXISTS user_security_data (
  user_id INTEGER PRIMARY KEY,
  failed_login_attempts INTEGER DEFAULT 0,
  locked_until INTEGER DEFAULT NULL,
  email_verified INTEGER DEFAULT 0,
  email_verification_token TEXT DEFAULT NULL,
  email_verification_sent_at INTEGER DEFAULT NULL,
  last_login_at INTEGER DEFAULT NULL,
  last_login_ip TEXT DEFAULT NULL,
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_security_locked_until ON user_security_data(locked_until);
CREATE INDEX IF NOT EXISTS idx_user_security_email_verified ON user_security_data(email_verified);
CREATE INDEX IF NOT EXISTS idx_user_security_failed_attempts ON user_security_data(failed_login_attempts);

-- Insert platform settings
INSERT OR IGNORE INTO platform_settings (setting_key, setting_value, setting_type, description, updated_at) VALUES 
  ('max_login_attempts', '5', 'number', 'Maximum failed login attempts before account lock', CURRENT_TIMESTAMP),
  ('account_lock_duration', '900', 'number', 'Account lock duration in seconds (15 minutes)', CURRENT_TIMESTAMP),
  ('password_min_length', '8', 'number', 'Minimum password length', CURRENT_TIMESTAMP),
  ('password_require_uppercase', '1', 'boolean', 'Require uppercase letters in password', CURRENT_TIMESTAMP),
  ('password_require_lowercase', '1', 'boolean', 'Require lowercase letters in password', CURRENT_TIMESTAMP),
  ('password_require_numbers', '1', 'boolean', 'Require numbers in password', CURRENT_TIMESTAMP),
  ('password_require_special', '1', 'boolean', 'Require special characters in password', CURRENT_TIMESTAMP),
  ('email_verification_required', '0', 'boolean', 'Require email verification for new accounts', CURRENT_TIMESTAMP),
  ('session_token_expiry', '604800', 'number', 'Session token expiry in seconds (7 days)', CURRENT_TIMESTAMP),
  ('remember_me_token_expiry', '2592000', 'number', 'Remember me token expiry in seconds (30 days)', CURRENT_TIMESTAMP);

-- Create view for locked accounts (using user_security_data)
CREATE VIEW IF NOT EXISTS v_locked_accounts AS
SELECT 
  usd.user_id,
  u.email,
  u.full_name,
  usd.failed_login_attempts,
  usd.locked_until,
  datetime(usd.locked_until / 1000, 'unixepoch') as locked_until_formatted,
  CASE 
    WHEN usd.locked_until > (strftime('%s', 'now') * 1000) THEN 1
    ELSE 0
  END as is_currently_locked
FROM user_security_data usd
JOIN users u ON u.id = usd.user_id
WHERE usd.locked_until IS NOT NULL
ORDER BY usd.locked_until DESC;

-- Create view for recent suspicious activities
CREATE VIEW IF NOT EXISTS v_suspicious_login_activities AS
SELECT 
  lh.id,
  lh.user_id,
  lh.email,
  lh.ip_address,
  lh.failure_reason,
  lh.created_at,
  datetime(lh.created_at / 1000, 'unixepoch') as created_at_formatted,
  (SELECT COUNT(*) 
   FROM login_history lh2 
   WHERE lh2.ip_address = lh.ip_address 
     AND lh2.login_successful = 0
     AND lh2.created_at > (strftime('%s', 'now') - 3600) * 1000
  ) as failures_from_same_ip
FROM login_history lh
WHERE lh.login_successful = 0
  AND lh.created_at > (strftime('%s', 'now') - 3600) * 1000
ORDER BY lh.created_at DESC;

-- Initialize security data for existing users
INSERT OR IGNORE INTO user_security_data (user_id, created_at, updated_at)
SELECT id, strftime('%s', 'now') * 1000, strftime('%s', 'now') * 1000
FROM users;
