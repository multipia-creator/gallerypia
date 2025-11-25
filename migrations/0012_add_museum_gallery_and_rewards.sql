-- Migration 0012: Add Museum/Gallery Types and Expert Reward System
-- Created: 2025-11-15

-- 1. Add ETH reward column to expert_evaluations table
ALTER TABLE expert_evaluations ADD COLUMN reward_eth REAL DEFAULT 0.0;
ALTER TABLE expert_evaluations ADD COLUMN reward_status TEXT DEFAULT 'pending'; -- pending, paid, cancelled
ALTER TABLE expert_evaluations ADD COLUMN reward_tx_hash TEXT; -- Ethereum transaction hash
ALTER TABLE expert_evaluations ADD COLUMN reward_paid_at DATETIME;

-- 2. Add museum and gallery fields to users table
ALTER TABLE users ADD COLUMN organization_name TEXT; -- Museum/Gallery name
ALTER TABLE users ADD COLUMN organization_type TEXT; -- museum, gallery, independent
ALTER TABLE users ADD COLUMN organization_description TEXT;
ALTER TABLE users ADD COLUMN organization_address TEXT;
ALTER TABLE users ADD COLUMN organization_website TEXT;
ALTER TABLE users ADD COLUMN organization_contact_email TEXT;
ALTER TABLE users ADD COLUMN organization_phone TEXT;
ALTER TABLE users ADD COLUMN curator_count INTEGER DEFAULT 0; -- Number of curators (for museums/galleries)
ALTER TABLE users ADD COLUMN exhibition_count INTEGER DEFAULT 0; -- Number of exhibitions hosted

-- 3. Create exhibitions table (for museums and galleries)
CREATE TABLE IF NOT EXISTS exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  organizer_id INTEGER NOT NULL, -- User ID of museum/gallery
  title TEXT NOT NULL,
  description TEXT,
  theme TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  location TEXT,
  venue_type TEXT DEFAULT 'physical', -- physical, virtual, hybrid
  max_artworks INTEGER DEFAULT 50,
  status TEXT DEFAULT 'planning', -- planning, open, closed, cancelled
  visitor_count INTEGER DEFAULT 0,
  featured_image TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (organizer_id) REFERENCES users(id)
);

-- 4. Create exhibition_artworks table (artworks in exhibitions)
CREATE TABLE IF NOT EXISTS exhibition_artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  exhibition_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  is_featured INTEGER DEFAULT 0,
  curator_notes TEXT,
  added_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  UNIQUE(exhibition_id, artwork_id)
);

-- 5. Create curation_requests table (galleries requesting artworks)
CREATE TABLE IF NOT EXISTS curation_requests (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  gallery_id INTEGER NOT NULL, -- User ID of gallery
  artwork_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  request_message TEXT,
  offer_percentage REAL, -- Commission percentage offered
  duration_months INTEGER, -- Curation duration
  status TEXT DEFAULT 'pending', -- pending, accepted, rejected, completed
  response_message TEXT,
  requested_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  FOREIGN KEY (gallery_id) REFERENCES users(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- 6. Create expert_rewards_history table (track all reward payments)
CREATE TABLE IF NOT EXISTS expert_rewards_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  expert_id INTEGER NOT NULL,
  evaluation_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  reward_eth REAL NOT NULL,
  tx_hash TEXT NOT NULL,
  status TEXT DEFAULT 'completed', -- completed, failed, refunded
  paid_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  notes TEXT,
  FOREIGN KEY (expert_id) REFERENCES users(id),
  FOREIGN KEY (evaluation_id) REFERENCES expert_evaluations(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- 7. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_exhibitions_organizer ON exhibitions(organizer_id);
CREATE INDEX IF NOT EXISTS idx_exhibitions_status ON exhibitions(status);
CREATE INDEX IF NOT EXISTS idx_exhibitions_dates ON exhibitions(start_date, end_date);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_exhibition ON exhibition_artworks(exhibition_id);
CREATE INDEX IF NOT EXISTS idx_exhibition_artworks_artwork ON exhibition_artworks(artwork_id);
CREATE INDEX IF NOT EXISTS idx_curation_requests_gallery ON curation_requests(gallery_id);
CREATE INDEX IF NOT EXISTS idx_curation_requests_artwork ON curation_requests(artwork_id);
CREATE INDEX IF NOT EXISTS idx_curation_requests_status ON curation_requests(status);
CREATE INDEX IF NOT EXISTS idx_expert_rewards_expert ON expert_rewards_history(expert_id);
CREATE INDEX IF NOT EXISTS idx_expert_rewards_evaluation ON expert_rewards_history(evaluation_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_reward_status ON expert_evaluations(reward_status);

-- 8. Insert sample data for testing (with password hash)
-- Sample museum account (password: museum123)
INSERT INTO users (username, email, password_hash, full_name, role, organization_name, organization_type, organization_description, created_at)
VALUES ('moma_museum', 'moma@example.com', 'ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f', 'Museum of Modern Art', 'museum', 'Museum of Modern Art', 'museum', 'Leading museum of modern and contemporary art', datetime('now'));

-- Sample gallery account (password: gallery123)
INSERT INTO users (username, email, password_hash, full_name, role, organization_name, organization_type, organization_description, created_at)
VALUES ('pace_gallery', 'pace@example.com', '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92', 'Pace Gallery', 'gallery', 'Pace Gallery', 'gallery', 'Contemporary art gallery representing world-renowned artists', datetime('now'));

-- Sample exhibition
INSERT INTO exhibitions (organizer_id, title, description, theme, start_date, end_date, location, status)
VALUES (
  (SELECT id FROM users WHERE username = 'moma_museum'),
  'Digital Renaissance: NFT Art Exhibition',
  'Explore the intersection of traditional art and blockchain technology',
  'Contemporary Digital Art',
  date('now'),
  date('now', '+90 days'),
  'Gallery Hall 1, MoMA',
  'open'
);
