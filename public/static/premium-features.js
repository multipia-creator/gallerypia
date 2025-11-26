/**
 * Premium Features Integration
 * Loads and initializes all premium AI-powered features
 */

(async function() {
  'use strict';

  // Feature flags
  const FEATURES = {
    aiRecommendation: true,
    aiPricePrediction: true,
    artworkSimilarity: true,
    marketAnalytics: true
  };

  /**
   * Load AI Recommendation Engine
   */
  async function loadRecommendationEngine() {
    if (!FEATURES.aiRecommendation || window.recommendationEngine) return;
    
    try {
      await loadScript('/static/ai-recommendation-engine.js');
      window.recommendationEngine = new window.AIRecommendationEngine();
      console.log('[Premium] AI Recommendation Engine initialized');
    } catch (error) {
      console.error('[Premium] Failed to load Recommendation Engine:', error);
    }
  }

  /**
   * Load AI Price Prediction
   */
  async function loadPricePrediction() {
    if (!FEATURES.aiPricePrediction || window.pricePrediction) return;
    
    try {
      await loadScript('/static/ai-price-prediction.js');
      window.pricePrediction = new window.AIPricePrediction();
      console.log('[Premium] AI Price Prediction initialized');
    } catch (error) {
      console.error('[Premium] Failed to load Price Prediction:', error);
    }
  }

  /**
   * Enhanced Recommendation System
   */
  window.getSmartRecommendations = async function(artworks, options = {}) {
    if (!window.recommendationEngine) {
      await loadRecommendationEngine();
    }
    
    const {
      limit = 10,
      referenceArtwork = null,
      ensureDiversity = true
    } = options;
    
    try {
      let recommendations = await window.recommendationEngine.getHybridRecommendations(
        artworks,
        referenceArtwork,
        limit
      );
      
      if (ensureDiversity) {
        recommendations = window.recommendationEngine.ensureDiversity(recommendations);
      }
      
      return recommendations;
    } catch (error) {
      console.error('[Premium] Smart recommendations failed:', error);
      // Fallback to simple trending
      return artworks.slice(0, limit);
    }
  };

  /**
   * Track user behavior for better recommendations
   */
  window.trackArtworkInteraction = function(action, artwork) {
    if (!window.recommendationEngine) return;
    
    try {
      window.recommendationEngine.trackBehavior(action, artwork);
      
      // Also evaluate recommendation quality if this was a recommended item
      if (artwork.wasRecommended) {
        window.recommendationEngine.evaluateRecommendation(artwork.id, action);
      }
    } catch (error) {
      console.error('[Premium] Failed to track interaction:', error);
    }
  };

  /**
   * Get price prediction with detailed analysis
   */
  window.getPricePrediction = async function(artwork) {
    if (!window.pricePrediction) {
      await loadPricePrediction();
    }
    
    try {
      const prediction = await window.pricePrediction.predictPrice(artwork);
      return prediction;
    } catch (error) {
      console.error('[Premium] Price prediction failed:', error);
      return {
        predictedPrice: artwork.estimated_value || 0,
        confidence: 50,
        priceRange: {
          min: artwork.estimated_value * 0.8,
          max: artwork.estimated_value * 1.2
        },
        factors: [],
        recommendations: []
      };
    }
  };

  /**
   * Get user preferences dashboard data
   */
  window.getUserPreferences = function() {
    if (!window.recommendationEngine) return null;
    
    try {
      return window.recommendationEngine.getUserPreferences();
    } catch (error) {
      console.error('[Premium] Failed to get user preferences:', error);
      return null;
    }
  };

  /**
   * Get market trend analysis
   */
  window.getMarketTrend = async function(category, days = 30) {
    if (!window.pricePrediction) {
      await loadPricePrediction();
    }
    
    try {
      return await window.pricePrediction.getMarketTrend(category, days);
    } catch (error) {
      console.error('[Premium] Market trend analysis failed:', error);
      return null;
    }
  };

  /**
   * Enhanced artwork card rendering with AI insights
   */
  window.renderEnhancedArtworkCard = function(artwork, container) {
    // Add AI-powered badges and insights
    const insights = [];
    
    // Price prediction badge
    if (artwork.predictedPrice) {
      const accuracy = artwork.predictedPrice.confidence;
      if (accuracy >= 80) {
        insights.push(`
          <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
            </svg>
            ${accuracy}% Price Confidence
          </span>
        `);
      }
    }
    
    // Recommendation badge
    if (artwork.wasRecommended) {
      insights.push(`
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
          </svg>
          Recommended for You
        </span>
      `);
    }
    
    // Trending badge
    if (artwork.trendingScore && artwork.trendingScore > 80) {
      insights.push(`
        <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <svg class="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clip-rule="evenodd"/>
          </svg>
          Trending Now
        </span>
      `);
    }
    
    return insights.join('\n');
  };

  /**
   * Helper: Load script dynamically
   */
  function loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  /**
   * Initialize premium features on idle
   */
  if ('requestIdleCallback' in window) {
    requestIdleCallback(async () => {
      await Promise.all([
        loadRecommendationEngine(),
        loadPricePrediction()
      ]);
      console.log('[Premium] All premium features loaded');
    }, { timeout: 5000 });
  } else {
    setTimeout(async () => {
      await Promise.all([
        loadRecommendationEngine(),
        loadPricePrediction()
      ]);
      console.log('[Premium] All premium features loaded');
    }, 3000);
  }

})();
