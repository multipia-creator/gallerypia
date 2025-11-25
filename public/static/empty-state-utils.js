/**
 * Empty State Utilities
 * 
 * Client-side utilities for managing empty states in GalleryPia platform
 * Addresses UX-H-001: Missing Empty States
 * 
 * Usage:
 * - Import this file in HTML pages that need empty state handling
 * - Use global functions to show/hide empty states dynamically
 * 
 * @module empty-state-utils
 */

// ====================================
// Empty State Management
// ====================================

/**
 * Show empty state in a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} config - Empty state configuration
 * @param {string} config.icon - FontAwesome icon class
 * @param {string} config.title - Title text
 * @param {string} config.description - Description text
 * @param {Array} config.actions - Array of action buttons
 * @param {string} config.size - Size: 'sm', 'md', 'lg'
 */
function showEmptyState(container, config = {}) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) {
    console.warn('showEmptyState: container not found', container);
    return;
  }

  const {
    icon = 'fa-inbox',
    title = 'No data',
    description = '',
    actions = [],
    size = 'md'
  } = config;

  // Store original content for later restoration
  if (!element.dataset.originalContent) {
    element.dataset.originalContent = element.innerHTML;
  }

  const sizeClasses = {
    sm: { padding: 'py-8', iconSize: 'text-4xl', titleSize: 'text-lg' },
    md: { padding: 'py-12', iconSize: 'text-6xl', titleSize: 'text-2xl' },
    lg: { padding: 'py-16', iconSize: 'text-8xl', titleSize: 'text-3xl' }
  };

  const sizeConfig = sizeClasses[size] || sizeClasses.md;

  const actionsHtml = actions.map(action => {
    const variantClasses = {
      primary: 'bg-blue-600 hover:bg-blue-700 text-white',
      secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
      ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
    };
    const classes = variantClasses[action.variant || 'primary'];

    if (action.href) {
      return `
        <a
          href="${action.href}"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
        >
          ${action.icon ? `<i class="fas ${action.icon}"></i>` : ''}
          <span>${action.text}</span>
        </a>
      `;
    } else {
      return `
        <button
          type="button"
          onclick="${action.onClick || ''}"
          class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
        >
          ${action.icon ? `<i class="fas ${action.icon}"></i>` : ''}
          <span>${action.text}</span>
        </button>
      `;
    }
  }).join('');

  element.innerHTML = `
    <div class="flex flex-col items-center justify-center text-center ${sizeConfig.padding}">
      <div class="mb-6">
        <i class="fas ${icon} ${sizeConfig.iconSize} text-gray-400" aria-hidden="true"></i>
      </div>
      
      <h3 class="font-bold ${sizeConfig.titleSize} text-gray-800 mb-3">
        ${title}
      </h3>
      
      ${description ? `
        <p class="text-gray-600 max-w-md mb-6 text-base">
          ${description}
        </p>
      ` : ''}
      
      ${actions.length > 0 ? `
        <div class="flex flex-col sm:flex-row gap-3 mt-2">
          ${actionsHtml}
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Hide empty state and restore original content
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} newContent - Optional new content to show instead of original
 */
function hideEmptyState(container, newContent = null) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) {
    console.warn('hideEmptyState: container not found', container);
    return;
  }

  if (newContent !== null) {
    element.innerHTML = newContent;
  } else if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
  }
}

/**
 * Check if container is showing empty state
 * @param {string|HTMLElement} container - Container selector or element
 * @returns {boolean}
 */
function isEmptyState(container) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  return element && !!element.dataset.originalContent;
}

// ====================================
// Preset Empty States
// ====================================

/**
 * Show empty gallery state
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options - Options
 * @param {string} options.userRole - User role: 'artist' or 'viewer'
 */
function showEmptyGallery(container, options = {}) {
  const { userRole = 'viewer' } = options;

  if (userRole === 'artist') {
    showEmptyState(container, {
      icon: 'fa-folder-open',
      title: '아직 작품이 없습니다',
      description: '첫 번째 작품을 업로드하여 포트폴리오를 시작하세요. 작품을 등록하면 전문가 평가를 받을 수 있습니다.',
      actions: [
        {
          text: '작품 업로드',
          href: '/upload',
          variant: 'primary',
          icon: 'fa-upload'
        }
      ],
      size: 'lg'
    });
  } else {
    showEmptyState(container, {
      icon: 'fa-folder-open',
      title: '갤러리가 비어있습니다',
      description: '아직 등록된 작품이 없습니다. 작가들이 작품을 업로드하면 여기에 표시됩니다.',
      size: 'lg'
    });
  }
}

/**
 * Show empty search results
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options - Options
 * @param {string} options.searchQuery - Search query that returned no results
 */
function showEmptySearchResults(container, options = {}) {
  const { searchQuery = '' } = options;

  showEmptyState(container, {
    icon: 'fa-search',
    title: '검색 결과가 없습니다',
    description: searchQuery 
      ? `"${searchQuery}"에 대한 검색 결과를 찾을 수 없습니다. 다른 검색어를 시도해보세요.`
      : '검색 결과를 찾을 수 없습니다. 검색어를 변경해보세요.',
    actions: [
      {
        text: '검색 초기화',
        onClick: 'clearSearch()',
        variant: 'secondary'
      }
    ],
    size: 'md'
  });
}

