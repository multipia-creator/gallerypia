-- Assign artworks to collections for production (21 artworks only)

-- Collection 1: Legendary NFT Masters (artworks 1-8)
INSERT OR IGNORE INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(1, 1, 1),
(1, 2, 2),
(1, 3, 3),
(1, 4, 4),
(1, 5, 5),
(1, 6, 6),
(1, 7, 7),
(1, 8, 8);

-- Collection 2: K-Art Digital (artworks 9-14)
INSERT OR IGNORE INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(2, 9, 1),
(2, 10, 2),
(2, 11, 3),
(2, 12, 4),
(2, 13, 5),
(2, 14, 6);

-- Collection 3: CryptoPunks & Apes (artworks 15-18)
INSERT OR IGNORE INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(3, 15, 1),
(3, 16, 2),
(3, 17, 3),
(3, 18, 4);

-- Collection 4: Modern Digital Art (artworks 19-21)
INSERT OR IGNORE INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
(4, 19, 1),
(4, 20, 2),
(4, 21, 3);

-- Update artwork_count for each collection
UPDATE collections SET artwork_count = 8, updated_at = CURRENT_TIMESTAMP WHERE id = 1;
UPDATE collections SET artwork_count = 6, updated_at = CURRENT_TIMESTAMP WHERE id = 2;
UPDATE collections SET artwork_count = 4, updated_at = CURRENT_TIMESTAMP WHERE id = 3;
UPDATE collections SET artwork_count = 3, updated_at = CURRENT_TIMESTAMP WHERE id = 4;
