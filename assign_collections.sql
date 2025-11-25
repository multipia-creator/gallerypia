-- Assign artworks to collections
-- This will populate collection_artworks table and update artwork_count

-- Collection 1: Legendary NFT Masters (artworks 1-10)
INSERT INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(1, 6, 6),
(1, 7, 7),
(1, 8, 8),
(1, 9, 9),
(1, 10, 10);

-- Collection 2: K-Art Digital (artworks 11-18)
INSERT INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(2, 11, 1),
(2, 12, 2),
(2, 13, 3),
(2, 14, 4),
(2, 15, 5),
(2, 16, 6),
(2, 17, 7),
(2, 18, 8);

-- Collection 3: CryptoPunks & Apes (artworks 19-25)
INSERT INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(3, 19, 1),
(3, 20, 2),
(3, 21, 3),
(3, 22, 4),
(3, 23, 5),
(3, 24, 6),
(3, 25, 7);

-- Collection 4: Modern Digital Art (artworks 26-31)
INSERT INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(4, 26, 1),
(4, 27, 2),
(4, 28, 3),
(4, 29, 4),
(4, 30, 5),
(4, 31, 6);

-- Update artwork_count for each collection
UPDATE collections SET artwork_count = 10, updated_at = CURRENT_TIMESTAMP WHERE id = 1;
UPDATE collections SET artwork_count = 8, updated_at = CURRENT_TIMESTAMP WHERE id = 2;
UPDATE collections SET artwork_count = 7, updated_at = CURRENT_TIMESTAMP WHERE id = 3;
UPDATE collections SET artwork_count = 6, updated_at = CURRENT_TIMESTAMP WHERE id = 4;
