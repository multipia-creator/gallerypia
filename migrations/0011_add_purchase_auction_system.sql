-- Add buyer_id and seller_id to transactions table
ALTER TABLE transactions ADD COLUMN buyer_id INTEGER;
ALTER TABLE transactions ADD COLUMN seller_id INTEGER;
ALTER TABLE transactions ADD COLUMN payment_method TEXT DEFAULT 'metamask';
ALTER TABLE transactions ADD COLUMN completed_at DATETIME;

-- Create auctions table for auction functionality
CREATE TABLE IF NOT EXISTS auctions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  starting_price REAL NOT NULL,
  current_price REAL,
  reserve_price REAL,
  currency TEXT DEFAULT 'ETH',
  start_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  end_time DATETIME NOT NULL,
  status TEXT DEFAULT 'active',
  winner_id INTEGER,
  winning_bid_id INTEGER,
  total_bids INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Create auction_bids table for bid tracking
CREATE TABLE IF NOT EXISTS auction_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  auction_id INTEGER NOT NULL,
  bidder_id INTEGER NOT NULL,
  bid_amount REAL NOT NULL,
  currency TEXT DEFAULT 'ETH',
  bid_time DATETIME DEFAULT CURRENT_TIMESTAMP,
  is_winning_bid INTEGER DEFAULT 0,
  status TEXT DEFAULT 'active'
);

-- Create purchase_offers table for direct purchase offers
CREATE TABLE IF NOT EXISTS purchase_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  seller_id INTEGER NOT NULL,
  offer_price REAL NOT NULL,
  currency TEXT DEFAULT 'ETH',
  message TEXT,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  expires_at DATETIME
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_auctions_artwork ON auctions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_auctions_status ON auctions(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_auction ON auction_bids(auction_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids(bidder_id);
CREATE INDEX IF NOT EXISTS idx_purchase_offers_artwork ON purchase_offers(artwork_id);
CREATE INDEX IF NOT EXISTS idx_purchase_offers_buyer ON purchase_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_purchase_offers_seller ON purchase_offers(seller_id);
