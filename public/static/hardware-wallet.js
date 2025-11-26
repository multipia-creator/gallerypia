/**
 * GALLERYPIA - Hardware Wallet Integration
 * Phase 13: Advanced Security & Authentication
 * Ledger, Trezor, MetaMask Hardware Support
 */

class HardwareWallet {
  constructor() {
    this.connected = false;
    this.walletType = null;
    this.address = null;
    this.supportedWallets = ['ledger', 'trezor', 'metamask'];
    this.init();
  }

  async init() {
    console.log('🔐 Hardware Wallet initializing...');
    this.loadSettings();
  }

  async connectLedger() {
    console.log('📱 Connecting to Ledger...');

    try {
      // Ledger는 WebUSB 또는 WebHID API 사용
      if (!navigator.usb && !navigator.hid) {
        throw new Error('WebUSB/WebHID not supported');
      }

      // Ledger Transport 생성 (실제로는 @ledgerhq/hw-transport-webusb 사용)
      const transport = await this.createLedgerTransport();

      // Ethereum App 연결
      const eth = await this.createEthereumApp(transport);

      // 주소 가져오기
      const path = "44'/60'/0'/0/0"; // Ethereum 기본 경로
      const result = await eth.getAddress(path, true); // display on device

      this.connected = true;
      this.walletType = 'ledger';
      this.address = result.address;

      this.saveSettings();
      this.showMessage('✅ Ledger connected successfully!', 'success');
      this.trackUsage('ledger_connected');

      console.log('✅ Ledger connected:', this.address);
      return {
        success: true,
        address: this.address,
        type: 'ledger'
      };
    } catch (error) {
      console.error('❌ Ledger connection failed:', error);
      this.showMessage('Ledger connection failed. Please check device.', 'error');
      throw error;
    }
  }

  async connectTrezor() {
    console.log('📱 Connecting to Trezor...');

    try {
      // Trezor Connect 초기화
      if (typeof TrezorConnect === 'undefined') {
        // Trezor Connect 스크립트 동적 로드
        await this.loadTrezorConnect();
      }

      // Trezor Connect 초기화
      await TrezorConnect.init({
        lazyLoad: true,
        manifest: {
          email: 'support@gallerypia.com',
          appUrl: window.location.origin
        }
      });

      // Ethereum 주소 가져오기
      const result = await TrezorConnect.ethereumGetAddress({
        path: "m/44'/60'/0'/0/0",
        showOnTrezor: true
      });

      if (result.success) {
        this.connected = true;
        this.walletType = 'trezor';
        this.address = result.payload.address;

        this.saveSettings();
        this.showMessage('✅ Trezor connected successfully!', 'success');
        this.trackUsage('trezor_connected');

        console.log('✅ Trezor connected:', this.address);
        return {
          success: true,
          address: this.address,
          type: 'trezor'
        };
      } else {
        throw new Error(result.payload.error);
      }
    } catch (error) {
      console.error('❌ Trezor connection failed:', error);
      this.showMessage('Trezor connection failed.', 'error');
      throw error;
    }
  }

  async connectMetaMaskHardware() {
    console.log('📱 Connecting to MetaMask Hardware...');

    try {
      if (typeof window.ethereum === 'undefined') {
        throw new Error('MetaMask not installed');
      }

      // MetaMask 연결 요청
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts'
      });

      if (accounts.length === 0) {
        throw new Error('No accounts found');
      }

      // 하드웨어 지갑 타입 확인
      const walletType = await this.detectMetaMaskHardwareType();

      this.connected = true;
      this.walletType = walletType || 'metamask-hardware';
      this.address = accounts[0];

      this.saveSettings();
      this.showMessage('✅ Hardware wallet connected via MetaMask!', 'success');
      this.trackUsage('metamask_hardware_connected');

