// 실시간 알림 시스템 (Polling 기반)
class NotificationManager {
  constructor() {
    this.userId = this.getUserId()
    this.pollingInterval = null
    this.pollDelay = 10000 // 10초마다 폴링
    this.notificationBadge = null
    this.notificationDropdown = null
    this.isDropdownOpen = false
  }

  // 사용자 ID 가져오기 (localStorage에서)
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

  // 초기화
  init() {
    if (!this.userId) {
      console.log('⏭️ 로그인 필요 - 알림 시스템 비활성화')
      return
    }

    this.createNotificationUI()
    this.startPolling()
    this.attachEventListeners()
    console.log('✅ 알림 시스템 초기화 완료')
  }

  // 알림 UI 생성
  createNotificationUI() {
    // 알림 버튼이 이미 있는지 확인
    let notificationBtn = document.getElementById('notification-btn')
    
    if (!notificationBtn) {
      // 헤더에 알림 버튼 추가
      const header = document.querySelector('header nav')
      if (!header) return

      const notificationHTML = `
        <div class="relative">
          <button id="notification-btn" class="relative p-2 text-gray-300 hover:text-white transition-colors" aria-label="알림">
            <i class="fas fa-bell text-xl"></i>
            <span id="notification-badge" class="hidden absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">0</span>
          </button>
          
          <!-- 알림 드롭다운 -->
          <div id="notification-dropdown" class="hidden absolute right-0 mt-2 w-80 bg-gray-800 rounded-lg shadow-2xl border border-gray-700 z-50 max-h-[500px] overflow-hidden flex flex-col">
            <div class="p-4 border-b border-gray-700 flex justify-between items-center">
              <h3 class="text-white font-semibold">알림</h3>
              <button id="mark-all-read" class="text-blue-400 hover:text-blue-300 text-sm">모두 읽음</button>
            </div>
            
            <div id="notification-list" class="overflow-y-auto flex-1">
              <div class="p-4 text-gray-400 text-center">알림을 불러오는 중...</div>
            </div>
          </div>
        </div>
      `
      
      header.insertAdjacentHTML('beforeend', notificationHTML)
    }

    this.notificationBadge = document.getElementById('notification-badge')
    this.notificationDropdown = document.getElementById('notification-dropdown')
  }

  // 이벤트 리스너 연결
  attachEventListeners() {
    const notificationBtn = document.getElementById('notification-btn')
    const markAllReadBtn = document.getElementById('mark-all-read')

    if (notificationBtn) {
      notificationBtn.addEventListener('click', (e) => {
        e.stopPropagation()
        this.toggleDropdown()
      })
    }

    if (markAllReadBtn) {
      markAllReadBtn.addEventListener('click', () => {
        this.markAllAsRead()
      })
    }

    // 드롭다운 외부 클릭 시 닫기
    document.addEventListener('click', (e) => {
      const dropdown = this.notificationDropdown
      const btn = document.getElementById('notification-btn')
      
      if (dropdown && btn && this.isDropdownOpen) {
        if (!dropdown.contains(e.target) && !btn.contains(e.target)) {
          this.closeDropdown()
        }
      }
    })
  }

  // 폴링 시작
  startPolling() {
    // 즉시 한 번 실행
    this.fetchNotifications()
    
    // 주기적으로 실행
    this.pollingInterval = setInterval(() => {
      this.fetchNotifications()
    }, this.pollDelay)
  }

