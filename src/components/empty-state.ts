/**
 * Empty State Component Library
 * 
 * Provides empty state components for the GalleryPia platform
 * Addresses UX-H-001: Missing Empty States
 * 
 * Empty states help users understand when:
 * - No data is available yet
 * - Search/filter returned no results
 * - User needs to take action first
 * - Feature is coming soon
 * 
 * Features:
 * - Multiple empty state variants
 * - Helpful illustrations and icons
 * - Clear messaging
 * - Actionable CTAs
 * - Responsive design
 * 
 * @module components/empty-state
 */

/**
 * Empty State Variant Types
 */
export type EmptyStateVariant = 
  | 'no-data'           // No data available yet
  | 'no-results'        // Search/filter returned nothing
  | 'no-items'          // Collection is empty
  | 'error'             // Error state
  | 'unauthorized'      // No permission
  | 'coming-soon'       // Feature not ready
  | 'offline'           // Network issue

/**
 * Empty State Size
 */
export type EmptyStateSize = 'sm' | 'md' | 'lg'

/**
 * Call-to-Action Button
 */
export interface EmptyStateCTA {
  text: string
  href?: string
  onClick?: string
  variant?: 'primary' | 'secondary' | 'ghost'
  icon?: string
}

/**
 * Empty State Props
 */
export interface EmptyStateProps {
  variant?: EmptyStateVariant
  size?: EmptyStateSize
  icon?: string
  title: string
  description?: string
  actions?: EmptyStateCTA[]
  image?: string
  className?: string
}

/**
 * Variant configurations
 */
const VARIANT_CONFIG: Record<EmptyStateVariant, { icon: string; iconColor: string }> = {
  'no-data': {
    icon: 'fa-inbox',
    iconColor: 'text-gray-400'
  },
  'no-results': {
    icon: 'fa-search',
    iconColor: 'text-gray-400'
  },
  'no-items': {
    icon: 'fa-folder-open',
    iconColor: 'text-gray-400'
  },
  'error': {
    icon: 'fa-exclamation-triangle',
    iconColor: 'text-red-400'
  },
  'unauthorized': {
    icon: 'fa-lock',
    iconColor: 'text-yellow-400'
  },
  'coming-soon': {
    icon: 'fa-clock',
    iconColor: 'text-blue-400'
  },
  'offline': {
    icon: 'fa-wifi-slash',
    iconColor: 'text-gray-400'
  }
}

/**
 * Size configurations
 */
const SIZE_CONFIG: Record<EmptyStateSize, { iconSize: string; titleSize: string; padding: string }> = {
  sm: {
    iconSize: 'text-4xl',
    titleSize: 'text-lg',
    padding: 'py-8'
  },
  md: {
    iconSize: 'text-6xl',
    titleSize: 'text-2xl',
    padding: 'py-12'
  },
  lg: {
    iconSize: 'text-8xl',
    titleSize: 'text-3xl',
    padding: 'py-16'
  }
}

/**
 * Renders an empty state component
 * 
 * @example
 * ```typescript
 * // No artworks in gallery
 * renderEmptyState({
 *   variant: 'no-items',
 *   title: '작품이 없습니다',
 *   description: '첫 번째 작품을 업로드하여 갤러리를 시작하세요.',
 *   actions: [
 *     { text: '작품 업로드', href: '/upload', variant: 'primary', icon: 'fa-upload' }
 *   ]
 * })
 * 
 * // No search results
 * renderEmptyState({
 *   variant: 'no-results',
 *   title: '검색 결과가 없습니다',
 *   description: '다른 검색어를 시도해보세요.',
 *   size: 'md'
 * })
 * ```
 */
export function renderEmptyState(props: EmptyStateProps): string {
  const {
    variant = 'no-data',
    size = 'md',
    icon,
    title,
    description,
    actions = [],
    image,
    className = ''
  } = props

  const variantConfig = VARIANT_CONFIG[variant]
  const sizeConfig = SIZE_CONFIG[size]
  const iconClass = icon || variantConfig.icon
  const iconColor = variantConfig.iconColor

  return `
    <div class="flex flex-col items-center justify-center text-center ${sizeConfig.padding} ${className}">
      ${image ? `
        <!-- Custom Image -->
        <img 
          src="${image}" 
          alt="${title}"
          class="w-64 h-64 object-contain mb-6 opacity-75"
        />
      ` : `
        <!-- Icon -->
        <div class="mb-6">
          <i class="fas ${iconClass} ${sizeConfig.iconSize} ${iconColor}" aria-hidden="true"></i>
        </div>
      `}
      
      <!-- Title -->
      <h3 class="font-bold ${sizeConfig.titleSize} text-gray-800 mb-3">
        ${title}
      </h3>
      
      <!-- Description -->
      ${description ? `
        <p class="text-gray-600 max-w-md mb-6 text-base">
          ${description}
        </p>
      ` : ''}
      
      <!-- Actions -->
      ${actions.length > 0 ? `
        <div class="flex flex-col sm:flex-row gap-3 mt-2">
          ${actions.map(action => {
            const variantClasses = {
              primary: 'bg-blue-600 hover:bg-blue-700 text-white',
              secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700',
              ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300'
            }
            const classes = variantClasses[action.variant || 'primary']
            
            if (action.href) {
              return `
                <a
                  href="${action.href}"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
                >
                  ${action.icon ? `<i class="fas ${action.icon}" aria-hidden="true"></i>` : ''}
                  <span>${action.text}</span>
                </a>
              `
            } else {
              return `
                <button
                  type="button"
                  onclick="${action.onClick}"
                  class="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
                >
                  ${action.icon ? `<i class="fas ${action.icon}" aria-hidden="true"></i>` : ''}
                  <span>${action.text}</span>
                </button>
              `
            }
          }).join('')}
        </div>
      ` : ''}
    </div>
  `
}

