-- Create admin user in production (remote) database
-- Password: admin123!@# (bcrypt hash: $2b$10$YQq3z.YqXH8RgJ4KvYXyxeMqRvZ4ZjZY9YhQzH1Y8QJ7ZH6vWJY8y)

INSERT OR REPLACE INTO users (
  email, 
  username, 
  full_name,
  password_hash, 
  role, 
  is_active,
  is_verified,
  created_at
) VALUES (
  'admin@gallerypia.com',
  'AdminUser',
  'System Administrator',
  '$2b$10$YQq3z.YqXH8RgJ4KvYXyxeMqRvZ4ZjZY9YhQzH1Y8QJ7ZH6vWJY8y',
  'admin',
  1,
  1,
  datetime('now')
);

-- Verify
SELECT id, email, username, role, is_active, is_verified FROM users WHERE email = 'admin@gallerypia.com';
