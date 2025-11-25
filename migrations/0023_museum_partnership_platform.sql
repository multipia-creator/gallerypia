-- =====================================================
-- Migration 0023: Museum Partnership Platform
-- =====================================================
-- Purpose: Enable museums to partner with GalleryPia for NFT programs
-- Features:
--   1. Museum partnership applications and approval workflow
--   2. Museum-issued NFT collections
--   3. Exhibition ticket NFTs
--   4. Museum membership NFTs
--   5. Co-curation programs
--   6. Revenue sharing for museum programs
-- =====================================================

-- 1. Museum Partners Table
-- Stores information about partnered museums
CREATE TABLE IF NOT EXISTS museum_partners (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Museum basic info
  museum_name TEXT NOT NULL,
  museum_name_en TEXT, -- English name
  museum_type TEXT CHECK(museum_type IN ('national', 'public', 'private', 'university', 'corporate', 'other')),
  
  -- Contact information
  official_website TEXT,
  contact_email TEXT NOT NULL,
  contact_phone TEXT,
  contact_person_name TEXT,
  contact_person_title TEXT,
  
  -- Location
  country TEXT DEFAULT 'KR',
  city TEXT,
  address TEXT,
  postal_code TEXT,
  
  -- Museum details
  establishment_year INTEGER,
  collection_size INTEGER, -- Number of artworks in collection
  annual_visitors INTEGER,
  museum_description TEXT,
  
  -- Partnership status
  partnership_status TEXT DEFAULT 'pending' CHECK(partnership_status IN ('pending', 'approved', 'active', 'suspended', 'terminated')),
  partnership_tier TEXT CHECK(partnership_tier IN ('bronze', 'silver', 'gold', 'platinum')),
  
  -- Partnership terms
  partnership_start_date DATE,
  partnership_end_date DATE,
  revenue_share_percentage REAL DEFAULT 15.0, -- Museum's share of sales
  
  -- Platform fees
  platform_fee_percentage REAL DEFAULT 2.5,
  discount_on_platform_fee REAL DEFAULT 0, -- Discount for partners
  
  -- Verification
  verified BOOLEAN DEFAULT 0,
  verification_document_url TEXT, -- Official documents
  tax_id TEXT, -- Business registration number
  
  -- Account management
  admin_user_id INTEGER, -- Museum's admin user on platform
  wallet_address TEXT, -- For receiving payments
  
  -- Branding
  logo_url TEXT,
  banner_url TEXT,
  brand_color TEXT, -- Hex color for theming
  
  -- Statistics (auto-calculated)
  total_nfts_issued INTEGER DEFAULT 0,
  total_revenue_eth REAL DEFAULT 0,
  total_exhibitions INTEGER DEFAULT 0,
  
  -- Approval workflow
  applied_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_by_admin_id INTEGER,
  reviewed_at DATETIME,
  review_notes TEXT,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (admin_user_id) REFERENCES users(id),
  FOREIGN KEY (reviewed_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_museum_partners_status ON museum_partners(partnership_status);
CREATE INDEX idx_museum_partners_tier ON museum_partners(partnership_tier);
CREATE INDEX idx_museum_partners_country ON museum_partners(country);
CREATE UNIQUE INDEX idx_museum_partners_name ON museum_partners(museum_name);

-- 2. Museum NFT Collections
-- Collections issued by partnered museums
CREATE TABLE IF NOT EXISTS museum_nft_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_partner_id INTEGER NOT NULL,
  
  -- Collection details
  collection_name TEXT NOT NULL,
  collection_description TEXT,
  collection_type TEXT NOT NULL CHECK(collection_type IN ('artwork', 'exhibition_ticket', 'membership', 'commemorative', 'educational')),
  
  -- Exhibition linkage (for exhibition-related NFTs)
  exhibition_id INTEGER, -- Link to exhibitions table
  
  -- NFT details
  total_supply INTEGER, -- Total number of NFTs in collection
  minted_count INTEGER DEFAULT 0,
  available_count INTEGER DEFAULT 0,
  
  -- Pricing
  price_eth REAL,
  price_usd REAL,
  is_free BOOLEAN DEFAULT 0,
  
  -- Sale configuration
  sale_type TEXT CHECK(sale_type IN ('fixed_price', 'auction', 'free_claim', 'whitelist_only')),
  sale_start_date DATETIME,
  sale_end_date DATETIME,
  
  -- Benefits for holders
  benefits_description TEXT, -- JSON: ["free_entry", "gift_shop_discount", "exclusive_tours"]
  utility_type TEXT, -- JSON: ["access_token", "membership_proof", "collectible"]
  
  -- Metadata
  metadata_uri TEXT, -- IPFS or centralized storage
  contract_address TEXT, -- Blockchain contract
  chain TEXT DEFAULT 'ethereum',
  
  -- Royalties
  royalty_percentage REAL DEFAULT 5.0,
  museum_royalty_split REAL DEFAULT 80.0, -- Museum gets 80% of royalties
  
  -- Status
  status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'pending_approval', 'approved', 'active', 'sold_out', 'ended', 'cancelled')),
  
  -- Approval
  approved_by_admin_id INTEGER,
  approved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id),
  FOREIGN KEY (approved_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_museum_collections_museum ON museum_nft_collections(museum_partner_id);
CREATE INDEX idx_museum_collections_type ON museum_nft_collections(collection_type);
CREATE INDEX idx_museum_collections_status ON museum_nft_collections(status);
CREATE INDEX idx_museum_collections_exhibition ON museum_nft_collections(exhibition_id);

-- 3. Museum NFT Holders
-- Track who owns museum-issued NFTs
CREATE TABLE IF NOT EXISTS museum_nft_holders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  
  -- NFT details
  token_id TEXT NOT NULL,
  nft_metadata TEXT, -- JSON: specific NFT attributes
  
  -- Ownership
  current_owner_id INTEGER NOT NULL,
  original_owner_id INTEGER NOT NULL,
  
  -- Purchase details
  purchased_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  purchase_price_eth REAL,
  purchase_transaction_hash TEXT,
  
  -- Benefits tracking
  benefits_used TEXT, -- JSON: [{"benefit": "free_entry", "used_at": "2024-01-15", "exhibition_id": 123}]
  benefits_usage_count INTEGER DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  transferred_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (collection_id) REFERENCES museum_nft_collections(id) ON DELETE CASCADE,
  FOREIGN KEY (current_owner_id) REFERENCES users(id),
  FOREIGN KEY (original_owner_id) REFERENCES users(id)
);

