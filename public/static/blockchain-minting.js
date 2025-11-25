/**
 * Blockchain Minting Integration
 * L3-8: 블록체인 민팅 통합
 * 
 * Features:
 * - MetaMask connection
 * - Ethereum & Polygon support
 * - ERC-721 NFT minting
 * - Gas optimization
 * - Transaction tracking
 */

class BlockchainMinting {
  constructor() {
    this.web3 = null;
    this.account = null;
    this.chainId = null;
    this.contract = null;
    
    // Network configurations
    this.networks = {
      ethereum: {
        chainId: '0x1',
        chainIdInt: 1,
        name: 'Ethereum Mainnet',
        rpcUrl: 'https://eth-mainnet.g.alchemy.com/v2/demo',
        symbol: 'ETH',
        explorer: 'https://etherscan.io',
        gasMultiplier: 3.0
      },
      polygon: {
        chainId: '0x89',
        chainIdInt: 137,
        name: 'Polygon Mainnet',
        rpcUrl: 'https://polygon-rpc.com',
        symbol: 'MATIC',
        explorer: 'https://polygonscan.com',
        gasMultiplier: 1.0
      },
      sepolia: {
        chainId: '0xaa36a7',
        chainIdInt: 11155111,
        name: 'Sepolia Testnet',
        rpcUrl: 'https://sepolia.infura.io/v3/demo',
        symbol: 'SepoliaETH',
        explorer: 'https://sepolia.etherscan.io',
        gasMultiplier: 1.5
      },
      mumbai: {
        chainId: '0x13881',
        chainIdInt: 80001,
        name: 'Mumbai Testnet',
        rpcUrl: 'https://rpc-mumbai.maticvigil.com',
        symbol: 'MATIC',
        explorer: 'https://mumbai.polygonscan.com',
        gasMultiplier: 1.0
      }
    };
    
    // ERC-721 Contract ABI (minimal for minting)
    this.contractABI = [
      {
        "inputs": [
          {"name": "to", "type": "address"},
          {"name": "tokenURI", "type": "string"}
        ],
        "name": "mint",
        "outputs": [{"name": "tokenId", "type": "uint256"}],
        "stateMutability": "payable",
        "type": "function"
      },
      {
        "inputs": [],
        "name": "mintPrice",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
      }
    ];
    
    this.init();
  }

  init() {
    this.checkMetaMask();
    this.setupEventListeners();
    console.log('🔗 Blockchain Minting initialized');
  }

  // ===== METAMASK CONNECTION =====
  
  checkMetaMask() {
    if (typeof window.ethereum !== 'undefined') {
      console.log('✅ MetaMask detected');
      this.web3 = new Web3(window.ethereum);
      return true;
    } else {
      console.warn('❌ MetaMask not detected');
      return false;
    }
  }

  async connectWallet() {
    if (!this.checkMetaMask()) {
      throw new Error('MetaMask not installed. Please install MetaMask extension.');
    }

    try {
      // Request account access
      const accounts = await window.ethereum.request({ 
        method: 'eth_requestAccounts' 
      });
      
      this.account = accounts[0];
      
      // Get current chain ID
      this.chainId = await window.ethereum.request({ 
        method: 'eth_chainId' 
      });
      
      console.log('🔗 Connected:', this.account);
      console.log('🌐 Chain ID:', this.chainId);
      
      // Emit connection event
      document.dispatchEvent(new CustomEvent('wallet-connected', {
        detail: { account: this.account, chainId: this.chainId }
      }));
      
      return {
        account: this.account,
        chainId: this.chainId,
        network: this.getNetworkName()
      };
      
    } catch (error) {
      console.error('Connection error:', error);
      throw new Error(`Failed to connect wallet: ${error.message}`);
    }
  }

  async disconnectWallet() {
    this.account = null;
    this.chainId = null;
    
    document.dispatchEvent(new CustomEvent('wallet-disconnected'));
    
    return { success: true };
  }

