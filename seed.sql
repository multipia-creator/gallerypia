-- 샘플 작가 데이터
INSERT OR IGNORE INTO artists (id, name, email, bio, career_years, education, exhibitions_count, awards_count, profile_image) VALUES 
  (1, '김민지', 'minji.kim@gallerypia.com', '현대 디지털 아트와 전통 회화를 융합하는 작가', 8, '서울대학교 미술대학 동양화과 졸업', 15, 3, 'https://i.seadn.io/gae/1.png'),
  (2, '이준호', 'junho.lee@gallerypia.com', '자연과 인간의 조화를 표현하는 조각가', 12, '홍익대학교 조소과 졸업, 파리 국립미술학교 석사', 23, 7, 'https://i.seadn.io/gae/2.png'),
  (3, '박서연', 'seoyeon.park@gallerypia.com', 'NFT 네이티브 디지털 아티스트', 5, '한국예술종합학교 미술원 졸업', 8, 2, 'https://i.seadn.io/gae/3.png'),
  (4, '최현우', 'hyunwoo.choi@gallerypia.com', '사진과 미디어 아트를 결합한 작업', 10, '중앙대학교 사진학과 졸업', 18, 4, 'https://i.seadn.io/gae/4.png'),
  (5, '정수민', 'sumin.jung@gallerypia.com', '추상 표현주의 화가', 15, '이화여자대학교 서양화과 졸업, 뉴욕 SVA 석사', 30, 9, 'https://i.seadn.io/gae/5.png');

-- 샘플 작품 데이터
INSERT OR IGNORE INTO artworks (
  id, artist_id, title, description, category, technique, 
  size_width, size_height, creation_year, 
  image_url, thumbnail_url,
  base_material_cost, labor_hours, market_demand_score, rarity_score,
  artistic_quality_score, originality_score, cultural_significance_score, technical_excellence_score,
  estimated_value, min_price, current_price, status
) VALUES 
  (
    1, 1, '디지털 정원 #1', '전통 동양화 기법을 디지털로 재해석한 작품. 자연의 생명력과 디지털 세계의 조화를 표현합니다.', 
    '디지털아트', 'Digital Painting', 1920, 1080, 2024,
    'https://i.seadn.io/s/raw/files/a1b2c3d4e5f6.png', 'https://i.seadn.io/s/raw/files/a1b2c3d4e5f6_thumb.png',
    500000, 120, 85, 75,
    88, 92, 78, 85,
    15000000, 12000000, 15000000, 'approved'
  ),
  (
    2, 1, '디지털 정원 #2', '시리즈의 두 번째 작품으로 사계절의 변화를 담았습니다.', 
    '디지털아트', 'Digital Painting', 1920, 1080, 2024,
    'https://i.seadn.io/s/raw/files/b2c3d4e5f6a7.png', 'https://i.seadn.io/s/raw/files/b2c3d4e5f6a7_thumb.png',
    500000, 150, 88, 78,
    90, 88, 80, 87,
    18000000, 15000000, 18000000, 'approved'
  ),
  (
    3, 2, '조화로운 공간', '자연의 유기적 형태를 현대적으로 재해석한 조각 작품', 
    '조각', 'Bronze Casting', 80, 120, 2023,
    'https://i.seadn.io/s/raw/files/c3d4e5f6a7b8.png', 'https://i.seadn.io/s/raw/files/c3d4e5f6a7b8_thumb.png',
    8000000, 300, 82, 85,
    85, 80, 85, 90,
    45000000, 40000000, 45000000, 'approved'
  ),
  (
    4, 3, 'Crypto Dreams', '블록체인 기술과 디지털 아트의 만남을 상징하는 작품',
    '디지털아트', 'Generative Art', 3000, 3000, 2024,
    'https://i.seadn.io/s/raw/files/d4e5f6a7b8c9.png', 'https://i.seadn.io/s/raw/files/d4e5f6a7b8c9_thumb.png',
    300000, 80, 90, 88,
    86, 94, 82, 88,
    12000000, 10000000, 12000000, 'minted'
  ),
  (
    5, 3, 'MetaVerse Portal', 'NFT와 메타버스를 연결하는 포털을 형상화',
    '디지털아트', 'Generative Art', 3000, 3000, 2024,
    'https://i.seadn.io/s/raw/files/e5f6a7b8c9d0.png', 'https://i.seadn.io/s/raw/files/e5f6a7b8c9d0_thumb.png',
    300000, 100, 92, 90,
    89, 91, 85, 90,
    16000000, 14000000, 16000000, 'minted'
  ),
  (
    6, 4, '서울의 밤', '도시의 야경을 포착한 대형 사진 작품',
    '사진', 'Digital Photography', 150, 100, 2023,
    'https://i.seadn.io/s/raw/files/f6a7b8c9d0e1.png', 'https://i.seadn.io/s/raw/files/f6a7b8c9d0e1_thumb.png',
    2000000, 50, 78, 70,
    82, 75, 88, 85,
    8000000, 7000000, 8000000, 'approved'
  ),
  (
    7, 5, '추상 공간 1', '색채와 형태의 조화로 감정을 표현한 추상화',
    '회화', 'Acrylic on Canvas', 162, 130, 2022,
    'https://i.seadn.io/s/raw/files/a7b8c9d0e1f2.png', 'https://i.seadn.io/s/raw/files/a7b8c9d0e1f2_thumb.png',
    3000000, 200, 75, 72,
    87, 83, 80, 88,
    25000000, 22000000, 25000000, 'approved'
  ),
  (
    8, 5, '추상 공간 2', '시리즈의 연작으로 공간과 시간의 흐름 표현',
    '회화', 'Acrylic on Canvas', 162, 130, 2022,
    'https://i.seadn.io/s/raw/files/b8c9d0e1f2a3.png', 'https://i.seadn.io/s/raw/files/b8c9d0e1f2a3_thumb.png',
    3000000, 180, 77, 73,
    88, 85, 82, 89,
    27000000, 24000000, 27000000, 'approved'
  );

