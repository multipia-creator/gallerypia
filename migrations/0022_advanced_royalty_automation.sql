-- =====================================================
-- Migration 0022: Advanced Royalty Automation System
-- =====================================================
-- Purpose: Complex royalty distribution for multi-party transactions
-- Features:
--   1. Flexible royalty split configuration (artist, gallery, curator)
--   2. 2nd/3rd/Nth sale tracking
--   3. Automatic payment distribution
--   4. Royalty escrow and release
--   5. Historical royalty analytics
-- =====================================================

-- 1. Royalty Configuration Table
-- Defines how royalties are split for each artwork
CREATE TABLE IF NOT EXISTS royalty_configurations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  
  -- Configuration metadata
  config_version INTEGER DEFAULT 1, -- Allow version history
  is_active BOOLEAN DEFAULT 1,
  
  -- Base royalty percentage (e.g., 10% on all secondary sales)
  total_royalty_percentage REAL NOT NULL DEFAULT 10.0 CHECK(total_royalty_percentage >= 0 AND total_royalty_percentage <= 100),
  
  -- Split configuration (must add up to 100)
  artist_split_percentage REAL NOT NULL DEFAULT 70.0 CHECK(artist_split_percentage >= 0 AND artist_split_percentage <= 100),
  gallery_split_percentage REAL DEFAULT 0 CHECK(gallery_split_percentage >= 0 AND gallery_split_percentage <= 100),
  curator_split_percentage REAL DEFAULT 0 CHECK(curator_split_percentage >= 0 AND curator_split_percentage <= 100),
  platform_split_percentage REAL DEFAULT 30.0 CHECK(platform_split_percentage >= 0 AND platform_split_percentage <= 100),
  
  -- Parties involved
  artist_id INTEGER NOT NULL,
  gallery_id INTEGER, -- Can be NULL if no gallery involved
  curator_id INTEGER, -- Can be NULL if no curator involved
  
  -- Advanced rules
  minimum_royalty_amount REAL DEFAULT 0, -- Minimum ETH to trigger distribution
  apply_to_first_sale BOOLEAN DEFAULT 0, -- Usually only secondary sales
  perpetual BOOLEAN DEFAULT 1, -- Apply to all future sales
  
  -- Sale count limits (NULL = unlimited)
  max_sales_count INTEGER, -- Stop after N sales
  
  -- Time limits
  expires_at DATETIME, -- Stop after this date
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  created_by_user_id INTEGER,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (artist_id) REFERENCES users(id),
  FOREIGN KEY (gallery_id) REFERENCES galleries(id),
  FOREIGN KEY (curator_id) REFERENCES users(id),
  FOREIGN KEY (created_by_user_id) REFERENCES users(id)
);

CREATE INDEX idx_royalty_config_artwork ON royalty_configurations(artwork_id);
CREATE INDEX idx_royalty_config_active ON royalty_configurations(is_active);
CREATE UNIQUE INDEX idx_royalty_config_artwork_active ON royalty_configurations(artwork_id, is_active) 
  WHERE is_active = 1; -- Only one active config per artwork

-- 2. Sale Transaction Tracking
-- Enhanced tracking of all sales (1st, 2nd, 3rd, ... Nth)
CREATE TABLE IF NOT EXISTS sale_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  
  -- Sale details
  sale_number INTEGER NOT NULL DEFAULT 1, -- 1st sale, 2nd sale, etc.
  sale_type TEXT NOT NULL CHECK(sale_type IN ('primary', 'secondary', 'auction', 'private')),
  
  -- Transaction parties
  seller_id INTEGER,
  buyer_id INTEGER NOT NULL,
  platform_transaction_id TEXT, -- Reference to trading_transactions or opensea_transactions
  
  -- Financial details
  sale_price_eth REAL NOT NULL,
  sale_price_usd REAL, -- USD equivalent at time of sale
  currency TEXT DEFAULT 'ETH',
  
  -- Platform fees
  platform_fee_percentage REAL DEFAULT 2.5,
  platform_fee_amount_eth REAL,
  
  -- Royalty details
  royalty_config_id INTEGER,
  total_royalty_percentage REAL DEFAULT 0,
  total_royalty_amount_eth REAL DEFAULT 0,
  
  -- Status
  transaction_status TEXT DEFAULT 'pending' CHECK(transaction_status IN ('pending', 'completed', 'failed', 'refunded')),
  blockchain_tx_hash TEXT,
  blockchain_confirmed BOOLEAN DEFAULT 0,
  
  -- Timestamps
  sale_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  blockchain_confirmed_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (seller_id) REFERENCES users(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id),
  FOREIGN KEY (royalty_config_id) REFERENCES royalty_configurations(id)
);

