-- Create admin user in production (remote) database
-- Password: admin123!@# (bcrypt hash: $2b$10$YQq3z.YqXH8RgJ4KvYXyxeMqRvZ4ZjZY9YhQzH1Y8QJ7ZH6vWJY8y)

INSERT OR REPLACE INTO users (
  email, 
  username, 
  password_hash, 
  role, 
  status, 
  email_verified,
  created_at
) VALUES (
  'admin@gallerypia.com',
  'AdminUser',
  '$2b$10$YQq3z.YqXH8RgJ4KvYXyxeMqRvZ4ZjZY9YhQzH1Y8QJ7ZH6vWJY8y',
  'admin',
  'active',
  1,
  datetime('now')
);

-- Verify
SELECT id, email, username, role, status FROM users WHERE email = 'admin@gallerypia.com';
