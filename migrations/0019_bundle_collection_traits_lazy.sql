-- Migration 0019: Bundle Sales, Collections, Traits, Lazy Minting
-- Version: v8.16
-- Date: 2025-11-16
-- Description: OpenSea-inspired features - Bundle sales, Collection management, Trait filtering, Lazy minting

-- ============================================
-- 1. ARTWORK COLLECTIONS (컬렉션 관리)
-- ============================================

-- 컬렉션 테이블 (작가별 NFT 시리즈)
CREATE TABLE IF NOT EXISTS artwork_collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  collection_slug TEXT UNIQUE NOT NULL,  -- URL-friendly slug (예: "beeple-everydays")
  collection_name TEXT NOT NULL,  -- 컬렉션 이름 (예: "Everydays: The First 5000 Days")
  description TEXT,
  banner_image TEXT,  -- 컬렉션 배너 이미지
  logo_image TEXT,  -- 컬렉션 로고
  
  -- 통계 정보
  floor_price_eth REAL DEFAULT 0,  -- 최저 가격
  total_volume_eth REAL DEFAULT 0,  -- 총 거래량
  total_items INTEGER DEFAULT 0,  -- 총 아이템 수
  owners_count INTEGER DEFAULT 0,  -- 소유자 수
  
  -- 설정
  royalty_percentage REAL DEFAULT 10.0,  -- 로열티 비율
  is_featured BOOLEAN DEFAULT 0,  -- 추천 컬렉션 여부
  is_verified BOOLEAN DEFAULT 0,  -- 인증 컬렉션 여부
  
  -- 카테고리 & 태그
  category TEXT,  -- 카테고리 (Art, Photography, Music 등)
  tags TEXT,  -- 쉼표로 구분된 태그
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES users(id) ON DELETE CASCADE
);

-- artworks 테이블에 collection_id 컬럼 추가
-- (이미 있는 경우 에러 무시)
ALTER TABLE artworks ADD COLUMN collection_id INTEGER;
ALTER TABLE artworks ADD COLUMN collection_slug TEXT;

-- 컬렉션 인덱스
CREATE INDEX IF NOT EXISTS idx_collections_artist ON artwork_collections(artist_id);
CREATE INDEX IF NOT EXISTS idx_collections_slug ON artwork_collections(collection_slug);
CREATE INDEX IF NOT EXISTS idx_collections_featured ON artwork_collections(is_featured, floor_price_eth DESC);
CREATE INDEX IF NOT EXISTS idx_artworks_collection ON artworks(collection_id);


-- ============================================
-- 2. ARTWORK TRAITS (NFT 속성/특성)
-- ============================================

