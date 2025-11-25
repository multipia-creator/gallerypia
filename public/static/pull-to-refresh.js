/**
 * Pull to Refresh (Mobile)
 * iOS-style pull-to-refresh functionality
 * Version: 1.0.0
 */

class PullToRefresh {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.onRefresh = options.onRefresh || (() => {});
    this.threshold = options.threshold || 80;
    this.refreshText = options.refreshText || 'Pull to refresh';
    this.releaseText = options.releaseText || 'Release to refresh';
    this.refreshingText = options.refreshingText || 'Refreshing...';
    
    this.startY = 0;
    this.currentY = 0;
    this.isRefreshing = false;
    this.canPull = false;
    
    this.init();
  }
  
  init() {
    if (!this.isMobile()) return;
    
    this.createRefreshIndicator();
    this.bindEvents();
  }
  
  isMobile() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  }
  
  createRefreshIndicator() {
    this.indicator = document.createElement('div');
    this.indicator.className = 'pull-to-refresh-indicator';
    this.indicator.innerHTML = `
      <div class="ptr-spinner"></div>
      <div class="ptr-text">${this.refreshText}</div>
    `;
    this.indicator.style.cssText = `
      position: fixed;
      top: -80px;
      left: 0;
      right: 0;
      height: 80px;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      background: rgba(0, 0, 0, 0.9);
      color: white;
      z-index: 99999;
      transition: top 0.3s ease;
    `;
    
    document.body.appendChild(this.indicator);
  }
  
  bindEvents() {
    this.container.addEventListener('touchstart', (e) => {
      if (window.scrollY === 0) {
        this.canPull = true;
        this.startY = e.touches[0].clientY;
      }
    }, { passive: true });
    
    this.container.addEventListener('touchmove', (e) => {
      if (!this.canPull || this.isRefreshing) return;
      
      this.currentY = e.touches[0].clientY;
      const diff = this.currentY - this.startY;
      
      if (diff > 0 && window.scrollY === 0) {
        e.preventDefault();
        this.updateIndicator(diff);
      }
    }, { passive: false });
    
    this.container.addEventListener('touchend', () => {
      if (!this.canPull || this.isRefreshing) return;
      
      const diff = this.currentY - this.startY;
      
      if (diff > this.threshold) {
        this.triggerRefresh();
      } else {
        this.resetIndicator();
      }
      
      this.canPull = false;
    });
  }
  
  updateIndicator(distance) {
    const pullPercent = Math.min(distance / this.threshold, 1);
    const indicatorTop = Math.min(distance - 80, 0);
    
    this.indicator.style.top = `${indicatorTop}px`;
    
    const spinner = this.indicator.querySelector('.ptr-spinner');
    spinner.style.transform = `rotate(${pullPercent * 360}deg)`;
    
    const text = this.indicator.querySelector('.ptr-text');
    text.textContent = pullPercent >= 1 ? this.releaseText : this.refreshText;
  }
  
  async triggerRefresh() {
    this.isRefreshing = true;
    this.indicator.style.top = '0';
    
    const text = this.indicator.querySelector('.ptr-text');
    text.textContent = this.refreshingText;
    
    const spinner = this.indicator.querySelector('.ptr-spinner');
    spinner.style.animation = 'spin 1s linear infinite';
    
    // Haptic feedback
    this.vibrate(50);
    
    try {
      await this.onRefresh();
    } catch (error) {
      console.error('Refresh failed:', error);
    }
    
    setTimeout(() => {
      this.resetIndicator();
      this.isRefreshing = false;
    }, 500);
  }
  
  resetIndicator() {
    this.indicator.style.top = '-80px';
    
    const spinner = this.indicator.querySelector('.ptr-spinner');
    spinner.style.animation = '';
    
    const text = this.indicator.querySelector('.ptr-text');
    text.textContent = this.refreshText;
  }
  
  vibrate(duration = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}

// Global helper
window.initPullToRefresh = function(options) {
  return new PullToRefresh(options);
};

// Auto-initialize for common containers
document.addEventListener('DOMContentLoaded', function() {
  const mainContent = document.querySelector('main, #content, .main-content');
  
  if (mainContent) {
    window.pullToRefresh = window.initPullToRefresh({
      container: mainContent,
      onRefresh: async () => {
        // Default refresh: reload page
        await new Promise(resolve => setTimeout(resolve, 1000));
        location.reload();
      }
    });
  }
});

console.log('✅ Pull to Refresh loaded');
