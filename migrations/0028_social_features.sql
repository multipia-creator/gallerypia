-- 팔로우 관계 테이블
CREATE TABLE IF NOT EXISTS user_follows (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  follower_user_id INTEGER NOT NULL, -- 팔로우하는 사람
  following_user_id INTEGER NOT NULL, -- 팔로우 받는 사람
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (follower_user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (following_user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(follower_user_id, following_user_id)
);

-- 작품 댓글 테이블
CREATE TABLE IF NOT EXISTS artwork_comments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  parent_comment_id INTEGER, -- 대댓글인 경우
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  is_edited INTEGER DEFAULT 0,
  is_deleted INTEGER DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (parent_comment_id) REFERENCES artwork_comments(id) ON DELETE CASCADE
);

-- 댓글 좋아요 테이블
CREATE TABLE IF NOT EXISTS comment_likes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  comment_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (comment_id) REFERENCES artwork_comments(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(comment_id, user_id)
);

-- 공유 추적 테이블
CREATE TABLE IF NOT EXISTS artwork_shares (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  artwork_id INTEGER NOT NULL,
  user_id INTEGER,
  share_type TEXT NOT NULL, -- twitter, facebook, instagram, link, other
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 사용자 소셜 통계 (캐시용)
CREATE TABLE IF NOT EXISTS user_social_stats (
  user_id INTEGER PRIMARY KEY,
  followers_count INTEGER DEFAULT 0,
  following_count INTEGER DEFAULT 0,
  artworks_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  likes_received_count INTEGER DEFAULT 0,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_follows_follower ON user_follows(follower_user_id);
CREATE INDEX IF NOT EXISTS idx_user_follows_following ON user_follows(following_user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_comments_artwork ON artwork_comments(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_comments_user ON artwork_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_artwork_comments_parent ON artwork_comments(parent_comment_id);
CREATE INDEX IF NOT EXISTS idx_comment_likes_comment ON comment_likes(comment_id);
CREATE INDEX IF NOT EXISTS idx_artwork_shares_artwork ON artwork_shares(artwork_id);
CREATE INDEX IF NOT EXISTS idx_artwork_shares_type ON artwork_shares(share_type);
