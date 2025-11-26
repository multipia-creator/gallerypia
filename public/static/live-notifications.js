/**
 * Live Notification System
 * Real-time notifications for user activities
 */

class LiveNotificationSystem {
  constructor() {
    this.notifications = [];
    this.unreadCount = 0;
    this.maxNotifications = 100;
    this.eventHandlers = new Map();
    this.init();
  }

  init() {
    this.loadNotifications();
    this.startPolling();
    this.checkPermissions();
  }

  /**
   * Load notifications from storage
   */
  loadNotifications() {
    const stored = localStorage.getItem('notifications');
    if (stored) {
      this.notifications = JSON.parse(stored);
      this.updateUnreadCount();
    }
  }

  /**
   * Save notifications to storage
   */
  saveNotifications() {
    // Keep only recent notifications
    if (this.notifications.length > this.maxNotifications) {
      this.notifications = this.notifications.slice(0, this.maxNotifications);
    }
    localStorage.setItem('notifications', JSON.stringify(this.notifications));
  }

  /**
   * Create notification
   */
  create(options) {
    const notification = {
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: options.type || 'info', // info, success, warning, error, bid, auction, sale
      title: options.title,
      message: options.message,
      icon: options.icon || this.getDefaultIcon(options.type),
      image: options.image,
      link: options.link,
      data: options.data || {},
      read: false,
      timestamp: Date.now(),
      expiresAt: options.expiresAt || (Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    };
    
    this.notifications.unshift(notification);
    this.unreadCount++;
    this.saveNotifications();
    
    // Emit event
    this.emit('notification:created', notification);
    
    // Show in-app notification
    this.showInApp(notification);
    
    // Send browser notification if permitted
    this.sendBrowserNotification(notification);
    
    return notification;
  }

  /**
   * Get default icon for type
   */
  getDefaultIcon(type) {
    const icons = {
      info: 'fa-info-circle',
      success: 'fa-check-circle',
      warning: 'fa-exclamation-triangle',
      error: 'fa-times-circle',
      bid: 'fa-gavel',
      auction: 'fa-clock',
      sale: 'fa-shopping-cart',
      like: 'fa-heart',
      comment: 'fa-comment',
      follow: 'fa-user-plus'
    };
    return icons[type] || 'fa-bell';
  }

  /**
   * Show in-app toast notification
   */
  showInApp(notification) {
    const toast = document.createElement('div');
    toast.className = `fixed top-20 right-4 max-w-sm bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 p-4 transform transition-all duration-300 translate-x-full z-50`;
    toast.style.animation = 'slideIn 0.3s ease-out forwards';
    
    const typeColors = {
      info: 'blue',
      success: 'green',
      warning: 'yellow',
      error: 'red',
      bid: 'purple',
      auction: 'indigo',
      sale: 'green'
    };
    const color = typeColors[notification.type] || 'gray';
    
    toast.innerHTML = `
      <div class="flex items-start">
        ${notification.image ? `
          <img src="${notification.image}" class="w-12 h-12 rounded-lg object-cover mr-3" alt="">
        ` : `
          <div class="w-10 h-10 rounded-full bg-${color}-100 dark:bg-${color}-900 flex items-center justify-center mr-3">
            <i class="fas ${notification.icon} text-${color}-600 dark:text-${color}-400"></i>
          </div>
        `}
        <div class="flex-1">
          <h4 class="font-semibold text-gray-900 dark:text-white mb-1">${notification.title}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400">${notification.message}</p>
          ${notification.link ? `
            <a href="${notification.link}" class="text-sm text-${color}-600 dark:text-${color}-400 hover:underline mt-2 inline-block">View Details</a>
          ` : ''}
        </div>
        <button onclick="this.parentElement.parentElement.remove()" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
          <i class="fas fa-times"></i>
        </button>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
      toast.style.animation = 'slideOut 0.3s ease-out forwards';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  /**
   * Send browser notification
   */
  async sendBrowserNotification(notification) {
    if (!('Notification' in window)) return;
    
    if (Notification.permission === 'granted') {
      try {
        const browserNotif = new Notification(notification.title, {
          body: notification.message,
          icon: notification.image || '/static/logo.png',
          badge: '/icons/badge-72x72.png',
          tag: notification.id,
          requireInteraction: false
        });
        
        if (notification.link) {
          browserNotif.onclick = () => {
            window.focus();
            window.location.href = notification.link;
            browserNotif.close();
          };
        }
      } catch (error) {
        console.error('[Notifications] Browser notification failed:', error);
      }
    }
  }

  /**
   * Check and request notification permissions
   */
  async checkPermissions() {
    if (!('Notification' in window)) return false;
    
    if (Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        return permission === 'granted';
      } catch (error) {
        console.error('[Notifications] Permission request failed:', error);
        return false;
      }
    }
    
    return Notification.permission === 'granted';
  }

  /**
   * Mark as read
   */
  markAsRead(notificationId) {
    const notification = this.notifications.find(n => n.id === notificationId);
    if (notification && !notification.read) {
      notification.read = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
      this.saveNotifications();
      this.emit('notification:read', notification);
    }
  }

  /**
   * Mark all as read
   */
  markAllAsRead() {
    this.notifications.forEach(n => n.read = true);
    this.unreadCount = 0;
    this.saveNotifications();
    this.emit('notifications:all_read');
  }

  /**
   * Delete notification
   */
  delete(notificationId) {
    const index = this.notifications.findIndex(n => n.id === notificationId);
    if (index > -1) {
      const notification = this.notifications[index];
      if (!notification.read) {
        this.unreadCount = Math.max(0, this.unreadCount - 1);
      }
      this.notifications.splice(index, 1);
      this.saveNotifications();
      this.emit('notification:deleted', notification);
    }
  }

  /**
   * Clear all notifications
   */
  clearAll() {
    this.notifications = [];
    this.unreadCount = 0;
    this.saveNotifications();
    this.emit('notifications:cleared');
  }

  /**
   * Get notifications
   */
  getNotifications(options = {}) {
    let filtered = [...this.notifications];
    
    // Filter by type
    if (options.type) {
      filtered = filtered.filter(n => n.type === options.type);
    }
    
    // Filter by read status
    if (options.unreadOnly) {
      filtered = filtered.filter(n => !n.read);
    }
    
    // Limit
    if (options.limit) {
      filtered = filtered.slice(0, options.limit);
    }
    
    return filtered;
  }

  /**
   * Get unread count
   */
  getUnreadCount() {
    return this.unreadCount;
  }

  /**
   * Update unread count
   */
  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.read).length;
  }

  /**
   * Start polling for new notifications
   */
  startPolling(interval = 30000) {
    setInterval(() => {
      this.checkForNewNotifications();
    }, interval);
  }

  /**
   * Check for new notifications (simulated)
   */
  async checkForNewNotifications() {
    // In production, this would call an API
    // For now, we simulate with auction/bid events
    this.emit('notifications:checked');
  }

  /**
   * Event emitter
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventHandlers.has(event)) return;
    
    this.eventHandlers.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[Notifications] Event handler error (${event}):`, error);
      }
    });
  }

  /**
   * Notification templates
   */
  templates = {
    newBid: (data) => ({
      type: 'bid',
      title: 'New Bid Placed!',
      message: `${data.bidderName} placed a bid of $${data.amount.toLocaleString()} on "${data.artworkTitle}"`,
      image: data.artworkImage,
      link: `/auction/${data.auctionId}`,
      data
    }),
    
    outbid: (data) => ({
      type: 'warning',
      title: 'You\'ve Been Outbid!',
      message: `Your bid on "${data.artworkTitle}" has been outbid. Current bid: $${data.currentBid.toLocaleString()}`,
      image: data.artworkImage,
      link: `/auction/${data.auctionId}`,
      data
    }),
    
    auctionWon: (data) => ({
      type: 'success',
      title: 'Congratulations!',
      message: `You won the auction for "${data.artworkTitle}" at $${data.winningBid.toLocaleString()}`,
      image: data.artworkImage,
      link: `/auction/${data.auctionId}`,
      data
    }),
    
    auctionEnded: (data) => ({
      type: 'info',
      title: 'Auction Ended',
      message: `The auction for "${data.artworkTitle}" has ended`,
      image: data.artworkImage,
      link: `/auction/${data.auctionId}`,
      data
    }),
    
    newSale: (data) => ({
      type: 'sale',
      title: 'New Sale!',
      message: `Your artwork "${data.artworkTitle}" was sold for $${data.price.toLocaleString()}`,
      image: data.artworkImage,
      link: `/artwork/${data.artworkId}`,
      data
    }),
    
    newFollower: (data) => ({
      type: 'follow',
      title: 'New Follower',
      message: `${data.followerName} started following you`,
      image: data.followerImage,
      link: `/profile/${data.followerId}`,
      data
    })
  };
}

