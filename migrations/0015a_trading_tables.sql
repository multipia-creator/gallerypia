-- ============================================
-- Migration 0015: 거래 및 수익화 시스템
-- OpenSea 스타일의 완전한 NFT 마켓플레이스
-- ============================================

-- 1. 플랫폼 설정 테이블
CREATE TABLE IF NOT EXISTS platform_settings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  setting_key TEXT UNIQUE NOT NULL,
  setting_value TEXT NOT NULL,
  setting_type TEXT NOT NULL DEFAULT 'string', -- string, number, boolean, json
  description TEXT,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_by INTEGER REFERENCES users(id)
);

-- 기본 설정값 삽입
INSERT OR IGNORE INTO platform_settings (setting_key, setting_value, setting_type, description) VALUES
  ('platform_fee_percentage', '2.5', 'number', '플랫폼 수수료율 (%)'),
  ('creator_royalty_percentage', '10.0', 'number', '크리에이터 로열티율 (%)'),
  ('minimum_price_eth', '0.001', 'number', '최소 판매 가격 (ETH)'),
  ('auction_min_increment_percentage', '5.0', 'number', '경매 최소 증가율 (%)'),
  ('offer_expiry_days', '7', 'number', '오퍼 유효 기간 (일)'),
  ('enable_offers', 'true', 'boolean', '오퍼 기능 활성화'),
  ('enable_auctions', 'true', 'boolean', '경매 기능 활성화'),
  ('gas_fee_coverage', 'buyer', 'string', '가스비 부담 주체 (buyer/seller/split)');

-- 2. 작품 리스팅 테이블 (판매 등록)
CREATE TABLE IF NOT EXISTS artwork_listings (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  seller_id INTEGER NOT NULL REFERENCES users(id),
  listing_type TEXT NOT NULL DEFAULT 'fixed_price', -- fixed_price, auction, not_for_sale
  price_eth REAL, -- 고정가 (ETH)
  currency TEXT DEFAULT 'ETH',
  
  -- 경매 관련
  auction_start_price_eth REAL,
  auction_reserve_price_eth REAL, -- 최소 낙찰가
  auction_end_time DATETIME,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'active', -- active, sold, cancelled, expired
  quantity INTEGER DEFAULT 1, -- ERC-1155용
  quantity_sold INTEGER DEFAULT 0,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sold_at DATETIME
);

CREATE INDEX IF NOT EXISTS idx_listings_artwork ON artwork_listings(artwork_id);
CREATE INDEX IF NOT EXISTS idx_listings_seller ON artwork_listings(seller_id);
CREATE INDEX IF NOT EXISTS idx_listings_status ON artwork_listings(status);
CREATE INDEX IF NOT EXISTS idx_listings_type ON artwork_listings(listing_type);

-- 3. 거래 내역 테이블 (강화)
CREATE TABLE IF NOT EXISTS nft_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id),
  listing_id INTEGER REFERENCES artwork_listings(id),
  
  -- 거래 당사자
  seller_id INTEGER NOT NULL REFERENCES users(id),
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  
  -- 거래 금액 (ETH)
  sale_price_eth REAL NOT NULL,
  platform_fee_eth REAL NOT NULL,
  creator_royalty_eth REAL,
  seller_receive_eth REAL NOT NULL, -- 판매자 실수령액
  
  -- 거래 유형
  transaction_type TEXT NOT NULL DEFAULT 'direct_sale', -- direct_sale, auction, offer_accepted
  
  -- 블록체인 정보
  transaction_hash TEXT,
  block_number INTEGER,
  gas_fee_eth REAL,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending', -- pending, confirmed, failed, refunded
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  confirmed_at DATETIME,
  
  -- 메타데이터
  metadata TEXT -- JSON 형태로 추가 정보 저장
);

CREATE INDEX IF NOT EXISTS idx_transactions_artwork ON nft_transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_transactions_seller ON nft_transactions(seller_id);
CREATE INDEX IF NOT EXISTS idx_transactions_buyer ON nft_transactions(buyer_id);
CREATE INDEX IF NOT EXISTS idx_transactions_status ON nft_transactions(status);
CREATE INDEX IF NOT EXISTS idx_transactions_created ON nft_transactions(created_at DESC);

-- 4. 오퍼 (구매 제안) 테이블
CREATE TABLE IF NOT EXISTS artwork_offers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  listing_id INTEGER REFERENCES artwork_listings(id),
  
  -- 오퍼 정보
  buyer_id INTEGER NOT NULL REFERENCES users(id),
  offer_price_eth REAL NOT NULL,
  currency TEXT DEFAULT 'ETH',
  
  -- 유효기간
  expires_at DATETIME NOT NULL,
  
  -- 상태
  status TEXT NOT NULL DEFAULT 'pending', -- pending, accepted, rejected, expired, cancelled
  
  -- 메시지
  message TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  responded_at DATETIME,
  
  -- 응답
  response_message TEXT,
  responded_by INTEGER REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_offers_artwork ON artwork_offers(artwork_id);
CREATE INDEX IF NOT EXISTS idx_offers_buyer ON artwork_offers(buyer_id);
CREATE INDEX IF NOT EXISTS idx_offers_status ON artwork_offers(status);
CREATE INDEX IF NOT EXISTS idx_offers_expires ON artwork_offers(expires_at);

