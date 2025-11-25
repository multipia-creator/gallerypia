-- 논문 기반 NFT 미술작품 가치평가 시스템
-- 출처: "미술품 가치 기반의 NFT 프레임워크 연구"

-- ============================================================
-- 모듈 1: 작가 업적 평가 (α1 = 0.25)
-- ============================================================
-- 작가업적점수 = ∑(전시점수 × 권위도가중치 × 최신성계수)

-- 전시 이력 테이블
CREATE TABLE IF NOT EXISTS artist_exhibitions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  exhibition_type TEXT NOT NULL, -- 'solo' (개인전), 'group' (단체전)
  exhibition_name TEXT NOT NULL,
  venue_name TEXT, -- 전시 장소
  authority_level INTEGER DEFAULT 3, -- 권위도 (1~5: 5가 최고)
  start_date DATE,
  end_date DATE,
  exhibition_year INTEGER,
  recency_coefficient REAL DEFAULT 1.0, -- 최신성 계수 (1.0 ~ 0.5)
  exhibition_score INTEGER DEFAULT 0, -- 전시 점수
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- 공모전 수상 이력 테이블
CREATE TABLE IF NOT EXISTS artist_awards (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artist_id INTEGER NOT NULL,
  award_name TEXT NOT NULL,
  competition_name TEXT,
  award_rank TEXT, -- '대상', '금상', '은상', '동상', '입선'
  authority_level INTEGER DEFAULT 3, -- 권위도 (1~5)
  award_year INTEGER,
  recency_coefficient REAL DEFAULT 1.0,
  award_score INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artist_id) REFERENCES artists(id)
);

-- 작가 업적 최종 점수 필드
ALTER TABLE artists ADD COLUMN total_exhibitions INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN solo_exhibitions INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN group_exhibitions INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN total_awards INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN artist_achievement_score REAL DEFAULT 0; -- 모듈1 최종 점수 (0~100)

-- ============================================================
-- 모듈 2: 작품 내용 평가 (α2 = 0.30)
-- ============================================================
-- 4가지 정성 지표: 내용성, 표현성, 독창성, 소장가치

CREATE TABLE IF NOT EXISTS artwork_content_evaluation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- 1) 내용성 (주제 의식, 사회적 메시지 깊이)
  content_depth_score INTEGER DEFAULT 0, -- 0~25점
  content_comment TEXT,
  
  -- 2) 표현성 (기법 숙련도, 시각 완성도)
  expression_score INTEGER DEFAULT 0, -- 0~25점
  expression_comment TEXT,
  
  -- 3) 독창성 (차별성, 혁신성)
  originality_score INTEGER DEFAULT 0, -- 0~25점
  originality_comment TEXT,
  
  -- 4) 소장가치 (시대적 의미, 미래 전망)
  collection_value_score INTEGER DEFAULT 0, -- 0~25점
  collection_value_comment TEXT,
  
  -- 모듈2 최종 점수 (0~100)
  artwork_content_final_score INTEGER DEFAULT 0,
  
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- ============================================================
-- 모듈 3: 저작권·소유권·라이선스 인증 (α3 = 0.20)
-- ============================================================
-- 블록체인 해시, 저작권 등록번호, 라이선스 정보

