-- NFT 컬렉션 샘플 데이터 (OpenSea 스타일)

-- 작가들 추가
INSERT INTO artists (name, email, bio, career_years, education, solo_exhibitions_count, group_exhibitions_count, competition_awards_count, wallet_address) VALUES
('Beeple', 'beeple@example.com', '디지털 아티스트, 매일 작품을 만드는 "Everydays" 시리즈로 유명', 15, 'Computer Science', 5, 20, 8, '0x1234567890abcdef1234567890abcdef12345678'),
('Pak', 'pak@example.com', '익명의 디지털 아티스트, NFT 시장의 선구자', 10, 'Digital Arts', 3, 15, 5, '0x2345678901bcdef2345678901bcdef234567890'),
('XCOPY', 'xcopy@example.com', '다크한 글리치 아트 스타일의 크립토 아티스트', 8, 'Visual Arts', 4, 18, 6, '0x3456789012cdef3456789012cdef345678901234'),
('FEWOCiOUS', 'fewocious@example.com', '젊은 디지털 아티스트, 감성적이고 다채로운 작품', 5, 'Self-taught', 2, 10, 4, '0x4567890123def4567890123def456789012345678'),
('Mad Dog Jones', 'maddogjones@example.com', '사이버펑크 풍경화의 대가', 7, 'Fine Arts', 3, 12, 3, '0x5678901234ef5678901234ef567890123456789a'),
('김민수', 'minsu@example.com', '한국 현대 미술의 대표 작가, NFT로 전통과 현대를 융합', 20, '서울대학교 미술대학', 15, 35, 12, '0x6789012345f6789012345f6789012345678901bc'),
('박서연', 'seoyeon@example.com', '추상화와 디지털 아트의 경계를 넘나드는 작가', 12, '홍익대학교 미술대학', 8, 25, 8, '0x789012346789012346789012346789012346789cd'),
('최지훈', 'jihoon@example.com', '기하학적 패턴과 색채의 조화를 탐구하는 현대 작가', 10, '국민대학교 조형대학', 6, 20, 5, '0x89012345789012345789012345789012345789de');

-- 유명 NFT 컬렉션 작품들
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, estimated_value, status) VALUES
-- Beeple 작품들
(1, 'Everydays: The First 5000 Days', 'Beeple의 5000일 연속 작업을 모은 역사적인 NFT 작품', '디지털아트', 'Digital Collage', 21069, 21069, 2021, 'https://i.seadn.io/gae/9hOdALs6q0cGLsNZ-_bz5FzKPEqnLYKqbT2qYjqd4hx8Rqr5rBxJlmWvEgE', 69300000000, 69300000000, 'minted'),
(1, 'Human One', '하이브리드 조각 작품, 물리적 조각과 디지털 NFT의 결합', '디지털아트', 'Hybrid Sculpture', 120, 240, 2021, 'https://i.seadn.io/gae/8lGLGLqJ1P8DqKqrKFDqNXLN8r5fNrFdFvFnFmFhFkF', 28900000000, 28900000000, 'minted'),
(1, 'Crossroad', '2020년 미국 대선을 주제로 한 역동적인 디지털 작품', '디지털아트', 'Digital Animation', 1920, 1080, 2020, 'https://i.seadn.io/gae/7kGKGKpI0O7CpJpqJECpMWKM7q4eNqEcEuEmEkEgEjE', 6600000000, 6600000000, 'minted'),

-- Pak 작품들
(2, 'The Merge', '역사상 가장 비싼 NFT 판매, 28만개 이상의 조각으로 분할', '디지털아트', 'Generative Art', 4096, 4096, 2021, 'https://i.seadn.io/gae/6jFJFJoH9N6BoIopIDBoLVJL6p3dMpDcDtDlDjDfDiD', 91800000000, 91800000000, 'minted'),
(2, 'Finite', '제한된 에디션의 NFT 드롭, 시간 기반 가격 변동', '디지털아트', 'Algorithmic Art', 2048, 2048, 2021, 'https://i.seadn.io/gae/5iEIEInG8M5AnHnoHCAoKUIK5o2cLoChCsCkCiCeCdC', 1500000000, 1500000000, 'minted'),

-- XCOPY 작품들
(3, 'Right-click and Save As guy', 'NFT의 본질을 풍자한 아이코닉한 작품', '디지털아트', 'Glitch Art', 1500, 1500, 2021, 'https://i.seadn.io/gae/4hDHDHmF7L4AmGmnGBAnJTHJ4n1bKnBbBrBjBhBdBcB', 7090000000, 7090000000, 'minted'),
(3, 'DEATH', '해골 모티프의 다크한 글리치 애니메이션', '디지털아트', 'Glitch Animation', 1200, 1200, 2020, 'https://i.seadn.io/gae/3gCGCGlE6K3AlFlmFAAlISGI3m0aJmAaAqAiAgAcAbA', 1220000000, 1220000000, 'minted'),

