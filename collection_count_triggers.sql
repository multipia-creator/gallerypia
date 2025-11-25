-- Triggers to automatically update collection artwork_count

-- Trigger 1: When artwork is added to collection
CREATE TRIGGER IF NOT EXISTS update_collection_count_on_insert
AFTER INSERT ON collection_artworks
BEGIN
    UPDATE collections 
    SET artwork_count = (
        SELECT COUNT(*) 
        FROM collection_artworks 
        WHERE collection_id = NEW.collection_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.collection_id;
END;

-- Trigger 2: When artwork is removed from collection
CREATE TRIGGER IF NOT EXISTS update_collection_count_on_delete
AFTER DELETE ON collection_artworks
BEGIN
    UPDATE collections 
    SET artwork_count = (
        SELECT COUNT(*) 
        FROM collection_artworks 
        WHERE collection_id = OLD.collection_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.collection_id;
END;

-- Trigger 3: When artwork is moved to another collection
CREATE TRIGGER IF NOT EXISTS update_collection_count_on_update
AFTER UPDATE ON collection_artworks
WHEN OLD.collection_id != NEW.collection_id
BEGIN
    -- Update old collection
    UPDATE collections 
    SET artwork_count = (
        SELECT COUNT(*) 
        FROM collection_artworks 
        WHERE collection_id = OLD.collection_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = OLD.collection_id;
    
    -- Update new collection
    UPDATE collections 
    SET artwork_count = (
        SELECT COUNT(*) 
        FROM collection_artworks 
        WHERE collection_id = NEW.collection_id
    ),
    updated_at = CURRENT_TIMESTAMP
    WHERE id = NEW.collection_id;
END;
