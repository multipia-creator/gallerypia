/**
 * GalleryPia - Price Prediction AI
 * L4-7: ML-based artwork price prediction
 */

class PricePredictionAI {
  constructor() {
    this.model = null;
    this.features = ['artist_reputation', 'artwork_size', 'medium', 'age', 'condition', 'provenance'];
    this.weights = { artist_reputation: 0.35, artwork_size: 0.15, medium: 0.15, age: 0.15, condition: 0.10, provenance: 0.10 };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Price Prediction AI initialized');
    this.trainModel();
  }

  trainModel() {
    // Simulated training with historical data
    console.log('Training price prediction model...');
  }

  predictPrice(artwork) {
    // Simple weighted scoring model
    let basePrice = 1000000; // 1M KRW base
    
    const artistScore = this.getArtistScore(artwork.artist);
    const sizeScore = this.getSizeScore(artwork.size);
    const mediumScore = this.getMediumScore(artwork.medium);
    const ageScore = this.getAgeScore(artwork.year);
    const conditionScore = this.getConditionScore(artwork.condition || 'good');
    
    const predictedPrice = basePrice * (
      1 + artistScore * this.weights.artist_reputation +
      sizeScore * this.weights.artwork_size +
      mediumScore * this.weights.medium +
      ageScore * this.weights.age +
      conditionScore * this.weights.condition
    );

    const confidence = this.calculateConfidence(artwork);
    const priceRange = {
      low: predictedPrice * 0.8,
      mid: predictedPrice,
      high: predictedPrice * 1.2
    };

    return { predictedPrice, confidence, priceRange };
  }

  getArtistScore(artist) {
    // Simulated artist reputation score
    const scores = { 'famous': 2.0, 'established': 1.5, 'emerging': 0.8, 'unknown': 0.3 };
    return scores[artist?.toLowerCase()] || 0.5;
  }

  getSizeScore(size) {
    if (!size) return 0.5;
    const sizeNum = parseInt(size);
    if (sizeNum > 100) return 1.5;
    if (sizeNum > 50) return 1.0;
    return 0.5;
  }

  getMediumScore(medium) {
    const scores = { 'oil': 1.5, 'acrylic': 1.2, 'watercolor': 1.0, 'digital': 0.8, 'mixed': 1.1 };
    return scores[medium?.toLowerCase()] || 1.0;
  }

  getAgeScore(year) {
    if (!year) return 0.5;
    const age = new Date().getFullYear() - parseInt(year);
    if (age > 100) return 2.0;
    if (age > 50) return 1.5;
    if (age > 20) return 1.0;
    return 0.5;
  }

  getConditionScore(condition) {
    const scores = { 'excellent': 1.2, 'good': 1.0, 'fair': 0.8, 'poor': 0.5 };
    return scores[condition.toLowerCase()] || 1.0;
  }

  calculateConfidence(artwork) {
    let confidence = 0.7;
    if (artwork.provenance) confidence += 0.1;
    if (artwork.certifications) confidence += 0.1;
    if (artwork.exhibition_history) confidence += 0.1;
    return Math.min(confidence, 0.95);
  }

  showPrediction(artwork) {
    const result = this.predictPrice(artwork);
    alert(`예상 가격: ₩${result.predictedPrice.toLocaleString()}\\n신뢰도: ${(result.confidence * 100).toFixed(1)}%\\n\\n가격 범위:\\n최저: ₩${result.priceRange.low.toLocaleString()}\\n예상: ₩${result.priceRange.mid.toLocaleString()}\\n최고: ₩${result.priceRange.high.toLocaleString()}`);
  }
}

window.pricePredictionAI = new PricePredictionAI();
