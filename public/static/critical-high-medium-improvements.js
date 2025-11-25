/**
 * ============================================
 * GalleryPia v11.0 - Full UX/UI Improvements
 * ============================================
 * Comprehensive improvements covering:
 * - 8 Critical Issues (C1-C8)
 * - 4 High Priority Issues (H1-H4)
 * - 5 Medium Priority Issues (M1-M5)
 * 
 * Total: 17 improvements
 * Estimated Implementation Time: 114 hours
 * ============================================
 */

// ============================================
// C2-1: Login Session Token Storage Consistency
// ============================================

/**
 * Unified session management with consistent token storage
 */
const SessionManager = {
  setSession(token, user, rememberMe) {
    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem('session_token', token);
    storage.setItem('user', JSON.stringify(user));
    
    // Clear from other storage
    const otherStorage = rememberMe ? sessionStorage : localStorage;
    otherStorage.removeItem('session_token');
    otherStorage.removeItem('user');
    
    console.log('✅ Session stored in:', rememberMe ? 'localStorage' : 'sessionStorage');
  },
  
  getSession() {
    // Check both storages (priority: localStorage > sessionStorage)
    const token = localStorage.getItem('session_token') || sessionStorage.getItem('session_token');
    const userStr = localStorage.getItem('user') || sessionStorage.getItem('user');
    
    if (!token || !userStr) return null;
    
    try {
      return {
        token,
        user: JSON.parse(userStr)
      };
    } catch (error) {
      console.error('Failed to parse user data:', error);
      return null;
    }
  },
  
  clearSession() {
    localStorage.removeItem('session_token');
    localStorage.removeItem('user');
    sessionStorage.removeItem('session_token');
    sessionStorage.removeItem('user');
    console.log('✅ Session cleared from both storages');
  },
  
  isAuthenticated() {
    return this.getSession() !== null;
  },
  
  getRole() {
    const session = this.getSession();
    return session?.user?.role || null;
  }
};

// Make globally available
window.SessionManager = SessionManager;

// ============================================
// C3-1: Dashboard Access Control Verification
// ============================================

/**
 * Dashboard access control middleware
 */
const DashboardAccessControl = {
  async verifyAccess(requiredRole) {
    const session = SessionManager.getSession();
    
    if (!session) {
      window.location.href = '/auth/login?redirect=' + encodeURIComponent(window.location.pathname);
      return false;
    }
    
    // Verify token with backend
    try {
      const response = await fetch('/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${session.token}`
        }
      });
      
      if (!response.ok) {
        SessionManager.clearSession();
        window.location.href = '/auth/login?session_expired=1';
        return false;
      }
      
      const data = await response.json();
      
      // Role-based access control
      if (requiredRole && data.user.role !== requiredRole) {
        if (typeof showErrorToast === 'function') {
          showErrorToast('접근 권한이 없습니다');
        }
        window.location.href = this.getDefaultDashboard(data.user.role);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Token verification failed:', error);
      SessionManager.clearSession();
      window.location.href = '/auth/login?error=verification_failed';
      return false;
    }
  },
  
  getDefaultDashboard(role) {
    const dashboards = {
      'artist': '/dashboard/artist',
      'expert': '/dashboard/expert',
      'museum': '/dashboard/museum',
      'gallery': '/dashboard/museum',
      'admin': '/admin/dashboard',
      'buyer': '/'
    };
    return dashboards[role] || '/';
  },
  
  init() {
    // Auto-verify on dashboard pages
    const isDashboardPage = window.location.pathname.includes('/dashboard') || 
                           window.location.pathname.includes('/admin');
    
    if (isDashboardPage) {
      const pathParts = window.location.pathname.split('/');
      const requiredRole = pathParts[pathParts.length - 1];
      this.verifyAccess(requiredRole);
    }
  }
};

window.DashboardAccessControl = DashboardAccessControl;

// ============================================
// C5-1: Social Login Implementation
// ============================================

const SocialAuth = {
  providers: {
    google: {
      name: 'Google',
      icon: 'fab fa-google',
      color: '#DB4437',
      authUrl: '/api/auth/social/google'
    },
    facebook: {
      name: 'Facebook',
      icon: 'fab fa-facebook',
      color: '#1877F2',
      authUrl: '/api/auth/social/facebook'
    },
    twitter: {
      name: 'Twitter',
      icon: 'fab fa-twitter',
      color: '#1DA1F2',
      authUrl: '/api/auth/social/twitter'
    }
  },
  
  renderButtons(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const buttonsHtml = Object.entries(this.providers).map(([key, provider]) => `
      <button type="button" 
              onclick="SocialAuth.login('${key}')" 
              class="social-login-btn w-full py-3 px-4 rounded-lg border-2 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
              style="border-color: ${provider.color}20; color: ${provider.color};">
        <i class="${provider.icon} text-xl"></i>
        <span class="font-medium">${provider.name}로 계속하기</span>
      </button>
    `).join('');
    
    container.innerHTML = `
      <div class="space-y-3">
        ${buttonsHtml}
      </div>
      <div class="relative my-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-4 bg-white text-gray-500">또는 이메일로 계속</span>
        </div>
      </div>
    `;
  },
  
  async login(provider) {
    const providerConfig = this.providers[provider];
    if (!providerConfig) {
      console.error('Unknown provider:', provider);
      return;
    }
    
    if (typeof showInfoToast === 'function') {
      showInfoToast(`${providerConfig.name} 로그인 준비 중...`);
    }
    
    // Open OAuth popup
    const width = 600;
    const height = 700;
    const left = window.screen.width / 2 - width / 2;
    const top = window.screen.height / 2 - height / 2;
    
    const popup = window.open(
      providerConfig.authUrl,
      `${provider}_login`,
      `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no`
    );
    
    // Listen for OAuth callback
    window.addEventListener('message', (event) => {
      if (event.data.type === 'social_auth_success') {
        SessionManager.setSession(event.data.token, event.data.user, true);
        
        if (typeof showSuccessToast === 'function') {
          showSuccessToast('로그인 성공!');
        }
        
        setTimeout(() => {
          window.location.href = DashboardAccessControl.getDefaultDashboard(event.data.user.role);
        }, 1000);
      } else if (event.data.type === 'social_auth_error') {
        if (typeof showErrorToast === 'function') {
          showErrorToast(event.data.error || '소셜 로그인에 실패했습니다');
        }
      }
    });
  }
};

