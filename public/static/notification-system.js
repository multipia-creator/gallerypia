/**
 * GalleryPia - Push Notification System
 * L4-2: Browser push notifications with service worker integration
 * 
 * Features:
 * - Browser push notifications (Web Push API)
 * - Service worker integration
 * - Notification permission management
 * - Multiple notification types (auction, message, artwork)
 * - Notification history
 * - Do Not Disturb mode
 * - Notification preferences
 * - Badge count management
 */

class NotificationSystem {
  constructor() {
    this.permission = 'default'; // default, granted, denied
    this.isSupported = this.checkSupport();
    this.notifications = [];
    this.maxNotifications = 50;
    this.dndEnabled = false;
    this.preferences = this.loadPreferences();
    this.badgeCount = 0;
    
    // Initialize on page load
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Notification System initialized');
    
    // Check current permission
    if (this.isSupported) {
      this.permission = Notification.permission;
    }
    
    // Create notification UI
    this.createNotificationUI();
    
    // Load notification history
    this.loadNotificationHistory();
    
    // Register service worker for push notifications
    this.registerServiceWorker();
    
    // Setup event listeners
    this.setupEventListeners();
    
    // Check for pending notifications
    this.checkPendingNotifications();
  }

  checkSupport() {
    return 'Notification' in window && 'serviceWorker' in navigator;
  }

  createNotificationUI() {
    // Create notification bell button
    const bellButton = document.createElement('button');
    bellButton.id = 'notificationBell';
    bellButton.className = 'fixed top-20 right-6 bg-white text-gray-700 rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 z-40';
    bellButton.innerHTML = `
      <i class="fas fa-bell text-xl"></i>
      <span id="notificationBadge" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
    `;
    bellButton.onclick = () => this.toggleNotificationPanel();
    document.body.appendChild(bellButton);

    // Create notification panel (hidden by default)
    const notificationPanel = document.createElement('div');
    notificationPanel.id = 'notificationPanel';
    notificationPanel.className = 'hidden fixed top-32 right-6 w-96 max-h-[600px] bg-white rounded-lg shadow-2xl z-40 flex flex-col';
    notificationPanel.innerHTML = `
      <!-- Panel Header -->
      <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-4 rounded-t-lg">
        <div class="flex items-center justify-between mb-2">
          <h3 class="font-bold text-lg">
            <i class="fas fa-bell mr-2"></i>알림
          </h3>
          <div class="flex items-center space-x-2">
            <button 
              id="notificationDNDToggle" 
              class="hover:bg-white/20 rounded p-1 transition-colors"
              title="방해금지 모드"
            >
              <i class="fas fa-moon"></i>
            </button>
            <button 
              id="notificationSettings" 
              class="hover:bg-white/20 rounded p-1 transition-colors"
              title="알림 설정"
            >
              <i class="fas fa-cog"></i>
            </button>
            <button 
              onclick="window.notificationSystem.closeNotificationPanel()" 
              class="hover:bg-white/20 rounded p-1 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
        
        <!-- Permission Request Banner -->
        <div id="notificationPermissionBanner" class="hidden bg-white/20 rounded p-2 text-sm">
          <p class="mb-2">알림을 받으려면 권한을 허용해주세요.</p>
          <button 
            onclick="window.notificationSystem.requestPermission()"
            class="bg-white text-indigo-600 px-3 py-1 rounded font-semibold hover:bg-gray-100 transition-colors"
          >
            권한 허용
          </button>
        </div>
      </div>

      <!-- Notification Tabs -->
      <div class="flex border-b border-gray-200">
        <button 
          class="flex-1 py-3 px-4 text-sm font-medium border-b-2 border-indigo-600 text-indigo-600"
          onclick="window.notificationSystem.switchTab('all')"
          data-tab="all"
        >
          전체 <span class="ml-1 text-xs" id="notificationCountAll">(0)</span>
        </button>
        <button 
          class="flex-1 py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
          onclick="window.notificationSystem.switchTab('auction')"
          data-tab="auction"
        >
          경매 <span class="ml-1 text-xs" id="notificationCountAuction">(0)</span>
        </button>
        <button 
          class="flex-1 py-3 px-4 text-sm font-medium text-gray-500 hover:text-gray-700"
          onclick="window.notificationSystem.switchTab('message')"
          data-tab="message"
        >
          메시지 <span class="ml-1 text-xs" id="notificationCountMessage">(0)</span>
        </button>
      </div>

      <!-- Notifications List -->
      <div id="notificationsList" class="flex-1 overflow-y-auto p-4 space-y-3">
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-bell-slash text-4xl mb-2"></i>
          <p>알림이 없습니다</p>
        </div>
      </div>

      <!-- Panel Footer -->
      <div class="border-t border-gray-200 p-3 bg-gray-50 rounded-b-lg flex justify-between">
        <button 
          onclick="window.notificationSystem.markAllAsRead()"
          class="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
        >
          모두 읽음으로 표시
        </button>
        <button 
          onclick="window.notificationSystem.clearAll()"
          class="text-sm text-red-600 hover:text-red-800 font-medium"
        >
          모두 삭제
        </button>
      </div>
    `;
    document.body.appendChild(notificationPanel);

    // Show permission banner if needed
    if (this.permission === 'default') {
      document.getElementById('notificationPermissionBanner').classList.remove('hidden');
    }
  }