// Export
if (typeof window !== 'undefined') {
  window.LiveNotificationSystem = LiveNotificationSystem;
  window.notificationSystem = new LiveNotificationSystem();
  console.log('[Real-time] Notification System initialized');
  
  // Integrate with auction system
  if (window.auctionSystem) {
    window.auctionSystem.on('bid:placed', (data) => {
      window.notificationSystem.create(
        window.notificationSystem.templates.newBid({
          bidderName: data.bid.bidderName,
          amount: data.bid.amount,
          artworkTitle: data.auction.artworkTitle,
          artworkImage: data.auction.artworkImage,
          auctionId: data.auction.id
        })
      );
    });
    
    window.auctionSystem.on('bid:outbid', (data) => {
      window.notificationSystem.create(
        window.notificationSystem.templates.outbid({
          artworkTitle: data.auction.artworkTitle,
          artworkImage: data.auction.artworkImage,
          currentBid: data.newBid.amount,
          auctionId: data.auction.id
        })
      );
    });
    
    window.auctionSystem.on('auction:won', (data) => {
      window.notificationSystem.create(
        window.notificationSystem.templates.auctionWon({
          artworkTitle: data.auction.artworkTitle,
          artworkImage: data.auction.artworkImage,
          winningBid: data.auction.winningBid,
          auctionId: data.auction.id
        })
      );
    });
  }
}

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideIn {
    from { transform: translateX(100%); opacity: 0; }
    to { transform: translateX(0); opacity: 1; }
  }
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
`;
if (document.head) {
  document.head.appendChild(style);
}
