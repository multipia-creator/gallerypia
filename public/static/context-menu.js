/**
 * Context Menu (Long-press)
 * Mobile-friendly context menus
 * Version: 1.0.0
 */

class ContextMenuManager {
  constructor(options = {}) {
    this.longPressDuration = options.longPressDuration || 500;
    this.currentMenu = null;
    this.pressTimer = null;
    
    this.init();
  }
  
  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.bindContextMenuItems();
    });
    
    // Close menu on outside click
    document.addEventListener('click', (e) => {
      if (this.currentMenu && !e.target.closest('.context-menu')) {
        this.closeMenu();
      }
    });
  }
  
  bindContextMenuItems() {
    const items = document.querySelectorAll('[data-context-menu]');
    
    items.forEach(item => {
      // Desktop: right-click
      item.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showMenu(item, e.clientX, e.clientY);
      });
      
      // Mobile: long-press
      item.addEventListener('touchstart', (e) => {
        this.pressTimer = setTimeout(() => {
          this.vibrate(50);
          const touch = e.touches[0];
          this.showMenu(item, touch.clientX, touch.clientY);
        }, this.longPressDuration);
      });
      
      item.addEventListener('touchend', () => {
        clearTimeout(this.pressTimer);
      });
      
      item.addEventListener('touchmove', () => {
        clearTimeout(this.pressTimer);
      });
    });
  }
  
  showMenu(item, x, y) {
    // Close existing menu
    this.closeMenu();
    
    // Get menu actions from data attribute
    const menuData = item.dataset.contextMenu;
    let actions = [];
    
    try {
      actions = JSON.parse(menuData);
    } catch (e) {
      console.error('Invalid context menu data:', menuData);
      return;
    }
    
    // Create menu
    const menu = document.createElement('div');
    menu.className = 'context-menu';
    menu.style.cssText = `
      position: fixed;
      left: ${x}px;
      top: ${y}px;
      background: rgba(0, 0, 0, 0.95);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      padding: 8px 0;
      min-width: 200px;
      z-index: 99999;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
      animation: contextMenuAppear 0.2s ease;
    `;
    
    // Add actions
    actions.forEach(action => {
      const actionBtn = document.createElement('button');
      actionBtn.className = 'context-menu-item';
      actionBtn.innerHTML = `
        ${action.icon ? `<i class="${action.icon}"></i>` : ''}
        <span>${action.label}</span>
      `;
      actionBtn.style.cssText = `
        display: flex;
        align-items: center;
        gap: 12px;
        width: 100%;
        padding: 12px 16px;
        border: none;
        background: transparent;
        color: ${action.danger ? '#ef4444' : 'white'};
        cursor: pointer;
        transition: background 0.2s ease;
        font-size: 14px;
      `;
      
      actionBtn.addEventListener('mouseenter', () => {
        actionBtn.style.background = 'rgba(255, 255, 255, 0.1)';
      });
      
      actionBtn.addEventListener('mouseleave', () => {
        actionBtn.style.background = 'transparent';
      });
      
      actionBtn.addEventListener('click', () => {
        if (action.action) {
          action.action(item);
        }
        this.closeMenu();
      });
      
      menu.appendChild(actionBtn);
    });
    
    // Add CSS animation
    if (!document.getElementById('context-menu-animation')) {
      const style = document.createElement('style');
      style.id = 'context-menu-animation';
      style.textContent = `
        @keyframes contextMenuAppear {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
      `;
      document.head.appendChild(style);
    }
    
    document.body.appendChild(menu);
    this.currentMenu = menu;
    
    // Adjust position if off-screen
    this.adjustMenuPosition(menu);
  }
  
  adjustMenuPosition(menu) {
    const rect = menu.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    if (rect.right > viewportWidth) {
      menu.style.left = `${viewportWidth - rect.width - 10}px`;
    }
    
    if (rect.bottom > viewportHeight) {
      menu.style.top = `${viewportHeight - rect.height - 10}px`;
    }
    
    if (rect.left < 0) {
      menu.style.left = '10px';
    }
    
    if (rect.top < 0) {
      menu.style.top = '10px';
    }
  }
  
  closeMenu() {
    if (this.currentMenu) {
      this.currentMenu.remove();
      this.currentMenu = null;
    }
  }
  
  vibrate(duration = 50) {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }
}

// Artwork card context menu example
window.initArtworkContextMenu = function() {
  document.querySelectorAll('.artwork-card').forEach(card => {
    card.dataset.contextMenu = JSON.stringify([
      {
        icon: 'fas fa-eye',
        label: 'Quick View',
        action: (item) => {
          const artworkId = item.dataset.artworkId;
          if (window.openQuickView) {
            window.openQuickView(artworkId);
          }
        }
      },
      {
        icon: 'fas fa-heart',
        label: 'Add to Favorites',
        action: (item) => {
          console.log('Add to favorites:', item.dataset.artworkId);
        }
      },
      {
        icon: 'fas fa-share-alt',
        label: 'Share',
        action: (item) => {
          if (window.shareContent) {
            const title = item.querySelector('.artwork-title')?.textContent;
            window.shareContent('copy', window.location.href, title);
          }
        }
      },
      {
        icon: 'fas fa-external-link-alt',
        label: 'Open in New Tab',
        action: (item) => {
          const url = item.querySelector('a')?.href;
          if (url) window.open(url, '_blank');
        }
      }
    ]);
  });
};

// Global instance
window.contextMenuManager = new ContextMenuManager();

// Auto-initialize artwork context menus
document.addEventListener('DOMContentLoaded', function() {
  window.initArtworkContextMenu();
});

console.log('✅ Context Menu loaded');
