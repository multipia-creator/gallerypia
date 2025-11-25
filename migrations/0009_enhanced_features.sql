-- ====================================
-- Migration 0009: Enhanced Features (KYC, Transactions, Reviews)
-- ====================================
-- Purpose: Add KYC/AML, transaction history, reviews, and enhanced artwork fields
-- ====================================

-- ====================================
-- 1. KYC/AML VERIFICATION
-- ====================================
CREATE TABLE IF NOT EXISTS user_kyc_verification (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL UNIQUE,
  
  -- Identity Information
  legal_name TEXT NOT NULL,
  date_of_birth TEXT NOT NULL,
  nationality TEXT NOT NULL,
  id_type TEXT NOT NULL, -- 'passport', 'national_id', 'drivers_license'
  id_number TEXT NOT NULL,
  id_expiry_date TEXT,
  
  -- Address Information
  country TEXT NOT NULL,
  state_province TEXT,
  city TEXT NOT NULL,
  postal_code TEXT NOT NULL,
  street_address TEXT NOT NULL,
  
  -- Contact Verification
  phone_verified INTEGER DEFAULT 0,
  email_verified INTEGER DEFAULT 0,
  
  -- Document Uploads
  id_front_url TEXT,
  id_back_url TEXT,
  proof_of_address_url TEXT,
  selfie_url TEXT,
  
  -- AML Risk Assessment
  risk_level TEXT DEFAULT 'pending', -- 'low', 'medium', 'high', 'pending'
  aml_checked_at DATETIME,
  
  -- Verification Status
  verification_status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'needs_review'
  rejection_reason TEXT,
  verified_by INTEGER,
  verified_at DATETIME,
  
  -- Timestamps
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (verified_by) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_kyc_user ON user_kyc_verification(user_id);
CREATE INDEX IF NOT EXISTS idx_kyc_status ON user_kyc_verification(verification_status);

-- ====================================
-- 2. ENHANCED ARTWORK FIELDS
-- ====================================
-- Add new columns to artworks table for detailed information
-- Note: SQLite ALTER TABLE is limited, so we track these in a separate table

CREATE TABLE IF NOT EXISTS artwork_extended_info (
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- Exhibition Information
  exhibition_name TEXT,
  exhibition_start_date TEXT,
  exhibition_end_date TEXT,
  exhibition_venue TEXT,
  
  -- Detailed Descriptions
  originality_description TEXT, -- 독창성 설명
  collection_value_description TEXT, -- 소장가치 설명
  
  -- Social Media & Platform URLs
  youtube_url TEXT,
  instagram_url TEXT,
  nft_platform_url TEXT,
  press_release_url TEXT,
  
  -- Additional Media
  additional_images TEXT, -- JSON array of image URLs
  video_url TEXT,
  
  -- Technical Details
  creation_technique TEXT,
  materials_used TEXT,
  dimensions_detailed TEXT, -- "100cm x 80cm x 5cm"
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_artwork_extended ON artwork_extended_info(artwork_id);

-- ====================================
-- 3. TRANSACTIONS (거래 내역)
-- ====================================
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Transaction Basics
  transaction_type TEXT NOT NULL, -- 'purchase', 'sale', 'auction_bid', 'auction_win', 'transfer'
  transaction_hash TEXT UNIQUE, -- Blockchain transaction hash
  
  -- Parties Involved
  buyer_id INTEGER,
  seller_id INTEGER,
  artwork_id INTEGER NOT NULL,
  
  -- Financial Details
  price_amount INTEGER NOT NULL, -- In smallest unit (wei for ETH, cents for fiat)
  price_currency TEXT NOT NULL DEFAULT 'ETH', -- 'ETH', 'KRW', 'USD'
  price_krw INTEGER, -- KRW equivalent at time of transaction
  
  -- Transaction Status
  status TEXT DEFAULT 'pending', -- 'pending', 'completed', 'failed', 'cancelled', 'refunded'
  payment_method TEXT, -- 'crypto', 'card', 'bank_transfer'
  
  -- Fees
  platform_fee INTEGER DEFAULT 0,
  gas_fee INTEGER DEFAULT 0,
  
  -- Timestamps
  initiated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  completed_at DATETIME,
  cancelled_at DATETIME,
  
  -- Additional Info
  notes TEXT,
  metadata TEXT, -- JSON for extra data
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_transactions_artwork ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(transaction_type);

-- ====================================
-- 4. ARTWORK OWNERSHIP (소유권 추적)
-- ====================================
CREATE TABLE IF NOT EXISTS artwork_ownership (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  owner_id INTEGER NOT NULL,
  
  -- Ownership Details
  quantity INTEGER DEFAULT 1, -- For fractional ownership
  percentage REAL DEFAULT 100.0, -- Ownership percentage
  
  -- Acquisition
  acquired_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  acquired_from INTEGER, -- Previous owner user_id
  acquisition_price INTEGER,
  acquisition_transaction_id INTEGER,
  
  -- Status
  is_current_owner INTEGER DEFAULT 1, -- 0: historical, 1: current
  transferred_at DATETIME,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (acquisition_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_ownership_artwork ON artwork_ownership(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ownership_owner ON artwork_ownership(owner_id);
CREATE INDEX IF NOT EXISTS idx_ownership_current ON artwork_ownership(is_current_owner);

-- ====================================
-- 5. ARTWORK REVIEWS (사용자 리뷰)
-- ====================================
CREATE TABLE IF NOT EXISTS artwork_reviews (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  
  -- Review Content
  rating INTEGER NOT NULL, -- 1-5 stars
  title TEXT,
  review_text TEXT NOT NULL,
  
  -- Review Categories (optional detailed ratings)
  artistic_value_rating INTEGER, -- 1-5
  investment_potential_rating INTEGER, -- 1-5
  authenticity_rating INTEGER, -- 1-5
  
  -- Helpful Votes
  helpful_count INTEGER DEFAULT 0,
  not_helpful_count INTEGER DEFAULT 0,
  
  -- Status
  is_verified_purchase INTEGER DEFAULT 0, -- Did user own/buy this NFT?
  is_featured INTEGER DEFAULT 0,
  is_hidden INTEGER DEFAULT 0, -- Moderation
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_reviews_artwork ON artwork_reviews(artwork_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user ON artwork_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_rating ON artwork_reviews(rating);

-- ====================================
-- 6. REVIEW HELPFULNESS VOTES
-- ====================================
CREATE TABLE IF NOT EXISTS review_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  review_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  vote_type TEXT NOT NULL, -- 'helpful', 'not_helpful'
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (review_id) REFERENCES artwork_reviews(id) ON DELETE CASCADE,
  UNIQUE(review_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_review_votes_review ON review_votes(review_id);

-- ====================================
-- 7. CUSTOMER SUPPORT TICKETS
-- ====================================
CREATE TABLE IF NOT EXISTS support_tickets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- Ticket Details
  category TEXT NOT NULL, -- 'technical', 'payment', 'account', 'artwork', 'kyc', 'other'
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'normal', -- 'low', 'normal', 'high', 'urgent'
  
  -- Status
  status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'waiting_user', 'resolved', 'closed'
  
  -- Assignment
  assigned_to INTEGER,
  
  -- Timestamps
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  closed_at DATETIME,
  
  FOREIGN KEY (assigned_to) REFERENCES admin_users(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_support_user ON support_tickets(user_id);
CREATE INDEX IF NOT EXISTS idx_support_status ON support_tickets(status);
CREATE INDEX IF NOT EXISTS idx_support_category ON support_tickets(category);

-- ====================================
-- 8. SUPPORT TICKET MESSAGES
-- ====================================
CREATE TABLE IF NOT EXISTS support_messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  ticket_id INTEGER NOT NULL,
  sender_id INTEGER NOT NULL,
  sender_type TEXT NOT NULL, -- 'user', 'admin'
  
  message_text TEXT NOT NULL,
  attachment_url TEXT,
  
  is_internal_note INTEGER DEFAULT 0, -- Only visible to admins
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (ticket_id) REFERENCES support_tickets(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_support_messages_ticket ON support_messages(ticket_id);

-- ====================================
-- 9. WISHLIST / FAVORITES
-- ====================================
CREATE TABLE IF NOT EXISTS user_favorites (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  UNIQUE(user_id, artwork_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user ON user_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_artwork ON user_favorites(artwork_id);

-- ====================================
-- 10. ARTWORK VIEW STATISTICS
-- ====================================
CREATE TABLE IF NOT EXISTS artwork_views (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  user_id INTEGER, -- NULL for anonymous views
  ip_address TEXT,
  user_agent TEXT,
  viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_views_artwork ON artwork_views(artwork_id);
CREATE INDEX IF NOT EXISTS idx_views_date ON artwork_views(viewed_at);

-- ====================================
-- END OF MIGRATION 0009
-- ====================================
