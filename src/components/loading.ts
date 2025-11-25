/**
 * Loading Component Library
 * 
 * Provides unified loading states for the GalleryPia platform
 * Addresses UX-C-002: No Loading States on Form Submissions
 * 
 * Components:
 * - Spinner: Animated circular loading indicator
 * - Skeleton: Content placeholder for loading states
 * - LoadingButton: Button with integrated loading state
 * - LoadingOverlay: Full-page loading indicator
 * 
 * @module components/loading
 */

/**
 * Spinner Sizes
 */
export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Spinner Props
 */
export interface SpinnerProps {
  size?: SpinnerSize
  color?: string
  className?: string
  label?: string
}

/**
 * Size mapping for spinner dimensions
 */
const SPINNER_SIZES: Record<SpinnerSize, string> = {
  xs: 'w-3 h-3 border-2',
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-2',
  lg: 'w-8 h-8 border-3',
  xl: 'w-12 h-12 border-4'
}

/**
 * Renders an animated circular spinner
 * 
 * @example
 * ```typescript
 * renderSpinner({ size: 'md', color: 'blue-600', label: 'Loading...' })
 * ```
 */
export function renderSpinner(props: SpinnerProps = {}): string {
  const {
    size = 'md',
    color = 'blue-600',
    className = '',
    label = 'Loading...'
  } = props

  const sizeClasses = SPINNER_SIZES[size]

  return `
    <div 
      class="inline-flex items-center justify-center ${className}"
      role="status"
      aria-label="${label}"
    >
      <svg 
        class="animate-spin ${sizeClasses} text-${color}"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle 
          class="opacity-25" 
          cx="12" 
          cy="12" 
          r="10" 
          stroke="currentColor" 
          stroke-width="4"
        ></circle>
        <path 
          class="opacity-75" 
          fill="currentColor" 
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        ></path>
      </svg>
      <span class="sr-only">${label}</span>
    </div>
  `
}

/**
 * Skeleton Props
 */
export interface SkeletonProps {
  width?: string
  height?: string
  className?: string
  variant?: 'text' | 'circular' | 'rectangular'
  lines?: number
}

/**
 * Renders a skeleton placeholder for loading content
 * 
 * @example
 * ```typescript
 * renderSkeleton({ variant: 'text', lines: 3 })
 * renderSkeleton({ variant: 'circular', width: '60px', height: '60px' })
 * ```
 */
export function renderSkeleton(props: SkeletonProps = {}): string {
  const {
    width = '100%',
    height = variant === 'text' ? '1rem' : '200px',
    className = '',
    variant = 'rectangular',
    lines = 1
  } = props

  const baseClasses = 'bg-gray-300 animate-pulse'
  const variantClasses = {
    text: 'rounded',
    circular: 'rounded-full',
    rectangular: 'rounded-lg'
  }

  // For text variant with multiple lines
  if (variant === 'text' && lines > 1) {
    return `
      <div class="space-y-2 ${className}">
        ${Array.from({ length: lines }, (_, i) => `
          <div 
            class="${baseClasses} ${variantClasses[variant]}" 
            style="width: ${i === lines - 1 ? '80%' : '100%'}; height: ${height};"
            aria-label="Loading content"
          ></div>
        `).join('')}
      </div>
    `
  }

  return `
    <div 
      class="${baseClasses} ${variantClasses[variant]} ${className}" 
      style="width: ${width}; height: ${height};"
      role="status"
      aria-label="Loading content"
    >
      <span class="sr-only">Loading...</span>
    </div>
  `
}

/**
 * Loading Overlay Props
 */
export interface LoadingOverlayProps {
  message?: string
  transparent?: boolean
  zIndex?: number
}

/**
 * Renders a full-page loading overlay
 * 
 * @example
 * ```typescript
 * renderLoadingOverlay({ message: 'Uploading artwork...', transparent: false })
 * ```
 */
export function renderLoadingOverlay(props: LoadingOverlayProps = {}): string {
  const {
    message = 'Loading...',
    transparent = false,
    zIndex = 9999
  } = props

  const bgClass = transparent 
    ? 'bg-white/50 backdrop-blur-sm' 
    : 'bg-white/90'

  return `
    <div 
      class="fixed inset-0 ${bgClass} flex items-center justify-center"
      style="z-index: ${zIndex};"
      role="alert"
      aria-live="assertive"
      aria-busy="true"
    >
      <div class="text-center">
        ${renderSpinner({ size: 'xl', color: 'blue-600' })}
        <p class="mt-4 text-lg font-medium text-gray-700">${message}</p>
      </div>
    </div>
  `
}

/**
 * Card Skeleton Props
 */
export interface CardSkeletonProps {
  count?: number
  className?: string
}

/**
 * Renders a skeleton placeholder for card components
 * Useful for loading gallery items, artwork cards, etc.
 * 
 * @example
 * ```typescript
 * renderCardSkeleton({ count: 6 })
 * ```
 */
export function renderCardSkeleton(props: CardSkeletonProps = {}): string {
  const { count = 1, className = '' } = props

  const singleCard = `
    <div class="bg-white rounded-lg shadow-md overflow-hidden ${className}">
      <!-- Image placeholder -->
      ${renderSkeleton({ width: '100%', height: '200px', variant: 'rectangular' })}
      
      <!-- Content placeholder -->
      <div class="p-4 space-y-3">
        <!-- Title -->
        ${renderSkeleton({ width: '80%', height: '1.25rem', variant: 'text' })}
        
        <!-- Description lines -->
        ${renderSkeleton({ variant: 'text', lines: 2 })}
        
        <!-- Footer (price/button area) -->
        <div class="flex justify-between items-center mt-4">
          ${renderSkeleton({ width: '60px', height: '1.5rem', variant: 'rectangular' })}
          ${renderSkeleton({ width: '80px', height: '2rem', variant: 'rectangular' })}
        </div>
      </div>
    </div>
  `

  if (count === 1) {
    return singleCard
  }

  return `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${Array.from({ length: count }, () => singleCard).join('')}
    </div>
  `
}

