-- 12. artworks 테이블에 거래 관련 컬럼 추가
ALTER TABLE artworks ADD COLUMN is_listed BOOLEAN DEFAULT 0;
ALTER TABLE artworks ADD COLUMN current_price_eth REAL;
ALTER TABLE artworks ADD COLUMN last_sale_price_eth REAL;
ALTER TABLE artworks ADD COLUMN last_sale_date DATETIME;
ALTER TABLE artworks ADD COLUMN total_sales INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN total_volume_eth REAL DEFAULT 0.0;

-- 13. users 테이블에 거래 통계 컬럼 추가
ALTER TABLE users ADD COLUMN total_sales_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_purchases_count INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN total_sales_volume_eth REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN total_purchases_volume_eth REAL DEFAULT 0.0;
ALTER TABLE users ADD COLUMN total_earned_royalties_eth REAL DEFAULT 0.0;

-- 14. 플랫폼 통계 요약 테이블 (일별 집계)
CREATE TABLE IF NOT EXISTS daily_statistics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  stat_date DATE UNIQUE NOT NULL,
  
  -- 거래 통계
  total_transactions INTEGER DEFAULT 0,
  total_volume_eth REAL DEFAULT 0.0,
  total_platform_fee_eth REAL DEFAULT 0.0,
  total_creator_royalty_eth REAL DEFAULT 0.0,
  
  -- 작품 통계
  total_listings INTEGER DEFAULT 0,
  new_listings INTEGER DEFAULT 0,
  sold_listings INTEGER DEFAULT 0,
  
  -- 사용자 통계
  active_buyers INTEGER DEFAULT 0,
  active_sellers INTEGER DEFAULT 0,
  new_users INTEGER DEFAULT 0,
  
  -- 가격 통계
  avg_sale_price_eth REAL DEFAULT 0.0,
  min_sale_price_eth REAL,
  max_sale_price_eth REAL,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_statistics(stat_date DESC);

-- 15. 환율 정보 테이블 (USD, KRW 변환용)
CREATE TABLE IF NOT EXISTS exchange_rates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  currency TEXT NOT NULL, -- USD, KRW, EUR, etc.
  eth_rate REAL NOT NULL, -- 1 ETH = X currency
  
  -- 타임스탬프
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

INSERT OR IGNORE INTO exchange_rates (currency, eth_rate) VALUES
  ('USD', 2000.0),
  ('KRW', 2600000.0),
  ('EUR', 1800.0);

CREATE INDEX IF NOT EXISTS idx_exchange_currency ON exchange_rates(currency);

-- ============================================
-- 초기 데이터 및 트리거
-- ============================================

-- 모든 사용자에게 지갑 생성
INSERT OR IGNORE INTO user_wallets (user_id, balance_eth)
SELECT id, 0.0 FROM users;

-- 가격 히스토리 자동 기록 트리거
CREATE TRIGGER IF NOT EXISTS tr_record_listing_price
AFTER INSERT ON artwork_listings
FOR EACH ROW
WHEN NEW.status = 'active'
BEGIN
  INSERT INTO price_history (artwork_id, price_eth, event_type, listing_id, user_id)
  VALUES (NEW.artwork_id, COALESCE(NEW.price_eth, NEW.auction_start_price_eth), 'listing', NEW.id, NEW.seller_id);
END;

