/**
 * Button Component Library
 * 
 * Provides unified button components for the GalleryPia platform
 * Addresses UX-C-005: Create Unified Button Component System
 * 
 * Features:
 * - Multiple variants (primary, secondary, danger, ghost, link)
 * - Size options (xs, sm, md, lg, xl)
 * - Loading states with spinner
 * - Disabled states
 * - Icon support (left/right)
 * - Full accessibility (ARIA labels, keyboard navigation)
 * 
 * @module components/button
 */

import { renderSpinner } from './loading'

/**
 * Button Variants
 */
export type ButtonVariant = 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'link'

/**
 * Button Sizes
 */
export type ButtonSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl'

/**
 * Button Types
 */
export type ButtonType = 'button' | 'submit' | 'reset'

/**
 * Button Props
 */
export interface ButtonProps {
  // Content
  text: string
  icon?: string
  iconPosition?: 'left' | 'right'
  
  // Styling
  variant?: ButtonVariant
  size?: ButtonSize
  fullWidth?: boolean
  className?: string
  
  // Behavior
  type?: ButtonType
  disabled?: boolean
  loading?: boolean
  loadingText?: string
  
  // Interaction
  onClick?: string
  href?: string
  target?: '_blank' | '_self'
  
  // Accessibility
  ariaLabel?: string
  ariaDescribedBy?: string
  title?: string
  
  // Form
  form?: string
  name?: string
  value?: string
  
  // Data attributes
  dataAttributes?: Record<string, string>
}

/**
 * Variant class mappings
 */
const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-blue-600 hover:bg-blue-700 text-white border-transparent focus:ring-blue-500 active:bg-blue-800',
  secondary: 'bg-gray-600 hover:bg-gray-700 text-white border-transparent focus:ring-gray-500 active:bg-gray-800',
  danger: 'bg-red-600 hover:bg-red-700 text-white border-transparent focus:ring-red-500 active:bg-red-800',
  success: 'bg-green-600 hover:bg-green-700 text-white border-transparent focus:ring-green-500 active:bg-green-800',
  warning: 'bg-yellow-500 hover:bg-yellow-600 text-white border-transparent focus:ring-yellow-400 active:bg-yellow-700',
  ghost: 'bg-transparent hover:bg-gray-100 text-gray-700 border-gray-300 focus:ring-gray-500 active:bg-gray-200',
  link: 'bg-transparent hover:bg-transparent text-blue-600 hover:text-blue-700 border-transparent focus:ring-blue-500 underline'
}

/**
 * Size class mappings
 */
const SIZE_CLASSES: Record<ButtonSize, { button: string; icon: string; spinner: 'xs' | 'sm' | 'md' }> = {
  xs: {
    button: 'px-2 py-1 text-xs',
    icon: 'w-3 h-3',
    spinner: 'xs'
  },
  sm: {
    button: 'px-3 py-1.5 text-sm',
    icon: 'w-4 h-4',
    spinner: 'sm'
  },
  md: {
    button: 'px-4 py-2 text-base',
    icon: 'w-5 h-5',
    spinner: 'sm'
  },
  lg: {
    button: 'px-6 py-3 text-lg',
    icon: 'w-6 h-6',
    spinner: 'md'
  },
  xl: {
    button: 'px-8 py-4 text-xl',
    icon: 'w-7 h-7',
    spinner: 'md'
  }
}

/**
 * Renders a unified button component
 * 
 * @example
 * ```typescript
 * // Primary button
 * renderButton({ text: 'Save Changes', variant: 'primary', type: 'submit' })
 * 
 * // Loading button
 * renderButton({ text: 'Submit', loading: true, loadingText: 'Submitting...' })
 * 
 * // Button with icon
 * renderButton({ text: 'Delete', variant: 'danger', icon: 'fa-trash', iconPosition: 'left' })
 * 
 * // Link button
 * renderButton({ text: 'Learn More', variant: 'link', href: '/docs' })
 * ```
 */
