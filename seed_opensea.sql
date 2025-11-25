-- 기존 데이터 삭제
DELETE FROM collection_artworks;
DELETE FROM valuation_history;
DELETE FROM artworks;
DELETE FROM artists;
DELETE FROM collections;

-- OpenSea 스타일 작가 데이터
INSERT INTO artists (id, name, email, bio, career_years, education, exhibitions_count, awards_count, profile_image) VALUES 
  (1, 'CryptoPunks Studio', 'info@cryptopunks.com', 'Pioneering NFT collection creators', 10, 'Digital Art Institute', 50, 15, 'https://i.seadn.io/gcs/files/1d0dc5bf12e110d6dca6e6a7c8c4e4e4.jpg?w=500'),
  (2, 'Bored Ape Collective', 'team@boredape.com', 'Exclusive NFT art collective', 5, 'Contemporary Art School', 30, 8, 'https://i.seadn.io/gcs/files/aec7b5d3f54e24a76a9c3e5b3e4e4e4e.jpg?w=500'),
  (3, 'Azuki Artists', 'hello@azuki.com', 'Anime-inspired NFT creators', 6, 'Tokyo Art University', 25, 5, 'https://i.seadn.io/gcs/files/3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8.jpg?w=500'),
  (4, 'Doodles Team', 'hi@doodles.app', 'Colorful generative art collective', 4, 'California Institute of Arts', 20, 4, 'https://i.seadn.io/gcs/files/4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9.jpg?w=500'),
  (5, 'Moonbirds Studio', 'contact@moonbirds.com', 'Premium PFP NFT collection', 3, 'Rhode Island School of Design', 15, 3, 'https://i.seadn.io/gcs/files/5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0.jpg?w=500');

-- OpenSea 스타일 NFT 작품 데이터
INSERT INTO artworks (
  id, artist_id, title, description, category, technique, 
  size_width, size_height, creation_year, 
  image_url, thumbnail_url,
  base_material_cost, labor_hours, market_demand_score, rarity_score,
  artistic_quality_score, originality_score, cultural_significance_score, technical_excellence_score,
  estimated_value, min_price, current_price, status, is_minted
) VALUES 
  (
    1, 1, 'CryptoPunk #7804', 'One of the rarest CryptoPunks with pipe and small shades. Part of the iconic 10,000 algorithmically generated characters.', 
    '디지털아트', 'Generative Algorithm', 2400, 2400, 2017,
    'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=500',
    'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=300',
    1000000, 200, 98, 99,
    95, 98, 99, 92,
    450000000, 400000000, 450000000, 'minted', 1
  ),
  (
    2, 2, 'Bored Ape #8817', 'Rare golden fur Bored Ape with sunglasses. Member of the exclusive Bored Ape Yacht Club.', 
    '디지털아트', 'Digital Illustration', 2400, 2400, 2021,
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=500',
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=300',
    800000, 180, 96, 95,
    93, 95, 97, 94,
    280000000, 250000000, 280000000, 'minted', 1
  ),
  (
    3, 3, 'Azuki #9605', 'Spirit Azuki with rare red eyes and samurai armor. Part of the anime-inspired collection.', 
    '디지털아트', 'Anime Digital Art', 2400, 2400, 2022,
    'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=500',
    'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=300',
    600000, 150, 92, 90,
    91, 93, 90, 92,
    85000000, 75000000, 85000000, 'minted', 1
  ),
  (
    4, 4, 'Doodles #6914', 'Rainbow gradient Doodle with happy expression. Iconic colorful generative art.', 
    '디지털아트', 'Generative Art', 2400, 2400, 2021,
    'https://i.seadn.io/gae/7gOej3SUvqALR-qkqL_ApAt97SpUKQOZQe88p8jPjeiDDcqITesbAdsLcWlsIg8oh7SRrTpUPfPlm12lb4xDahgP2h32pQQYCsuOM?w=500',
    'https://i.seadn.io/gae/7gOej3SUvqALR-qkqL_ApAt97SpUKQOZQe88p8jPjeiDDcqITesbAdsLcWlsIg8oh7SRrTpUPfPlm12lb4xDahgP2h32pQQYCsuOM?w=300',
    400000, 120, 88, 85,
    89, 90, 86, 88,
    42000000, 38000000, 42000000, 'minted', 1
  ),
  (
    5, 5, 'Moonbirds #2642', 'Diamond Moonbird with crown. Premium PFP from PROOF Collective.', 
    '디지털아트', 'Pixel Art', 2400, 2400, 2022,
    'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500',
    'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=300',
    500000, 140, 90, 88,
    90, 91, 89, 90,
    68000000, 60000000, 68000000, 'minted', 1
  ),
  (
    6, 1, 'CryptoPunk #3100', 'Alien CryptoPunk with headband. One of only 9 aliens in existence.', 
    '디지털아트', 'Generative Algorithm', 2400, 2400, 2017,
    'https://i.seadn.io/gae/OLd3xGRVYRYdX_Xf4yNfPnvCDYfTDAKhSTUO9Qy5Vf3xXoQy8mXa8PpgmQmX9mXa8PpgmQmX9mXa8PpgmQmX9?w=500',
    'https://i.seadn.io/gae/OLd3xGRVYRYdX_Xf4yNfPnvCDYfTDAKhSTUO9Qy5Vf3xXoQy8mXa8PpgmQmX9mXa8PpgmQmX9mXa8PpgmQmX9?w=300',
    1000000, 200, 99, 99,
    96, 99, 99, 93,
    520000000, 500000000, 520000000, 'minted', 1
  ),
  (
    7, 2, 'Bored Ape #8585', 'Laser eyes Bored Ape with gold chain. Ultra rare combination.', 
    '디지털아트', 'Digital Illustration', 2400, 2400, 2021,
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=500',
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=300',
    800000, 180, 95, 94,
    94, 94, 96, 93,
    260000000, 240000000, 260000000, 'minted', 1
  ),
  (
    8, 3, 'Azuki #4808', 'Red hoodie Azuki with katana. Legendary traits combination.', 
    '디지털아트', 'Anime Digital Art', 2400, 2400, 2022,
    'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=500',
    'https://i.seadn.io/gae/XN0XuD8Uh3jyRWNtPTFeXJg_ht8m5ofDx6aHklOiy4amhFuWUa0JaR6It49AH8tlnYS386Q0TW_-Lmedn0UET_ko1a3CbJGeu5iHMg?w=300',
    600000, 150, 91, 89,
    92, 92, 89, 91,
    78000000, 70000000, 78000000, 'minted', 1
  ),
  (
    9, 4, 'Doodles #1234', 'Holographic Doodle with alien head. Extremely rare traits.', 
    '디지털아트', 'Generative Art', 2400, 2400, 2021,
    'https://i.seadn.io/gae/7gOej3SUvqALR-qkqL_ApAt97SpUKQOZQe88p8jPjeiDDcqITesbAdsLcWlsIg8oh7SRrTpUPfPlm12lb4xDahgP2h32pQQYCsuOM?w=500',
    'https://i.seadn.io/gae/7gOej3SUvqALR-qkqL_ApAt97SpUKQOZQe88p8jPjeiDDcqITesbAdsLcWlsIg8oh7SRrTpUPfPlm12lb4xDahgP2h32pQQYCsuOM?w=300',
    400000, 120, 89, 87,
    90, 91, 87, 89,
    48000000, 42000000, 48000000, 'minted', 1
  ),
  (
    10, 5, 'Moonbirds #7890', 'Mythic Moonbird with golden armor. PROOF holder exclusive.', 
    '디지털아트', 'Pixel Art', 2400, 2400, 2022,
    'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=500',
    'https://i.seadn.io/gae/H-eyNE1MwL5ohL-tCfn_Xa1Sl9M9B4612tLYeUlQubzt4ewhr4huJIR5OLuyO3Z5PpJFSwdm7rq-TikAh7f5eUw338A2cy6HRH75?w=300',
    500000, 140, 92, 90,
    91, 92, 90, 91,
    75000000, 68000000, 75000000, 'minted', 1
  ),
  (
    11, 1, 'CryptoPunk #5217', 'Zombie CryptoPunk with cap. One of 88 zombies.', 
    '디지털아트', 'Generative Algorithm', 2400, 2400, 2017,
    'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=500',
    'https://i.seadn.io/gae/7B0qai02OdHA8P_EOVK672qUliyjQdQDGNrACxs7WnTgZAkJa_wWURnIFKeOh5VTf8cfTqW3wQpozGedaC9mteKphEOtztls02RlWQ?w=300',
    1000000, 200, 97, 98,
    94, 97, 98, 91,
    380000000, 350000000, 380000000, 'minted', 1
  ),
  (
    12, 2, 'Bored Ape #232', 'Trippy fur Bored Ape with crown. Early mint number.', 
    '디지털아트', 'Digital Illustration', 2400, 2400, 2021,
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=500',
    'https://i.seadn.io/gae/5E-6ARY5BSIJXB5aZUxJyhKuWZQlxJhKWQFxlvLCPfG3QnalT5I4jPQBmPYjUaWYeBRBuL4HVW0JQ8qE3hHQ8HfTF6aVOGqCkWqmHA?w=300',
    800000, 180, 94, 93,
    93, 93, 95, 92,
    240000000, 220000000, 240000000, 'minted', 1
  );

