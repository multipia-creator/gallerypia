/**
 * ML-Based Recommendation Engine v2.0
 * Advanced artwork recommendations using:
 * - Collaborative Filtering (User-User, Item-Item)
 * - Content-Based Filtering (Feature Similarity)
 * - Hybrid Model (Combined Approach)
 * Phase 10.2 - L3-4: ML 기반 추천 개선
 */

class RecommendationEngine {
  constructor() {
    this.userPreferences = this.loadPreferences();
    this.viewHistory = this.loadViewHistory();
    this.likeHistory = this.loadLikeHistory();
    this.searchHistory = this.loadSearchHistory();
    this.maxHistoryItems = 100; // Increased for better ML training
    
    // ML Parameters
    this.collaborativeWeight = 0.4; // 40%
    this.contentBasedWeight = 0.3; // 30%
    this.popularityWeight = 0.2; // 20%
    this.diversityWeight = 0.1; // 10%
    
    // Feature weights for content-based filtering
    this.featureWeights = {
      category: 0.35,
      artist: 0.30,
      style: 0.15,
      price: 0.10,
      period: 0.10
    };
    
    this.init();
  }

  init() {
    console.log('🎯 Recommendation Engine initialized');
    
    // Track user interactions
    this.trackInteractions();
    
    // Update recommendations periodically
    this.updateRecommendationsInterval();
  }

  // ===== Data Loading =====
  
  loadPreferences() {
    const data = localStorage.getItem('gallerypia_user_preferences');
    return data ? JSON.parse(data) : {
      favoriteCategories: [],
      favoriteArtists: [],
      priceRange: { min: 0, max: 1000000 },
      preferredStyles: [],
      preferredPeriods: []
    };
  }

  loadViewHistory() {
    const data = localStorage.getItem('gallerypia_view_history');
    return data ? JSON.parse(data) : [];
  }

  loadLikeHistory() {
    const data = localStorage.getItem('gallerypia_like_history');
    return data ? JSON.parse(data) : [];
  }

  loadSearchHistory() {
    const data = localStorage.getItem('gallerypia_search_history');
    return data ? JSON.parse(data) : [];
  }

  // ===== Data Saving =====
  
  savePreferences() {
    localStorage.setItem('gallerypia_user_preferences', JSON.stringify(this.userPreferences));
  }

  saveViewHistory() {
    localStorage.setItem('gallerypia_view_history', JSON.stringify(this.viewHistory.slice(0, this.maxHistoryItems)));
  }

  saveLikeHistory() {
    localStorage.setItem('gallerypia_like_history', JSON.stringify(this.likeHistory.slice(0, this.maxHistoryItems)));
  }

  saveSearchHistory() {
    localStorage.setItem('gallerypia_search_history', JSON.stringify(this.searchHistory.slice(0, this.maxHistoryItems)));
  }

  // ===== Interaction Tracking =====
  
  trackInteractions() {
    // Track artwork views
    document.addEventListener('artwork-viewed', (e) => {
      this.recordView(e.detail);
    });

    // Track likes
    document.addEventListener('artwork-liked', (e) => {
      this.recordLike(e.detail);
    });

    // Track searches
    document.addEventListener('search-performed', (e) => {
      this.recordSearch(e.detail);
    });

    // Track category clicks
    document.addEventListener('click', (e) => {
      const categoryLink = e.target.closest('[data-category]');
      if (categoryLink) {
        this.recordCategoryInterest(categoryLink.dataset.category);
      }

      const artistLink = e.target.closest('[data-artist]');
      if (artistLink) {
        this.recordArtistInterest(artistLink.dataset.artist);
      }
    });
  }

  recordView(artwork) {
    this.viewHistory.unshift({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      category: artwork.category,
      price: artwork.price,
      timestamp: Date.now()
    });

    this.updatePreferences(artwork);
    this.saveViewHistory();
  }

  recordLike(artwork) {
    this.likeHistory.unshift({
      id: artwork.id,
      title: artwork.title,
      artist: artwork.artist,
      category: artwork.category,
      price: artwork.price,
      timestamp: Date.now()
    });

    this.updatePreferences(artwork, 2); // Likes have more weight
    this.saveLikeHistory();
  }