export function renderButton(props: ButtonProps): string {
  const {
    text,
    icon,
    iconPosition = 'left',
    variant = 'primary',
    size = 'md',
    fullWidth = false,
    className = '',
    type = 'button',
    disabled = false,
    loading = false,
    loadingText,
    onClick,
    href,
    target = '_self',
    ariaLabel,
    ariaDescribedBy,
    title,
    form,
    name,
    value,
    dataAttributes = {}
  } = props

  // Determine if this should be a link or button
  const isLink = !!href && variant !== 'link'
  const tag = isLink ? 'a' : 'button'

  // Build class string
  const variantClasses = VARIANT_CLASSES[variant]
  const sizeConfig = SIZE_CLASSES[size]
  const widthClass = fullWidth ? 'w-full' : ''
  const disabledClasses = (disabled || loading) 
    ? 'opacity-50 cursor-not-allowed' 
    : 'cursor-pointer'

  const baseClasses = `
    inline-flex items-center justify-center gap-2
    font-medium rounded-lg border
    transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    disabled:opacity-50 disabled:cursor-not-allowed
    ${variantClasses}
    ${sizeConfig.button}
    ${widthClass}
    ${disabledClasses}
    ${className}
  `.trim().replace(/\s+/g, ' ')

  // Build data attributes
  const dataAttrs = Object.entries(dataAttributes)
    .map(([key, val]) => `data-${key}="${val}"`)
    .join(' ')

  // Build ARIA attributes
  const ariaAttrs = [
    ariaLabel ? `aria-label="${ariaLabel}"` : '',
    ariaDescribedBy ? `aria-describedby="${ariaDescribedBy}"` : '',
    loading ? 'aria-busy="true"' : '',
    disabled ? 'aria-disabled="true"' : ''
  ].filter(Boolean).join(' ')

  // Render icon
  const renderIcon = (iconClass: string) => {
    if (!iconClass) return ''
    return `<i class="fa ${iconClass} ${sizeConfig.icon}" aria-hidden="true"></i>`
  }

  // Render loading spinner
  const renderLoadingSpinner = () => {
    if (!loading) return ''
    return renderSpinner({ size: sizeConfig.spinner, color: variant === 'ghost' ? 'gray-700' : 'white' })
  }

  // Render button content
  const buttonContent = loading
    ? `
      ${renderLoadingSpinner()}
      <span>${loadingText || text}</span>
    `
    : `
      ${icon && iconPosition === 'left' ? renderIcon(icon) : ''}
      <span>${text}</span>
      ${icon && iconPosition === 'right' ? renderIcon(icon) : ''}
    `

  // Render link
  if (isLink) {
    return `
      <a
        href="${href}"
        target="${target}"
        ${target === '_blank' ? 'rel="noopener noreferrer"' : ''}
        class="${baseClasses}"
        ${title ? `title="${title}"` : ''}
        ${ariaAttrs}
        ${dataAttrs}
        ${onClick ? `onclick="${onClick}"` : ''}
        ${disabled ? 'aria-disabled="true" onclick="return false;"' : ''}
      >
        ${buttonContent}
      </a>
    `
  }

  // Render button
  return `
    <button
      type="${type}"
      class="${baseClasses}"
      ${disabled || loading ? 'disabled' : ''}
      ${title ? `title="${title}"` : ''}
      ${ariaAttrs}
      ${dataAttrs}
      ${onClick ? `onclick="${onClick}"` : ''}
      ${form ? `form="${form}"` : ''}
      ${name ? `name="${name}"` : ''}
      ${value ? `value="${value}"` : ''}
    >
      ${buttonContent}
    </button>
  `
}

/**
 * Button Group Props
 */
export interface ButtonGroupProps {
  buttons: ButtonProps[]
  orientation?: 'horizontal' | 'vertical'
  className?: string
  ariaLabel?: string
}

/**
 * Renders a group of buttons with proper spacing and alignment
 * 
 * @example
 * ```typescript
 * renderButtonGroup({
 *   buttons: [
 *     { text: 'Cancel', variant: 'ghost' },
 *     { text: 'Save', variant: 'primary', type: 'submit' }
 *   ],
 *   ariaLabel: 'Form actions'
 * })
 * ```
 */
export function renderButtonGroup(props: ButtonGroupProps): string {
  const {
    buttons,
    orientation = 'horizontal',
    className = '',
    ariaLabel
  } = props

  const orientationClasses = orientation === 'horizontal'
    ? 'flex flex-row gap-2 items-center'
    : 'flex flex-col gap-2'

  return `
    <div 
      class="${orientationClasses} ${className}"
      ${ariaLabel ? `role="group" aria-label="${ariaLabel}"` : ''}
    >
      ${buttons.map(button => renderButton(button)).join('')}
    </div>
  `
}

/**
 * Icon Button Props (button with only icon, no text)
 */
export interface IconButtonProps extends Omit<ButtonProps, 'text' | 'icon' | 'iconPosition'> {
  icon: string
  ariaLabel: string // Required for accessibility
}

/**
 * Renders an icon-only button
 * 
 * @example
 * ```typescript
 * renderIconButton({
 *   icon: 'fa-heart',
 *   ariaLabel: 'Add to favorites',
 *   variant: 'ghost',
 *   size: 'sm'
 * })
 * ```
 */