CREATE INDEX idx_museum_holders_collection ON museum_nft_holders(collection_id);
CREATE INDEX idx_museum_holders_owner ON museum_nft_holders(current_owner_id);
CREATE INDEX idx_museum_holders_active ON museum_nft_holders(is_active);
CREATE UNIQUE INDEX idx_museum_holders_token ON museum_nft_holders(collection_id, token_id);

-- 4. Museum Exhibition Collaborations
-- Enhanced exhibitions table integration for museum partnerships
CREATE TABLE IF NOT EXISTS museum_exhibition_collaborations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_partner_id INTEGER NOT NULL,
  exhibition_id INTEGER NOT NULL,
  
  -- Collaboration details
  collaboration_type TEXT CHECK(collaboration_type IN ('co_curation', 'venue_rental', 'traveling_exhibition', 'digital_exhibition', 'joint_programming')),
  
  -- Museum's role
  museum_role TEXT, -- 'host', 'co_curator', 'lender', 'sponsor'
  museum_contribution TEXT,
  
  -- Financial terms
  revenue_split_percentage REAL, -- Museum's share of ticket/NFT sales
  fixed_fee_eth REAL, -- Or fixed rental fee
  
  -- Exhibition period
  collaboration_start_date DATE,
  collaboration_end_date DATE,
  
  -- Agreement
  agreement_document_url TEXT,
  signed_at DATETIME,
  
  -- Performance metrics
  total_visitors INTEGER DEFAULT 0,
  total_revenue_eth REAL DEFAULT 0,
  nfts_sold INTEGER DEFAULT 0,
  
  -- Status
  status TEXT DEFAULT 'proposed' CHECK(status IN ('proposed', 'negotiating', 'approved', 'active', 'completed', 'cancelled')),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id) ON DELETE CASCADE
);

