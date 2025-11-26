/**
 * GALLERYPIA - Social Feed System
 * Phase 12: Social Features
 * Activity Feed & Social Timeline
 */

class SocialFeed {
  constructor() {
    this.feedItems = [];
    this.feedPage = 1;
    this.feedPerPage = 20;
    this.hasMore = true;
    this.init();
  }

  init() {
    console.log('📰 Social Feed System initializing...');
  }

  async loadFeed(page = 1) {
    console.log(`📰 Loading feed (page ${page})...`);

    try {
      const response = await fetch(`/api/social/feed?page=${page}&per_page=${this.feedPerPage}`);
      const result = await response.json();

      if (result.success) {
        const items = result.feed_items.map(item => this.enrichFeedItem(item));

        if (page === 1) {
          this.feedItems = items;
        } else {
          this.feedItems.push(...items);
        }

        this.hasMore = result.has_more;
        this.feedPage = page;

        console.log(`✅ Loaded ${items.length} feed items`);
        return items;
      }
    } catch (error) {
      console.error('❌ Failed to load feed:', error);
    }

    return [];
  }

  enrichFeedItem(item) {
    return {
      ...item,
      timeAgo: this.getTimeAgo(item.created_at),
      actionIcon: this.getActionIcon(item.type),
      actionText: this.getActionText(item)
    };
  }

  getActionIcon(type) {
    const icons = {
      artwork_created: '🎨',
      artwork_sold: '💰',
      artwork_liked: '❤️',
      user_followed: '👤',
      auction_won: '🏆',
      collection_created: '📁',
      comment_posted: '💬'
    };
    return icons[type] || '📌';
  }

  getActionText(item) {
    const templates = {
      artwork_created: `created a new artwork "${item.artwork?.title}"`,
      artwork_sold: `sold "${item.artwork?.title}" for ${item.price} ETH`,
      artwork_liked: `liked "${item.artwork?.title}"`,
      user_followed: `started following ${item.target_user?.name}`,
      auction_won: `won the auction for "${item.artwork?.title}"`,
      collection_created: `created collection "${item.collection?.name}"`,
      comment_posted: `commented on "${item.artwork?.title}"`
    };
    return templates[item.type] || 'performed an action';
  }

  getTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - new Date(timestamp).getTime();

    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 7) {
      return new Date(timestamp).toLocaleDateString();
    } else if (days > 0) {
      return `${days}d ago`;
    } else if (hours > 0) {
      return `${hours}h ago`;
    } else if (minutes > 0) {
      return `${minutes}m ago`;
    } else {
      return 'Just now';
    }
  }

  async loadMore() {
    if (!this.hasMore) {
      console.log('⚠️ No more feed items');
      return [];
    }

    return await this.loadFeed(this.feedPage + 1);
  }

  async refresh() {
    console.log('🔄 Refreshing feed...');
    return await this.loadFeed(1);
  }

  async likeItem(itemId) {
    console.log(`❤️ Liking feed item ${itemId}...`);

    try {
      const response = await fetch(`/api/social/like/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (item) {
          item.liked = true;
          item.likes_count = (item.likes_count || 0) + 1;
        }

        console.log('✅ Feed item liked');
        this.trackUsage('feed_like', { item_id: itemId });
        return true;
      }
    } catch (error) {
      console.error('❌ Like failed:', error);
    }

    return false;
  }

  async unlikeItem(itemId) {
    console.log(`💔 Unliking feed item ${itemId}...`);

    try {
      const response = await fetch(`/api/social/unlike/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (item) {
          item.liked = false;
          item.likes_count = Math.max(0, (item.likes_count || 0) - 1);
        }

        console.log('✅ Feed item unliked');
        return true;
      }
    } catch (error) {
      console.error('❌ Unlike failed:', error);
    }

    return false;
  }

  async commentOnItem(itemId, comment) {
    console.log(`💬 Commenting on feed item ${itemId}...`);

    try {
      const response = await fetch(`/api/social/comment/${itemId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment: comment })
      });

      const result = await response.json();

      if (result.success) {
        const item = this.feedItems.find(i => i.id === itemId);
        if (item) {
          item.comments_count = (item.comments_count || 0) + 1;
        }

        console.log('✅ Comment posted');
        this.trackUsage('feed_comment', { item_id: itemId });
        return result.comment;
      }
    } catch (error) {
      console.error('❌ Comment failed:', error);
    }

    return null;
  }

  async shareItem(itemId, platform = 'twitter') {
    console.log(`🔗 Sharing feed item ${itemId} to ${platform}...`);

    const item = this.feedItems.find(i => i.id === itemId);
    if (!item) return false;

    const shareUrls = {
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(this.getShareText(item))}&url=${encodeURIComponent(window.location.href)}`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.href)}`,
      telegram: `https://t.me/share/url?url=${encodeURIComponent(window.location.href)}&text=${encodeURIComponent(this.getShareText(item))}`
    };

    const url = shareUrls[platform];
    if (url) {
      window.open(url, '_blank', 'width=600,height=400');
      this.trackUsage('feed_share', { item_id: itemId, platform: platform });
      return true;
    }

    return false;
  }

  getShareText(item) {
    return `Check out this on GALLERYPIA: ${item.actionText}`;
  }

  getFeedItems() {
    return this.feedItems;
  }

  clearFeed() {
    this.feedItems = [];
    this.feedPage = 1;
    this.hasMore = true;
    console.log('🗑️ Feed cleared');
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'social_feed_usage', {
        event_category: 'Social',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.SocialFeed = SocialFeed;
window.socialFeed = null;

// 초기화 함수
window.initSocialFeed = function() {
  if (!window.socialFeed) {
    window.socialFeed = new SocialFeed();
    console.log('✅ Social Feed initialized');
  }
  return window.socialFeed;
};

// 편의 함수
window.loadActivityFeed = async function() {
  if (!window.socialFeed) window.initSocialFeed();
  return await window.socialFeed.loadFeed();
};

window.refreshFeed = async function() {
  if (!window.socialFeed) window.initSocialFeed();
  return await window.socialFeed.refresh();
};

console.log('📦 Social Feed module loaded');
