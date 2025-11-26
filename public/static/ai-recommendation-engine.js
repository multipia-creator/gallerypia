/**
 * AI-Powered Recommendation Engine
 * Advanced artwork recommendation based on user behavior and preferences
 */

class AIRecommendationEngine {
  constructor() {
    this.userBehavior = this.loadUserBehavior();
    this.weights = {
      viewTime: 0.3,        // 작품 조회 시간
      interactions: 0.25,   // 좋아요, 공유 등
      purchases: 0.25,      // 구매 이력
      similarity: 0.2       // 컨텐츠 유사도
    };
  }

  /**
   * 사용자 행동 데이터 로드
   */
  loadUserBehavior() {
    const stored = localStorage.getItem('user_behavior');
    if (stored) {
      return JSON.parse(stored);
    }
    return {
      viewedArtworks: [],
      likedArtworks: [],
      purchasedArtworks: [],
      searchHistory: [],
      categories: {},
      artists: {}
    };
  }

  /**
   * 사용자 행동 추적
   */
  trackBehavior(action, data) {
    switch (action) {
      case 'view':
        this.trackView(data);
        break;
      case 'like':
        this.trackLike(data);
        break;
      case 'purchase':
        this.trackPurchase(data);
        break;
      case 'search':
        this.trackSearch(data);
        break;
    }
    this.saveBehavior();
  }

  trackView(artwork) {
    const viewData = {
      artworkId: artwork.id,
      timestamp: Date.now(),
      duration: artwork.viewDuration || 0,
      category: artwork.category,
      artist: artwork.artist_name
    };
    
    this.userBehavior.viewedArtworks.push(viewData);
    
    // 카테고리 선호도 증가
    if (!this.userBehavior.categories[artwork.category]) {
      this.userBehavior.categories[artwork.category] = 0;
    }
    this.userBehavior.categories[artwork.category] += 1;
    
    // 아티스트 선호도 증가
    if (!this.userBehavior.artists[artwork.artist_name]) {
      this.userBehavior.artists[artwork.artist_name] = 0;
    }
    this.userBehavior.artists[artwork.artist_name] += 1;
    
    // 최근 100개만 유지
    if (this.userBehavior.viewedArtworks.length > 100) {
      this.userBehavior.viewedArtworks.shift();
    }
  }

  trackLike(artworkId) {
    if (!this.userBehavior.likedArtworks.includes(artworkId)) {
      this.userBehavior.likedArtworks.push(artworkId);
    }
  }

  trackPurchase(artworkId) {
    if (!this.userBehavior.purchasedArtworks.includes(artworkId)) {
      this.userBehavior.purchasedArtworks.push(artworkId);
    }
  }

  trackSearch(query) {
    this.userBehavior.searchHistory.push({
      query,
      timestamp: Date.now()
    });
    
    // 최근 50개만 유지
    if (this.userBehavior.searchHistory.length > 50) {
      this.userBehavior.searchHistory.shift();
    }
  }

  saveBehavior() {
    localStorage.setItem('user_behavior', JSON.stringify(this.userBehavior));
  }

  /**
   * 협업 필터링 기반 추천
   * (현재는 간소화된 버전, 실제로는 서버 사이드 처리 필요)
   */
  async getCollaborativeRecommendations(artworks, limit = 10) {
    const userPreferences = this.getUserPreferences();
    
    const scored = artworks.map(artwork => {
      let score = 0;
      
      // 카테고리 매칭
      if (userPreferences.topCategories.includes(artwork.category)) {
        score += 30;
      }
      
      // 아티스트 매칭
      if (userPreferences.topArtists.includes(artwork.artist_name)) {
        score += 25;
      }
      
      // 가격대 선호도
      const priceScore = this.getPricePreferenceScore(artwork.estimated_value);
      score += priceScore * 20;
      
      // 인기도 (views, likes)
      score += Math.log10(artwork.views + 1) * 5;
      score += Math.log10(artwork.likes + 1) * 5;
      
      // 최신성
      const daysSinceCreated = (Date.now() - new Date(artwork.created_at)) / (1000 * 60 * 60 * 24);
      if (daysSinceCreated < 7) score += 10;
      else if (daysSinceCreated < 30) score += 5;
      
      return { ...artwork, recommendationScore: score };
    });
    
    // 점수순 정렬
    scored.sort((a, b) => b.recommendationScore - a.recommendationScore);
    
    return scored.slice(0, limit);
  }

