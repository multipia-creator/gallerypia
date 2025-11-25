/**
 * Advanced AI Search Engine
 * L3-7: 고급 AI 검색
 * 
 * Features:
 * - Vector Search (TF-IDF based)
 * - Semantic Search (Natural language understanding)
 * - Image Similarity Search (Color histogram)
 * - Fuzzy Search (Typo tolerance)
 */

class AdvancedSearchEngine {
  constructor() {
    this.artworks = [];
    this.vectorIndex = null;
    this.colorIndex = null;
    this.stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', '는', '은', '이', '가', '을', '를', '의']);
    this.synonyms = {
      'beautiful': ['gorgeous', 'stunning', 'lovely', 'pretty', '아름다운', '예쁜'],
      'painting': ['artwork', 'art', 'picture', '그림', '작품'],
      'modern': ['contemporary', 'current', '현대', '모던'],
      'abstract': ['non-representational', 'non-figurative', '추상', '추상적'],
      'landscape': ['scenery', 'view', '풍경', '경치'],
      'portrait': ['face', 'person', '초상화', '인물화']
    };
    
    this.init();
  }

  init() {
    console.log('🔍 Advanced Search Engine initialized');
  }

  // ===== DATA INDEXING =====
  
  async indexArtworks(artworks) {
    this.artworks = artworks;
    
    // Build vector index (TF-IDF)
    this.vectorIndex = this.buildVectorIndex(artworks);
    
    // Build color index (for image similarity)
    this.colorIndex = this.buildColorIndex(artworks);
    
    console.log(`📊 Indexed ${artworks.length} artworks`);
  }

  buildVectorIndex(artworks) {
    const index = {};
    const idf = {};
    const docCount = artworks.length;
    
    // Calculate term frequency
    artworks.forEach((artwork, idx) => {
      const text = this.tokenize(`${artwork.title} ${artwork.description || ''} ${artwork.artist || ''} ${artwork.category || ''}`);
      const terms = {};
      
      text.forEach(term => {
        if (this.stopWords.has(term)) return;
        terms[term] = (terms[term] || 0) + 1;
        idf[term] = (idf[term] || 0) + 1;
      });
      
      index[artwork.id] = terms;
    });
    
    // Calculate IDF
    Object.keys(idf).forEach(term => {
      idf[term] = Math.log(docCount / idf[term]);
    });
    
    // Calculate TF-IDF
    Object.keys(index).forEach(docId => {
      const terms = index[docId];
      Object.keys(terms).forEach(term => {
        terms[term] = terms[term] * (idf[term] || 0);
      });
    });
    
    return { index, idf };
  }

  buildColorIndex(artworks) {
    // Simplified color indexing based on dominant colors
    const index = {};
    
    artworks.forEach(artwork => {
      if (artwork.dominant_colors) {
        index[artwork.id] = artwork.dominant_colors;
      }
    });
    
    return index;
  }