  // 폴링 중지
  stopPolling() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval)
      this.pollingInterval = null
    }
  }

  // 알림 가져오기
  async fetchNotifications() {
    try {
      const response = await fetch(`/api/notifications?userId=${this.userId}&limit=20`)
      const data = await response.json()

      if (data.notifications) {
        this.updateNotificationBadge(data.notifications)
        
        if (this.isDropdownOpen) {
          this.renderNotifications(data.notifications)
        }
      }
    } catch (error) {
      console.error('❌ 알림 가져오기 실패:', error)
    }
  }

  // 배지 업데이트
  updateNotificationBadge(notifications) {
    const unreadCount = notifications.filter(n => !n.is_read).length
    
    if (this.notificationBadge) {
      if (unreadCount > 0) {
        this.notificationBadge.textContent = unreadCount > 99 ? '99+' : unreadCount
        this.notificationBadge.classList.remove('hidden')
      } else {
        this.notificationBadge.classList.add('hidden')
      }
    }
  }

  // 알림 렌더링
  renderNotifications(notifications) {
    const notificationList = document.getElementById('notification-list')
    if (!notificationList) return

    if (notifications.length === 0) {
      notificationList.innerHTML = '<div class="p-8 text-gray-400 text-center">알림이 없습니다</div>'
      return
    }

    const html = notifications.map(notification => {
      const icon = this.getNotificationIcon(notification.type)
      const time = this.formatTime(notification.created_at)
      const unreadClass = !notification.is_read ? 'bg-gray-700/50' : 'bg-transparent'
      
      return `
        <div class="notification-item ${unreadClass} p-4 border-b border-gray-700 hover:bg-gray-700/30 transition-colors cursor-pointer" 
             data-id="${notification.id}" 
             data-link="${notification.link || '#'}" 
             data-read="${notification.is_read}">
          <div class="flex items-start space-x-3">
            <div class="flex-shrink-0">
              <i class="${icon} text-blue-400 text-lg"></i>
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-white font-medium text-sm">${notification.title}</p>
              <p class="text-gray-400 text-xs mt-1">${notification.message}</p>
              <p class="text-gray-500 text-xs mt-1">${time}</p>
            </div>
            ${!notification.is_read ? '<div class="flex-shrink-0"><div class="w-2 h-2 bg-blue-500 rounded-full"></div></div>' : ''}
          </div>
        </div>
      `
    }).join('')

    notificationList.innerHTML = html

    // 알림 클릭 이벤트
    notificationList.querySelectorAll('.notification-item').forEach(item => {
      item.addEventListener('click', () => {
        const id = item.dataset.id
        const link = item.dataset.link
        const isRead = item.dataset.read === 'true'

        if (!isRead) {
          this.markAsRead(id)
        }

        if (link && link !== '#') {
          window.location.href = link
        }

        this.closeDropdown()
      })
    })
  }

  // 알림 타입별 아이콘
  getNotificationIcon(type) {
    const icons = {
      'artwork_approved': 'fas fa-check-circle',
      'artwork_rejected': 'fas fa-times-circle',
      'new_comment': 'fas fa-comment',
      'new_like': 'fas fa-heart',
      'new_follower': 'fas fa-user-plus',
      'purchase': 'fas fa-shopping-cart',
      'system': 'fas fa-info-circle',
    }
    return icons[type] || 'fas fa-bell'
  }

  // 시간 포맷
  formatTime(timestamp) {
    const now = new Date()
    const time = new Date(timestamp)
    const diff = Math.floor((now - time) / 1000) // 초 단위

    if (diff < 60) return '방금 전'
    if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
    if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
    if (diff < 604800) return `${Math.floor(diff / 86400)}일 전`
    
    return time.toLocaleDateString('ko-KR')
  }

  // 드롭다운 토글
  toggleDropdown() {
    if (this.isDropdownOpen) {
      this.closeDropdown()
    } else {
      this.openDropdown()
    }
  }

  // 드롭다운 열기
  async openDropdown() {
    if (!this.notificationDropdown) return
    
    this.notificationDropdown.classList.remove('hidden')
    this.isDropdownOpen = true
    
    await this.fetchNotifications()
  }

  // 드롭다운 닫기
  closeDropdown() {
    if (!this.notificationDropdown) return
    
    this.notificationDropdown.classList.add('hidden')
    this.isDropdownOpen = false
  }

  // 읽음 처리
  async markAsRead(notificationId) {
    try {
      await fetch(`/api/notifications/${notificationId}/read?userId=${this.userId}`, {
        method: 'PUT'
      })
      
      await this.fetchNotifications()
    } catch (error) {
      console.error('❌ 읽음 처리 실패:', error)
    }
  }

  // 모두 읽음 처리
  async markAllAsRead() {
    try {
      await fetch(`/api/notifications/read-all?userId=${this.userId}`, {
        method: 'PUT'
      })
      
      await this.fetchNotifications()
    } catch (error) {
      console.error('❌ 모두 읽음 처리 실패:', error)
    }
  }

  // 정리
  destroy() {
    this.stopPolling()
  }
}

// 전역 인스턴스
window.notificationManager = null

// 페이지 로드 시 초기화
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    window.notificationManager = new NotificationManager()
    window.notificationManager.init()
  })
} else {
  window.notificationManager = new NotificationManager()
  window.notificationManager.init()
}
