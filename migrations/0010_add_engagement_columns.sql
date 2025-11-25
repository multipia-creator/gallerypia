-- Add review columns to artworks table
ALTER TABLE artworks ADD COLUMN average_rating REAL DEFAULT 0;
ALTER TABLE artworks ADD COLUMN reviews_count INTEGER DEFAULT 0;
