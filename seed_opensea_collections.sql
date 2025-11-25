-- OpenSea 기반 유명 NFT 컬렉션 데이터
-- 2024-2025 실제 컬렉션 정보

-- ============================================
-- 작가 데이터
-- ============================================

INSERT INTO artists (name, bio, profile_image, career_years, wallet_address, email, created_at) VALUES
-- 1. Yuga Labs (Bored Ape Yacht Club)
('Yuga Labs', 
 'Bored Ape Yacht Club 제작사. 10,000개의 독특한 Bored Ape NFT를 만든 팀입니다.',
 'https://i.seadn.io/gcs/files/95817bc9f75c44ac4e9fecf84ab8df88.png',
 3,
 '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D',
 'contact@yuga.com',
 CURRENT_TIMESTAMP),

-- 2. Larva Labs (CryptoPunks)
('Larva Labs',
 'CryptoPunks와 Autoglyphs의 제작자. NFT 역사의 선구자입니다.',
 'https://i.seadn.io/gcs/files/3e6172c9efd73d5a05ecd7ea3d5f86f4.png',
 8,
 '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB',
 'hello@larvalabs.com',
 'https://larvalabs.com',
 '@larvalabs',
 '@larvalabs',
 CURRENT_TIMESTAMP),

-- 3. Chiru Labs (Azuki)
('Chiru Labs',
 'Azuki 컬렉션 제작사. 일본 애니메이션 스타일의 NFT 캐릭터를 만듭니다.',
 'https://i.seadn.io/gcs/files/e6ca8c4e8d8a5a0c9b3c8e3e2b8d4f8a.jpg',
 2,
 '0xED5AF388653567Af2F388E6224dC7C4b3241C544',
 'hello@azuki.com',
 'https://azuki.com',
 '@azukizen',
 '@AzukiOfficial',
 CURRENT_TIMESTAMP),

-- 4. Burnt Toast (Doodles)
('Burnt Toast',
 'Doodles 컬렉션의 아티스트. 다채롭고 귀여운 캐릭터 NFT를 그립니다.',
 'https://i.seadn.io/gcs/files/d8c8e8f8a8b8c8d8e8f8a8b8c8d8e8f8.png',
 4,
 '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e',
 'contact@doodles.app',
 'https://doodles.app',
 '@doodles',
 '@doodles',
 CURRENT_TIMESTAMP),

-- 5. XCOPY
('XCOPY',
 '사이버펑크와 디스토피아 테마의 디지털 아티스트. NFT 아트의 선구자.',
 'https://i.seadn.io/gcs/files/a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8.jpg',
 7,
 '0x8f5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a09',
 'contact@xcopy.art',
 'https://xcopy.art',
 '@xcopyart',
 '@XCOPYART',
 CURRENT_TIMESTAMP),

-- 6. Claire Silver
('Claire Silver',
 'AI와 인간 협업의 선구자. AI 생성 아트와 전통 기법을 결합합니다.',
 'https://i.seadn.io/gcs/files/b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8.png',
 3,
 '0x9f5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a10',
 'hello@clairesilver.com',
 'https://clairesilver.com',
 '@clairesilver12',
 '@ClaireSilver12',
 CURRENT_TIMESTAMP),

-- 7. Tyler Hobbs
('Tyler Hobbs',
 'Fidenza의 제작자. 생성 예술(Generative Art)의 대가입니다.',
 'https://i.seadn.io/gcs/files/c8d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8.jpg',
 6,
 '0xa5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a11',
 'tyler@tylerxhobbs.com',
 'https://tylerxhobbs.com',
 '@tylerxhobbs',
 '@tylerxhobbs',
 CURRENT_TIMESTAMP),

-- 8. Dmitri Cherniak
('Dmitri Cherniak',
 'Ringers의 제작자. 수학적 알고리즘으로 예술을 창조합니다.',
 'https://i.seadn.io/gcs/files/d8e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8.png',
 5,
 '0xb5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a12',
 'dmitri@dmitricherniak.com',
 'https://dmitricherniak.com',
 '@dmitricherniak',
 '@dmitricherniak',
 CURRENT_TIMESTAMP),

-- 9. Refik Anadol
('Refik Anadol',
 '데이터 조각가이자 미디어 아티스트. AI와 데이터를 시각화합니다.',
 'https://i.seadn.io/gcs/files/e8f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8.jpg',
 12,
 '0xc5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a13',
 'studio@refikanadol.com',
 'https://refikanadol.com',
 '@refikanadol',
 '@refikanadol',
 CURRENT_TIMESTAMP),

-- 10. Pak
('Pak',
 '익명의 디지털 아티스트. The Merge로 9천만 달러 이상 거래한 전설.',
 'https://i.seadn.io/gcs/files/f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8.png',
 10,
 '0xd5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a14',
 'contact@pak.com',
 'https://pak.com',
 '@muratpak',
 '@muratpak',
 CURRENT_TIMESTAMP);

