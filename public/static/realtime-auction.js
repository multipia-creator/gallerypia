/**
 * Real-time Auction System
 * WebSocket-based live bidding with automatic updates
 */

class RealtimeAuction {
  constructor() {
    this.auctions = new Map();
    this.activeBids = new Map();
    this.eventHandlers = new Map();
    this.init();
  }

  init() {
    this.loadAuctions();
    this.startPolling(); // Fallback to polling (Cloudflare doesn't support WebSocket in Pages)
  }

  /**
   * Load active auctions from storage
   */
  loadAuctions() {
    const stored = localStorage.getItem('active_auctions');
    if (stored) {
      const data = JSON.parse(stored);
      data.forEach(auction => {
        this.auctions.set(auction.id, auction);
      });
    }
  }

  /**
   * Save auctions to storage
   */
  saveAuctions() {
    const data = Array.from(this.auctions.values());
    localStorage.setItem('active_auctions', JSON.stringify(data));
  }

  /**
   * Create new auction
   */
  createAuction(artwork, options = {}) {
    const auction = {
      id: `auction_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      artworkId: artwork.id,
      artworkTitle: artwork.title,
      artworkImage: artwork.image_url,
      sellerId: artwork.artist_id,
      sellerName: artwork.artist_name,
      
      // Auction settings
      startingPrice: options.startingPrice || artwork.estimated_value || 1000,
      reservePrice: options.reservePrice || options.startingPrice * 1.5,
      currentBid: options.startingPrice || artwork.estimated_value || 1000,
      bidIncrement: options.bidIncrement || 100,
      
      // Timing
      startTime: options.startTime || Date.now(),
      endTime: options.endTime || (Date.now() + (options.duration || 86400000)), // Default 24h
      
      // Status
      status: 'active', // active, ended, cancelled
      bidCount: 0,
      bidders: [],
      currentBidder: null,
      
      // Bids history
      bids: [],
      
      // Auto-extend
      autoExtend: options.autoExtend !== false, // Default true
      extendMinutes: options.extendMinutes || 5,
      
      created_at: Date.now()
    };
    
    this.auctions.set(auction.id, auction);
    this.saveAuctions();
    this.emit('auction:created', auction);
    
    return auction;
  }

  /**
   * Place a bid
   */
  async placeBid(auctionId, bidderInfo, bidAmount) {
    const auction = this.auctions.get(auctionId);
    
    if (!auction) {
      throw new Error('Auction not found');
    }
    
    if (auction.status !== 'active') {
      throw new Error('Auction is not active');
    }
    
    if (Date.now() > auction.endTime) {
      this.endAuction(auctionId);
      throw new Error('Auction has ended');
    }
    
    if (bidAmount < auction.currentBid + auction.bidIncrement) {
      throw new Error(`Minimum bid is ${auction.currentBid + auction.bidIncrement}`);
    }
    
    // Check if bidder is the seller
    if (bidderInfo.id === auction.sellerId) {
      throw new Error('Seller cannot bid on their own auction');
    }
    
    const bid = {
      id: `bid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      auctionId,
      bidderId: bidderInfo.id,
      bidderName: bidderInfo.name,
      bidderImage: bidderInfo.image,
      amount: bidAmount,
      timestamp: Date.now(),
      status: 'active'
    };
    
    // Update auction
    const previousBid = auction.currentBid;
    const previousBidder = auction.currentBidder;
    
    auction.currentBid = bidAmount;
    auction.currentBidder = bidderInfo;
    auction.bidCount++;
    auction.bids.push(bid);
    
    if (!auction.bidders.find(b => b.id === bidderInfo.id)) {
      auction.bidders.push(bidderInfo);
    }
    
    // Auto-extend if bid placed in last minutes
    if (auction.autoExtend) {
      const timeRemaining = auction.endTime - Date.now();
      const extendThreshold = auction.extendMinutes * 60 * 1000;
      
      if (timeRemaining < extendThreshold) {
        auction.endTime += extendThreshold;
        this.emit('auction:extended', { auction, newEndTime: auction.endTime });
      }
    }
    
    this.saveAuctions();
    
    // Emit events
    this.emit('bid:placed', { auction, bid, previousBid, previousBidder });
    
    // Notify previous bidder (outbid)
    if (previousBidder) {
      this.emit('bid:outbid', { auction, previousBidder, newBid: bid });
    }
    
    return { success: true, auction, bid };
  }

  /**
   * Get auction details
   */
  getAuction(auctionId) {
    return this.auctions.get(auctionId);
  }

