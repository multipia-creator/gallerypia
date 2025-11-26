/**
 * GALLERYPIA - AI Generative Art Tools
 * Phase 10: Advanced AI Features
 * Text-to-Image & Image-to-Image Generation
 */

class AIGenerativeArt {
  constructor() {
    this.apiEndpoint = '/api/ai/generate';
    this.models = this.loadAvailableModels();
    this.generationHistory = [];
    this.maxHistory = 50;
    this.init();
  }

  init() {
    console.log('🎨 AI Generative Art Tools initializing...');
  }

  loadAvailableModels() {
    return {
      'stable-diffusion': {
        name: 'Stable Diffusion XL',
        type: 'text-to-image',
        description: 'High-quality photorealistic and artistic images',
        max_resolution: '1024x1024',
        styles: ['realistic', 'artistic', 'anime', 'digital-art']
      },
      'dall-e-3': {
        name: 'DALL-E 3',
        type: 'text-to-image',
        description: 'Creative and imaginative artwork generation',
        max_resolution: '1024x1024',
        styles: ['creative', 'surreal', 'abstract']
      },
      'midjourney': {
        name: 'Midjourney (API)',
        type: 'text-to-image',
        description: 'Artistic and aesthetic focused generation',
        max_resolution: '1024x1024',
        styles: ['artistic', 'cinematic', 'fantasy']
      },
      'controlnet': {
        name: 'ControlNet',
        type: 'image-to-image',
        description: 'Guided image generation with control',
        features: ['pose', 'edge', 'depth', 'segmentation']
      }
    };
  }