export function renderIconButton(props: IconButtonProps): string {
  const { icon, ariaLabel, size = 'md', ...rest } = props

  const sizeConfig = SIZE_CLASSES[size]
  const iconSizeClass = sizeConfig.icon

  return renderButton({
    ...rest,
    text: `<i class="fa ${icon} ${iconSizeClass}" aria-hidden="true"></i>`,
    ariaLabel,
    size,
    className: `!p-2 ${rest.className || ''}`
  })
}

/**
 * Floating Action Button Props
 */
export interface FABProps extends Omit<ButtonProps, 'fullWidth' | 'size'> {
  position?: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'
  icon: string
}

/**
 * Renders a floating action button (FAB)
 * 
 * @example
 * ```typescript
 * renderFAB({
 *   icon: 'fa-plus',
 *   text: 'Add Artwork',
 *   position: 'bottom-right',
 *   onClick: 'openUploadModal()'
 * })
 * ```
 */
export function renderFAB(props: FABProps): string {
  const {
    position = 'bottom-right',
    icon,
    ...rest
  } = props

  const positionClasses: Record<string, string> = {
    'bottom-right': 'bottom-6 right-6',
    'bottom-left': 'bottom-6 left-6',
    'top-right': 'top-6 right-6',
    'top-left': 'top-6 left-6'
  }

  const buttonHtml = renderButton({
    ...rest,
    icon,
    iconPosition: 'left',
    size: 'lg',
    className: `shadow-lg hover:shadow-xl ${rest.className || ''}`
  })

  return `
    <div class="fixed ${positionClasses[position]} z-50">
      ${buttonHtml}
    </div>
  `
}

/**
 * Button JavaScript Helpers
 * 
 * Utility functions for managing button states in client-side JavaScript
 */
export const BUTTON_HELPERS_SCRIPT = `
/**
 * Button State Manager
 */
class ButtonStateManager {
  /**
   * Set button loading state
   * @param {string|HTMLButtonElement} buttonSelector - Button selector or element
   * @param {boolean} isLoading - Loading state
   * @param {string} loadingText - Text to display when loading
   */
  static setLoading(buttonSelector, isLoading, loadingText = 'Processing...') {
    const button = typeof buttonSelector === 'string'
      ? document.querySelector(buttonSelector)
      : buttonSelector

    if (!button) {
      console.warn('Button not found:', buttonSelector)
      return
    }

    if (isLoading) {
      button.disabled = true
      button.dataset.originalHtml = button.innerHTML
      button.innerHTML = \`
        <svg 
          class="animate-spin inline-block w-4 h-4 border-2 text-current mr-2"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>\${loadingText}</span>
      \`
      button.setAttribute('aria-busy', 'true')
      button.classList.add('opacity-50', 'cursor-not-allowed')
    } else {
      button.disabled = false
      if (button.dataset.originalHtml) {
        button.innerHTML = button.dataset.originalHtml
        delete button.dataset.originalHtml
      }
      button.removeAttribute('aria-busy')
      button.classList.remove('opacity-50', 'cursor-not-allowed')
    }
  }

  /**
   * Disable button
   * @param {string|HTMLButtonElement} buttonSelector - Button selector or element
   */
  static disable(buttonSelector) {
    const button = typeof buttonSelector === 'string'
      ? document.querySelector(buttonSelector)
      : buttonSelector

    if (button) {
      button.disabled = true
      button.setAttribute('aria-disabled', 'true')
    }
  }

  /**
   * Enable button
   * @param {string|HTMLButtonElement} buttonSelector - Button selector or element
   */
  static enable(buttonSelector) {
    const button = typeof buttonSelector === 'string'
      ? document.querySelector(buttonSelector)
      : buttonSelector

    if (button) {
      button.disabled = false
      button.removeAttribute('aria-disabled')
    }
  }

  /**
   * Create loading button wrapper for async operations
   * @param {HTMLButtonElement} button - Button element
   * @param {Function} asyncFn - Async function to execute
   * @param {string} loadingText - Loading text
   */
  static async withLoading(button, asyncFn, loadingText = 'Processing...') {
    if (!button || !asyncFn) return

    try {
      this.setLoading(button, true, loadingText)
      await asyncFn()
    } catch (error) {
      console.error('Button action failed:', error)
      throw error
    } finally {
      this.setLoading(button, false)
    }
  }
}

// Make globally available
window.ButtonStateManager = ButtonStateManager
`

/**
 * Export all button components
 */
export const ButtonComponents = {
  renderButton,
  renderButtonGroup,
  renderIconButton,
  renderFAB,
  BUTTON_HELPERS_SCRIPT
}

export default ButtonComponents
