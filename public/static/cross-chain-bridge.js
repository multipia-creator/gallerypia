/**
 * GALLERYPIA - Cross-Chain Bridge
 * Phase 11: Blockchain Expansion
 * Unified Bridge for NFTs & Assets
 */

class CrossChainBridge {
  constructor() {
    this.supportedBridges = this.initializeBridges();
    this.pendingTransfers = new Map();
    this.init();
  }

  init() {
    console.log('🌉 Cross-Chain Bridge initializing...');
    this.loadPendingTransfers();
  }

  initializeBridges() {
    return {
      'eth-polygon': {
        name: 'Ethereum ↔ Polygon',
        protocols: ['PoS Bridge', 'Plasma Bridge'],
        nftSupport: true,
        fee: '0.001 ETH',
        time: '7-8 minutes'
      },
      'eth-arbitrum': {
        name: 'Ethereum ↔ Arbitrum',
        protocols: ['Arbitrum Bridge'],
        nftSupport: true,
        fee: 'Gas only',
        time: '10-15 minutes (deposit), 7 days (withdraw)'
      },
      'polygon-bsc': {
        name: 'Polygon ↔ BSC',
        protocols: ['Multichain', 'cBridge'],
        nftSupport: true,
        fee: '0.01 MATIC',
        time: '5-10 minutes'
      },
      'eth-solana': {
        name: 'Ethereum ↔ Solana',
        protocols: ['Wormhole', 'Allbridge'],
        nftSupport: true,
        fee: '0.002 ETH + 0.001 SOL',
        time: '15-20 minutes'
      }
    };
  }