/**
 * Specific empty state presets for common scenarios
 */

/**
 * Renders empty gallery state
 */
export function renderEmptyGallery(props: {
  userRole?: 'artist' | 'viewer'
  className?: string
} = {}): string {
  const { userRole = 'viewer', className } = props

  if (userRole === 'artist') {
    return renderEmptyState({
      variant: 'no-items',
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
      size: 'lg',
      className
    })
  }

  return renderEmptyState({
    variant: 'no-items',
    title: '갤러리가 비어있습니다',
    description: '아직 등록된 작품이 없습니다. 작가들이 작품을 업로드하면 여기에 표시됩니다.',
    size: 'lg',
    className
  })
}

/**
 * Renders empty search results
 */
export function renderEmptySearchResults(props: {
  searchQuery?: string
  className?: string
} = {}): string {
  const { searchQuery, className } = props

  return renderEmptyState({
    variant: 'no-results',
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
    size: 'md',
    className
  })
}

/**
 * Renders empty dashboard (no submissions)
 */
export function renderEmptyDashboard(props: {
  userName?: string
  className?: string
} = {}): string {
  const { userName, className } = props

  return renderEmptyState({
    variant: 'no-data',
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
    size: 'lg',
    className
  })
}

/**
 * Renders empty notifications
 */
export function renderEmptyNotifications(props: {
  className?: string
} = {}): string {
  const { className } = props

  return renderEmptyState({
    variant: 'no-data',
    title: '알림이 없습니다',
    description: '새로운 알림이 도착하면 여기에 표시됩니다.',
    size: 'sm',
    className
  })
}

/**
 * Renders empty favorites/wishlist
 */
export function renderEmptyFavorites(props: {
  className?: string
} = {}): string {
  const { className } = props

  return renderEmptyState({
    variant: 'no-items',
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
    size: 'md',
    className
  })
}

/**
 * Renders offline/network error state
 */
export function renderOfflineState(props: {
  className?: string
} = {}): string {
  const { className } = props

  return renderEmptyState({
    variant: 'offline',
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
    size: 'md',
    className
  })
}

/**
 * Renders unauthorized access state
 */
export function renderUnauthorizedState(props: {
  requiredRole?: string
  className?: string
} = {}): string {
  const { requiredRole, className } = props

  return renderEmptyState({
    variant: 'unauthorized',
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
    size: 'md',
    className
  })
}

/**
 * Renders coming soon state
 */
export function renderComingSoon(props: {
  featureName?: string
  className?: string
} = {}): string {
  const { featureName, className } = props

  return renderEmptyState({
    variant: 'coming-soon',
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
    size: 'md',
    className
  })
}

/**
 * Client-side JavaScript helpers
 */
export const EMPTY_STATE_HELPERS_SCRIPT = `
/**
 * Empty State Helpers
 */
class EmptyStateHelper {
  /**
   * Show empty state in container
   * @param {string|HTMLElement} container - Container selector or element
   * @param {Object} config - Empty state configuration
   */
  static show(container, config) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    if (!element) {
      console.warn('EmptyStateHelper.show: container not found', container);
      return;
    }

    // Store original content
    if (!element.dataset.originalContent) {
      element.dataset.originalContent = element.innerHTML;
    }

    // Render empty state
    element.innerHTML = this.render(config);
  }

  /**
   * Hide empty state and restore original content
   * @param {string|HTMLElement} container - Container selector or element
   * @param {string} newContent - Optional new content to show
   */
  static hide(container, newContent = null) {
    const element = typeof container === 'string' 
      ? document.querySelector(container) 
      : container;
      
    if (!element) return;

    if (newContent) {
      element.innerHTML = newContent;
    } else if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
  }

  /**
   * Render empty state HTML
   * @param {Object} config - Configuration
   * @returns {string} HTML string
   */
  static render(config) {
    const {
      icon = 'fa-inbox',
      title = 'No data',
      description = '',
      actions = []
    } = config;

    const actionsHtml = actions.map(action => \`
      <button
        type="button"
        onclick="\${action.onClick || ''}"
        class="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
      >
        \${action.icon ? \`<i class="fas \${action.icon} mr-2"></i>\` : ''}
        \${action.text}
      </button>
    \`).join('');

    return \`
      <div class="flex flex-col items-center justify-center text-center py-12">
        <div class="mb-6">
          <i class="fas \${icon} text-6xl text-gray-400"></i>
        </div>
        <h3 class="text-2xl font-bold text-gray-800 mb-3">
          \${title}
        </h3>
        \${description ? \`
          <p class="text-gray-600 max-w-md mb-6">
            \${description}
          </p>
        \` : ''}
        \${actions.length > 0 ? \`
          <div class="flex gap-3">
            \${actionsHtml}
          </div>
        \` : ''}
      </div>
    \`;
  }
}

// Make globally available
window.EmptyStateHelper = EmptyStateHelper;
`

/**
 * Export all empty state components
 */
export const EmptyStateComponents = {
  renderEmptyState,
  renderEmptyGallery,
  renderEmptySearchResults,
  renderEmptyDashboard,
  renderEmptyNotifications,
  renderEmptyFavorites,
  renderOfflineState,
  renderUnauthorizedState,
  renderComingSoon,
  EMPTY_STATE_HELPERS_SCRIPT
}

export default EmptyStateComponents
