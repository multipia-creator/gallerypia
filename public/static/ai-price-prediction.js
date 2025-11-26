/**
 * AI-Powered Price Prediction Engine
 * Advanced price prediction based on multiple factors
 */

class AIPricePrediction {
  constructor() {
    this.model = this.initializeModel();
    this.historicalData = this.loadHistoricalData();
  }

  /**
   * 가격 예측 모델 초기화
   */
  initializeModel() {
    return {
      weights: {
        artistPopularity: 0.25,
        artworkQuality: 0.20,
        marketTrend: 0.20,
        historicalPrice: 0.15,
        socialEngagement: 0.10,
        scarcity: 0.10
      },
      confidence: 0.75
    };
  }

  /**
   * 과거 거래 데이터 로드
   */
  loadHistoricalData() {
    const stored = localStorage.getItem('price_history');
    if (stored) {
      return JSON.parse(stored);
    }
    return [];
  }

  /**
   * 작품 가격 예측 (고급 버전)
   */
  async predictPrice(artwork) {
    const features = await this.extractFeatures(artwork);
    const basePrice = this.calculateBasePrice(features);
    const marketAdjustment = this.getMarketAdjustment(artwork.category);
    const trendMultiplier = this.getTrendMultiplier(artwork);
    
    const predictedPrice = basePrice * marketAdjustment * trendMultiplier;
    const confidence = this.calculateConfidence(features);
    const priceRange = this.getPriceRange(predictedPrice, confidence);
    
    return {
      predictedPrice: Math.round(predictedPrice),
      confidence: Math.round(confidence * 100),
      priceRange: {
        min: Math.round(priceRange.min),
        max: Math.round(priceRange.max)
      },
      factors: this.explainPrediction(features, artwork),
      recommendations: this.getPricingRecommendations(predictedPrice, artwork)
    };
  }

  /**
   * 작품 특징 추출
   */
  async extractFeatures(artwork) {
    return {
      // 아티스트 관련
      artistFollowers: artwork.artist_followers || 0,
      artistRating: artwork.artist_rating || 3.0,
      artistTotalSales: artwork.artist_total_sales || 0,
      artistAvgPrice: artwork.artist_avg_price || 0,
      
      // 작품 관련
      views: artwork.views || 0,
      likes: artwork.likes || 0,
      shares: artwork.shares || 0,
      comments: artwork.comments || 0,
      
      // 시장 관련
      category: artwork.category || 'Unknown',
      createdDate: new Date(artwork.created_at || Date.now()),
      dimensions: artwork.dimensions || 'Unknown',
      medium: artwork.medium || 'Digital',
      
      // NFT 관련
      blockchain: artwork.blockchain || 'Ethereum',
      royaltyPercentage: artwork.royalty_percentage || 10,
      
      // 희소성
      editionSize: artwork.edition_size || 1,
      currentEdition: artwork.current_edition || 1
    };
  }

  /**
   * 기본 가격 계산
   */
  calculateBasePrice(features) {
    let basePrice = 1000; // 최소 기본가
    
    // 아티스트 인기도
    const popularityScore = Math.log10(features.artistFollowers + 10) * 500;
    basePrice += popularityScore;
    
    // 아티스트 평점
    basePrice += (features.artistRating - 3.0) * 2000;
    
    // 아티스트 평균 판매가
    if (features.artistAvgPrice > 0) {
      basePrice += features.artistAvgPrice * 0.5;
    }
    
    // 작품 인기도
    const engagementScore = 
      features.views * 0.1 +
      features.likes * 5 +
      features.shares * 10 +
      features.comments * 15;
    basePrice += engagementScore;
    
    // 희소성 (에디션 수가 적을수록 비쌈)
    const scarcityMultiplier = 1 + (1 / Math.max(features.editionSize, 1));
    basePrice *= scarcityMultiplier;
    
    return basePrice;
  }

  /**
   * 시장 조정 계수
   */
  getMarketAdjustment(category) {
    const categoryMultipliers = {
      'Abstract': 1.3,
      'Contemporary': 1.2,
      'Digital Art': 1.15,
      'Photography': 1.0,
      'Illustration': 0.95,
      'AI Art': 0.9,
      'Unknown': 1.0
    };
    
    return categoryMultipliers[category] || 1.0;
  }

  /**
   * 트렌드 승수 계산
   */
  getTrendMultiplier(artwork) {
    const daysSinceCreated = (Date.now() - new Date(artwork.created_at)) / (1000 * 60 * 60 * 24);
    
    // 새 작품 (7일 이내) - 프리미엄
    if (daysSinceCreated < 7) return 1.15;
    
    // 최근 작품 (30일 이내)
    if (daysSinceCreated < 30) return 1.05;
    
    // 오래된 작품 - 약간 할인
    if (daysSinceCreated > 365) return 0.95;
    
    return 1.0;
  }

  /**
   * 신뢰도 계산
   */
  calculateConfidence(features) {
    let confidence = 0.5; // 기본 신뢰도
    
    // 데이터 충분성
    if (features.artistTotalSales > 10) confidence += 0.15;
    if (features.views > 100) confidence += 0.10;
    if (features.likes > 20) confidence += 0.05;
    
    // 아티스트 활동성
    if (features.artistFollowers > 100) confidence += 0.10;
    if (features.artistRating >= 4.0) confidence += 0.10;
    
    return Math.min(confidence, 0.95);
  }