  tokenize(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s가-힣]/g, ' ')
      .split(/\s+/)
      .filter(t => t.length > 1);
  }

  // ===== VECTOR SEARCH =====
  
  vectorSearch(query, limit = 10) {
    if (!this.vectorIndex) return [];
    
    const queryTerms = this.tokenize(query);
    const queryVector = {};
    
    // Build query vector
    queryTerms.forEach(term => {
      if (this.stopWords.has(term)) return;
      queryVector[term] = (queryVector[term] || 0) + 1;
    });
    
    // Apply IDF to query
    Object.keys(queryVector).forEach(term => {
      const idf = this.vectorIndex.idf[term] || 0;
      queryVector[term] = queryVector[term] * idf;
    });
    
    // Calculate cosine similarity
    const scores = this.artworks.map(artwork => {
      const docVector = this.vectorIndex.index[artwork.id] || {};
      const similarity = this.cosineSimilarity(queryVector, docVector);
      
      return {
        artwork,
        score: similarity,
        method: 'vector'
      };
    });
    
    return scores
      .filter(s => s.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  cosineSimilarity(vec1, vec2) {
    let dotProduct = 0;
    let mag1 = 0;
    let mag2 = 0;
    
    const allTerms = new Set([...Object.keys(vec1), ...Object.keys(vec2)]);
    
    allTerms.forEach(term => {
      const v1 = vec1[term] || 0;
      const v2 = vec2[term] || 0;
      dotProduct += v1 * v2;
      mag1 += v1 * v1;
      mag2 += v2 * v2;
    });
    
    if (mag1 === 0 || mag2 === 0) return 0;
    
    return dotProduct / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }

  // ===== SEMANTIC SEARCH =====
  
  semanticSearch(query, limit = 10) {
    // Expand query with synonyms
    const expandedQuery = this.expandQueryWithSynonyms(query);
    
    // Perform vector search with expanded query
    const results = this.vectorSearch(expandedQuery, limit);
    
    // Boost results that match semantic context
    results.forEach(result => {
      result.score *= 1.2; // Semantic boost
      result.method = 'semantic';
    });
    
    return results;
  }

  expandQueryWithSynonyms(query) {
    const tokens = this.tokenize(query);
    const expanded = [...tokens];
    
    tokens.forEach(token => {
      // Check if token is a key in synonyms
      if (this.synonyms[token]) {
        expanded.push(...this.synonyms[token]);
      }
      
      // Check if token is in any synonym list
      Object.keys(this.synonyms).forEach(key => {
        if (this.synonyms[key].includes(token)) {
          expanded.push(key);
          expanded.push(...this.synonyms[key]);
        }
      });
    });
    
    return [...new Set(expanded)].join(' ');
  }

  // ===== IMAGE SIMILARITY SEARCH =====
  
  imageSimilaritySearch(artworkId, limit = 6) {
    const sourceArtwork = this.artworks.find(a => a.id === artworkId);
    if (!sourceArtwork) return [];
    
    const sourceColors = this.colorIndex[artworkId];
    if (!sourceColors) {
      // Fallback to category/artist similarity
      return this.artworks
        .filter(a => a.id !== artworkId)
        .map(artwork => ({
          artwork,
          score: this.calculateSimilarityScore(sourceArtwork, artwork),
          method: 'content'
        }))
        .sort((a, b) => b.score - a.score)
        .slice(0, limit);
    }
    
    // Calculate color similarity
    const scores = this.artworks
      .filter(a => a.id !== artworkId)
      .map(artwork => {
        const targetColors = this.colorIndex[artwork.id];
        const colorSimilarity = targetColors 
          ? this.colorHistogramSimilarity(sourceColors, targetColors)
          : 0;
        
        const contentSimilarity = this.calculateSimilarityScore(sourceArtwork, artwork);
        
        return {
          artwork,
          score: colorSimilarity * 0.6 + contentSimilarity * 0.4,
          method: 'image'
        };
      });
    
    return scores
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  colorHistogramSimilarity(colors1, colors2) {
    if (!colors1 || !colors2) return 0;
    
    // Simple color distance calculation
    let totalDistance = 0;
    const minLength = Math.min(colors1.length, colors2.length);
    
    for (let i = 0; i < minLength; i++) {
      const c1 = this.hexToRgb(colors1[i]);
      const c2 = this.hexToRgb(colors2[i]);
      
      if (c1 && c2) {
        const distance = Math.sqrt(
          Math.pow(c1.r - c2.r, 2) +
          Math.pow(c1.g - c2.g, 2) +
          Math.pow(c1.b - c2.b, 2)
        );
        totalDistance += distance;
      }
    }
    
    // Normalize (max distance is sqrt(3 * 255^2) ≈ 441)
    const avgDistance = totalDistance / minLength;
    return 1 - (avgDistance / 441);
  }

  hexToRgb(hex) {
    if (!hex) return null;
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  calculateSimilarityScore(artwork1, artwork2) {
    let score = 0;
    
    // Same artist (highest weight)
    if (artwork1.artist === artwork2.artist) score += 40;
    
    // Same category
    if (artwork1.category === artwork2.category) score += 30;
    
    // Similar price range (within 30%)
    if (artwork1.price && artwork2.price) {
      const priceDiff = Math.abs(artwork1.price - artwork2.price) / artwork1.price;
      if (priceDiff < 0.3) {
        score += (1 - priceDiff) * 20;
      }
    }
    
    // Similar creation year
    if (artwork1.year && artwork2.year) {
      const yearDiff = Math.abs(artwork1.year - artwork2.year);
      if (yearDiff < 10) {
        score += (1 - yearDiff / 10) * 10;
      }
    }
    
    return score / 100; // Normalize to 0-1
  }

  // ===== FUZZY SEARCH =====
  
  fuzzySearch(query, limit = 10, threshold = 0.6) {
    const queryTokens = this.tokenize(query);
    
    const scores = this.artworks.map(artwork => {
      const artworkText = this.tokenize(`${artwork.title} ${artwork.artist || ''}`);
      
      let maxSimilarity = 0;
      
      queryTokens.forEach(qToken => {
        artworkText.forEach(aToken => {
          const similarity = this.levenshteinSimilarity(qToken, aToken);
          if (similarity > maxSimilarity) {
            maxSimilarity = similarity;
          }
        });
      });
      
      return {
        artwork,
        score: maxSimilarity,
        method: 'fuzzy'
      };
    });
    
    return scores
      .filter(s => s.score >= threshold)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  levenshteinSimilarity(str1, str2) {
    const distance = this.levenshteinDistance(str1, str2);
    const maxLength = Math.max(str1.length, str2.length);
    
    if (maxLength === 0) return 1;
    
    return 1 - (distance / maxLength);
  }

  levenshteinDistance(str1, str2) {
    const matrix = [];
    
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  // ===== HYBRID SEARCH =====
  
  async hybridSearch(query, options = {}) {
    const {
      limit = 10,
      includeVector = true,
      includeSemantic = true,
      includeFuzzy = true,
      vectorWeight = 0.4,
      semanticWeight = 0.4,
      fuzzyWeight = 0.2
    } = options;
    
    const results = [];
    
    // Perform all search types
    if (includeVector) {
      const vectorResults = this.vectorSearch(query, limit * 2);
      vectorResults.forEach(r => {
        r.score *= vectorWeight;
        results.push(r);
      });
    }
    
    if (includeSemantic) {
      const semanticResults = this.semanticSearch(query, limit * 2);
      semanticResults.forEach(r => {
        r.score *= semanticWeight;
        results.push(r);
      });
    }
    
    if (includeFuzzy) {
      const fuzzyResults = this.fuzzySearch(query, limit * 2, 0.5);
      fuzzyResults.forEach(r => {
        r.score *= fuzzyWeight;
        results.push(r);
      });
    }
    
    // Merge and deduplicate results
    const merged = this.mergeResults(results);
    
    return merged
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  mergeResults(results) {
    const map = new Map();
    
    results.forEach(result => {
      const id = result.artwork.id;
      if (map.has(id)) {
        const existing = map.get(id);
        existing.score += result.score;
        existing.methods.push(result.method);
      } else {
        map.set(id, {
          artwork: result.artwork,
          score: result.score,
          methods: [result.method]
        });
      }
    });
    
    return Array.from(map.values());
  }

  // ===== PUBLIC API =====
  
  async search(query, options = {}) {
    const { type = 'hybrid', ...rest } = options;
    
    switch (type) {
      case 'vector':
        return this.vectorSearch(query, rest.limit);
      case 'semantic':
        return this.semanticSearch(query, rest.limit);
      case 'fuzzy':
        return this.fuzzySearch(query, rest.limit);
      case 'image':
        return this.imageSimilaritySearch(query, rest.limit);
      case 'hybrid':
      default:
        return this.hybridSearch(query, rest);
    }
  }

  getSearchStats() {
    return {
      indexedArtworks: this.artworks.length,
      vectorIndexSize: Object.keys(this.vectorIndex?.index || {}).length,
      colorIndexSize: Object.keys(this.colorIndex || {}).length,
      stopWordsCount: this.stopWords.size,
      synonymsCount: Object.keys(this.synonyms).length
    };
  }
}

// Initialize on page load
let advancedSearchEngine;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    advancedSearchEngine = new AdvancedSearchEngine();
    window.advancedSearchEngine = advancedSearchEngine;
  });
} else {
  advancedSearchEngine = new AdvancedSearchEngine();
  window.advancedSearchEngine = advancedSearchEngine;
}
