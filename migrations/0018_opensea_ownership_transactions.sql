-- Migration 0018: OpenSea Ownership Tracking & Transaction History
-- Date: 2025-11-16
-- Purpose: Add NFT ownership tracking and OpenSea transaction history import

-- =====================================================
-- 1. NFT Ownership History Table
-- =====================================================
-- Track all ownership changes for NFTs
CREATE TABLE IF NOT EXISTS nft_ownership_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  
  -- Blockchain information
  contract_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  chain TEXT DEFAULT 'ethereum',
  
  -- Ownership transfer
  from_address TEXT,
  to_address TEXT NOT NULL,
  
  -- Transaction details
  transaction_hash TEXT,
  block_number INTEGER,
  block_timestamp INTEGER,
  
  -- Transfer type
  transfer_type TEXT DEFAULT 'transfer', -- transfer, mint, burn, sale
  
  -- Price information (if it was a sale)
  price_eth REAL,
  price_usd REAL,
  price_krw INTEGER,
  
  -- Marketplace information
  marketplace TEXT, -- opensea, looksrare, blur, x2y2, etc.
  marketplace_url TEXT,
  
  -- Event source
  event_source TEXT DEFAULT 'manual', -- manual, opensea_api, blockchain_event, imported
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_ownership_artwork ON nft_ownership_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_ownership_contract_token ON nft_ownership_history(contract_address, token_id);
CREATE INDEX IF NOT EXISTS idx_ownership_address ON nft_ownership_history(to_address);
CREATE INDEX IF NOT EXISTS idx_ownership_timestamp ON nft_ownership_history(block_timestamp);
CREATE INDEX IF NOT EXISTS idx_ownership_tx ON nft_ownership_history(transaction_hash);

-- =====================================================
-- 2. OpenSea Transaction History Table
-- =====================================================
-- Store imported transaction history from OpenSea Events API
CREATE TABLE IF NOT EXISTS opensea_transaction_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- OpenSea event information
  opensea_event_id TEXT UNIQUE,
  event_type TEXT NOT NULL, -- created, successful, cancelled, bid_entered, bid_withdrawn, transfer, offer_entered, etc.
  
  -- NFT information
  contract_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  chain TEXT DEFAULT 'ethereum',
  artwork_id INTEGER, -- Mapped to our artworks table (nullable if not in our DB)
  
  -- Transaction details
  transaction_hash TEXT,
  block_number INTEGER,
  block_timestamp INTEGER,
  
  -- Parties involved
  seller_address TEXT,
  buyer_address TEXT,
  from_account TEXT,
  to_account TEXT,
  
  -- Price information
  price_eth REAL,
  price_usd REAL,
  price_krw INTEGER,
  payment_token TEXT, -- ETH, WETH, USDC, etc.
  
  -- Quantity (for ERC-1155)
  quantity INTEGER DEFAULT 1,
  
  -- Collection information
  collection_slug TEXT,
  collection_name TEXT,
  
  -- NFT metadata
  nft_name TEXT,
  nft_image_url TEXT,
  nft_permalink TEXT,
  
  -- Marketplace fees
  marketplace_fee_eth REAL,
  creator_fee_eth REAL,
  
  -- Auction information (if applicable)
  auction_type TEXT, -- english, dutch, min-price
  duration INTEGER, -- in seconds
  starting_price_eth REAL,
  ending_price_eth REAL,
  
  -- Raw data
  raw_event_data TEXT, -- JSON string of full OpenSea event
  
  -- Import metadata
  imported_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  last_synced_at DATETIME,
  
  -- Foreign keys
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE SET NULL
);

-- Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_opensea_tx_contract_token ON opensea_transaction_history(contract_address, token_id);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_event_type ON opensea_transaction_history(event_type);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_timestamp ON opensea_transaction_history(block_timestamp);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_artwork ON opensea_transaction_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_collection ON opensea_transaction_history(collection_slug);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_seller ON opensea_transaction_history(seller_address);
CREATE INDEX IF NOT EXISTS idx_opensea_tx_buyer ON opensea_transaction_history(buyer_address);

-- =====================================================
-- 3. Ownership Sync Status Table
-- =====================================================
-- Track synchronization status for each NFT
CREATE TABLE IF NOT EXISTS nft_ownership_sync_status (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- Blockchain information
  contract_address TEXT NOT NULL,
  token_id TEXT NOT NULL,
  chain TEXT DEFAULT 'ethereum',
  
  -- Current ownership
  current_owner_address TEXT,
  current_owner_ens TEXT, -- ENS domain name if available
  
  -- Sync status
  last_synced_at DATETIME,
  next_sync_at DATETIME,
  sync_status TEXT DEFAULT 'pending', -- pending, syncing, completed, failed
  sync_error TEXT,
  
  -- Transfer count
  total_transfers INTEGER DEFAULT 0,
  
  -- Metadata
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Foreign keys
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- Index for fast lookups
CREATE INDEX IF NOT EXISTS idx_sync_status_artwork ON nft_ownership_sync_status(artwork_id);
CREATE INDEX IF NOT EXISTS idx_sync_status_contract_token ON nft_ownership_sync_status(contract_address, token_id);
CREATE INDEX IF NOT EXISTS idx_sync_status_owner ON nft_ownership_sync_status(current_owner_address);

-- =====================================================
-- 4. Transaction Import Jobs Table
-- =====================================================
-- Track bulk import jobs from OpenSea
CREATE TABLE IF NOT EXISTS opensea_import_jobs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- Job information
  job_type TEXT NOT NULL, -- collection_transactions, nft_transactions, ownership_sync
  job_status TEXT DEFAULT 'pending', -- pending, running, completed, failed
  
  -- Import parameters
  collection_slug TEXT,
  contract_address TEXT,
  token_id TEXT,
  chain TEXT DEFAULT 'ethereum',
  
  -- Date range for import
  start_date INTEGER, -- Unix timestamp
  end_date INTEGER, -- Unix timestamp
  
  -- Progress tracking
  total_events INTEGER DEFAULT 0,
  processed_events INTEGER DEFAULT 0,
  failed_events INTEGER DEFAULT 0,
  
  -- Results
  imported_transactions INTEGER DEFAULT 0,
  imported_ownerships INTEGER DEFAULT 0,
  
  -- Error tracking
  error_message TEXT,
  error_details TEXT, -- JSON string
  
  -- Timing
  started_at DATETIME,
  completed_at DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- Created by
  created_by_admin_id INTEGER,
  FOREIGN KEY (created_by_admin_id) REFERENCES admin_users(id) ON DELETE SET NULL
);

