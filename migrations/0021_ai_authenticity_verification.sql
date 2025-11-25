-- =====================================================
-- Migration 0021: AI Authenticity Verification System
-- =====================================================
-- Purpose: AI-powered artwork authenticity verification
-- Features:
--   1. Verification records with AI analysis
--   2. Artist style fingerprinting
--   3. Forgery detection history
--   4. Provenance tracking
--   5. Expert review integration
-- =====================================================

-- 1. Verification Records Table
-- Stores all verification attempts and results
CREATE TABLE IF NOT EXISTS authenticity_verifications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  
  -- Verification metadata
  verification_type TEXT NOT NULL CHECK(verification_type IN ('initial', 'resale', 'dispute', 'periodic')),
  status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending', 'processing', 'verified', 'suspicious', 'failed')),
  
  -- AI Analysis results
  ai_confidence_score REAL DEFAULT 0, -- 0-100
  ai_model_version TEXT DEFAULT 'v1.0',
  style_match_score REAL DEFAULT 0, -- 0-100
  technical_analysis TEXT, -- JSON: brushwork, color palette, composition
  
  -- Risk assessment
  risk_level TEXT DEFAULT 'low' CHECK(risk_level IN ('low', 'medium', 'high', 'critical')),
  risk_factors TEXT, -- JSON: ["inconsistent_style", "metadata_mismatch", "suspicious_provenance"]
  
  -- Image analysis
  image_hash TEXT, -- Perceptual hash for similarity detection
  image_fingerprint TEXT, -- AI-generated style fingerprint
  
  -- Provenance verification
  blockchain_verified BOOLEAN DEFAULT 0,
  metadata_verified BOOLEAN DEFAULT 0,
  artist_verified BOOLEAN DEFAULT 0,
  
  -- Expert review (optional)
  requires_expert_review BOOLEAN DEFAULT 0,
  expert_reviewer_id INTEGER,
  expert_notes TEXT,
  expert_decision TEXT CHECK(expert_decision IN ('approved', 'rejected', 'needs_info', NULL)),
  
  -- Processing details
  verification_started_at DATETIME,
  verification_completed_at DATETIME,
  processing_time_ms INTEGER,
  
  -- Results and recommendations
  final_result TEXT CHECK(final_result IN ('authentic', 'likely_authentic', 'suspicious', 'likely_forgery', 'inconclusive', NULL)),
  recommendation TEXT, -- Action to take
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (expert_reviewer_id) REFERENCES users(id)
);

CREATE INDEX idx_auth_verifications_artwork ON authenticity_verifications(artwork_id);
CREATE INDEX idx_auth_verifications_status ON authenticity_verifications(status);
CREATE INDEX idx_auth_verifications_result ON authenticity_verifications(final_result);
CREATE INDEX idx_auth_verifications_risk ON authenticity_verifications(risk_level);

