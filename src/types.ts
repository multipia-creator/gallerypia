// Cloudflare D1 Database Binding
export type Bindings = {
  DB: D1Database;
  R2: R2Bucket;
  SENDGRID_API_KEY?: string; // SendGrid API Key for email notifications
}

// 작가 타입
export interface Artist {
  id: number;
  name: string;
  email?: string;
  bio?: string;
  career_years: number;
  education?: string;
  exhibitions_count: number;
  awards_count: number;
  solo_exhibitions_count: number;
  group_exhibitions_count: number;
  competition_awards_count: number;
  achievement_score: number;
  latest_exhibition_year: number;
  latest_award_year: number;
  profile_image?: string;
  wallet_address?: string;
  created_at: string;
  updated_at: string;
}

// 작품 타입 (완전한 5개 모듈 평가 시스템)
export interface Artwork {
  id: number;
  artist_id: number;
  title: string;
  description?: string;
  category: string;
  technique?: string;
  size_width?: number;
  size_height?: number;
  size_depth?: number;
  creation_year?: number;
  image_url: string;
  thumbnail_url?: string;
  
  // 모듈 1: 작가 업적 평가
  artist_achievement_score: number;
  
  // 모듈 2: 작품 내용 평가 (4가지 지표)
  content_depth_score: number; // 내용성: 주제의식, 메시지
  expression_score: number; // 표현성: 기법, 시각완성도
  originality_innovation_score: number; // 독창성: 차별성, 혁신성
  collection_value_score: number; // 소장가치: 시대적의미, 미래전망
  
  // 모듈 3: 저작권/소유권/라이선스 인증
  blockchain_hash?: string;
  copyright_registration_number?: string;
  license_type: string;
  license_scope?: string;
  certification_score: number;
  
  // 모듈 4: 전문가 정성 평가 (별도 테이블에서 집계)
  // technique_mastery, art_historical_significance, marketability, development_potential
  
  // 모듈 5: 대중 인지도/인기도
  youtube_views: number;
  instagram_engagement: number;
  platform_likes: number;
  platform_comments: number;
  platform_shares: number;
  google_trends_score: number;
  media_coverage_count: number;
  popularity_score: number;
  
  // 5개 모듈 최종 점수
  artist_achievement_final_score: number;
  artwork_content_final_score: number;
  certification_final_score: number;
  expert_evaluation_final_score: number;
  popularity_final_score: number;
  
  // 가중치 (α1~α5, 합=1)
  weight_artist: number; // α1
  weight_artwork: number; // α2
  weight_certification: number; // α3
  weight_expert: number; // α4
  weight_popularity: number; // α5
  
  // 최종 가치
  final_value_score: number;
  estimated_value: number;
  min_price: number;
  current_price: number;
  
  // NFT 관련
  is_minted: boolean;
  nft_token_id?: string;
  nft_contract_address?: string;
  blockchain_network?: string;
  ipfs_hash?: string;
  
  status: 'draft' | 'pending_review' | 'approved' | 'minted' | 'sold';
  views_count: number;
  likes_count: number;
  
  created_at: string;
  updated_at: string;
}

// 전문가 평가
export interface ExpertEvaluation {
  id: number;
  artwork_id: number;
  expert_name: string;
  expert_level: 'curator' | 'director' | 'critic' | 'phd';
  expert_institution?: string;
  technique_mastery_score: number;
  art_historical_significance_score: number;
  marketability_score: number;
  development_potential_score: number;
  overall_score: number;
  evaluation_comment?: string;
  evaluated_at: string;
}

// 작품 with 작가 정보
export interface ArtworkWithArtist extends Artwork {
  artist_name: string;
  artist_profile_image?: string;
}

// API 응답 타입
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ============================================
// 평가 계산 함수들
// ============================================

// 모듈 1: 작가 업적 점수 계산
export function calculateArtistAchievement(artist: Partial<Artist>): number {
  const currentYear = new Date().getFullYear();
  
  const soloExhibitionScore = (artist.solo_exhibitions_count || 0) * 10;
  const groupExhibitionScore = (artist.group_exhibitions_count || 0) * 5;
  
  const authorityWeight = 1.0;
  
  const latestYear = artist.latest_exhibition_year || currentYear;
  const yearsDiff = currentYear - latestYear;
  const recencyCoefficient = yearsDiff <= 5 ? 1.0 : Math.max(0.2, 1.0 - (yearsDiff - 5) * 0.1);
  
  const awardScore = (artist.competition_awards_count || 0) * 15;
  
  const exhibitionScore = (soloExhibitionScore + groupExhibitionScore) * authorityWeight * recencyCoefficient;
  const totalScore = exhibitionScore + awardScore;
  
  return Math.min(100, Math.round(totalScore));
}