-- FEWOCiOUS 작품들
(4, 'Nice to meet you, I am Mr. MiSUNDERSTOOD', '젊은 작가의 정체성을 탐구한 감성적 작품', '디지털아트', 'Digital Painting', 3000, 3000, 2021, 'https://i.seadn.io/gae/2fBFBFkD5J2AkEklEAkHRFH2l9ZImZaZpZhZfZcZaZ', 2160000000, 2160000000, 'minted'),
(4, 'The EverLasting Beautiful', '아름다움과 영원함에 대한 철학적 표현', '디지털아트', 'Mixed Media', 2500, 2500, 2020, 'https://i.seadn.io/gae/1eAEAEjC4I1AjDjkDAjGQEG1k8YHlYaYoYgYeYbYaY', 550000000, 550000000, 'minted'),

-- Mad Dog Jones 작품들
(5, 'REPLICATOR', '스스로 복제되는 NFT, 생성 예술의 새로운 지평', '디지털아트', 'Generative Art', 4000, 4000, 2021, 'https://i.seadn.io/gae/9dZDZDiB3H0ZiCijCZiGPDG0j7XGkXZXnXgXdXaXZX', 4100000000, 4100000000, 'minted'),
(5, 'Crash + Burn', '네온 조명의 사이버펑크 도시 풍경', '디지털아트', 'Digital Landscape', 3500, 2000, 2020, 'https://i.seadn.io/gae/8cYCYChA2G9YhBhiBYhFOCF9i6WFjWYWmWfWcWZWYW', 850000000, 850000000, 'minted'),

-- 한국 작가들 작품
(6, '한강의 빛', '서울의 야경을 추상적으로 재해석한 작품', '회화', 'Acrylic on Canvas', 160, 120, 2023, 'https://i.seadn.io/gae/7bXBXBgZ1F8XgAgfBXgENCE8h5VEiVXVlVeVbVYVXV', 45000000, 45000000, 'approved'),
(6, '디지털 한복', '전통 한복의 아름다움을 디지털로 표현', '디지털아트', 'Digital Illustration', 2400, 3200, 2023, 'https://i.seadn.io/gae/6aWAWAfY0E7WfZfeAWfDMBD7g4UDhUWUkUdUaUYUWU', 32000000, 32000000, 'approved'),
(6, '무제 (서울 2024)', '서울의 에너지를 담은 추상 표현주의', '회화', 'Mixed Media', 200, 150, 2024, 'https://i.seadn.io/gae/5ZVZVZeX9D6VeYedZVeCLAC6f3TCgTVTjTcTZTXTVT', 58000000, 58000000, 'minted'),

(7, '시간의 레이어', '시간의 흐름을 레이어로 표현한 추상화', '디지털아트', 'Digital Layers', 3000, 3000, 2023, 'https://i.seadn.io/gae/4YUYUYdW8C5UdXdcYUdBKZB5e2SBfSUSiSbSYSWSUS', 28000000, 28000000, 'approved'),
(7, '꿈의 정원', '초현실적인 정원을 디지털로 구현', '디지털아트', 'Digital Surrealism', 2800, 2800, 2023, 'https://i.seadn.io/gae/3XTXTXcV7B4TcWcbXTcAJYA4d1RAeRTRhRaRXRVRTR', 35000000, 35000000, 'approved'),

(8, '기하학적 명상', '기하학 패턴을 통한 명상적 경험', '디지털아트', 'Geometric Art', 2500, 2500, 2024, 'https://i.seadn.io/gae/2WSWSWbU6A3SbVbaWSbZIXZ3c0QZdQSQgQZQWQUQSQ', 22000000, 22000000, 'approved'),
(8, '색채의 교향곡', '색채 이론을 음악적으로 표현', '디지털아트', 'Color Theory', 3200, 1800, 2024, 'https://i.seadn.io/gae/1VRVRVaT5Z2RaUaZVRaYHWY2b9PYcPRPfPYPVPTPRP', 30000000, 30000000, 'minted');

