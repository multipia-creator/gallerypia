/**
 * Error State Component Library
 * 
 * Provides unified error state components for the GalleryPia platform
 * Addresses UX-C-003: Design and Implement Error State Visual Components
 * 
 * Components:
 * - ErrorMessage: Inline error messages for forms
 * - ErrorBanner: Page-level error banners
 * - ErrorPage: Full-page error states (404, 500, etc.)
 * - FieldError: Individual form field errors
 * - ErrorDialog: Modal error dialogs
 * - ErrorToast: Toast notification for errors
 * 
 * @module components/error
 */

/**
 * Error Severity Levels
 */
export type ErrorSeverity = 'error' | 'warning' | 'info' | 'success'

/**
 * Error Message Props
 */
export interface ErrorMessageProps {
  message: string
  severity?: ErrorSeverity
  title?: string
  icon?: string
  dismissible?: boolean
  onDismiss?: string
  className?: string
  id?: string
}

/**
 * Severity icon and color mappings
 */
const SEVERITY_CONFIG: Record<ErrorSeverity, { icon: string; color: string; bg: string; border: string }> = {
  error: {
    icon: 'fa-exclamation-circle',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200'
  },
  warning: {
    icon: 'fa-exclamation-triangle',
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200'
  },
  info: {
    icon: 'fa-info-circle',
    color: 'text-blue-700',
    bg: 'bg-blue-50',
    border: 'border-blue-200'
  },
  success: {
    icon: 'fa-check-circle',
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200'
  }
}

/**
 * Renders an inline error message
 * 
 * @example
 * ```typescript
 * renderErrorMessage({
 *   message: '이메일 형식이 올바르지 않습니다.',
 *   severity: 'error',
 *   dismissible: true
 * })
 * ```
 */
export function renderErrorMessage(props: ErrorMessageProps): string {
  const {
    message,
    severity = 'error',
    title,
    icon,
    dismissible = false,
    onDismiss = 'this.parentElement.remove()',
    className = '',
    id = ''
  } = props

  const config = SEVERITY_CONFIG[severity]
  const iconClass = icon || config.icon

  return `
    <div 
      ${id ? `id="${id}"` : ''}
      class="rounded-lg border ${config.border} ${config.bg} p-4 ${className}"
      role="alert"
      aria-live="polite"
    >
      <div class="flex items-start gap-3">
        <!-- Icon -->
        <div class="flex-shrink-0">
          <i class="fas ${iconClass} ${config.color} text-xl" aria-hidden="true"></i>
        </div>
        
        <!-- Content -->
        <div class="flex-1">
          ${title ? `
            <h3 class="font-semibold ${config.color} mb-1">
              ${title}
            </h3>
          ` : ''}
          <p class="${config.color} text-sm">
            ${message}
          </p>
        </div>
        
        <!-- Dismiss button -->
        ${dismissible ? `
          <button
            type="button"
            class="flex-shrink-0 ${config.color} hover:opacity-75 transition-opacity"
            onclick="${onDismiss}"
            aria-label="닫기"
          >
            <i class="fas fa-times"></i>
          </button>
        ` : ''}
      </div>
    </div>
  `
}

/**
 * Error Banner Props
 */
export interface ErrorBannerProps extends ErrorMessageProps {
  actions?: Array<{
    text: string
    onClick: string
    variant?: 'primary' | 'secondary'
  }>
  position?: 'top' | 'bottom'
  sticky?: boolean
}

/**
 * Renders a page-level error banner
 * 
 * @example
 * ```typescript
 * renderErrorBanner({
 *   title: '연결 오류',
 *   message: '서버에 연결할 수 없습니다.',
 *   severity: 'error',
 *   actions: [
 *     { text: '다시 시도', onClick: 'retryConnection()' }
 *   ],
 *   dismissible: true
 * })
 * ```
 */
