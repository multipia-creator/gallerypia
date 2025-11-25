/**
 * ============================================
 * ⚡ Performance Enhancements (W2-H3 to W2-H8)
 * ============================================
 * W2-H3: FOUT Prevention (Web Font Optimization)
 * W2-H4: Language Switch without Page Reload
 * W2-H5: Keyboard Shortcuts System
 * W2-H6: Script Loading Optimization (3.1MB → Async)
 * W2-H7: Image Optimization (WebP, Lazy Loading)
 * W2-H8: API Response Caching
 * ============================================
 */

// ============================================
// 🔤 W2-H3: FOUT Prevention (Font Loading Optimization)
// ============================================

// Preload critical fonts
const criticalFonts = [
  'https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap',
  'https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css'
];

function optimizeFontLoading() {
  // Use font-display: swap for custom fonts
  const style = document.createElement('style');
  style.textContent = `
    @font-face {
      font-family: 'Noto Sans KR';
      font-display: swap; /* W2-H3: Prevent FOUT */
      src: local('Noto Sans KR');
    }
    
    /* Fallback font stack */
    body {
      font-family: 'Noto Sans KR', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
                   'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif;
    }
  `;
  document.head.appendChild(style);
  
  // Preconnect to font providers
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);
  
  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);
  
  console.log('✅ Font loading optimized (W2-H3)');
}

// ============================================
// 🌐 W2-H4: Language Switch without Page Reload
// ============================================

let currentLanguage = localStorage.getItem('language') || 'ko';

function switchLanguage(lang, reload = false) {
  if (lang === currentLanguage && !reload) {
    console.log('Language already set to:', lang);
    return;
  }
  
  currentLanguage = lang;
  localStorage.setItem('language', lang);
  
  // Apply language without reload (W2-H4)
  document.documentElement.lang = lang;
  
  // Update all translatable elements
  const translatableElements = document.querySelectorAll('[data-i18n]');
  translatableElements.forEach(element => {
    const key = element.dataset.i18n;
    if (window.i18nTranslations && window.i18nTranslations[lang] && window.i18nTranslations[lang][key]) {
      element.textContent = window.i18nTranslations[lang][key];
    }
  });
  
  // Dispatch language change event for other scripts
  window.dispatchEvent(new CustomEvent('languagechange', { detail: { language: lang } }));
  
  if (typeof showInfoToast === 'function') {
    const messages = {
      ko: '한국어로 변경되었습니다',
      en: 'Language changed to English',
      ja: '日本語に変更されました',
      zh: '已更改为中文'
    };
    showInfoToast(messages[lang] || 'Language changed');
  }
  
  console.log('✅ Language switched to:', lang, '(without reload - W2-H4)');
}

// ============================================
// ⌨️ W2-H5: Keyboard Shortcuts System
// ============================================

const keyboardShortcuts = {
  // Navigation
  'Alt+H': () => window.location.href = '/',
  'Alt+S': () => document.getElementById('search-input')?.focus(),
  'Alt+N': () => window.location.href = '/notifications',
  'Alt+P': () => window.location.href = '/mypage',
  'Alt+A': () => window.location.href = '/admin/dashboard',
  
  // Actions
  'Ctrl+K': () => document.getElementById('search-input')?.focus(),
  '/': () => document.getElementById('search-input')?.focus(),
  'Escape': () => {
    // Close any open modal
    const openModals = document.querySelectorAll('.modal:not(.hidden)');
    openModals.forEach(modal => {
      if (typeof closeModal === 'function') {
        closeModal(modal.id);
      }
    });
  },
  
  // Help
  '?': () => showKeyboardShortcutsHelp()
};

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    // Don't trigger shortcuts when typing in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.isContentEditable) {
      // Allow Escape to work everywhere
      if (e.key === 'Escape') {
        e.target.blur();
        keyboardShortcuts['Escape']();
      }
      return;
    }
    
    // Build key combination
    let combination = '';
    if (e.ctrlKey) combination += 'Ctrl+';
    if (e.altKey) combination += 'Alt+';
    if (e.shiftKey) combination += 'Shift+';
    combination += e.key;
    
    // Execute shortcut if exists
    if (keyboardShortcuts[combination]) {
      e.preventDefault();
      keyboardShortcuts[combination]();
    }
  });
  
  console.log('✅ Keyboard shortcuts initialized (W2-H5)');
  console.log('❓ Press ? for help');
}

