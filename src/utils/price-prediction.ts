/**
 * AI Price Prediction Model - Phase 10.5
 * 작품 가격 예측 알고리즘
 * 
 * 기반: 선형 회귀 + 가중 평균 + 시장 트렌드 분석
 */

export interface ArtworkFeatures {
  // 작가 특징
  artist_achievement_score: number
  artist_career_years: number
  artist_solo_exhibitions: number
  artist_group_exhibitions: number
  artist_awards: number
  
  // 작품 특징
  content_depth_score: number
  expression_score: number
  originality_innovation_score: number
  collection_value_score: number
  certification_score: number
  
  // 전문가 평가
  expert_evaluation_score: number
  expert_count: number
  
  // 대중 인기도
  popularity_score: number
  views_count: number
  likes_count: number
  
  // 시장 데이터
  category: string
  size_cm2?: number
  creation_year?: number
}

export interface PricePrediction {
  predicted_price: number
  confidence_score: number
  price_range: {
    min: number
    max: number
  }
  factors: {
    name: string
    impact: number
    weight: number
  }[]
  market_comparison: {
    similar_artworks_avg: number
    percentile: number
  }
  recommendation: string
}

/**
 * 가격 예측 메인 함수
 */
export function predictArtworkPrice(
  features: ArtworkFeatures,
  historicalData: any[] = []
): PricePrediction {
  // 1. 기본 가격 계산 (가치 점수 기반)
  const basePrice = calculateBasePrice(features)
  
  // 2. 시장 조정 (트렌드 반영)
  const marketMultiplier = calculateMarketMultiplier(features, historicalData)
  
  // 3. 신뢰도 계산
  const confidence = calculateConfidence(features)
  
  // 4. 가격 범위 계산 (신뢰구간)
  const priceRange = calculatePriceRange(basePrice * marketMultiplier, confidence)
  
  // 5. 영향 요인 분석
  const factors = analyzeImpactFactors(features)
  
  // 6. 시장 비교
  const marketComparison = compareWithMarket(basePrice * marketMultiplier, features, historicalData)
  
  // 7. 추천사항 생성
  const recommendation = generateRecommendation(basePrice * marketMultiplier, confidence, factors)
  
  return {
    predicted_price: Math.round(basePrice * marketMultiplier * 100) / 100,
    confidence_score: confidence,
    price_range: priceRange,
    factors: factors,
    market_comparison: marketComparison,
    recommendation: recommendation
  }
}

/**
 * 기본 가격 계산
 */
function calculateBasePrice(features: ArtworkFeatures): number {
  const BASE_PRICE = 1.0 // 기본 1 ETH
  
  // 가중치 설정
  const weights = {
    artist: 0.25,
    artwork: 0.30,
    certification: 0.15,
    expert: 0.20,
    popularity: 0.10
  }
  
  // 각 점수 정규화 (0-100 → 0-1)
  const normalizedScores = {
    artist: features.artist_achievement_score / 100,
    artwork: (
      features.content_depth_score +
      features.expression_score +
      features.originality_innovation_score +
      features.collection_value_score
    ) / 400,
    certification: features.certification_score / 100,
    expert: features.expert_evaluation_score / 100,
    popularity: features.popularity_score / 100
  }
  
  // 가중 평균
  const valueScore = 
    normalizedScores.artist * weights.artist +
    normalizedScores.artwork * weights.artwork +
    normalizedScores.certification * weights.certification +
    normalizedScores.expert * weights.expert +
    normalizedScores.popularity * weights.popularity
  
  // 가격 계산: 지수 함수 적용 (높은 점수일수록 가격 급증)
  // Price = BASE_PRICE * e^(valueScore * 2)
  return BASE_PRICE * Math.exp(valueScore * 2)
}

/**
 * 시장 승수 계산
 */