/**
 * Show empty dashboard
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options - Options
 * @param {string} options.userName - User name for personalized greeting
 */
function showEmptyDashboard(container, options = {}) {
  const { userName = '' } = options;

  showEmptyState(container, {
    icon: 'fa-inbox',
    title: userName ? `환영합니다, ${userName}님!` : '환영합니다!',
    description: '아직 제출한 작품이 없습니다. 첫 작품을 제출하여 전문가 평가를 받아보세요.',
    actions: [
      {
        text: '작품 제출하기',
        href: '/submit',
        variant: 'primary',
        icon: 'fa-plus'
      },
      {
        text: '가이드 보기',
        href: '/guide',
        variant: 'ghost',
        icon: 'fa-book'
      }
    ],
    size: 'lg'
  });
}

/**
 * Show empty notifications
 * @param {string|HTMLElement} container - Container selector or element
 */
function showEmptyNotifications(container) {
  showEmptyState(container, {
    icon: 'fa-bell',
    title: '알림이 없습니다',
    description: '새로운 알림이 도착하면 여기에 표시됩니다.',
    size: 'sm'
  });
}

/**
 * Show empty favorites
 * @param {string|HTMLElement} container - Container selector or element
 */
function showEmptyFavorites(container) {
  showEmptyState(container, {
    icon: 'fa-heart',
    title: '저장된 작품이 없습니다',
    description: '마음에 드는 작품을 하트 버튼으로 저장해보세요.',
    actions: [
      {
        text: '갤러리 둘러보기',
        href: '/gallery',
        variant: 'primary',
        icon: 'fa-images'
      }
    ],
    size: 'md'
  });
}

/**
 * Show offline state
 * @param {string|HTMLElement} container - Container selector or element
 */
function showOfflineState(container) {
  showEmptyState(container, {
    icon: 'fa-wifi-slash',
    title: '인터넷 연결이 끊어졌습니다',
    description: '네트워크 연결을 확인하고 다시 시도해주세요.',
    actions: [
      {
        text: '다시 시도',
        onClick: 'location.reload()',
        variant: 'primary',
        icon: 'fa-redo'
      }
    ],
    size: 'md'
  });
}

/**
 * Show unauthorized state
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options - Options
 * @param {string} options.requiredRole - Required role to access
 */
function showUnauthorizedState(container, options = {}) {
  const { requiredRole = '' } = options;

  showEmptyState(container, {
    icon: 'fa-lock',
    title: '접근 권한이 없습니다',
    description: requiredRole 
      ? `이 페이지는 ${requiredRole} 권한이 필요합니다.`
      : '이 페이지에 접근할 권한이 없습니다.',
    actions: [
      {
        text: '홈으로',
        href: '/',
        variant: 'primary'
      },
      {
        text: '로그인',
        href: '/login',
        variant: 'secondary'
      }
    ],
    size: 'md'
  });
}

/**
 * Show coming soon state
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} options - Options
 * @param {string} options.featureName - Name of the feature coming soon
 */
function showComingSoon(container, options = {}) {
  const { featureName = '' } = options;

  showEmptyState(container, {
    icon: 'fa-clock',
    title: '곧 만나보실 수 있습니다',
    description: featureName 
      ? `${featureName} 기능을 준비 중입니다. 조금만 기다려주세요!`
      : '이 기능은 현재 준비 중입니다. 조금만 기다려주세요!',
    actions: [
      {
        text: '업데이트 알림 받기',
        onClick: 'subscribeToUpdates()',
        variant: 'primary',
        icon: 'fa-bell'
      }
    ],
    size: 'md'
  });
}

// ====================================
// Smart Empty State Detection
// ====================================

/**
 * Automatically show empty state if container has no children
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} config - Empty state configuration
 */
function autoEmptyState(container, config) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) return;

  // Check if container is empty or only has empty text nodes
  const hasContent = Array.from(element.childNodes).some(node => {
    if (node.nodeType === Node.ELEMENT_NODE) return true;
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim()) return true;
    return false;
  });

  if (!hasContent) {
    showEmptyState(element, config);
  }
}

/**
 * Monitor container for emptiness and auto-show empty state
 * @param {string|HTMLElement} container - Container selector or element
 * @param {Object} config - Empty state configuration
 * @returns {MutationObserver} Observer instance (call .disconnect() to stop)
 */
function monitorEmptyState(container, config) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) return null;

  // Initial check
  autoEmptyState(element, config);

  // Create observer for future changes
  const observer = new MutationObserver(() => {
    autoEmptyState(element, config);
  });

  observer.observe(element, {
    childList: true,
    subtree: false
  });

  return observer;
}

// ====================================
// Export for use in other scripts
// ====================================

if (typeof window !== 'undefined') {
  window.EmptyStateUtils = {
    // Core functions
    showEmptyState,
    hideEmptyState,
    isEmptyState,
    
    // Presets
    showEmptyGallery,
    showEmptySearchResults,
    showEmptyDashboard,
    showEmptyNotifications,
    showEmptyFavorites,
    showOfflineState,
    showUnauthorizedState,
    showComingSoon,
    
    // Auto detection
    autoEmptyState,
    monitorEmptyState
  };
}

console.log('✅ Empty State Utils initialized');