-- 거래 완료 시 통계 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS tr_update_stats_on_sale
AFTER INSERT ON nft_transactions
FOR EACH ROW
WHEN NEW.status = 'confirmed'
BEGIN
  -- 작품 통계 업데이트 (EXISTS 체크 추가)
  UPDATE artworks 
  SET 
    last_sale_price_eth = NEW.sale_price_eth,
    last_sale_date = NEW.confirmed_at,
    total_sales = COALESCE(total_sales, 0) + 1,
    total_volume_eth = COALESCE(total_volume_eth, 0.0) + NEW.sale_price_eth,
    is_listed = 0
  WHERE id = NEW.artwork_id AND EXISTS (SELECT 1 FROM artworks WHERE id = NEW.artwork_id);
  
  -- 판매자 통계 업데이트
  UPDATE users
  SET
    total_sales_count = total_sales_count + 1,
    total_sales_volume_eth = total_sales_volume_eth + NEW.seller_receive_eth
  WHERE id = NEW.seller_id;
  
  -- 구매자 통계 업데이트
  UPDATE users
  SET
    total_purchases_count = total_purchases_count + 1,
    total_purchases_volume_eth = total_purchases_volume_eth + NEW.sale_price_eth
  WHERE id = NEW.buyer_id;
  
  -- 가격 히스토리 기록
  INSERT INTO price_history (artwork_id, price_eth, event_type, transaction_id, user_id)
  VALUES (NEW.artwork_id, NEW.sale_price_eth, 'sale', NEW.id, NEW.buyer_id);
END;

-- 지갑 업데이트 트리거
CREATE TRIGGER IF NOT EXISTS tr_update_wallet_on_sale
AFTER INSERT ON nft_transactions
FOR EACH ROW
WHEN NEW.status = 'confirmed'
BEGIN
  -- 판매자 지갑에 입금
  UPDATE user_wallets
  SET 
    balance_eth = balance_eth + NEW.seller_receive_eth,
    total_earned_eth = total_earned_eth + NEW.seller_receive_eth,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.seller_id;
  
  -- 구매자 지갑에서 출금
  UPDATE user_wallets
  SET 
    balance_eth = balance_eth - NEW.sale_price_eth,
    total_spent_eth = total_spent_eth + NEW.sale_price_eth,
    updated_at = CURRENT_TIMESTAMP
  WHERE user_id = NEW.buyer_id;
END;

-- ============================================
-- 뷰 (View) 생성 - 관리자 모니터링용
-- ============================================

-- 실시간 거래 현황 뷰
CREATE VIEW IF NOT EXISTS v_recent_transactions AS
SELECT 
  t.id,
  t.artwork_id,
  a.title AS artwork_title,
  a.image_url AS artwork_image,
  t.seller_id,
  s.username AS seller_username,
  t.buyer_id,
  b.username AS buyer_username,
  t.sale_price_eth,
  t.platform_fee_eth,
  t.creator_royalty_eth,
  t.transaction_type,
  t.status,
  t.created_at,
  t.confirmed_at
FROM nft_transactions t
JOIN artworks a ON t.artwork_id = a.id
JOIN users s ON t.seller_id = s.id
JOIN users b ON t.buyer_id = b.id
ORDER BY t.created_at DESC;

-- 플랫폼 수익 요약 뷰
CREATE VIEW IF NOT EXISTS v_platform_revenue_summary AS
SELECT 
  DATE(revenue_date) AS date,
  revenue_type,
  SUM(amount_eth) AS total_amount_eth,
  COUNT(*) AS transaction_count
FROM platform_revenue
GROUP BY DATE(revenue_date), revenue_type;

-- 인기 작품 뷰
CREATE VIEW IF NOT EXISTS v_trending_artworks AS
SELECT 
  a.id,
  a.title,
  a.image_url,
  a.artist_id,
  u.username AS artist_name,
  a.current_price_eth,
  a.total_sales,
  a.total_volume_eth,
  a.views,
  a.likes
FROM artworks a
JOIN users u ON a.artist_id = u.id
WHERE a.is_listed = 1
ORDER BY a.total_volume_eth DESC, a.total_sales DESC
LIMIT 100;

-- 활성 판매자 뷰
CREATE VIEW IF NOT EXISTS v_top_sellers AS
SELECT 
  u.id,
  u.username,
  u.full_name,
  u.profile_image,
  u.total_sales_count,
  u.total_sales_volume_eth,
  COUNT(DISTINCT l.id) AS active_listings
FROM users u
LEFT JOIN artwork_listings l ON u.id = l.seller_id AND l.status = 'active'
WHERE u.total_sales_count > 0
GROUP BY u.id
ORDER BY u.total_sales_volume_eth DESC
LIMIT 100;