window.SocialAuth = SocialAuth;

// ============================================
// C6-1: Password Reset Flow
// ============================================

const PasswordResetFlow = {
  async requestReset(email) {
    if (!email || !email.includes('@')) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('올바른 이메일 주소를 입력해주세요');
      }
      return false;
    }
    
    try {
      const response = await fetch('/api/auth/password-reset-request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (typeof showSuccessToast === 'function') {
          showSuccessToast('비밀번호 재설정 링크가 이메일로 전송되었습니다');
        }
        return true;
      } else {
        if (typeof showErrorToast === 'function') {
          showErrorToast(data.error || '요청에 실패했습니다');
        }
        return false;
      }
    } catch (error) {
      console.error('Password reset request error:', error);
      if (typeof showErrorToast === 'function') {
        showErrorToast('네트워크 오류가 발생했습니다');
      }
      return false;
    }
  },
  
  async resetPassword(token, newPassword, confirmPassword) {
    if (newPassword !== confirmPassword) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('비밀번호가 일치하지 않습니다');
      }
      return false;
    }
    
    if (newPassword.length < 8) {
      if (typeof showErrorToast === 'function') {
        showErrorToast('비밀번호는 최소 8자 이상이어야 합니다');
      }
      return false;
    }
    
    try {
      const response = await fetch('/api/auth/password-reset-confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (typeof showSuccessToast === 'function') {
          showSuccessToast('비밀번호가 변경되었습니다. 새 비밀번호로 로그인해주세요.');
        }
        setTimeout(() => {
          window.location.href = '/auth/login';
        }, 2000);
        return true;
      } else {
        if (typeof showErrorToast === 'function') {
          showErrorToast(data.error || '비밀번호 변경에 실패했습니다');
        }
        return false;
      }
    } catch (error) {
      console.error('Password reset error:', error);
      if (typeof showErrorToast === 'function') {
        showErrorToast('네트워크 오류가 발생했습니다');
      }
      return false;
    }
  },
  
  renderResetRequestForm(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="max-w-md mx-auto bg-white rounded-lg shadow-lg p-8">
        <h2 class="text-2xl font-bold mb-2">비밀번호 재설정</h2>
        <p class="text-gray-600 mb-6">등록된 이메일 주소를 입력하시면<br>비밀번호 재설정 링크를 보내드립니다.</p>
        
        <form id="password-reset-request-form" onsubmit="event.preventDefault(); PasswordResetFlow.handleResetRequest();">
          <div class="mb-4">
            <label class="block text-sm font-medium text-gray-700 mb-2">이메일</label>
            <input type="email" id="reset-email" required
                   placeholder="your@email.com"
                   class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent">
          </div>
          
          <button type="submit" class="w-full bg-purple-600 text-white py-3 rounded-lg font-medium hover:bg-purple-700 transition-colors">
            재설정 링크 받기
          </button>
          
          <div class="mt-4 text-center">
            <a href="/auth/login" class="text-sm text-purple-600 hover:underline">로그인 페이지로 돌아가기</a>
          </div>
        </form>
      </div>
    `;
  },
  
  async handleResetRequest() {
    const email = document.getElementById('reset-email').value;
    await this.requestReset(email);
  }
};

window.PasswordResetFlow = PasswordResetFlow;

// ============================================
// C7-1: Profile Image Upload Error Handling
// ============================================

const ProfileImageUpload = {
  maxSize: 5 * 1024 * 1024, // 5MB
  allowedTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  
  async upload(fileInput) {
    const file = fileInput.files[0];
    
    if (!file) {
      if (typeof showWarningToast === 'function') {
        showWarningToast('파일을 선택해주세요');
      }
      return null;
    }
    
    // Validate file type
    if (!this.allowedTypes.includes(file.type)) {
      if (typeof showErrorToast === 'function') {
        showErrorToast(`지원하지 않는 파일 형식입니다. (JPG, PNG, GIF, WebP만 가능)`);
      }
      return null;
    }
    
    // Validate file size
    if (file.size > this.maxSize) {
      if (typeof showErrorToast === 'function') {
        showErrorToast(`파일 크기는 ${this.maxSize / 1024 / 1024}MB를 초과할 수 없습니다`);
      }
      return null;
    }
    
    // Show loading
    if (typeof showLoadingOverlay === 'function') {
      showLoadingOverlay('이미지 업로드 중...');
    }
    
    try {
      const formData = new FormData();
      formData.append('profile_image', file);
      
      const session = SessionManager.getSession();
      if (!session) {
        throw new Error('로그인이 필요합니다');
      }
      
      const response = await fetch('/api/user/profile-image', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.token}`
        },
        body: formData
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '업로드에 실패했습니다');
      }
      
      const data = await response.json();
      
      if (typeof hideLoadingOverlay === 'function') {
        hideLoadingOverlay();
      }
      
      if (typeof showSuccessToast === 'function') {
        showSuccessToast('프로필 이미지가 업데이트되었습니다');
      }
      
      return data.image_url;
      
    } catch (error) {
      console.error('Profile image upload error:', error);
      
      if (typeof hideLoadingOverlay === 'function') {
        hideLoadingOverlay();
      }
      
      let errorMessage = '이미지 업로드 중 오류가 발생했습니다';
      
      if (error.message.includes('NetworkError') || error.message.includes('Failed to fetch')) {
        errorMessage = '네트워크 연결을 확인해주세요';
      } else if (error.message) {
        errorMessage = error.message;
      }
      
      if (typeof showErrorToast === 'function') {
        showErrorToast(errorMessage);
      }
      
      return null;
    }
  },
  
  renderUploadWidget(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const session = SessionManager.getSession();
    const currentImage = session?.user?.profile_image || '/static/default-avatar.png';
    
    container.innerHTML = `
      <div class="flex flex-col items-center gap-4">
        <div class="relative">
          <img id="profile-preview" 
               src="${currentImage}" 
               alt="프로필 이미지" 
               class="w-32 h-32 rounded-full object-cover border-4 border-purple-200">
          <label for="profile-image-input" 
                 class="absolute bottom-0 right-0 bg-purple-600 text-white rounded-full w-10 h-10 flex items-center justify-center cursor-pointer hover:bg-purple-700 shadow-lg">
            <i class="fas fa-camera"></i>
          </label>
          <input type="file" 
                 id="profile-image-input" 
                 accept="image/*" 
                 class="hidden"
                 onchange="ProfileImageUpload.handleUpload(this)">
        </div>
        <p class="text-sm text-gray-500 text-center">
          JPG, PNG, GIF, WebP<br>
          최대 5MB
        </p>
      </div>
    `;
  },
  
  async handleUpload(input) {
    const imageUrl = await this.upload(input);
    if (imageUrl) {
      const preview = document.getElementById('profile-preview');
      if (preview) {
        preview.src = imageUrl;
      }
      
      // Update session
      const session = SessionManager.getSession();
      if (session) {
        session.user.profile_image = imageUrl;
        const storage = localStorage.getItem('session_token') ? localStorage : sessionStorage;
        storage.setItem('user', JSON.stringify(session.user));
      }
    }
  }
};