export function renderErrorBanner(props: ErrorBannerProps): string {
  const {
    message,
    severity = 'error',
    title,
    icon,
    dismissible = true,
    onDismiss = 'this.parentElement.remove()',
    actions = [],
    position = 'top',
    sticky = false,
    className = '',
    id = ''
  } = props

  const config = SEVERITY_CONFIG[severity]
  const iconClass = icon || config.icon
  const positionClass = position === 'top' ? 'top-0' : 'bottom-0'
  const stickyClass = sticky ? 'sticky' : 'relative'

  return `
    <div 
      ${id ? `id="${id}"` : ''}
      class="${stickyClass} ${positionClass} left-0 right-0 z-50 ${className}"
      role="alert"
      aria-live="assertive"
    >
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div class="rounded-lg border ${config.border} ${config.bg} p-4 shadow-lg">
          <div class="flex items-center gap-4">
            <!-- Icon -->
            <div class="flex-shrink-0">
              <i class="fas ${iconClass} ${config.color} text-2xl" aria-hidden="true"></i>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              ${title ? `
                <h3 class="font-bold ${config.color} text-lg mb-1">
                  ${title}
                </h3>
              ` : ''}
              <p class="${config.color}">
                ${message}
              </p>
            </div>
            
            <!-- Actions -->
            ${actions.length > 0 ? `
              <div class="flex items-center gap-2">
                ${actions.map(action => `
                  <button
                    type="button"
                    class="px-4 py-2 rounded-lg font-medium transition-colors ${
                      action.variant === 'primary'
                        ? `bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'blue'}-600 text-white hover:bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'blue'}-700`
                        : `${config.color} hover:underline`
                    }"
                    onclick="${action.onClick}"
                  >
                    ${action.text}
                  </button>
                `).join('')}
              </div>
            ` : ''}
            
            <!-- Dismiss button -->
            ${dismissible ? `
              <button
                type="button"
                class="flex-shrink-0 ${config.color} hover:opacity-75 transition-opacity"
                onclick="${onDismiss}"
                aria-label="닫기"
              >
                <i class="fas fa-times text-xl"></i>
              </button>
            ` : ''}
          </div>
        </div>
      </div>
    </div>
  `
}

/**
 * Field Error Props
 */
export interface FieldErrorProps {
  message: string
  fieldId?: string
  className?: string
}

/**
 * Renders a form field error message
 * 
 * @example
 * ```typescript
 * renderFieldError({
 *   message: '이메일은 필수 항목입니다.',
 *   fieldId: 'email'
 * })
 * ```
 */
export function renderFieldError(props: FieldErrorProps): string {
  const { message, fieldId, className = '' } = props

  return `
    <div 
      class="flex items-center gap-1 mt-1 text-red-600 text-sm ${className}"
      role="alert"
      ${fieldId ? `id="${fieldId}-error"` : ''}
      aria-live="polite"
    >
      <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
      <span>${message}</span>
    </div>
  `
}

/**
 * Error Page Props
 */
export interface ErrorPageProps {
  code: '400' | '401' | '403' | '404' | '500' | '503'
  title?: string
  message?: string
  details?: string
  actions?: Array<{
    text: string
    href?: string
    onClick?: string
    variant?: 'primary' | 'secondary'
  }>
  showHomeLink?: boolean
  showBackLink?: boolean
}

/**
 * Error page configurations
 */
const ERROR_PAGE_CONFIG: Record<string, { title: string; message: string; icon: string }> = {
  '400': {
    title: '잘못된 요청',
    message: '요청이 올바르지 않습니다. 입력 내용을 확인해주세요.',
    icon: 'fa-exclamation-triangle'
  },
  '401': {
    title: '인증 필요',
    message: '로그인이 필요한 페이지입니다.',
    icon: 'fa-lock'
  },
  '403': {
    title: '접근 거부',
    message: '이 페이지에 접근할 권한이 없습니다.',
    icon: 'fa-ban'
  },
  '404': {
    title: '페이지를 찾을 수 없습니다',
    message: '요청하신 페이지가 존재하지 않거나 이동되었습니다.',
    icon: 'fa-search'
  },
  '500': {
    title: '서버 오류',
    message: '일시적인 서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요.',
    icon: 'fa-server'
  },
  '503': {
    title: '서비스 점검 중',
    message: '현재 시스템 점검 중입니다. 빠른 시일 내에 정상화하겠습니다.',
    icon: 'fa-tools'
  }
}

