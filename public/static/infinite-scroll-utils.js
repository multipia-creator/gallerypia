/**
 * GalleryPia - Infinite Scroll Utilities
 * 
 * Client-side JavaScript for infinite scroll functionality
 * Works with any content type: galleries, lists, feeds, etc.
 * 
 * Features:
 * - Intersection Observer API for performance
 * - Configurable loading strategies
 * - State management (idle/loading/end/error)
 * - Debounced scroll events
 * - Manual load more button fallback
 * - Memory leak prevention
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class InfiniteScroll {
  constructor(options) {
    this.containerId = options.containerId;
    this.loadMoreCallback = options.loadMore;
    this.threshold = options.threshold || 0.1;
    this.rootMargin = options.rootMargin || '100px';
    this.debounceDelay = options.debounceDelay || 300;
    this.pageSize = options.pageSize || 20;
    
    this.currentPage = options.initialPage || 1;
    this.state = 'idle'; // idle, loading, end, error
    this.observer = null;
    this.debounceTimer = null;
    
    this.init();
  }
  
  init() {
    const trigger = document.getElementById(`${this.containerId}-trigger`);
    if (!trigger) {
      console.error(`Infinite scroll trigger not found: ${this.containerId}-trigger`);
      return;
    }
    
    // Create Intersection Observer
    this.observer = new IntersectionObserver(
      (entries) => this.handleIntersection(entries),
      {
        threshold: this.threshold,
        rootMargin: this.rootMargin
      }
    );
    
    // Start observing
    this.observer.observe(trigger);
    
    // Add retry button listener
    const retryButton = trigger.querySelector('.infinite-scroll-retry');
    if (retryButton) {
      retryButton.addEventListener('click', () => this.retry());
    }
    
    console.log(`Infinite scroll initialized for: ${this.containerId}`);
  }
  
  handleIntersection(entries) {
    entries.forEach(entry => {
      if (entry.isIntersecting && this.state === 'idle') {
        // Debounce the load more call
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
          this.loadMore();
        }, this.debounceDelay);
      }
    });
  }
  
  async loadMore() {
    if (this.state !== 'idle') {
      return;
    }
    
    this.setState('loading');
    
    try {
      const nextPage = this.currentPage + 1;
      const result = await this.loadMoreCallback(nextPage, this.pageSize);
      
      if (result && result.items && result.items.length > 0) {
        this.appendItems(result.items);
        this.currentPage = nextPage;
        
        // Check if there are more items
        if (result.hasMore === false || result.items.length < this.pageSize) {
          this.setState('end');
        } else {
          this.setState('idle');
        }
      } else {
        this.setState('end');
      }
    } catch (error) {
      console.error('Infinite scroll load error:', error);
      this.setState('error');
    }
  }
  
  appendItems(items) {
    const contentContainer = document.getElementById(`${this.containerId}-content`);
    if (!contentContainer) return;
    
    // Find the grid or list container
    const gridContainer = contentContainer.querySelector('.grid') || 
                         contentContainer.querySelector('.space-y-4') ||
                         contentContainer;
    
    items.forEach(item => {
      const element = this.createItemElement(item);
      if (element) {
        gridContainer.appendChild(element);
      }
    });
  }
  
  createItemElement(item) {
    // This should be overridden or use a custom renderer
    const div = document.createElement('div');
    div.innerHTML = this.renderItem(item);
    return div.firstElementChild;
  }
  
  renderItem(item) {
    // Default renderer - should be customized
    return `
      <div class="p-4 bg-gray-800 rounded-lg">
        <h3 class="text-white font-bold">${item.title || 'Untitled'}</h3>
        <p class="text-gray-400">${item.description || ''}</p>
      </div>
    `;
  }
  
  setState(newState) {
    this.state = newState;
    this.updateUI();
  }
  
  updateUI() {
    const trigger = document.getElementById(`${this.containerId}-trigger`);
    if (!trigger) return;
    
    const loader = trigger.querySelector('.infinite-scroll-loader');
    const end = trigger.querySelector('.infinite-scroll-end');
    const error = trigger.querySelector('.infinite-scroll-error');
    
    // Hide all
    if (loader) loader.style.display = 'none';
    if (end) end.style.display = 'none';
    if (error) error.style.display = 'none';
    
    // Show current state
    switch (this.state) {
      case 'loading':
        if (loader) loader.style.display = 'block';
        break;
      case 'end':
        if (end) end.style.display = 'block';
        break;
      case 'error':
        if (error) error.style.display = 'block';
        break;
    }
  }
  
  retry() {
    this.setState('idle');
    this.loadMore();
  }
  
  reset() {
    this.currentPage = 1;
    this.setState('idle');
    
    // Clear content
    const contentContainer = document.getElementById(`${this.containerId}-content`);
    if (contentContainer) {
      const gridContainer = contentContainer.querySelector('.grid') || 
                           contentContainer.querySelector('.space-y-4');
      if (gridContainer) {
        gridContainer.innerHTML = '';
      }
    }
  }
  
  destroy() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    clearTimeout(this.debounceTimer);
    console.log(`Infinite scroll destroyed: ${this.containerId}`);
  }
}

// Gallery-specific infinite scroll
class InfiniteScrollGallery extends InfiniteScroll {
  constructor(options) {
    super(options);
    this.apiEndpoint = options.apiEndpoint || '/api/artworks';
    this.filters = options.filters || {};
  }
  
  async loadMoreCallback(page, pageSize) {
    const params = new URLSearchParams({
      page: page,
      limit: pageSize,
      ...this.filters
    });
    
    const response = await fetch(`${this.apiEndpoint}?${params}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      items: data.artworks || data.items || [],
      hasMore: data.hasMore !== undefined ? data.hasMore : (data.artworks || data.items || []).length === pageSize,
      total: data.total
    };
  }
  
  renderItem(artwork) {
    return `
      <div class="artwork-card bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
        <div class="relative aspect-square overflow-hidden">
          <img 
            src="${artwork.image_url || '/static/placeholder.jpg'}" 
            alt="${artwork.title}"
            class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
          ${artwork.nft_minted ? `
            <span class="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-bold">
              NFT
            </span>
          ` : ''}
        </div>
        
        <div class="p-4">
          <h3 class="font-bold text-lg mb-2 text-white truncate">${artwork.title}</h3>
          <p class="text-gray-400 text-sm mb-3">${artwork.artist_name || '알 수 없음'}</p>
          
          <div class="flex items-center justify-between">
            <div class="text-sm">
              <span class="text-gray-500">가격</span>
              <p class="text-purple-400 font-bold">${this.formatPrice(artwork.price_krw)}만원</p>
            </div>
            
            <div class="flex items-center gap-3 text-gray-500 text-sm">
              <span><i class="far fa-eye"></i> ${artwork.views_count || 0}</span>
              <span><i class="far fa-heart"></i> ${artwork.likes_count || 0}</span>
            </div>
          </div>
          
          <a 
            href="/artwork/${artwork.id}" 
            class="mt-4 block w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-center rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all"
          >
            상세보기
          </a>
        </div>
      </div>
    `;
  }
  
  formatPrice(priceKrw) {
    return (priceKrw / 10000).toFixed(0);
  }
  
  updateFilters(newFilters) {
    this.filters = { ...this.filters, ...newFilters };
    this.reset();
    this.loadMore();
  }
}

// List-specific infinite scroll
class InfiniteScrollList extends InfiniteScroll {
  constructor(options) {
    super(options);
    this.apiEndpoint = options.apiEndpoint;
  }
  
  async loadMoreCallback(page, pageSize) {
    const response = await fetch(`${this.apiEndpoint}?page=${page}&limit=${pageSize}`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    return {
      items: data.items || [],
      hasMore: data.hasMore !== undefined ? data.hasMore : (data.items || []).length === pageSize
    };
  }
}

// Global helper functions
window.initializeInfiniteScroll = function(options) {
  return new InfiniteScroll(options);
};

window.initializeInfiniteScrollGallery = function(options) {
  return new InfiniteScrollGallery(options);
};

window.initializeInfiniteScrollList = function(options) {
  return new InfiniteScrollList(options);
};

window.retryInfiniteScroll = function(containerId) {
  const scrollInstance = window.__infiniteScrollInstances?.[containerId];
  if (scrollInstance) {
    scrollInstance.retry();
  }
};

// Store instances globally for access
window.__infiniteScrollInstances = window.__infiniteScrollInstances || {};

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('[data-infinite-scroll]');
  
  containers.forEach(container => {
    const containerId = container.id;
    const apiEndpoint = container.dataset.apiEndpoint;
    const type = container.dataset.scrollType || 'gallery';
    
    if (!containerId || !apiEndpoint) return;
    
    let scrollInstance;
    if (type === 'gallery') {
      scrollInstance = new InfiniteScrollGallery({
        containerId,
        apiEndpoint,
        threshold: parseFloat(container.dataset.threshold) || 0.1,
        rootMargin: container.dataset.rootMargin || '100px',
        pageSize: parseInt(container.dataset.pageSize) || 20
      });
    } else if (type === 'list') {
      scrollInstance = new InfiniteScrollList({
        containerId,
        apiEndpoint,
        threshold: parseFloat(container.dataset.threshold) || 0.1,
        rootMargin: container.dataset.rootMargin || '100px',
        pageSize: parseInt(container.dataset.pageSize) || 20
      });
    }
    
    if (scrollInstance) {
      window.__infiniteScrollInstances[containerId] = scrollInstance;
    }
  });
  
  console.log(`Auto-initialized ${containers.length} infinite scroll containers`);
});

// Cleanup on page unload
window.addEventListener('beforeunload', function() {
  if (window.__infiniteScrollInstances) {
    Object.values(window.__infiniteScrollInstances).forEach(instance => {
      if (instance && typeof instance.destroy === 'function') {
        instance.destroy();
      }
    });
  }
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    InfiniteScroll,
    InfiniteScrollGallery,
    InfiniteScrollList
  };
}
