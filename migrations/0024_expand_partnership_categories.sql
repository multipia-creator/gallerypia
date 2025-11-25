-- Migration: Expand Partnership System to Support Museums, Galleries, and Art Dealers
-- Version: 8.41
-- Date: 2025-11-17
-- Description: Add partner_category field to support multiple partner types

-- Add partner_category to museum_partnership_applications
ALTER TABLE museum_partnership_applications ADD COLUMN partner_category TEXT DEFAULT 'museum' CHECK(partner_category IN ('museum', 'gallery', 'art_dealer'));

-- Add partner_category to museum_partners
ALTER TABLE museum_partners ADD COLUMN partner_category TEXT DEFAULT 'museum' CHECK(partner_category IN ('museum', 'gallery', 'art_dealer'));

-- Update existing records to have 'museum' category
UPDATE museum_partnership_applications SET partner_category = 'museum' WHERE partner_category IS NULL;
UPDATE museum_partners SET partner_category = 'museum' WHERE partner_category IS NULL;

-- Create index for faster filtering by partner category
CREATE INDEX IF NOT EXISTS idx_partnership_applications_category ON museum_partnership_applications(partner_category);
CREATE INDEX IF NOT EXISTS idx_museum_partners_category ON museum_partners(partner_category);

-- Update pending_partnership_applications view to include partner_category
DROP VIEW IF EXISTS pending_partnership_applications;
CREATE VIEW pending_partnership_applications AS
SELECT 
    id,
    applicant_name,
    applicant_email,
    museum_name,
    museum_type,
    partner_category,
    partnership_reason,
    application_status,
    submitted_at,
    reviewed_at,
    CAST((julianday('now') - julianday(submitted_at)) AS INTEGER) as days_pending
FROM museum_partnership_applications
WHERE application_status = 'submitted'
ORDER BY submitted_at DESC;

-- Create view for approved partners by category
CREATE VIEW IF NOT EXISTS partners_by_category AS
SELECT 
    partner_category,
    COUNT(*) as partner_count,
    COUNT(CASE WHEN partnership_status = 'active' THEN 1 END) as active_count,
    COUNT(CASE WHEN partnership_status = 'pending' THEN 1 END) as pending_count,
    COUNT(CASE WHEN partnership_status = 'suspended' THEN 1 END) as suspended_count
FROM museum_partners
GROUP BY partner_category;

-- Add comments for documentation
-- partner_category values:
--   'museum': Traditional museums and art institutions
--   'gallery': Art galleries and exhibition spaces
--   'art_dealer': Professional art dealers and merchants