/**
 * Renders a full-page error state
 * 
 * @example
 * ```typescript
 * renderErrorPage({
 *   code: '404',
 *   actions: [
 *     { text: '홈으로', href: '/', variant: 'primary' },
 *     { text: '뒤로가기', onClick: 'history.back()', variant: 'secondary' }
 *   ]
 * })
 * ```
 */
export function renderErrorPage(props: ErrorPageProps): string {
  const {
    code,
    title,
    message,
    details,
    actions = [],
    showHomeLink = true,
    showBackLink = true
  } = props

  const config = ERROR_PAGE_CONFIG[code] || ERROR_PAGE_CONFIG['500']
  const pageTitle = title || config.title
  const pageMessage = message || config.message

  // Add default actions if not provided
  const defaultActions = []
  if (showBackLink && actions.length === 0) {
    defaultActions.push({
      text: '뒤로가기',
      onClick: 'history.back()',
      variant: 'secondary' as const
    })
  }
  if (showHomeLink && actions.length === 0) {
    defaultActions.push({
      text: '홈으로',
      href: '/',
      variant: 'primary' as const
    })
  }

  const allActions = actions.length > 0 ? actions : defaultActions

  return `
    <div class="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div class="max-w-lg w-full text-center">
        <!-- Error Icon -->
        <div class="mb-8">
          <i class="fas ${config.icon} text-gray-400 text-8xl" aria-hidden="true"></i>
        </div>
        
        <!-- Error Code -->
        <div class="text-6xl font-bold text-gray-300 mb-4">
          ${code}
        </div>
        
        <!-- Title -->
        <h1 class="text-3xl font-bold text-gray-800 mb-4">
          ${pageTitle}
        </h1>
        
        <!-- Message -->
        <p class="text-lg text-gray-600 mb-8">
          ${pageMessage}
        </p>
        
        <!-- Details (if provided) -->
        ${details ? `
          <div class="bg-white rounded-lg border border-gray-200 p-4 mb-8 text-left">
            <p class="text-sm text-gray-700 font-mono">
              ${details}
            </p>
          </div>
        ` : ''}
        
        <!-- Actions -->
        ${allActions.length > 0 ? `
          <div class="flex flex-col sm:flex-row gap-3 justify-center">
            ${allActions.map(action => {
              const isPrimary = action.variant === 'primary'
              const classes = isPrimary
                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300'
              
              if (action.href) {
                return `
                  <a
                    href="${action.href}"
                    class="px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
                  >
                    ${action.text}
                  </a>
                `
              } else {
                return `
                  <button
                    type="button"
                    onclick="${action.onClick}"
                    class="px-6 py-3 rounded-lg font-medium transition-colors ${classes}"
                  >
                    ${action.text}
                  </button>
                `
              }
            }).join('')}
          </div>
        ` : ''}
      </div>
    </div>
  `
}

/**
 * Error Dialog Props
 */
export interface ErrorDialogProps {
  title: string
  message: string
  severity?: ErrorSeverity
  details?: string
  actions?: Array<{
    text: string
    onClick: string
    variant?: 'primary' | 'secondary' | 'danger'
  }>
  onClose?: string
  id?: string
}

/**
 * Renders a modal error dialog
 * 
 * @example
 * ```typescript
 * renderErrorDialog({
 *   title: '삭제 실패',
 *   message: '작품을 삭제할 수 없습니다.',
 *   severity: 'error',
 *   actions: [
 *     { text: '다시 시도', onClick: 'retryDelete()', variant: 'danger' },
 *     { text: '취소', onClick: 'closeDialog()', variant: 'secondary' }
 *   ]
 * })
 * ```
 */