  async generateFromText(prompt, options = {}) {
    console.log('🎨 Generating artwork from text:', prompt);

    const model = options.model || 'stable-diffusion';
    const style = options.style || 'artistic';
    const negativePrompt = options.negativePrompt || 'low quality, blurry, watermark';

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: prompt,
          negative_prompt: negativePrompt,
          model: model,
          style: style,
          width: options.width || 1024,
          height: options.height || 1024,
          steps: options.steps || 30,
          guidance_scale: options.guidanceScale || 7.5,
          seed: options.seed || -1,
          batch_size: options.batchSize || 1
        })
      });

      const result = await response.json();

      if (result.success) {
        const generation = {
          id: this.generateId(),
          prompt: prompt,
          model: model,
          style: style,
          images: result.images,
          seed: result.seed,
          created_at: Date.now()
        };

        this.addToHistory(generation);
        this.trackUsage('text_to_image', { model, style });

        console.log(`✅ Generated ${result.images.length} image(s)`);
        return generation;
      } else {
        throw new Error(result.message || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Text-to-image generation failed:', error);
      throw error;
    }
  }

  async generateFromImage(sourceImage, prompt, options = {}) {
    console.log('🎨 Generating artwork from image:', prompt);

    try {
      const response = await fetch('/api/ai/image-to-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImage,
          prompt: prompt,
          strength: options.strength || 0.75,
          guidance_scale: options.guidanceScale || 7.5,
          steps: options.steps || 30,
          seed: options.seed || -1
        })
      });

      const result = await response.json();

      if (result.success) {
        const generation = {
          id: this.generateId(),
          type: 'image-to-image',
          source_image: sourceImage,
          prompt: prompt,
          result_image: result.image_url,
          created_at: Date.now()
        };

        this.addToHistory(generation);
        this.trackUsage('image_to_image');

        console.log('✅ Image-to-image generation completed');
        return generation;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Image-to-image generation failed:', error);
      throw error;
    }
  }

  async inpaint(sourceImage, maskImage, prompt, options = {}) {
    console.log('🎨 Inpainting image...');

    try {
      const response = await fetch('/api/ai/inpaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImage,
          mask_image: maskImage,
          prompt: prompt,
          strength: options.strength || 0.99,
          guidance_scale: options.guidanceScale || 7.5
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Inpainting completed');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Inpainting failed:', error);
      throw error;
    }
  }

  async outpaint(sourceImage, direction, prompt, options = {}) {
    console.log(`🎨 Outpainting image (${direction})...`);

    try {
      const response = await fetch('/api/ai/outpaint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImage,
          direction: direction, // left, right, top, bottom, all
          prompt: prompt,
          expansion_pixels: options.expansionPixels || 512
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Outpainting completed');
        return result;
      }
    } catch (error) {
      console.error('❌ Outpainting failed:', error);
      throw error;
    }
  }

  async upscale(sourceImage, scale = 2) {
    console.log(`🎨 Upscaling image (${scale}x)...`);

    try {
      const response = await fetch('/api/ai/upscale', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImage,
          scale: scale, // 2, 4
          model: 'real-esrgan'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Upscaling completed');
        this.trackUsage('upscale', { scale });
        return result;
      }
    } catch (error) {
      console.error('❌ Upscaling failed:', error);
      throw error;
    }
  }

  async generateVariations(sourceImage, count = 4) {
    console.log(`🎨 Generating ${count} variations...`);

    try {
      const response = await fetch('/api/ai/variations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          source_image: sourceImage,
          count: count,
          similarity: 0.8 // 0-1, higher = more similar
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ Generated ${result.variations.length} variations`);
        return result.variations;
      }
    } catch (error) {
      console.error('❌ Variation generation failed:', error);
      throw error;
    }
  }

  async enhancePrompt(basicPrompt) {
    console.log('✨ Enhancing prompt with AI...');

    try {
      const response = await fetch('/api/ai/enhance-prompt', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: basicPrompt,
          enhancement_type: 'detailed' // detailed, artistic, technical
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Prompt enhanced');
        return {
          original: basicPrompt,
          enhanced: result.enhanced_prompt,
          suggestions: result.suggestions
        };
      }
    } catch (error) {
      console.error('❌ Prompt enhancement failed:', error);
    }

    return {
      original: basicPrompt,
      enhanced: basicPrompt,
      suggestions: []
    };
  }

  async analyzeAndSuggest(sourceImage) {
    console.log('🔍 Analyzing image for generation suggestions...');

    try {
      const response = await fetch('/api/ai/analyze-for-generation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          image: sourceImage
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          detected_objects: result.objects,
          dominant_colors: result.colors,
          suggested_styles: result.styles,
          prompt_suggestions: result.prompts,
          improvement_tips: result.tips
        };
      }
    } catch (error) {
      console.error('❌ Analysis failed:', error);
    }

    return null;
  }

  async createAnimatedSequence(promptSequence, fps = 10) {
    console.log(`🎬 Creating animated sequence (${promptSequence.length} frames)...`);

    const frames = [];

    for (let i = 0; i < promptSequence.length; i++) {
      try {
        const result = await this.generateFromText(promptSequence[i], {
          seed: i === 0 ? -1 : frames[i - 1].seed, // 연속성 유지
          steps: 20 // 빠른 생성
        });

        frames.push(result.images[0]);
      } catch (error) {
        console.error(`❌ Frame ${i} failed:`, error);
      }
    }

    return {
      frames: frames,
      fps: fps,
      duration: (frames.length / fps) * 1000
    };
  }

  async remix(artworkId, remixInstructions) {
    console.log(`🎨 Remixing artwork ${artworkId}...`);

    try {
      const response = await fetch(`/api/ai/remix/${artworkId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          instructions: remixInstructions,
          preserve_style: true,
          creativity: 0.7 // 0-1
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Remix completed');
        this.trackUsage('remix', { artwork_id: artworkId });
        return result;
      }
    } catch (error) {
      console.error('❌ Remix failed:', error);
      throw error;
    }
  }

  async createCollage(images, layout = 'grid') {
    console.log(`🎨 Creating collage with ${images.length} images...`);

    try {
      const response = await fetch('/api/ai/collage', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          images: images,
          layout: layout, // grid, mosaic, freeform
          blend_mode: 'normal',
          output_size: '2048x2048'
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Collage created');
        return result;
      }
    } catch (error) {
      console.error('❌ Collage creation failed:', error);
      throw error;
    }
  }

  getGenerationHistory() {
    return this.generationHistory;
  }

  getHistoryItem(id) {
    return this.generationHistory.find(item => item.id === id);
  }

  addToHistory(generation) {
    this.generationHistory.unshift(generation);
    
    if (this.generationHistory.length > this.maxHistory) {
      this.generationHistory.pop();
    }

    // localStorage에 저장 (선택적)
    try {
      localStorage.setItem('ai_generation_history', JSON.stringify(
        this.generationHistory.slice(0, 20) // 최근 20개만
      ));
    } catch (error) {
      console.warn('⚠️ Failed to save history to localStorage');
    }
  }

  clearHistory() {
    this.generationHistory = [];
    localStorage.removeItem('ai_generation_history');
    console.log('🗑️ Generation history cleared');
  }

  loadHistoryFromStorage() {
    try {
      const stored = localStorage.getItem('ai_generation_history');
      if (stored) {
        this.generationHistory = JSON.parse(stored);
        console.log(`📥 Loaded ${this.generationHistory.length} history items`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load history from localStorage');
    }
  }

  getAvailableModels() {
    return Object.keys(this.models).map(key => ({
      id: key,
      ...this.models[key]
    }));
  }

  getModelInfo(modelId) {
    return this.models[modelId] || null;
  }

  generateId() {
    return `gen_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'ai_generative_art_usage', {
        event_category: 'AI_Features',
        feature: feature,
        ...data
      });
    }
  }

  destroy() {
    this.generationHistory = [];
    console.log('🗑️ AI Generative Art destroyed');
  }
}

// 글로벌 인스턴스
window.AIGenerativeArt = AIGenerativeArt;
window.aiGenerativeArt = null;

// 초기화 함수
window.initGenerativeArt = function() {
  if (!window.aiGenerativeArt) {
    window.aiGenerativeArt = new AIGenerativeArt();
    window.aiGenerativeArt.loadHistoryFromStorage();
    console.log('✅ AI Generative Art initialized');
  }
  return window.aiGenerativeArt;
};

// 편의 함수들
window.generateArtFromText = async function(prompt, options = {}) {
  if (!window.aiGenerativeArt) {
    window.initGenerativeArt();
  }
  return await window.aiGenerativeArt.generateFromText(prompt, options);
};

window.generateArtFromImage = async function(sourceImage, prompt, options = {}) {
  if (!window.aiGenerativeArt) {
    window.initGenerativeArt();
  }
  return await window.aiGenerativeArt.generateFromImage(sourceImage, prompt, options);
};

window.upscaleArtwork = async function(imageUrl, scale = 2) {
  if (!window.aiGenerativeArt) {
    window.initGenerativeArt();
  }
  return await window.aiGenerativeArt.upscale(imageUrl, scale);
};

console.log('📦 AI Generative Art module loaded');
