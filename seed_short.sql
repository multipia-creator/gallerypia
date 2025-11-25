-- OpenSea 유명 NFT 컬렉션 간소화

INSERT INTO artists (name, bio, profile_image, career_years, wallet_address, email) VALUES
('Yuga Labs', 'Bored Ape Yacht Club', 'https://i.seadn.io/gcs/files/95817bc9f75c44ac4e9fecf84ab8df88.png', 3, '0xBC4CA0EdA7647A8aB7C2061c2E118A18a936f13D', 'contact@yuga.com'),
('Larva Labs', 'CryptoPunks', 'https://i.seadn.io/gcs/files/3e6172c9efd73d5a05ecd7ea3d5f86f4.png', 8, '0xb47e3cd837dDF8e4c57F05d70Ab865de6e193BBB', 'hello@larvalabs.com'),
('Chiru Labs', 'Azuki', 'https://i.seadn.io/gcs/files/e6ca8c4e8d8a5a0c9b3c8e3e2b8d4f8a.jpg', 2, '0xED5AF388653567Af2F388E6224dC7C4b3241C544', 'hello@azuki.com'),
('Burnt Toast', 'Doodles', 'https://i.seadn.io/gcs/files/d8c8e8f8a8b8c8d8e8f8a8b8c8d8e8f8.png', 4, '0x8a90CAb2b38dba80c64b7734e58Ee1dB38B8992e', 'contact@doodles.app'),
('XCOPY', '사이버펑크 아티스트', 'https://i.seadn.io/gcs/files/a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8d8.jpg', 7, '0x8f5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a09', 'contact@xcopy.art'),
('Pak', '익명 디지털 아티스트', 'https://i.seadn.io/gcs/files/f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8c8.png', 10, '0xd5C8A9c7e6f4b2d1e8f9c8a7b6d5e4f3c2b1a14', 'contact@pak.com');

INSERT INTO artworks (artist_id, title, description, category, technique, size_width, size_height, creation_year, image_url, current_price, status) VALUES
(1, 'Bored Ape #8817', 'BAYC - 금색 모피', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/c6b6d8f3e9e5cf8dd8a8fb8d72f8e3f0.png', 1520000000, 'minted'),
(1, 'Bored Ape #1837', 'BAYC - 레인보우', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/b6c6d8f3e9e5cf8dd8a8fb8d72f8e3f1.png', 1200000000, 'minted'),
(1, 'Bored Ape #3749', 'BAYC - 트위드 재킷', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/a6c6d8f3e9e5cf8dd8a8fb8d72f8e3f2.png', 850000000, 'minted'),
(1, 'Bored Ape #232', 'BAYC - 파티 모자', '디지털아트', 'Digital Art', 631, 631, 2021, 'https://i.seadn.io/gcs/files/96c6d8f3e9e5cf8dd8a8fb8d72f8e3f3.png', 920000000, 'sold'),
(2, 'CryptoPunk #5822', 'Alien 펑크', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/d6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8.png', 2380000000, 'minted'),
(2, 'CryptoPunk #7523', 'Alien 마스크', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/c6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b9.png', 1175000000, 'sold'),
(2, 'CryptoPunk #3100', 'Alien 헤드밴드', '디지털아트', 'Pixel Art', 24, 24, 2017, 'https://i.seadn.io/gcs/files/b6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b0.png', 760000000, 'minted'),
(3, 'Azuki #9605', 'Azuki - 붉은 기모노', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/e6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b3.png', 320000000, 'minted'),
(3, 'Azuki #3934', 'Azuki - 사이버 헤드폰', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/d6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b4.png', 280000000, 'minted'),
(3, 'Azuki #2152', 'Azuki - 스트리트 패션', '디지털아트', 'Anime Art', 1000, 1000, 2022, 'https://i.seadn.io/gcs/files/c6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b5.png', 250000000, 'minted'),
(4, 'Doodles #6914', 'Doodles - 무지개', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/b6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b6.png', 180000000, 'minted'),
(4, 'Doodles #1264', 'Doodles - 선글라스', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/a6f8a8b8c8d8e8f8a8b8c8d8e8f8a8b7.png', 165000000, 'minted'),
(4, 'Doodles #8888', 'Doodles - 크라운', '디지털아트', 'Cartoon Art', 2048, 2048, 2021, 'https://i.seadn.io/gcs/files/96f8a8b8c8d8e8f8a8b8c8d8e8f8a8b8.png', 190000000, 'sold'),
(5, 'RIGHT-CLICK AND SAVE AS GUY', 'XCOPY 대표작', '디지털아트', 'Glitch Art', 1920, 1080, 2021, 'https://i.seadn.io/gcs/files/86f8a8b8c8d8e8f8a8b8c8d8e8f8a8b9.png', 740000000, 'minted'),
(5, 'DEATH DIPS', 'XCOPY - 죽음과 기술', '디지털아트', 'Glitch Art', 1920, 1080, 2020, 'https://i.seadn.io/gcs/files/76f8a8b8c8d8e8f8a8b8c8d8e8f8a8c0.png', 520000000, 'minted'),
(6, 'The Merge', 'Pak - 9천만달러', '디지털아트', 'Abstract', 2160, 2160, 2021, 'https://i.seadn.io/gcs/files/d5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d0.png', 9180000000, 'sold'),
(6, 'Clock', 'Pak - Julian Assange', '디지털아트', 'Conceptual', 2160, 2160, 2022, 'https://i.seadn.io/gcs/files/c5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d1.png', 5280000000, 'minted'),
(6, 'Lost Poets', 'Pak - 시와 예술', '디지털아트', 'Narrative', 2160, 2160, 2021, 'https://i.seadn.io/gcs/files/b5f8a8b8c8d8e8f8a8b8c8d8e8f8a8d2.png', 420000000, 'minted');