  setupEventListeners() {
    if (typeof window.ethereum === 'undefined') return;
    
    // Account changed
    window.ethereum.on('accountsChanged', (accounts) => {
      if (accounts.length === 0) {
        this.disconnectWallet();
      } else {
        this.account = accounts[0];
        document.dispatchEvent(new CustomEvent('wallet-account-changed', {
          detail: { account: this.account }
        }));
      }
    });
    
    // Chain changed
    window.ethereum.on('chainChanged', (chainId) => {
      this.chainId = chainId;
      document.dispatchEvent(new CustomEvent('wallet-chain-changed', {
        detail: { chainId: this.chainId }
      }));
      // Reload page on chain change (recommended by MetaMask)
      window.location.reload();
    });
  }

  // ===== NETWORK MANAGEMENT =====
  
  getNetworkName() {
    const network = Object.values(this.networks).find(
      n => n.chainId === this.chainId
    );
    return network ? network.name : 'Unknown Network';
  }

  async switchNetwork(networkKey) {
    const network = this.networks[networkKey];
    if (!network) {
      throw new Error(`Network ${networkKey} not found`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: network.chainId }]
      });
      
      this.chainId = network.chainId;
      return { success: true, network: network.name };
      
    } catch (error) {
      // Chain not added, try to add it
      if (error.code === 4902) {
        return await this.addNetwork(networkKey);
      }
      throw error;
    }
  }

  async addNetwork(networkKey) {
    const network = this.networks[networkKey];
    if (!network) {
      throw new Error(`Network ${networkKey} not found`);
    }

    try {
      await window.ethereum.request({
        method: 'wallet_addEthereumChain',
        params: [{
          chainId: network.chainId,
          chainName: network.name,
          nativeCurrency: {
            name: network.symbol,
            symbol: network.symbol,
            decimals: 18
          },
          rpcUrls: [network.rpcUrl],
          blockExplorerUrls: [network.explorer]
        }]
      });
      
      return { success: true, network: network.name };
      
    } catch (error) {
      throw new Error(`Failed to add network: ${error.message}`);
    }
  }

  // ===== GAS OPTIMIZATION =====
  
  async estimateGas(transaction) {
    try {
      const gasEstimate = await this.web3.eth.estimateGas(transaction);
      const gasPrice = await this.web3.eth.getGasPrice();
      
      // Get current network
      const network = Object.values(this.networks).find(
        n => n.chainId === this.chainId
      );
      
      // Apply network-specific multiplier
      const multiplier = network ? network.gasMultiplier : 1.5;
      const optimizedGasPrice = Math.floor(gasPrice * multiplier);
      
      const gasCost = gasEstimate * optimizedGasPrice;
      const gasCostEther = this.web3.utils.fromWei(gasCost.toString(), 'ether');
      
      return {
        gasLimit: gasEstimate,
        gasPrice: optimizedGasPrice,
        gasPriceGwei: this.web3.utils.fromWei(optimizedGasPrice.toString(), 'gwei'),
        totalCost: gasCost,
        totalCostEther: gasCostEther,
        network: network ? network.name : 'Unknown'
      };
      
    } catch (error) {
      console.error('Gas estimation error:', error);
      throw new Error(`Failed to estimate gas: ${error.message}`);
    }
  }

  async suggestCheaperNetwork() {
    const currentNetwork = Object.values(this.networks).find(
      n => n.chainId === this.chainId
    );
    
    if (!currentNetwork) return null;
    
    // Suggest Polygon if on Ethereum (much cheaper)
    if (currentNetwork.chainIdInt === 1) {
      return {
        current: currentNetwork.name,
        suggested: 'Polygon Mainnet',
        savings: '~95%',
        reason: 'Polygon has significantly lower gas fees'
      };
    }
    
    // Suggest testnets for testing
    if (currentNetwork.chainIdInt === 11155111 || currentNetwork.chainIdInt === 1) {
      return {
        current: currentNetwork.name,
        suggested: 'Mumbai Testnet',
        savings: '~100%',
        reason: 'Free testnet tokens for testing'
      };
    }
    
    return null;
  }

  // ===== NFT MINTING =====
  
  async mintNFT(contractAddress, tokenURI, options = {}) {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    try {
      // Initialize contract
      this.contract = new this.web3.eth.Contract(
        this.contractABI,
        contractAddress
      );
      
      // Get mint price (if contract has one)
      let mintPrice = '0';
      try {
        mintPrice = await this.contract.methods.mintPrice().call();
      } catch (e) {
        console.log('Contract has no mint price function');
      }
      
      // Prepare transaction
      const transaction = {
        from: this.account,
        to: contractAddress,
        value: mintPrice,
        data: this.contract.methods.mint(this.account, tokenURI).encodeABI()
      };
      
      // Estimate gas
      const gasEstimate = await this.estimateGas(transaction);
      
      // Add gas parameters
      transaction.gas = Math.floor(gasEstimate.gasLimit * 1.2); // 20% buffer
      transaction.gasPrice = gasEstimate.gasPrice;
      
      // Send transaction
      const receipt = await this.web3.eth.sendTransaction(transaction);
      
      return {
        success: true,
        transactionHash: receipt.transactionHash,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        status: receipt.status,
        explorerUrl: this.getExplorerUrl(receipt.transactionHash)
      };
      
    } catch (error) {
      console.error('Minting error:', error);
      throw new Error(`Minting failed: ${error.message}`);
    }
  }

  async batchMint(contractAddress, tokenURIs, options = {}) {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    const results = [];
    const errors = [];
    
    for (let i = 0; i < tokenURIs.length; i++) {
      try {
        const result = await this.mintNFT(contractAddress, tokenURIs[i], options);
        results.push({
          index: i,
          tokenURI: tokenURIs[i],
          ...result
        });
        
        // Emit progress event
        document.dispatchEvent(new CustomEvent('batch-mint-progress', {
          detail: { 
            current: i + 1, 
            total: tokenURIs.length,
            result
          }
        }));
        
      } catch (error) {
        errors.push({
          index: i,
          tokenURI: tokenURIs[i],
          error: error.message
        });
      }
    }
    
    return {
      success: errors.length === 0,
      results,
      errors,
      summary: {
        total: tokenURIs.length,
        succeeded: results.length,
        failed: errors.length
      }
    };
  }

  // ===== TRANSACTION TRACKING =====
  
  async getTransactionStatus(txHash) {
    try {
      const receipt = await this.web3.eth.getTransactionReceipt(txHash);
      
      if (!receipt) {
        return {
          status: 'pending',
          message: 'Transaction pending confirmation'
        };
      }
      
      return {
        status: receipt.status ? 'confirmed' : 'failed',
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed,
        explorerUrl: this.getExplorerUrl(txHash)
      };
      
    } catch (error) {
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  async waitForTransaction(txHash, timeout = 120000) {
    const startTime = Date.now();
    
    return new Promise((resolve, reject) => {
      const checkStatus = async () => {
        const status = await this.getTransactionStatus(txHash);
        
        if (status.status === 'confirmed') {
          resolve(status);
        } else if (status.status === 'failed') {
          reject(new Error('Transaction failed'));
        } else if (Date.now() - startTime > timeout) {
          reject(new Error('Transaction timeout'));
        } else {
          setTimeout(checkStatus, 3000); // Check every 3 seconds
        }
      };
      
      checkStatus();
    });
  }

  getExplorerUrl(txHash) {
    const network = Object.values(this.networks).find(
      n => n.chainId === this.chainId
    );
    
    if (!network) return null;
    
    return `${network.explorer}/tx/${txHash}`;
  }

  // ===== UTILITY FUNCTIONS =====
  
  async getBalance() {
    if (!this.account) {
      throw new Error('Wallet not connected');
    }

    const balance = await this.web3.eth.getBalance(this.account);
    return {
      wei: balance,
      ether: this.web3.utils.fromWei(balance, 'ether')
    };
  }

  formatAddress(address, length = 4) {
    if (!address) return '';
    return `${address.substring(0, length + 2)}...${address.substring(address.length - length)}`;
  }

  isConnected() {
    return !!this.account;
  }

  getConnectionInfo() {
    return {
      connected: this.isConnected(),
      account: this.account,
      formattedAccount: this.formatAddress(this.account),
      chainId: this.chainId,
      network: this.getNetworkName()
    };
  }
}

// Initialize on page load
let blockchainMinting;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    blockchainMinting = new BlockchainMinting();
    window.blockchainMinting = blockchainMinting;
  });
} else {
  blockchainMinting = new BlockchainMinting();
  window.blockchainMinting = blockchainMinting;
}
