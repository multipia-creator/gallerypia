/**
 * GALLERYPIA - Layer 2 Integration
 * Phase 11: Blockchain Expansion
 * Arbitrum, Optimism, zkSync Support
 */

class Layer2Integration {
  constructor() {
    this.layer2Networks = this.initializeLayer2Networks();
    this.currentL2 = null;
    this.init();
  }

  init() {
    console.log('🚀 Layer 2 Integration initializing...');
  }

  initializeLayer2Networks() {
    return {
      arbitrum: {
        id: 42161,
        name: 'Arbitrum One',
        symbol: 'ETH',
        rpc: 'https://arb1.arbitrum.io/rpc',
        explorer: 'https://arbiscan.io',
        bridge: 'https://bridge.arbitrum.io',
        type: 'Optimistic Rollup',
        icon: '🔵',
        estimatedSavings: '90-95%',
        withdrawalTime: '7 days'
      },
      optimism: {
        id: 10,
        name: 'Optimism',
        symbol: 'ETH',
        rpc: 'https://mainnet.optimism.io',
        explorer: 'https://optimistic.etherscan.io',
        bridge: 'https://app.optimism.io/bridge',
        type: 'Optimistic Rollup',
        icon: '🔴',
        estimatedSavings: '90-95%',
        withdrawalTime: '7 days'
      },
      zksync: {
        id: 324,
        name: 'zkSync Era',
        symbol: 'ETH',
        rpc: 'https://mainnet.era.zksync.io',
        explorer: 'https://explorer.zksync.io',
        bridge: 'https://bridge.zksync.io',
        type: 'zkRollup',
        icon: '⚡',
        estimatedSavings: '95-99%',
        withdrawalTime: '1-3 hours'
      },
      base: {
        id: 8453,
        name: 'Base',
        symbol: 'ETH',
        rpc: 'https://mainnet.base.org',
        explorer: 'https://basescan.org',
        bridge: 'https://bridge.base.org',
        type: 'Optimistic Rollup',
        icon: '🟦',
        estimatedSavings: '90-95%',
        withdrawalTime: '7 days'
      }
    };
  }

