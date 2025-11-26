/** GALLERYPIA - Advanced Marketplace (Phase 18) */
class AdvancedMarketplace {
  constructor() { this.init(); }
  init() { console.log('💎 Advanced Marketplace initializing...'); }
  async createDutchAuction(nftId, startPrice, endPrice, duration) {
    const response = await fetch('/api/marketplace/dutch-auction', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nft_id: nftId, start_price: startPrice, end_price: endPrice, duration })
    });
    return await response.json();
  }
  async makeOffer(nftId, price, expiration) {
    const response = await fetch('/api/marketplace/offer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nft_id: nftId, price, expiration })
    });
    return await response.json();
  }
  async createEscrow(nftId, buyer, seller) {
    const response = await fetch('/api/marketplace/escrow', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nft_id: nftId, buyer, seller })
    });
    return await response.json();
  }
}
window.AdvancedMarketplace = AdvancedMarketplace;
window.marketplace = null;
window.initMarketplace = () => {
  if (!window.marketplace) {
    window.marketplace = new AdvancedMarketplace();
    console.log('✅ Advanced Marketplace initialized');
  }
  return window.marketplace;
};
console.log('📦 Advanced Marketplace module loaded');