CREATE INDEX idx_sale_transactions_artwork ON sale_transactions(artwork_id);
CREATE INDEX idx_sale_transactions_seller ON sale_transactions(seller_id);
CREATE INDEX idx_sale_transactions_buyer ON sale_transactions(buyer_id);
CREATE INDEX idx_sale_transactions_status ON sale_transactions(transaction_status);
CREATE INDEX idx_sale_transactions_date ON sale_transactions(sale_date);
CREATE INDEX idx_sale_transactions_blockchain ON sale_transactions(blockchain_tx_hash);

-- 3. Royalty Distribution Records
-- Tracks individual payments to each party
CREATE TABLE IF NOT EXISTS royalty_distributions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sale_transaction_id INTEGER NOT NULL,
  royalty_config_id INTEGER NOT NULL,
  
  -- Recipient details
  recipient_type TEXT NOT NULL CHECK(recipient_type IN ('artist', 'gallery', 'curator', 'platform', 'other')),
  recipient_id INTEGER, -- User or gallery ID
  
  -- Payment details
  split_percentage REAL NOT NULL,
  amount_eth REAL NOT NULL,
  amount_usd REAL,
  
  -- Payment status
  payment_status TEXT DEFAULT 'pending' CHECK(payment_status IN ('pending', 'processing', 'completed', 'failed', 'held')),
  payment_method TEXT, -- 'eth_transfer', 'internal_balance', 'bank_transfer'
  
  -- Blockchain details
  blockchain_tx_hash TEXT,
  wallet_address TEXT,
  
  -- Escrow
  held_in_escrow BOOLEAN DEFAULT 0,
  escrow_reason TEXT,
  escrow_release_date DATETIME,
  
  -- Processing
  processed_at DATETIME,
  failed_reason TEXT,
  retry_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sale_transaction_id) REFERENCES sale_transactions(id) ON DELETE CASCADE,
  FOREIGN KEY (royalty_config_id) REFERENCES royalty_configurations(id)
);

CREATE INDEX idx_royalty_distributions_sale ON royalty_distributions(sale_transaction_id);
CREATE INDEX idx_royalty_distributions_recipient ON royalty_distributions(recipient_id);
CREATE INDEX idx_royalty_distributions_status ON royalty_distributions(payment_status);
CREATE INDEX idx_royalty_distributions_type ON royalty_distributions(recipient_type);

-- 4. Royalty Earnings Summary
-- Aggregated earnings per user/gallery
CREATE TABLE IF NOT EXISTS royalty_earnings_summary (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Recipient
  recipient_type TEXT NOT NULL CHECK(recipient_type IN ('artist', 'gallery', 'curator', 'platform')),
  recipient_id INTEGER NOT NULL,
  
  -- Time period
  summary_period TEXT NOT NULL CHECK(summary_period IN ('daily', 'weekly', 'monthly', 'yearly', 'all_time')),
  period_start_date DATE,
  period_end_date DATE,
  
  -- Earnings
  total_earnings_eth REAL DEFAULT 0,
  total_earnings_usd REAL DEFAULT 0,
  
  -- Transaction counts
  total_transactions INTEGER DEFAULT 0,
  total_artworks INTEGER DEFAULT 0,
  
  -- Payment status
  pending_amount_eth REAL DEFAULT 0,
  completed_amount_eth REAL DEFAULT 0,
  failed_amount_eth REAL DEFAULT 0,
  
  -- Metadata
  last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  UNIQUE(recipient_type, recipient_id, summary_period, period_start_date)
);

CREATE INDEX idx_royalty_summary_recipient ON royalty_earnings_summary(recipient_type, recipient_id);
CREATE INDEX idx_royalty_summary_period ON royalty_earnings_summary(summary_period);

-- 5. Royalty Payment Queue
-- Queue for processing pending payments
CREATE TABLE IF NOT EXISTS royalty_payment_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  distribution_id INTEGER NOT NULL,
  
  -- Priority
  priority INTEGER DEFAULT 5 CHECK(priority >= 1 AND priority <= 10), -- 10 = highest
  
  -- Scheduling
  scheduled_for DATETIME DEFAULT CURRENT_TIMESTAMP,
  attempts INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 3,
  
  -- Status
  queue_status TEXT DEFAULT 'queued' CHECK(queue_status IN ('queued', 'processing', 'completed', 'failed', 'cancelled')),
  
  -- Processing details
  last_attempt_at DATETIME,
  last_error TEXT,
  
  -- Lock for concurrent processing
  locked_by TEXT, -- Worker ID
  locked_at DATETIME,
  lock_expires_at DATETIME,
  
  completed_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (distribution_id) REFERENCES royalty_distributions(id) ON DELETE CASCADE
);

