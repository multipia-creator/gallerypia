-- ====================================
-- Migration 0007: Complete User Management System
-- ====================================
-- Purpose: Add comprehensive user registration and role management
-- ====================================

-- ====================================
-- 1. USERS TABLE (Main user accounts)
-- ====================================
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT, -- Allow NULL for social login users
  username TEXT UNIQUE NOT NULL,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'buyer', -- 'buyer', 'seller', 'artist', 'expert', 'admin'
  profile_image TEXT,
  bio TEXT,
  phone TEXT,
  website TEXT,
  is_verified INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_login_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ====================================
-- 2. USER SESSIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT UNIQUE NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);

-- ====================================
-- 3. USER ROLES (Multiple roles per user)
-- ====================================
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'buyer', 'seller', 'artist', 'expert', 'admin'
  is_active INTEGER DEFAULT 1,
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  granted_by INTEGER,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);

-- ====================================
-- 4. ARTIST PROFILES
-- ====================================
CREATE TABLE IF NOT EXISTS artist_profiles (
  user_id INTEGER NOT NULL UNIQUE,
  art_style TEXT,
  major_medium TEXT,
  years_active INTEGER,
  education TEXT,
  notable_exhibitions TEXT,
  notable_awards TEXT,
  instagram_handle TEXT,
  twitter_handle TEXT,
  total_artworks INTEGER DEFAULT 0,
  total_sales INTEGER DEFAULT 0,
  avg_artwork_price INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- 5. EXPERT PROFILES
-- ====================================
CREATE TABLE IF NOT EXISTS expert_profiles (
  user_id INTEGER NOT NULL UNIQUE,
  expert_type TEXT NOT NULL, -- 'curator', 'dealer', 'critic', 'professor'
  authority_level INTEGER DEFAULT 3, -- 1-5
  specialization TEXT,
  institution TEXT,
  position TEXT,
  years_experience INTEGER,
  credentials TEXT,
  total_evaluations INTEGER DEFAULT 0,
  average_evaluation_score REAL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- 6. EXPERT APPLICATIONS
-- ====================================
CREATE TABLE IF NOT EXISTS expert_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  expert_type TEXT NOT NULL,
  institution TEXT NOT NULL,
  position TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  specialization TEXT NOT NULL,
  resume_url TEXT,
  portfolio_url TEXT,
  credentials TEXT,
  motivation TEXT NOT NULL,
  expertise_description TEXT NOT NULL,
  application_status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  rejection_reason TEXT,
  reviewed_by INTEGER,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  approved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_expert_apps_user ON expert_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_apps_status ON expert_applications(application_status);

-- ====================================
-- 7. ARTWORK SUBMISSIONS
-- ====================================
CREATE TABLE IF NOT EXISTS artwork_submissions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT,
  technique TEXT,
  size_width INTEGER,
  size_height INTEGER,
  creation_year INTEGER,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  estimated_price INTEGER,
  currency TEXT DEFAULT 'KRW',
  exhibitions TEXT,
  awards TEXT,
  copyright_registration TEXT,
  blockchain_hash TEXT,
  license_type TEXT,
  submission_status TEXT DEFAULT 'pending',
  admin_notes TEXT,
  rejection_reason TEXT,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  approved_at DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON artwork_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON artwork_submissions(submission_status);

-- ====================================
-- 8. USER EXPERT EVALUATIONS (connected to users)
-- ====================================
CREATE TABLE IF NOT EXISTS user_expert_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  expert_user_id INTEGER NOT NULL,
  expert_type TEXT NOT NULL,
  expert_authority_level INTEGER DEFAULT 3,
  artistic_value_score INTEGER DEFAULT 0,
  technical_skill_score INTEGER DEFAULT 0,
  originality_score INTEGER DEFAULT 0,
  market_potential_score INTEGER DEFAULT 0,
  collection_value_score INTEGER DEFAULT 0,
  overall_score INTEGER DEFAULT 0,
  recommended_price_min INTEGER,
  recommended_price_max INTEGER,
  evaluation_weight REAL DEFAULT 1.0,
  evaluation_status TEXT DEFAULT 'draft',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  submitted_at DATETIME,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (expert_user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_evaluations_artwork ON user_expert_evaluations(artwork_id);
CREATE INDEX IF NOT EXISTS idx_user_evaluations_expert ON user_expert_evaluations(expert_user_id);

-- ====================================
-- 9. USER EXPERT COMMENTS
-- ====================================
CREATE TABLE IF NOT EXISTS user_expert_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  evaluation_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  expert_user_id INTEGER NOT NULL,
  comment_type TEXT NOT NULL,
  comment_text TEXT NOT NULL,
  is_public INTEGER DEFAULT 1,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (evaluation_id) REFERENCES user_expert_evaluations(id) ON DELETE CASCADE,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (expert_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ====================================
-- 10. ACTIVITY LOGS
-- ====================================
CREATE TABLE IF NOT EXISTS activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id INTEGER,
  details TEXT,
  ip_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_activity_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_type ON activity_logs(action_type);
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs(created_at);

-- ====================================
-- 11. USER NOTIFICATIONS (separate from admin notifications)
-- ====================================
CREATE TABLE IF NOT EXISTS user_notifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  notification_type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link_url TEXT,
  is_read INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_user_notifications_user ON user_notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_notifications_read ON user_notifications(is_read);

-- ====================================
-- END OF MIGRATION 0007
-- ====================================
