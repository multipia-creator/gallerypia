-- Update test users with correct bcrypt hash for 'Test1234!@#'
-- Hash: $2b$10$v3hTV5yR4XC8BcTDms0etOt6pc1uuHLiJ7BN59Qz9GD/4Gwf6k.DO

UPDATE users 
SET password_hash = '$2b$10$v3hTV5yR4XC8BcTDms0etOt6pc1uuHLiJ7BN59Qz9GD/4Gwf6k.DO'
WHERE email LIKE '%@test.com';

-- Verify update
SELECT 'Test users updated:' as status;
SELECT id, email, username, role, 
       SUBSTR(password_hash, 1, 20) || '...' as password_hash_preview
FROM users 
WHERE email LIKE '%@test.com' 
ORDER BY role;