// 모듈 2: 작품 내용 평가 점수 계산
export function calculateArtworkContent(artwork: Partial<Artwork>): number {
  // 4가지 지표 평균
  const contentDepth = artwork.content_depth_score || 0;
  const expression = artwork.expression_score || 0;
  const originality = artwork.originality_innovation_score || 0;
  const collectionValue = artwork.collection_value_score || 0;
  
  return Math.round((contentDepth + expression + originality + collectionValue) / 4);
}

// 모듈 3: 인증 점수 계산
export function calculateCertification(artwork: Partial<Artwork>): number {
  let score = 0;
  
  // 블록체인 해시 존재 (+40점)
  if (artwork.blockchain_hash) score += 40;
  
  // 저작권 등록번호 존재 (+40점)
  if (artwork.copyright_registration_number) score += 40;
  
  // 라이선스 명시 (+20점)
  if (artwork.license_type && artwork.license_scope) score += 20;
  
  return Math.min(100, score);
}

// 모듈 4: 전문가 평가 점수 계산 (가중평균)
export function calculateExpertEvaluation(evaluations: ExpertEvaluation[]): number {
  if (!evaluations || evaluations.length === 0) return 0;
  
  // 전문가 등급별 가중치
  const weights: Record<string, number> = {
    'curator': 1.3,
    'director': 1.2,
    'critic': 1.1,
    'phd': 1.0
  };
  
  let totalWeightedScore = 0;
  let totalWeight = 0;
  
  evaluations.forEach(evaluation => {
    const weight = weights[evaluation.expert_level] || 1.0;
    const avgScore = (
      evaluation.technique_mastery_score +
      evaluation.art_historical_significance_score +
      evaluation.marketability_score +
      evaluation.development_potential_score
    ) / 4;
    
    totalWeightedScore += avgScore * weight;
    totalWeight += weight;
  });
  
  return totalWeight > 0 ? Math.round(totalWeightedScore / totalWeight) : 0;
}

// 모듈 5: 대중 인기도 점수 계산
export function calculatePopularity(artwork: Partial<Artwork>): number {
  // 각 지표 정규화 및 가중합
  const youtubeScore = Math.min(100, (artwork.youtube_views || 0) / 10000 * 100);
  const instagramScore = Math.min(100, (artwork.instagram_engagement || 0) / 1000 * 100);
  const platformScore = Math.min(100, (
    (artwork.platform_likes || 0) +
    (artwork.platform_comments || 0) * 2 +
    (artwork.platform_shares || 0) * 3
  ) / 100 * 100);
  const trendsScore = artwork.google_trends_score || 0;
  const mediaScore = Math.min(100, (artwork.media_coverage_count || 0) * 10);
  
  return Math.round((youtubeScore + instagramScore + platformScore + trendsScore + mediaScore) / 5);
}

// 최종 가치 점수 계산
export function calculateFinalValue(
  artistScore: number,
  artworkScore: number,
  certificationScore: number,
  expertScore: number,
  popularityScore: number,
  weights: {
    artist: number,
    artwork: number,
    certification: number,
    expert: number,
    popularity: number
  }
): number {
  // 가중치 합 검증
  const weightSum = weights.artist + weights.artwork + weights.certification + weights.expert + weights.popularity;
  if (Math.abs(weightSum - 1.0) > 0.001) {
    throw new Error('가중치의 합은 1.0이어야 합니다.');
  }
  
  // 최종 가치 점수 = Σ(모듈점수 × 가중치)
  const finalScore = (
    artistScore * weights.artist +
    artworkScore * weights.artwork +
    certificationScore * weights.certification +
    expertScore * weights.expert +
    popularityScore * weights.popularity
  );
  
  return Math.round(finalScore);
}

// 점수를 원화로 환산 (기본가 1천만원 기준)
export function scoreToKRW(score: number, basePrice: number = 10000000): number {
  // 점수에 따른 배율 적용 (0점: 1배, 100점: 11배)
  const multiplier = 1 + (score / 10);
  return Math.round(basePrice * multiplier);
}

// ETH 환율 계산
export function krwToEth(krw: number, ethPriceInKrw: number = 4500000): number {
  return krw / ethPriceInKrw;
}

export function ethToKrw(eth: number, ethPriceInKrw: number = 4500000): number {
  return eth * ethPriceInKrw;
}