CREATE INDEX idx_museum_collab_museum ON museum_exhibition_collaborations(museum_partner_id);
CREATE INDEX idx_museum_collab_exhibition ON museum_exhibition_collaborations(exhibition_id);
CREATE INDEX idx_museum_collab_status ON museum_exhibition_collaborations(status);

-- 5. Museum Membership Tiers
-- Define different membership levels with benefits
CREATE TABLE IF NOT EXISTS museum_membership_tiers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_partner_id INTEGER NOT NULL,
  
  -- Tier details
  tier_name TEXT NOT NULL, -- 'Basic', 'Premium', 'Patron', 'Lifetime'
  tier_level INTEGER DEFAULT 1, -- 1=lowest, 5=highest
  
  -- Pricing
  price_eth REAL NOT NULL,
  price_usd REAL,
  duration_months INTEGER, -- NULL = lifetime
  
  -- NFT configuration
  nft_collection_id INTEGER, -- Link to membership NFT collection
  max_members INTEGER, -- NULL = unlimited
  current_members INTEGER DEFAULT 0,
  
  -- Benefits
  benefits TEXT NOT NULL, -- JSON: detailed benefits list
  discount_percentage REAL DEFAULT 0, -- Discount on purchases
  
  -- Access rights
  free_exhibitions_count INTEGER, -- Per year
  priority_booking BOOLEAN DEFAULT 0,
  exclusive_events_access BOOLEAN DEFAULT 0,
  
  -- Status
  is_active BOOLEAN DEFAULT 1,
  available_from DATE,
  available_until DATE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (nft_collection_id) REFERENCES museum_nft_collections(id)
);

CREATE INDEX idx_membership_tiers_museum ON museum_membership_tiers(museum_partner_id);
CREATE INDEX idx_membership_tiers_active ON museum_membership_tiers(is_active);

-- 6. Museum Revenue Tracking
-- Track all revenue from museum partnerships
CREATE TABLE IF NOT EXISTS museum_revenue_records (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_partner_id INTEGER NOT NULL,
  
  -- Revenue source
  revenue_type TEXT NOT NULL CHECK(revenue_type IN ('nft_sale', 'ticket_sale', 'membership', 'royalty', 'rental_fee', 'other')),
  collection_id INTEGER, -- If from NFT sale
  exhibition_id INTEGER, -- If from exhibition
  
  -- Financial details
  total_amount_eth REAL NOT NULL,
  total_amount_usd REAL,
  
  -- Distribution
  museum_share_percentage REAL NOT NULL,
  museum_share_eth REAL NOT NULL,
  platform_share_eth REAL NOT NULL,
  artist_share_eth REAL, -- If artwork sale
  
  -- Payment status
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'processing', 'completed', 'failed')),
  payment_transaction_hash TEXT,
  paid_at DATETIME,
  
  -- Reference
  reference_transaction_id INTEGER, -- Link to sale_transactions or other
  
  -- Period
  revenue_period_start DATE,
  revenue_period_end DATE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES museum_nft_collections(id),
  FOREIGN KEY (exhibition_id) REFERENCES exhibitions(id)
);

CREATE INDEX idx_museum_revenue_museum ON museum_revenue_records(museum_partner_id);
CREATE INDEX idx_museum_revenue_type ON museum_revenue_records(revenue_type);
CREATE INDEX idx_museum_revenue_status ON museum_revenue_records(payment_status);

