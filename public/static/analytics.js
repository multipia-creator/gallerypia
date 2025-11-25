// 사용자 행동 추적 시스템
class AnalyticsTracker {
  constructor() {
    this.userId = this.getUserId()
    this.sessionStart = Date.now()
    this.currentPage = window.location.pathname
  }

  getUserId() {
    const userData = localStorage.getItem('user')
    if (!userData) return null
    try {
      const user = JSON.parse(userData)
      return user.id || user.user_id
    } catch (e) {
      return null
    }
  }

  // 이벤트 추적
  async track(eventType, eventData = {}) {
    try {
      await fetch('/api/analytics/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: this.userId,
          eventType,
          eventData,
          page: this.currentPage,
          referrer: document.referrer
        })
      })
    } catch (error) {
      console.error('❌ Analytics tracking failed:', error)
    }
  }

  // 페이지 조회 추적
  trackPageView() {
    const duration = Date.now() - this.sessionStart
    this.track('page_view', { duration, title: document.title })
  }

  // 작품 조회 추적
  trackArtworkView(artworkId, artworkTitle) {
    this.track('artwork_view', { artworkId, artworkTitle })
  }

  // 작품 좋아요 추적
  trackArtworkLike(artworkId) {
    this.track('artwork_like', { artworkId })
  }

  // 검색 추적
  trackSearch(query, results) {
    this.track('search', { query, resultCount: results })
  }

  // 클릭 추적
  trackClick(element, label) {
    this.track('click', { element, label })
  }

  // 초기화
  init() {
    // 페이지 로드 시 추적
    this.trackPageView()

    // 페이지 이탈 시 추적
    window.addEventListener('beforeunload', () => {
      this.trackPageView()
    })

    console.log('✅ Analytics tracker 초기화 완료')
  }
}

// 전역 인스턴스
window.analyticsTracker = new AnalyticsTracker()
window.analyticsTracker.init()