function showKeyboardShortcutsHelp() {
  const helpModal = document.createElement('div');
  helpModal.id = 'keyboard-shortcuts-help';
  helpModal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
  helpModal.innerHTML = `
    <div class="bg-white rounded-lg p-6 max-w-2xl max-h-[80vh] overflow-y-auto">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-2xl font-bold">⌨️ 키보드 단축키</h2>
        <button onclick="this.closest('#keyboard-shortcuts-help').remove()" class="text-gray-500 hover:text-gray-700">
          <i class="fas fa-times text-xl"></i>
        </button>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <div>
          <h3 class="font-semibold mb-2 text-purple-600">탐색</h3>
          <ul class="space-y-2 text-sm">
            <li><kbd class="kbd">Alt+H</kbd> 홈으로</li>
            <li><kbd class="kbd">Alt+S</kbd> 검색</li>
            <li><kbd class="kbd">Alt+N</kbd> 알림</li>
            <li><kbd class="kbd">Alt+P</kbd> 마이페이지</li>
            <li><kbd class="kbd">Alt+A</kbd> 관리자 대시보드</li>
          </ul>
        </div>
        <div>
          <h3 class="font-semibold mb-2 text-purple-600">액션</h3>
          <ul class="space-y-2 text-sm">
            <li><kbd class="kbd">Ctrl+K</kbd> 또는 <kbd class="kbd">/</kbd> 검색 포커스</li>
            <li><kbd class="kbd">Esc</kbd> 모달 닫기</li>
            <li><kbd class="kbd">?</kbd> 도움말</li>
          </ul>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(helpModal);
  
  // Lock body scroll
  if (typeof lockBodyScroll === 'function') {
    lockBodyScroll();
  }
  
  // Close on backdrop click
  helpModal.addEventListener('click', (e) => {
    if (e.target === helpModal) {
      helpModal.remove();
      if (typeof unlockBodyScroll === 'function') {
        unlockBodyScroll();
      }
    }
  });
}

// ============================================
// 📦 W2-H6: Script Loading Optimization
// ============================================

function optimizeScriptLoading() {
  // Defer non-critical scripts
  const nonCriticalScripts = document.querySelectorAll('script[src]:not([async]):not([defer])');
  nonCriticalScripts.forEach(script => {
    // Skip if already loaded or is critical
    if (script.hasAttribute('data-critical')) return;
    
    // Add defer attribute
    script.defer = true;
  });
  
  // Preload critical scripts
  const criticalScripts = [
    '/static/ui-improvements.js',
    '/static/global-error-handler.js',
    '/static/loading-states.js'
  ];
  
  criticalScripts.forEach(src => {
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'script';
    link.href = src;
    document.head.appendChild(link);
  });
  
  console.log('✅ Script loading optimized (W2-H6)');
}

// ============================================
// 🖼️ W2-H7: Image Optimization (WebP, Lazy Loading)
// ============================================

function optimizeImages() {
  // Enable lazy loading for all images
  const images = document.querySelectorAll('img:not([loading])');
  images.forEach(img => {
    img.loading = 'lazy';
  });
  
  // WebP support detection
  const supportsWebP = document.createElement('canvas').toDataURL('image/webp').indexOf('data:image/webp') === 0;
  
  if (supportsWebP) {
    console.log('✅ WebP supported - using WebP images');
    
    // Replace image sources with WebP versions (if available)
    images.forEach(img => {
      const src = img.src;
      if (src && !src.includes('.webp') && (src.includes('.jpg') || src.includes('.png'))) {
        const webpSrc = src.replace(/\.(jpg|png)$/, '.webp');
        
        // Check if WebP version exists
        fetch(webpSrc, { method: 'HEAD' }).then(response => {
          if (response.ok) {
            img.src = webpSrc;
          }
        }).catch(() => {
          // WebP not available, keep original
        });
      }
    });
  }
  
  // Intersection Observer for lazy loading enhancement
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px', // Load 50px before entering viewport
      threshold: 0.01
    });
    
    // Observe images with data-src attribute
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  console.log('✅ Image optimization applied (W2-H7)');
}

// ============================================
// 💾 W2-H8: API Response Caching
// ============================================

const apiCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

function getCacheKey(url, options) {
  return `${url}:${JSON.stringify(options || {})}`;
}

function isCacheValid(cachedData) {
  return cachedData && (Date.now() - cachedData.timestamp < CACHE_DURATION);
}

// Enhanced fetch with caching
if (!window._originalFetch) {
  window._originalFetch = window.fetch;
}
window.cachedFetch = async function(url, options = {}) {
  // Only cache GET requests
  if (options.method && options.method !== 'GET') {
    return window._originalFetch(url, options);
  }
  
  // Check cache
  const cacheKey = getCacheKey(url, options);
  const cachedData = apiCache.get(cacheKey);
  
  if (isCacheValid(cachedData)) {
    console.log('📦 Cache hit:', url);
    return new Response(JSON.stringify(cachedData.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  }
  
  // Fetch from network
  try {
    const response = await window._originalFetch(url, options);
    const clone = response.clone();
    const data = await clone.json();
    
    // Cache successful responses
    if (response.ok) {
      apiCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      console.log('💾 Cached:', url);
    }
    
    return response;
  } catch (error) {
    // Return cached data if network fails
    if (cachedData) {
      console.warn('⚠️ Network error, using stale cache:', url);
      return new Response(JSON.stringify(cachedData.data), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    throw error;
  }
};

// Clear cache function
window.clearApiCache = function(urlPattern) {
  if (urlPattern) {
    // Clear specific URLs matching pattern
    let count = 0;
    apiCache.forEach((_, key) => {
      if (key.includes(urlPattern)) {
        apiCache.delete(key);
        count++;
      }
    });
    console.log(`✅ Cleared ${count} cache entries matching: ${urlPattern}`);
  } else {
    // Clear all cache
    const count = apiCache.size;
    apiCache.clear();
    console.log(`✅ Cleared all ${count} cache entries`);
  }
};

// Auto-clear expired cache every 5 minutes
setInterval(() => {
  let clearedCount = 0;
  apiCache.forEach((value, key) => {
    if (!isCacheValid(value)) {
      apiCache.delete(key);
      clearedCount++;
    }
  });
  if (clearedCount > 0) {
    console.log(`🗑️ Auto-cleared ${clearedCount} expired cache entries`);
  }
}, 5 * 60 * 1000);

console.log('✅ API caching enabled (W2-H8)');
console.log('📊 Use window.clearApiCache() to clear cache');

// ============================================
// Initialize All Enhancements
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  optimizeFontLoading(); // W2-H3
  initKeyboardShortcuts(); // W2-H5
  optimizeScriptLoading(); // W2-H6
  optimizeImages(); // W2-H7
  
  console.log('✅ Performance Enhancements initialized (W2-H3 to W2-H8)');
});

// Expose language switching globally
window.switchLanguage = switchLanguage;
window.getCurrentLanguage = () => currentLanguage;
