/**
 * GALLERYPIA - AI Style Transfer System
 * Phase 10: Advanced AI Features
 * Neural Style Transfer for Artwork Creation
 */

class AIStyleTransfer {
  constructor() {
    this.apiEndpoint = '/api/ai/style-transfer';
    this.styles = this.loadPresetStyles();
    this.processingQueue = [];
    this.maxQueueSize = 10;
    this.init();
  }

  init() {
    console.log('🎨 AI Style Transfer System initializing...');
    this.loadTensorFlow();
  }

  loadTensorFlow() {
    // TensorFlow.js 로드 (선택적)
    if (typeof tf === 'undefined') {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.11.0/dist/tf.min.js';
      script.onload = () => {
        console.log('✅ TensorFlow.js loaded');
        this.tfLoaded = true;
      };
      document.head.appendChild(script);
    } else {
      this.tfLoaded = true;
    }
  }

  loadPresetStyles() {
    return {
      vangogh: {
        name: 'Van Gogh',
        description: 'Starry Night inspired swirling brushstrokes',
        model: 'vangogh_starrynight',
        intensity: 0.8,
        thumbnail: '/static/styles/vangogh.jpg'
      },
      picasso: {
        name: 'Picasso',
        description: 'Cubist geometric abstraction',
        model: 'picasso_cubism',
        intensity: 0.7,
        thumbnail: '/static/styles/picasso.jpg'
      },
      monet: {
        name: 'Monet',
        description: 'Impressionist light and color',
        model: 'monet_impressionism',
        intensity: 0.75,
        thumbnail: '/static/styles/monet.jpg'
      },
      kandinsky: {
        name: 'Kandinsky',
        description: 'Abstract expressionism',
        model: 'kandinsky_abstract',
        intensity: 0.85,
        thumbnail: '/static/styles/kandinsky.jpg'
      },
      hokusai: {
        name: 'Hokusai',
        description: 'Japanese ukiyo-e woodblock print style',
        model: 'hokusai_wave',
        intensity: 0.8,
        thumbnail: '/static/styles/hokusai.jpg'
      },
      pollock: {
        name: 'Pollock',
        description: 'Abstract expressionist drip painting',
        model: 'pollock_drip',
        intensity: 0.9,
        thumbnail: '/static/styles/pollock.jpg'
      },
      warhol: {
        name: 'Warhol',
        description: 'Pop art bold colors',
        model: 'warhol_popart',
        intensity: 0.7,
        thumbnail: '/static/styles/warhol.jpg'
      },
      dali: {
        name: 'Dali',
        description: 'Surrealist dreamlike imagery',
        model: 'dali_surrealism',
        intensity: 0.85,
        thumbnail: '/static/styles/dali.jpg'
      }
    };
  }