-- 7. Partnership Application Workflow
-- Track partnership application progress
CREATE TABLE IF NOT EXISTS museum_partnership_applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Applicant information
  applicant_name TEXT NOT NULL,
  applicant_email TEXT NOT NULL,
  applicant_phone TEXT,
  applicant_title TEXT,
  
  -- Museum information
  museum_name TEXT NOT NULL,
  museum_website TEXT,
  museum_type TEXT,
  museum_country TEXT,
  museum_description TEXT,
  
  -- Application details
  partnership_reason TEXT NOT NULL,
  expected_nft_program TEXT, -- What they plan to do
  estimated_collection_size INTEGER,
  
  -- Documents
  official_documents TEXT, -- JSON: URLs to uploaded documents
  business_registration TEXT,
  authorization_letter TEXT, -- Letter authorizing application
  
  -- Status
  application_status TEXT DEFAULT 'submitted' CHECK(application_status IN ('submitted', 'under_review', 'approved', 'rejected', 'additional_info_needed')),
  
  -- Review process
  assigned_to_admin_id INTEGER,
  review_notes TEXT,
  rejection_reason TEXT,
  
  -- Follow-up
  additional_info_requested TEXT,
  additional_info_provided TEXT,
  
  -- Timeline
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  reviewed_at DATETIME,
  decision_at DATETIME,
  
  -- If approved, link to created partner
  museum_partner_id INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (assigned_to_admin_id) REFERENCES users(id),
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id)
);

CREATE INDEX idx_partnership_apps_status ON museum_partnership_applications(application_status);
CREATE INDEX idx_partnership_apps_submitted ON museum_partnership_applications(submitted_at);

-- 8. Museum Program Analytics
-- Track performance of museum programs
CREATE TABLE IF NOT EXISTS museum_program_analytics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  museum_partner_id INTEGER NOT NULL,
  
  -- Time period
  analytics_period TEXT CHECK(analytics_period IN ('daily', 'weekly', 'monthly', 'quarterly', 'yearly')),
  period_start_date DATE NOT NULL,
  period_end_date DATE NOT NULL,
  
  -- NFT metrics
  nfts_minted INTEGER DEFAULT 0,
  nfts_sold INTEGER DEFAULT 0,
  nfts_transferred INTEGER DEFAULT 0,
  
  -- Revenue metrics
  total_revenue_eth REAL DEFAULT 0,
  museum_revenue_eth REAL DEFAULT 0,
  platform_revenue_eth REAL DEFAULT 0,
  
  -- User engagement
  unique_visitors INTEGER DEFAULT 0,
  new_members INTEGER DEFAULT 0,
  active_members INTEGER DEFAULT 0,
  
  -- Exhibition metrics
  exhibitions_hosted INTEGER DEFAULT 0,
  total_exhibition_visitors INTEGER DEFAULT 0,
  
  -- Social metrics
  social_media_reach INTEGER DEFAULT 0,
  press_mentions INTEGER DEFAULT 0,
  
  -- Calculated at
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (museum_partner_id) REFERENCES museum_partners(id) ON DELETE CASCADE,
  UNIQUE(museum_partner_id, analytics_period, period_start_date)
);

CREATE INDEX idx_museum_analytics_museum ON museum_program_analytics(museum_partner_id);
CREATE INDEX idx_museum_analytics_period ON museum_program_analytics(analytics_period);

-- 9. Triggers for automatic updates

-- Update museum_partners statistics on NFT mint
CREATE TRIGGER IF NOT EXISTS update_museum_nft_count
AFTER UPDATE OF minted_count ON museum_nft_collections
BEGIN
  UPDATE museum_partners
  SET total_nfts_issued = (
    SELECT SUM(minted_count)
    FROM museum_nft_collections
    WHERE museum_partner_id = NEW.museum_partner_id
  )
  WHERE id = NEW.museum_partner_id;
END;

