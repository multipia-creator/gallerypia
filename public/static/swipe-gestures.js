/**
 * Swipe Gestures (Mobile)
 * Swipe actions for lists and carousels
 * Version: 1.0.0
 */

class SwipeGestureManager {
  constructor(element, options = {}) {
    this.element = element;
    this.onSwipeLeft = options.onSwipeLeft || null;
    this.onSwipeRight = options.onSwipeRight || null;
    this.onSwipeUp = options.onSwipeUp || null;
    this.onSwipeDown = options.onSwipeDown || null;
    this.threshold = options.threshold || 50;
    
    this.startX = 0;
    this.startY = 0;
    this.currentX = 0;
    this.currentY = 0;
    
    this.init();
  }
  
  init() {
    this.element.addEventListener('touchstart', (e) => {
      this.startX = e.touches[0].clientX;
      this.startY = e.touches[0].clientY;
    }, { passive: true });
    
    this.element.addEventListener('touchmove', (e) => {
      this.currentX = e.touches[0].clientX;
      this.currentY = e.touches[0].clientY;
    }, { passive: true });
    
    this.element.addEventListener('touchend', () => {
      this.handleSwipe();
    });
  }
  
  handleSwipe() {
    const diffX = this.currentX - this.startX;
    const diffY = this.currentY - this.startY;
    
    // Determine swipe direction
    if (Math.abs(diffX) > Math.abs(diffY)) {
      // Horizontal swipe
      if (Math.abs(diffX) > this.threshold) {
        if (diffX > 0 && this.onSwipeRight) {
          this.onSwipeRight();
          this.vibrate(30);
        } else if (diffX < 0 && this.onSwipeLeft) {
          this.onSwipeLeft();
          this.vibrate(30);
        }
      }
    } else {
      // Vertical swipe
      if (Math.abs(diffY) > this.threshold) {
        if (diffY > 0 && this.onSwipeDown) {
          this.onSwipeDown();
          this.vibrate(30);
        } else if (diffY < 0 && this.onSwipeUp) {
          this.onSwipeUp();
          this.vibrate(30);
        }
      }
    }
  }
  
  vibrate(duration = 30) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}

// Swipe to Delete
class SwipeToDelete {
  constructor(options = {}) {
    this.selector = options.selector || '.swipe-item';
    this.onDelete = options.onDelete || (() => {});
    this.threshold = options.threshold || 100;
    
    this.init();
  }
  
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindItems();
    });
  }
  
  bindItems() {
    const items = document.querySelectorAll(this.selector);
    
    items.forEach(item => {
      let startX = 0;
      let currentX = 0;
      let isDragging = false;
      
      item.addEventListener('touchstart', (e) => {
        startX = e.touches[0].clientX;
        isDragging = true;
        item.style.transition = 'none';
      });
      
      item.addEventListener('touchmove', (e) => {
        if (!isDragging) return;
        
        currentX = e.touches[0].clientX;
        const diff = currentX - startX;
        
        // Only allow left swipe for delete
        if (diff < 0) {
          item.style.transform = `translateX(${diff}px)`;
          
          // Show delete button
          const deleteBtn = item.querySelector('.swipe-delete-btn');
          if (deleteBtn) {
            deleteBtn.style.opacity = Math.min(Math.abs(diff) / this.threshold, 1);
          }
        }
      });
      
      item.addEventListener('touchend', () => {
        if (!isDragging) return;
        isDragging = false;
        
        const diff = currentX - startX;
        item.style.transition = 'transform 0.3s ease';
        
        if (Math.abs(diff) > this.threshold) {
          // Delete
          item.style.transform = `translateX(-100%)`;
          item.style.opacity = '0';
          
          setTimeout(() => {
            this.onDelete(item);
            item.remove();
          }, 300);
        } else {
          // Reset
          item.style.transform = 'translateX(0)';
        }
      });
    });
  }
}

// Swipe Carousel
class SwipeCarousel {
  constructor(containerId, options = {}) {
    this.container = document.getElementById(containerId);
    if (!this.container) return;
    
    this.currentIndex = 0;
    this.items = this.container.children;
    this.threshold = options.threshold || 50;
    
    this.init();
  }
  
  init() {
    const swipeManager = new SwipeGestureManager(this.container, {
      onSwipeLeft: () => this.next(),
      onSwipeRight: () => this.previous()
    });
  }
  
  next() {
    if (this.currentIndex < this.items.length - 1) {
      this.currentIndex++;
      this.updateCarousel();
    }
  }
  
  previous() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateCarousel();
    }
  }
  
  updateCarousel() {
    const offset = -this.currentIndex * 100;
    this.container.style.transform = `translateX(${offset}%)`;
    this.container.style.transition = 'transform 0.3s ease';
  }
}

// Global helpers
window.SwipeGestureManager = SwipeGestureManager;
window.SwipeToDelete = SwipeToDelete;
window.SwipeCarousel = SwipeCarousel;

window.initSwipeGestures = function(element, options) {
  return new SwipeGestureManager(element, options);
};

window.initSwipeToDelete = function(options) {
  return new SwipeToDelete(options);
};

window.initSwipeCarousel = function(containerId, options) {
  return new SwipeCarousel(containerId, options);
};

console.log('✅ Swipe Gestures loaded');