export function renderErrorDialog(props: ErrorDialogProps): string {
  const {
    title,
    message,
    severity = 'error',
    details,
    actions = [],
    onClose = 'this.closest(\'.error-dialog-overlay\').remove()',
    id = 'error-dialog'
  } = props

  const config = SEVERITY_CONFIG[severity]

  // Add default close action if no actions provided
  const defaultActions = actions.length > 0 ? actions : [
    { text: '확인', onClick: onClose, variant: 'primary' as const }
  ]

  return `
    <div 
      id="${id}"
      class="error-dialog-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${id}-title"
      onclick="if(event.target === this) { ${onClose} }"
    >
      <div 
        class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
        onclick="event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
          <i class="fas ${config.icon} ${config.color} text-2xl" aria-hidden="true"></i>
          <h2 id="${id}-title" class="text-xl font-bold text-gray-800 flex-1">
            ${title}
          </h2>
          <button
            type="button"
            class="text-gray-400 hover:text-gray-600 transition-colors"
            onclick="${onClose}"
            aria-label="닫기"
          >
            <i class="fas fa-times text-xl"></i>
          </button>
        </div>
        
        <!-- Body -->
        <div class="px-6 py-4">
          <p class="text-gray-700 mb-4">
            ${message}
          </p>
          
          ${details ? `
            <div class="bg-gray-50 rounded-lg p-4 mb-4">
              <p class="text-sm text-gray-600 font-mono">
                ${details}
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-2 justify-end">
          ${defaultActions.map(action => {
            const variantClasses = {
              primary: 'bg-blue-600 hover:bg-blue-700 text-white',
              secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
              danger: 'bg-red-600 hover:bg-red-700 text-white'
            }
            const classes = variantClasses[action.variant || 'primary']
            
            return `
              <button
                type="button"
                onclick="${action.onClick}"
                class="px-4 py-2 rounded-lg font-medium transition-colors ${classes}"
              >
                ${action.text}
              </button>
            `
          }).join('')}
        </div>
      </div>
    </div>
  `
}

/**
 * Error Toast Props
 */
export interface ErrorToastProps {
  message: string
  severity?: ErrorSeverity
  duration?: number
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center'
  id?: string
}

/**
 * Renders a toast notification
 * Used primarily in client-side JavaScript
 * 
 * @example
 * ```typescript
 * renderErrorToast({
 *   message: '저장되었습니다.',
 *   severity: 'success',
 *   duration: 3000,
 *   position: 'top-right'
 * })
 * ```
 */
export function renderErrorToast(props: ErrorToastProps): string {
  const {
    message,
    severity = 'error',
    duration = 5000,
    position = 'top-right',
    id = `toast-${Date.now()}`
  } = props

  const config = SEVERITY_CONFIG[severity]
  
  const positionClasses: Record<string, string> = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  }

  return `
    <div 
      id="${id}"
      class="fixed ${positionClasses[position]} z-50 animate-slide-in-right"
      role="alert"
      aria-live="assertive"
      data-duration="${duration}"
    >
      <div class="flex items-center gap-3 ${config.bg} border ${config.border} rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-md">
        <i class="fas ${config.icon} ${config.color} text-xl" aria-hidden="true"></i>
        <p class="${config.color} flex-1">
          ${message}
        </p>
        <button
          type="button"
          class="${config.color} hover:opacity-75 transition-opacity"
          onclick="this.closest('[role=alert]').remove()"
          aria-label="닫기"
        >
          <i class="fas fa-times"></i>
        </button>
      </div>
    </div>
  `
}

/**
 * Export all error components
 */
export const ErrorComponents = {
  renderErrorMessage,
  renderErrorBanner,
  renderFieldError,
  renderErrorPage,
  renderErrorDialog,
  renderErrorToast
}

export default ErrorComponents