  async transferStyle(contentImage, styleKey, options = {}) {
    console.log(`🎨 Applying ${styleKey} style...`);

    const style = this.styles[styleKey];
    if (!style) {
      throw new Error(`Style "${styleKey}" not found`);
    }

    // 큐 확인
    if (this.processingQueue.length >= this.maxQueueSize) {
      throw new Error('Processing queue is full. Please try again later.');
    }

    const jobId = this.generateJobId();
    const job = {
      id: jobId,
      contentImage: contentImage,
      style: styleKey,
      status: 'pending',
      created_at: Date.now()
    };

    this.processingQueue.push(job);

    try {
      const response = await fetch(this.apiEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_image: contentImage,
          style_model: style.model,
          intensity: options.intensity || style.intensity,
          preserve_colors: options.preserveColors || false,
          output_size: options.outputSize || 'original',
          job_id: jobId
        })
      });

      const result = await response.json();

      if (result.success) {
        job.status = 'completed';
        job.result_url = result.image_url;
        
        console.log('✅ Style transfer completed');
        this.trackUsage('style_transfer', { style: styleKey });
        
        return {
          success: true,
          image_url: result.image_url,
          job_id: jobId,
          processing_time: result.processing_time
        };
      } else {
        throw new Error(result.message || 'Style transfer failed');
      }
    } catch (error) {
      job.status = 'failed';
      job.error = error.message;
      console.error('❌ Style transfer failed:', error);
      
      // Fallback: 클라이언트 사이드 처리
      if (this.tfLoaded && options.fallbackToClient) {
        return await this.clientSideTransfer(contentImage, styleKey);
      }
      
      throw error;
    } finally {
      // 큐에서 제거
      this.processingQueue = this.processingQueue.filter(j => j.id !== jobId);
    }
  }

  async clientSideTransfer(contentImage, styleKey) {
    console.log('🔄 Using client-side style transfer...');

    if (!this.tfLoaded) {
      throw new Error('TensorFlow.js not loaded');
    }

    try {
      // 간단한 필터 기반 스타일 전환
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = contentImage;
      });

      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      // 스타일별 필터 적용
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      this.applyStyleFilter(imageData, styleKey);
      ctx.putImageData(imageData, 0, 0);

      const resultUrl = canvas.toDataURL('image/png');
      
      return {
        success: true,
        image_url: resultUrl,
        processing_time: 0,
        method: 'client-side'
      };
    } catch (error) {
      console.error('❌ Client-side transfer failed:', error);
      throw error;
    }
  }

  applyStyleFilter(imageData, styleKey) {
    const data = imageData.data;
    
    // 스타일별 간단한 필터
    const filters = {
      vangogh: (r, g, b) => {
        // 강렬한 색상, 소용돌이 효과 시뮬레이션
        return [
          Math.min(255, r * 1.2),
          Math.min(255, g * 1.1),
          Math.min(255, b * 1.3)
        ];
      },
      picasso: (r, g, b) => {
        // 색상 분할, 기하학적
        return [
          r > 128 ? 255 : 0,
          g > 128 ? 255 : 0,
          b > 128 ? 255 : 0
        ];
      },
      monet: (r, g, b) => {
        // 부드러운 색상 전환
        return [
          r * 0.9,
          g * 1.1,
          b * 1.05
        ];
      },
      warhol: (r, g, b) => {
        // 팝아트 색상
        return [
          Math.floor(r / 64) * 85,
          Math.floor(g / 64) * 85,
          Math.floor(b / 64) * 85
        ];
      }
    };

    const filter = filters[styleKey] || ((r, g, b) => [r, g, b]);

    for (let i = 0; i < data.length; i += 4) {
      const [newR, newG, newB] = filter(data[i], data[i + 1], data[i + 2]);
      data[i] = newR;
      data[i + 1] = newG;
      data[i + 2] = newB;
    }
  }

  async batchTransfer(contentImage, styleKeys) {
    console.log(`🎨 Batch transfer with ${styleKeys.length} styles...`);

    const results = [];

    for (const styleKey of styleKeys) {
      try {
        const result = await this.transferStyle(contentImage, styleKey);
        results.push({
          style: styleKey,
          success: true,
          result: result
        });
      } catch (error) {
        console.error(`❌ ${styleKey} failed:`, error);
        results.push({
          style: styleKey,
          success: false,
          error: error.message
        });
      }
    }

    return results;
  }

  async blendStyles(contentImage, style1, style2, blendRatio = 0.5) {
    console.log(`🎨 Blending ${style1} and ${style2} (${blendRatio})...`);

    try {
      const response = await fetch('/api/ai/blend-styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          content_image: contentImage,
          style1: this.styles[style1].model,
          style2: this.styles[style2].model,
          blend_ratio: blendRatio
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Style blend completed');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Style blend failed:', error);
      throw error;
    }
  }

  async createCustomStyle(styleImage, styleName) {
    console.log(`🎨 Creating custom style: ${styleName}...`);

    try {
      const response = await fetch('/api/ai/create-custom-style', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          style_image: styleImage,
          style_name: styleName,
          train_iterations: 1000
        })
      });

      const result = await response.json();

      if (result.success) {
        // 커스텀 스타일 추가
        this.styles[result.style_id] = {
          name: styleName,
          description: 'Custom user-created style',
          model: result.model_id,
          intensity: 0.8,
          custom: true,
          created_by: result.user_id
        };

        console.log('✅ Custom style created');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Custom style creation failed:', error);
      throw error;
    }
  }

  async animateStyleTransition(contentImage, fromStyle, toStyle, frames = 10) {
    console.log(`🎬 Creating style transition animation (${frames} frames)...`);

    const frameUrls = [];

    for (let i = 0; i <= frames; i++) {
      const blendRatio = i / frames;
      
      try {
        const result = await this.blendStyles(
          contentImage,
          fromStyle,
          toStyle,
          blendRatio
        );

        frameUrls.push(result.image_url);
      } catch (error) {
        console.error(`❌ Frame ${i} failed:`, error);
      }
    }

    return {
      success: true,
      frames: frameUrls,
      duration: frames * 100, // ms
      format: 'sequence'
    };
  }

  getStylePreview(styleKey) {
    const style = this.styles[styleKey];
    if (!style) return null;

    return {
      name: style.name,
      description: style.description,
      thumbnail: style.thumbnail,
      intensity: style.intensity
    };
  }

  getAllStyles() {
    return Object.keys(this.styles).map(key => ({
      id: key,
      ...this.styles[key]
    }));
  }

  getPopularStyles() {
    // 인기 스타일 (사용 빈도 기반 - 실제로는 DB에서)
    return ['vangogh', 'monet', 'picasso', 'warhol'];
  }

  async getStyleRecommendations(artworkData) {
    console.log('💡 Getting style recommendations...');

    try {
      const response = await fetch('/api/ai/recommend-styles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artwork: artworkData,
          count: 3
        })
      });

      const result = await response.json();

      if (result.success) {
        return result.recommended_styles;
      }
    } catch (error) {
      console.error('❌ Recommendation failed:', error);
    }

    // Fallback
    return this.getPopularStyles().slice(0, 3);
  }

  generateJobId() {
    return `style_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getQueueStatus() {
    return {
      queue_length: this.processingQueue.length,
      max_size: this.maxQueueSize,
      jobs: this.processingQueue.map(job => ({
        id: job.id,
        status: job.status,
        style: job.style,
        created_at: job.created_at
      }))
    };
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'ai_style_transfer_usage', {
        event_category: 'AI_Features',
        feature: feature,
        ...data
      });
    }
  }

  destroy() {
    this.processingQueue = [];
    console.log('🗑️ AI Style Transfer destroyed');
  }
}

// 글로벌 인스턴스
window.AIStyleTransfer = AIStyleTransfer;
window.aiStyleTransfer = null;

// 초기화 함수
window.initStyleTransfer = function() {
  if (!window.aiStyleTransfer) {
    window.aiStyleTransfer = new AIStyleTransfer();
    console.log('✅ AI Style Transfer initialized');
  }
  return window.aiStyleTransfer;
};

// 편의 함수
window.applyArtStyle = async function(imageUrl, styleKey, options = {}) {
  if (!window.aiStyleTransfer) {
    window.initStyleTransfer();
  }
  return await window.aiStyleTransfer.transferStyle(imageUrl, styleKey, options);
};

window.blendArtStyles = async function(imageUrl, style1, style2, ratio = 0.5) {
  if (!window.aiStyleTransfer) {
    window.initStyleTransfer();
  }
  return await window.aiStyleTransfer.blendStyles(imageUrl, style1, style2, ratio);
};

console.log('📦 AI Style Transfer module loaded');