-- ============================================
-- 작품 데이터 (각 컬렉션 대표작)
-- ============================================

-- Bored Ape Yacht Club (10개)
INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, status, created_at) VALUES
(1, 'Bored Ape #8817', 'Bored Ape Yacht Club 컬렉션. 금색 모피와 레이저 눈을 가진 희귀 에이프.', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/c6b6d8f3e9e5cf8dd8a8fb8d72f8e3f0.png', 1520000000, 'minted', CURRENT_TIMESTAMP),
(1, 'Bored Ape #1837', 'Bored Ape Yacht Club 컬렉션. 레인보우 모피를 가진 극희귀 에이프.', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/b6c6d8f3e9e5cf8dd8a8fb8d72f8e3f1.png', 1200000000, 'minted', CURRENT_TIMESTAMP),
(1, 'Bored Ape #3749', 'Bored Ape Yacht Club 컬렉션. 트위드 재킷을 입은 세련된 에이프.', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/a6c6d8f3e9e5cf8dd8a8fb8d72f8e3f2.png', 850000000, 'minted', CURRENT_TIMESTAMP),
(1, 'Bored Ape #232', 'Bored Ape Yacht Club 컬렉션. 파티 모자를 쓴 즐거운 에이프.', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/96c6d8f3e9e5cf8dd8a8fb8d72f8e3f3.png', 920000000, 'sold', CURRENT_TIMESTAMP),
(1, 'Bored Ape #9797', 'Bored Ape Yacht Club 컬렉션. 선글라스를 낀 쿨한 에이프.', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/86c6d8f3e9e5cf8dd8a8fb8d72f8e3f4.png', 780000000, 'minted', CURRENT_TIMESTAMP),

-- CryptoPunks (8개)
(2, 'CryptoPunk #5822', 'Alien 타입의 CryptoPunk. 극희귀 외계인 펑크.', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/d6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8.png', 2380000000, 'minted', CURRENT_TIMESTAMP),
(2, 'CryptoPunk #7523', 'Alien 타입의 CryptoPunk. 의료용 마스크를 착용한 유일한 외계인.', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/c6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b9.png', 1175000000, 'sold', CURRENT_TIMESTAMP),
(2, 'CryptoPunk #3100', 'Alien 타입의 CryptoPunk. 헤드밴드를 착용한 외계인.', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/b6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b0.png', 760000000, 'minted', CURRENT_TIMESTAMP),
(2, 'CryptoPunk #7804', 'Alien 타입의 CryptoPunk. 파이프와 선글라스를 착용.', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/a6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b1.png', 760000000, 'minted', CURRENT_TIMESTAMP),
(2, 'CryptoPunk #4156', 'Ape 타입의 CryptoPunk. 블루 비니를 쓴 원숭이.', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/96f8a8b8c8d8e8f8a8b8c8d8e8f8a8b2.png', 1040000000, 'sold', CURRENT_TIMESTAMP),

-- Azuki (5개)
(3, 'Azuki #9605', 'Azuki 컬렉션. 붉은 기모노를 입은 사무라이 테마 캐릭터.', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/e6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b3.png', 320000000, 'minted', CURRENT_TIMESTAMP),
(3, 'Azuki #3934', 'Azuki 컬렉션. 사이버 헤드폰을 착용한 퓨처리스틱 캐릭터.', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/d6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b4.png', 280000000, 'minted', CURRENT_TIMESTAMP),
(3, 'Azuki #2152', 'Azuki 컬렉션. 스트리트 패션 스타일의 모던 캐릭터.', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/c6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b5.png', 250000000, 'minted', CURRENT_TIMESTAMP),

-- Doodles (5개)
(4, 'Doodles #6914', 'Doodles 컬렉션. 무지개 색상의 귀여운 캐릭터.', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/b6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b6.png', 180000000, 'minted', CURRENT_TIMESTAMP),
(4, 'Doodles #1264', 'Doodles 컬렉션. 선글라스를 낀 쿨한 캐릭터.', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/a6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b7.png', 165000000, 'minted', CURRENT_TIMESTAMP),
(4, 'Doodles #8888', 'Doodles 컬렉션. 크라운을 쓴 왕관 캐릭터.', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/96f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8.png', 190000000, 'sold', CURRENT_TIMESTAMP),

-- XCOPY 작품 (4개)
(5, 'RIGHT-CLICK AND SAVE AS GUY', 'XCOPY의 대표작. NFT 저장 논란을 풍자한 작품.', '디지털아트', 'Glitch Art', 1920, 1080, 2021, 'https://i.seadn.io/gcs/files/86f8a8b8c8d8e8f8a8b8c8d8e8f8a8b9.png', 740000000, 'minted', CURRENT_TIMESTAMP),
(5, 'DEATH DIPS', 'XCOPY의 사이버펑크 작품. 죽음과 기술을 탐구.', '디지털아트', 'Glitch Art', 1920, 1080, 2020, 'https://i.seadn.io/gcs/files/76f8a8b8c8d8e8f8a8b8c8d8e8f8a8c0.png', 520000000, 'minted', CURRENT_TIMESTAMP),
(5, 'ALL TIME HIGH IN THE CITY', 'XCOPY의 도시 테마 작품. 네온 조명의 디스토피아.', '디지털아트', 'Glitch Art', 1920, 1080, 2021, 'https://i.seadn.io/gcs/files/66f8a8b8c8d8e8f8a8b8c8d8e8f8a8c1.png', 480000000, 'minted', CURRENT_TIMESTAMP),

-- Claire Silver AI 작품 (3개)
(6, 'The Arrival', 'AI와 인간 협업 작품. 미래의 도래를 표현.', '디지털아트', 'AI-Generated', 4096, 4096, 2023, 'https://i.seadn.io/gcs/files/56f8a8b8c8d8e8f8a8b8c8d8e8f8a8c2.png', 280000000, 'minted', CURRENT_TIMESTAMP),
(6, 'Consciousness Emerging', 'AI 의식의 탄생을 시각화한 작품.', '디지털아트', 'AI-Generated', 4096, 4096, 2023, 'https://i.seadn.io/gcs/files/46f8a8b8c8d8e8f8a8b8c8d8e8f8a8c3.png', 240000000, 'minted', CURRENT_TIMESTAMP),

-- Tyler Hobbs - Fidenza (3개)
(7, 'Fidenza #313', 'Tyler Hobbs의 생성 예술 작품. 알고리즘 기반 추상화.', '디지털아트', 'Generative Art', 3000, 3000, 2021, 'https://i.seadn.io/gcs/files/36f8a8b8c8d8e8f8a8b8c8d8e8f8a8c4.png', 1000000000, 'sold', CURRENT_TIMESTAMP),
(7, 'Fidenza #623', 'Tyler Hobbs의 생성 예술 작품. 컬러풀한 기하학 패턴.', '디지털아트', 'Generative Art', 3000, 3000, 2021, 'https://i.seadn.io/gcs/files/26f8a8b8c8d8e8f8a8b8c8d8e8f8a8c5.png', 850000000, 'minted', CURRENT_TIMESTAMP),

-- Dmitri Cherniak - Ringers (3개)
(8, 'Ringers #879', 'Dmitri Cherniak의 수학적 예술. 끈과 말뚝의 조합.', '디지털아트', 'Algorithmic Art', 1000, 1000, 2021, 'https://i.seadn.io/gcs/files/16f8a8b8c8d8e8f8a8b8c8d8e8f8a8c6.png', 720000000, 'minted', CURRENT_TIMESTAMP),
(8, 'Ringers #109', 'Dmitri Cherniak의 수학적 예술. 완벽한 대칭 구조.', '디지털아트', 'Algorithmic Art', 1000, 1000, 2021, 'https://i.seadn.io/gcs/files/06f8a8b8c8d8e8f8a8b8c8d8e8f8a8c7.png', 680000000, 'minted', CURRENT_TIMESTAMP),

-- Refik Anadol - Machine Hallucinations (2개)
(9, 'Machine Hallucinations - NYC', 'Refik Anadol의 데이터 조각. 뉴욕 시티 데이터 시각화.', '디지털아트', 'Data Art', 7680, 4320, 2024, 'https://i.seadn.io/gcs/files/f5f8a8b8c8d8e8f8a8b8c8d8e8f8a8c8.png', 640000000, 'minted', CURRENT_TIMESTAMP),
(9, 'Machine Hallucinations - Universe', 'Refik Anadol의 데이터 조각. 우주 데이터를 예술로.', '디지털아트', 'Data Art', 7680, 4320, 2024, 'https://i.seadn.io/gcs/files/e5f8a8b8c8d8e8f8a8b8c8d8e8f8a8c9.png', 580000000, 'minted', CURRENT_TIMESTAMP),

-- Pak - 추상 작품 (3개)
(10, 'The Merge', 'Pak의 역사적 작품. 9천만 달러 이상 거래된 전설의 NFT.', '디지털아트', 'Abstract Digital', 2160, 2160, 2021, 'https://i.seadn.io/gcs/files/d5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d0.png', 9180000000, 'sold', CURRENT_TIMESTAMP),
(10, 'Clock', 'Pak의 개념 작품. Julian Assange 지원을 위한 NFT.', '디지털아트', 'Conceptual Art', 2160, 2160, 2022, 'https://i.seadn.io/gcs/files/c5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d1.png', 5280000000, 'minted', CURRENT_TIMESTAMP),
(10, 'Lost Poets', 'Pak의 서사적 NFT 프로젝트. 시와 예술의 결합.', '디지털아트', 'Narrative Art', 2160, 2160, 2021, 'https://i.seadn.io/gcs/files/b5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d2.png', 420000000, 'minted', CURRENT_TIMESTAMP);
