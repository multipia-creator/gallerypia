/**
 * GALLERYPIA - Two-Factor Authentication System
 * Phase 13: Advanced Security & Authentication
 * Google Authenticator, SMS, Email 2FA
 */

class TwoFactorAuth {
  constructor() {
    this.methods = ['authenticator', 'sms', 'email'];
    this.enabled = false;
    this.currentMethod = null;
    this.init();
  }

  init() {
    console.log('🔐 Two-Factor Authentication initializing...');
    this.loadUserSettings();
  }

  async enable2FA(method = 'authenticator') {
    console.log(`🔐 Enabling 2FA with ${method}...`);

    if (!this.methods.includes(method)) {
      throw new Error('Invalid 2FA method');
    }

    try {
      const response = await fetch('/api/auth/2fa/enable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: method })
      });

      const result = await response.json();

      if (result.success) {
        this.enabled = true;
        this.currentMethod = method;

        if (method === 'authenticator') {
          return {
            secret: result.secret,
            qr_code: result.qr_code,
            backup_codes: result.backup_codes
          };
        } else {
          return {
            verification_sent: true,
            backup_codes: result.backup_codes
          };
        }
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ 2FA enable failed:', error);
      throw error;
    }
  }

  async setupAuthenticator() {
    console.log('📱 Setting up Google Authenticator...');

    try {
      const setup = await this.enable2FA('authenticator');

      // QR 코드 표시
      this.displayQRCode(setup.qr_code, setup.secret);

      // 백업 코드 저장
      this.saveBackupCodes(setup.backup_codes);

      console.log('✅ Authenticator setup initiated');
      return setup;
    } catch (error) {
      console.error('❌ Authenticator setup failed:', error);
      throw error;
    }
  }

  displayQRCode(qrCodeUrl, secret) {
    const modal = document.createElement('div');
    modal.className = 'auth-modal';
    modal.innerHTML = `
      <div class="auth-modal-content">
        <h2>🔐 Setup Google Authenticator</h2>
        
        <div class="qr-code-container">
          <img src="${qrCodeUrl}" alt="QR Code" />
        </div>
        
        <div class="manual-entry">
          <p>Or enter this code manually:</p>
          <code class="secret-code">${secret}</code>
          <button onclick="navigator.clipboard.writeText('${secret}')">
            Copy Code
          </button>
        </div>
        
        <div class="instructions">
          <h3>Instructions:</h3>
          <ol>
            <li>Download Google Authenticator app</li>
            <li>Scan the QR code above</li>
            <li>Enter the 6-digit code below to verify</li>
          </ol>
        </div>
        
        <div class="verify-section">
          <input type="text" id="verify-code" placeholder="Enter 6-digit code" maxlength="6" />
          <button onclick="window.twoFactorAuth.verify2FASetup(document.getElementById('verify-code').value)">
            Verify & Enable
          </button>
        </div>
        
        <button class="close-btn" onclick="this.parentElement.parentElement.remove()">
          Cancel
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  async verify2FASetup(code) {
    console.log('🔍 Verifying 2FA setup...');

    try {
      const response = await fetch('/api/auth/2fa/verify-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ 2FA verified and enabled');
        this.enabled = true;
        this.saveUserSettings();

        // 모달 닫기
        document.querySelector('.auth-modal')?.remove();

        // 성공 메시지
        this.showMessage('2FA successfully enabled!', 'success');

        this.trackUsage('2fa_enabled', { method: this.currentMethod });
        return true;
      } else {
        this.showMessage('Invalid code. Please try again.', 'error');
        return false;
      }
    } catch (error) {
      console.error('❌ Verification failed:', error);
      this.showMessage('Verification failed', 'error');
      return false;
    }
  }

  async setupSMS(phoneNumber) {
    console.log('📱 Setting up SMS 2FA...');

    try {
      const response = await fetch('/api/auth/2fa/setup-sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: phoneNumber })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ SMS sent for verification');
        return {
          verification_sent: true,
          masked_phone: result.masked_phone
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ SMS setup failed:', error);
      throw error;
    }
  }

  async setupEmail() {
    console.log('📧 Setting up Email 2FA...');

    try {
      const response = await fetch('/api/auth/2fa/setup-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Email sent for verification');
        return {
          verification_sent: true,
          masked_email: result.masked_email
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Email setup failed:', error);
      throw error;
    }
  }

  async verify2FA(code) {
    console.log('🔐 Verifying 2FA code...');

    try {
      const response = await fetch('/api/auth/2fa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          code: code,
          method: this.currentMethod 
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ 2FA verified');
        this.trackUsage('2fa_verified');
        return true;
      } else {
        console.log('❌ Invalid 2FA code');
        return false;
      }
    } catch (error) {
      console.error('❌ 2FA verification error:', error);
      return false;
    }
  }

  async disable2FA() {
    console.log('🔓 Disabling 2FA...');

    try {
      const response = await fetch('/api/auth/2fa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.enabled = false;
        this.currentMethod = null;
        this.saveUserSettings();

        console.log('✅ 2FA disabled');
        this.trackUsage('2fa_disabled');
        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Failed to disable 2FA:', error);
      return false;
    }
  }

  async generateBackupCodes() {
    console.log('🔑 Generating backup codes...');

    try {
      const response = await fetch('/api/auth/2fa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.saveBackupCodes(result.backup_codes);
        console.log('✅ Backup codes generated');
        return result.backup_codes;
      }
    } catch (error) {
      console.error('❌ Failed to generate backup codes:', error);
    }

    return [];
  }

  saveBackupCodes(codes) {
    const modal = document.createElement('div');
    modal.className = 'backup-codes-modal';
    modal.innerHTML = `
      <div class="backup-codes-content">
        <h2>🔑 Backup Codes</h2>
        <p class="warning">⚠️ Save these codes in a safe place. Each can only be used once.</p>
        
        <div class="codes-list">
          ${codes.map(code => `<code>${code}</code>`).join('')}
        </div>
        
        <div class="actions">
          <button onclick="window.twoFactorAuth.downloadBackupCodes(${JSON.stringify(codes)})">
            📥 Download
          </button>
          <button onclick="window.twoFactorAuth.printBackupCodes()">
            🖨️ Print
          </button>
          <button onclick="navigator.clipboard.writeText('${codes.join('\\n')}'); alert('Copied!')">
            📋 Copy All
          </button>
        </div>
        
        <button class="confirm-btn" onclick="this.parentElement.parentElement.remove()">
          I've Saved These Codes
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }

  downloadBackupCodes(codes) {
    const content = `GALLERYPIA Backup Codes\n\n${codes.join('\n')}\n\nKeep these codes safe!`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'gallerypia-backup-codes.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  printBackupCodes() {
    window.print();
  }

  async useBackupCode(code) {
    console.log('🔑 Using backup code...');

    try {
      const response = await fetch('/api/auth/2fa/use-backup-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ backup_code: code })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Backup code accepted');
        return true;
      }
    } catch (error) {
      console.error('❌ Invalid backup code:', error);
    }

    return false;
  }

  is2FAEnabled() {
    return this.enabled;
  }

  get2FAMethod() {
    return this.currentMethod;
  }

  loadUserSettings() {
    try {
      const settings = localStorage.getItem('2fa_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.enabled = parsed.enabled;
        this.currentMethod = parsed.method;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load 2FA settings');
    }
  }

  saveUserSettings() {
    try {
      localStorage.setItem('2fa_settings', JSON.stringify({
        enabled: this.enabled,
        method: this.currentMethod
      }));
    } catch (error) {
      console.warn('⚠️ Failed to save 2FA settings');
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
      window.gtag('event', '2fa_usage', {
        event_category: 'Security',
        action: action,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.TwoFactorAuth = TwoFactorAuth;
window.twoFactorAuth = null;

// 초기화 함수
window.init2FA = function() {
  if (!window.twoFactorAuth) {
    window.twoFactorAuth = new TwoFactorAuth();
    console.log('✅ Two-Factor Authentication initialized');
  }
  return window.twoFactorAuth;
};

// 편의 함수
window.enable2FA = async function(method = 'authenticator') {
  if (!window.twoFactorAuth) window.init2FA();
  return await window.twoFactorAuth.enable2FA(method);
};

window.verify2FA = async function(code) {
  if (!window.twoFactorAuth) window.init2FA();
  return await window.twoFactorAuth.verify2FA(code);
};

console.log('📦 Two-Factor Authentication module loaded');