-- 샘플 평가 이력
INSERT OR IGNORE INTO valuation_history (artwork_id, evaluator_name, evaluator_role, artistic_quality, originality, cultural_significance, technical_excellence, market_potential, estimated_value, evaluation_notes) VALUES
  (1, '김미술', 'expert', 88, 92, 78, 85, 85, 15000000, '전통과 현대의 조화가 돋보이는 작품입니다.'),
  (2, '이큐레이터', 'curator', 90, 88, 80, 87, 88, 18000000, '시리즈의 완성도가 뛰어납니다.'),
  (3, '박컬렉터', 'collector', 85, 80, 85, 90, 82, 45000000, '조각 작품으로서의 가치가 충분합니다.'),
  (4, '최평론가', 'expert', 86, 94, 82, 88, 90, 12000000, 'NFT 시장에서 주목받을 작품입니다.');

-- 샘플 컬렉션
INSERT OR IGNORE INTO collections (id, name, description, curator_name, cover_image, artwork_count) VALUES
  (1, '디지털 르네상스', '전통 미술과 디지털 기술의 융합', '김큐레이터', 'https://i.seadn.io/s/raw/files/collection1.png', 2),
  (2, '현대 조각의 재해석', '현대 조각 작품 컬렉션', '이큐레이터', 'https://i.seadn.io/s/raw/files/collection2.png', 1),
  (3, 'NFT 네이티브', '블록체인 기반 디지털 아트', '박큐레이터', 'https://i.seadn.io/s/raw/files/collection3.png', 2);

-- 컬렉션-작품 연결
INSERT OR IGNORE INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
  (1, 1, 1),
  (1, 2, 2),
  (2, 3, 1),
  (3, 4, 1),
  (3, 5, 2);
