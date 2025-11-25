/**
 * Performance Optimizer
 * Image optimization, lazy loading, code splitting, caching, performance monitoring
 * Phase 6.8 - Low Priority UX (UX-L-042 to UX-L-046: Performance)
 */

class PerformanceOptimizer {
  constructor() {
    this.metrics = {};
    this.cacheVersion = 'v1';
    this.init();
  }

  init() {
    console.log('⚡ Performance Optimizer initialized');
    
    this.enableLazyLoading();
    this.initializeImageOptimization();
    this.setupPerformanceMonitoring();
    this.initializeCache();
  }

  // ===== Lazy Loading =====
  
  enableLazyLoading() {
    if ('IntersectionObserver' in window) {
      const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const img = entry.target;
            const src = img.dataset.src;
            
            if (src) {
              // Show loading placeholder
              img.classList.add('lazy-loading');
              
              // Load image
              const tempImg = new Image();
              tempImg.onload = () => {
                img.src = src;
                img.classList.remove('lazy-loading');
                img.classList.add('lazy-loaded');
              };
              tempImg.src = src;
              
              img.removeAttribute('data-src');
              observer.unobserve(img);
            }
          }
        });
      }, {
        rootMargin: '50px 0px', // Start loading 50px before entering viewport
        threshold: 0.01
      });

      // Observe all images with data-src
      document.querySelectorAll('img[data-src]').forEach(img => {
        imageObserver.observe(img);
      });

      // Re-observe when new images are added
      this.setupMutationObserver(imageObserver);
    }
  }

  setupMutationObserver(imageObserver) {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === 1) { // Element node
            if (node.matches('img[data-src]')) {
              imageObserver.observe(node);
            }
            
            node.querySelectorAll?.('img[data-src]').forEach(img => {
              imageObserver.observe(img);
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  // ===== Image Optimization =====
  
  initializeImageOptimization() {
    // Convert images to WebP if supported
    if (this.supportsWebP()) {
      this.convertToWebP();
    }
    
    // Generate responsive image srcsets
    this.generateResponsiveSrcsets();
  }

  supportsWebP() {
    const elem = document.createElement('canvas');
    if (elem.getContext && elem.getContext('2d')) {
      return elem.toDataURL('image/webp').indexOf('data:image/webp') === 0;
    }
    return false;
  }

  convertToWebP() {
    document.querySelectorAll('img[data-webp]').forEach(img => {
      const webpSrc = img.dataset.webp;
      if (webpSrc) {
        img.src = webpSrc;
      }
    });
  }

  generateResponsiveSrcsets() {
    document.querySelectorAll('img[data-responsive]').forEach(img => {
      const baseUrl = img.dataset.responsive;
      const srcset = [
        `${baseUrl}?w=320 320w`,
        `${baseUrl}?w=640 640w`,
        `${baseUrl}?w=960 960w`,
        `${baseUrl}?w=1280 1280w`
      ].join(', ');
      
      img.srcset = srcset;
      img.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
    });
  }

  // ===== Caching =====
  
  async initializeCache() {
    if ('caches' in window) {
      try {
        const cache = await caches.open(this.cacheVersion);
        console.log('✅ Cache initialized:', this.cacheVersion);
        
        // Pre-cache critical resources
        await this.preCacheResources(cache);
      } catch (error) {
        console.error('Cache initialization failed:', error);
      }
    }
  }

  async preCacheResources(cache) {
    const criticalResources = [
      '/static/app.js',
      '/static/styles.css',
      '/static/logo.png'
    ];
    
    try {
      await cache.addAll(criticalResources);
      console.log('✅ Critical resources cached');
    } catch (error) {
      console.error('Pre-caching failed:', error);
    }
  }

  async cacheAPIResponse(url, response) {
    if ('caches' in window) {
      try {
        const cache = await caches.open(`${this.cacheVersion}-api`);
        await cache.put(url, response.clone());
      } catch (error) {
        console.error('API caching failed:', error);
      }
    }
    return response;
  }

  async getCachedAPIResponse(url) {
    if ('caches' in window) {
      try {
        const cache = await caches.open(`${this.cacheVersion}-api`);
        const cached = await cache.match(url);
        
        if (cached) {
          console.log('📦 Serving from cache:', url);
          return cached;
        }
      } catch (error) {
        console.error('Cache retrieval failed:', error);
      }
    }
    return null;
  }

  async clearCache() {
    if ('caches' in window) {
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames.map(cacheName => caches.delete(cacheName))
      );
      console.log('🗑️ All caches cleared');
    }
  }

  // ===== Performance Monitoring =====
  
  setupPerformanceMonitoring() {
    // Monitor Core Web Vitals
    this.monitorCoreWebVitals();
    
    // Monitor resource loading
    this.monitorResourceTiming();
    
    // Monitor user interactions
    this.monitorInteractions();
  }

  monitorCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      try {
        const lcpObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          const lastEntry = entries[entries.length - 1];
          this.metrics.lcp = lastEntry.renderTime || lastEntry.loadTime;
          console.log('📊 LCP:', this.metrics.lcp, 'ms');
        });
        lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
      } catch (e) {
        console.warn('LCP observer not supported');
      }

      // First Input Delay (FID)
      try {
        const fidObserver = new PerformanceObserver((list) => {
          const entries = list.getEntries();
          entries.forEach(entry => {
            this.metrics.fid = entry.processingStart - entry.startTime;
            console.log('📊 FID:', this.metrics.fid, 'ms');
          });
        });
        fidObserver.observe({ entryTypes: ['first-input'] });
      } catch (e) {
        console.warn('FID observer not supported');
      }

      // Cumulative Layout Shift (CLS)
      try {
        let clsValue = 0;
        const clsObserver = new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            if (!entry.hadRecentInput) {
              clsValue += entry.value;
              this.metrics.cls = clsValue;
              console.log('📊 CLS:', this.metrics.cls);
            }
          }
        });
        clsObserver.observe({ entryTypes: ['layout-shift'] });
      } catch (e) {
        console.warn('CLS observer not supported');
      }
    }
  }

  monitorResourceTiming() {
    if (window.performance && window.performance.getEntriesByType) {
      const resources = window.performance.getEntriesByType('resource');
      
      const stats = {
        totalResources: resources.length,
        totalSize: 0,
        totalDuration: 0,
        slowResources: []
      };
      
      resources.forEach(resource => {
        stats.totalSize += resource.transferSize || 0;
        stats.totalDuration += resource.duration;
        
        // Flag slow resources (>1s)
        if (resource.duration > 1000) {
          stats.slowResources.push({
            name: resource.name,
            duration: resource.duration,
            size: resource.transferSize
          });
        }
      });
      
      this.metrics.resources = stats;
      console.log('📊 Resource Stats:', stats);
    }
  }

  monitorInteractions() {
    let interactionCount = 0;
    
    ['click', 'keypress', 'scroll'].forEach(eventType => {
      document.addEventListener(eventType, () => {
        interactionCount++;
      }, { passive: true, capture: true });
    });
    
    // Report interactions every 30s
    setInterval(() => {
      if (interactionCount > 0) {
        console.log('📊 User Interactions (30s):', interactionCount);
        this.metrics.interactionsPerMinute = (interactionCount / 30) * 60;
        interactionCount = 0;
      }
    }, 30000);
  }

  // ===== Performance Report =====
  
  generatePerformanceReport() {
    const report = {
      timestamp: Date.now(),
      metrics: this.metrics,
      recommendations: this.getRecommendations()
    };
    
    console.log('📊 Performance Report:', report);
    return report;
  }

  getRecommendations() {
    const recommendations = [];
    
    if (this.metrics.lcp > 2500) {
      recommendations.push('LCP가 느립니다. 이미지 최적화를 권장합니다.');
    }
    
    if (this.metrics.fid > 100) {
      recommendations.push('FID가 높습니다. JavaScript 실행을 최적화하세요.');
    }
    
    if (this.metrics.cls > 0.1) {
      recommendations.push('CLS가 높습니다. 레이아웃 시프트를 줄이세요.');
    }
    
    if (this.metrics.resources?.slowResources.length > 0) {
      recommendations.push(`느린 리소스 ${this.metrics.resources.slowResources.length}개 발견. 최적화 권장.`);
    }
    
    return recommendations;
  }

  // ===== Optimization Utilities =====
  
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

  throttle(func, limit) {
    let inThrottle;
    return function(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limit);
      }
    };
  }

  requestIdleCallback(callback) {
    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(callback);
    } else {
      setTimeout(callback, 1);
    }
  }
}

// Add lazy loading CSS
const lazyLoadingStyles = document.createElement('style');
lazyLoadingStyles.textContent = `
  img[data-src] {
    background-color: #f0f0f0;
    min-height: 200px;
  }
  
  img.lazy-loading {
    filter: blur(5px);
    transition: filter 0.3s;
  }
  
  img.lazy-loaded {
    filter: blur(0);
    animation: fadeIn 0.3s;
  }
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;
document.head.appendChild(lazyLoadingStyles);

// Initialize on page load
let performanceOptimizer;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    performanceOptimizer = new PerformanceOptimizer();
  });
} else {
  performanceOptimizer = new PerformanceOptimizer();
}