  async bridgeNFT(nftData, fromChain, toChain) {
    console.log(`🌉 Bridging NFT from ${fromChain} to ${toChain}...`);

    const bridgeKey = this.getBridgeKey(fromChain, toChain);
    const bridge = this.supportedBridges[bridgeKey];

    if (!bridge) {
      throw new Error(`Bridge from ${fromChain} to ${toChain} not supported`);
    }

    if (!bridge.nftSupport) {
      throw new Error('NFT bridging not supported on this route');
    }

    const transferId = this.generateTransferId();

    try {
      // 1. Lock NFT on source chain
      const lockResult = await this.lockNFT(nftData, fromChain);

      // 2. Initiate bridge transfer
      const response = await fetch('/api/bridge/nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          transfer_id: transferId,
          nft: nftData,
          from_chain: fromChain,
          to_chain: toChain,
          lock_tx: lockResult.transaction_hash
        })
      });

      const result = await response.json();

      if (result.success) {
        // 3. Track pending transfer
        this.addPendingTransfer({
          id: transferId,
          nft: nftData,
          from: fromChain,
          to: toChain,
          status: 'pending',
          lock_tx: lockResult.transaction_hash,
          started_at: Date.now()
        });

        console.log('✅ NFT bridge initiated');
        console.log('Transfer ID:', transferId);

        this.trackUsage('nft_bridge', {
          from: fromChain,
          to: toChain,
          nft_id: nftData.id
        });

        return {
          transfer_id: transferId,
          estimated_time: bridge.time,
          fee: bridge.fee
        };
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ NFT bridging failed:', error);
      throw error;
    }
  }

  async lockNFT(nftData, chain) {
    console.log(`🔒 Locking NFT on ${chain}...`);

    try {
      const response = await fetch('/api/bridge/lock-nft', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nft_id: nftData.id,
          token_id: nftData.token_id,
          contract_address: nftData.contract_address,
          chain: chain
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ NFT locked');
        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ NFT locking failed:', error);
      throw error;
    }
  }

  async claimNFT(transferId) {
    console.log(`📥 Claiming NFT (Transfer: ${transferId})...`);

    const transfer = this.pendingTransfers.get(transferId);
    if (!transfer) {
      throw new Error('Transfer not found');
    }

    try {
      const response = await fetch(`/api/bridge/claim/${transferId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        // Update transfer status
        transfer.status = 'completed';
        transfer.claim_tx = result.transaction_hash;
        transfer.completed_at = Date.now();

        this.pendingTransfers.set(transferId, transfer);
        this.savePendingTransfers();

        console.log('✅ NFT claimed successfully');
        console.log('New token ID:', result.new_token_id);

        this.trackUsage('nft_claim', {
          transfer_id: transferId
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ NFT claim failed:', error);
      throw error;
    }
  }

  async getTransferStatus(transferId) {
    console.log(`🔍 Checking transfer status: ${transferId}...`);

    try {
      const response = await fetch(`/api/bridge/status/${transferId}`);
      const result = await response.json();

      if (result.success) {
        const transfer = this.pendingTransfers.get(transferId);
        if (transfer) {
          transfer.status = result.status;
          transfer.progress = result.progress;
          this.pendingTransfers.set(transferId, transfer);
        }

        return {
          status: result.status, // pending, processing, ready, completed, failed
          progress: result.progress, // 0-100
          current_step: result.current_step,
          estimated_completion: result.estimated_completion,
          can_claim: result.status === 'ready'
        };
      }
    } catch (error) {
      console.error('❌ Status check failed:', error);
    }

    return null;
  }

  async estimateBridgeCost(fromChain, toChain, assetType = 'nft') {
    const bridgeKey = this.getBridgeKey(fromChain, toChain);
    const bridge = this.supportedBridges[bridgeKey];

    if (!bridge) {
      return null;
    }

    // 실제로는 API 호출
    return {
      protocol_fee: bridge.fee,
      gas_fee: '0.001 ETH (estimated)',
      total: bridge.fee,
      estimated_time: bridge.time
    };
  }

  getPendingTransfers() {
    return Array.from(this.pendingTransfers.values());
  }

  getActiveTransfers() {
    return this.getPendingTransfers().filter(t => 
      t.status === 'pending' || t.status === 'processing'
    );
  }

  getCompletedTransfers() {
    return this.getPendingTransfers().filter(t => 
      t.status === 'completed'
    );
  }

  addPendingTransfer(transfer) {
    this.pendingTransfers.set(transfer.id, transfer);
    this.savePendingTransfers();
  }

  savePendingTransfers() {
    try {
      const transfers = Array.from(this.pendingTransfers.entries());
      localStorage.setItem('pending_bridge_transfers', JSON.stringify(transfers));
    } catch (error) {
      console.warn('⚠️ Failed to save pending transfers');
    }
  }

  loadPendingTransfers() {
    try {
      const stored = localStorage.getItem('pending_bridge_transfers');
      if (stored) {
        const transfers = JSON.parse(stored);
        this.pendingTransfers = new Map(transfers);
        console.log(`📥 Loaded ${this.pendingTransfers.size} pending transfers`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load pending transfers');
    }
  }

  getBridgeKey(fromChain, toChain) {
    const key1 = `${fromChain}-${toChain}`;
    const key2 = `${toChain}-${fromChain}`;
    
    return this.supportedBridges[key1] ? key1 : 
           this.supportedBridges[key2] ? key2 : null;
  }

  getSupportedRoutes() {
    return Object.keys(this.supportedBridges).map(key => {
      const [from, to] = key.split('-');
      return {
        key: key,
        from: from,
        to: to,
        ...this.supportedBridges[key]
      };
    });
  }

  isRouteSupported(fromChain, toChain) {
    return !!this.getBridgeKey(fromChain, toChain);
  }

  generateTransferId() {
    return `bridge_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'cross_chain_bridge_usage', {
        event_category: 'Blockchain',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.CrossChainBridge = CrossChainBridge;
window.bridge = null;

// 초기화 함수
window.initBridge = function() {
  if (!window.bridge) {
    window.bridge = new CrossChainBridge();
    console.log('✅ Cross-Chain Bridge initialized');
  }
  return window.bridge;
};

// 편의 함수
window.bridgeNFTAcrossChains = async function(nftData, fromChain, toChain) {
  if (!window.bridge) window.initBridge();
  return await window.bridge.bridgeNFT(nftData, fromChain, toChain);
};

window.claimBridgedNFT = async function(transferId) {
  if (!window.bridge) window.initBridge();
  return await window.bridge.claimNFT(transferId);
};

console.log('📦 Cross-Chain Bridge module loaded');
