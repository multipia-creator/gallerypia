-- 작가(Artists) 테이블
CREATE TABLE IF NOT EXISTS artists (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT UNIQUE,
  bio TEXT,
  career_years INTEGER DEFAULT 0,
  education TEXT,
  exhibitions_count INTEGER DEFAULT 0,
  awards_count INTEGER DEFAULT 0,
  profile_image TEXT,
  wallet_address TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 작품(Artworks) 테이블
CREATE TABLE IF NOT EXISTS artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL, -- 회화, 조각, 디지털아트, 사진 등
  technique TEXT, -- 기법
  size_width REAL, -- 가로 (cm)
  size_height REAL, -- 세로 (cm)
  size_depth REAL, -- 깊이 (cm)
  creation_year INTEGER,
  image_url TEXT NOT NULL,
  thumbnail_url TEXT,
  
  -- 가치산정 정량적 요소
  base_material_cost REAL DEFAULT 0, -- 재료비
  labor_hours REAL DEFAULT 0, -- 작업시간
  market_demand_score INTEGER DEFAULT 0, -- 시장 수요도 (0-100)
  rarity_score INTEGER DEFAULT 0, -- 희소성 점수 (0-100)
  
  -- 가치산정 정성적 요소
  artistic_quality_score INTEGER DEFAULT 0, -- 예술적 완성도 (0-100)
  originality_score INTEGER DEFAULT 0, -- 독창성 (0-100)
  cultural_significance_score INTEGER DEFAULT 0, -- 문화적 의미 (0-100)
  technical_excellence_score INTEGER DEFAULT 0, -- 기술적 우수성 (0-100)
  
  -- 최종 가치 산정
  estimated_value REAL DEFAULT 0, -- 산정된 가치 (KRW)
  min_price REAL DEFAULT 0, -- 최소 거래가
  current_price REAL DEFAULT 0, -- 현재 가격
  
  -- NFT 관련
  is_minted BOOLEAN DEFAULT 0,
  nft_token_id TEXT,
  nft_contract_address TEXT,
  blockchain_network TEXT, -- ethereum, polygon 등
  ipfs_hash TEXT,
  
  status TEXT DEFAULT 'draft', -- draft, pending_review, approved, minted, sold
  views_count INTEGER DEFAULT 0,
  likes_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- 가치 평가 이력(Valuation History) 테이블
CREATE TABLE IF NOT EXISTS valuation_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  evaluator_name TEXT,
  evaluator_role TEXT, -- expert, curator, collector 등
  
  -- 평가 점수
  artistic_quality INTEGER,
  originality INTEGER,
  cultural_significance INTEGER,
  technical_excellence INTEGER,
  market_potential INTEGER,
  
  estimated_value REAL,
  evaluation_notes TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- NFT 거래 이력(Transactions) 테이블
CREATE TABLE IF NOT EXISTS transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  transaction_type TEXT NOT NULL, -- mint, sale, transfer, bid
  from_address TEXT,
  to_address TEXT,
  price REAL,
  currency TEXT DEFAULT 'ETH',
  transaction_hash TEXT,
  blockchain_network TEXT,
  gas_fee REAL,
  status TEXT DEFAULT 'pending', -- pending, completed, failed
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- 컬렉션(Collections) 테이블
CREATE TABLE IF NOT EXISTS collections (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  curator_name TEXT,
  cover_image TEXT,
  artwork_count INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 컬렉션-작품 연결 테이블
CREATE TABLE IF NOT EXISTS collection_artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  collection_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  display_order INTEGER DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (collection_id) REFERENCES collections(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- 사용자 좋아요 테이블
CREATE TABLE IF NOT EXISTS likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  user_address TEXT NOT NULL,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  UNIQUE(artwork_id, user_address)
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_artworks_artist_id ON artworks(artist_id);
CREATE INDEX IF NOT EXISTS idx_artworks_category ON artworks(category);
CREATE INDEX IF NOT EXISTS idx_artworks_status ON artworks(status);
CREATE INDEX IF NOT EXISTS idx_artworks_is_minted ON artworks(is_minted);
CREATE INDEX IF NOT EXISTS idx_artworks_estimated_value ON artworks(estimated_value);
CREATE INDEX IF NOT EXISTS idx_artists_email ON artists(email);
CREATE INDEX IF NOT EXISTS idx_transactions_artwork_id ON transactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_valuation_history_artwork_id ON valuation_history(artwork_id);
CREATE INDEX IF NOT EXISTS idx_collection_artworks_collection_id ON collection_artworks(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_artworks_artwork_id ON collection_artworks(artwork_id);
CREATE INDEX IF NOT EXISTS idx_likes_artwork_id ON likes(artwork_id);