-- Update timestamps
CREATE TRIGGER IF NOT EXISTS update_museum_partner_timestamp
AFTER UPDATE ON museum_partners
BEGIN
  UPDATE museum_partners SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_museum_collection_timestamp
AFTER UPDATE ON museum_nft_collections
BEGIN
  UPDATE museum_nft_collections SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_museum_holder_timestamp
AFTER UPDATE ON museum_nft_holders
BEGIN
  UPDATE museum_nft_holders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 10. Views for easy querying

-- Active museum partners dashboard
CREATE VIEW IF NOT EXISTS active_museum_partners_view AS
SELECT 
  mp.id,
  mp.museum_name,
  mp.museum_type,
  mp.country,
  mp.partnership_tier,
  mp.partnership_start_date,
  mp.total_nfts_issued,
  mp.total_revenue_eth,
  mp.total_exhibitions,
  COUNT(DISTINCT mnc.id) as active_collections,
  COUNT(DISTINCT mnh.id) as total_holders,
  u.username as admin_username,
  u.email as admin_email
FROM museum_partners mp
LEFT JOIN museum_nft_collections mnc ON mnc.museum_partner_id = mp.id AND mnc.status = 'active'
LEFT JOIN museum_nft_holders mnh ON mnh.collection_id = mnc.id AND mnh.is_active = 1
LEFT JOIN users u ON mp.admin_user_id = u.id
WHERE mp.partnership_status = 'active'
GROUP BY mp.id
ORDER BY mp.total_revenue_eth DESC;

-- Museum collection performance
CREATE VIEW IF NOT EXISTS museum_collection_performance AS
SELECT 
  mnc.id as collection_id,
  mnc.collection_name,
  mnc.collection_type,
  mp.museum_name,
  mnc.total_supply,
  mnc.minted_count,
  mnc.available_count,
  ROUND(mnc.minted_count * 100.0 / NULLIF(mnc.total_supply, 0), 2) as mint_percentage,
  COUNT(DISTINCT mnh.id) as unique_holders,
  mnc.price_eth,
  mnc.price_eth * mnc.minted_count as total_revenue_eth,
  mnc.status,
  mnc.sale_start_date,
  mnc.sale_end_date
FROM museum_nft_collections mnc
JOIN museum_partners mp ON mnc.museum_partner_id = mp.id
LEFT JOIN museum_nft_holders mnh ON mnh.collection_id = mnc.id
GROUP BY mnc.id
ORDER BY total_revenue_eth DESC;

-- Pending partnership applications
CREATE VIEW IF NOT EXISTS pending_partnership_applications AS
SELECT 
  mpa.id,
  mpa.museum_name,
  mpa.applicant_name,
  mpa.applicant_email,
  mpa.museum_country,
  mpa.application_status,
  u.username as assigned_to,
  mpa.submitted_at,
  ROUND((julianday('now') - julianday(mpa.submitted_at)), 1) as days_pending
FROM museum_partnership_applications mpa
LEFT JOIN users u ON mpa.assigned_to_admin_id = u.id
WHERE mpa.application_status IN ('submitted', 'under_review', 'additional_info_needed')
ORDER BY mpa.submitted_at ASC;

-- Museum membership overview
CREATE VIEW IF NOT EXISTS museum_membership_overview AS
SELECT 
  mp.id as museum_id,
  mp.museum_name,
  mmt.tier_name,
  mmt.price_eth,
  mmt.duration_months,
  mmt.current_members,
  mmt.max_members,
  CASE 
    WHEN mmt.max_members IS NOT NULL 
    THEN ROUND(mmt.current_members * 100.0 / mmt.max_members, 2)
    ELSE NULL
  END as capacity_percentage,
  mmt.is_active
FROM museum_partners mp
JOIN museum_membership_tiers mmt ON mmt.museum_partner_id = mp.id
WHERE mp.partnership_status = 'active'
ORDER BY mp.museum_name, mmt.tier_level;