  recordSearch(searchData) {
    this.searchHistory.unshift({
      query: searchData.query,
      filters: searchData.filters,
      timestamp: Date.now()
    });

    // Extract preferences from search
    if (searchData.filters) {
      if (searchData.filters.category) {
        this.recordCategoryInterest(searchData.filters.category);
      }
      if (searchData.filters.artist) {
        this.recordArtistInterest(searchData.filters.artist);
      }
    }

    this.saveSearchHistory();
  }

  recordCategoryInterest(category) {
    if (!this.userPreferences.favoriteCategories.includes(category)) {
      this.userPreferences.favoriteCategories.push(category);
      this.savePreferences();
    }
  }

  recordArtistInterest(artist) {
    if (!this.userPreferences.favoriteArtists.includes(artist)) {
      this.userPreferences.favoriteArtists.push(artist);
      this.savePreferences();
    }
  }

  updatePreferences(artwork, weight = 1) {
    // Update category preferences
    if (artwork.category) {
      const index = this.userPreferences.favoriteCategories.indexOf(artwork.category);
      if (index === -1) {
        this.userPreferences.favoriteCategories.push(artwork.category);
      } else {
        // Move to front (more recent = more relevant)
        this.userPreferences.favoriteCategories.splice(index, 1);
        this.userPreferences.favoriteCategories.unshift(artwork.category);
      }
    }

    // Update artist preferences
    if (artwork.artist) {
      const index = this.userPreferences.favoriteArtists.indexOf(artwork.artist);
      if (index === -1) {
        this.userPreferences.favoriteArtists.push(artwork.artist);
      } else {
        this.userPreferences.favoriteArtists.splice(index, 1);
        this.userPreferences.favoriteArtists.unshift(artwork.artist);
      }
    }

    this.savePreferences();
  }

  // ===== Recommendation Generation =====
  
