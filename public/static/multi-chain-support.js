/**
 * GALLERYPIA - Multi-Chain Support System
 * Phase 11: Blockchain Expansion
 * Polygon, Solana, and Multi-chain Integration
 */

class MultiChainSupport {
  constructor() {
    this.chains = this.initializeChains();
    this.currentChain = null;
    this.walletConnections = new Map();
    this.init();
  }

  init() {
    console.log('⛓️ Multi-Chain Support initializing...');
    this.detectInstalledWallets();
    this.loadUserPreference();
  }

  initializeChains() {
    return {
      ethereum: {
        id: 1,
        name: 'Ethereum Mainnet',
        symbol: 'ETH',
        rpc: 'https://mainnet.infura.io/v3/YOUR_KEY',
        explorer: 'https://etherscan.io',
        wallet: 'MetaMask',
        nftStandard: 'ERC-721',
        tokenStandard: 'ERC-20',
        icon: '🔷',
        gasEstimate: 'high'
      },
      polygon: {
        id: 137,
        name: 'Polygon',
        symbol: 'MATIC',
        rpc: 'https://polygon-rpc.com',
        explorer: 'https://polygonscan.com',
        wallet: 'MetaMask',
        nftStandard: 'ERC-721',
        tokenStandard: 'ERC-20',
        icon: '🟣',
        gasEstimate: 'low'
      },
      solana: {
        id: 'solana-mainnet',
        name: 'Solana',
        symbol: 'SOL',
        rpc: 'https://api.mainnet-beta.solana.com',
        explorer: 'https://explorer.solana.com',
        wallet: 'Phantom',
        nftStandard: 'Metaplex',
        tokenStandard: 'SPL',
        icon: '🌐',
        gasEstimate: 'very-low'
      },
      binance: {
        id: 56,
        name: 'BNB Smart Chain',
        symbol: 'BNB',
        rpc: 'https://bsc-dataseed.binance.org',
        explorer: 'https://bscscan.com',
        wallet: 'MetaMask',
        nftStandard: 'BEP-721',
        tokenStandard: 'BEP-20',
        icon: '🟡',
        gasEstimate: 'low'
      },
      avalanche: {
        id: 43114,
        name: 'Avalanche C-Chain',
        symbol: 'AVAX',
        rpc: 'https://api.avax.network/ext/bc/C/rpc',
        explorer: 'https://snowtrace.io',
        wallet: 'MetaMask',
        nftStandard: 'ERC-721',
        tokenStandard: 'ERC-20',
        icon: '🔺',
        gasEstimate: 'low'
      }
    };
  }

  detectInstalledWallets() {
    const wallets = {
      metamask: !!window.ethereum,
      phantom: !!window.solana,
      coinbase: !!window.coinbaseSolana || !!window.coinbaseWallet,
      walletconnect: true // 항상 사용 가능
    };

    console.log('👛 Detected wallets:', wallets);
    return wallets;
  }

  async switchChain(chainKey) {
    console.log(`⛓️ Switching to ${chainKey}...`);

    const chain = this.chains[chainKey];
    if (!chain) {
      throw new Error(`Chain "${chainKey}" not supported`);
    }

    try {
      if (chainKey === 'solana') {
        return await this.switchToSolana();
      } else {
        return await this.switchToEVM(chain);
      }
    } catch (error) {
      console.error('❌ Chain switch failed:', error);
      throw error;
    }
  }

