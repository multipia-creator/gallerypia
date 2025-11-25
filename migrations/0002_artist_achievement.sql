-- 작가 업적 평가를 위한 필드 추가

-- Artists 테이블에 업적 점수 필드 추가
ALTER TABLE artists ADD COLUMN solo_exhibitions_count INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN group_exhibitions_count INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN competition_awards_count INTEGER DEFAULT 0;
ALTER TABLE artists ADD COLUMN achievement_score REAL DEFAULT 0;
ALTER TABLE artists ADD COLUMN latest_exhibition_year INTEGER DEFAULT 2024;
ALTER TABLE artists ADD COLUMN latest_award_year INTEGER DEFAULT 2024;

-- Artworks 테이블에서 재료비/작업시간 필드 제거 (논리적으로만 - 실제 삭제는 안 함)
-- 대신 사용하지 않도록 표시
-- ALTER TABLE artworks DROP COLUMN base_material_cost; -- SQLite는 DROP COLUMN 미지원
-- ALTER TABLE artworks DROP COLUMN labor_hours; -- SQLite는 DROP COLUMN 미지원

-- Artworks 테이블에 작가 업적 점수 필드 추가
ALTER TABLE artworks ADD COLUMN artist_achievement_score INTEGER DEFAULT 0;