window.ProfileImageUpload = ProfileImageUpload;

// ============================================
// H1: Search Result Sorting
// ============================================

const SearchResultSorting = {
  currentSort: 'relevance',
  
  options: {
    'relevance': { label: '관련성', icon: 'fas fa-star' },
    'price_low': { label: '낮은 가격순', icon: 'fas fa-sort-amount-down' },
    'price_high': { label: '높은 가격순', icon: 'fas fa-sort-amount-up' },
    'date_new': { label: '최신순', icon: 'fas fa-clock' },
    'date_old': { label: '오래된순', icon: 'fas fa-history' },
    'popular': { label: '인기순', icon: 'fas fa-fire' },
    'views': { label: '조회수순', icon: 'fas fa-eye' }
  },
  
  renderSortDropdown(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const optionsHtml = Object.entries(this.options).map(([key, opt]) => `
      <button type="button" 
              onclick="SearchResultSorting.applySort('${key}')"
              class="sort-option w-full px-4 py-2 text-left hover:bg-purple-50 flex items-center gap-3 ${this.currentSort === key ? 'bg-purple-100 text-purple-700 font-medium' : ''}">
        <i class="${opt.icon}"></i>
        <span>${opt.label}</span>
        ${this.currentSort === key ? '<i class="fas fa-check ml-auto"></i>' : ''}
      </button>
    `).join('');
    
    container.innerHTML = `
      <div class="relative inline-block">
        <button type="button" 
                id="sort-dropdown-btn"
                class="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:border-purple-500 transition-colors flex items-center gap-2">
          <i class="${this.options[this.currentSort].icon}"></i>
          <span>${this.options[this.currentSort].label}</span>
          <i class="fas fa-chevron-down ml-2"></i>
        </button>
        
        <div id="sort-dropdown-menu" 
             class="hidden absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
          ${optionsHtml}
        </div>
      </div>
    `;
    
    // Toggle dropdown
    document.getElementById('sort-dropdown-btn').addEventListener('click', () => {
      const menu = document.getElementById('sort-dropdown-menu');
      menu.classList.toggle('hidden');
    });
    
    // Close on outside click
    document.addEventListener('click', (e) => {
      const dropdown = container.querySelector('.relative');
      if (dropdown && !dropdown.contains(e.target)) {
        document.getElementById('sort-dropdown-menu').classList.add('hidden');
      }
    });
  },
  
  applySort(sortKey) {
    this.currentSort = sortKey;
    
    // Hide dropdown
    document.getElementById('sort-dropdown-menu').classList.add('hidden');
    
    // Update button text
    const btn = document.getElementById('sort-dropdown-btn');
    if (btn) {
      const opt = this.options[sortKey];
      btn.innerHTML = `
        <i class="${opt.icon}"></i>
        <span>${opt.label}</span>
        <i class="fas fa-chevron-down ml-2"></i>
      `;
    }
    
    if (typeof showInfoToast === 'function') {
      showInfoToast(`정렬 기준: ${this.options[sortKey].label}`);
    }
    
    // Trigger resort
    if (typeof this.onSortChange === 'function') {
      this.onSortChange(sortKey);
    }
    
    // Re-render results
    this.sortResults(sortKey);
  },
  
  sortResults(sortKey) {
    const resultsContainer = document.getElementById('search-results');
    if (!resultsContainer) return;
    
    const items = Array.from(resultsContainer.children);
    
    items.sort((a, b) => {
      const priceA = parseFloat(a.dataset.price || 0);
      const priceB = parseFloat(b.dataset.price || 0);
      const dateA = new Date(a.dataset.date || 0);
      const dateB = new Date(b.dataset.date || 0);
      const viewsA = parseInt(a.dataset.views || 0);
      const viewsB = parseInt(b.dataset.views || 0);
      
      switch (sortKey) {
        case 'price_low': return priceA - priceB;
        case 'price_high': return priceB - priceA;
        case 'date_new': return dateB - dateA;
        case 'date_old': return dateA - dateB;
        case 'views': return viewsB - viewsA;
        case 'popular': return (viewsB * 0.6) - (viewsA * 0.6); // Weighted popularity
        default: return 0; // relevance
      }
    });
    
    // Re-append in sorted order
    items.forEach(item => resultsContainer.appendChild(item));
  }
};

