/**
 * GalleryPia - Quick View Utilities
 * 
 * Client-side JavaScript for quick view modals
 * Fast preview without page navigation
 * 
 * Features:
 * - Fast loading
 * - Keyboard navigation (arrow keys, escape)
 * - Touch gestures
 * - Lazy loading
 * - Cache support
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class QuickViewManager {
  constructor() {
    this.currentIndex = 0;
    this.items = [];
    this.cache = new Map();
    this.isOpen = false;
    
    this.initializeKeyboardShortcuts();
    this.initializeTouchGestures();
  }
  
  // Open quick view
  async open(itemId, type = 'artwork') {
    this.isOpen = true;
    
    // Show loading overlay
    this.showLoading();
    
    try {
      // Fetch item data
      const item = await this.fetchItem(itemId, type);
      
      if (!item) {
        throw new Error('Item not found');
      }
      
      // Render modal
      const modal = this.renderModal(item, type);
      
      // Insert into DOM
      const existingModal = document.querySelector('.quick-view-modal');
      if (existingModal) {
        existingModal.remove();
      }
      
      document.body.insertAdjacentHTML('beforeend', modal);
      
      // Prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Animate in
      setTimeout(() => {
        const modalElement = document.querySelector('.quick-view-modal');
        if (modalElement) {
          modalElement.style.opacity = '1';
        }
      }, 10);
      
    } catch (error) {
      console.error('Quick view error:', error);
      this.showError('데이터를 불러올 수 없습니다.');
    } finally {
      this.hideLoading();
    }
  }
  
  // Close quick view
  close() {
    const modal = document.querySelector('.quick-view-modal');
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(() => {
        modal.remove();
        document.body.style.overflow = '';
        this.isOpen = false;
      }, 300);
    }
  }
  
  // Fetch item data
  async fetchItem(itemId, type) {
    const cacheKey = `${type}_${itemId}`;
    
    // Check cache
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    // Fetch from API
    let apiUrl;
    switch (type) {
      case 'artwork':
        apiUrl = `/api/artworks/${itemId}`;
        break;
      case 'artist':
        apiUrl = `/api/artists/${itemId}`;
        break;
      case 'collection':
        apiUrl = `/api/collections/${itemId}`;
        break;
      default:
        throw new Error('Invalid type');
    }
    
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    
    const data = await response.json();
    
    // Cache the data
    this.cache.set(cacheKey, data);
    
    return data;
  }
  
  // Render modal (placeholder - actual HTML comes from TypeScript component)
  renderModal(item, type) {
    // This would normally call the server-side component
    // For now, return a simple modal
    return `
      <div class="quick-view-modal fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" style="opacity: 0; transition: opacity 0.3s;">
        <div class="bg-gray-900 rounded-2xl max-w-4xl w-full p-8">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-2xl font-bold text-white">${item.title || item.name}</h2>
            <button onclick="closeQuickView()" class="text-gray-400 hover:text-white text-2xl">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="text-gray-400">
            <p>Loading...</p>
          </div>
        </div>
      </div>
    `;
  }
  
  // Navigate to previous item
  previous() {
    if (this.items.length === 0) return;
    
    this.currentIndex = (this.currentIndex - 1 + this.items.length) % this.items.length;
    const item = this.items[this.currentIndex];
    
    this.open(item.id, item.type);
  }
  
  // Navigate to next item
  next() {
    if (this.items.length === 0) return;
    
    this.currentIndex = (this.currentIndex + 1) % this.items.length;
    const item = this.items[this.currentIndex];
    
    this.open(item.id, item.type);
  }
  
  // Set items for navigation
  setItems(items) {
    this.items = items;
    this.currentIndex = 0;
  }
  
  // Initialize keyboard shortcuts
  initializeKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (!this.isOpen) return;
      
      switch (e.key) {
        case 'Escape':
          this.close();
          break;
        case 'ArrowLeft':
          e.preventDefault();
          this.previous();
          break;
        case 'ArrowRight':
          e.preventDefault();
          this.next();
          break;
      }
    });
  }
  
  // Initialize touch gestures
  initializeTouchGestures() {
    let touchStartX = 0;
    let touchEndX = 0;
    
    document.addEventListener('touchstart', (e) => {
      if (!this.isOpen) return;
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });
    
    document.addEventListener('touchend', (e) => {
      if (!this.isOpen) return;
      touchEndX = e.changedTouches[0].screenX;
      
      const diff = touchStartX - touchEndX;
      
      // Swipe threshold
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          // Swiped left - next
          this.next();
        } else {
          // Swiped right - previous
          this.previous();
        }
      }
    }, { passive: true });
  }
  
  // Show loading overlay
  showLoading() {
    let loader = document.getElementById('quick-view-loader');
    if (!loader) {
      loader = document.createElement('div');
      loader.id = 'quick-view-loader';
      loader.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[99]';
      loader.innerHTML = `
        <div class="bg-gray-800 rounded-xl p-8">
          <svg class="animate-spin h-12 w-12 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      `;
      document.body.appendChild(loader);
    }
    loader.style.display = 'flex';
  }
  
  // Hide loading overlay
  hideLoading() {
    const loader = document.getElementById('quick-view-loader');
    if (loader) {
      loader.style.display = 'none';
    }
  }
  
  // Show error message
  showError(message) {
    const error = document.createElement('div');
    error.className = 'fixed top-6 right-6 bg-red-600 text-white px-6 py-4 rounded-lg shadow-lg z-[102]';
    error.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-circle text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(error);
    
    setTimeout(() => {
      error.style.opacity = '0';
      setTimeout(() => error.remove(), 300);
    }, 3000);
  }
}

// Global instance
window.quickViewManager = new QuickViewManager();

// Global helper functions
window.openQuickView = function(itemId, type = 'artwork') {
  window.quickViewManager.open(itemId, type);
};

window.closeQuickView = function() {
  window.quickViewManager.close();
};

window.quickViewPrevious = function() {
  window.quickViewManager.previous();
};

window.quickViewNext = function() {
  window.quickViewManager.next();
};

// Auto-initialize quick view triggers
document.addEventListener('DOMContentLoaded', function() {
  // Add quick view to artwork cards
  const artworkCards = document.querySelectorAll('[data-quick-view]');
  
  artworkCards.forEach(card => {
    const itemId = card.dataset.quickView;
    const itemType = card.dataset.quickViewType || 'artwork';
    
    // Add quick view button
    const quickViewBtn = document.createElement('button');
    quickViewBtn.className = 'absolute top-3 right-3 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity';
    quickViewBtn.innerHTML = '<i class="fas fa-eye"></i>';
    quickViewBtn.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      openQuickView(itemId, itemType);
    };
    
    card.style.position = 'relative';
    card.classList.add('group');
    card.appendChild(quickViewBtn);
  });
  
  console.log(`Initialized ${artworkCards.length} quick view triggers`);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { QuickViewManager };
}
