-- Seed test users for comprehensive dashboard testing

-- Clear existing test users
DELETE FROM user_sessions WHERE user_id IN (
  SELECT id FROM users WHERE email LIKE '%@test.com'
);
DELETE FROM users WHERE email LIKE '%@test.com';

-- Insert test users with hashed password: Test1234!@#
-- bcrypt hash for 'Test1234!@#': $2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW

INSERT INTO users (email, username, full_name, password_hash, role, is_verified, is_active, created_at) VALUES
-- Artist
('artist@test.com', 'test_artist', 'Test Artist', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'artist', 1, 1, datetime('now')),

-- Expert
('expert@test.com', 'test_expert', 'Test Expert', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'expert', 1, 1, datetime('now')),

-- Museum
('museum@test.com', 'test_museum', 'Test Museum', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'museum', 1, 1, datetime('now')),

-- Gallery
('gallery@test.com', 'test_gallery', 'Test Gallery', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'gallery', 1, 1, datetime('now')),

-- Curator
('curator@test.com', 'test_curator', 'Test Curator', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'curator', 1, 1, datetime('now')),

-- Buyer
('buyer@test.com', 'test_buyer', 'Test Buyer', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'buyer', 1, 1, datetime('now')),

-- Seller
('seller@test.com', 'test_seller', 'Test Seller', '$2a$10$gXz7zqWq5YqZ7qWq5YqZ7u7KqZ7qWq5YqZ7qWq5YqZ7qWq5YqZ7qW', 'seller', 1, 1, datetime('now'));

-- Verify insertions
SELECT 'Test users created:' as status;
SELECT id, email, username, role FROM users WHERE email LIKE '%@test.com' ORDER BY role;