  setupEventListeners() {
    // DND toggle
    const dndToggle = document.getElementById('notificationDNDToggle');
    if (dndToggle) {
      dndToggle.addEventListener('click', () => this.toggleDND());
    }

    // Settings
    const settingsBtn = document.getElementById('notificationSettings');
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.openSettings());
    }

    // Listen for notification events from other parts of the app
    window.addEventListener('gallerypia:notify', (e) => {
      this.sendNotification(e.detail);
    });
  }

  async requestPermission() {
    if (!this.isSupported) {
      alert('이 브라우저는 알림을 지원하지 않습니다.');
      return false;
    }

    try {
      const permission = await Notification.requestPermission();
      this.permission = permission;
      
      if (permission === 'granted') {
        // Hide permission banner
        const banner = document.getElementById('notificationPermissionBanner');
        if (banner) {
          banner.classList.add('hidden');
        }
        
        // Show success notification
        this.sendNotification({
          type: 'system',
          title: '알림 권한 허용됨',
          body: 'GalleryPia의 알림을 받을 수 있습니다.',
          icon: '/static/icon-192.png'
        });
        
        return true;
      } else if (permission === 'denied') {
        alert('알림 권한이 거부되었습니다. 브라우저 설정에서 변경할 수 있습니다.');
        return false;
      }
    } catch (error) {
      console.error('Permission request error:', error);
      return false;
    }
  }

  async sendNotification(options) {
    const {
      type = 'info', // system, auction, message, artwork, info
      title,
      body,
      icon = '/static/icon-192.png',
      image,
      badge = '/static/badge-72.png',
      tag,
      data = {},
      requireInteraction = false,
      silent = false
    } = options;

    // Check DND mode
    if (this.dndEnabled && type !== 'system') {
      console.log('DND mode enabled, notification suppressed');
      return;
    }

    // Check preferences
    if (!this.shouldShowNotification(type)) {
      console.log(`Notification type ${type} is disabled in preferences`);
      return;
    }

    // Create notification object
    const notification = {
      id: Date.now(),
      type,
      title,
      body,
      icon,
      image,
      timestamp: new Date().toISOString(),
      read: false,
      data
    };

    // Add to history
    this.addToHistory(notification);

    // Show browser notification if permission granted
    if (this.permission === 'granted' && !silent) {
      try {
        const notificationOptions = {
          body,
          icon,
          badge,
          tag: tag || `notification-${notification.id}`,
          data: { ...data, notificationId: notification.id },
          requireInteraction,
          silent: this.dndEnabled
        };

        if (image) {
          notificationOptions.image = image;
        }

        // Use service worker if available
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          await navigator.serviceWorker.ready;
          await navigator.serviceWorker.getRegistration().then(reg => {
            if (reg) {
              reg.showNotification(title, notificationOptions);
            }
          });
        } else {
          // Fallback to basic Notification API
          new Notification(title, notificationOptions);
        }
      } catch (error) {
        console.error('Failed to show notification:', error);
      }
    }

    // Update UI
    this.updateNotificationList();
    this.updateBadgeCount();
  }

  addToHistory(notification) {
    this.notifications.unshift(notification);
    
    // Keep only last N notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    
    // Save to localStorage
    this.saveNotificationHistory();
  }

  loadNotificationHistory() {
    try {
      const stored = localStorage.getItem('gallerypia_notifications');
      if (stored) {
        this.notifications = JSON.parse(stored);
        this.updateNotificationList();
        this.updateBadgeCount();
      }
    } catch (error) {
      console.error('Failed to load notification history:', error);
    }
  }

  saveNotificationHistory() {
    try {
      localStorage.setItem('gallerypia_notifications', JSON.stringify(this.notifications));
    } catch (error) {
      console.error('Failed to save notification history:', error);
    }
  }

  updateNotificationList(filter = 'all') {
    const container = document.getElementById('notificationsList');
    if (!container) return;

    let filteredNotifications = this.notifications;
    if (filter !== 'all') {
      filteredNotifications = this.notifications.filter(n => n.type === filter);
    }

    if (filteredNotifications.length === 0) {
      container.innerHTML = `
        <div class="text-center text-gray-500 py-8">
          <i class="fas fa-bell-slash text-4xl mb-2"></i>
          <p>알림이 없습니다</p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredNotifications.map(notification => {
      const time = this.formatTime(notification.timestamp);
      const icon = this.getNotificationIcon(notification.type);
      const unreadClass = notification.read ? '' : 'bg-indigo-50 border-l-4 border-indigo-600';
      
      return `
        <div class="notification-item p-3 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors ${unreadClass}" 
             onclick="window.notificationSystem.markAsRead(${notification.id})"
             data-notification-id="${notification.id}">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              ${notification.icon ? `<img src="${notification.icon}" class="w-10 h-10 rounded-full" alt="">` : icon}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-semibold text-gray-900 truncate">${this.escapeHtml(notification.title)}</p>
              <p class="text-sm text-gray-600 mt-1">${this.escapeHtml(notification.body)}</p>
              ${notification.image ? `<img src="${notification.image}" class="mt-2 rounded-lg max-h-32 w-full object-cover" alt="">` : ''}
              <p class="text-xs text-gray-500 mt-1">${time}</p>
            </div>
            <button 
              onclick="event.stopPropagation(); window.notificationSystem.deleteNotification(${notification.id})"
              class="flex-shrink-0 text-gray-400 hover:text-red-600 transition-colors"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Update counts
    this.updateNotificationCounts();
  }

  getNotificationIcon(type) {
    const icons = {
      system: '<i class="fas fa-info-circle text-blue-500 text-2xl"></i>',
      auction: '<i class="fas fa-gavel text-purple-500 text-2xl"></i>',
      message: '<i class="fas fa-envelope text-green-500 text-2xl"></i>',
      artwork: '<i class="fas fa-palette text-pink-500 text-2xl"></i>',
      info: '<i class="fas fa-bell text-gray-500 text-2xl"></i>'
    };
    return icons[type] || icons.info;
  }

  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) return '방금 전';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}분 전`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}시간 전`;
    if (diff < 604800000) return `${Math.floor(diff / 86400000)}일 전`;
    
    return date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' });
  }

  updateNotificationCounts() {
    const allCount = this.notifications.length;
    const auctionCount = this.notifications.filter(n => n.type === 'auction').length;
    const messageCount = this.notifications.filter(n => n.type === 'message').length;

    const allEl = document.getElementById('notificationCountAll');
    const auctionEl = document.getElementById('notificationCountAuction');
    const messageEl = document.getElementById('notificationCountMessage');

    if (allEl) allEl.textContent = `(${allCount})`;
    if (auctionEl) auctionEl.textContent = `(${auctionCount})`;
    if (messageEl) messageEl.textContent = `(${messageCount})`;
  }

  updateBadgeCount() {
    const unreadCount = this.notifications.filter(n => !n.read).length;
    this.badgeCount = unreadCount;

    const badge = document.getElementById('notificationBadge');
    if (badge) {
      if (unreadCount > 0) {
        badge.classList.remove('hidden');
        badge.textContent = unreadCount > 99 ? '99+' : unreadCount;
      } else {
        badge.classList.add('hidden');
      }
    }

    // Update browser badge (if supported)
    if ('setAppBadge' in navigator) {
      if (unreadCount > 0) {
        navigator.setAppBadge(unreadCount);
      } else {
        navigator.clearAppBadge();
      }
    }
  }

  toggleNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    if (panel.classList.contains('hidden')) {
      panel.classList.remove('hidden');
      panel.classList.add('animate-fadeIn');
    } else {
      this.closeNotificationPanel();
    }
  }

  closeNotificationPanel() {
    const panel = document.getElementById('notificationPanel');
    panel.classList.add('hidden');
  }

  switchTab(tab) {
    // Update tab styles
    document.querySelectorAll('[data-tab]').forEach(btn => {
      btn.classList.remove('border-b-2', 'border-indigo-600', 'text-indigo-600');
      btn.classList.add('text-gray-500');
    });

    const activeTab = document.querySelector(`[data-tab="${tab}"]`);
    if (activeTab) {
      activeTab.classList.add('border-b-2', 'border-indigo-600', 'text-indigo-600');
      activeTab.classList.remove('text-gray-500');
    }

    // Update list
    this.updateNotificationList(tab);
  }

  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.saveNotificationHistory();
      this.updateNotificationList();
      this.updateBadgeCount();
    }

    // Handle notification action if any
    if (notification && notification.data && notification.data.url) {
      window.location.href = notification.data.url;
    }
  }

  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.saveNotificationHistory();
    this.updateNotificationList();
    this.updateBadgeCount();
  }

  deleteNotification(notificationId) {
    this.notifications = this.notifications.filter(n => n.id !== notificationId);
    this.saveNotificationHistory();
    this.updateNotificationList();
    this.updateBadgeCount();
  }

  clearAll() {
    if (confirm('모든 알림을 삭제하시겠습니까?')) {
      this.notifications = [];
      this.saveNotificationHistory();
      this.updateNotificationList();
      this.updateBadgeCount();
    }
  }

  toggleDND() {
    this.dndEnabled = !this.dndEnabled;
    localStorage.setItem('gallerypia_dnd', this.dndEnabled);

    const btn = document.getElementById('notificationDNDToggle');
    if (btn) {
      if (this.dndEnabled) {
        btn.classList.add('bg-white/30');
        btn.title = '방해금지 모드 켜짐';
      } else {
        btn.classList.remove('bg-white/30');
        btn.title = '방해금지 모드';
      }
    }
  }

  openSettings() {
    alert('알림 설정 모달은 곧 구현될 예정입니다.');
    // TODO: Implement settings modal
  }

  loadPreferences() {
    try {
      const stored = localStorage.getItem('gallerypia_notification_preferences');
      return stored ? JSON.parse(stored) : {
        auction: true,
        message: true,
        artwork: true,
        system: true,
        sound: true
      };
    } catch {
      return { auction: true, message: true, artwork: true, system: true, sound: true };
    }
  }

  shouldShowNotification(type) {
    return this.preferences[type] !== false;
  }

  async registerServiceWorker() {
    if (!('serviceWorker' in navigator)) {
      console.log('Service Worker not supported');
      return;
    }

    try {
      // Service worker is already registered by PWA system
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker ready for notifications:', registration);
    } catch (error) {
      console.error('Service Worker registration failed:', error);
    }
  }

  checkPendingNotifications() {
    // Check for any pending notifications that should be shown
    // This could be used for scheduled notifications or missed notifications
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Public API for other modules to send notifications
  notify(options) {
    return this.sendNotification(options);
  }

  // Cleanup
  destroy() {
    const bell = document.getElementById('notificationBell');
    const panel = document.getElementById('notificationPanel');
    
    if (bell) bell.remove();
    if (panel) panel.remove();
  }
}

// Initialize global instance
window.notificationSystem = new NotificationSystem();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = NotificationSystem;
}

// Helper function to send notifications from anywhere in the app
window.sendNotification = function(options) {
  if (window.notificationSystem) {
    return window.notificationSystem.notify(options);
  }
};
