-- Migration 0020: Essential Phase 2 Features (Simplified)
-- Version: v8.16
-- Date: 2025-11-16
-- Description: Core features only - Blockchain networks, Activity feed

-- ============================================
-- 1. MULTI-CHAIN SUPPORT (멀티체인 지원)
-- ============================================

-- 지원 블록체인 네트워크 테이블
CREATE TABLE IF NOT EXISTS blockchain_networks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  
  -- 네트워크 정보
  chain_id INTEGER UNIQUE NOT NULL,
  chain_name TEXT NOT NULL,
  chain_slug TEXT UNIQUE NOT NULL,
  
  -- RPC & Explorer
  rpc_url TEXT NOT NULL,
  explorer_url TEXT,
  
  -- 네이티브 토큰
  native_currency_symbol TEXT NOT NULL,
  native_currency_name TEXT,
  native_currency_decimals INTEGER DEFAULT 18,
  
  -- 설정
  is_testnet BOOLEAN DEFAULT 0,
  is_active BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- artworks 테이블에 체인 정보 추가
ALTER TABLE artworks ADD COLUMN chain_id INTEGER DEFAULT 1;
ALTER TABLE artworks ADD COLUMN chain_name TEXT DEFAULT 'Ethereum';

CREATE INDEX IF NOT EXISTS idx_artworks_chain ON artworks(chain_id);


-- ============================================
-- 2. ACTIVITY FEED (활동 피드)
-- ============================================

-- 사용자 활동 피드
CREATE TABLE IF NOT EXISTS activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  
  -- 활동 정보
  activity_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id INTEGER NOT NULL,
  
  -- 활동 주체
  actor_id INTEGER,
  
  -- 추가 데이터 (JSON)
  metadata TEXT,
  
  -- 가시성
  is_public BOOLEAN DEFAULT 1,
  is_read BOOLEAN DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (actor_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 팔로우 시스템
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_id INTEGER NOT NULL,
  following_id INTEGER NOT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (follower_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_id) REFERENCES users(id) ON DELETE CASCADE,
  
  UNIQUE(follower_id, following_id)
);

-- 컬렉션 팔로우
CREATE TABLE IF NOT EXISTS collection_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  collection_id INTEGER NOT NULL,
  
  -- 알림 설정
  notify_on_new_items BOOLEAN DEFAULT 1,
  notify_on_price_changes BOOLEAN DEFAULT 1,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (collection_id) REFERENCES artwork_collections(id) ON DELETE CASCADE,
  
  UNIQUE(user_id, collection_id)
);

CREATE INDEX IF NOT EXISTS idx_activity_feed ON activity_feed(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_id);
CREATE INDEX IF NOT EXISTS idx_collection_follows ON collection_follows(user_id);


-- ============================================
-- 3. INITIAL DATA - 지원 블록체인 네트워크
-- ============================================

-- 주요 블록체인 네트워크 추가
INSERT OR IGNORE INTO blockchain_networks (chain_id, chain_name, chain_slug, rpc_url, explorer_url, native_currency_symbol, native_currency_name, is_active)
VALUES 
  (1, 'Ethereum Mainnet', 'ethereum', 'https://eth.llamarpc.com', 'https://etherscan.io', 'ETH', 'Ether', 1),
  (137, 'Polygon', 'polygon', 'https://polygon-rpc.com', 'https://polygonscan.com', 'MATIC', 'Matic', 1),
  (42161, 'Arbitrum One', 'arbitrum', 'https://arb1.arbitrum.io/rpc', 'https://arbiscan.io', 'ETH', 'Ether', 1),
  (10, 'Optimism', 'optimism', 'https://mainnet.optimism.io', 'https://optimistic.etherscan.io', 'ETH', 'Ether', 1),
  (8453, 'Base', 'base', 'https://mainnet.base.org', 'https://basescan.org', 'ETH', 'Ether', 1);


-- Migration 완료
-- Essential features: blockchain_networks, activity_feed, user_follows, collection_follows
-- Advanced features (sweep, portfolio, wallets) are in the .full backup file