function calculateMarketMultiplier(features: ArtworkFeatures, historicalData: any[]): number {
  let multiplier = 1.0
  
  // 1. 카테고리 트렌드
  const categoryTrend = calculateCategoryTrend(features.category, historicalData)
  multiplier *= categoryTrend
  
  // 2. 시간 가치 (오래된 작품일수록 가치 상승)
  if (features.creation_year) {
    const age = new Date().getFullYear() - features.creation_year
    if (age >= 50) multiplier *= 1.5
    else if (age >= 20) multiplier *= 1.2
    else if (age >= 10) multiplier *= 1.1
  }
  
  // 3. 작가 경력
  if (features.artist_career_years >= 30) multiplier *= 1.3
  else if (features.artist_career_years >= 20) multiplier *= 1.2
  else if (features.artist_career_years >= 10) multiplier *= 1.1
  
  // 4. 전시 이력
  const exhibitionBonus = (features.artist_solo_exhibitions * 0.05) + (features.artist_group_exhibitions * 0.02)
  multiplier *= (1 + Math.min(exhibitionBonus, 0.5)) // 최대 50% 보너스
  
  // 5. 수상 이력
  multiplier *= (1 + Math.min(features.artist_awards * 0.1, 0.3)) // 최대 30% 보너스
  
  // 6. 인기도 보너스
  if (features.views_count >= 10000) multiplier *= 1.2
  else if (features.views_count >= 5000) multiplier *= 1.1
  
  if (features.likes_count >= 1000) multiplier *= 1.15
  else if (features.likes_count >= 500) multiplier *= 1.05
  
  return multiplier
}

/**
 * 카테고리 트렌드 계산
 */
function calculateCategoryTrend(category: string, historicalData: any[]): number {
  if (!historicalData || historicalData.length === 0) {
    return 1.0
  }
  
  // 최근 30일간 카테고리별 평균 가격 추이
  const categoryData = historicalData.filter(d => d.category === category)
  
  if (categoryData.length < 2) {
    return 1.0
  }
  
  // 간단한 선형 트렌드 계산
  const avgPrices = categoryData.map(d => d.price)
  const recentAvg = avgPrices.slice(-5).reduce((a, b) => a + b, 0) / 5
  const oldAvg = avgPrices.slice(0, 5).reduce((a, b) => a + b, 0) / 5
  
  const trend = recentAvg / oldAvg
  
  // 트렌드를 0.8 ~ 1.2 범위로 제한
  return Math.max(0.8, Math.min(1.2, trend))
}

/**
 * 신뢰도 계산
 */
function calculateConfidence(features: ArtworkFeatures): number {
  let confidence = 0
  
  // 1. 데이터 완성도 (최대 40점)
  let completeness = 0
  if (features.artist_achievement_score > 0) completeness += 5
  if (features.content_depth_score > 0) completeness += 5
  if (features.expression_score > 0) completeness += 5
  if (features.originality_innovation_score > 0) completeness += 5
  if (features.collection_value_score > 0) completeness += 5
  if (features.certification_score > 0) completeness += 5
  if (features.expert_evaluation_score > 0) completeness += 5
  if (features.popularity_score > 0) completeness += 5
  
  confidence += completeness
  
  // 2. 전문가 평가 수 (최대 30점)
  const expertScore = Math.min(features.expert_count * 5, 30)
  confidence += expertScore
  
  // 3. 시장 데이터 (최대 30점)
  let marketScore = 0
  if (features.views_count >= 1000) marketScore += 10
  else if (features.views_count >= 100) marketScore += 5
  
  if (features.likes_count >= 100) marketScore += 10
  else if (features.likes_count >= 10) marketScore += 5
  
  if (features.creation_year) marketScore += 10
  
  confidence += marketScore
  
  // 0-100 범위로 정규화
  return Math.min(100, confidence)
}

/**
 * 가격 범위 계산
 */
function calculatePriceRange(predictedPrice: number, confidence: number): { min: number, max: number } {
  // 신뢰도에 따라 범위 조정
  // 높은 신뢰도 = 좁은 범위
  const uncertainty = (100 - confidence) / 100
  const variance = predictedPrice * uncertainty * 0.5
  
  return {
    min: Math.max(0.1, predictedPrice - variance),
    max: predictedPrice + variance
  }
}

/**
 * 영향 요인 분석
 */