CREATE TABLE IF NOT EXISTS artwork_certification (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- 블록체인 원본성 보증
  blockchain_hash TEXT, -- IPFS 해시 또는 블록체인 해시값
  blockchain_network TEXT, -- 'ethereum', 'polygon', 'klaytn'
  transaction_hash TEXT, -- 민팅 트랜잭션 해시
  
  -- 저작권 등록 정보
  copyright_registered BOOLEAN DEFAULT FALSE,
  copyright_registration_number TEXT, -- 한국저작권위원회 등록번호
  copyright_registration_date DATE,
  
  -- 라이선스 정보
  license_type TEXT DEFAULT 'exclusive', -- 'exclusive', 'non-exclusive', 'creative_commons'
  license_scope TEXT, -- 'commercial', 'personal', 'educational'
  license_details TEXT,
  
  -- 소유권 이전 기록 (분산 원장 저장)
  ownership_transfer_count INTEGER DEFAULT 0,
  
  -- 모듈3 최종 점수 (0~100)
  certification_score REAL DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- ============================================================
-- 모듈 4: 전문가 정성 평가 (α4 = 0.15)
-- ============================================================
-- 미술관 학예사, 갤러리 디렉터, 미술 비평가, 대학원 전공자

CREATE TABLE IF NOT EXISTS expert_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  expert_name TEXT NOT NULL,
  expert_level TEXT NOT NULL, -- 'curator' (학예사), 'director' (디렉터), 'critic' (비평가), 'graduate' (대학원생)
  expert_institution TEXT, -- 소속 기관
  expert_weight REAL DEFAULT 1.0, -- 전문가 등급별 가중치 (curator: 1.5, director: 1.3, critic: 1.2, graduate: 1.0)
  
  -- 4가지 평가 항목
  technique_mastery_score INTEGER DEFAULT 0, -- 기법 완성도 (0~25)
  art_historical_significance_score INTEGER DEFAULT 0, -- 예술사적 의미 (0~25)
  marketability_score INTEGER DEFAULT 0, -- 시장성 (0~25)
  development_potential_score INTEGER DEFAULT 0, -- 발전 가능성 (0~25)
  
  overall_score INTEGER DEFAULT 0, -- 종합 점수 (0~100)
  evaluation_comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- ============================================================
-- 모듈 5: 대중 인지도 및 인기도 평가 (α5 = 0.10)
-- ============================================================
-- YouTube, Instagram, 플랫폼 반응, Google Trends, 언론 보도

CREATE TABLE IF NOT EXISTS artwork_popularity (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- SNS 지표
  youtube_views INTEGER DEFAULT 0,
  youtube_likes INTEGER DEFAULT 0,
  instagram_likes INTEGER DEFAULT 0,
  instagram_comments INTEGER DEFAULT 0,
  instagram_shares INTEGER DEFAULT 0,
  instagram_engagement INTEGER DEFAULT 0, -- 좋아요+댓글+공유
  
  -- 플랫폼 내 활동
  platform_likes INTEGER DEFAULT 0,
  platform_comments INTEGER DEFAULT 0,
  platform_shares INTEGER DEFAULT 0,
  platform_views INTEGER DEFAULT 0,
  
  -- Google Trends 검색량
  google_trends_score INTEGER DEFAULT 0, -- 0~100
  
  -- 언론 보도
  media_coverage_count INTEGER DEFAULT 0, -- 보도 빈도
  major_media_count INTEGER DEFAULT 0, -- 주요 언론 보도 수
  
  -- 모듈5 최종 점수 (0~100)
  popularity_final_score REAL DEFAULT 0,
  
  last_updated DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- ============================================================
-- 최종 가치 통합 계산 테이블
-- ============================================================
-- 최종가치점수 = α1×작가업적점수 + α2×작품평가점수 + α3×인증점수 + α4×전문가점수 + α5×인기도점수

CREATE TABLE IF NOT EXISTS artwork_final_valuation (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL UNIQUE,
  
  -- 5개 모듈 점수 (각 0~100)
  module1_artist_achievement REAL DEFAULT 0, -- 작가 업적
  module2_artwork_content REAL DEFAULT 0, -- 작품 내용
  module3_certification REAL DEFAULT 0, -- 저작권 인증
  module4_expert_evaluation REAL DEFAULT 0, -- 전문가 평가
  module5_popularity REAL DEFAULT 0, -- 대중 인기도
  
  -- 가중치 (논문 기본값)
  weight_alpha1 REAL DEFAULT 0.25, -- 작가 업적 가중치
  weight_alpha2 REAL DEFAULT 0.30, -- 작품 평가 가중치
  weight_alpha3 REAL DEFAULT 0.20, -- 인증 가중치
  weight_alpha4 REAL DEFAULT 0.15, -- 전문가 평가 가중치
  weight_alpha5 REAL DEFAULT 0.10, -- 인기도 가중치
  
  -- 최종 가치 점수 (0~100)
  final_value_score REAL DEFAULT 0,
  
  -- 추천 가격 범위 (단위: 원)
  recommended_price_min INTEGER DEFAULT 0,
  recommended_price_max INTEGER DEFAULT 0,
  recommended_price_avg INTEGER DEFAULT 0,
  
  -- Art Value Index (AVI)
  art_value_index REAL DEFAULT 0, -- 0~1000
  
  -- 시장 투명도 지수
  market_transparency_index REAL DEFAULT 0, -- 0~100
  
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE
);

-- ============================================================
-- 인덱스 생성 (성능 최적화)
-- ============================================================

CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_artist_id ON artist_exhibitions(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_exhibitions_year ON artist_exhibitions(exhibition_year);
CREATE INDEX IF NOT EXISTS idx_artist_awards_artist_id ON artist_awards(artist_id);
CREATE INDEX IF NOT EXISTS idx_artist_awards_year ON artist_awards(award_year);

CREATE INDEX IF NOT EXISTS idx_artwork_content_evaluation_artwork_id ON artwork_content_evaluation(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_certification_artwork_id ON artwork_certification(artwork_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_artwork_id ON expert_evaluations(artwork_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_expert_level ON expert_evaluations(expert_level);
CREATE INDEX IF NOT EXISTS idx_artwork_popularity_artwork_id ON artwork_popularity(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_final_valuation_artwork_id ON artwork_final_valuation(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_final_valuation_score ON artwork_final_valuation(final_value_score);

-- ============================================================
-- 뷰 생성 (통합 조회용)
-- ============================================================

CREATE VIEW IF NOT EXISTS v_artwork_valuation_summary AS
SELECT 
  a.id AS artwork_id,
  a.title AS artwork_title,
  ar.name AS artist_name,
  ar.artist_achievement_score,
  afv.module1_artist_achievement,
  afv.module2_artwork_content,
  afv.module3_certification,
  afv.module4_expert_evaluation,
  afv.module5_popularity,
  afv.final_value_score,
  afv.recommended_price_avg,
  afv.art_value_index,
  afv.market_transparency_index,
  afv.calculated_at
FROM artworks a
LEFT JOIN artists ar ON a.artist_id = ar.id
LEFT JOIN artwork_final_valuation afv ON a.id = afv.artwork_id
WHERE a.status IN ('approved', 'minted', 'sold');