-- CryptoPunks 스타일 작품들
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, estimated_value, status) VALUES
(2, 'Punk #3100', '희귀한 외계인 타입 크립토펑크', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/c3d5a1f1e5e0a3b8d8f9c9b7e8f9a9b8.png', 7580000000, 7580000000, 'minted'),
(2, 'Punk #7804', '파이프와 선글라스를 착용한 외계인 펑크', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/b2c4z0e0d4d9z2a7c7e8b8a6d7e8z8a7.png', 7570000000, 7570000000, 'minted'),
(3, 'Bored Ape #8817', '레이저 눈을 가진 황금 원숭이', '디지털아트', 'Vector Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/a1b3y9d9c3c8y1z6b6d7a7z5c6d7y7z6.png', 3400000000, 3400000000, 'minted'),
(3, 'Bored Ape #232', '파티 모자를 쓴 희귀한 에이프', '디지털아트', 'Vector Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/z0a2x8c8b2b7x0y5a5c6z6y4b5c6x6y5.png', 2950000000, 2950000000, 'minted');

-- Azuki 스타일
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, estimated_value, status) VALUES
(4, 'Azuki #9605', '빨간 후드를 착용한 아즈키 캐릭터', '디지털아트', 'Anime Style', 2000, 2000, 2022, 'https://i.seadn.io/gcs/files/y9z1w7b7a1a6w9x4z4b5y5x3a4b5w5x4.png', 1200000000, 1200000000, 'minted'),
(4, 'Azuki #4808', '사무라이 의상의 아즈키', '디지털아트', 'Anime Style', 2000, 2000, 2022, 'https://i.seadn.io/gcs/files/x8y0v6a6z0z5v8w3y3a4x4w2z3a4v4w3.png', 980000000, 980000000, 'minted');

-- Doodles 스타일
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, estimated_value, status) VALUES
(5, 'Doodle #6914', '무지개 머리의 귀여운 두들', '디지털아트', 'Cartoon Style', 1500, 1500, 2021, 'https://i.seadn.io/gcs/files/w7x9u5z9y9y4u7v2x2z3w3v1y2z3u3v2.png', 750000000, 750000000, 'minted'),
(5, 'Doodle #4156', '골든 체인을 착용한 두들', '디지털아트', 'Cartoon Style', 1500, 1500, 2021, 'https://i.seadn.io/gcs/files/v6w8t4y8x8x3t6u1w1y2v2u0x1y2t2u1.png', 820000000, 820000000, 'minted');

-- 한국 전통 미술 NFT
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, estimated_value, status) VALUES
(6, '민화: 까치와 호랑이', '전통 민화를 NFT로 재해석', '디지털아트', 'Digital Traditional', 2400, 3200, 2024, 'https://i.seadn.io/gcs/files/u5v7s3x7w7w2s5t0v0x1u1t9w0x1s1t0.png', 18000000, 18000000, 'approved'),
(6, '청자 백자 컬렉션', '한국 도자기의 아름다움을 3D로', '디지털아트', '3D Modeling', 2048, 2048, 2024, 'https://i.seadn.io/gcs/files/t4u6r2w6v6v1r4s9u9w0t0s8v9w0r0s9.png', 25000000, 25000000, 'approved'),
(7, '한글 타이포그래피 #1', '한글의 조형미를 현대적으로 표현', '디지털아트', 'Typography', 2000, 2000, 2024, 'https://i.seadn.io/gcs/files/s3t5q1v5u5u0q3r8t8v9s9r7u8v9q9r8.png', 15000000, 15000000, 'approved'),
(7, '서울 스카이라인 NFT', '서울의 스카이라인을 추상적으로', '디지털아트', 'Digital Cityscape', 3840, 2160, 2024, 'https://i.seadn.io/gcs/files/r2s4p0u4t4t9p2q7s7u8r8q6t7u8p8q7.png', 28000000, 28000000, 'minted'),
(8, '한옥의 선', '한옥 건축의 선을 기하학적으로', '디지털아트', 'Architectural Art', 2500, 2500, 2024, 'https://i.seadn.io/gcs/files/q1r3o9t3s3s8o1p6r6t7q7p5s6t7o7p6.png', 20000000, 20000000, 'approved');

-- 컬렉션 생성
INSERT INTO collections (name, description, curator_name, cover_image) VALUES
('Legendary NFT Masters', '전설적인 NFT 아티스트들의 작품 모음', 'Gallery Curator', 'https://i.seadn.io/collection/legendary-nft-masters.png'),
('K-Art Digital', '한국 작가들의 디지털 아트 컬렉션', 'Korean Art Curator', 'https://i.seadn.io/collection/k-art-digital.png'),
('CryptoPunks & Apes', '초기 NFT 컬렉션의 아이콘들', 'NFT Historian', 'https://i.seadn.io/collection/cryptopunks-apes.png'),
('Modern Digital Art', '현대 디지털 아트의 최전선', 'Digital Art Expert', 'https://i.seadn.io/collection/modern-digital-art.png');
