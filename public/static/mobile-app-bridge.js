/**
 * GALLERYPIA - Mobile App Bridge
 * Phase 16: Mobile App (React Native)
 * Bridge for iOS/Android Native Features
 */

class MobileAppBridge {
  constructor() {
    this.isMobile = false;
    this.platform = null;
    this.appVersion = null;
    this.capabilities = new Set();
    this.init();
  }

  async init() {
    console.log('📱 Mobile App Bridge initializing...');
    this.detectPlatform();
    await this.checkCapabilities();
  }

  detectPlatform() {
    const ua = navigator.userAgent.toLowerCase();
    
    // React Native WebView 감지
    if (window.ReactNativeWebView) {
      this.isMobile = true;
      
      if (ua.includes('android')) {
        this.platform = 'android';
      } else if (ua.includes('iphone') || ua.includes('ipad')) {
        this.platform = 'ios';
      }
      
      console.log(`✅ Running in React Native (${this.platform})`);
    } 
    // 일반 모바일 브라우저
    else if (ua.includes('android')) {
      this.isMobile = true;
      this.platform = 'android-browser';
    } else if (ua.includes('iphone') || ua.includes('ipad')) {
      this.isMobile = true;
      this.platform = 'ios-browser';
    }
  }

  async checkCapabilities() {
    console.log('🔍 Checking mobile capabilities...');
    
    // Push Notifications
    if ('Notification' in window) {
      this.capabilities.add('push_notifications');
    }
    
    // Camera
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      this.capabilities.add('camera');
    }
    
    // Geolocation
    if ('geolocation' in navigator) {
      this.capabilities.add('geolocation');
    }
    
    // Vibration
    if ('vibrate' in navigator) {
      this.capabilities.add('vibration');
    }
    
    // Clipboard
    if ('clipboard' in navigator) {
      this.capabilities.add('clipboard');
    }
    
    // Share API
    if ('share' in navigator) {
      this.capabilities.add('share');
    }
    
    // Device Orientation
    if ('DeviceOrientationEvent' in window) {
      this.capabilities.add('orientation');
    }
    