  /**
   * Get active auctions
   */
  getActiveAuctions() {
    return Array.from(this.auctions.values())
      .filter(auction => auction.status === 'active' && auction.endTime > Date.now())
      .sort((a, b) => a.endTime - b.endTime);
  }

  /**
   * End auction
   */
  endAuction(auctionId) {
    const auction = this.auctions.get(auctionId);
    
    if (!auction) return;
    
    auction.status = 'ended';
    auction.endedAt = Date.now();
    
    // Determine winner
    if (auction.currentBid >= auction.reservePrice && auction.currentBidder) {
      auction.winner = auction.currentBidder;
      auction.winningBid = auction.currentBid;
      
      this.emit('auction:won', { auction });
      this.emit('auction:ended', { auction, hasWinner: true });
    } else {
      this.emit('auction:ended', { auction, hasWinner: false });
    }
    
    this.saveAuctions();
  }

  /**
   * Cancel auction
   */
  cancelAuction(auctionId, reason) {
    const auction = this.auctions.get(auctionId);
    
    if (!auction) return;
    
    auction.status = 'cancelled';
    auction.cancelledAt = Date.now();
    auction.cancelReason = reason;
    
    this.emit('auction:cancelled', { auction, reason });
    this.saveAuctions();
  }

  /**
   * Get time remaining
   */
  getTimeRemaining(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return 0;
    
    const remaining = auction.endTime - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Format time remaining
   */
  formatTimeRemaining(ms) {
    if (ms <= 0) return 'Ended';
    
    const seconds = Math.floor(ms / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    
    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h ${minutes % 60}m`;
    if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
    return `${seconds}s`;
  }

  /**
   * Start polling for updates (Fallback for WebSocket)
   */
  startPolling(interval = 5000) {
    setInterval(() => {
      this.checkAuctionStatus();
    }, interval);
  }

  /**
   * Check auction status
   */
  checkAuctionStatus() {
    const now = Date.now();
    
    this.auctions.forEach(auction => {
      if (auction.status === 'active' && auction.endTime <= now) {
        this.endAuction(auction.id);
      }
    });
  }

  /**
   * Event emitter
   */
  on(event, handler) {
    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);
  }

  off(event, handler) {
    if (!this.eventHandlers.has(event)) return;
    
    const handlers = this.eventHandlers.get(event);
    const index = handlers.indexOf(handler);
    if (index > -1) {
      handlers.splice(index, 1);
    }
  }

  emit(event, data) {
    if (!this.eventHandlers.has(event)) return;
    
    this.eventHandlers.get(event).forEach(handler => {
      try {
        handler(data);
      } catch (error) {
        console.error(`[Auction] Event handler error (${event}):`, error);
      }
    });
  }

  /**
   * Get bidding history
   */
  getBiddingHistory(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return [];
    
    return [...auction.bids].reverse(); // Most recent first
  }

  /**
   * Get user's bids
   */
  getUserBids(userId) {
    const userBids = [];
    
    this.auctions.forEach(auction => {
      auction.bids.forEach(bid => {
        if (bid.bidderId === userId) {
          userBids.push({
            ...bid,
            auction: {
              id: auction.id,
              title: auction.artworkTitle,
              image: auction.artworkImage,
              status: auction.status,
              isWinning: auction.currentBidder?.id === userId
            }
          });
        }
      });
    });
    
    return userBids.sort((a, b) => b.timestamp - a.timestamp);
  }

  /**
   * Get auction statistics
   */
  getAuctionStats(auctionId) {
    const auction = this.auctions.get(auctionId);
    if (!auction) return null;
    
    return {
      totalBids: auction.bidCount,
      uniqueBidders: auction.bidders.length,
      currentPrice: auction.currentBid,
      priceIncrease: auction.currentBid - auction.startingPrice,
      priceIncreasePercent: ((auction.currentBid - auction.startingPrice) / auction.startingPrice * 100).toFixed(1),
      averageBid: auction.bidCount > 0 ? (auction.bids.reduce((sum, bid) => sum + bid.amount, 0) / auction.bidCount) : 0,
      timeRemaining: this.getTimeRemaining(auctionId),
      reserveMet: auction.currentBid >= auction.reservePrice
    };
  }
}

// Export
if (typeof window !== 'undefined') {
  window.RealtimeAuction = RealtimeAuction;
  window.auctionSystem = new RealtimeAuction();
  console.log('[Real-time] Auction System initialized');
}
