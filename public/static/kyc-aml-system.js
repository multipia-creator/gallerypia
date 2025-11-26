/**
 * GALLERYPIA - KYC/AML System
 * Phase 13: Advanced Security
 * Know Your Customer & Anti-Money Laundering
 */

class KYCAMLSystem {
  constructor() {
    this.verificationLevels = ['basic', 'advanced', 'premium'];
    this.currentLevel = 'none';
    this.status = 'unverified';
    this.init();
  }

  init() {
    console.log('🔍 KYC/AML System initializing...');
    this.loadVerificationStatus();
  }

  async startVerification(level = 'basic') {
    console.log(`🔍 Starting ${level} verification...`);

    const requirements = this.getRequirements(level);
    
    try {
      const response = await fetch('/api/kyc/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ verification_level: level })
      });

      const result = await response.json();

      if (result.success) {
        this.status = 'pending';
        console.log('✅ Verification started');
        return {
          session_id: result.session_id,
          requirements: requirements,
          upload_url: result.upload_url
        };
      }
    } catch (error) {
      console.error('❌ Verification start failed:', error);
      throw error;
    }
  }

  getRequirements(level) {
    const requirements = {
      basic: {
        documents: ['Government ID'],
        personal_info: ['Full Name', 'Date of Birth', 'Address'],
        estimated_time: '2-5 minutes'
      },
      advanced: {
        documents: ['Government ID', 'Proof of Address'],
        personal_info: ['Full Name', 'Date of Birth', 'Address', 'Phone Number'],
        selfie: true,
        estimated_time: '5-10 minutes'
      },
      premium: {
        documents: ['Government ID', 'Proof of Address', 'Source of Funds'],
        personal_info: ['Full Name', 'Date of Birth', 'Address', 'Phone Number', 'Occupation'],
        selfie: true,
        video_verification: true,
        estimated_time: '10-15 minutes'
      }
    };

    return requirements[level] || requirements.basic;
  }

  async uploadDocument(sessionId, documentType, file) {
    console.log(`📄 Uploading ${documentType}...`);

    const formData = new FormData();
    formData.append('session_id', sessionId);
    formData.append('document_type', documentType);
    formData.append('file', file);

    try {
      const response = await fetch('/api/kyc/upload-document', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Document uploaded');
        this.trackUsage('document_uploaded', { type: documentType });
        return result;
      }
    } catch (error) {
      console.error('❌ Upload failed:', error);
      throw error;
    }
  }

  async submitPersonalInfo(sessionId, personalData) {
    console.log('📝 Submitting personal information...');

    try {
      const response = await fetch('/api/kyc/submit-info', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          ...personalData
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Personal info submitted');
        return result;
      }
    } catch (error) {
      console.error('❌ Submission failed:', error);
      throw error;
    }
  }

  async checkVerificationStatus(sessionId) {
    console.log('🔍 Checking verification status...');

    try {
      const response = await fetch(`/api/kyc/status/${sessionId}`);
      const result = await response.json();

      if (result.success) {
        this.status = result.status;
        this.currentLevel = result.level;
        this.saveVerificationStatus();

        return {
          status: result.status, // pending, approved, rejected, review
          level: result.level,
          message: result.message,
          rejection_reason: result.rejection_reason
        };
      }
    } catch (error) {
      console.error('❌ Status check failed:', error);
    }

    return null;
  }

  async performAMLCheck(transactionData) {
    console.log('🔍 Performing AML check...');

    try {
      const response = await fetch('/api/aml/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(transactionData)
      });

      const result = await response.json();

      if (result.success) {
        return {
          risk_score: result.risk_score, // 0-100
          risk_level: result.risk_level, // low, medium, high
          flags: result.flags,
          approved: result.approved
        };
      }
    } catch (error) {
      console.error('❌ AML check failed:', error);
    }

    return { risk_level: 'unknown', approved: false };
  }

  isVerified(requiredLevel = 'basic') {
    const levels = { none: 0, basic: 1, advanced: 2, premium: 3 };
    return levels[this.currentLevel] >= levels[requiredLevel] && this.status === 'approved';
  }

  getVerificationStatus() {
    return {
      level: this.currentLevel,
      status: this.status,
      verified: this.status === 'approved'
    };
  }

  loadVerificationStatus() {
    try {
      const stored = localStorage.getItem('kyc_status');
      if (stored) {
        const parsed = JSON.parse(stored);
        this.currentLevel = parsed.level || 'none';
        this.status = parsed.status || 'unverified';
      }
    } catch (error) {
      console.warn('⚠️ Failed to load KYC status');
    }
  }

  saveVerificationStatus() {
    try {
      localStorage.setItem('kyc_status', JSON.stringify({
        level: this.currentLevel,
        status: this.status
      }));
    } catch (error) {
      console.warn('⚠️ Failed to save KYC status');
    }
  }

  trackUsage(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'kyc_aml_usage', {
        event_category: 'Security',
        action: action,
        ...data
      });
    }
  }
}

window.KYCAMLSystem = KYCAMLSystem;
window.kycAml = null;

window.initKYC = function() {
  if (!window.kycAml) {
    window.kycAml = new KYCAMLSystem();
    console.log('✅ KYC/AML System initialized');
  }
  return window.kycAml;
};

console.log('📦 KYC/AML System module loaded');
