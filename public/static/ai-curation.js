/**
 * GALLERYPIA - AI NFT Curation System
 * Phase 18: Personalized Recommendation & Price Evaluation
 */

class AICuration {
  constructor() {
    this.userProfile = null;
    this.preferences = new Map();
    this.viewHistory = [];
    this.recommendationCache = new Map();
    this.init();
  }

  async init() {
    console.log('🤖 AI Curation initializing...');
    await this.loadUserProfile();
    await this.loadPreferences();
  }

  async loadUserProfile() {
    console.log('👤 Loading user profile...');
    
    try {
      const response = await fetch('/api/ai/user-profile');
      const result = await response.json();
      
      if (result.success) {
        this.userProfile = result.profile;
        console.log('✅ User profile loaded');
      }
    } catch (error) {
      console.error('❌ Profile load failed:', error);
    }
  }

  async loadPreferences() {
    console.log('⚙️ Loading user preferences...');
    
    try {
      const stored = localStorage.getItem('ai_preferences');
      if (stored) {
        const prefs = JSON.parse(stored);
        Object.entries(prefs).forEach(([key, value]) => {
          this.preferences.set(key, value);
        });
      }
    } catch (error) {
      console.warn('⚠️ Failed to load preferences');
    }
  }

  savePreferences() {
    try {
      const prefs = Object.fromEntries(this.preferences);
      localStorage.setItem('ai_preferences', JSON.stringify(prefs));
    } catch (error) {
      console.warn('⚠️ Failed to save preferences');
    }
  }

  // Personalized Recommendations
  async getPersonalizedRecommendations(options = {}) {
    console.log('🎯 Getting personalized recommendations...');
    
    const cacheKey = JSON.stringify(options);
    if (this.recommendationCache.has(cacheKey)) {
      console.log('✅ Using cached recommendations');
      return this.recommendationCache.get(cacheKey);
    }

    try {
      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_profile: this.userProfile,
          preferences: Object.fromEntries(this.preferences),
          view_history: this.viewHistory.slice(-50), // Last 50 views
          limit: options.limit || 20,
          categories: options.categories || [],
          price_range: options.priceRange || null
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const recommendations = result.recommendations.map(rec => ({
          ...rec,
          match_score: rec.match_score,
          match_reasons: rec.match_reasons,
          ai_confidence: rec.confidence
        }));

        // 캐시 저장 (5분)
        this.recommendationCache.set(cacheKey, recommendations);
        setTimeout(() => this.recommendationCache.delete(cacheKey), 300000);

        this.trackEvent('recommendations_generated', { count: recommendations.length });
        console.log(`✅ Generated ${recommendations.length} recommendations`);
        
        return recommendations;
      }
    } catch (error) {
      console.error('❌ Recommendations failed:', error);
    }
    
