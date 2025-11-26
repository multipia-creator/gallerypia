/**
 * GALLERYPIA - Social Follow System
 * Phase 12: Social Features
 * Follow/Follower & Social Networking
 */

class SocialFollowSystem {
  constructor() {
    this.following = new Set();
    this.followers = new Set();
    this.cache = new Map();
    this.init();
  }

  init() {
    console.log('👥 Social Follow System initializing...');
    this.loadFollowData();
  }

  async followUser(userId) {
    console.log(`➕ Following user ${userId}...`);

    if (this.following.has(userId)) {
      console.log('⚠️ Already following this user');
      return false;
    }

    try {
      const response = await fetch(`/api/social/follow/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.following.add(userId);
        this.saveFollowData();
        
        console.log('✅ Now following user');
        this.trackUsage('follow', { user_id: userId });

        // 실시간 알림
        this.notifyUser(userId, 'new_follower');

        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Follow failed:', error);
      return false;
    }
  }

  async unfollowUser(userId) {
    console.log(`➖ Unfollowing user ${userId}...`);

    if (!this.following.has(userId)) {
      console.log('⚠️ Not following this user');
      return false;
    }

    try {
      const response = await fetch(`/api/social/unfollow/${userId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });

      const result = await response.json();

      if (result.success) {
        this.following.delete(userId);
        this.saveFollowData();
        
        console.log('✅ Unfollowed user');
        this.trackUsage('unfollow', { user_id: userId });

        return true;
      } else {
        throw new Error(result.message);
      }
    } catch (error) {
      console.error('❌ Unfollow failed:', error);
      return false;
    }
  }

  async getFollowers(userId) {
    console.log(`📋 Getting followers for user ${userId}...`);

    // 캐시 확인
    const cacheKey = `followers_${userId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) { // 5분
        return cached.data;
      }
    }

    try {
      const response = await fetch(`/api/social/followers/${userId}`);
      const result = await response.json();

      if (result.success) {
        this.cache.set(cacheKey, {
          data: result.followers,
          timestamp: Date.now()
        });

        return result.followers;
      }
    } catch (error) {
      console.error('❌ Failed to get followers:', error);
    }

    return [];
  }

  async getFollowing(userId) {
    console.log(`📋 Getting following list for user ${userId}...`);

    const cacheKey = `following_${userId}`;
    if (this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() - cached.timestamp < 300000) {
        return cached.data;
      }
    }

    try {
      const response = await fetch(`/api/social/following/${userId}`);
      const result = await response.json();

      if (result.success) {
        this.cache.set(cacheKey, {
          data: result.following,
          timestamp: Date.now()
        });

        return result.following;
      }
    } catch (error) {
      console.error('❌ Failed to get following:', error);
    }

    return [];
  }

  async getFollowStats(userId) {
    console.log(`📊 Getting follow stats for user ${userId}...`);

    try {
      const response = await fetch(`/api/social/stats/${userId}`);
      const result = await response.json();

      if (result.success) {
        return {
          followers_count: result.followers_count,
          following_count: result.following_count,
          mutual_count: result.mutual_count
        };
      }
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
    }

    return {
      followers_count: 0,
      following_count: 0,
      mutual_count: 0
    };
  }

  async getMutualFollows(userId) {
    console.log(`🤝 Getting mutual follows with user ${userId}...`);

    try {
      const response = await fetch(`/api/social/mutual/${userId}`);
      const result = await response.json();

      if (result.success) {
        return result.mutual_follows;
      }
    } catch (error) {
      console.error('❌ Failed to get mutual follows:', error);
    }

    return [];
  }

  async getSuggestedUsers(count = 10) {
    console.log(`💡 Getting suggested users to follow...`);

    try {
      const response = await fetch(`/api/social/suggestions?count=${count}`);
      const result = await response.json();

      if (result.success) {
        return result.suggestions.map(user => ({
          ...user,
          reason: this.getSuggestionReason(user)
        }));
      }
    } catch (error) {
      console.error('❌ Failed to get suggestions:', error);
    }

    return [];
  }

  getSuggestionReason(user) {
    if (user.mutual_connections > 0) {
      return `${user.mutual_connections} mutual connections`;
    } else if (user.similar_interests) {
      return 'Similar interests';
    } else if (user.popular_artist) {
      return 'Popular artist';
    } else {
      return 'Recommended for you';
    }
  }

  async searchUsers(query, filters = {}) {
    console.log(`🔍 Searching users: "${query}"...`);

    try {
      const params = new URLSearchParams({
        q: query,
        ...filters
      });

      const response = await fetch(`/api/social/search?${params}`);
      const result = await response.json();

      if (result.success) {
        return result.users.map(user => ({
          ...user,
          is_following: this.following.has(user.id)
        }));
      }
    } catch (error) {
      console.error('❌ User search failed:', error);
    }

    return [];
  }

  isFollowing(userId) {
    return this.following.has(userId);
  }

  async notifyUser(userId, eventType) {
    // 실시간 알림 전송 (웹소켓 or push)
    if (window.liveNotifications) {
      window.liveNotifications.send({
        to: userId,
        type: eventType,
        data: {
          user_id: this.getCurrentUserId()
        }
      });
    }
  }

  getCurrentUserId() {
    // 현재 로그인한 사용자 ID
    const userData = localStorage.getItem('user_data');
    if (userData) {
      return JSON.parse(userData).id;
    }
    return null;
  }

  loadFollowData() {
    try {
      const stored = localStorage.getItem('following_users');
      if (stored) {
        this.following = new Set(JSON.parse(stored));
        console.log(`📥 Loaded ${this.following.size} following users`);
      }
    } catch (error) {
      console.warn('⚠️ Failed to load follow data');
    }
  }

  saveFollowData() {
    try {
      const followingArray = Array.from(this.following);
      localStorage.setItem('following_users', JSON.stringify(followingArray));
    } catch (error) {
      console.warn('⚠️ Failed to save follow data');
    }
  }

  clearCache() {
    this.cache.clear();
    console.log('🗑️ Follow cache cleared');
  }

  trackUsage(feature, data = {}) {
    if (window.gtag) {
      window.gtag('event', 'social_follow_usage', {
        event_category: 'Social',
        feature: feature,
        ...data
      });
    }
  }
}

// 글로벌 인스턴스
window.SocialFollowSystem = SocialFollowSystem;
window.socialFollow = null;

// 초기화 함수
window.initSocialFollow = function() {
  if (!window.socialFollow) {
    window.socialFollow = new SocialFollowSystem();
    console.log('✅ Social Follow System initialized');
  }
  return window.socialFollow;
};

// 편의 함수
window.followArtist = async function(userId) {
  if (!window.socialFollow) window.initSocialFollow();
  return await window.socialFollow.followUser(userId);
};

window.unfollowArtist = async function(userId) {
  if (!window.socialFollow) window.initSocialFollow();
  return await window.socialFollow.unfollowUser(userId);
};

window.isFollowingArtist = function(userId) {
  if (!window.socialFollow) window.initSocialFollow();
  return window.socialFollow.isFollowing(userId);
};

console.log('📦 Social Follow System module loaded');