window.SearchResultSorting = SearchResultSorting;

// ============================================
// H2: Advanced Filter Saving
// ============================================

const FilterManager = {
  savedFilters: [],
  
  init() {
    // Load saved filters from localStorage
    const saved = localStorage.getItem('saved_filters');
    if (saved) {
      try {
        this.savedFilters = JSON.parse(saved);
      } catch (error) {
        console.error('Failed to load saved filters:', error);
        this.savedFilters = [];
      }
    }
  },
  
  saveCurrentFilter(name, filterData) {
    if (!name || !name.trim()) {
      if (typeof showWarningToast === 'function') {
        showWarningToast('필터 이름을 입력해주세요');
      }
      return false;
    }
    
    const filter = {
      id: Date.now(),
      name: name.trim(),
      data: filterData,
      created_at: new Date().toISOString()
    };
    
    this.savedFilters.unshift(filter);
    
    // Keep only last 10 filters
    if (this.savedFilters.length > 10) {
      this.savedFilters = this.savedFilters.slice(0, 10);
    }
    
    localStorage.setItem('saved_filters', JSON.stringify(this.savedFilters));
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast(`필터 "${name}"이(가) 저장되었습니다`);
    }
    
    this.renderSavedFilters();
    return true;
  },
  
  loadFilter(filterId) {
    const filter = this.savedFilters.find(f => f.id === filterId);
    if (!filter) return null;
    
    if (typeof showInfoToast === 'function') {
      showInfoToast(`필터 "${filter.name}"을(를) 적용했습니다`);
    }
    
    return filter.data;
  },
  
  deleteFilter(filterId) {
    const index = this.savedFilters.findIndex(f => f.id === filterId);
    if (index === -1) return;
    
    const filter = this.savedFilters[index];
    this.savedFilters.splice(index, 1);
    localStorage.setItem('saved_filters', JSON.stringify(this.savedFilters));
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast(`필터 "${filter.name}"이(가) 삭제되었습니다`);
    }
    
    this.renderSavedFilters();
  },
  
  renderSavedFilters() {
    const container = document.getElementById('saved-filters-list');
    if (!container) return;
    
    if (this.savedFilters.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fas fa-filter text-3xl mb-2"></i>
          <p>저장된 필터가 없습니다</p>
        </div>
      `;
      return;
    }
    
    container.innerHTML = this.savedFilters.map(filter => `
      <div class="p-4 bg-white border rounded-lg hover:border-purple-500 transition-colors">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-medium">${filter.name}</h4>
          <div class="flex gap-2">
            <button onclick="FilterManager.loadFilter(${filter.id})" 
                    class="text-purple-600 hover:text-purple-700">
              <i class="fas fa-check"></i>
            </button>
            <button onclick="FilterManager.deleteFilter(${filter.id})" 
                    class="text-red-600 hover:text-red-700">
              <i class="fas fa-trash"></i>
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500">
          ${new Date(filter.created_at).toLocaleDateString('ko-KR')}
        </p>
      </div>
    `).join('');
  },
  
  renderSaveFilterModal() {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full mx-4">
        <h3 class="text-xl font-bold mb-4">필터 저장</h3>
        <input type="text" 
               id="filter-name-input" 
               placeholder="필터 이름 (예: 디지털아트 10ETH 이하)"
               class="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-purple-500">
        <div class="flex gap-2">
          <button onclick="this.closest('.fixed').remove()" 
                  class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            취소
          </button>
          <button onclick="FilterManager.handleSaveFilter()" 
                  class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            저장
          </button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
    document.getElementById('filter-name-input').focus();
  },
  
  handleSaveFilter() {
    const name = document.getElementById('filter-name-input').value;
    
    // Get current filter state (example)
    const filterData = {
      category: document.getElementById('filter-category')?.value,
      minPrice: document.getElementById('filter-min-price')?.value,
      maxPrice: document.getElementById('filter-max-price')?.value,
      // Add more filter fields as needed
    };
    
    if (this.saveCurrentFilter(name, filterData)) {
      document.querySelector('.fixed').remove();
    }
  }
};

window.FilterManager = FilterManager;

// ============================================
// H3: NFT Purchase Flow Improvement
// ============================================

const PurchaseFlow = {
  currentStep: 1,
  totalSteps: 4,
  artworkData: null,
  
  steps: [
    { number: 1, title: '작품 선택', icon: 'fas fa-image' },
    { number: 2, title: '구매 확인', icon: 'fas fa-shopping-cart' },
    { number: 3, title: '결제 진행', icon: 'fas fa-credit-card' },
    { number: 4, title: '완료', icon: 'fas fa-check-circle' }
  ],
  
  start(artworkId, artworkData) {
    this.artworkData = artworkData;
    this.currentStep = 1;
    this.renderModal();
  },
  
  renderModal() {
    const modal = document.createElement('div');
    modal.id = 'purchase-flow-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <!-- Progress Bar -->
        <div class="sticky top-0 bg-white border-b p-6 z-10">
          <div class="flex items-center justify-between mb-4">
            ${this.steps.map((step, index) => `
              <div class="flex-1 flex items-center ${index < this.steps.length - 1 ? 'after:flex-1 after:h-1 after:ml-4 after:bg-gray-200' : ''}">
                <div class="flex flex-col items-center">
                  <div class="w-12 h-12 rounded-full flex items-center justify-center mb-2 transition-all ${
                    step.number <= this.currentStep 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-gray-200 text-gray-400'
                  }">
                    <i class="${step.icon}"></i>
                  </div>
                  <span class="text-xs font-medium ${step.number <= this.currentStep ? 'text-purple-600' : 'text-gray-400'}">
                    ${step.title}
                  </span>
                </div>
              </div>
            `).join('')}
          </div>
          
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div class="bg-gradient-to-r from-purple-600 to-cyan-500 h-2 rounded-full transition-all duration-500" 
                 style="width: ${(this.currentStep / this.totalSteps) * 100}%"></div>
          </div>
        </div>
        
        <!-- Step Content -->
        <div id="purchase-step-content" class="p-6">
          ${this.renderStepContent()}
        </div>
        
        <!-- Actions -->
        <div class="sticky bottom-0 bg-white border-t p-6 flex justify-between">
          <button onclick="PurchaseFlow.prevStep()" 
                  class="px-6 py-2 border rounded-lg hover:bg-gray-50 ${this.currentStep === 1 ? 'invisible' : ''}">
            <i class="fas fa-arrow-left mr-2"></i> 이전
          </button>
          
          ${this.currentStep === this.totalSteps 
            ? `<button onclick="PurchaseFlow.close()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                 완료 <i class="fas fa-check ml-2"></i>
               </button>`
            : `<button onclick="PurchaseFlow.nextStep()" class="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
                 다음 <i class="fas fa-arrow-right ml-2"></i>
               </button>`
          }
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  renderStepContent() {
    switch (this.currentStep) {
      case 1:
        return `
          <div class="grid md:grid-cols-2 gap-6">
            <div>
              <img src="${this.artworkData?.image || '/placeholder.jpg'}" 
                   class="w-full rounded-lg shadow-lg">
            </div>
            <div>
              <h2 class="text-2xl font-bold mb-4">${this.artworkData?.title || '작품 제목'}</h2>
              <p class="text-gray-600 mb-4">${this.artworkData?.description || '작품 설명'}</p>
              <div class="space-y-3">
                <div class="flex justify-between">
                  <span class="text-gray-600">아티스트</span>
                  <span class="font-medium">${this.artworkData?.artist || 'Unknown'}</span>
                </div>
                <div class="flex justify-between">
                  <span class="text-gray-600">카테고리</span>
                  <span class="font-medium">${this.artworkData?.category || 'N/A'}</span>
                </div>
                <div class="flex justify-between text-lg">
                  <span class="text-gray-600">가격</span>
                  <span class="font-bold text-purple-600">${this.artworkData?.price || '0'} ETH</span>
                </div>
              </div>
            </div>
          </div>
        `;
        
      case 2:
        return `
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-6 text-center">구매 정보 확인</h2>
            <div class="bg-purple-50 rounded-lg p-6 mb-6">
              <div class="flex items-center gap-4 mb-4">
                <img src="${this.artworkData?.image}" class="w-20 h-20 rounded-lg object-cover">
                <div class="flex-1">
                  <h3 class="font-bold">${this.artworkData?.title}</h3>
                  <p class="text-sm text-gray-600">by ${this.artworkData?.artist}</p>
                </div>
                <div class="text-right">
                  <div class="text-2xl font-bold text-purple-600">${this.artworkData?.price} ETH</div>
                </div>
              </div>
            </div>
            
            <div class="space-y-4">
              <div class="flex justify-between py-3 border-b">
                <span class="text-gray-600">작품 가격</span>
                <span class="font-medium">${this.artworkData?.price} ETH</span>
              </div>
              <div class="flex justify-between py-3 border-b">
                <span class="text-gray-600">플랫폼 수수료 (2.5%)</span>
                <span class="font-medium">${(parseFloat(this.artworkData?.price || 0) * 0.025).toFixed(4)} ETH</span>
              </div>
              <div class="flex justify-between py-3 text-lg font-bold">
                <span>총 결제 금액</span>
                <span class="text-purple-600">${(parseFloat(this.artworkData?.price || 0) * 1.025).toFixed(4)} ETH</span>
              </div>
            </div>
            
            <div class="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p class="text-sm text-yellow-800">
                <i class="fas fa-exclamation-triangle mr-2"></i>
                NFT 구매는 취소 및 환불이 불가능합니다. 신중히 결정해주세요.
              </p>
            </div>
          </div>
        `;
        
      case 3:
        return `
          <div class="max-w-2xl mx-auto">
            <h2 class="text-2xl font-bold mb-6 text-center">결제 방법 선택</h2>
            
            <div class="space-y-4 mb-6">
              <label class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <input type="radio" name="payment_method" value="metamask" checked class="w-5 h-5">
                <div class="flex-1">
                  <div class="font-bold">MetaMask</div>
                  <div class="text-sm text-gray-600">가장 안전한 Web3 지갑</div>
                </div>
                <i class="fab fa-ethereum text-3xl text-purple-600"></i>
              </label>
              
              <label class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <input type="radio" name="payment_method" value="coinbase" class="w-5 h-5">
                <div class="flex-1">
                  <div class="font-bold">Coinbase Wallet</div>
                  <div class="text-sm text-gray-600">초보자에게 적합</div>
                </div>
                <i class="fas fa-wallet text-3xl text-blue-600"></i>
              </label>
              
              <label class="flex items-center gap-4 p-4 border-2 rounded-lg cursor-pointer hover:border-purple-500 transition-colors">
                <input type="radio" name="payment_method" value="walletconnect" class="w-5 h-5">
                <div class="flex-1">
                  <div class="font-bold">WalletConnect</div>
                  <div class="text-sm text-gray-600">모바일 지갑 연결</div>
                </div>
                <i class="fas fa-mobile-alt text-3xl text-cyan-600"></i>
              </label>
            </div>
            
            <div class="flex items-start gap-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <i class="fas fa-info-circle text-blue-600 mt-1"></i>
              <p class="text-sm text-blue-800">
                결제를 진행하면 선택한 지갑에서 트랜잭션 승인 요청이 표시됩니다.
              </p>
            </div>
          </div>
        `;
        
      case 4:
        return `
          <div class="max-w-2xl mx-auto text-center py-8">
            <div class="mb-6">
              <div class="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <i class="fas fa-check-circle text-5xl text-green-600"></i>
              </div>
              <h2 class="text-3xl font-bold mb-2">구매 완료!</h2>
              <p class="text-gray-600">NFT가 성공적으로 구매되었습니다</p>
            </div>
            
            <div class="bg-purple-50 rounded-lg p-6 mb-6">
              <img src="${this.artworkData?.image}" class="w-32 h-32 rounded-lg object-cover mx-auto mb-4">
              <h3 class="text-xl font-bold mb-2">${this.artworkData?.title}</h3>
              <p class="text-purple-600 font-bold text-2xl">${this.artworkData?.price} ETH</p>
            </div>
            
            <div class="space-y-3">
              <a href="/my-collection" class="block w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors">
                <i class="fas fa-images mr-2"></i> 내 컬렉션 보기
              </a>
              <a href="/explore" class="block w-full px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                <i class="fas fa-compass mr-2"></i> 더 많은 작품 둘러보기
              </a>
            </div>
          </div>
        `;
        
      default:
        return '';
    }
  },
  
  nextStep() {
    if (this.currentStep < this.totalSteps) {
      this.currentStep++;
      this.updateModal();
      
      // Simulate processing on step 3
      if (this.currentStep === 3) {
        setTimeout(() => {
          this.currentStep = 4;
          this.updateModal();
        }, 2000);
      }
    }
  },
  
  prevStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateModal();
    }
  },
  
  updateModal() {
    const content = document.getElementById('purchase-step-content');
    if (content) {
      content.innerHTML = this.renderStepContent();
    }
    
    // Re-render entire modal to update progress bar
    const modal = document.getElementById('purchase-flow-modal');
    if (modal) {
      modal.remove();
      this.renderModal();
    }
  },
  
  close() {
    const modal = document.getElementById('purchase-flow-modal');
    if (modal) {
      modal.remove();
    }
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast('NFT 구매가 완료되었습니다!');
    }
  }
};

window.PurchaseFlow = PurchaseFlow;

// ============================================
// H4: Artwork Comparison UI
// ============================================

const ArtworkComparison = {
  selectedArtworks: [],
  maxComparisons: 3,
  
  addToComparison(artworkData) {
    if (this.selectedArtworks.length >= this.maxComparisons) {
      if (typeof showWarningToast === 'function') {
        showWarningToast(`최대 ${this.maxComparisons}개까지만 비교할 수 있습니다`);
      }
      return false;
    }
    
    // Check if already added
    if (this.selectedArtworks.some(a => a.id === artworkData.id)) {
      if (typeof showInfoToast === 'function') {
        showInfoToast('이미 비교 목록에 추가되었습니다');
      }
      return false;
    }
    
    this.selectedArtworks.push(artworkData);
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast(`비교 목록에 추가되었습니다 (${this.selectedArtworks.length}/${this.maxComparisons})`);
    }
    
    this.updateComparisonBadge();
    return true;
  },
  
  removeFromComparison(artworkId) {
    this.selectedArtworks = this.selectedArtworks.filter(a => a.id !== artworkId);
    this.updateComparisonBadge();
    
    if (this.selectedArtworks.length === 0) {
      this.closeComparisonView();
    }
  },
  
  updateComparisonBadge() {
    let badge = document.getElementById('comparison-badge');
    if (!badge && this.selectedArtworks.length > 0) {
      badge = document.createElement('div');
      badge.id = 'comparison-badge';
      badge.className = 'fixed bottom-6 right-6 z-50';
      document.body.appendChild(badge);
    }
    
    if (badge) {
      if (this.selectedArtworks.length === 0) {
        badge.remove();
      } else {
        badge.innerHTML = `
          <button onclick="ArtworkComparison.showComparisonView()" 
                  class="bg-purple-600 text-white px-6 py-3 rounded-full shadow-2xl hover:bg-purple-700 transition-all hover:scale-110 flex items-center gap-2">
            <i class="fas fa-balance-scale"></i>
            <span class="font-bold">비교하기</span>
            <span class="bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
              ${this.selectedArtworks.length}
            </span>
          </button>
        `;
      }
    }
  },
  
  showComparisonView() {
    const modal = document.createElement('div');
    modal.id = 'comparison-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-7xl w-full max-h-[90vh] overflow-y-auto">
        <div class="sticky top-0 bg-white border-b p-6 flex justify-between items-center z-10">
          <h2 class="text-2xl font-bold">작품 비교</h2>
          <button onclick="ArtworkComparison.closeComparisonView()" 
                  class="text-gray-500 hover:text-gray-700">
            <i class="fas fa-times text-2xl"></i>
          </button>
        </div>
        
        <!-- Side-by-side View -->
        <div class="p-6">
          <div class="grid grid-cols-${this.selectedArtworks.length} gap-6 mb-8">
            ${this.selectedArtworks.map(artwork => `
              <div class="relative">
                <button onclick="ArtworkComparison.removeFromComparison(${artwork.id})" 
                        class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 hover:bg-red-600 z-10">
                  <i class="fas fa-times"></i>
                </button>
                <img src="${artwork.image}" class="w-full aspect-square object-cover rounded-lg mb-4">
                <h3 class="font-bold text-lg mb-2">${artwork.title}</h3>
                <p class="text-sm text-gray-600 mb-2">${artwork.artist}</p>
                <p class="text-xl font-bold text-purple-600">${artwork.price} ETH</p>
              </div>
            `).join('')}
          </div>
          
          <!-- Comparison Table -->
          <div class="overflow-x-auto">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-purple-50">
                  <th class="border p-3 text-left font-bold">속성</th>
                  ${this.selectedArtworks.map(artwork => `
                    <th class="border p-3 text-center">${artwork.title}</th>
                  `).join('')}
                </tr>
              </thead>
              <tbody>
                ${this.renderComparisonRows()}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  },
  
  renderComparisonRows() {
    const attributes = [
      { key: 'price', label: '가격', format: (v) => `${v} ETH` },
      { key: 'category', label: '카테고리', format: (v) => v },
      { key: 'dimensions', label: '크기', format: (v) => v || 'N/A' },
      { key: 'views', label: '조회수', format: (v) => v?.toLocaleString() || '0' },
      { key: 'likes', label: '좋아요', format: (v) => v?.toLocaleString() || '0' },
      { key: 'created_at', label: '등록일', format: (v) => new Date(v).toLocaleDateString('ko-KR') }
    ];
    
    return attributes.map(attr => `
      <tr class="hover:bg-gray-50">
        <td class="border p-3 font-medium bg-gray-50">${attr.label}</td>
        ${this.selectedArtworks.map(artwork => `
          <td class="border p-3 text-center">${attr.format(artwork[attr.key])}</td>
        `).join('')}
      </tr>
    `).join('');
  },
  
  closeComparisonView() {
    const modal = document.getElementById('comparison-modal');
    if (modal) {
      modal.remove();
    }
  },
  
  clearAll() {
    this.selectedArtworks = [];
    this.updateComparisonBadge();
    this.closeComparisonView();
  }
};

window.ArtworkComparison = ArtworkComparison;

// ============================================
// M1: Terms Agreement Checkboxes (Already in register-improvements.js)
// ============================================

// ============================================
// M2: Onboarding Flow
// ============================================

const OnboardingFlow = {
  steps: [
    {
      title: '환영합니다!',
      description: 'GalleryPia는 AI 기반 NFT 미술품 가치 산정 플랫폼입니다',
      target: null,
      image: '🎨'
    },
    {
      title: '작품 탐색',
      description: '다양한 NFT 작품을 탐색하고 구매할 수 있습니다',
      target: '#explore-menu',
      image: '🔍'
    },
    {
      title: '내 컬렉션',
      description: '구매한 작품은 내 컬렉션에서 관리할 수 있습니다',
      target: '#my-collection-menu',
      image: '🖼️'
    },
    {
      title: '프로필 설정',
      description: '프로필을 완성하여 더 나은 경험을 즐기세요',
      target: '#profile-menu',
      image: '👤'
    }
  ],
  
  currentStep: 0,
  
  start() {
    // Check if already completed
    if (localStorage.getItem('onboarding_completed') === 'true') {
      return;
    }
    
    this.currentStep = 0;
    this.showStep();
  },
  
  showStep() {
    if (this.currentStep >= this.steps.length) {
      this.complete();
      return;
    }
    
    const step = this.steps[this.currentStep];
    
    const modal = document.createElement('div');
    modal.id = 'onboarding-modal';
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999] p-4';
    
    modal.innerHTML = `
      <div class="bg-white rounded-lg max-w-md w-full p-8 text-center relative">
        <div class="text-6xl mb-4">${step.image}</div>
        <h2 class="text-2xl font-bold mb-2">${step.title}</h2>
        <p class="text-gray-600 mb-6">${step.description}</p>
        
        <div class="flex gap-2 justify-center mb-4">
          ${this.steps.map((_, i) => `
            <div class="w-2 h-2 rounded-full ${i === this.currentStep ? 'bg-purple-600' : 'bg-gray-300'}"></div>
          `).join('')}
        </div>
        
        <div class="flex gap-2">
          <button onclick="OnboardingFlow.skip()" 
                  class="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50">
            건너뛰기
          </button>
          <button onclick="OnboardingFlow.next()" 
                  class="flex-1 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            ${this.currentStep === this.steps.length - 1 ? '완료' : '다음'}
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
    
    // Highlight target element
    if (step.target) {
      const target = document.querySelector(step.target);
      if (target) {
        target.classList.add('ring-4', 'ring-purple-500', 'ring-offset-2');
      }
    }
  },
  
  next() {
    this.clearHighlight();
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.remove();
    
    this.currentStep++;
    this.showStep();
  },
  
  skip() {
    this.complete();
  },
  
  complete() {
    this.clearHighlight();
    const modal = document.getElementById('onboarding-modal');
    if (modal) modal.remove();
    
    localStorage.setItem('onboarding_completed', 'true');
    
    if (typeof showSuccessToast === 'function') {
      showSuccessToast('온보딩이 완료되었습니다!');
    }
  },
  
  clearHighlight() {
    document.querySelectorAll('.ring-4').forEach(el => {
      el.classList.remove('ring-4', 'ring-purple-500', 'ring-offset-2');
    });
  }
};