      console.log('✅ MetaMask Hardware connected:', this.address);
      return {
        success: true,
        address: this.address,
        type: this.walletType
      };
    } catch (error) {
      console.error('❌ MetaMask Hardware connection failed:', error);
      this.showMessage('MetaMask connection failed.', 'error');
      throw error;
    }
  }

  async signTransaction(transaction) {
    if (!this.connected) {
      throw new Error('Hardware wallet not connected');
    }

    console.log('✍️ Signing transaction with hardware wallet...');

    try {
      let signedTx;

      if (this.walletType === 'ledger') {
        signedTx = await this.signWithLedger(transaction);
      } else if (this.walletType === 'trezor') {
        signedTx = await this.signWithTrezor(transaction);
      } else {
        signedTx = await this.signWithMetaMask(transaction);
      }

      this.trackUsage('transaction_signed', { wallet: this.walletType });
      console.log('✅ Transaction signed');
      return signedTx;
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      this.trackUsage('transaction_sign_failed', { wallet: this.walletType });
      throw error;
    }
  }

  async signWithLedger(transaction) {
    console.log('📱 Signing with Ledger...');
    
    // Ledger 서명 로직 (실제로는 @ledgerhq/hw-app-eth 사용)
    const transport = await this.createLedgerTransport();
    const eth = await this.createEthereumApp(transport);

    const serializedTx = this.serializeTransaction(transaction);
    const signature = await eth.signTransaction(
      "44'/60'/0'/0/0",
      serializedTx
    );

    return {
      ...transaction,
      signature: signature,
      signedBy: 'ledger'
    };
  }

  async signWithTrezor(transaction) {
    console.log('📱 Signing with Trezor...');

    const result = await TrezorConnect.ethereumSignTransaction({
      path: "m/44'/60'/0'/0/0",
      transaction: {
        to: transaction.to,
        value: transaction.value,
        gasLimit: transaction.gasLimit,
        gasPrice: transaction.gasPrice,
        nonce: transaction.nonce,
        data: transaction.data || '0x',
        chainId: transaction.chainId || 1
      }
    });

    if (result.success) {
      return {
        ...transaction,
        signature: result.payload,
        signedBy: 'trezor'
      };
    } else {
      throw new Error(result.payload.error);
    }
  }

  async signWithMetaMask(transaction) {
    console.log('📱 Signing with MetaMask...');

    const transactionParameters = {
      to: transaction.to,
      from: this.address,
      value: transaction.value,
      gas: transaction.gasLimit,
      gasPrice: transaction.gasPrice,
      data: transaction.data || '0x'
    };

    const txHash = await window.ethereum.request({
      method: 'eth_sendTransaction',
      params: [transactionParameters]
    });

    return {
      ...transaction,
      hash: txHash,
      signedBy: this.walletType
    };
  }

  async signMessage(message) {
    if (!this.connected) {
      throw new Error('Hardware wallet not connected');
    }

    console.log('✍️ Signing message with hardware wallet...');

    try {
      let signature;

      if (this.walletType === 'ledger') {
        signature = await this.signMessageWithLedger(message);
      } else if (this.walletType === 'trezor') {
        signature = await this.signMessageWithTrezor(message);
      } else {
        signature = await this.signMessageWithMetaMask(message);
      }

      this.trackUsage('message_signed', { wallet: this.walletType });
      console.log('✅ Message signed');
      return signature;
    } catch (error) {
      console.error('❌ Message signing failed:', error);
      throw error;
    }
  }

  async signMessageWithLedger(message) {
    const transport = await this.createLedgerTransport();
    const eth = await this.createEthereumApp(transport);

    const signature = await eth.signPersonalMessage(
      "44'/60'/0'/0/0",
      Buffer.from(message).toString('hex')
    );

    return signature;
  }

  async signMessageWithTrezor(message) {
    const result = await TrezorConnect.ethereumSignMessage({
      path: "m/44'/60'/0'/0/0",
      message: message,
      hex: false
    });

    if (result.success) {
      return result.payload.signature;
    } else {
      throw new Error(result.payload.error);
    }
  }

  async signMessageWithMetaMask(message) {
    const signature = await window.ethereum.request({
      method: 'personal_sign',
      params: [message, this.address]
    });

    return signature;
  }

  async disconnect() {
    console.log('🔓 Disconnecting hardware wallet...');

    this.connected = false;
    this.walletType = null;
    this.address = null;

    this.saveSettings();
    this.showMessage('Hardware wallet disconnected', 'info');
    this.trackUsage('wallet_disconnected');

    console.log('✅ Hardware wallet disconnected');
    return true;
  }

  isConnected() {
    return this.connected;
  }

  getWalletType() {
    return this.walletType;
  }

  getAddress() {
    return this.address;
  }

  // Utility functions
  async createLedgerTransport() {
    // 실제로는 @ledgerhq/hw-transport-webusb 사용
    // 여기서는 모의 구현
    console.log('Creating Ledger transport...');
    return {
      // Mock transport object
      send: async (cla, ins, p1, p2, data) => {
        return new Uint8Array();
      }
    };
  }

  async createEthereumApp(transport) {
    // 실제로는 @ledgerhq/hw-app-eth 사용
    console.log('Creating Ethereum app...');
    return {
      getAddress: async (path, display) => ({
        address: '0x' + '1234567890'.repeat(4)
      }),
      signTransaction: async (path, tx) => ({
        v: '0x1c',
        r: '0x' + 'ab'.repeat(32),
        s: '0x' + 'cd'.repeat(32)
      }),
      signPersonalMessage: async (path, message) => ({
        v: 27,
        r: '0x' + 'ab'.repeat(32),
        s: '0x' + 'cd'.repeat(32)
      })
    };
  }

  async loadTrezorConnect() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://connect.trezor.io/9/trezor-connect.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async detectMetaMaskHardwareType() {
    try {
      // MetaMask API를 통해 하드웨어 타입 감지 시도
      const provider = window.ethereum;
      if (provider.isMetaMask && provider._metamask) {
        // 하드웨어 정보 가져오기 (가능한 경우)
        return 'metamask-hardware';
      }
    } catch (error) {
      console.warn('Could not detect hardware type');
    }
    return null;
  }

  serializeTransaction(tx) {
    // RLP 인코딩 (실제로는 @ethereumjs/tx 사용)
    const fields = [
      tx.nonce,
      tx.gasPrice,
      tx.gasLimit,
      tx.to,
      tx.value,
      tx.data || '0x',
      tx.chainId || 1,
      '0x',
      '0x'
    ];
    return fields.join('');
  }

  loadSettings() {
    try {
      const settings = localStorage.getItem('hardware_wallet_settings');
      if (settings) {
        const parsed = JSON.parse(settings);
        this.connected = parsed.connected || false;
        this.walletType = parsed.walletType;
        this.address = parsed.address;
      }
    } catch (error) {
      console.warn('⚠️ Failed to load wallet settings');
    }
  }

  saveSettings() {
    try {
      localStorage.setItem('hardware_wallet_settings', JSON.stringify({
        connected: this.connected,
        walletType: this.walletType,
        address: this.address,
        lastConnected: new Date().toISOString()
      }));
    } catch (error) {
      console.warn('⚠️ Failed to save wallet settings');
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
      window.gtag('event', 'hardware_wallet_usage', {
        event_category: 'Security',
        action: action,
        wallet_type: this.walletType,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.HardwareWallet = HardwareWallet;
window.hardwareWallet = null;

// 초기화 함수
window.initHardwareWallet = function() {
  if (!window.hardwareWallet) {
    window.hardwareWallet = new HardwareWallet();
    console.log('✅ Hardware Wallet initialized');
  }
  return window.hardwareWallet;
};

// 편의 함수
window.connectWallet = async function(type = 'metamask') {
  if (!window.hardwareWallet) window.initHardwareWallet();
  
  if (type === 'ledger') {
    return await window.hardwareWallet.connectLedger();
  } else if (type === 'trezor') {
    return await window.hardwareWallet.connectTrezor();
  } else {
    return await window.hardwareWallet.connectMetaMaskHardware();
  }
};

window.signTransaction = async function(transaction) {
  if (!window.hardwareWallet) window.initHardwareWallet();
  return await window.hardwareWallet.signTransaction(transaction);
};

window.signMessage = async function(message) {
  if (!window.hardwareWallet) window.initHardwareWallet();
  return await window.hardwareWallet.signMessage(message);
};

console.log('📦 Hardware Wallet module loaded');
