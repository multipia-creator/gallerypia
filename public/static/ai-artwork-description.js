/**
 * GALLERYPIA - AI Artwork Description Generator
 * Phase 10: Advanced AI Features
 * GPT-4 Integration for Intelligent Art Analysis
 */

class AIArtworkDescription {
  constructor() {
    this.apiEndpoint = '/api/ai/describe';
    this.cache = new Map();
    this.maxCacheSize = 100;
    this.init();
  }

  init() {
    console.log('🤖 AI Artwork Description Generator initializing...');
  }

  async generateDescription(artworkData) {
    console.log('🎨 Generating AI description for:', artworkData.title);

    // 캐시 확인
    const cacheKey = this.getCacheKey(artworkData);
    if (this.cache.has(cacheKey)) {
      console.log('✅ Using cached description');
      return this.cache.get(cacheKey);
    }

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image_url: artworkData.image_url,
          title: artworkData.title,
          artist_name: artworkData.artist_name,
          category: artworkData.category,
          tags: artworkData.tags,
          existing_description: artworkData.description
        })
      });

      const result = await response.json();

      if (result.success && result.description) {
        // 캐시 저장
        this.addToCache(cacheKey, result.description);
        
        console.log('✅ AI description generated');
        return result.description;
      } else {
        throw new Error(result.message || 'Failed to generate description');
      }
    } catch (error) {
      console.error('❌ AI description generation failed:', error);
      // Fallback: 기본 설명 생성
      return this.generateFallbackDescription(artworkData);
    }
  }

  generateFallbackDescription(artworkData) {
    console.log('🔄 Generating fallback description...');

    const templates = {
      abstract: `This ${artworkData.category || 'abstract'} artwork titled "${artworkData.title}" by ${artworkData.artist_name} showcases a unique blend of colors and forms. The piece invites viewers to explore their own interpretations and emotional responses.`,
      
      landscape: `"${artworkData.title}" by ${artworkData.artist_name} captures the essence of natural beauty. This ${artworkData.category || 'landscape'} piece demonstrates the artist's keen eye for detail and mastery of light and composition.`,
      
      portrait: `In this compelling ${artworkData.category || 'portrait'}, ${artworkData.artist_name} presents "${artworkData.title}". The artwork reveals the artist's skill in capturing human emotion and character through careful attention to expression and technique.`,
      
      digital: `"${artworkData.title}" represents ${artworkData.artist_name}'s innovative approach to ${artworkData.category || 'digital'} art. This piece demonstrates the seamless fusion of technology and artistic vision, creating a unique visual experience.`,
      
      default: `"${artworkData.title}" is a remarkable work by ${artworkData.artist_name}. This ${artworkData.category || 'contemporary'} piece showcases the artist's distinctive style and creative vision.`
    };

    const category = artworkData.category?.toLowerCase() || 'default';
    const template = templates[category] || templates.default;

    return {
      description: template,
      highlights: this.extractHighlights(artworkData),
      mood: this.analyzeMood(artworkData),
      technical_analysis: this.analyzeTechnique(artworkData),
      generated_by: 'fallback'
    };
  }

  extractHighlights(artworkData) {
    const highlights = [];

    if (artworkData.tags && artworkData.tags.length > 0) {
      highlights.push(`Key elements: ${artworkData.tags.slice(0, 5).join(', ')}`);
    }

    if (artworkData.price) {
      highlights.push(`Valued at ${artworkData.price} ETH`);
    }

    if (artworkData.created_at) {
      const year = new Date(artworkData.created_at).getFullYear();
      highlights.push(`Created in ${year}`);
    }

    return highlights;
  }

  analyzeMood(artworkData) {
    // 간단한 키워드 기반 분위기 분석
    const moodKeywords = {
      vibrant: ['colorful', 'bright', 'vivid', 'energetic'],
      calm: ['peaceful', 'serene', 'tranquil', 'quiet'],
      dark: ['dark', 'mysterious', 'gothic', 'noir'],
      playful: ['fun', 'whimsical', 'playful', 'cheerful'],
      dramatic: ['dramatic', 'intense', 'powerful', 'bold']
    };

    const description = (artworkData.description || '').toLowerCase();
    const tags = (artworkData.tags || []).join(' ').toLowerCase();
    const combinedText = `${description} ${tags}`;

    for (const [mood, keywords] of Object.entries(moodKeywords)) {
      if (keywords.some(keyword => combinedText.includes(keyword))) {
        return mood;
      }
    }

    return 'balanced';
  }

  analyzeTechnique(artworkData) {
    const techniques = {
      digital: 'Digital art techniques with modern tools and software',
      traditional: 'Traditional art methods including painting and drawing',
      mixed: 'Mixed media combining various artistic techniques',
      photography: 'Photographic composition and lighting techniques',
      '3d': '3D modeling and rendering techniques'
    };

    const category = artworkData.category?.toLowerCase() || '';
    
    if (category.includes('digital') || category.includes('nft')) {
      return techniques.digital;
    } else if (category.includes('photo')) {
      return techniques.photography;
    } else if (category.includes('3d')) {
      return techniques['3d'];
    }

    return techniques.traditional;
  }

  async enhanceDescription(existingDescription, artworkData) {
    console.log('✨ Enhancing existing description...');

    try {
      const response = await fetch('/api/ai/enhance-description', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: existingDescription,
          artwork_data: artworkData,
          enhancement_type: 'expand' // expand, simplify, professional, casual
        })
      });

      const result = await response.json();

      if (result.success) {
        return result.enhanced_description;
      }
    } catch (error) {
      console.error('❌ Enhancement failed:', error);
    }

    return existingDescription;
  }

  async generateMultipleDescriptions(artworkData, count = 3) {
    console.log(`📝 Generating ${count} description variations...`);

    const variations = [];

    for (let i = 0; i < count; i++) {
      try {
        const response = await fetch('/api/ai/describe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            ...artworkData,
            variation: i,
            temperature: 0.7 + (i * 0.1) // 다양성 증가
          })
        });

        const result = await response.json();

        if (result.success && result.description) {
          variations.push({
            id: i + 1,
            description: result.description,
            style: this.getDescriptionStyle(i)
          });
        }
      } catch (error) {
        console.error(`❌ Variation ${i + 1} failed:`, error);
      }
    }

    return variations;
  }

  getDescriptionStyle(index) {
    const styles = ['professional', 'poetic', 'casual'];
    return styles[index % styles.length];
  }

  async analyzeArtworkEmotion(imageUrl) {
    console.log('😊 Analyzing artwork emotion...');

    try {
      const response = await fetch('/api/ai/analyze-emotion', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ image_url: imageUrl })
      });

      const result = await response.json();

      if (result.success) {
        return {
          primary_emotion: result.emotion,
          confidence: result.confidence,
          emotions: result.emotions || {},
          color_mood: result.color_mood
        };
      }
    } catch (error) {
      console.error('❌ Emotion analysis failed:', error);
    }

    return this.getFallbackEmotion();
  }

  getFallbackEmotion() {
    return {
      primary_emotion: 'neutral',
      confidence: 0.5,
      emotions: {
        joy: 0.2,
        calm: 0.3,
        excitement: 0.2,
        mystery: 0.3
      },
      color_mood: 'balanced'
    };
  }

  async generateArtworkStory(artworkData) {
    console.log('📖 Generating artwork story...');

    try {
      const response = await fetch('/api/ai/generate-story', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artwork: artworkData,
          story_type: 'creative' // creative, historical, conceptual
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          title: result.story_title,
          story: result.story,
          themes: result.themes,
          inspiration: result.inspiration
        };
      }
    } catch (error) {
      console.error('❌ Story generation failed:', error);
    }

    return this.generateFallbackStory(artworkData);
  }

  generateFallbackStory(artworkData) {
    return {
      title: `The Story Behind "${artworkData.title}"`,
      story: `This artwork represents a unique vision by ${artworkData.artist_name}. Through careful composition and thoughtful execution, the piece invites viewers to explore their own interpretations and connect with the artist's creative journey.`,
      themes: ['creativity', 'expression', 'vision'],
      inspiration: 'Artist\'s personal experience and creative exploration'
    };
  }

  async compareArtworks(artwork1, artwork2) {
    console.log('🔍 Comparing artworks...');

    try {
      const response = await fetch('/api/ai/compare-artworks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artwork1: artwork1,
          artwork2: artwork2
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          similarity_score: result.similarity_score,
          common_elements: result.common_elements,
          differences: result.differences,
          style_comparison: result.style_comparison,
          recommendation: result.recommendation
        };
      }
    } catch (error) {
      console.error('❌ Comparison failed:', error);
    }

    return this.basicComparison(artwork1, artwork2);
  }

  basicComparison(artwork1, artwork2) {
    const sameArtist = artwork1.artist_name === artwork2.artist_name;
    const sameCategory = artwork1.category === artwork2.category;
    
    let similarityScore = 0;
    if (sameArtist) similarityScore += 0.4;
    if (sameCategory) similarityScore += 0.3;

    // 태그 유사도
    const tags1 = new Set(artwork1.tags || []);
    const tags2 = new Set(artwork2.tags || []);
    const commonTags = [...tags1].filter(tag => tags2.has(tag));
    similarityScore += (commonTags.length / Math.max(tags1.size, tags2.size)) * 0.3;

    return {
      similarity_score: Math.min(similarityScore, 1),
      common_elements: commonTags,
      differences: {
        artist: !sameArtist,
        category: !sameCategory,
        price: Math.abs(artwork1.price - artwork2.price)
      },
      style_comparison: sameArtist ? 'Same artist style' : 'Different styles',
      recommendation: similarityScore > 0.7 ? 
        'These artworks share many similarities' : 
        'These artworks are quite different'
    };
  }

  getCacheKey(artworkData) {
    return `${artworkData.id || artworkData.title}_${artworkData.artist_name}`;
  }

  addToCache(key, value) {
    // LRU 캐시 구현
    if (this.cache.size >= this.maxCacheSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Cache cleared');
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'ai_description_usage', {
        event_category: 'AI_Features',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.AIArtworkDescription = AIArtworkDescription;
window.aiDescription = null;

// 초기화 함수
window.initAIDescription = function() {
  if (!window.aiDescription) {
    window.aiDescription = new AIArtworkDescription();
    console.log('✅ AI Artwork Description initialized');
  }
  return window.aiDescription;
};

// 편의 함수들
window.generateArtDescription = async function(artworkData) {
  if (!window.aiDescription) {
    window.initAIDescription();
  }
  return await window.aiDescription.generateDescription(artworkData);
};

window.enhanceArtDescription = async function(description, artworkData) {
  if (!window.aiDescription) {
    window.initAIDescription();
  }
  return await window.aiDescription.enhanceDescription(description, artworkData);
};

window.analyzeArtEmotion = async function(imageUrl) {
  if (!window.aiDescription) {
    window.initAIDescription();
  }
  return await window.aiDescription.analyzeArtworkEmotion(imageUrl);
};

console.log('📦 AI Artwork Description module loaded');
