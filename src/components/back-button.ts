/**
 * Back Button Component Library
 * 
 * Provides back navigation buttons for the GalleryPia platform
 * Addresses UX-C-004: Add Back Buttons and Breadcrumbs on Detail Pages
 * 
 * Features:
 * - Browser history navigation
 * - Custom href fallback
 * - Multiple styles and sizes
 * - Keyboard navigation support
 * - Screen reader friendly
 * 
 * @module components/back-button
 */

/**
 * Back Button Variants
 */
export type BackButtonVariant = 'default' | 'minimal' | 'outlined' | 'ghost'

/**
 * Back Button Sizes
 */
export type BackButtonSize = 'sm' | 'md' | 'lg'

/**
 * Back Button Props
 */
export interface BackButtonProps {
  text?: string
  href?: string
  variant?: BackButtonVariant
  size?: BackButtonSize
  icon?: string
  useHistory?: boolean
  className?: string
  ariaLabel?: string
}

/**
 * Size class mappings
 */
const SIZE_CLASSES: Record<BackButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-base',
  lg: 'px-6 py-3 text-lg'
}

/**
 * Variant class mappings
 */
const VARIANT_CLASSES: Record<BackButtonVariant, string> = {
  default: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300',
  minimal: 'bg-transparent hover:bg-gray-100 text-gray-700',
  outlined: 'bg-transparent hover:bg-gray-50 text-gray-700 border border-gray-300',
  ghost: 'bg-transparent hover:underline text-gray-700'
}

/**
 * Renders a back button
 * 
 * @example
 * ```typescript
 * // Browser history back
 * renderBackButton({ text: '뒤로가기', useHistory: true })
 * 
 * // Link to specific page
 * renderBackButton({ text: 'Back to Gallery', href: '/gallery' })
 * 
 * // Minimal style
 * renderBackButton({ variant: 'minimal', size: 'sm' })
 * ```
 */
export function renderBackButton(props: BackButtonProps = {}): string {
  const {
    text = '뒤로가기',
    href,
    variant = 'default',
    size = 'md',
    icon = 'fa-arrow-left',
    useHistory = !href, // Default to history if no href provided
    className = '',
    ariaLabel
  } = props

  const sizeClasses = SIZE_CLASSES[size]
  const variantClasses = VARIANT_CLASSES[variant]
  const label = ariaLabel || text

  // If href is provided, render as link
  if (href) {
    return `
      <a
        href="${href}"
        class="inline-flex items-center gap-2 rounded-lg font-medium transition-all ${variantClasses} ${sizeClasses} ${className}"
        aria-label="${label}"
      >
        <i class="fas ${icon}" aria-hidden="true"></i>
        ${text ? `<span>${text}</span>` : ''}
      </a>
    `
  }

  // Otherwise render as button with history.back()
  return `
    <button
      type="button"
      onclick="history.back()"
      class="inline-flex items-center gap-2 rounded-lg font-medium transition-all ${variantClasses} ${sizeClasses} ${className}"
      aria-label="${label}"
    >
      <i class="fas ${icon}" aria-hidden="true"></i>
      ${text ? `<span>${text}</span>` : ''}
    </button>
  `
}

/**
 * Renders a floating back button (fixed position)
 * Useful for long pages or mobile views
 * 
 * @example
 * ```typescript
 * renderFloatingBackButton({
 *   position: 'top-left',
 *   href: '/gallery'
 * })
 * ```
 */
export function renderFloatingBackButton(props: BackButtonProps & {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right'
} = {}): string {
  const {
    position = 'top-left',
    text,
    href,
    useHistory = !href,
    icon = 'fa-arrow-left',
    className = '',
    ariaLabel = '뒤로가기'
  } = props

  const positionClasses: Record<string, string> = {
    'top-left': 'top-4 left-4',
    'top-right': 'top-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'bottom-right': 'bottom-4 right-4'
  }

  const buttonHtml = renderBackButton({
    text,
    href,
    useHistory,
    icon,
    variant: 'default',
    size: 'md',
    className: 'shadow-lg hover:shadow-xl',
    ariaLabel
  })

  return `
    <div class="fixed ${positionClasses[position]} z-40 ${className}">
      ${buttonHtml}
    </div>
  `
}

/**
 * Renders a back button with confirmation dialog
 * Useful when leaving unsaved changes
 * 
 * @example
 * ```typescript
 * renderBackButtonWithConfirm({
 *   text: '취소',
 *   confirmMessage: '변경사항이 저장되지 않습니다. 계속하시겠습니까?',
 *   href: '/gallery'
 * })
 * ```
 */