CREATE INDEX idx_payment_queue_status ON royalty_payment_queue(queue_status);
CREATE INDEX idx_payment_queue_scheduled ON royalty_payment_queue(scheduled_for);
CREATE INDEX idx_payment_queue_priority ON royalty_payment_queue(priority DESC);

-- 6. Royalty Dispute Records
-- Handle disputes about royalty payments
CREATE TABLE IF NOT EXISTS royalty_disputes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Related records
  sale_transaction_id INTEGER,
  distribution_id INTEGER,
  
  -- Dispute details
  dispute_type TEXT NOT NULL CHECK(dispute_type IN ('incorrect_amount', 'missing_payment', 'unauthorized_split', 'calculation_error', 'other')),
  dispute_reason TEXT NOT NULL,
  
  -- Parties
  filed_by_user_id INTEGER NOT NULL,
  against_user_id INTEGER,
  
  -- Evidence
  evidence_documents TEXT, -- JSON: URLs
  expected_amount_eth REAL,
  actual_amount_eth REAL,
  
  -- Status
  status TEXT DEFAULT 'open' CHECK(status IN ('open', 'investigating', 'resolved', 'rejected', 'escalated')),
  resolution TEXT,
  
  -- Admin handling
  assigned_to_admin_id INTEGER,
  resolved_by_admin_id INTEGER,
  
  -- Timestamps
  filed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (sale_transaction_id) REFERENCES sale_transactions(id),
  FOREIGN KEY (distribution_id) REFERENCES royalty_distributions(id),
  FOREIGN KEY (filed_by_user_id) REFERENCES users(id),
  FOREIGN KEY (against_user_id) REFERENCES users(id),
  FOREIGN KEY (assigned_to_admin_id) REFERENCES users(id),
  FOREIGN KEY (resolved_by_admin_id) REFERENCES users(id)
);

CREATE INDEX idx_royalty_disputes_status ON royalty_disputes(status);
CREATE INDEX idx_royalty_disputes_filed_by ON royalty_disputes(filed_by_user_id);

-- 7. Triggers for automatic calculations

-- Auto-calculate sale_number and platform fee on insert
CREATE TRIGGER IF NOT EXISTS auto_calculate_sale_fields
AFTER INSERT ON sale_transactions
BEGIN
  UPDATE sale_transactions
  SET 
    sale_number = (
      SELECT COALESCE(MAX(sale_number), 0) + 1 
      FROM sale_transactions 
      WHERE artwork_id = NEW.artwork_id AND id != NEW.id
    ),
    platform_fee_amount_eth = CASE 
      WHEN NEW.platform_fee_amount_eth IS NULL 
      THEN (NEW.sale_price_eth * NEW.platform_fee_percentage / 100)
      ELSE NEW.platform_fee_amount_eth
    END
  WHERE id = NEW.id;
END;

-- Update royalty_earnings_summary when distribution completes
CREATE TRIGGER IF NOT EXISTS update_earnings_summary
AFTER UPDATE OF payment_status ON royalty_distributions
WHEN NEW.payment_status = 'completed' AND OLD.payment_status != 'completed'
BEGIN
  INSERT INTO royalty_earnings_summary (
    recipient_type,
    recipient_id,
    summary_period,
    period_start_date,
    period_end_date,
    total_earnings_eth,
    total_transactions,
    completed_amount_eth
  )
  VALUES (
    NEW.recipient_type,
    NEW.recipient_id,
    'all_time',
    date('1970-01-01'),
    date('2099-12-31'),
    NEW.amount_eth,
    1,
    NEW.amount_eth
  )
  ON CONFLICT(recipient_type, recipient_id, summary_period, period_start_date) 
  DO UPDATE SET
    total_earnings_eth = total_earnings_eth + NEW.amount_eth,
    total_transactions = total_transactions + 1,
    completed_amount_eth = completed_amount_eth + NEW.amount_eth,
    last_calculated_at = CURRENT_TIMESTAMP;
END;

-- Update timestamps
CREATE TRIGGER IF NOT EXISTS update_royalty_config_timestamp
AFTER UPDATE ON royalty_configurations
BEGIN
  UPDATE royalty_configurations SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_sale_transaction_timestamp
AFTER UPDATE ON sale_transactions
BEGIN
  UPDATE sale_transactions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

CREATE TRIGGER IF NOT EXISTS update_distribution_timestamp
AFTER UPDATE ON royalty_distributions
BEGIN
  UPDATE royalty_distributions SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
END;

-- 8. Views for easy querying