-- Index for job tracking
CREATE INDEX IF NOT EXISTS idx_import_jobs_status ON opensea_import_jobs(job_status);
CREATE INDEX IF NOT EXISTS idx_import_jobs_type ON opensea_import_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_import_jobs_collection ON opensea_import_jobs(collection_slug);

-- =====================================================
-- 5. Views for Common Queries
-- =====================================================

-- View: Current NFT Owners
CREATE VIEW IF NOT EXISTS v_current_nft_owners AS
SELECT 
  a.id as artwork_id,
  a.title as artwork_title,
  a.nft_contract_address as contract_address,
  a.nft_token_id as token_id,
  a.blockchain_network as chain,
  s.current_owner_address,
  s.current_owner_ens,
  s.total_transfers,
  s.last_synced_at,
  s.sync_status
FROM artworks a
LEFT JOIN nft_ownership_sync_status s ON a.id = s.artwork_id
WHERE a.is_minted = 1;

-- View: Recent Ownership Changes
CREATE VIEW IF NOT EXISTS v_recent_ownership_changes AS
SELECT 
  oh.id,
  oh.artwork_id,
  a.title as artwork_title,
  oh.contract_address,
  oh.token_id,
  oh.from_address,
  oh.to_address,
  oh.transfer_type,
  oh.price_eth,
  oh.price_krw,
  oh.marketplace,
  oh.transaction_hash,
  oh.block_timestamp,
  oh.created_at
FROM nft_ownership_history oh
JOIN artworks a ON oh.artwork_id = a.id
ORDER BY oh.created_at DESC
LIMIT 100;

-- View: OpenSea Transaction Summary
CREATE VIEW IF NOT EXISTS v_opensea_transaction_summary AS
SELECT 
  ot.id,
  ot.opensea_event_id,
  ot.event_type,
  ot.contract_address,
  ot.token_id,
  ot.artwork_id,
  a.title as artwork_title,
  ot.seller_address,
  ot.buyer_address,
  ot.price_eth,
  ot.price_usd,
  ot.price_krw,
  ot.collection_slug,
  ot.collection_name,
  ot.nft_name,
  ot.nft_permalink,
  ot.block_timestamp,
  ot.imported_at
FROM opensea_transaction_history ot
LEFT JOIN artworks a ON ot.artwork_id = a.id
ORDER BY ot.block_timestamp DESC;

-- =====================================================
-- 6. Triggers for Automatic Updates
-- =====================================================

-- Trigger: Update ownership sync status when new ownership record is added
CREATE TRIGGER IF NOT EXISTS trg_update_ownership_sync_after_insert
AFTER INSERT ON nft_ownership_history
BEGIN
  UPDATE nft_ownership_sync_status
  SET 
    current_owner_address = NEW.to_address,
    total_transfers = total_transfers + 1,
    updated_at = CURRENT_TIMESTAMP
  WHERE artwork_id = NEW.artwork_id;
  
  -- If no sync status exists, create one
  INSERT OR IGNORE INTO nft_ownership_sync_status 
    (artwork_id, contract_address, token_id, chain, current_owner_address, total_transfers)
  VALUES 
    (NEW.artwork_id, NEW.contract_address, NEW.token_id, NEW.chain, NEW.to_address, 1);
END;

-- Trigger: Update import job progress
CREATE TRIGGER IF NOT EXISTS trg_update_import_job_progress
AFTER INSERT ON opensea_transaction_history
BEGIN
  UPDATE opensea_import_jobs
  SET 
    processed_events = processed_events + 1,
    imported_transactions = imported_transactions + 1
  WHERE 
    job_status = 'running' AND
    (collection_slug = NEW.collection_slug OR 
     (contract_address = NEW.contract_address AND token_id = NEW.token_id));
END;

-- =====================================================
-- 7. Sample Data (Optional)
-- =====================================================

-- Insert sync status for existing minted NFTs
INSERT OR IGNORE INTO nft_ownership_sync_status (artwork_id, contract_address, token_id, chain, sync_status)
SELECT 
  id,
  nft_contract_address,
  nft_token_id,
  blockchain_network,
  'pending'
FROM artworks
WHERE is_minted = 1 AND nft_contract_address IS NOT NULL;

-- Migration completed
-- Version: 0018
-- Tables added: 4 (nft_ownership_history, opensea_transaction_history, nft_ownership_sync_status, opensea_import_jobs)
-- Views added: 3 (v_current_nft_owners, v_recent_ownership_changes, v_opensea_transaction_summary)
-- Triggers added: 2
-- Indexes added: 17