-- 평가 이력
INSERT INTO valuation_history (artwork_id, evaluator_name, evaluator_role, artistic_quality, originality, cultural_significance, technical_excellence, market_potential, estimated_value, evaluation_notes) VALUES
  (1, 'NFT Curator Kim', 'expert', 95, 98, 99, 92, 98, 450000000, 'Iconic piece of NFT history'),
  (2, 'Blockchain Analyst Lee', 'expert', 93, 95, 97, 94, 96, 280000000, 'Blue-chip NFT with strong community'),
  (3, 'Crypto Art Critic Park', 'curator', 91, 93, 90, 92, 92, 85000000, 'Rising star in anime NFT space');

-- 컬렉션
INSERT INTO collections (id, name, description, curator_name, cover_image, artwork_count) VALUES
  (1, 'Blue-Chip NFTs', '최고 가치의 NFT 컬렉션', 'NFT Gallery Curator', 'https://i.seadn.io/gcs/files/collection-cover-1.jpg?w=800', 5),
  (2, 'Legendary Traits', '전설적인 특성 조합 NFT', 'Rarity Expert', 'https://i.seadn.io/gcs/files/collection-cover-2.jpg?w=800', 4),
  (3, 'Pixel Perfect', '픽셀 아트 마스터피스', 'Pixel Art Specialist', 'https://i.seadn.io/gcs/files/collection-cover-3.jpg?w=800', 3);

-- 컬렉션-작품 연결
INSERT INTO collection_artworks (collection_id, artwork_id, display_order) VALUES
  (1, 1, 1), (1, 2, 2), (1, 6, 3), (1, 7, 4), (1, 11, 5),
  (2, 3, 1), (2, 8, 2), (2, 9, 3), (2, 10, 4),
  (3, 4, 1), (3, 5, 2), (3, 12, 3);