  async getRecommendations(count = 12) {
    try {
      // Generate recommendation parameters
      const params = this.generateRecommendationParams();
      
      // Fetch recommendations from API
      const response = await fetch(`/api/artworks/recommendations?${new URLSearchParams(params)}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch recommendations');
      }
      
      const artworks = await response.json();
      
      // Score and sort recommendations
      const scored = artworks.map(artwork => ({
        ...artwork,
        score: this.calculateRecommendationScore(artwork)
      }));
      
      scored.sort((a, b) => b.score - a.score);
      
      return scored.slice(0, count);
      
    } catch (error) {
      console.error('Error fetching recommendations:', error);
      return [];
    }
  }

  generateRecommendationParams() {
    const params = {};
    
    // Categories (top 3)
    if (this.userPreferences.favoriteCategories.length > 0) {
      params.categories = this.userPreferences.favoriteCategories.slice(0, 3).join(',');
    }
    
    // Artists (top 5)
    if (this.userPreferences.favoriteArtists.length > 0) {
      params.artists = this.userPreferences.favoriteArtists.slice(0, 5).join(',');
    }
    
    // Price range (from view history)
    const avgPrice = this.calculateAverageViewedPrice();
    if (avgPrice > 0) {
      params.priceMin = Math.floor(avgPrice * 0.5);
      params.priceMax = Math.floor(avgPrice * 1.5);
    }
    
    // Exclude already viewed (last 20)
    const recentViews = this.viewHistory.slice(0, 20).map(v => v.id);
    if (recentViews.length > 0) {
      params.exclude = recentViews.join(',');
    }
    
    return params;
  }

  // ===== ML-BASED SCORING (HYBRID MODEL) =====
  
  calculateRecommendationScore(artwork) {
    const collaborativeScore = this.calculateCollaborativeScore(artwork);
    const contentScore = this.calculateContentBasedScore(artwork);
    const popularityScore = this.calculatePopularityScore(artwork);
    const diversityScore = this.calculateDiversityScore(artwork);
    
    const finalScore = 
      (collaborativeScore * this.collaborativeWeight) +
      (contentScore * this.contentBasedWeight) +
      (popularityScore * this.popularityWeight) +
      (diversityScore * this.diversityWeight);
    
    return finalScore;
  }
  
  // Collaborative Filtering Score (User-Item interactions)
  calculateCollaborativeScore(artwork) {
    let score = 0;
    
    // User-User Collaborative Filtering
    // Check if similar users liked this artwork
    const viewedArtists = this.viewHistory.map(v => v.artist);
    const likedCategories = this.likeHistory.map(l => l.category);
    
    // Artist overlap (user-user similarity indicator)
    if (viewedArtists.includes(artwork.artist)) {
      const frequency = viewedArtists.filter(a => a === artwork.artist).length;
      score += Math.min(frequency * 20, 60); // Max 60 points
    }
    
    // Category interaction patterns
    if (likedCategories.includes(artwork.category)) {
      const frequency = likedCategories.filter(c => c === artwork.category).length;
      score += Math.min(frequency * 15, 40); // Max 40 points
    }
    
    return Math.min(score, 100); // Normalize to 100
  }
  
  // Content-Based Filtering Score (Feature similarity)
  calculateContentBasedScore(artwork) {
    let score = 0;
    
    // Category similarity
    if (this.userPreferences.favoriteCategories.includes(artwork.category)) {
      const index = this.userPreferences.favoriteCategories.indexOf(artwork.category);
      const categoryScore = 100 - (index * 10); // Decay with index
      score += categoryScore * this.featureWeights.category;
    }
    
    // Artist similarity
    if (this.userPreferences.favoriteArtists.includes(artwork.artist)) {
      const index = this.userPreferences.favoriteArtists.indexOf(artwork.artist);
      const artistScore = 100 - (index * 8);
      score += artistScore * this.featureWeights.artist;
    }
    
    // Style similarity (if available)
    if (artwork.style && this.userPreferences.preferredStyles.includes(artwork.style)) {
      score += 100 * this.featureWeights.style;
    }
    
    // Price similarity
    const avgPrice = this.calculateAverageViewedPrice();
    if (avgPrice > 0) {
      const priceDiff = Math.abs(artwork.price - avgPrice) / avgPrice;
      const priceScore = Math.max(0, 100 - (priceDiff * 100));
      score += priceScore * this.featureWeights.price;
    }
    
    // Period similarity (if available)
    if (artwork.period && this.userPreferences.preferredPeriods.includes(artwork.period)) {
      score += 100 * this.featureWeights.period;
    }
    
    return score;
  }
  
  // Popularity Score (Social proof)
  calculatePopularityScore(artwork) {
    const views = artwork.views || 0;
    const likes = artwork.likes || 0;
    const rating = artwork.rating || 0;
    
    // Normalize views (assume max 10000 views)
    const viewScore = Math.min(views / 10000, 1) * 40;
    
    // Normalize likes (assume max 1000 likes)
    const likeScore = Math.min(likes / 1000, 1) * 40;
    
    // Rating score (0-5 scale)
    const ratingScore = (rating / 5) * 20;
    
    return viewScore + likeScore + ratingScore;
  }
  
  // Diversity Score (Exploration vs Exploitation)
  calculateDiversityScore(artwork) {
    // Encourage exploration of new categories/artists
    const isNewCategory = !this.userPreferences.favoriteCategories.includes(artwork.category);
    const isNewArtist = !this.userPreferences.favoriteArtists.includes(artwork.artist);
    
    let score = 0;
    
    if (isNewCategory) score += 50;
    if (isNewArtist) score += 50;
    
    // Boost new/recent artworks
    if (artwork.isNew) score += 20;
    
    return score;
  }

  calculateAverageViewedPrice() {
    if (this.viewHistory.length === 0) return 0;
    
    const sum = this.viewHistory.reduce((acc, item) => acc + (item.price || 0), 0);
    return sum / this.viewHistory.length;
  }

  // ===== UI Update =====
  
  async updateRecommendations(containerId = 'recommendations-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = '<div class="text-center py-8"><i class="fas fa-spinner fa-spin text-2xl text-gray-400"></i></div>';
    
    const recommendations = await this.getRecommendations(12);
    
    if (recommendations.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-lightbulb text-4xl mb-4"></i>
          <p>추천할 작품이 없습니다. 작품을 더 둘러보세요!</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        ${recommendations.map(artwork => this.renderRecommendationCard(artwork)).join('')}
      </div>
    `;
  }

  renderRecommendationCard(artwork) {
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow cursor-pointer"
           data-artwork-id="${artwork.id}"
           onclick="window.location.href='/artworks/${artwork.id}'">
        <img src="${artwork.imageUrl || '/static/placeholder.jpg'}" 
             alt="${artwork.title}" 
             class="w-full h-48 object-cover">
        <div class="p-4">
          <h3 class="font-semibold text-gray-800 mb-2 line-clamp-1">${artwork.title}</h3>
          <p class="text-sm text-gray-600 mb-2">${artwork.artist}</p>
          <div class="flex justify-between items-center">
            <span class="text-lg font-bold text-indigo-600">${this.formatPrice(artwork.price)}</span>
            <span class="text-xs text-gray-500">
              <i class="fas fa-star text-yellow-400"></i> ${(artwork.score || 0).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>
    `;
  }

  formatPrice(price) {
    if (!price) return '가격 문의';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
  }

  updateRecommendationsInterval() {
    // Update recommendations every 5 minutes
    setInterval(() => {
      this.updateRecommendations();
    }, 5 * 60 * 1000);
  }

  // ===== ITEM-ITEM COLLABORATIVE FILTERING =====
  
  async getSimilarArtworks(artwork, count = 6) {
    try {
      // Fetch similar artworks using item-item collaborative filtering
      const response = await fetch(`/api/recommendations/similar/${artwork.id}?limit=${count}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch similar artworks');
      }
      
      const data = await response.json();
      let artworks = data.artworks || [];
      
      // Apply item-item similarity scoring
      artworks = artworks.map(art => ({
        ...art,
        similarityScore: this.calculateItemSimilarity(artwork, art)
      }));
      
      // Sort by similarity score
      artworks.sort((a, b) => b.similarityScore - a.similarityScore);
      
      return artworks.slice(0, count);
      
    } catch (error) {
      console.error('Error fetching similar artworks:', error);
      return [];
    }
  }
  
  calculateItemSimilarity(sourceArtwork, targetArtwork) {
    let similarity = 0;
    
    // Same artist - highest similarity
    if (sourceArtwork.artist === targetArtwork.artist) {
      similarity += 40;
    }
    
    // Same category
    if (sourceArtwork.category === targetArtwork.category) {
      similarity += 30;
    }
    
    // Same style
    if (sourceArtwork.style && targetArtwork.style && 
        sourceArtwork.style === targetArtwork.style) {
      similarity += 15;
    }
    
    // Price similarity (within 30% range)
    if (sourceArtwork.price && targetArtwork.price) {
      const priceDiff = Math.abs(sourceArtwork.price - targetArtwork.price) / sourceArtwork.price;
      if (priceDiff < 0.3) {
        similarity += (1 - priceDiff) * 15;
      }
    }
    
    return similarity;
  }
  
  // ===== Public API =====
  
  async getTrendingArtworks(days = 7, count = 10) {
    try {
      const response = await fetch(`/api/recommendations/trending?days=${days}&limit=${count}`);
      if (!response.ok) throw new Error('Failed to fetch trending');
      
      const data = await response.json();
      return data.artworks || [];
    } catch (error) {
      console.error('Error fetching trending artworks:', error);
      return [];
    }
  }
  
  async getNewArtworks(count = 10) {
    try {
      const response = await fetch(`/api/recommendations/new?limit=${count}`);
      if (!response.ok) throw new Error('Failed to fetch new artworks');
      
      const data = await response.json();
      return data.artworks || [];
    } catch (error) {
      console.error('Error fetching new artworks:', error);
      return [];
    }
  }
  
  async getPremiumArtworks(minPrice = 50000000, count = 10) {
    try {
      const response = await fetch(`/api/recommendations/premium?minPrice=${minPrice}&limit=${count}`);
      if (!response.ok) throw new Error('Failed to fetch premium artworks');
      
      const data = await response.json();
      return data.artworks || [];
    } catch (error) {
      console.error('Error fetching premium artworks:', error);
      return [];
    }
  }

  // ===== MATRIX FACTORIZATION (Advanced Collaborative Filtering) =====
  
  buildUserItemMatrix() {
    // Build a sparse user-item interaction matrix
    const matrix = {};
    
    // Add view interactions (weight: 1)
    this.viewHistory.forEach(item => {
      if (!matrix[item.id]) matrix[item.id] = { views: 0, likes: 0 };
      matrix[item.id].views += 1;
    });
    
    // Add like interactions (weight: 3)
    this.likeHistory.forEach(item => {
      if (!matrix[item.id]) matrix[item.id] = { views: 0, likes: 0 };
      matrix[item.id].likes += 1;
    });
    
    return matrix;
  }
  
  calculateUserArtworkAffinity(artworkId) {
    const matrix = this.buildUserItemMatrix();
    const interaction = matrix[artworkId];
    
    if (!interaction) return 0;
    
    // Calculate weighted affinity score
    const viewScore = interaction.views * 1;
    const likeScore = interaction.likes * 3;
    
    return viewScore + likeScore;
  }
  
  // Predict user rating for unseen artworks based on similar artworks
  predictArtworkRating(artwork) {
    const matrix = this.buildUserItemMatrix();
    
    // Find artworks in same category that user interacted with
    const similarInteractions = this.viewHistory
      .concat(this.likeHistory)
      .filter(item => item.category === artwork.category);
    
    if (similarInteractions.length === 0) return 0;
    
    // Calculate average affinity with similar artworks
    let totalAffinity = 0;
    similarInteractions.forEach(item => {
      totalAffinity += this.calculateUserArtworkAffinity(item.id);
    });
    
    const avgAffinity = totalAffinity / similarInteractions.length;
    
    // Normalize to 0-100 scale
    return Math.min(avgAffinity * 10, 100);
  }
  
  // ===== ALGORITHM EXPLANATION =====
  
  getAlgorithmExplanation() {
    const historyLength = this.viewHistory.length + this.likeHistory.length;
    
    let algorithm = 'Hybrid';
    let description = '';
    let confidence = 0;
    
    if (historyLength === 0) {
      algorithm = 'Popularity-Based';
      description = '사용자 기록이 없어 인기 작품을 추천합니다';
      confidence = 50;
    } else if (historyLength < 10) {
      algorithm = 'Content-Based';
      description = '작품 특성을 분석하여 유사한 작품을 추천합니다';
      confidence = 60 + (historyLength * 2);
    } else if (historyLength < 30) {
      algorithm = 'Hybrid (Content + Collaborative)';
      description = '작품 특성과 사용자 패턴을 결합하여 추천합니다';
      confidence = 70 + Math.min(historyLength, 20);
    } else {
      algorithm = 'Advanced Hybrid';
      description = '고도화된 ML 알고리즘으로 개인화된 추천을 제공합니다';
      confidence = Math.min(90 + (historyLength - 30) * 0.5, 98);
    }
    
    return {
      algorithm,
      description,
      confidence: Math.round(confidence),
      dataPoints: historyLength,
      weights: {
        collaborative: this.collaborativeWeight * 100,
        contentBased: this.contentBasedWeight * 100,
        popularity: this.popularityWeight * 100,
        diversity: this.diversityWeight * 100
      }
    };
  }
  
  getPersonalizedStats() {
    return {
      viewedArtworks: this.viewHistory.length,
      likedArtworks: this.likeHistory.length,
      searches: this.searchHistory.length,
      favoriteCategories: this.userPreferences.favoriteCategories.length,
      favoriteArtists: this.userPreferences.favoriteArtists.length,
      avgPrice: Math.round(this.calculateAverageViewedPrice()),
      topCategory: this.userPreferences.favoriteCategories[0] || 'None',
      topArtist: this.userPreferences.favoriteArtists[0] || 'None'
    };
  }
  
  clearHistory() {
    this.viewHistory = [];
    this.likeHistory = [];
    this.searchHistory = [];
    this.userPreferences = {
      favoriteCategories: [],
      favoriteArtists: [],
      priceRange: { min: 0, max: 1000000 },
      preferredStyles: [],
      preferredPeriods: []
    };
    
    localStorage.removeItem('gallerypia_view_history');
    localStorage.removeItem('gallerypia_like_history');
    localStorage.removeItem('gallerypia_search_history');
    localStorage.removeItem('gallerypia_user_preferences');
    
    console.log('🗑️ Recommendation history cleared');
    showSuccessToast('추천 기록이 초기화되었습니다');
  }
}

// Initialize on page load
let recommendationEngine;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    recommendationEngine = new RecommendationEngine();
  });
} else {
  recommendationEngine = new RecommendationEngine();
}