  /**
   * 컨텐츠 기반 필터링 (이미지 유사도)
   */
  async getContentBasedRecommendations(referenceArtwork, artworks, limit = 10) {
    // 실제로는 서버에서 이미지 feature extraction 후 cosine similarity 계산
    // 현재는 간소화된 버전
    
    const scored = artworks
      .filter(art => art.id !== referenceArtwork.id)
      .map(artwork => {
        let similarity = 0;
        
        // 카테고리 유사도
        if (artwork.category === referenceArtwork.category) {
          similarity += 40;
        }
        
        // 아티스트 유사도
        if (artwork.artist_name === referenceArtwork.artist_name) {
          similarity += 30;
        }
        
        // 가격대 유사도
        const priceDiff = Math.abs(artwork.estimated_value - referenceArtwork.estimated_value);
        const priceRange = Math.max(artwork.estimated_value, referenceArtwork.estimated_value);
        similarity += (1 - priceDiff / priceRange) * 20;
        
        // 태그 유사도 (있다면)
        if (artwork.tags && referenceArtwork.tags) {
          const commonTags = artwork.tags.filter(tag => referenceArtwork.tags.includes(tag));
          similarity += commonTags.length * 5;
        }
        
        return { ...artwork, similarityScore: similarity };
      });
    
    scored.sort((a, b) => b.similarityScore - a.similarityScore);
    
    return scored.slice(0, limit);
  }

  /**
   * 하이브리드 추천 (협업 + 컨텐츠 기반)
   */
  async getHybridRecommendations(artworks, referenceArtwork = null, limit = 10) {
    if (referenceArtwork) {
      // 컨텐츠 기반 우선
      return this.getContentBasedRecommendations(referenceArtwork, artworks, limit);
    } else {
      // 협업 필터링
      return this.getCollaborativeRecommendations(artworks, limit);
    }
  }

  /**
   * 사용자 선호도 분석
   */
  getUserPreferences() {
    // 상위 카테고리
    const sortedCategories = Object.entries(this.userBehavior.categories)
      .sort((a, b) => b[1] - a[1])
      .map(([category]) => category);
    
    // 상위 아티스트
    const sortedArtists = Object.entries(this.userBehavior.artists)
      .sort((a, b) => b[1] - a[1])
      .map(([artist]) => artist);
    
    return {
      topCategories: sortedCategories.slice(0, 3),
      topArtists: sortedArtists.slice(0, 5),
      viewCount: this.userBehavior.viewedArtworks.length,
      likeCount: this.userBehavior.likedArtworks.length,
      purchaseCount: this.userBehavior.purchasedArtworks.length
    };
  }

  /**
   * 가격대 선호도 점수 계산
   */
  getPricePreferenceScore(price) {
    // 사용자가 본 작품들의 평균 가격 계산
    const viewedPrices = this.userBehavior.viewedArtworks
      .map(v => v.price || 0)
      .filter(p => p > 0);
    
    if (viewedPrices.length === 0) return 0.5;
    
    const avgPrice = viewedPrices.reduce((sum, p) => sum + p, 0) / viewedPrices.length;
    
    // 평균 가격 근처일수록 높은 점수
    const priceDiff = Math.abs(price - avgPrice);
    const score = 1 - Math.min(priceDiff / avgPrice, 1);
    
    return score;
  }

  /**
   * 추천 품질 평가 (A/B 테스팅용)
   */
  evaluateRecommendation(recommendedId, action) {
    const metrics = JSON.parse(localStorage.getItem('recommendation_metrics') || '{}');
    
    if (!metrics[recommendedId]) {
      metrics[recommendedId] = {
        views: 0,
        clicks: 0,
        likes: 0,
        purchases: 0
      };
    }
    
    metrics[recommendedId][action]++;
    
    localStorage.setItem('recommendation_metrics', JSON.stringify(metrics));
  }

  /**
   * 추천 다양성 보장 (Filter Bubble 방지)
   */
  ensureDiversity(recommendations, diversityRatio = 0.3) {
    const diverseCount = Math.floor(recommendations.length * diversityRatio);
    const mainRecommendations = recommendations.slice(0, recommendations.length - diverseCount);
    
    // 랜덤하게 다른 카테고리/아티스트 추가
    const diverse = recommendations
      .filter(art => 
        !mainRecommendations.some(main => 
          main.category === art.category || main.artist_name === art.artist_name
        )
      )
      .sort(() => Math.random() - 0.5)
      .slice(0, diverseCount);
    
    return [...mainRecommendations, ...diverse];
  }
}

// Export for use
if (typeof window !== 'undefined') {
  window.AIRecommendationEngine = AIRecommendationEngine;
  console.log('AI Recommendation Engine loaded');
}