function analyzeImpactFactors(features: ArtworkFeatures): Array<{ name: string, impact: number, weight: number }> {
  const factors = [
    {
      name: '작가 업적',
      impact: features.artist_achievement_score,
      weight: 25
    },
    {
      name: '작품 내용',
      impact: (
        features.content_depth_score +
        features.expression_score +
        features.originality_innovation_score +
        features.collection_value_score
      ) / 4,
      weight: 30
    },
    {
      name: '인증/소유권',
      impact: features.certification_score,
      weight: 15
    },
    {
      name: '전문가 평가',
      impact: features.expert_evaluation_score,
      weight: 20
    },
    {
      name: '대중 인기도',
      impact: features.popularity_score,
      weight: 10
    }
  ]
  
  return factors.sort((a, b) => b.impact * b.weight - a.impact * a.weight)
}

/**
 * 시장 비교
 */
function compareWithMarket(
  predictedPrice: number,
  features: ArtworkFeatures,
  historicalData: any[]
): { similar_artworks_avg: number, percentile: number } {
  if (!historicalData || historicalData.length === 0) {
    return {
      similar_artworks_avg: predictedPrice,
      percentile: 50
    }
  }
  
  // 유사 작품 필터링 (같은 카테고리)
  const similar = historicalData.filter(d => d.category === features.category)
  
  if (similar.length === 0) {
    return {
      similar_artworks_avg: predictedPrice,
      percentile: 50
    }
  }
  
  // 평균 가격
  const avgPrice = similar.reduce((sum, d) => sum + d.price, 0) / similar.length
  
  // 백분위수 계산
  const sortedPrices = similar.map(d => d.price).sort((a, b) => a - b)
  const lowerCount = sortedPrices.filter(p => p < predictedPrice).length
  const percentile = (lowerCount / sortedPrices.length) * 100
  
  return {
    similar_artworks_avg: avgPrice,
    percentile: Math.round(percentile)
  }
}

/**
 * 추천사항 생성
 */
function generateRecommendation(
  predictedPrice: number,
  confidence: number,
  factors: Array<{ name: string, impact: number, weight: number }>
): string {
  if (confidence >= 80) {
    return `높은 신뢰도(${confidence}%)로 ${predictedPrice.toFixed(2)} ETH 가격을 추천합니다. 주요 강점: ${factors[0].name}(${factors[0].impact.toFixed(1)}점).`
  } else if (confidence >= 60) {
    return `중간 신뢰도(${confidence}%)로 ${predictedPrice.toFixed(2)} ETH 가격을 제안합니다. ${factors[1].name} 보완 시 가격 상승 가능합니다.`
  } else {
    const weakFactor = factors[factors.length - 1]
    return `낮은 신뢰도(${confidence}%)입니다. ${weakFactor.name} 데이터를 보완하면 더 정확한 예측이 가능합니다. 현재 예측: ${predictedPrice.toFixed(2)} ETH`
  }
}

/**
 * 배치 예측 (여러 작품)
 */
export function batchPredictPrices(
  artworks: ArtworkFeatures[],
  historicalData: any[] = []
): PricePrediction[] {
  return artworks.map(artwork => predictArtworkPrice(artwork, historicalData))
}

/**
 * 가격 트렌드 예측 (미래 N일)
 */
export function predictPriceTrend(
  currentPrice: number,
  features: ArtworkFeatures,
  days: number
): Array<{ date: string, predicted_price: number }> {
  const trend = []
  const dailyGrowthRate = 0.001 // 0.1% per day (조정 가능)
  
  for (let i = 0; i <= days; i++) {
    const date = new Date()
    date.setDate(date.getDate() + i)
    
    // 인기도 증가에 따른 가격 상승
    const popularityBonus = (features.views_count / 1000) * dailyGrowthRate
    const growthFactor = Math.pow(1 + dailyGrowthRate + popularityBonus, i)
    
    trend.push({
      date: date.toISOString().split('T')[0],
      predicted_price: Math.round(currentPrice * growthFactor * 100) / 100
    })
  }
  
  return trend
}
