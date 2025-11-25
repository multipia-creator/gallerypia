-- 완전한 NFT 가치평가 시스템 스키마

-- 작품 내용 평가 필드 추가
ALTER TABLE artworks ADD COLUMN content_depth_score INTEGER DEFAULT 0; -- 내용성 (주제의식, 메시지)
ALTER TABLE artworks ADD COLUMN expression_score INTEGER DEFAULT 0; -- 표현성 (기법, 시각완성도)
ALTER TABLE artworks ADD COLUMN originality_innovation_score INTEGER DEFAULT 0; -- 독창성 (차별성, 혁신성)
ALTER TABLE artworks ADD COLUMN collection_value_score INTEGER DEFAULT 0; -- 소장가치 (시대적의미, 미래전망)

-- 저작권/소유권/라이선스 인증 필드
ALTER TABLE artworks ADD COLUMN blockchain_hash TEXT; -- 블록체인 원본 해시값
ALTER TABLE artworks ADD COLUMN copyright_registration_number TEXT; -- 저작권 등록번호
ALTER TABLE artworks ADD COLUMN license_type TEXT DEFAULT 'exclusive'; -- 라이선스 유형
ALTER TABLE artworks ADD COLUMN license_scope TEXT; -- 라이선스 범위
ALTER TABLE artworks ADD COLUMN certification_score INTEGER DEFAULT 0; -- 인증 점수

-- 전문가 평가 테이블
CREATE TABLE IF NOT EXISTS expert_evaluations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  expert_name TEXT NOT NULL,
  expert_level TEXT NOT NULL, -- 'curator', 'director', 'critic', 'phd'
  expert_institution TEXT,
  
  -- 평가 항목
  technique_mastery_score INTEGER DEFAULT 0, -- 기법 완성도
  art_historical_significance_score INTEGER DEFAULT 0, -- 예술사적 의미
  marketability_score INTEGER DEFAULT 0, -- 시장성
  development_potential_score INTEGER DEFAULT 0, -- 발전 가능성
  
  overall_score INTEGER DEFAULT 0,
  evaluation_comment TEXT,
  evaluated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

-- 대중 인지도/인기도 필드
ALTER TABLE artworks ADD COLUMN youtube_views INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN instagram_engagement INTEGER DEFAULT 0; -- 좋아요+댓글+공유
ALTER TABLE artworks ADD COLUMN platform_likes INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN platform_comments INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN platform_shares INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN google_trends_score INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN media_coverage_count INTEGER DEFAULT 0;
ALTER TABLE artworks ADD COLUMN popularity_score INTEGER DEFAULT 0; -- 인기도 종합 점수

-- 최종 가치 평가 관련
ALTER TABLE artworks ADD COLUMN artist_achievement_final_score INTEGER DEFAULT 0; -- 모듈1: 작가 업적
ALTER TABLE artworks ADD COLUMN artwork_content_final_score INTEGER DEFAULT 0; -- 모듈2: 작품 평가
ALTER TABLE artworks ADD COLUMN certification_final_score INTEGER DEFAULT 0; -- 모듈3: 인증
ALTER TABLE artworks ADD COLUMN expert_evaluation_final_score INTEGER DEFAULT 0; -- 모듈4: 전문가
ALTER TABLE artworks ADD COLUMN popularity_final_score INTEGER DEFAULT 0; -- 모듈5: 인기도

-- 가중치 설정 (기본값)
ALTER TABLE artworks ADD COLUMN weight_artist REAL DEFAULT 0.25; -- α1
ALTER TABLE artworks ADD COLUMN weight_artwork REAL DEFAULT 0.30; -- α2
ALTER TABLE artworks ADD COLUMN weight_certification REAL DEFAULT 0.15; -- α3
ALTER TABLE artworks ADD COLUMN weight_expert REAL DEFAULT 0.20; -- α4
ALTER TABLE artworks ADD COLUMN weight_popularity REAL DEFAULT 0.10; -- α5

ALTER TABLE artworks ADD COLUMN final_value_score REAL DEFAULT 0; -- 최종 가치 점수

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_artwork_id ON expert_evaluations(artwork_id);
CREATE INDEX IF NOT EXISTS idx_expert_evaluations_expert_level ON expert_evaluations(expert_level);
