-- ====================================
-- Migration 0008: Expert Application & OpenSea Integration
-- ====================================
-- Purpose: Add expert application workflow and OpenSea API integration
-- Features:
--   1. Expert application and approval system
--   2. OpenSea API integration for automatic artwork import
--   3. Enhanced role management (buyer, seller, artist, expert)
-- ====================================

-- ====================================
-- 1. EXPERT APPLICATIONS TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS expert_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Application details
  expert_type TEXT NOT NULL, -- 'curator', 'dealer', 'critic', 'professor', 'collector'
  institution TEXT NOT NULL,
  position TEXT NOT NULL,
  years_experience INTEGER NOT NULL,
  specialization TEXT NOT NULL, -- JSON array
  
  -- Supporting documents
  resume_url TEXT,
  portfolio_url TEXT,
  credentials TEXT, -- JSON array of certifications/degrees
  reference_contacts TEXT, -- JSON array: [{"name": "", "email": "", "phone": ""}]
  
  -- Application essay
  motivation TEXT NOT NULL, -- Why they want to be an expert
  expertise_description TEXT NOT NULL, -- Their area of expertise
  
  -- Status
  application_status TEXT DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
  admin_notes TEXT,
  rejection_reason TEXT,
  reviewed_by INTEGER, -- admin user_id who reviewed
  
  -- Timestamps
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  approved_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (reviewed_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expert_apps_user ON expert_applications(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_apps_status ON expert_applications(application_status);
CREATE INDEX IF NOT EXISTS idx_expert_apps_submitted ON expert_applications(submitted_at);

-- ====================================
-- 2. OPENSEA API INTEGRATION TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS opensea_sync_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Job details
  job_type TEXT NOT NULL, -- 'collection_import', 'asset_import', 'single_nft'
  contract_address TEXT,
  token_id TEXT,
  collection_slug TEXT,
  
  -- Status
  status TEXT DEFAULT 'pending', -- 'pending', 'running', 'completed', 'failed'
  progress INTEGER DEFAULT 0, -- 0-100
  total_items INTEGER DEFAULT 0,
  processed_items INTEGER DEFAULT 0,
  failed_items INTEGER DEFAULT 0,
  
  -- Results
  imported_artworks TEXT, -- JSON array of artwork IDs
  error_log TEXT,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  started_at DATETIME,
  completed_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_opensea_jobs_status ON opensea_sync_jobs(status);
CREATE INDEX IF NOT EXISTS idx_opensea_jobs_created ON opensea_sync_jobs(created_at);

-- ====================================
-- 3. OPENSEA ARTWORK MAPPING TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS opensea_artwork_mapping (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- OpenSea identifiers
  contract_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  collection_slug TEXT,
  opensea_url TEXT,
  
  -- Sync metadata
  last_synced_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sync_status TEXT DEFAULT 'active', -- 'active', 'paused', 'failed'
  
  -- Additional OpenSea data
  opensea_metadata TEXT, -- JSON: traits, properties, etc.
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_opensea_mapping_artwork ON opensea_artwork_mapping(artwork_id);
CREATE INDEX IF NOT EXISTS idx_opensea_mapping_contract ON opensea_artwork_mapping(contract_address, token_id);

-- ====================================
-- 4. USER ROLES EXTENSION
-- ====================================
-- Add support for multiple roles per user
CREATE TABLE IF NOT EXISTS user_roles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  role TEXT NOT NULL, -- 'buyer', 'seller', 'artist', 'expert', 'admin'
  is_active INTEGER DEFAULT 1,
  granted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  granted_by INTEGER, -- admin user_id who granted the role
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (granted_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_user_roles_unique ON user_roles(user_id, role);
CREATE INDEX IF NOT EXISTS idx_user_roles_user ON user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON user_roles(role);

-- ====================================
-- 5. ARTIST VERIFICATION TABLE
-- ====================================
CREATE TABLE IF NOT EXISTS artist_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Verification details
  verification_type TEXT NOT NULL, -- 'identity', 'portfolio', 'credentials'
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'verified', 'rejected'
  
  -- Documents
  id_document_url TEXT,
  portfolio_urls TEXT, -- JSON array
  credentials_urls TEXT, -- JSON array
  
  -- Admin review
  verified_by INTEGER,
  verification_notes TEXT,
  rejection_reason TEXT,
  
  -- Timestamps
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_artist_verifications_user ON artist_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_artist_verifications_status ON artist_verifications(verification_status);

-- ====================================
-- 6. SYSTEM SETTINGS TABLE (for OpenSea API keys)
-- ====================================
CREATE TABLE IF NOT EXISTS system_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT,
  setting_type TEXT DEFAULT 'string', -- 'string', 'number', 'boolean', 'json'
  is_sensitive INTEGER DEFAULT 0, -- 1 for API keys, passwords
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER,
  
  FOREIGN KEY (updated_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);

-- Insert default settings
INSERT OR IGNORE INTO system_settings (setting_key, setting_value, setting_type, is_sensitive, description)
VALUES 
  ('opensea_api_key', '', 'string', 1, 'OpenSea API Key'),
  ('opensea_api_enabled', '0', 'boolean', 0, 'Enable OpenSea API integration'),
  ('expert_auto_approve', '0', 'boolean', 0, 'Auto-approve expert applications'),
  ('artist_verification_required', '1', 'boolean', 0, 'Require artist verification'),
  ('min_expert_experience_years', '3', 'number', 0, 'Minimum years of experience for experts');

-- ====================================
-- END OF MIGRATION 0008
-- ====================================
