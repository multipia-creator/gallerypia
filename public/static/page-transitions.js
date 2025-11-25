/**
 * Page Transitions Utility
 * Smooth animations between page navigations
 * Version: 1.0.0
 */

class PageTransitionManager {
  constructor(options = {}) {
    this.duration = options.duration || 300;
    this.effect = options.effect || 'fade'; // fade, slide-left, slide-right, slide-up
    this.preserveScroll = options.preserveScroll !== false;
    this.scrollHistory = new Map();
    
    this.init();
  }
  
  init() {
    // Save scroll position before navigation
    window.addEventListener('beforeunload', () => {
      this.saveScrollPosition();
    });
    
    // Restore scroll position after navigation
    window.addEventListener('load', () => {
      this.restoreScrollPosition();
    });
    
    // Intercept link clicks for smooth transitions
    if (window.enableSmoothTransitions) {
      this.interceptLinks();
    }
  }
  
  saveScrollPosition() {
    const path = window.location.pathname;
    const scrollY = window.scrollY || window.pageYOffset;
    
    if (this.preserveScroll) {
      sessionStorage.setItem(`scroll_${path}`, scrollY.toString());
    }
  }
  
  restoreScrollPosition() {
    const path = window.location.pathname;
    const savedScroll = sessionStorage.getItem(`scroll_${path}`);
    
    if (savedScroll && this.preserveScroll) {
      setTimeout(() => {
        window.scrollTo({
          top: parseInt(savedScroll, 10),
          behavior: 'smooth'
        });
      }, 50);
    }
  }
  
  interceptLinks() {
    document.addEventListener('click', (e) => {
      const link = e.target.closest('a');
      if (!link || !link.href) return;
      
      // Only intercept internal links
      const isInternal = link.href.startsWith(window.location.origin);
      const isNotExternal = !link.target || link.target === '_self';
      const isNotSpecial = !link.download && !link.href.includes('#');
      
      if (isInternal && isNotExternal && isNotSpecial) {
        e.preventDefault();
        this.navigateWithTransition(link.href);
      }
    });
  }
  
  async navigateWithTransition(url) {
    // Exit animation
    await this.playExitAnimation();
    
    // Save current scroll position
    this.saveScrollPosition();
    
    // Navigate
    window.location.href = url;
  }
  
  playExitAnimation() {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = `page-transition-overlay ${this.effect}`;
      document.body.appendChild(overlay);
      
      // Force reflow
      overlay.offsetHeight;
      
      // Add active class to trigger animation
      overlay.classList.add('active');
      
      setTimeout(() => {
        resolve();
      }, this.duration);
    });
  }
  
  playEnterAnimation() {
    return new Promise((resolve) => {
      const overlay = document.querySelector('.page-transition-overlay');
      
      if (overlay) {
        overlay.classList.add('exit');
        
        setTimeout(() => {
          overlay.remove();
          resolve();
        }, this.duration);
      } else {
        resolve();
      }
    });
  }
}

// Route-specific transitions
class RouteTransitionManager extends PageTransitionManager {
  constructor(options = {}) {
    super(options);
    this.routes = options.routes || {};
  }
  
  getTransitionForRoute(fromPath, toPath) {
    // Custom transition rules based on routes
    if (this.isDetailPage(toPath) && this.isListPage(fromPath)) {
      return 'slide-left'; // List → Detail: slide left
    }
    if (this.isListPage(toPath) && this.isDetailPage(fromPath)) {
      return 'slide-right'; // Detail → List: slide right
    }
    if (this.isModalRoute(toPath)) {
      return 'slide-up'; // Modal: slide up
    }
    
    return 'fade'; // Default
  }
  
  isDetailPage(path) {
    return /\/(artwork|artist|collection)\/\d+/.test(path);
  }
  
  isListPage(path) {
    return /\/(gallery|artists|collections|leaderboard)/.test(path);
  }
  
  isModalRoute(path) {
    return path.includes('/modal/') || path.includes('/quick-view/');
  }
}

// Loading skeleton manager
class PageLoadingManager {
  constructor() {
    this.skeletonCache = new Map();
  }
  
  showSkeleton(containerId, type = 'gallery') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const skeleton = this.getSkeletonTemplate(type);
    container.innerHTML = skeleton;
    container.classList.add('loading-skeleton');
  }
  
  hideSkeleton(containerId, content) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.classList.remove('loading-skeleton');
    
    // Fade in new content
    container.style.opacity = '0';
    container.innerHTML = content;
    
    setTimeout(() => {
      container.style.transition = 'opacity 300ms ease';
      container.style.opacity = '1';
    }, 10);
  }
  
  getSkeletonTemplate(type) {
    if (this.skeletonCache.has(type)) {
      return this.skeletonCache.get(type);
    }
    
    let template = '';
    
    switch (type) {
      case 'gallery':
        template = this.createGallerySkeleton();
        break;
      case 'detail':
        template = this.createDetailSkeleton();
        break;
      case 'list':
        template = this.createListSkeleton();
        break;
      default:
        template = this.createDefaultSkeleton();
    }
    
    this.skeletonCache.set(type, template);
    return template;
  }
  
  createGallerySkeleton() {
    const cards = Array(6).fill(null).map(() => `
      <div class="skeleton-card">
        <div class="skeleton-image"></div>
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text skeleton-subtitle"></div>
        <div class="skeleton-text skeleton-price"></div>
      </div>
    `).join('');
    
    return `<div class="skeleton-grid">${cards}</div>`;
  }
  
  createDetailSkeleton() {
    return `
      <div class="skeleton-detail">
        <div class="skeleton-image-large"></div>
        <div class="skeleton-info">
          <div class="skeleton-text skeleton-title-large"></div>
          <div class="skeleton-text skeleton-subtitle"></div>
          <div class="skeleton-divider"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
          <div class="skeleton-text"></div>
        </div>
      </div>
    `;
  }
  
  createListSkeleton() {
    const items = Array(8).fill(null).map(() => `
      <div class="skeleton-list-item">
        <div class="skeleton-avatar"></div>
        <div class="skeleton-list-content">
          <div class="skeleton-text skeleton-title"></div>
          <div class="skeleton-text skeleton-subtitle"></div>
        </div>
      </div>
    `).join('');
    
    return `<div class="skeleton-list">${items}</div>`;
  }
  
  createDefaultSkeleton() {
    return `
      <div class="skeleton-default">
        <div class="skeleton-text skeleton-title"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
        <div class="skeleton-text"></div>
      </div>
    `;
  }
}

// Global instances
window.pageTransitionManager = new RouteTransitionManager({
  duration: 300,
  effect: 'fade',
  preserveScroll: true
});

window.pageLoadingManager = new PageLoadingManager();

// Helper functions
window.showPageSkeleton = function(containerId, type) {
  window.pageLoadingManager.showSkeleton(containerId, type);
};

window.hidePageSkeleton = function(containerId, content) {
  window.pageLoadingManager.hideSkeleton(containerId, content);
};

window.navigateWithTransition = function(url) {
  window.pageTransitionManager.navigateWithTransition(url);
};

// Auto-initialize on DOMContentLoaded
document.addEventListener('DOMContentLoaded', function() {
  // Play enter animation if coming from another page
  const isNavigating = sessionStorage.getItem('navigating');
  
  if (isNavigating === 'true') {
    window.pageTransitionManager.playEnterAnimation();
    sessionStorage.removeItem('navigating');
  }
});

// Set navigating flag before leaving page
window.addEventListener('beforeunload', function() {
  sessionStorage.setItem('navigating', 'true');
});

console.log('✅ Page Transitions Manager initialized');