-- 트레이트 테이블 (NFT의 속성 정보)
CREATE TABLE IF NOT EXISTS artwork_traits (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  
  -- 트레이트 정보
  trait_type TEXT NOT NULL,  -- 속성 타입 (예: "Background", "Style", "Color", "Medium")
  trait_value TEXT NOT NULL,  -- 속성 값 (예: "Blue", "Abstract", "Oil Paint")
  
  -- 희귀도 정보
  rarity_score REAL,  -- 희귀도 점수 (0-100, 낮을수록 희귀)
  rarity_percentage REAL,  -- 해당 속성을 가진 작품 비율 (예: 8.5%)
  
  -- 표시 정보
  display_type TEXT,  -- 표시 타입 (string, number, date, boost_number 등)
  max_value REAL,  -- 최대값 (숫자형 트레이트용)
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- 트레이트 인덱스 (필터링 성능 최적화)
CREATE INDEX IF NOT EXISTS idx_traits_artwork ON artwork_traits(artwork_id);
CREATE INDEX IF NOT EXISTS idx_traits_type_value ON artwork_traits(trait_type, trait_value);
CREATE INDEX IF NOT EXISTS idx_traits_rarity ON artwork_traits(rarity_score DESC);

-- 컬렉션별 트레이트 통계 뷰
CREATE VIEW IF NOT EXISTS v_collection_traits_stats AS
SELECT 
  a.collection_id,
  ac.collection_name,
  t.trait_type,
  t.trait_value,
  COUNT(*) as count,
  ROUND(COUNT(*) * 100.0 / ac.total_items, 2) as percentage
FROM artwork_traits t
JOIN artworks a ON t.artwork_id = a.id
JOIN artwork_collections ac ON a.collection_id = ac.id
WHERE a.collection_id IS NOT NULL
GROUP BY a.collection_id, t.trait_type, t.trait_value
ORDER BY a.collection_id, t.trait_type, count DESC;


-- ============================================
-- 3. BUNDLE SALES (묶음 판매)
-- ============================================

-- 번들 테이블 (여러 NFT를 묶어서 판매)
CREATE TABLE IF NOT EXISTS artwork_bundles (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  seller_id INTEGER NOT NULL,
  
  -- 번들 정보
  bundle_name TEXT NOT NULL,  -- 번들 이름 (예: "Abstract Collection #1")
  description TEXT,
  bundle_slug TEXT UNIQUE,  -- URL-friendly slug
  
  -- 가격 정보
  total_price_eth REAL NOT NULL,  -- 번들 총 가격
  discount_percentage REAL DEFAULT 0,  -- 할인율 (개별 가격 대비)
  original_price_eth REAL,  -- 할인 전 가격 (개별 가격 합계)
  
  -- 상태
  status TEXT DEFAULT 'active',  -- active, sold, cancelled, expired
  listing_type TEXT DEFAULT 'fixed_price',  -- fixed_price, auction
  
  -- 경매 정보 (listing_type = 'auction'인 경우)
  auction_start_time DATETIME,
  auction_end_time DATETIME,
  highest_bid_eth REAL,
  highest_bidder_id INTEGER,
  
  -- 판매 정보
  sold_at DATETIME,
  buyer_id INTEGER,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (seller_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (highest_bidder_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 번들 아이템 테이블 (번들에 포함된 NFT 목록)
CREATE TABLE IF NOT EXISTS bundle_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  
  -- 개별 가격 정보 (참고용)
  individual_price_eth REAL,  -- 개별 판매 시 가격
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (bundle_id) REFERENCES artwork_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  
  UNIQUE(bundle_id, artwork_id)  -- 같은 작품이 한 번들에 중복 포함 방지
);

-- 번들 입찰 테이블 (경매형 번들용)
CREATE TABLE IF NOT EXISTS bundle_bids (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  bundle_id INTEGER NOT NULL,
  bidder_id INTEGER NOT NULL,
  
  bid_amount_eth REAL NOT NULL,
  is_winning BOOLEAN DEFAULT 0,  -- 현재 최고가 입찰 여부
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (bundle_id) REFERENCES artwork_bundles(id) ON DELETE CASCADE,
  FOREIGN KEY (bidder_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 번들 인덱스
CREATE INDEX IF NOT EXISTS idx_bundles_seller ON artwork_bundles(seller_id);
CREATE INDEX IF NOT EXISTS idx_bundles_status ON artwork_bundles(status, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bundles_slug ON artwork_bundles(bundle_slug);
CREATE INDEX IF NOT EXISTS idx_bundle_items_bundle ON bundle_items(bundle_id);
CREATE INDEX IF NOT EXISTS idx_bundle_items_artwork ON bundle_items(artwork_id);
CREATE INDEX IF NOT EXISTS idx_bundle_bids_bundle ON bundle_bids(bundle_id, bid_amount_eth DESC);


-- ============================================
-- 4. LAZY MINTING (지연 민팅)
-- ============================================

-- artworks 테이블에 lazy minting 관련 컬럼 추가
ALTER TABLE artworks ADD COLUMN lazy_mint BOOLEAN DEFAULT 0;  -- 지연 민팅 여부
ALTER TABLE artworks ADD COLUMN first_buyer_id INTEGER;  -- 첫 구매자 (지연 민팅 트리거)
ALTER TABLE artworks ADD COLUMN minted_at DATETIME;  -- 실제 민팅 완료 시각
ALTER TABLE artworks ADD COLUMN minting_transaction_hash TEXT;  -- 민팅 트랜잭션 해시

-- Lazy minting 작업 큐 테이블
CREATE TABLE IF NOT EXISTS lazy_mint_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  buyer_id INTEGER NOT NULL,
  
  -- 민팅 정보
  contract_address TEXT,
  token_id TEXT,
  metadata_uri TEXT,  -- IPFS URI
  
  -- 상태
  status TEXT DEFAULT 'pending',  -- pending, processing, completed, failed
  error_message TEXT,
  
  -- 블록체인 정보
  transaction_hash TEXT,
  block_number INTEGER,
  gas_used REAL,
  
  -- 타임스탬프
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  processed_at DATETIME,
  completed_at DATETIME,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (buyer_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_lazy_mint_status ON lazy_mint_queue(status, created_at);
CREATE INDEX IF NOT EXISTS idx_lazy_mint_artwork ON lazy_mint_queue(artwork_id);


-- ============================================
-- 5. COLLECTION STATISTICS (컬렉션 통계)
-- ============================================

-- 컬렉션 일일 통계 (트렌딩 계산용)
CREATE TABLE IF NOT EXISTS collection_daily_stats (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  stat_date DATE NOT NULL,
  
  -- 거래 통계
  daily_volume_eth REAL DEFAULT 0,
  daily_sales_count INTEGER DEFAULT 0,
  daily_unique_buyers INTEGER DEFAULT 0,
  
  -- 가격 통계
  floor_price_eth REAL,
  ceiling_price_eth REAL,
  average_price_eth REAL,
  
  -- 소유자 통계
  total_owners INTEGER DEFAULT 0,
  new_owners_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (collection_id) REFERENCES artwork_collections(id) ON DELETE CASCADE,
  
  UNIQUE(collection_id, stat_date)
);

CREATE INDEX IF NOT EXISTS idx_collection_stats_date ON collection_daily_stats(collection_id, stat_date DESC);
CREATE INDEX IF NOT EXISTS idx_collection_stats_volume ON collection_daily_stats(daily_volume_eth DESC);


-- ============================================
-- 6. VIEWS - 최적화된 쿼리 뷰
-- ============================================

-- 활성 번들 뷰 (상세 정보 포함)
CREATE VIEW IF NOT EXISTS v_active_bundles AS
SELECT 
  b.*,
  u.name as seller_name,
  u.avatar as seller_avatar,
  COUNT(DISTINCT bi.artwork_id) as items_count,
  GROUP_CONCAT(DISTINCT a.image_url) as preview_images,
  CASE 
    WHEN b.listing_type = 'auction' AND datetime('now') > b.auction_end_time THEN 'expired'
    ELSE b.status
  END as current_status
FROM artwork_bundles b
JOIN users u ON b.seller_id = u.id
LEFT JOIN bundle_items bi ON b.id = bi.bundle_id
LEFT JOIN artworks a ON bi.artwork_id = a.id
GROUP BY b.id
HAVING current_status = 'active';

-- 트렌딩 컬렉션 뷰 (최근 7일 기준)
CREATE VIEW IF NOT EXISTS v_trending_collections AS
SELECT 
  ac.*,
  u.name as artist_name,
  u.avatar as artist_avatar,
  COALESCE(SUM(cds.daily_volume_eth), 0) as week_volume,
  COALESCE(SUM(cds.daily_sales_count), 0) as week_sales,
  ROUND(COALESCE(AVG(cds.floor_price_eth), ac.floor_price_eth), 4) as avg_floor_price
FROM artwork_collections ac
JOIN users u ON ac.artist_id = u.id
LEFT JOIN collection_daily_stats cds ON ac.id = cds.collection_id 
  AND cds.stat_date >= date('now', '-7 days')
GROUP BY ac.id
ORDER BY week_volume DESC, week_sales DESC
LIMIT 50;

-- 컬렉션 상세 뷰 (모든 통계 포함)
CREATE VIEW IF NOT EXISTS v_collection_details AS
SELECT 
  ac.*,
  u.name as artist_name,
  u.email as artist_email,
  u.avatar as artist_avatar,
  u.bio as artist_bio,
  COUNT(DISTINCT a.id) as actual_items_count,
  COUNT(DISTINCT a.owner_id) as actual_owners_count,
  MIN(CASE WHEN al.status = 'active' THEN al.price_eth END) as current_floor_price,
  MAX(CASE WHEN al.status = 'active' THEN al.price_eth END) as current_ceiling_price,
  COALESCE(SUM(nt.amount_eth), 0) as actual_total_volume
FROM artwork_collections ac
JOIN users u ON ac.artist_id = u.id
LEFT JOIN artworks a ON ac.id = a.collection_id
LEFT JOIN artwork_listings al ON a.id = al.artwork_id
LEFT JOIN nft_transactions nt ON a.id = nt.artwork_id
GROUP BY ac.id;


-- ============================================
-- 7. TRIGGERS - 자동 업데이트
-- ============================================

-- 트리거 1: 컬렉션에 작품 추가 시 total_items 자동 증가
CREATE TRIGGER IF NOT EXISTS trg_collection_item_added
AFTER UPDATE OF collection_id ON artworks
WHEN NEW.collection_id IS NOT NULL
BEGIN
  UPDATE artwork_collections
  SET 
    total_items = (SELECT COUNT(*) FROM artworks WHERE collection_id = NEW.collection_id),
    updated_at = datetime('now')
  WHERE id = NEW.collection_id;
END;

-- 트리거 2: 번들 생성 시 slug 자동 생성
CREATE TRIGGER IF NOT EXISTS trg_bundle_slug_generation
AFTER INSERT ON artwork_bundles
WHEN NEW.bundle_slug IS NULL
BEGIN
  UPDATE artwork_bundles
  SET bundle_slug = 'bundle-' || NEW.id || '-' || substr(lower(hex(randomblob(4))), 1, 8)
  WHERE id = NEW.id;
END;

-- 트리거 3: Lazy mint 완료 시 artworks 테이블 업데이트
CREATE TRIGGER IF NOT EXISTS trg_lazy_mint_completed
AFTER UPDATE OF status ON lazy_mint_queue
WHEN NEW.status = 'completed'
BEGIN
  UPDATE artworks
  SET 
    is_minted = 1,
    minted_at = datetime('now'),
    minting_transaction_hash = NEW.transaction_hash,
    updated_at = datetime('now')
  WHERE id = NEW.artwork_id;
END;

-- 트리거 4: 트레이트 추가/삭제 시 희귀도 자동 재계산
CREATE TRIGGER IF NOT EXISTS trg_trait_rarity_calculation
AFTER INSERT ON artwork_traits
BEGIN
  -- 같은 collection의 전체 아이템 수 조회
  UPDATE artwork_traits
  SET 
    rarity_percentage = (
      SELECT 
        ROUND(COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM artworks a2 
          WHERE a2.collection_id = a.collection_id
        ), 2)
      FROM artwork_traits t2
      JOIN artworks a2 ON t2.artwork_id = a2.id
      WHERE t2.trait_type = NEW.trait_type
        AND t2.trait_value = NEW.trait_value
        AND a2.collection_id = a.collection_id
    ),
    rarity_score = 100 - (
      SELECT 
        COUNT(*) * 100.0 / (
          SELECT COUNT(*) 
          FROM artworks a2 
          WHERE a2.collection_id = a.collection_id
        )
      FROM artwork_traits t2
      JOIN artworks a2 ON t2.artwork_id = a2.id
      WHERE t2.trait_type = NEW.trait_type
        AND t2.trait_value = NEW.trait_value
        AND a2.collection_id = a.collection_id
    )
  FROM artworks a
  WHERE artwork_traits.id = NEW.id
    AND artwork_traits.artwork_id = a.id;
END;


-- ============================================
-- 8. INITIAL DATA - 샘플 컬렉션 & 트레이트
-- ============================================

-- 샘플 컬렉션 생성 (기존 작품들을 컬렉션으로 그룹화)
INSERT OR IGNORE INTO artwork_collections (artist_id, collection_slug, collection_name, description, category, is_verified)
SELECT DISTINCT
  a.artist_id,
  'collection-' || a.artist_id || '-' || lower(replace(ar.name, ' ', '-')),
  ar.name || ' Collection',
  'Official collection by ' || ar.name,
  a.category,
  1
FROM artworks a
JOIN artists ar ON a.artist_id = ar.id
WHERE a.collection_id IS NULL
LIMIT 10;

-- 기존 작품에 컬렉션 할당
UPDATE artworks
SET collection_id = (
  SELECT id FROM artwork_collections 
  WHERE artist_id = artworks.artist_id 
  LIMIT 1
)
WHERE collection_id IS NULL;

-- 샘플 트레이트 추가 (카테고리 기반)
INSERT OR IGNORE INTO artwork_traits (artwork_id, trait_type, trait_value)
SELECT 
  id,
  'Category',
  category
FROM artworks
WHERE category IS NOT NULL;

INSERT OR IGNORE INTO artwork_traits (artwork_id, trait_type, trait_value)
SELECT 
  id,
  'Status',
  CASE 
    WHEN is_minted = 1 THEN 'Minted'
    ELSE 'Not Minted'
  END
FROM artworks;

INSERT OR IGNORE INTO artwork_traits (artwork_id, trait_type, trait_value)
SELECT 
  id,
  'Price Range',
  CASE 
    WHEN estimated_value >= 100000000 THEN 'Premium (100M+ KRW)'
    WHEN estimated_value >= 50000000 THEN 'High (50M+ KRW)'
    WHEN estimated_value >= 10000000 THEN 'Medium (10M+ KRW)'
    ELSE 'Affordable (< 10M KRW)'
  END
FROM artworks
WHERE estimated_value IS NOT NULL;


-- ============================================
-- 9. 통계 집계용 함수 (정기 실행용)
-- ============================================

-- 컬렉션 통계 업데이트 (cron job으로 주기적 실행)
-- 참고: Cloudflare Workers에서는 Scheduled Events로 구현

-- Migration 완료
-- Total: 9 tables, 3 views, 4 triggers, 10+ indexes
-- 신규 테이블: artwork_collections, artwork_traits, artwork_bundles, bundle_items, 
--              bundle_bids, lazy_mint_queue, collection_daily_stats
-- 컬럼 추가: artworks (collection_id, collection_slug, lazy_mint, first_buyer_id, minted_at, minting_transaction_hash)
