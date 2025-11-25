-- Sample Artists
INSERT INTO artists (name, bio, profile_image, created_at) VALUES
('김민준', '현대 디지털 아트의 선구자. 블록체인과 예술의 융합을 추구합니다.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist1', datetime('now')),
('이서연', '추상표현주의 작가. NFT를 통해 새로운 예술의 경계를 탐험합니다.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist2', datetime('now')),
('박준영', '3D 아티스트이자 메타버스 건축가. 가상 공간의 미학을 연구합니다.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist3', datetime('now')),
('최지우', '일러스트레이터. 동양화와 디지털 아트의 조화를 추구합니다.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist4', datetime('now')),
('정수민', 'AI 아트 전문가. 생성형 AI와 인간 창의성의 협업을 실험합니다.', 'https://api.dicebear.com/7.x/avataaars/svg?seed=artist5', datetime('now'));

-- Sample Artworks
INSERT INTO artworks (
  title, description, artist_id, category, image_url, 
  estimated_value, status, is_minted, average_rating,
  views_count, likes_count, created_at
) VALUES
-- Featured NFTs (높은 가치, 민팅됨)
('Cyber Dreamscape #001', '네온 불빛이 가득한 사이버펑크 도시의 야경. 미래와 과거가 공존하는 디지털 유토피아를 표현했습니다.', 1, '디지털아트', 'https://picsum.photos/seed/art1/800/800', 
 25000000, 'minted', 1, 4.8, 1250, 340, datetime('now', '-15 days')),

('Abstract Harmony #042', '색과 형태의 조화로운 춤. 추상표현주의의 정수를 NFT로 구현했습니다.', 2, '회화', 'https://picsum.photos/seed/art2/800/800',
 18000000, 'minted', 1, 4.6, 980, 275, datetime('now', '-20 days')),

('Metaverse Pavilion', '가상 공간 속 몽환적인 건축물. 중력을 거스르는 구조미가 돋보입니다.', 3, '3D', 'https://picsum.photos/seed/art3/800/800',
 32000000, 'minted', 1, 4.9, 1580, 420, datetime('now', '-25 days')),

('Dragon Soul', '동양의 전통 용 그림에 현대적 디지털 기법을 접목한 작품입니다.', 4, '일러스트', 'https://picsum.photos/seed/art4/800/800',
 21000000, 'minted', 1, 4.7, 1120, 310, datetime('now', '-18 days')),

-- Recommended (평점 4.0 이상)
('AI Dreams #123', 'AI가 생성한 초현실적 풍경. 인공지능과 인간 감성의 만남을 표현했습니다.', 5, '디지털아트', 'https://picsum.photos/seed/art5/800/800',
 15000000, 'approved', 1, 4.5, 850, 230, datetime('now', '-12 days')),

('Cosmic Ballet', '우주의 신비를 춤으로 표현한 작품. 별들의 움직임이 만들어내는 리듬감이 특징입니다.', 1, '디지털아트', 'https://picsum.photos/seed/art6/800/800',
 19000000, 'minted', 1, 4.4, 920, 260, datetime('now', '-22 days')),

('Seoul Night', '서울의 밤 풍경을 네온사인과 함께 표현한 작품입니다.', 2, '사진', 'https://picsum.photos/seed/art7/800/800',
 12000000, 'minted', 1, 4.3, 780, 195, datetime('now', '-30 days')),

('Digital Nature #07', '자연의 아름다움을 디지털 기법으로 재해석한 작품입니다.', 3, '디지털아트', 'https://picsum.photos/seed/art8/800/800',
 16000000, 'approved', 1, 4.2, 690, 180, datetime('now', '-14 days')),

-- Popular (높은 조회수/좋아요)
('Neon Genesis', '생명의 탄생을 네온 빛으로 표현한 강렬한 작품입니다.', 4, '디지털아트', 'https://picsum.photos/seed/art9/800/800',
 28000000, 'minted', 1, 4.6, 2100, 580, datetime('now', '-10 days')),

('Virtual Paradise', '가상현실 속 낙원의 모습. 테크놀로지와 자연의 완벽한 조화를 보여줍니다.', 5, '3D', 'https://picsum.photos/seed/art10/800/800',
 24000000, 'minted', 1, 4.5, 1890, 520, datetime('now', '-8 days')),

('K-Pop Culture #001', '한국 대중문화의 역동성을 담은 작품입니다.', 1, '일러스트', 'https://picsum.photos/seed/art11/800/800',
 14000000, 'approved', 1, 4.3, 1650, 450, datetime('now', '-16 days')),

('Future City 2077', '2077년 미래 도시의 모습을 상상한 작품입니다.', 2, '디지털아트', 'https://picsum.photos/seed/art12/800/800',
 20000000, 'minted', 1, 4.4, 1520, 410, datetime('now', '-19 days')),

-- Recent (최신 작품)
('Spring Blossom', '봄날의 벚꽃을 디지털로 표현한 따뜻한 작품입니다.', 3, '디지털아트', 'https://picsum.photos/seed/art13/800/800',
 13000000, 'approved', 1, 4.1, 420, 115, datetime('now', '-2 days')),

('Ocean Deep', '심해의 신비로운 생물들을 담은 작품입니다.', 4, '3D', 'https://picsum.photos/seed/art14/800/800',
 17000000, 'minted', 1, 4.2, 510, 140, datetime('now', '-3 days')),

('Urban Jungle', '도시를 정글로 재해석한 독특한 관점의 작품입니다.', 5, '디지털아트', 'https://picsum.photos/seed/art15/800/800',
 11000000, 'approved', 1, 4.0, 380, 95, datetime('now', '-1 days')),

('Moonlight Sonata', '달빛이 만들어내는 음악을 시각화한 작품입니다.', 1, '디지털아트', 'https://picsum.photos/seed/art16/800/800',
 15000000, 'minted', 1, 4.3, 590, 165, datetime('now', '-4 days')),

('Crystal Dreams', '수정처럼 투명한 꿈의 세계를 표현한 작품입니다.', 2, '3D', 'https://picsum.photos/seed/art17/800/800',
 19000000, 'approved', 1, 4.4, 640, 175, datetime('now', '-5 days')),

('Street Art Revolution', '거리 예술의 혁명을 디지털로 담아낸 작품입니다.', 3, '디지털아트', 'https://picsum.photos/seed/art18/800/800',
 12000000, 'minted', 1, 4.1, 450, 120, datetime('now', '-6 days')),

('Zen Garden', '선(禪) 정원의 고요함을 NFT로 표현했습니다.', 4, '디지털아트', 'https://picsum.photos/seed/art19/800/800',
 14000000, 'approved', 1, 4.2, 520, 145, datetime('now', '-7 days')),

('Electric Dreams', '전기적 꿈을 시각화한 사이키델릭 작품입니다.', 5, '디지털아트', 'https://picsum.photos/seed/art20/800/800',
 16000000, 'minted', 1, 4.3, 680, 190, datetime('now', '-9 days'));