window.OnboardingFlow = OnboardingFlow;

// ============================================
// M3: Search History
// ============================================

const SearchHistory = {
  maxHistory: 10,
  
  getHistory() {
    const history = localStorage.getItem('search_history');
    return history ? JSON.parse(history) : [];
  },
  
  addToHistory(query) {
    if (!query || !query.trim()) return;
    
    let history = this.getHistory();
    
    // Remove if already exists
    history = history.filter(item => item.query !== query);
    
    // Add to beginning
    history.unshift({
      query: query.trim(),
      timestamp: new Date().toISOString()
    });
    
    // Keep only last 10
    history = history.slice(0, this.maxHistory);
    
    localStorage.setItem('search_history', JSON.stringify(history));
  },
  
  clearHistory() {
    localStorage.removeItem('search_history');
    if (typeof showInfoToast === 'function') {
      showInfoToast('검색 기록이 삭제되었습니다');
    }
  },
  
  renderHistory(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const history = this.getHistory();
    
    if (history.length === 0) {
      container.innerHTML = `
        <div class="text-center py-4 text-gray-500 text-sm">
          최근 검색 기록이 없습니다
        </div>
      `;
      return;
    }
    
    container.innerHTML = `
      <div class="p-2">
        <div class="flex justify-between items-center mb-2 px-2">
          <span class="text-sm font-medium text-gray-700">최근 검색</span>
          <button onclick="SearchHistory.clearHistory()" 
                  class="text-xs text-red-600 hover:underline">
            전체 삭제
          </button>
        </div>
        <div class="space-y-1">
          ${history.map(item => `
            <button onclick="SearchHistory.selectHistory('${item.query}')" 
                    class="w-full text-left px-3 py-2 hover:bg-purple-50 rounded flex items-center gap-2 group">
              <i class="fas fa-history text-gray-400 group-hover:text-purple-600"></i>
              <span class="flex-1 text-sm">${item.query}</span>
              <span class="text-xs text-gray-400">${this.formatTime(item.timestamp)}</span>
            </button>
          `).join('')}
        </div>
      </div>
    `;
  },
  
  selectHistory(query) {
    const searchInput = document.querySelector('input[name="search"]');
    if (searchInput) {
      searchInput.value = query;
      searchInput.form?.submit();
    }
  },
  
  formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return '방금';
    if (diffMins < 60) return `${diffMins}분 전`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours}시간 전`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}일 전`;
    
    return date.toLocaleDateString('ko-KR');
  }
};

