/**
 * Enhanced User Profile
 * Badges, achievements, activity timeline
 * Phase 6.5 - Low Priority UX (UX-L-027: Enhanced Profile)
 */

class EnhancedUserProfile {
  constructor() {
    this.profileData = this.loadProfileData();
    this.achievements = this.loadAchievements();
    this.timeline = this.loadTimeline();
    
    this.init();
  }

  init() {
    console.log('👤 Enhanced User Profile initialized');
    this.trackActivity();
    this.checkAchievements();
  }

  loadProfileData() {
    const data = localStorage.getItem('gallerypia_profile_data');
    return data ? JSON.parse(data) : {
      level: 1,
      exp: 0,
      expToNextLevel: 100,
      badges: [],
      stats: {
        viewCount: 0,
        likeCount: 0,
        collectionsCount: 0,
        commentsCount: 0,
        sharesCount: 0
      }
    };
  }

  loadAchievements() {
    return [
      { id: 'first_view', name: '첫 작품 감상', description: '첫 작품을 감상했습니다', icon: 'fa-eye', exp: 10, unlocked: false },
      { id: 'art_lover', name: '미술 애호가', description: '100개 작품 감상', icon: 'fa-heart', exp: 50, unlocked: false },
      { id: 'collector', name: '컬렉터', description: '첫 컬렉션 생성', icon: 'fa-folder', exp: 20, unlocked: false },
      { id: 'social_butterfly', name: '소셜 버터플라이', description: '10개 댓글 작성', icon: 'fa-comments', exp: 30, unlocked: false },
      { id: 'influencer', name: '인플루언서', description: '작품 100회 공유', icon: 'fa-share', exp: 100, unlocked: false }
    ];
  }

  loadTimeline() {
    const data = localStorage.getItem('gallerypia_timeline');
    return data ? JSON.parse(data) : [];
  }

  saveProfileData() {
    localStorage.setItem('gallerypia_profile_data', JSON.stringify(this.profileData));
  }

  saveTimeline() {
    localStorage.setItem('gallerypia_timeline', JSON.stringify(this.timeline.slice(0, 100)));
  }

  trackActivity() {
    document.addEventListener('artwork-viewed', () => this.addActivity('view'));
    document.addEventListener('artwork-liked', () => this.addActivity('like'));
    document.addEventListener('collection-created', () => this.addActivity('collection'));
    document.addEventListener('comment-posted', () => this.addActivity('comment'));
    document.addEventListener('artwork-shared', () => this.addActivity('share'));
  }

  addActivity(type) {
    this.profileData.stats[`${type}Count`]++;
    this.timeline.unshift({ type, timestamp: Date.now() });
    this.addExp(5);
    this.saveProfileData();
    this.saveTimeline();
    this.checkAchievements();
  }

  addExp(amount) {
    this.profileData.exp += amount;
    while (this.profileData.exp >= this.profileData.expToNextLevel) {
      this.levelUp();
    }
    this.saveProfileData();
  }

  levelUp() {
    this.profileData.level++;
    this.profileData.exp -= this.profileData.expToNextLevel;
    this.profileData.expToNextLevel = Math.floor(this.profileData.expToNextLevel * 1.5);
    this.showToast(`레벨 업! 현재 레벨: ${this.profileData.level}`, 'success');
  }

  checkAchievements() {
    this.achievements.forEach(achievement => {
      if (!achievement.unlocked) {
        if (this.checkAchievementCondition(achievement.id)) {
          this.unlockAchievement(achievement.id);
        }
      }
    });
  }

  checkAchievementCondition(achievementId) {
    const stats = this.profileData.stats;
    const conditions = {
      'first_view': stats.viewCount >= 1,
      'art_lover': stats.viewCount >= 100,
      'collector': stats.collectionsCount >= 1,
      'social_butterfly': stats.commentsCount >= 10,
      'influencer': stats.sharesCount >= 100
    };
    return conditions[achievementId] || false;
  }

  unlockAchievement(achievementId) {
    const achievement = this.achievements.find(a => a.id === achievementId);
    if (!achievement) return;
    
    achievement.unlocked = true;
    this.profileData.badges.push(achievementId);
    this.addExp(achievement.exp);
    this.saveProfileData();
    
    this.showAchievementToast(achievement);
  }

  showAchievementToast(achievement) {
    if (window.ToastNotificationManager) {
      window.ToastNotificationManager.show(
        `🏆 업적 달성: ${achievement.name}`,
        'success',
        5000
      );
    }
  }

  showToast(message, type = 'info') {
    if (window.ToastNotificationManager) {
      window.ToastNotificationManager.show(message, type);
    }
  }

  renderProfile(containerId = 'user-profile-enhanced') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const expPercent = (this.profileData.exp / this.profileData.expToNextLevel) * 100;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-20 h-20 bg-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
            ${this.profileData.level}
          </div>
          <div class="flex-1">
            <h3 class="text-xl font-bold text-gray-800">레벨 ${this.profileData.level}</h3>
            <div class="mt-2 bg-gray-200 rounded-full h-4">
              <div class="bg-indigo-600 h-4 rounded-full transition-all" style="width: ${expPercent}%"></div>
            </div>
            <p class="text-sm text-gray-600 mt-1">${this.profileData.exp} / ${this.profileData.expToNextLevel} EXP</p>
          </div>
        </div>
        
        <div class="grid grid-cols-5 gap-4 mb-6">
          <div class="text-center"><div class="text-2xl font-bold text-indigo-600">${this.profileData.stats.viewCount}</div><div class="text-xs text-gray-600">조회</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-red-600">${this.profileData.stats.likeCount}</div><div class="text-xs text-gray-600">좋아요</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-green-600">${this.profileData.stats.collectionsCount}</div><div class="text-xs text-gray-600">컬렉션</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-blue-600">${this.profileData.stats.commentsCount}</div><div class="text-xs text-gray-600">댓글</div></div>
          <div class="text-center"><div class="text-2xl font-bold text-yellow-600">${this.profileData.stats.sharesCount}</div><div class="text-xs text-gray-600">공유</div></div>
        </div>
        
        <h4 class="text-lg font-bold text-gray-800 mb-3">업적 (${this.achievements.filter(a => a.unlocked).length}/${this.achievements.length})</h4>
        <div class="grid grid-cols-5 gap-2">
          ${this.achievements.map(achievement => `
            <div class="text-center ${achievement.unlocked ? '' : 'opacity-30'}" title="${achievement.description}">
              <i class="fas ${achievement.icon} text-3xl ${achievement.unlocked ? 'text-yellow-500' : 'text-gray-400'}"></i>
              <div class="text-xs mt-1">${achievement.name}</div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }
}

let enhancedUserProfile;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    enhancedUserProfile = new EnhancedUserProfile();
  });
} else {
  enhancedUserProfile = new EnhancedUserProfile();
}
