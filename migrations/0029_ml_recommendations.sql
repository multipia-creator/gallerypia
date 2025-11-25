-- L3-4: ML-Based Recommendation System Tables

-- 사용자-작품 인터랙션 추적 테이블
CREATE TABLE IF NOT EXISTS user_artwork_interactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER, -- NULL for anonymous users
  artwork_id INTEGER NOT NULL,
  interaction_type TEXT NOT NULL, -- 'view', 'like', 'purchase', 'share'
  metadata TEXT, -- JSON: duration, source, device, etc.
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id)
);

CREATE INDEX IF NOT EXISTS idx_interactions_user ON user_artwork_interactions(user_id);
CREATE INDEX IF NOT EXISTS idx_interactions_artwork ON user_artwork_interactions(artwork_id);
CREATE INDEX IF NOT EXISTS idx_interactions_type ON user_artwork_interactions(interaction_type);
CREATE INDEX IF NOT EXISTS idx_interactions_created ON user_artwork_interactions(created_at);

-- 추천 알고리즘 성능 모니터링 테이블
CREATE TABLE IF NOT EXISTS recommendation_metrics (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  algorithm_type TEXT NOT NULL, -- 'collaborative', 'content_based', 'hybrid', 'trending'
  recommended_artwork_ids TEXT NOT NULL, -- JSON array
  clicked_artwork_ids TEXT, -- JSON array
  click_through_rate REAL, -- CTR
  generated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE INDEX IF NOT EXISTS idx_recommendation_metrics_user ON recommendation_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_recommendation_metrics_algorithm ON recommendation_metrics(algorithm_type);
CREATE INDEX IF NOT EXISTS idx_recommendation_metrics_generated ON recommendation_metrics(generated_at);

-- 작품 유사도 캐시 테이블 (성능 최적화)
CREATE TABLE IF NOT EXISTS artwork_similarity_cache (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  similar_artwork_id INTEGER NOT NULL,
  similarity_score REAL NOT NULL,
  similarity_factors TEXT, -- JSON: category_match, artist_match, price_match, etc.
  calculated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(artwork_id, similar_artwork_id),
  FOREIGN KEY (artwork_id) REFERENCES artworks(id),
  FOREIGN KEY (similar_artwork_id) REFERENCES artworks(id)
);

CREATE INDEX IF NOT EXISTS idx_similarity_artwork ON artwork_similarity_cache(artwork_id);
CREATE INDEX IF NOT EXISTS idx_similarity_score ON artwork_similarity_cache(similarity_score);
