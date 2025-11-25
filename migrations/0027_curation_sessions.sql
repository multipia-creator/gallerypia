-- 공동 큐레이션 세션 테이블
CREATE TABLE IF NOT EXISTS curation_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT,
  creator_user_id INTEGER NOT NULL,
  status TEXT DEFAULT 'active', -- active, closed, published
  visibility TEXT DEFAULT 'public', -- public, private, invite_only
  max_artworks INTEGER DEFAULT 20,
  voting_enabled INTEGER DEFAULT 1,
  deadline DATETIME,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (creator_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 큐레이션 세션 참여자
CREATE TABLE IF NOT EXISTS curation_participants (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  role TEXT DEFAULT 'contributor', -- creator, curator, contributor, viewer
  joined_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES curation_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(session_id, user_id)
);

-- 큐레이션 추천 작품
CREATE TABLE IF NOT EXISTS curation_artworks (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  session_id INTEGER NOT NULL,
  artwork_id INTEGER NOT NULL,
  recommended_by INTEGER NOT NULL,
  reason TEXT,
  vote_count INTEGER DEFAULT 0,
  order_position INTEGER DEFAULT 0,
  status TEXT DEFAULT 'pending', -- pending, approved, rejected
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (session_id) REFERENCES curation_sessions(id) ON DELETE CASCADE,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (recommended_by) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(session_id, artwork_id)
);

-- 큐레이션 작품 투표
CREATE TABLE IF NOT EXISTS curation_votes (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  curation_artwork_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  vote_type TEXT DEFAULT 'upvote', -- upvote, downvote
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (curation_artwork_id) REFERENCES curation_artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE(curation_artwork_id, user_id)
);

-- 실시간 활동 피드
CREATE TABLE IF NOT EXISTS activity_feed (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  activity_type TEXT NOT NULL, -- purchase, new_artwork, price_change, bid, evaluation, follow, comment
  user_id INTEGER,
  artwork_id INTEGER,
  target_user_id INTEGER,
  metadata TEXT, -- JSON 형태의 추가 정보
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (artwork_id) REFERENCES artworks(id) ON DELETE CASCADE,
  FOREIGN KEY (target_user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_curation_sessions_status ON curation_sessions(status);
CREATE INDEX IF NOT EXISTS idx_curation_sessions_creator ON curation_sessions(creator_user_id);
CREATE INDEX IF NOT EXISTS idx_curation_participants_session ON curation_participants(session_id);
CREATE INDEX IF NOT EXISTS idx_curation_participants_user ON curation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_curation_artworks_session ON curation_artworks(session_id);
CREATE INDEX IF NOT EXISTS idx_curation_votes_artwork ON curation_votes(curation_artwork_id);
CREATE INDEX IF NOT EXISTS idx_activity_feed_type ON activity_feed(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_feed_created ON activity_feed(created_at DESC);