    console.log('✅ Capabilities:', Array.from(this.capabilities));
  }

  // Push Notifications
  async requestPushPermission() {
    console.log('🔔 Requesting push notification permission...');
    
    if (!this.capabilities.has('push_notifications')) {
      throw new Error('Push notifications not supported');
    }

    try {
      const permission = await Notification.requestPermission();
      
      if (permission === 'granted') {
        console.log('✅ Push permission granted');
        
        // 네이티브 앱에 알림
        this.postMessageToNative('push_permission_granted');
        
        this.trackEvent('push_permission_granted');
        return true;
      } else {
        console.log('❌ Push permission denied');
        this.trackEvent('push_permission_denied');
        return false;
      }
    } catch (error) {
      console.error('❌ Push permission error:', error);
      return false;
    }
  }

  async registerPushToken(token) {
    console.log('📝 Registering push token...');
    
    try {
      const response = await fetch('/api/mobile/push-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: token,
          platform: this.platform,
          app_version: this.appVersion
        })
      });

      const result = await response.json();
      
      if (result.success) {
        console.log('✅ Push token registered');
        this.trackEvent('push_token_registered');
        return true;
      }
    } catch (error) {
      console.error('❌ Push token registration failed:', error);
    }
    
    return false;
  }

  async sendLocalNotification(title, body, data = {}) {
    console.log('🔔 Sending local notification...');
    
    if (!this.capabilities.has('push_notifications')) {
      console.warn('⚠️ Push notifications not supported');
      return false;
    }

    try {
      const notification = new Notification(title, {
        body: body,
        icon: '/static/icon-192.png',
        badge: '/static/badge-72.png',
        data: data,
        tag: data.tag || 'gallerypia-notification'
      });

      notification.onclick = (event) => {
        event.preventDefault();
        
        // 앱으로 딥링크
        if (data.url) {
          window.location.href = data.url;
        }
        
        this.trackEvent('notification_clicked', { title: title });
      };

      this.trackEvent('local_notification_sent', { title: title });
      return true;
    } catch (error) {
      console.error('❌ Local notification failed:', error);
      return false;
    }
  }

  // Camera & Photo
  async openCamera(options = {}) {
    console.log('📷 Opening camera...');
    
    if (!this.capabilities.has('camera')) {
      throw new Error('Camera not supported');
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || 'environment', // 'user' for selfie
          width: { ideal: 1920 },
          height: { ideal: 1080 }
        }
      });

      // 네이티브 앱에서 카메라 화면 표시
      this.postMessageToNative('open_camera', options);
      
      this.trackEvent('camera_opened');
      return stream;
    } catch (error) {
      console.error('❌ Camera open failed:', error);
      throw error;
    }
  }

  async capturePhoto() {
    console.log('📸 Capturing photo...');
    
    return new Promise((resolve, reject) => {
      this.postMessageToNative('capture_photo');
      
      // 네이티브 앱으로부터 사진 데이터 수신
      window.addEventListener('message', (event) => {
        if (event.data.type === 'photo_captured') {
          this.trackEvent('photo_captured');
          resolve(event.data.photo);
        }
      }, { once: true });
      
      setTimeout(() => reject(new Error('Capture timeout')), 30000);
    });
  }

  async selectPhoto(options = {}) {
    console.log('🖼️ Selecting photo from gallery...');
    
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.multiple = options.multiple || false;
      
      input.onchange = async (event) => {
        const files = event.target.files;
        
        if (files.length > 0) {
          const photos = [];
          
          for (let file of files) {
            const dataUrl = await this.fileToDataURL(file);
            photos.push({
              uri: dataUrl,
              name: file.name,
              type: file.type,
              size: file.size
            });
          }
          
          this.trackEvent('photo_selected', { count: photos.length });
          resolve(options.multiple ? photos : photos[0]);
        } else {
          reject(new Error('No photo selected'));
        }
      };
      
      input.click();
    });
  }

  fileToDataURL(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  // Geolocation
  async getCurrentLocation() {
    console.log('📍 Getting current location...');
    
    if (!this.capabilities.has('geolocation')) {
      throw new Error('Geolocation not supported');
    }

    return new Promise((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp
          };
          
          this.trackEvent('location_fetched');
          resolve(location);
        },
        (error) => {
          console.error('❌ Location error:', error);
          this.trackEvent('location_error', { code: error.code });
          reject(error);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    });
  }

  // Vibration
  vibrate(pattern = [200]) {
    console.log('📳 Vibrating...');
    
    if (!this.capabilities.has('vibration')) {
      console.warn('⚠️ Vibration not supported');
      return false;
    }

    navigator.vibrate(pattern);
    this.trackEvent('vibration_triggered');
    return true;
  }

  // Clipboard
  async copyToClipboard(text) {
    console.log('📋 Copying to clipboard...');
    
    if (!this.capabilities.has('clipboard')) {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      
      this.trackEvent('clipboard_copy_fallback');
      return true;
    }

    try {
      await navigator.clipboard.writeText(text);
      this.trackEvent('clipboard_copy_success');
      return true;
    } catch (error) {
      console.error('❌ Clipboard copy failed:', error);
      return false;
    }
  }

  async readFromClipboard() {
    console.log('📋 Reading from clipboard...');
    
    if (!this.capabilities.has('clipboard')) {
      throw new Error('Clipboard not supported');
    }

    try {
      const text = await navigator.clipboard.readText();
      this.trackEvent('clipboard_read_success');
      return text;
    } catch (error) {
      console.error('❌ Clipboard read failed:', error);
      throw error;
    }
  }

  // Share API
  async share(data) {
    console.log('📤 Sharing content...');
    
    if (!this.capabilities.has('share')) {
      // Fallback - 네이티브 앱에 전달
      this.postMessageToNative('share', data);
      return true;
    }

    try {
      await navigator.share({
        title: data.title,
        text: data.text,
        url: data.url
      });
      
      this.trackEvent('share_success', { type: data.type });
      return true;
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('❌ Share failed:', error);
      }
      return false;
    }
  }

  // Offline Mode
  enableOfflineMode() {
    console.log('📴 Enabling offline mode...');
    
    // Service Worker 등록
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').then(() => {
        console.log('✅ Service Worker registered');
        this.trackEvent('offline_mode_enabled');
      });
    }
  }

  isOnline() {
    return navigator.onLine;
  }

  onNetworkChange(callback) {
    window.addEventListener('online', () => {
      console.log('🌐 Network online');
      this.trackEvent('network_online');
      callback(true);
    });

    window.addEventListener('offline', () => {
      console.log('📴 Network offline');
      this.trackEvent('network_offline');
      callback(false);
    });
  }

  // Native Communication
  postMessageToNative(type, data = {}) {
    if (window.ReactNativeWebView) {
      window.ReactNativeWebView.postMessage(JSON.stringify({
        type: type,
        data: data,
        timestamp: new Date().toISOString()
      }));
      
      console.log(`📨 Message sent to native: ${type}`);
    } else {
      console.warn('⚠️ Not running in React Native WebView');
    }
  }

  onMessageFromNative(callback) {
    window.addEventListener('message', (event) => {
      try {
        const message = typeof event.data === 'string' 
          ? JSON.parse(event.data) 
          : event.data;
        
        console.log('📬 Message from native:', message);
        callback(message);
      } catch (error) {
        console.error('❌ Failed to parse native message:', error);
      }
    });
  }

  // App State
  setAppVersion(version) {
    this.appVersion = version;
    console.log(`📱 App version: ${version}`);
  }

  getAppInfo() {
    return {
      isMobile: this.isMobile,
      platform: this.platform,
      appVersion: this.appVersion,
      capabilities: Array.from(this.capabilities),
      isOnline: this.isOnline()
    };
  }

  trackEvent(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'mobile_app_' + action, {
        event_category: 'Mobile',
        platform: this.platform,
        app_version: this.appVersion,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.MobileAppBridge = MobileAppBridge;
window.mobileApp = null;

// 초기화 함수
window.initMobileApp = function() {
  if (!window.mobileApp) {
    window.mobileApp = new MobileAppBridge();
    console.log('✅ Mobile App Bridge initialized');
  }
  return window.mobileApp;
};

// 자동 초기화 (모바일 환경에서)
if (/Android|iPhone|iPad/i.test(navigator.userAgent)) {
  window.initMobileApp();
}

console.log('📦 Mobile App Bridge module loaded');
