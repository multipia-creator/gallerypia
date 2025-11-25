/**
 * GalleryPia - Notification Preferences Utilities
 * 
 * Client-side JavaScript for managing notification preferences
 * 
 * Features:
 * - Email notification preferences
 * - Push notification preferences
 * - In-app notification preferences
 * - Category-based preferences
 * - Frequency settings
 * - Do Not Disturb mode
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class NotificationPreferences {
  constructor() {
    this.storageKey = 'gallerypia_notification_preferences';
    this.defaults = {
      email: {
        enabled: true,
        newArtwork: true,
        priceUpdates: true,
        offers: true,
        messages: true,
        newsletter: true,
        frequency: 'immediate' // immediate, daily, weekly
      },
      push: {
        enabled: false,
        newArtwork: true,
        offers: true,
        messages: true,
        likes: false,
        follows: true
      },
      inApp: {
        enabled: true,
        newArtwork: true,
        offers: true,
        messages: true,
        likes: true,
        follows: true,
        comments: true
      },
      dnd: {
        enabled: false,
        startTime: '22:00',
        endTime: '08:00'
      }
    };
    
    this.preferences = this.loadPreferences();
  }
  
  // Load preferences from localStorage
  loadPreferences() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...this.defaults, ...parsed };
      }
    } catch (error) {
      console.error('Failed to load preferences:', error);
    }
    
    return { ...this.defaults };
  }
  
  // Save preferences to localStorage
  savePreferences() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
      
      // Sync with backend
      this.syncWithBackend();
      
      return true;
    } catch (error) {
      console.error('Failed to save preferences:', error);
      return false;
    }
  }
  
  // Get all preferences
  getAll() {
    return { ...this.preferences };
  }
  
  // Get specific preference
  get(category, key) {
    return this.preferences[category]?.[key];
  }
  
  // Set specific preference
  set(category, key, value) {
    if (this.preferences[category]) {
      this.preferences[category][key] = value;
      this.savePreferences();
      return true;
    }
    return false;
  }
  
  // Toggle email notifications
  toggleEmail(enabled) {
    this.preferences.email.enabled = enabled;
    this.savePreferences();
  }
  
  // Toggle push notifications
  async togglePush(enabled) {
    if (enabled && 'Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        this.preferences.push.enabled = true;
        this.savePreferences();
        
        // Register service worker for push
        this.registerPushNotifications();
        
        return true;
      } else {
        this.showNotification('푸시 알림 권한이 거부되었습니다.', 'error');
        return false;
      }
    } else {
      this.preferences.push.enabled = false;
      this.savePreferences();
      return true;
    }
  }
  
  // Toggle in-app notifications
  toggleInApp(enabled) {
    this.preferences.inApp.enabled = enabled;
    this.savePreferences();
  }
  
  // Set Do Not Disturb
  setDND(enabled, startTime, endTime) {
    this.preferences.dnd.enabled = enabled;
    if (startTime) this.preferences.dnd.startTime = startTime;
    if (endTime) this.preferences.dnd.endTime = endTime;
    this.savePreferences();
  }
  
  // Check if currently in DND period
  isDNDActive() {
    if (!this.preferences.dnd.enabled) return false;
    
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    
    const { startTime, endTime } = this.preferences.dnd;
    
    if (startTime > endTime) {
      // DND period crosses midnight
      return currentTime >= startTime || currentTime <= endTime;
    } else {
      return currentTime >= startTime && currentTime <= endTime;
    }
  }
  
  // Register push notifications
  async registerPushNotifications() {
    if ('serviceWorker' in navigator && 'PushManager' in window) {
      try {
        const registration = await navigator.serviceWorker.ready;
        
        // Subscribe to push notifications
        const subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: this.urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
        });
        
        // Send subscription to backend
        await fetch('/api/notifications/subscribe', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(subscription)
        });
        
        console.log('Push notifications registered');
      } catch (error) {
        console.error('Failed to register push notifications:', error);
      }
    }
  }
  
  // Sync preferences with backend
  async syncWithBackend() {
    try {
      await fetch('/api/user/notification-preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(this.preferences)
      });
    } catch (error) {
      console.error('Failed to sync preferences:', error);
    }
  }
  
  // Helper: Convert VAPID key
  urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
    
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    
    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    
    return outputArray;
  }
  
  // Show notification
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-[102] flex items-center gap-3 ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    notification.innerHTML = `
      <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-xl"></i>
      <span>${message}</span>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
}

// Render notification preferences UI
function renderNotificationPreferencesUI() {
  const prefs = window.notificationPreferences.getAll();
  
  return `
    <div class="notification-preferences-container bg-gray-800 rounded-xl p-6">
      <h2 class="text-2xl font-bold text-white mb-6">
        <i class="fas fa-bell mr-2 text-purple-500"></i>
        알림 설정
      </h2>
      
      <!-- Email Notifications -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">이메일 알림</h3>
            <p class="text-gray-400 text-sm">이메일로 알림을 받습니다</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              ${prefs.email.enabled ? 'checked' : ''}
              onchange="toggleEmailNotifications(this.checked)"
              class="sr-only peer"
            />
            <div class="w-14 h-7 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        ${prefs.email.enabled ? `
          <div class="space-y-3 pl-6 border-l-2 border-purple-600">
            <label class="flex items-center gap-3 text-white">
              <input type="checkbox" ${prefs.email.newArtwork ? 'checked' : ''} onchange="setEmailPref('newArtwork', this.checked)" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
              <span>새로운 작품 등록</span>
            </label>
            <label class="flex items-center gap-3 text-white">
              <input type="checkbox" ${prefs.email.priceUpdates ? 'checked' : ''} onchange="setEmailPref('priceUpdates', this.checked)" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
              <span>가격 변동</span>
            </label>
            <label class="flex items-center gap-3 text-white">
              <input type="checkbox" ${prefs.email.offers ? 'checked' : ''} onchange="setEmailPref('offers', this.checked)" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
              <span>구매 제안</span>
            </label>
            <label class="flex items-center gap-3 text-white">
              <input type="checkbox" ${prefs.email.messages ? 'checked' : ''} onchange="setEmailPref('messages', this.checked)" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
              <span>메시지</span>
            </label>
            <label class="flex items-center gap-3 text-white">
              <input type="checkbox" ${prefs.email.newsletter ? 'checked' : ''} onchange="setEmailPref('newsletter', this.checked)" class="w-5 h-5 rounded bg-gray-700 border-gray-600 text-purple-600 focus:ring-purple-500" />
              <span>뉴스레터</span>
            </label>
            
            <div class="mt-4">
              <label class="block text-gray-400 text-sm mb-2">이메일 발송 빈도</label>
              <select onchange="setEmailFrequency(this.value)" class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none">
                <option value="immediate" ${prefs.email.frequency === 'immediate' ? 'selected' : ''}>즉시</option>
                <option value="daily" ${prefs.email.frequency === 'daily' ? 'selected' : ''}>일일 요약</option>
                <option value="weekly" ${prefs.email.frequency === 'weekly' ? 'selected' : ''}>주간 요약</option>
              </select>
            </div>
          </div>
        ` : ''}
      </div>
      
      <!-- Push Notifications -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">푸시 알림</h3>
            <p class="text-gray-400 text-sm">브라우저 푸시 알림을 받습니다</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              ${prefs.push.enabled ? 'checked' : ''}
              onchange="togglePushNotifications(this.checked)"
              class="sr-only peer"
            />
            <div class="w-14 h-7 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
      
      <!-- In-App Notifications -->
      <div class="mb-8">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">앱 내 알림</h3>
            <p class="text-gray-400 text-sm">플랫폼 내에서 알림을 표시합니다</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              ${prefs.inApp.enabled ? 'checked' : ''}
              onchange="toggleInAppNotifications(this.checked)"
              class="sr-only peer"
            />
            <div class="w-14 h-7 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
      </div>
      
      <!-- Do Not Disturb -->
      <div class="mb-6">
        <div class="flex items-center justify-between mb-4">
          <div>
            <h3 class="text-lg font-semibold text-white">방해 금지 모드</h3>
            <p class="text-gray-400 text-sm">특정 시간대에 알림을 받지 않습니다</p>
          </div>
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              ${prefs.dnd.enabled ? 'checked' : ''}
              onchange="toggleDND(this.checked)"
              class="sr-only peer"
            />
            <div class="w-14 h-7 bg-gray-700 peer-focus:ring-4 peer-focus:ring-purple-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[4px] after:bg-white after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-purple-600"></div>
          </label>
        </div>
        
        ${prefs.dnd.enabled ? `
          <div class="flex gap-4 pl-6">
            <div class="flex-1">
              <label class="block text-gray-400 text-sm mb-2">시작 시간</label>
              <input 
                type="time" 
                value="${prefs.dnd.startTime}"
                onchange="setDNDTime('start', this.value)"
                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
            <div class="flex-1">
              <label class="block text-gray-400 text-sm mb-2">종료 시간</label>
              <input 
                type="time" 
                value="${prefs.dnd.endTime}"
                onchange="setDNDTime('end', this.value)"
                class="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>
        ` : ''}
      </div>
      
      <div class="pt-6 border-t border-gray-700">
        <button 
          onclick="testNotification()"
          class="w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors"
        >
          <i class="fas fa-bell mr-2"></i>테스트 알림 보내기
        </button>
      </div>
    </div>
  `;
}

// Global instance
window.notificationPreferences = new NotificationPreferences();

// Global functions
window.toggleEmailNotifications = function(enabled) {
  window.notificationPreferences.toggleEmail(enabled);
  refreshPreferencesUI();
};

window.togglePushNotifications = async function(enabled) {
  await window.notificationPreferences.togglePush(enabled);
  refreshPreferencesUI();
};

window.toggleInAppNotifications = function(enabled) {
  window.notificationPreferences.toggleInApp(enabled);
};

window.toggleDND = function(enabled) {
  window.notificationPreferences.setDND(enabled);
  refreshPreferencesUI();
};

window.setEmailPref = function(key, value) {
  window.notificationPreferences.set('email', key, value);
};

window.setEmailFrequency = function(value) {
  window.notificationPreferences.set('email', 'frequency', value);
};

window.setDNDTime = function(type, value) {
  const key = type === 'start' ? 'startTime' : 'endTime';
  window.notificationPreferences.set('dnd', key, value);
};

window.testNotification = function() {
  window.notificationPreferences.showNotification('테스트 알림입니다!', 'success');
};

window.refreshPreferencesUI = function() {
  const container = document.querySelector('.notification-preferences-container');
  if (container) {
    container.outerHTML = renderNotificationPreferencesUI();
  }
};

// Auto-render on page load
document.addEventListener('DOMContentLoaded', function() {
  const target = document.getElementById('notification-preferences');
  if (target) {
    target.innerHTML = renderNotificationPreferencesUI();
  }
});

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { NotificationPreferences };
}
