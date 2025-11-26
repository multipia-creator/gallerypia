/**
 * GALLERYPIA - Wallet Security System
 * Phase 13: Hardware Wallet & Multi-sig Support
 */

class WalletSecurity {
  constructor() {
    this.hardwareWallets = ['ledger', 'trezor'];
    this.multiSigWallets = new Map();
    this.init();
  }

  init() {
    console.log('🔐 Wallet Security initializing...');
  }

  async connectHardwareWallet(type = 'ledger') {
    console.log(`🔐 Connecting to ${type}...`);
    try {
      const response = await fetch('/api/wallet/hardware-connect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ wallet_type: type })
      });
      const result = await response.json();
      if (result.success) {
        console.log('✅ Hardware wallet connected');
        this.trackUsage('hardware_wallet_connected', { type });
        return { address: result.address, type: type };
      }
    } catch (error) {
      console.error('❌ Hardware wallet connection failed:', error);
    }
    return null;
  }

  async createMultiSigWallet(owners, requiredSignatures) {
    console.log(`🔐 Creating multi-sig wallet (${requiredSignatures}/${owners.length})...`);
    try {
      const response = await fetch('/api/wallet/multisig-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ owners, required_signatures: requiredSignatures })
      });
      const result = await response.json();
      if (result.success) {
        this.multiSigWallets.set(result.wallet_address, {
          owners, requiredSignatures, address: result.wallet_address
        });
        console.log('✅ Multi-sig wallet created');
        return result;
      }
    } catch (error) {
      console.error('❌ Multi-sig creation failed:', error);
    }
    return null;
  }

  trackUsage(action, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'wallet_security_usage', {
        event_category: 'Security',
        action, ...data
      });
    }
  }
}

window.WalletSecurity = WalletSecurity;
window.walletSecurity = null;

window.initWalletSecurity = function() {
  if (!window.walletSecurity) {
    window.walletSecurity = new WalletSecurity();
    console.log('✅ Wallet Security initialized');
  }
  return window.walletSecurity;
};

console.log('📦 Wallet Security module loaded');