  async switchToEVM(chain) {
    if (!window.ethereum) {
      throw new Error('MetaMask not installed');
    }

    try {
      // 체인 전환 시도
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: `0x${chain.id.toString(16)}` }],
      });

      this.currentChain = chain;
      console.log(`✅ Switched to ${chain.name}`);
      this.trackUsage('chain_switch', { chain: chain.name });

      return true;
    } catch (error) {
      // 체인이 추가되지 않은 경우
      if (error.code === 4902) {
        return await this.addEVMChain(chain);
      }
      throw error;
    }
  }

  async addEVMChain(chain) {
    console.log(`➕ Adding ${chain.name} to wallet...`);

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: `0x${chain.id.toString(16)}`,
          chainName: chain.name,
          nativeCurrency: {
            name: chain.symbol,
            symbol: chain.symbol,
            decimals: 18
          },
          rpcUrls: [chain.rpc],
          blockExplorerUrls: [chain.explorer]
        }]
      });

      this.currentChain = chain;
      console.log(`✅ ${chain.name} added and switched`);
      return true;
    } catch (error) {
      console.error('❌ Failed to add chain:', error);
      throw error;
    }
  }

  async switchToSolana() {
    if (!window.solana) {
      throw new Error('Phantom wallet not installed');
    }

    try {
      const response = await window.solana.connect();
      this.currentChain = this.chains.solana;
      
      console.log('✅ Connected to Solana');
      console.log('Wallet:', response.publicKey.toString());
      
      this.trackUsage('chain_switch', { chain: 'Solana' });
      return true;
    } catch (error) {
      console.error('❌ Solana connection failed:', error);
      throw error;
    }
  }

  async mintNFT(artworkData, chainKey) {
    console.log(`🎨 Minting NFT on ${chainKey}...`);

    const chain = this.chains[chainKey];
    if (!chain) {
      throw new Error('Chain not supported');
    }

    try {
      if (chainKey === 'solana') {
        return await this.mintOnSolana(artworkData);
      } else {
        return await this.mintOnEVM(artworkData, chain);
      }
    } catch (error) {
      console.error('❌ NFT minting failed:', error);
      throw error;
    }
  }

  async mintOnEVM(artworkData, chain) {
    console.log(`🎨 Minting ERC-721 on ${chain.name}...`);

    // 스마트 컨트랙트 주소 (체인별)
    const contractAddresses = {
      ethereum: '0x...', // 실제 컨트랙트 주소
      polygon: '0x...',
      binance: '0x...',
      avalanche: '0x...'
    };

    const contractAddress = contractAddresses[chain.id] || contractAddresses.ethereum;

    // Web3 사용 (실제 구현)
    try {
      const response = await fetch('/api/nft/mint', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          chain: chain.name,
          contract_address: contractAddress,
          artwork: artworkData,
          standard: chain.nftStandard
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ NFT minted successfully');
        console.log('Token ID:', result.token_id);
        console.log('TX:', result.transaction_hash);

        this.trackUsage('nft_mint', {
          chain: chain.name,
          token_id: result.token_id
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ EVM minting failed:', error);
      throw error;
    }
  }

  async mintOnSolana(artworkData) {
    console.log('🎨 Minting Metaplex NFT on Solana...');

    try {
      const response = await fetch('/api/nft/mint-solana', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          artwork: artworkData,
          wallet: window.solana.publicKey.toString()
        })
      });

      const result = await response.json();

      if (result.success) {
        console.log('✅ Solana NFT minted');
        console.log('Mint:', result.mint_address);
        console.log('TX:', result.signature);

        this.trackUsage('nft_mint', {
          chain: 'Solana',
          mint: result.mint_address
        });

        return result;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Solana minting failed:', error);
      throw error;
    }
  }

  async getGasEstimate(chainKey, transactionType = 'mint') {
    const chain = this.chains[chainKey];
    if (!chain) return null;

    const estimates = {
      ethereum: {
        mint: { gas: 150000, price: '50 gwei', total: '0.0075 ETH' },
        transfer: { gas: 65000, price: '50 gwei', total: '0.00325 ETH' }
      },
      polygon: {
        mint: { gas: 150000, price: '30 gwei', total: '0.0045 MATIC' },
        transfer: { gas: 65000, price: '30 gwei', total: '0.00195 MATIC' }
      },
      solana: {
        mint: { lamports: 5000, sol: '0.000005 SOL' },
        transfer: { lamports: 5000, sol: '0.000005 SOL' }
      }
    };

    return estimates[chainKey]?.[transactionType] || null;
  }

  async getBridgeFee(fromChain, toChain, amount) {
    console.log(`💰 Getting bridge fee: ${fromChain} → ${toChain}...`);

    try {
      const response = await fetch('/api/bridge/estimate-fee', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          from_chain: fromChain,
          to_chain: toChain,
          amount: amount
        })
      });

      const result = await response.json();

      if (result.success) {
        return {
          fee: result.fee,
          estimated_time: result.estimated_time,
          total_cost: result.total_cost
        };
      }
    } catch (error) {
      console.error('❌ Bridge fee estimation failed:', error);
    }

    // Fallback estimates
    return {
      fee: '0.001 ETH',
      estimated_time: '5-15 minutes',
      total_cost: amount + 0.001
    };
  }

  getChainInfo(chainKey) {
    return this.chains[chainKey] || null;
  }

  getAllChains() {
    return Object.keys(this.chains).map(key => ({
      key: key,
      ...this.chains[key]
    }));
  }

  getEVMChains() {
    return Object.keys(this.chains)
      .filter(key => key !== 'solana')
      .map(key => ({ key, ...this.chains[key] }));
  }

  getCurrentChain() {
    return this.currentChain;
  }

  isChainSupported(chainKey) {
    return !!this.chains[chainKey];
  }

  async getWalletBalance(chainKey) {
    const chain = this.chains[chainKey];
    if (!chain) return null;

    try {
      if (chainKey === 'solana') {
        const balance = await window.solana.getBalance();
        return {
          balance: balance / 1e9, // lamports to SOL
          symbol: 'SOL'
        };
      } else {
        const balance = await window.ethereum.request({
          method: 'eth_getBalance',
          params: [window.ethereum.selectedAddress, 'latest']
        });
        
        return {
          balance: parseInt(balance, 16) / 1e18,
          symbol: chain.symbol
        };
      }
    } catch (error) {
      console.error('❌ Balance fetch failed:', error);
      return null;
    }
  }

  loadUserPreference() {
    const savedChain = localStorage.getItem('preferred_chain');
    if (savedChain && this.chains[savedChain]) {
      console.log(`📥 Loaded preferred chain: ${savedChain}`);
      this.currentChain = this.chains[savedChain];
    } else {
      this.currentChain = this.chains.ethereum;
    }
  }

  saveUserPreference(chainKey) {
    localStorage.setItem('preferred_chain', chainKey);
    console.log(`💾 Saved preferred chain: ${chainKey}`);
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'multi_chain_usage', {
        event_category: 'Blockchain',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.MultiChainSupport = MultiChainSupport;
window.multiChain = null;

// 초기화 함수
window.initMultiChain = function() {
  if (!window.multiChain) {
    window.multiChain = new MultiChainSupport();
    console.log('✅ Multi-Chain Support initialized');
  }
  return window.multiChain;
};

// 편의 함수들
window.switchBlockchain = async function(chainKey) {
  if (!window.multiChain) {
    window.initMultiChain();
  }
  return await window.multiChain.switchChain(chainKey);
};

window.mintOnChain = async function(artworkData, chainKey) {
  if (!window.multiChain) {
    window.initMultiChain();
  }
  return await window.multiChain.mintNFT(artworkData, chainKey);
};

console.log('📦 Multi-Chain Support module loaded');