export function renderBackButtonWithConfirm(props: BackButtonProps & {
  confirmMessage: string
  confirmTitle?: string
}): string {
  const {
    text = '뒤로가기',
    href,
    variant = 'default',
    size = 'md',
    icon = 'fa-arrow-left',
    confirmMessage,
    confirmTitle = '확인',
    className = '',
    ariaLabel
  } = props

  const sizeClasses = SIZE_CLASSES[size]
  const variantClasses = VARIANT_CLASSES[variant]
  const label = ariaLabel || text

  // Generate unique ID for this button
  const buttonId = `back-btn-${Math.random().toString(36).substr(2, 9)}`

  return `
    <button
      id="${buttonId}"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg font-medium transition-all ${variantClasses} ${sizeClasses} ${className}"
      aria-label="${label}"
    >
      <i class="fas ${icon}" aria-hidden="true"></i>
      ${text ? `<span>${text}</span>` : ''}
    </button>
    
    <script>
      (function() {
        const button = document.getElementById('${buttonId}');
        button.addEventListener('click', function() {
          if (confirm('${confirmMessage}')) {
            ${href ? `window.location.href = '${href}'` : 'history.back()'};
          }
        });
      })();
    </script>
  `
}

/**
 * Renders a smart back button that adapts based on referrer
 * Shows browser back if user came from within site
 * Shows link to default page if direct access
 * 
 * @example
 * ```typescript
 * renderSmartBackButton({
 *   defaultHref: '/gallery',
 *   defaultText: 'Back to Gallery',
 *   backText: '뒤로가기'
 * })
 * ```
 */
export function renderSmartBackButton(props: {
  defaultHref: string
  defaultText?: string
  backText?: string
  variant?: BackButtonVariant
  size?: BackButtonSize
  className?: string
}): string {
  const {
    defaultHref,
    defaultText = '뒤로가기',
    backText = '뒤로가기',
    variant = 'default',
    size = 'md',
    className = ''
  } = props

  const sizeClasses = SIZE_CLASSES[size]
  const variantClasses = VARIANT_CLASSES[variant]
  const buttonId = `smart-back-${Math.random().toString(36).substr(2, 9)}`

  return `
    <button
      id="${buttonId}"
      type="button"
      class="inline-flex items-center gap-2 rounded-lg font-medium transition-all ${variantClasses} ${sizeClasses} ${className}"
    >
      <i class="fas fa-arrow-left" aria-hidden="true"></i>
      <span id="${buttonId}-text">${backText}</span>
    </button>
    
    <script>
      (function() {
        const button = document.getElementById('${buttonId}');
        const textSpan = document.getElementById('${buttonId}-text');
        
        // Check if user came from same site
        const hasHistory = window.history.length > 1;
        const referrer = document.referrer;
        const isSameSite = referrer && referrer.startsWith(window.location.origin);
        
        if (hasHistory && isSameSite) {
          // Show back button
          textSpan.textContent = '${backText}';
          button.addEventListener('click', () => history.back());
        } else {
          // Show link to default page
          textSpan.textContent = '${defaultText}';
          button.addEventListener('click', () => {
            window.location.href = '${defaultHref}';
          });
        }
      })();
    </script>
  `
}

/**
 * Client-side JavaScript helpers for back buttons
 */
export const BACK_BUTTON_HELPERS_SCRIPT = `
/**
 * Back Button Helpers
 */
class BackButtonHelper {
  /**
   * Navigate back with fallback
   * @param {string} fallbackUrl - URL to navigate to if no history
   */
  static goBack(fallbackUrl = '/') {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.location.href = fallbackUrl;
    }
  }

  /**
   * Check if back navigation is available
   * @returns {boolean}
   */
  static canGoBack() {
    return window.history.length > 1;
  }

  /**
   * Add keyboard shortcut for back (Backspace or Alt+Left)
   * @param {string} fallbackUrl - Fallback URL
   */
  static enableKeyboardShortcut(fallbackUrl = '/') {
    document.addEventListener('keydown', (e) => {
      // Backspace (when not in input field)
      if (e.key === 'Backspace' && 
          !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) &&
          !e.target.isContentEditable) {
        e.preventDefault();
        this.goBack(fallbackUrl);
      }
      
      // Alt + Left Arrow
      if (e.altKey && e.key === 'ArrowLeft') {
        e.preventDefault();
        this.goBack(fallbackUrl);
      }
    });
  }
}

// Make globally available
window.BackButtonHelper = BackButtonHelper;
`

/**
 * Export back button components
 */
export const BackButtonComponents = {
  renderBackButton,
  renderFloatingBackButton,
  renderBackButtonWithConfirm,
  renderSmartBackButton,
  BACK_BUTTON_HELPERS_SCRIPT
}

export default BackButtonComponents