-- 2. Artist Style Fingerprints
-- Stores AI-learned style characteristics for each artist
CREATE TABLE IF NOT EXISTS artist_style_fingerprints (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  
  -- Style characteristics
  fingerprint_version TEXT DEFAULT 'v1.0',
  style_vector TEXT NOT NULL, -- JSON: AI-generated style embedding
  
  -- Visual characteristics
  color_palette TEXT, -- JSON: dominant colors
  brushwork_pattern TEXT, -- JSON: stroke analysis
  composition_style TEXT, -- JSON: layout patterns
  subject_preferences TEXT, -- JSON: common subjects
  
  -- Metadata
  sample_artwork_ids TEXT, -- JSON: artworks used for training
  sample_count INTEGER DEFAULT 0,
  confidence_level REAL DEFAULT 0, -- 0-100
  
  -- Quality metrics
  consistency_score REAL DEFAULT 0, -- How consistent is the style
  uniqueness_score REAL DEFAULT 0, -- How distinctive is the style
  
  -- Training data
  trained_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_style_fingerprints_artist ON artist_style_fingerprints(artist_id);
CREATE UNIQUE INDEX idx_style_fingerprints_artist_version ON artist_style_fingerprints(artist_id, fingerprint_version);

-- 3. Forgery Detection History
-- Tracks detected forgeries and similar artworks
CREATE TABLE IF NOT EXISTS forgery_detections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Suspected forgery
  suspected_artwork_id INTEGER NOT NULL,
  original_artwork_id INTEGER, -- If known
  original_artist_id INTEGER,
  
  -- Detection details
  detection_method TEXT CHECK(detection_method IN ('ai_analysis', 'style_mismatch', 'user_report', 'expert_review', 'metadata_analysis')),
  similarity_score REAL DEFAULT 0, -- 0-100
  
  -- Evidence
  evidence_type TEXT, -- JSON: ["visual_similarity", "metadata_copying", "blockchain_anomaly"]
  evidence_details TEXT, -- JSON: detailed evidence
  comparison_images TEXT, -- JSON: URLs of comparison images
  
  -- Status
  status TEXT DEFAULT 'reported' CHECK(status IN ('reported', 'investigating', 'confirmed', 'false_positive', 'resolved')),
  severity TEXT DEFAULT 'medium' CHECK(severity IN ('low', 'medium', 'high', 'critical')),
  
  -- Actions taken
  action_taken TEXT, -- JSON: ["artwork_delisted", "artist_suspended", "refund_issued"]
  resolution_notes TEXT,
  
  -- People involved
  reported_by_user_id INTEGER,
  investigated_by_admin_id INTEGER,
  
  reported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (suspected_artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (original_artwork_id) REFERENCES artworks(id),
  FOREIGN KEY (original_artist_id) REFERENCES users(id),
  FOREIGN KEY (reported_by_user_id) REFERENCES users(id),
  FOREIGN KEY (investigated_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_forgery_detections_suspected ON forgery_detections(suspected_artwork_id);
CREATE INDEX idx_forgery_detections_original ON forgery_detections(original_artwork_id);
CREATE INDEX idx_forgery_detections_status ON forgery_detections(status);

-- 4. Verification Settings
-- Platform-wide verification settings and thresholds
CREATE TABLE IF NOT EXISTS verification_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- AI Model configuration
  ai_model_name TEXT DEFAULT 'resnet50',
  ai_confidence_threshold REAL DEFAULT 70.0, -- Minimum confidence to auto-approve
  
  -- Risk thresholds
  low_risk_threshold REAL DEFAULT 30.0,
  medium_risk_threshold REAL DEFAULT 60.0,
  high_risk_threshold REAL DEFAULT 85.0,
  
  -- Style matching
  style_match_threshold REAL DEFAULT 75.0, -- Minimum style match score
  
  -- Expert review triggers
  auto_expert_review_threshold REAL DEFAULT 50.0, -- Below this, require expert
  high_value_threshold REAL DEFAULT 10.0, -- ETH - high value artworks need expert
  
  -- Verification requirements
  require_blockchain_verification BOOLEAN DEFAULT 1,
  require_metadata_verification BOOLEAN DEFAULT 1,
  require_style_verification BOOLEAN DEFAULT 1,
  
  -- Periodic re-verification
  periodic_verification_enabled BOOLEAN DEFAULT 1,
  verification_interval_days INTEGER DEFAULT 365, -- Re-verify yearly
  
  -- Active status
  is_active BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Insert default settings
INSERT OR IGNORE INTO verification_settings (id) VALUES (1);

-- 5. Verification Audit Log
-- Detailed audit trail for all verification activities
CREATE TABLE IF NOT EXISTS verification_audit_log (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  verification_id INTEGER NOT NULL,
  
  -- Event details
  event_type TEXT NOT NULL, -- 'created', 'ai_analysis_started', 'ai_analysis_completed', 'expert_assigned', 'status_changed', 'completed'
  event_description TEXT,
  
  -- Changes
  old_value TEXT, -- JSON
  new_value TEXT, -- JSON
  
  -- Actor
  performed_by_user_id INTEGER,
  performed_by_system BOOLEAN DEFAULT 0,
  
  -- Metadata
  ip_address TEXT,
  user_agent TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (verification_id) REFERENCES authenticity_verifications(id) ON DELETE CASCADE,
  FOREIGN KEY (performed_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_verification_audit_log_verification ON verification_audit_log(verification_id);
CREATE INDEX idx_verification_audit_log_event_type ON verification_audit_log(event_type);

-- 6. Triggers for automatic updates

-- Update authenticity_verifications.updated_at on change
CREATE TRIGGER IF NOT EXISTS update_authenticity_verifications_timestamp 
AFTER UPDATE ON authenticity_verifications
BEGIN
  UPDATE authenticity_verifications SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update artist_style_fingerprints.last_updated_at on change
CREATE TRIGGER IF NOT EXISTS update_style_fingerprints_timestamp 
AFTER UPDATE ON artist_style_fingerprints
BEGIN
  UPDATE artist_style_fingerprints SET last_updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Update forgery_detections.updated_at on change
CREATE TRIGGER IF NOT EXISTS update_forgery_detections_timestamp 
AFTER UPDATE ON forgery_detections
BEGIN
  UPDATE forgery_detections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- Auto-create audit log entry when verification status changes
CREATE TRIGGER IF NOT EXISTS log_verification_status_change 
AFTER UPDATE OF status ON authenticity_verifications
WHEN OLD.status != NEW.status
BEGIN
  INSERT INTO verification_audit_log (
    verification_id, 
    event_type, 
    event_description, 
    old_value, 
    new_value,
    performed_by_system
  ) VALUES (
    NEW.id,
    'status_changed',
    'Verification status changed from ' || OLD.status || ' to ' || NEW.status,
    json_object('status', OLD.status),
    json_object('status', NEW.status),
    1
  );
END;

-- 7. Views for easy querying

-- Pending verifications requiring action
CREATE VIEW IF NOT EXISTS pending_verifications_view AS
SELECT 
  av.id,
  av.artwork_id,
  a.title as artwork_title,
  a.artist_id,
  u.username as artist_name,
  av.verification_type,
  av.status,
  av.risk_level,
  av.ai_confidence_score,
  av.requires_expert_review,
  av.created_at,
  ROUND((julianday('now') - julianday(av.created_at)) * 24, 2) as hours_pending
FROM authenticity_verifications av
JOIN artworks a ON av.artwork_id = a.id
JOIN users u ON a.artist_id = u.id
WHERE av.status IN ('pending', 'processing')
ORDER BY av.risk_level DESC, av.created_at ASC;

-- Suspicious artworks summary
CREATE VIEW IF NOT EXISTS suspicious_artworks_view AS
SELECT 
  av.artwork_id,
  a.title,
  a.artist_id,
  u.username as artist_name,
  av.risk_level,
  av.ai_confidence_score,
  av.final_result,
  COUNT(DISTINCT fd.id) as forgery_reports_count,
  av.updated_at
FROM authenticity_verifications av
JOIN artworks a ON av.artwork_id = a.id
JOIN users u ON a.artist_id = u.id
LEFT JOIN forgery_detections fd ON fd.suspected_artwork_id = av.artwork_id
WHERE av.risk_level IN ('high', 'critical')
  OR av.final_result IN ('suspicious', 'likely_forgery')
GROUP BY av.artwork_id
ORDER BY av.risk_level DESC, av.updated_at DESC;

-- Artist verification statistics
CREATE VIEW IF NOT EXISTS artist_verification_stats AS
SELECT 
  u.id as artist_id,
  u.username as artist_name,
  COUNT(DISTINCT av.id) as total_verifications,
  COUNT(DISTINCT CASE WHEN av.final_result = 'authentic' THEN av.id END) as authentic_count,
  COUNT(DISTINCT CASE WHEN av.final_result IN ('suspicious', 'likely_forgery') THEN av.id END) as suspicious_count,
  AVG(av.ai_confidence_score) as avg_confidence_score,
  MAX(asf.confidence_level) as style_fingerprint_confidence,
  MAX(asf.last_updated_at) as style_last_updated
FROM users u
JOIN artworks a ON a.artist_id = u.id
LEFT JOIN authenticity_verifications av ON av.artwork_id = a.id
LEFT JOIN artist_style_fingerprints asf ON asf.artist_id = u.id
WHERE u.role = 'artist'
GROUP BY u.id
ORDER BY total_verifications DESC;
