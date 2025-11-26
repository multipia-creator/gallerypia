/**
 * GALLERYPIA - Biometric Authentication
 * Phase 13: Advanced Security & Authentication
 * Fingerprint, Face ID, Touch ID
 */

class BiometricAuth {
  constructor() {
    this.supported = false;
    this.enabled = false;
    this.availableMethods = [];
    this.init();
  }

  async init() {
    console.log('🔐 Biometric Authentication initializing...');
    await this.checkSupport();
  }

  async checkSupport() {
    // WebAuthn API 지원 확인
    if (!window.PublicKeyCredential) {
      console.warn('⚠️ WebAuthn not supported');
      this.supported = false;
      return false;
    }

    try {
      // 사용 가능한 인증 방식 확인
      const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
      
      if (available) {
        this.supported = true;
        this.detectAvailableMethods();
        console.log('✅ Biometric authentication supported');
        return true;
      } else {
        console.warn('⚠️ No biometric authenticator available');
        return false;
      }
    } catch (error) {
      console.error('❌ Error checking biometric support:', error);
      return false;
    }
  }

  detectAvailableMethods() {
    const ua = navigator.userAgent.toLowerCase();
    
    // iOS (Face ID, Touch ID)
    if (ua.includes('iphone') || ua.includes('ipad')) {
      this.availableMethods.push('Face ID', 'Touch ID');
    }
    // Android (Fingerprint)
    else if (ua.includes('android')) {
      this.availableMethods.push('Fingerprint');
    }
    // Windows Hello
    else if (ua.includes('windows')) {
      this.availableMethods.push('Windows Hello');
    }
    // macOS (Touch ID)
    else if (ua.includes('mac')) {
      this.availableMethods.push('Touch ID');
    }
    // 일반
    else {
      this.availableMethods.push('Biometric');
    }

    console.log('📱 Available methods:', this.availableMethods);
  }

  async register() {
    if (!this.supported) {
      throw new Error('Biometric authentication not supported');
    }

    console.log('🔐 Registering biometric credential...');

    try {
      // 서버에서 challenge 받기
      const challengeResponse = await fetch('/api/auth/biometric/register-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const challengeData = await challengeResponse.json();

      // PublicKeyCredential 생성
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challengeData.challenge),
          rp: {
            name: 'GALLERYPIA',
            id: window.location.hostname
          },
          user: {
            id: this.base64ToArrayBuffer(challengeData.userId),
            name: challengeData.username,
            displayName: challengeData.displayName
          },
          pubKeyCredParams: [
            { type: 'public-key', alg: -7 },  // ES256
            { type: 'public-key', alg: -257 } // RS256
          ],
          authenticatorSelection: {
            authenticatorAttachment: 'platform', // 기기 내장 인증기 사용
            userVerification: 'required', // 생체인증 필수
            requireResidentKey: false
          },
          timeout: 60000,
          attestation: 'direct'
        }
      });

      // 서버로 credential 전송
      const verifyResponse = await fetch('/api/auth/biometric/register-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credential: {
            id: credential.id,
            rawId: this.arrayBufferToBase64(credential.rawId),
            type: credential.type,
            response: {
              clientDataJSON: this.arrayBufferToBase64(credential.response.clientDataJSON),
              attestationObject: this.arrayBufferToBase64(credential.response.attestationObject)
            }
          }
        })
      });

      const result = await verifyResponse.json();

      if (result.success) {
        this.enabled = true;
        this.saveSettings();
        console.log('✅ Biometric registration successful');
        this.showMessage('Biometric authentication enabled!', 'success');
        this.trackUsage('biometric_registered');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Biometric registration failed:', error);
      this.showMessage('Registration failed. Please try again.', 'error');
      throw error;
    }
  }

  async authenticate() {
    if (!this.supported) {
      throw new Error('Biometric authentication not supported');
    }

    console.log('🔐 Authenticating with biometric...');

    try {
      // 서버에서 challenge 받기
      const challengeResponse = await fetch('/api/auth/biometric/auth-challenge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const challengeData = await challengeResponse.json();

      // 생체인증 요청
      const assertion = await navigator.credentials.get({
        publicKey: {
          challenge: this.base64ToArrayBuffer(challengeData.challenge),
          timeout: 60000,
          rpId: window.location.hostname,
          userVerification: 'required',
          allowCredentials: challengeData.allowCredentials.map(cred => ({
            type: 'public-key',
            id: this.base64ToArrayBuffer(cred.id)
          }))
        }
      });

      // 서버로 assertion 전송
      const verifyResponse = await fetch('/api/auth/biometric/auth-verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assertion: {
            id: assertion.id,
            rawId: this.arrayBufferToBase64(assertion.rawId),
            type: assertion.type,
            response: {
              clientDataJSON: this.arrayBufferToBase64(assertion.response.clientDataJSON),
              authenticatorData: this.arrayBufferToBase64(assertion.response.authenticatorData),
              signature: this.arrayBufferToBase64(assertion.response.signature),
              userHandle: assertion.response.userHandle 
                ? this.arrayBufferToBase64(assertion.response.userHandle) 
                : null
            }
          }
        })
      });

      const result = await verifyResponse.json();

      if (result.success) {
        console.log('✅ Biometric authentication successful');
        this.trackUsage('biometric_auth_success');
        return {
          success: true,
          token: result.token,
          user: result.user
        };
      } else {
        console.log('❌ Biometric authentication failed');
        this.trackUsage('biometric_auth_failed');
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('❌ Biometric authentication error:', error);
      this.trackUsage('biometric_auth_error');
      
      // 사용자가 취소한 경우
      if (error.name === 'NotAllowedError') {
        return { success: false, message: 'Authentication cancelled' };
      }
      
      throw error;
    }
  }

  async disable() {
    console.log('🔓 Disabling biometric authentication...');

    try {
      const response = await fetch('/api/auth/biometric/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.enabled = false;
        this.saveSettings();
        console.log('✅ Biometric authentication disabled');
        this.trackUsage('biometric_disabled');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Failed to disable biometric:', error);
      return false;
    }
  }

  isSupported() {
    return this.supported;
  }

  isEnabled() {
    return this.enabled;
  }

  getAvailableMethods() {
    return this.availableMethods;
  }

  // Utility functions
  base64ToArrayBuffer(base64) {
    const binary = atob(base64.replace(/-/g, '+').replace(/_/g, '/'));
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }
    return bytes.buffer;
  }

  arrayBufferToBase64(buffer) {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  loadSettings() {
    try {
      const settings = localStorage.getItem('biometric_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load biometric settings');
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('biometric_settings', JSON.stringify({
        enabled: this.enabled,
        lastUsed: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('⚠️ Failed to save biometric settings');
    }
  }

  showMessage(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);

    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  trackUsage(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'biometric_usage', {
        event_category: 'Security',
        action: action,
        available_methods: this.availableMethods.join(', '),
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.BiometricAuth = BiometricAuth;
window.biometricAuth = null;

// 초기화 함수
window.initBiometric = function() {
  if (!window.biometricAuth) {
    window.biometricAuth = new BiometricAuth();
    console.log('✅ Biometric Authentication initialized');
  }
  return window.biometricAuth;
};

// 편의 함수
window.registerBiometric = async function() {
  if (!window.biometricAuth) window.initBiometric();
  return await window.biometricAuth.register();
};

window.authenticateBiometric = async function() {
  if (!window.biometricAuth) window.initBiometric();
  return await window.biometricAuth.authenticate();
};

console.log('📦 Biometric Authentication module loaded');