/**
 * Table Skeleton Props
 */
export interface TableSkeletonProps {
  rows?: number
  columns?: number
  className?: string
}

/**
 * Renders a skeleton placeholder for table components
 * 
 * @example
 * ```typescript
 * renderTableSkeleton({ rows: 5, columns: 4 })
 * ```
 */
export function renderTableSkeleton(props: TableSkeletonProps = {}): string {
  const { rows = 5, columns = 4, className = '' } = props

  return `
    <div class="overflow-x-auto ${className}">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            ${Array.from({ length: columns }, () => `
              <th class="px-6 py-3">
                ${renderSkeleton({ width: '100%', height: '1rem', variant: 'text' })}
              </th>
            `).join('')}
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          ${Array.from({ length: rows }, () => `
            <tr>
              ${Array.from({ length: columns }, () => `
                <td class="px-6 py-4">
                  ${renderSkeleton({ width: '100%', height: '0.875rem', variant: 'text' })}
                </td>
              `).join('')}
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `
}

/**
 * Inline Loading Text Props
 */
export interface InlineLoadingProps {
  text: string
  showSpinner?: boolean
  className?: string
}

/**
 * Renders inline loading text with optional spinner
 * Useful for button loading states
 * 
 * @example
 * ```typescript
 * renderInlineLoading({ text: 'Saving...', showSpinner: true })
 * ```
 */
export function renderInlineLoading(props: InlineLoadingProps): string {
  const { text, showSpinner = true, className = '' } = props

  return `
    <span class="inline-flex items-center gap-2 ${className}">
      ${showSpinner ? renderSpinner({ size: 'sm', color: 'white' }) : ''}
      <span>${text}</span>
    </span>
  `
}

/**
 * Loading State Manager Class
 * 
 * Utility class for managing loading states in JavaScript
 * Can be used in public/static/*.js files
 * 
 * @example
 * ```javascript
 * const loader = new LoadingStateManager()
 * loader.show('Processing payment...')
 * // ... async operation
 * loader.hide()
 * ```
 */
export const LOADING_MANAGER_SCRIPT = `
class LoadingStateManager {
  constructor() {
    this.overlayId = 'gallerypia-loading-overlay'
  }

  /**
   * Show loading overlay
   * @param {string} message - Loading message to display
   */
  show(message = 'Loading...') {
    // Remove existing overlay if present
    this.hide()

    const overlay = document.createElement('div')
    overlay.id = this.overlayId
    overlay.className = 'fixed inset-0 bg-white/90 flex items-center justify-center'
    overlay.style.zIndex = '9999'
    overlay.setAttribute('role', 'alert')
    overlay.setAttribute('aria-live', 'assertive')
    overlay.setAttribute('aria-busy', 'true')

    overlay.innerHTML = \`
      <div class="text-center">
        <div class="inline-flex items-center justify-center" role="status">
          <svg 
            class="animate-spin w-12 h-12 border-4 text-blue-600"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
        <p class="mt-4 text-lg font-medium text-gray-700">\${message}</p>
      </div>
    \`

    document.body.appendChild(overlay)
    
    // Prevent body scroll
    document.body.style.overflow = 'hidden'
  }

  /**
   * Hide loading overlay
   */
  hide() {
    const overlay = document.getElementById(this.overlayId)
    if (overlay) {
      overlay.remove()
    }
    
    // Restore body scroll
    document.body.style.overflow = ''
  }

  /**
   * Set button loading state
   * @param {HTMLButtonElement} button - Button element
   * @param {boolean} isLoading - Loading state
   * @param {string} loadingText - Text to show when loading
   */
  setButtonLoading(button, isLoading, loadingText = 'Processing...') {
    if (!button) return

    if (isLoading) {
      button.disabled = true
      button.dataset.originalText = button.innerHTML
      button.innerHTML = \`
        <span class="inline-flex items-center gap-2">
          <svg 
            class="animate-spin w-4 h-4 border-2 text-white"
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>\${loadingText}</span>
        </span>
      \`
      button.classList.add('opacity-75', 'cursor-not-allowed')
    } else {
      button.disabled = false
      if (button.dataset.originalText) {
        button.innerHTML = button.dataset.originalText
        delete button.dataset.originalText
      }
      button.classList.remove('opacity-75', 'cursor-not-allowed')
    }
  }

  /**
   * Show loading state on form
   * @param {HTMLFormElement} form - Form element
   * @param {boolean} isLoading - Loading state
   */
  setFormLoading(form, isLoading) {
    if (!form) return

    const submitButton = form.querySelector('button[type="submit"]')
    const inputs = form.querySelectorAll('input, textarea, select')

    if (isLoading) {
      inputs.forEach(input => input.disabled = true)
      if (submitButton) {
        this.setButtonLoading(submitButton, true)
      }
    } else {
      inputs.forEach(input => input.disabled = false)
      if (submitButton) {
        this.setButtonLoading(submitButton, false)
      }
    }
  }
}

// Create global instance
window.loadingManager = new LoadingStateManager()
`

/**
 * Export all loading utilities
 */
export const LoadingComponents = {
  renderSpinner,
  renderSkeleton,
  renderLoadingOverlay,
  renderCardSkeleton,
  renderTableSkeleton,
  renderInlineLoading,
  LOADING_MANAGER_SCRIPT
}

export default LoadingComponents