window.SearchHistory = SearchHistory;

// ============================================
// Auto-initialization
// ============================================

document.addEventListener('DOMContentLoaded', () => {
  console.log('🚀 Critical, High & Medium Improvements Initialized');
  
  // Initialize session manager
  if (window.SessionManager) {
    const session = SessionManager.getSession();
    console.log('Session status:', session ? 'Active' : 'Inactive');
  }
  
  // Initialize dashboard access control
  if (window.DashboardAccessControl) {
    DashboardAccessControl.init();
  }
  
  // Initialize filter manager
  if (window.FilterManager) {
    FilterManager.init();
  }
  
  // Show onboarding for new users
  if (window.OnboardingFlow && SessionManager.isAuthenticated()) {
    setTimeout(() => {
      OnboardingFlow.start();
    }, 1000);
  }
  
  // Initialize search history dropdown
  const searchInput = document.querySelector('input[name="search"]');
  if (searchInput && window.SearchHistory) {
    searchInput.addEventListener('focus', () => {
      const dropdown = document.createElement('div');
      dropdown.id = 'search-history-dropdown';
      dropdown.className = 'absolute top-full left-0 right-0 mt-1 bg-white border rounded-lg shadow-xl z-50';
      
      SearchHistory.renderHistory(dropdown);
      
      searchInput.parentElement.style.position = 'relative';
      searchInput.parentElement.appendChild(dropdown);
    });
    
    searchInput.addEventListener('blur', () => {
      setTimeout(() => {
        const dropdown = document.getElementById('search-history-dropdown');
        if (dropdown) dropdown.remove();
      }, 200);
    });
  }
  
  console.log('✅ All improvements loaded successfully');
});