  async switchToL2(l2Key) {
    console.log(`🚀 Switching to ${l2Key}...`);

    const l2 = this.layer2Networks[l2Key];
    if (!l2) {
      throw new Error(`L2 network "${l2Key}" not supported`);
    }

    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${l2.id.toString(16)}` }],
      });

      this.currentL2 = l2;
      console.log(`✅ Switched to ${l2.name}`);
      this.trackUsage('l2_switch', { network: l2.name });

      return true;
    } catch (error) {
      if (error.code === 4902) {
        return await this.addL2Network(l2);
      }
      throw error;
    }
  }

  async addL2Network(l2) {
    console.log(`➕ Adding ${l2.name} to wallet...`);

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${l2.id.toString(16)}`,
          chainName: l2.name,
          nativeCurrency: {
            name: 'Ether',
            symbol: 'ETH',
            decimals: 18
          },
          rpcUrls: [l2.rpc],
          blockExplorerUrls: [l2.explorer]
        }]
      });

      this.currentL2 = l2;
      console.log(`✅ ${l2.name} added successfully`);
      return true;
    } catch (error) {
      console.error('❌ Failed to add L2 network:', error);
      throw error;
    }
  }

  async bridgeToL2(l2Key, amount) {
    console.log(`🌉 Bridging ${amount} ETH to ${l2Key}...`);

    const l2 = this.layer2Networks[l2Key];
    if (!l2) {
      throw new Error('L2 network not found');
    }

    try {
      const response = await fetch('/api/bridge/deposit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l2_network: l2Key,
          amount: amount,
          from_address: window.ethereum.selectedAddress
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Bridge deposit initiated');
        console.log('TX:', result.transaction_hash);
        console.log('Estimated arrival:', result.estimated_time);

        this.trackUsage('bridge_deposit', {
          network: l2.name,
          amount: amount
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Bridge deposit failed:', error);
      throw error;
    }
  }

  async bridgeFromL2(l2Key, amount) {
    console.log(`🌉 Withdrawing ${amount} ETH from ${l2Key}...`);

    const l2 = this.layer2Networks[l2Key];
    if (!l2) {
      throw new Error('L2 network not found');
    }

    try {
      const response = await fetch('/api/bridge/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l2_network: l2Key,
          amount: amount,
          to_address: window.ethereum.selectedAddress
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Withdrawal initiated');
        console.log('Challenge period:', l2.withdrawalTime);
        console.log('TX:', result.transaction_hash);

        this.trackUsage('bridge_withdraw', {
          network: l2.name,
          amount: amount
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Withdrawal failed:', error);
      throw error;
    }
  }

  async mintNFTonL2(artworkData, l2Key) {
    console.log(`🎨 Minting NFT on ${l2Key}...`);

    const l2 = this.layer2Networks[l2Key];
    if (!l2) {
      throw new Error('L2 network not supported');
    }

    try {
      const response = await fetch('/api/nft/mint-l2', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          l2_network: l2Key,
          artwork: artworkData
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ NFT minted on L2');
        console.log('Token ID:', result.token_id);
        console.log('Gas saved:', result.gas_savings);

        this.trackUsage('nft_mint_l2', {
          network: l2.name,
          token_id: result.token_id,
          savings: result.gas_savings
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ L2 minting failed:', error);
      throw error;
    }
  }

  async compareGasCosts(transactionType = 'mint') {
    console.log('💰 Comparing gas costs across networks...');

    const estimates = {
      ethereum: {
        mint: { gas: 150000, gasPrice: 50, cost: 0.0075, currency: 'ETH' },
        transfer: { gas: 65000, gasPrice: 50, cost: 0.00325, currency: 'ETH' }
      },
      arbitrum: {
        mint: { gas: 150000, gasPrice: 0.1, cost: 0.000015, currency: 'ETH' },
        transfer: { gas: 65000, gasPrice: 0.1, cost: 0.0000065, currency: 'ETH' }
      },
      optimism: {
        mint: { gas: 150000, gasPrice: 0.001, cost: 0.00015, currency: 'ETH' },
        transfer: { gas: 65000, gasPrice: 0.001, cost: 0.000065, currency: 'ETH' }
      },
      zksync: {
        mint: { gas: 150000, gasPrice: 0.01, cost: 0.0015, currency: 'ETH' },
        transfer: { gas: 65000, gasPrice: 0.01, cost: 0.00065, currency: 'ETH' }
      },
      base: {
        mint: { gas: 150000, gasPrice: 0.001, cost: 0.00015, currency: 'ETH' },
        transfer: { gas: 65000, gasPrice: 0.001, cost: 0.000065, currency: 'ETH' }
      }
    };

    return Object.keys(estimates).map(network => ({
      network: network,
      ...estimates[network][transactionType],
      savings: network !== 'ethereum' ? 
        ((estimates.ethereum[transactionType].cost - estimates[network][transactionType].cost) / estimates.ethereum[transactionType].cost * 100).toFixed(2) + '%' : 
        '0%'
    }));
  }

  async getBridgeStatus(transactionHash, l2Key) {
    console.log('🔍 Checking bridge status...');

    try {
      const response = await fetch(`/api/bridge/status/${transactionHash}?network=${l2Key}`);
      const result = await response.json();

      if (result.success) {
        return {
          status: result.status, // pending, confirmed, completed, failed
          confirmations: result.confirmations,
          estimated_completion: result.estimated_completion,
          current_step: result.current_step
        };
      }
    } catch (error) {
      console.error('❌ Status check failed:', error);
    }

    return null;
  }

  getL2Info(l2Key) {
    return this.layer2Networks[l2Key] || null;
  }

  getAllL2Networks() {
    return Object.keys(this.layer2Networks).map(key => ({
      key: key,
      ...this.layer2Networks[key]
    }));
  }

  getRecommendedL2(criteria = 'cost') {
    // criteria: 'cost', 'speed', 'security'
    const recommendations = {
      cost: 'zksync',      // 가장 저렴
      speed: 'zksync',     // 가장 빠른 출금
      security: 'zksync',  // zkRollup 보안
      popular: 'arbitrum'  // 가장 인기
    };

    return recommendations[criteria] || 'arbitrum';
  }

  async estimateBridgeTime(l2Key, direction = 'deposit') {
    const l2 = this.layer2Networks[l2Key];
    if (!l2) return null;

    if (direction === 'deposit') {
      return '10-15 minutes'; // L1 → L2
    } else {
      return l2.withdrawalTime; // L2 → L1
    }
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'layer2_usage', {
        event_category: 'Blockchain',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.Layer2Integration = Layer2Integration;
window.layer2 = null;

// 초기화 함수
window.initLayer2 = function() {
  if (!window.layer2) {
    window.layer2 = new Layer2Integration();
    console.log('✅ Layer 2 Integration initialized');
  }
  return window.layer2;
};

// 편의 함수
window.switchToLayer2 = async function(l2Key) {
  if (!window.layer2) window.initLayer2();
  return await window.layer2.switchToL2(l2Key);
};

window.bridgeETH = async function(l2Key, amount, direction = 'deposit') {
  if (!window.layer2) window.initLayer2();
  return direction === 'deposit' ?
    await window.layer2.bridgeToL2(l2Key, amount) :
    await window.layer2.bridgeFromL2(l2Key, amount);
};

console.log('📦 Layer 2 Integration module loaded');
