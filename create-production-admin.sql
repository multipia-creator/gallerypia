-- Create production admin user for gallerypia.pages.dev
-- Password: Test1234!@# 
-- Hash: $2b$10$v3hTV5yR4XC8BcTDms0etOt6pc1uuHLiJ7BN59Qz9GD/4Gwf6k.DO

-- Check if admin user exists
SELECT 'Checking existing admin users...' as status;
SELECT id, email, username, role FROM users WHERE role = 'admin';

-- Create or update admin user
INSERT INTO users (
    email, 
    username, 
    full_name, 
    password_hash, 
    role, 
    is_verified, 
    is_active, 
    created_at
) VALUES (
    'admin@gallerypia.com',
    'admin',
    'System Administrator',
    '$2b$10$v3hTV5yR4XC8BcTDms0etOt6pc1uuHLiJ7BN59Qz9GD/4Gwf6k.DO',
    'admin',
    1,
    1,
    datetime('now')
)
ON CONFLICT(email) DO UPDATE SET
    password_hash = '$2b$10$v3hTV5yR4XC8BcTDms0etOt6pc1uuHLiJ7BN59Qz9GD/4Gwf6k.DO',
    role = 'admin',
    is_active = 1,
    is_verified = 1;

-- Verify admin user
SELECT 'Admin user created/updated:' as status;
SELECT id, email, username, role, is_active, is_verified 
FROM users 
WHERE email = 'admin@gallerypia.com';