    return [];
  }

  async getSimilarArtworks(artworkId, limit = 10) {
    console.log(`🔍 Finding similar artworks to #${artworkId}...`);
    
    try {
      const response = await fetch(`/api/ai/similar/${artworkId}?limit=${limit}`);
      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('similar_artworks_found', { 
          artwork_id: artworkId,
          count: result.similar.length 
        });
        
        return result.similar.map(item => ({
          ...item,
          similarity_score: item.score,
          similarity_factors: item.factors
        }));
      }
    } catch (error) {
      console.error('❌ Similar artworks fetch failed:', error);
    }
    
    return [];
  }

  async getTrendingByInterests() {
    console.log('📈 Getting trending artworks based on interests...');
    
    try {
      const response = await fetch('/api/ai/trending-interests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          interests: Array.from(this.preferences.get('interests') || []),
          view_history: this.viewHistory.slice(-30)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('trending_interests_loaded');
        return result.trending;
      }
    } catch (error) {
      console.error('❌ Trending fetch failed:', error);
    }
    
    return [];
  }

  // AI Price Evaluation
  async evaluatePrice(artwork) {
    console.log(`💰 Evaluating price for artwork #${artwork.id}...`);
    
    try {
      const response = await fetch('/api/ai/price-evaluation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artwork_id: artwork.id,
          current_price: artwork.price,
          metadata: {
            artist: artwork.artist,
            category: artwork.category,
            rarity: artwork.rarity,
            created_at: artwork.created_at,
            edition_size: artwork.edition_size
          }
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const evaluation = {
          current_price: artwork.price,
          estimated_value: result.estimated_value,
          confidence: result.confidence,
          price_range: result.price_range,
          market_position: result.market_position, // undervalued, fair, overvalued
          factors: result.factors,
          predictions: result.predictions,
          recommendation: this.getPriceRecommendation(
            artwork.price, 
            result.estimated_value,
            result.market_position
          )
        };

        this.trackEvent('price_evaluated', { 
          artwork_id: artwork.id,
          market_position: evaluation.market_position 
        });
        
        console.log(`✅ Price evaluation complete: ${evaluation.market_position}`);
        return evaluation;
      }
    } catch (error) {
      console.error('❌ Price evaluation failed:', error);
    }
    
    return null;
  }

  getPriceRecommendation(currentPrice, estimatedValue, marketPosition) {
    const difference = ((estimatedValue - currentPrice) / currentPrice) * 100;
    
    if (marketPosition === 'undervalued') {
      return {
        action: 'buy',
        reason: `Undervalued by ~${Math.abs(difference).toFixed(1)}%. Good investment opportunity.`,
        urgency: 'high'
      };
    } else if (marketPosition === 'overvalued') {
      return {
        action: 'wait',
        reason: `Overvalued by ~${Math.abs(difference).toFixed(1)}%. Consider waiting.`,
        urgency: 'low'
      };
    } else {
      return {
        action: 'consider',
        reason: `Fairly priced. Decide based on personal preference.`,
        urgency: 'medium'
      };
    }
  }

  async getPricePrediction(artworkId, timeframe = '30d') {
    console.log(`📊 Predicting price for artwork #${artworkId} (${timeframe})...`);
    
    try {
      const response = await fetch(`/api/ai/price-prediction/${artworkId}?timeframe=${timeframe}`);
      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('price_prediction_generated', { 
          artwork_id: artworkId,
          timeframe: timeframe 
        });
        
        return {
          current_price: result.current_price,
          predicted_price: result.predicted_price,
          confidence: result.confidence,
          trend: result.trend, // up, down, stable
          expected_change: result.expected_change,
          timeframe: timeframe,
          factors: result.factors
        };
      }
    } catch (error) {
      console.error('❌ Price prediction failed:', error);
    }
    
    return null;
  }

  // Auto-Collection Builder
  async buildAutoCollection(theme, options = {}) {
    console.log(`🎨 Building auto-collection: "${theme}"...`);
    
    try {
      const response = await fetch('/api/ai/auto-collection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          theme: theme,
          budget: options.budget || null,
          size: options.size || 10,
          style_preferences: options.stylePreferences || [],
          diversity: options.diversity || 'medium' // low, medium, high
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const collection = {
          name: result.collection_name,
          theme: theme,
          artworks: result.artworks,
          total_value: result.total_value,
          diversity_score: result.diversity_score,
          coherence_score: result.coherence_score,
          ai_curation_notes: result.notes
        };

        this.trackEvent('auto_collection_built', { 
          theme: theme,
          size: collection.artworks.length 
        });
        
        console.log(`✅ Auto-collection built: ${collection.name}`);
        return collection;
      }
    } catch (error) {
      console.error('❌ Auto-collection failed:', error);
    }
    
    return null;
  }

  // User Behavior Learning
  trackView(artworkId, metadata = {}) {
    console.log(`👁️ Tracking view: artwork #${artworkId}`);
    
    this.viewHistory.push({
      artwork_id: artworkId,
      timestamp: new Date().toISOString(),
      metadata: metadata
    });

    // Keep last 100 views
    if (this.viewHistory.length > 100) {
      this.viewHistory.shift();
    }

    // Update preferences
    this.updatePreferencesFromView(artworkId, metadata);
    
    // Send to server (debounced)
    this.debouncedSendViewHistory();
  }

  updatePreferencesFromView(artworkId, metadata) {
    // Category preference
    if (metadata.category) {
      const categories = this.preferences.get('categories') || {};
      categories[metadata.category] = (categories[metadata.category] || 0) + 1;
      this.preferences.set('categories', categories);
    }

    // Artist preference
    if (metadata.artist) {
      const artists = this.preferences.get('artists') || {};
      artists[metadata.artist] = (artists[metadata.artist] || 0) + 1;
      this.preferences.set('artists', artists);
    }

    // Price range preference
    if (metadata.price) {
      const priceViews = this.preferences.get('price_views') || [];
      priceViews.push(metadata.price);
      this.preferences.set('price_views', priceViews.slice(-50));
    }

    this.savePreferences();
  }

  debouncedSendViewHistory = this.debounce(async () => {
    try {
      await fetch('/api/ai/track-views', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          views: this.viewHistory.slice(-20)
        })
      });
    } catch (error) {
      console.warn('⚠️ Failed to send view history');
    }
  }, 5000);

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }

  // Smart Filters
  async getSmartFilterSuggestions() {
    console.log('🎯 Getting smart filter suggestions...');
    
    try {
      const response = await fetch('/api/ai/filter-suggestions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          preferences: Object.fromEntries(this.preferences),
          view_history: this.viewHistory.slice(-30)
        })
      });

      const result = await response.json();
      
      if (result.success) {
        return {
          suggested_categories: result.categories,
          price_range: result.price_range,
          artists: result.artists,
          styles: result.styles,
          reasoning: result.reasoning
        };
      }
    } catch (error) {
      console.error('❌ Filter suggestions failed:', error);
    }
    
    return null;
  }

  // Preference Management
  setInterest(interest, weight = 1.0) {
    const interests = this.preferences.get('interests') || new Map();
    interests.set(interest, weight);
    this.preferences.set('interests', interests);
    this.savePreferences();
    
    console.log(`✅ Interest set: ${interest} (weight: ${weight})`);
  }

  removeInterest(interest) {
    const interests = this.preferences.get('interests') || new Map();
    interests.delete(interest);
    this.preferences.set('interests', interests);
    this.savePreferences();
    
    console.log(`✅ Interest removed: ${interest}`);
  }

  getInterests() {
    return this.preferences.get('interests') || new Map();
  }

  clearHistory() {
    this.viewHistory = [];
    console.log('✅ View history cleared');
  }

  resetPreferences() {
    this.preferences.clear();
    this.savePreferences();
    console.log('✅ Preferences reset');
  }

  // Analytics
  getInsights() {
    const categoryPrefs = this.preferences.get('categories') || {};
    const topCategories = Object.entries(categoryPrefs)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([cat, count]) => ({ category: cat, views: count }));

    const priceViews = this.preferences.get('price_views') || [];
    const avgPrice = priceViews.length > 0
      ? priceViews.reduce((a, b) => a + b, 0) / priceViews.length
      : 0;

    return {
      total_views: this.viewHistory.length,
      top_categories: topCategories,
      average_price_viewed: avgPrice,
      viewing_patterns: this.analyzeViewingPatterns()
    };
  }

  analyzeViewingPatterns() {
    if (this.viewHistory.length < 10) {
      return { pattern: 'insufficient_data' };
    }

    // 시간대별 패턴
    const hourCounts = new Array(24).fill(0);
    this.viewHistory.forEach(view => {
      const hour = new Date(view.timestamp).getHours();
      hourCounts[hour]++;
    });

    const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
    
    return {
      pattern: 'analyzed',
      peak_hour: peakHour,
      most_active_time: this.getTimeOfDay(peakHour),
      average_session_length: this.calculateAverageSessionLength()
    };
  }

  getTimeOfDay(hour) {
    if (hour >= 5 && hour < 12) return 'morning';
    if (hour >= 12 && hour < 17) return 'afternoon';
    if (hour >= 17 && hour < 21) return 'evening';
    return 'night';
  }

  calculateAverageSessionLength() {
    // Simplified calculation
    return this.viewHistory.length > 0 ? 
      Math.floor(Math.random() * 20) + 10 : 0; // Mock: 10-30 minutes
  }

  trackEvent(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'ai_curation_' + action, {
        event_category: 'AI_Curation',
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.AICuration = AICuration;
window.aiCuration = null;

// 초기화 함수
window.initAICuration = function() {
  if (!window.aiCuration) {
    window.aiCuration = new AICuration();
    console.log('✅ AI Curation initialized');
  }
  return window.aiCuration;
};

console.log('📦 AI Curation module loaded');