-- Artist royalty earnings dashboard
CREATE VIEW IF NOT EXISTS artist_royalty_dashboard AS
SELECT 
  u.id as artist_id,
  u.username as artist_name,
  COUNT(DISTINCT st.id) as total_sales,
  COUNT(DISTINCT CASE WHEN st.sale_type = 'secondary' THEN st.id END) as secondary_sales,
  SUM(st.sale_price_eth) as total_sales_volume_eth,
  SUM(rd.amount_eth) as total_royalties_earned_eth,
  SUM(CASE WHEN rd.payment_status = 'completed' THEN rd.amount_eth ELSE 0 END) as paid_royalties_eth,
  SUM(CASE WHEN rd.payment_status = 'pending' THEN rd.amount_eth ELSE 0 END) as pending_royalties_eth,
  AVG(rc.artist_split_percentage) as avg_artist_split_pct,
  MAX(st.sale_date) as last_sale_date
FROM users u
LEFT JOIN artworks a ON a.artist_id = u.id
LEFT JOIN sale_transactions st ON st.artwork_id = a.id
LEFT JOIN royalty_distributions rd ON rd.sale_transaction_id = st.id AND rd.recipient_type = 'artist' AND rd.recipient_id = u.id
LEFT JOIN royalty_configurations rc ON rc.artwork_id = a.id AND rc.is_active = 1
WHERE u.role = 'artist'
GROUP BY u.id;

-- Gallery royalty earnings dashboard
CREATE VIEW IF NOT EXISTS gallery_royalty_dashboard AS
SELECT 
  g.id as gallery_id,
  g.name as gallery_name,
  COUNT(DISTINCT st.id) as total_sales,
  SUM(st.sale_price_eth) as total_sales_volume_eth,
  SUM(rd.amount_eth) as total_royalties_earned_eth,
  SUM(CASE WHEN rd.payment_status = 'completed' THEN rd.amount_eth ELSE 0 END) as paid_royalties_eth,
  SUM(CASE WHEN rd.payment_status = 'pending' THEN rd.amount_eth ELSE 0 END) as pending_royalties_eth,
  COUNT(DISTINCT a.artist_id) as artists_represented,
  MAX(st.sale_date) as last_sale_date
FROM galleries g
LEFT JOIN royalty_configurations rc ON rc.gallery_id = g.id AND rc.is_active = 1
LEFT JOIN artworks a ON a.id = rc.artwork_id
LEFT JOIN sale_transactions st ON st.artwork_id = a.id
LEFT JOIN royalty_distributions rd ON rd.sale_transaction_id = st.id AND rd.recipient_type = 'gallery' AND rd.recipient_id = g.id
GROUP BY g.id;

-- Pending royalty payments view
CREATE VIEW IF NOT EXISTS pending_royalty_payments AS
SELECT 
  rd.id,
  rd.recipient_type,
  rd.recipient_id,
  CASE 
    WHEN rd.recipient_type = 'artist' THEN u.username
    WHEN rd.recipient_type = 'gallery' THEN g.name
    WHEN rd.recipient_type = 'curator' THEN u2.username
    ELSE 'Platform'
  END as recipient_name,
  rd.amount_eth,
  rd.payment_status,
  a.title as artwork_title,
  st.sale_date,
  rd.created_at,
  ROUND((julianday('now') - julianday(rd.created_at)) * 24, 2) as hours_pending
FROM royalty_distributions rd
JOIN sale_transactions st ON rd.sale_transaction_id = st.id
JOIN artworks a ON st.artwork_id = a.id
LEFT JOIN users u ON rd.recipient_type = 'artist' AND rd.recipient_id = u.id
LEFT JOIN galleries g ON rd.recipient_type = 'gallery' AND rd.recipient_id = g.id
LEFT JOIN users u2 ON rd.recipient_type = 'curator' AND rd.recipient_id = u2.id
WHERE rd.payment_status IN ('pending', 'processing')
ORDER BY rd.created_at ASC;

-- Artwork sales history with royalties
CREATE VIEW IF NOT EXISTS artwork_sales_history AS
SELECT 
  a.id as artwork_id,
  a.title as artwork_title,
  st.sale_number,
  st.sale_type,
  st.sale_price_eth,
  st.total_royalty_amount_eth,
  st.sale_date,
  seller.username as seller_name,
  buyer.username as buyer_name,
  st.transaction_status,
  COUNT(rd.id) as distribution_count,
  SUM(CASE WHEN rd.payment_status = 'completed' THEN 1 ELSE 0 END) as completed_distributions
FROM artworks a
JOIN sale_transactions st ON st.artwork_id = a.id
LEFT JOIN users seller ON st.seller_id = seller.id
JOIN users buyer ON st.buyer_id = buyer.id
LEFT JOIN royalty_distributions rd ON rd.sale_transaction_id = st.id
GROUP BY st.id
ORDER BY a.id, st.sale_number;