  /**
   * 가격 범위 계산
   */
  getPriceRange(predictedPrice, confidence) {
    const uncertainty = 1 - confidence;
    const range = predictedPrice * uncertainty;
    
    return {
      min: predictedPrice - range,
      max: predictedPrice + range
    };
  }

  /**
   * 예측 설명 생성
   */
  explainPrediction(features, artwork) {
    const factors = [];
    
    // 긍정적 요인
    if (features.artistRating >= 4.0) {
      factors.push({
        factor: 'High Artist Rating',
        impact: '+15%',
        description: `Artist rating of ${features.artistRating.toFixed(1)}/5.0`
      });
    }
    
    if (features.artistFollowers > 500) {
      factors.push({
        factor: 'Popular Artist',
        impact: '+20%',
        description: `${features.artistFollowers} followers`
      });
    }
    
    if (features.likes > 50) {
      factors.push({
        factor: 'High Engagement',
        impact: '+10%',
        description: `${features.likes} likes`
      });
    }
    
    if (features.editionSize === 1) {
      factors.push({
        factor: 'Unique Edition',
        impact: '+25%',
        description: '1/1 artwork (highest scarcity)'
      });
    }
    
    // 부정적 요인
    const daysSinceCreated = (Date.now() - new Date(artwork.created_at)) / (1000 * 60 * 60 * 24);
    if (daysSinceCreated > 365) {
      factors.push({
        factor: 'Older Artwork',
        impact: '-5%',
        description: `Created ${Math.floor(daysSinceCreated)} days ago`
      });
    }
    
    if (features.views < 100) {
      factors.push({
        factor: 'Low Visibility',
        impact: '-10%',
        description: `Only ${features.views} views`
      });
    }
    
    return factors;
  }

  /**
   * 가격 책정 권장사항
   */
  getPricingRecommendations(predictedPrice, artwork) {
    const recommendations = [];
    
    // 최적 가격대
    recommendations.push({
      type: 'optimal_price',
      title: 'Optimal Pricing',
      description: `Set price at ${Math.round(predictedPrice * 0.95)} - ${Math.round(predictedPrice * 1.05)}`,
      priority: 'high'
    });
    
    // 빠른 판매 원할 경우
    recommendations.push({
      type: 'quick_sale',
      title: 'Quick Sale Strategy',
      description: `Price at ${Math.round(predictedPrice * 0.85)} for faster sale`,
      priority: 'medium'
    });
    
    // 프리미엄 가격
    if (artwork.artist_rating >= 4.5) {
      recommendations.push({
        type: 'premium_pricing',
        title: 'Premium Pricing',
        description: `Your high rating allows premium pricing up to ${Math.round(predictedPrice * 1.2)}`,
        priority: 'low'
      });
    }
    
    // 경매 추천
    if (predictedPrice > 5000) {
      recommendations.push({
        type: 'auction',
        title: 'Auction Recommended',
        description: `Consider auction starting at ${Math.round(predictedPrice * 0.7)}`,
        priority: 'high'
      });
    }
    
    return recommendations;
  }

  /**
   * 시장 트렌드 분석
   */
  async getMarketTrend(category, days = 30) {
    // 실제로는 API 호출, 현재는 시뮬레이션
    const trend = Math.random() > 0.5 ? 'up' : 'down';
    const percentage = Math.random() * 20;
    
    return {
      category,
      trend,
      percentage: percentage.toFixed(1),
      period: `${days} days`,
      description: trend === 'up' 
        ? `${category} prices increased by ${percentage.toFixed(1)}% in last ${days} days`
        : `${category} prices decreased by ${percentage.toFixed(1)}% in last ${days} days`
    };
  }

  /**
   * 배치 가격 예측
   */
  async batchPredict(artworks) {
    const predictions = await Promise.all(
      artworks.map(artwork => this.predictPrice(artwork))
    );
    
    return predictions;
  }

  /**
   * 가격 이력 저장
   */
  savePriceHistory(artworkId, actualPrice, predictedPrice) {
    this.historicalData.push({
      artworkId,
      actualPrice,
      predictedPrice,
      accuracy: 1 - Math.abs(actualPrice - predictedPrice) / actualPrice,
      timestamp: Date.now()
    });
    
    // 최근 1000개만 유지
    if (this.historicalData.length > 1000) {
      this.historicalData.shift();
    }
    
    localStorage.setItem('price_history', JSON.stringify(this.historicalData));
  }

  /**
   * 모델 정확도 계산
   */
  getModelAccuracy() {
    if (this.historicalData.length === 0) {
      return { accuracy: 0, sampleSize: 0 };
    }
    
    const avgAccuracy = this.historicalData.reduce((sum, data) => sum + data.accuracy, 0) / this.historicalData.length;
    
    return {
      accuracy: (avgAccuracy * 100).toFixed(1),
      sampleSize: this.historicalData.length
    };
  }
}

// Export
if (typeof window !== 'undefined') {
  window.AIPricePrediction = AIPricePrediction;
  console.log('AI Price Prediction Engine loaded');
}
