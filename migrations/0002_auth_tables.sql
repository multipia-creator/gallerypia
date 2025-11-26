-- 사용자 세션 테이블
CREATE TABLE IF NOT EXISTS user_sessions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  session_token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 비밀번호 재설정 토큰 테이블
CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL,
  reset_token TEXT NOT NULL UNIQUE,
  expires_at DATETIME NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX IF NOT EXISTS idx_user_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_sessions_expires_at ON user_sessions(expires_at);

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(reset_token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);
