-- Migration 0013: Artist Rank Framework
-- NFT 미술작품 가치 평가 랭크 프레임워크 시스템

-- 1. 전시회 경력 테이블
CREATE TABLE IF NOT EXISTS artist_exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  exhibition_type TEXT NOT NULL, -- international_biennale, international_solo, international_2person, international_3person, international_group, domestic_biennale, domestic_solo, domestic_2person, domestic_3person, domestic_group, other
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT,
  start_date DATE NOT NULL,
  end_date DATE,
  is_famous_venue BOOLEAN DEFAULT 0, -- 유명 전시회 여부 (+/-10%)
  proof_document_url TEXT, -- 도록, 팸플릿 등 증빙서류
  points REAL DEFAULT 0, -- 자동 계산된 점수
  status TEXT DEFAULT 'pending', -- pending, verified, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  verified_by INTEGER, -- 검증자 user_id
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_artist ON artist_exhibitions(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_type ON artist_exhibitions(exhibition_type);

-- 2. 수상 경력 테이블
CREATE TABLE IF NOT EXISTS artist_awards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  award_rank INTEGER NOT NULL, -- 1: 1순위(대상/최우수), 2: 2순위, 3: 3순위, 4: 입선
  award_name TEXT NOT NULL,
  competition_name TEXT NOT NULL,
  organizer TEXT NOT NULL,
  award_date DATE NOT NULL,
  is_international BOOLEAN DEFAULT 0, -- 국제 수상 여부 (+/-10%)
  certificate_url TEXT, -- 수상증명서(상장)
  proof_url TEXT, -- 출품증명서
  points REAL DEFAULT 0, -- 자동 계산된 점수
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  verified_by INTEGER,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_awards_artist ON artist_awards(artist_id);

-- 3. 저작권 등록 테이블
CREATE TABLE IF NOT EXISTS artist_copyrights (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  artwork_title TEXT NOT NULL,
  registration_number TEXT NOT NULL, -- 등록번호
  registration_agency TEXT NOT NULL, -- 한국저작권위원회 등
  registration_date DATE NOT NULL,
  certificate_url TEXT NOT NULL, -- 저작권등록증
  country TEXT DEFAULT 'KR', -- 국가
  points REAL DEFAULT 30, -- 기본 30점
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  verified_by INTEGER,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_copyrights_artist ON artist_copyrights(artist_id);

-- 4. 전시기획 경력 테이블
CREATE TABLE IF NOT EXISTS artist_curations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  curation_type TEXT NOT NULL, -- international_biennale, international_museum, international_group, domestic_biennale, domestic_museum, domestic_group
  exhibition_title TEXT NOT NULL,
  location TEXT NOT NULL,
  organizer TEXT NOT NULL,
  role TEXT NOT NULL, -- 큐레이터, 총괄기획, 아트디렉터, 총감독
  start_date DATE NOT NULL,
  end_date DATE,
  is_director BOOLEAN DEFAULT 0, -- 총괄기획/아트디렉터 여부 (+10%)
  proof_document_url TEXT,
  points REAL DEFAULT 0,
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  verified_by INTEGER,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_curations_artist ON artist_curations(artist_id);

-- 5. 논문 및 저서 테이블
CREATE TABLE IF NOT EXISTS artist_publications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  publication_type TEXT NOT NULL, -- book, sci_paper, kci_paper
  title TEXT NOT NULL,
  publisher TEXT,
  publication_date DATE NOT NULL,
  isbn_or_doi TEXT, -- ISBN 또는 DOI
  proof_url TEXT, -- 증빙서류
  points REAL DEFAULT 0, -- book: +30%, sci: +20-30%, kci: +10-20%
  status TEXT DEFAULT 'pending',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verified_at DATETIME,
  verified_by INTEGER,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_publications_artist ON artist_publications(artist_id);

-- 6. 아티스트 랭크 테이블 (계산 결과 저장)
CREATE TABLE IF NOT EXISTS artist_ranks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL UNIQUE,
  
  -- 정량평가 (40%)
  quantitative_exhibitions_score REAL DEFAULT 0, -- 전시회 점수
  quantitative_awards_score REAL DEFAULT 0, -- 수상 점수
  quantitative_copyrights_score REAL DEFAULT 0, -- 저작권 점수
  quantitative_curations_score REAL DEFAULT 0, -- 전시기획 점수
  quantitative_publications_score REAL DEFAULT 0, -- 논문/저서 점수
  quantitative_total_score REAL DEFAULT 0, -- 정량평가 총점
  quantitative_weighted_score REAL DEFAULT 0, -- 정량평가 가중치 적용 (40%)
  
  -- 정성평가 (30%) - 전문가 평가
  qualitative_content_score REAL DEFAULT 0, -- 내용성 (창작 컨셉, 스토리)
  qualitative_expression_score REAL DEFAULT 0, -- 표현성 (커뮤니케이션, 기술)
  qualitative_originality_score REAL DEFAULT 0, -- 독창성 (유일성, 희귀성)
  qualitative_collection_score REAL DEFAULT 0, -- 소장가치 (투자가치, 이력)
  qualitative_sales_bonus REAL DEFAULT 0, -- 판매 가중치
  qualitative_total_score REAL DEFAULT 0, -- 정성평가 총점
  qualitative_weighted_score REAL DEFAULT 0, -- 정성평가 가중치 적용 (30%)
  
  -- 인기도 평가 (30%)
  popularity_youtube_views INTEGER DEFAULT 0,
  popularity_youtube_score REAL DEFAULT 0,
  popularity_opensea_views INTEGER DEFAULT 0,
  popularity_opensea_score REAL DEFAULT 0,
  popularity_platform_views INTEGER DEFAULT 0,
  popularity_platform_score REAL DEFAULT 0,
  popularity_total_score REAL DEFAULT 0, -- 인기도 총점
  popularity_weighted_score REAL DEFAULT 0, -- 인기도 가중치 적용 (30%)
  
  -- 최종 랭크
  final_score REAL DEFAULT 0, -- 최종 점수 (100%)
  rank_tier TEXT DEFAULT 'G', -- SS, S, A, B, C, D, E, F, G
  rank_grade TEXT DEFAULT 'B', -- S(매우우수), A(우수), B(보통)
  rank_category TEXT DEFAULT 'emerging', -- master(최우수), excellent(우수), professional(전문), emerging(신진)
  
  -- 메타 정보
  last_calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  calculation_count INTEGER DEFAULT 0,
  
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_ranks_score ON artist_ranks(final_score DESC);
CREATE INDEX IF NOT EXISTS idx_artist_ranks_tier ON artist_ranks(rank_tier);

-- 7. 랭크 계산 히스토리 (변경 추적)
CREATE TABLE IF NOT EXISTS artist_rank_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  previous_rank_tier TEXT,
  previous_rank_grade TEXT,
  previous_score REAL,
  new_rank_tier TEXT NOT NULL,
  new_rank_grade TEXT NOT NULL,
  new_score REAL NOT NULL,
  change_reason TEXT, -- 전시회 추가, 수상, 전문가 평가 등
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_artist_rank_history_artist ON artist_rank_history(artist_id);

-- 8. 전문가 정성평가 테이블
CREATE TABLE IF NOT EXISTS artist_qualitative_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  artwork_id INTEGER, -- 특정 작품 평가 시
  evaluator_id INTEGER NOT NULL, -- 평가위원
  evaluator_rank TEXT NOT NULL, -- S, A, B, C (평가위원 랭크)
  
  -- 평가 점수 (각 100점 만점)
  content_concept_score REAL DEFAULT 0, -- 창작 컨셉 및 의도
  content_story_score REAL DEFAULT 0, -- 창작 스토리
  expression_communication_score REAL DEFAULT 0, -- 커뮤니케이션
  expression_technical_score REAL DEFAULT 0, -- 시각적 조형요소, 기술적 표현
  originality_uniqueness_score REAL DEFAULT 0, -- 유일성, 희귀성
  originality_differentiation_score REAL DEFAULT 0, -- 차별성, 참신성
  collection_economic_value_score REAL DEFAULT 0, -- 투자 및 경제적 가치
  collection_history_score REAL DEFAULT 0, -- 소장 이력
  
  total_score REAL DEFAULT 0, -- 총점 (800점 만점)
  
  -- 메타 정보
  comments TEXT, -- 평가 의견
  evaluation_date DATETIME DEFAULT CURRENT_TIMESTAMP,
  status TEXT DEFAULT 'completed', -- pending, completed
  
  FOREIGN KEY (artist_id) REFERENCES users(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_qualitative_evaluations_artist ON artist_qualitative_evaluations(artist_id);
CREATE INDEX IF NOT EXISTS idx_qualitative_evaluations_evaluator ON artist_qualitative_evaluations(evaluator_id);

-- 9. 판매 이력 테이블 (인기도 및 정성평가 가중치용)
CREATE TABLE IF NOT EXISTS artwork_sales_history (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  artist_id INTEGER NOT NULL,
  sale_platform TEXT NOT NULL, -- artfair, opensea, auction, gallery
  sale_date DATE NOT NULL,
  sale_price REAL, -- ETH 또는 USD
  currency TEXT DEFAULT 'ETH',
  buyer_id INTEGER, -- 구매자
  proof_url TEXT, -- 판매 증빙
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  FOREIGN KEY (artist_id) REFERENCES users(id),
  FOREIGN KEY (buyer_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_sales_history_artist ON artwork_sales_history(artist_id);
CREATE INDEX IF NOT EXISTS idx_sales_history_artwork ON artwork_sales_history(artwork_id);

-- 10. users 테이블에 평가위원 관련 컬럼 추가
ALTER TABLE users ADD COLUMN evaluator_rank TEXT; -- S, A, B, C (평가위원 등급)
ALTER TABLE users ADD COLUMN evaluator_status TEXT DEFAULT 'inactive'; -- active, inactive
ALTER TABLE users ADD COLUMN evaluator_qualification TEXT; -- 평가위원 자격 정보
ALTER TABLE users ADD COLUMN evaluator_approved_at DATETIME; -- 평가위원 승인일

-- 샘플 데이터는 API를 통해 추가됩니다