-- 5. 경매 입찰 내역 (강화) - 기존 테이블과 독립적으로 사용
CREATE TABLE IF NOT EXISTS auction_bids_enhanced (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  listing_id INTEGER REFERENCES artwork_listings(id),
  artwork_id INTEGER NOT NULL REFERENCES artworks(id),
  
  -- 입찰자 정보
  bidder_id INTEGER NOT NULL REFERENCES users(id),
  bid_amount_eth REAL NOT NULL,
  
  -- 입찰 상태
  status TEXT NOT NULL DEFAULT 'active', -- active, outbid, won, withdrawn
  is_winning BOOLEAN DEFAULT 0,
  
  -- 자동 입찰
  max_bid_eth REAL, -- 자동 입찰 최대 금액
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 블록체인 정보
  transaction_hash TEXT
);

CREATE INDEX IF NOT EXISTS idx_auction_bids_listing ON auction_bids_enhanced(listing_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_bidder ON auction_bids_enhanced(bidder_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_artwork ON auction_bids_enhanced(artwork_id);
CREATE INDEX IF NOT EXISTS idx_auction_bids_status ON auction_bids_enhanced(status);
CREATE INDEX IF NOT EXISTS idx_auction_bids_winning ON auction_bids_enhanced(is_winning);

-- 6. 플랫폼 수익 내역
CREATE TABLE IF NOT EXISTS platform_revenue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES nft_transactions(id),
  artwork_id INTEGER NOT NULL REFERENCES artworks(id),
  
  -- 수익 구분
  revenue_type TEXT NOT NULL, -- platform_fee, gas_fee_subsidy, listing_fee
  amount_eth REAL NOT NULL,
  
  -- 날짜
  revenue_date DATE NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  -- 메타데이터
  description TEXT
);

CREATE INDEX IF NOT EXISTS idx_revenue_date ON platform_revenue(revenue_date DESC);
CREATE INDEX IF NOT EXISTS idx_revenue_type ON platform_revenue(revenue_type);
CREATE INDEX IF NOT EXISTS idx_revenue_transaction ON platform_revenue(transaction_id);

-- 7. 크리에이터 로열티 내역
CREATE TABLE IF NOT EXISTS creator_royalties (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  transaction_id INTEGER NOT NULL REFERENCES nft_transactions(id),
  artwork_id INTEGER NOT NULL REFERENCES artworks(id),
  
  -- 크리에이터 정보
  creator_id INTEGER NOT NULL REFERENCES users(id),
  royalty_percentage REAL NOT NULL,
  royalty_amount_eth REAL NOT NULL,
  
  -- 지급 상태
  status TEXT NOT NULL DEFAULT 'pending', -- pending, paid, failed
  paid_at DATETIME,
  
  -- 블록체인 정보
  payment_transaction_hash TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_royalties_creator ON creator_royalties(creator_id);
CREATE INDEX IF NOT EXISTS idx_royalties_status ON creator_royalties(status);
CREATE INDEX IF NOT EXISTS idx_royalties_transaction ON creator_royalties(transaction_id);

-- 8. 사용자 지갑 잔액 (플랫폼 내부 지갑)
CREATE TABLE IF NOT EXISTS user_wallets (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- 잔액
  balance_eth REAL DEFAULT 0.0,
  locked_balance_eth REAL DEFAULT 0.0, -- 진행 중인 거래에 락된 금액
  
  -- 누적 통계
  total_earned_eth REAL DEFAULT 0.0,
  total_spent_eth REAL DEFAULT 0.0,
  total_withdrawn_eth REAL DEFAULT 0.0,
  
  -- 외부 지갑 주소
  external_wallet_address TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_user ON user_wallets(user_id);

-- 9. 지갑 거래 내역
CREATE TABLE IF NOT EXISTS wallet_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  wallet_id INTEGER NOT NULL REFERENCES user_wallets(id),
  
  -- 거래 정보
  transaction_type TEXT NOT NULL, -- deposit, withdrawal, purchase, sale, refund, royalty, fee
  amount_eth REAL NOT NULL,
  balance_after_eth REAL NOT NULL,
  
  -- 관련 정보
  related_transaction_id INTEGER REFERENCES nft_transactions(id),
  related_artwork_id INTEGER REFERENCES artworks(id),
  
  -- 설명
  description TEXT,
  
  -- 블록체인 정보
  transaction_hash TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_wallet_tx_user ON wallet_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_type ON wallet_transactions(transaction_type);
CREATE INDEX IF NOT EXISTS idx_wallet_tx_created ON wallet_transactions(created_at DESC);

-- 10. 가격 히스토리 (시장 분석용)
CREATE TABLE IF NOT EXISTS price_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL REFERENCES artworks(id) ON DELETE CASCADE,
  
  -- 가격 정보
  price_eth REAL NOT NULL,
  event_type TEXT NOT NULL, -- listing, sale, offer, bid, delisting
  
  -- 관련 정보
  transaction_id INTEGER REFERENCES nft_transactions(id),
  listing_id INTEGER REFERENCES artwork_listings(id),
  user_id INTEGER REFERENCES users(id),
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_price_history_artwork ON price_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_price_history_created ON price_history(created_at DESC);

-- 11. 거래 활동 로그 (관리자 모니터링용) - 기존 activity_logs 테이블과 별도
CREATE TABLE IF NOT EXISTS trading_activity_logs (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 활동 정보
  activity_type TEXT NOT NULL, -- listing, sale, offer, bid, transfer, mint, burn
  user_id INTEGER REFERENCES users(id),
  artwork_id INTEGER REFERENCES artworks(id),
  
  -- 상세 정보
  details TEXT, -- JSON 형태
  ip_address TEXT,
  user_agent TEXT,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_trading_activity_type ON trading_activity_logs(activity_type);
CREATE INDEX IF NOT EXISTS idx_trading_activity_user ON trading_activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_trading_activity_artwork ON trading_activity_logs(artwork_id);
CREATE INDEX IF NOT EXISTS idx_trading_activity_created ON trading_activity_logs(created_at DESC);

