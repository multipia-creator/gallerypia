/**
 * Confirmation Dialog Component Library
 * 
 * Provides confirmation dialogs for critical actions in GalleryPia platform
 * Addresses UX-H-003: Missing Confirmation Dialogs
 * 
 * Use cases:
 * - Delete actions (artwork, account, etc.)
 * - Logout confirmation
 * - Cancel with unsaved changes
 * - Destructive actions
 * - Admin actions (ban user, reject submission)
 * 
 * Features:
 * - Multiple severity levels (info, warning, danger)
 * - Customizable buttons
 * - Keyboard shortcuts (Enter, Escape)
 * - Focus management
 * - Accessible (ARIA)
 * 
 * @module components/confirm-dialog
 */

/**
 * Confirmation Dialog Severity
 */
export type ConfirmSeverity = 'info' | 'warning' | 'danger'

/**
 * Confirmation Button
 */
export interface ConfirmButton {
  text: string
  action: 'confirm' | 'cancel'
  variant?: 'primary' | 'danger' | 'secondary'
  onClick?: string
}

/**
 * Confirmation Dialog Props
 */
export interface ConfirmDialogProps {
  id?: string
  title: string
  message: string
  severity?: ConfirmSeverity
  details?: string
  confirmText?: string
  cancelText?: string
  onConfirm: string
  onCancel?: string
  icon?: string
  className?: string
}

/**
 * Severity configurations
 */
const SEVERITY_CONFIG: Record<ConfirmSeverity, { 
  icon: string
  iconColor: string
  confirmVariant: 'primary' | 'danger'
}> = {
  info: {
    icon: 'fa-info-circle',
    iconColor: 'text-blue-500',
    confirmVariant: 'primary'
  },
  warning: {
    icon: 'fa-exclamation-triangle',
    iconColor: 'text-yellow-500',
    confirmVariant: 'primary'
  },
  danger: {
    icon: 'fa-exclamation-circle',
    iconColor: 'text-red-500',
    confirmVariant: 'danger'
  }
}

/**
 * Renders a confirmation dialog
 * 
 * @example
 * ```typescript
 * // Delete confirmation
 * renderConfirmDialog({
 *   title: '작품 삭제',
 *   message: '이 작품을 정말 삭제하시겠습니까?',
 *   severity: 'danger',
 *   details: '삭제된 작품은 복구할 수 없습니다.',
 *   confirmText: '삭제',
 *   cancelText: '취소',
 *   onConfirm: 'deleteArtwork(123)'
 * })
 * 
 * // Logout confirmation
 * renderConfirmDialog({
 *   title: '로그아웃',
 *   message: '로그아웃 하시겠습니까?',
 *   severity: 'info',
 *   confirmText: '로그아웃',
 *   onConfirm: 'logout()'
 * })
 * ```
 */
export function renderConfirmDialog(props: ConfirmDialogProps): string {
  const {
    id = `confirm-dialog-${Date.now()}`,
    title,
    message,
    severity = 'warning',
    details,
    confirmText = '확인',
    cancelText = '취소',
    onConfirm,
    onCancel = `document.getElementById('${id}').remove()`,
    icon,
    className = ''
  } = props

  const config = SEVERITY_CONFIG[severity]
  const iconClass = icon || config.icon
  const confirmVariant = config.confirmVariant

  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300'
  }

  return `
    <div 
      id="${id}"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 ${className}"
      role="dialog"
      aria-modal="true"
      aria-labelledby="${id}-title"
      onclick="if(event.target === this) { ${onCancel} }"
    >
      <div 
        class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onclick="event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <i class="fas ${iconClass} ${config.iconColor} text-2xl" aria-hidden="true"></i>
            </div>
            <h2 id="${id}-title" class="text-xl font-bold text-gray-800 flex-1">
              ${title}
            </h2>
          </div>
        </div>
        
        <!-- Body -->
        <div class="px-6 py-4">
          <p class="text-gray-700 mb-3">
            ${message}
          </p>
          
          ${details ? `
            <div class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
              <p class="text-sm text-gray-600">
                ${details}
              </p>
            </div>
          ` : ''}
        </div>
        
        <!-- Footer -->
        <div class="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-2 justify-end">
          <button
            type="button"
            onclick="${onCancel}"
            class="px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses.secondary}"
            data-action="cancel"
          >
            ${cancelText}
          </button>
          <button
            type="button"
            onclick="${onConfirm}; ${onCancel}"
            class="px-4 py-2 rounded-lg font-medium transition-colors ${variantClasses[confirmVariant]}"
            data-action="confirm"
            autofocus
          >
            ${confirmText}
          </button>
        </div>
      </div>
    </div>

    <script>
    (function() {
      const dialog = document.getElementById('${id}');
      if (!dialog) return;

      // Handle keyboard shortcuts
      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ${onCancel};
          document.removeEventListener('keydown', handleKeydown);
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          ${onConfirm};
          ${onCancel};
          document.removeEventListener('keydown', handleKeydown);
        }
      };

      document.addEventListener('keydown', handleKeydown);

      // Focus first button
      const confirmBtn = dialog.querySelector('[data-action="confirm"]');
      if (confirmBtn) {
        setTimeout(() => confirmBtn.focus(), 100);
      }

      // Prevent body scroll
      document.body.style.overflow = 'hidden';

      // Cleanup on remove
      const observer = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          mutation.removedNodes.forEach((node) => {
            if (node.id === '${id}') {
              document.body.style.overflow = '';
              document.removeEventListener('keydown', handleKeydown);
              observer.disconnect();
            }
          });
        });
      });

      observer.observe(document.body, { childList: true });
    })();
    </script>
  `
}

/**
 * Preset confirmation dialogs for common scenarios
 */

/**
 * Delete confirmation
 */
export function renderDeleteConfirm(props: {
  itemName: string
  itemType?: string
  onConfirm: string
  details?: string
}): string {
  const { itemName, itemType = '항목', onConfirm, details } = props

  return renderConfirmDialog({
    title: `${itemType} 삭제`,
    message: `"${itemName}"을(를) 정말 삭제하시겠습니까?`,
    severity: 'danger',
    details: details || '삭제된 데이터는 복구할 수 없습니다.',
    confirmText: '삭제',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Logout confirmation
 */
export function renderLogoutConfirm(props: {
  onConfirm: string
}): string {
  const { onConfirm } = props

  return renderConfirmDialog({
    title: '로그아웃',
    message: '로그아웃 하시겠습니까?',
    severity: 'info',
    confirmText: '로그아웃',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Unsaved changes confirmation
 */
export function renderUnsavedChangesConfirm(props: {
  onConfirm: string
}): string {
  const { onConfirm } = props

  return renderConfirmDialog({
    title: '저장되지 않은 변경사항',
    message: '변경사항이 저장되지 않았습니다. 계속하시겠습니까?',
    severity: 'warning',
    details: '저장하지 않은 변경사항은 모두 손실됩니다.',
    confirmText: '나가기',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Account deletion confirmation
 */
export function renderDeleteAccountConfirm(props: {
  onConfirm: string
}): string {
  const { onConfirm } = props

  return renderConfirmDialog({
    title: '계정 삭제',
    message: '정말로 계정을 삭제하시겠습니까?',
    severity: 'danger',
    details: '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
    confirmText: '계정 삭제',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Ban user confirmation (admin)
 */
export function renderBanUserConfirm(props: {
  userName: string
  onConfirm: string
}): string {
  const { userName, onConfirm } = props

  return renderConfirmDialog({
    title: '사용자 차단',
    message: `"${userName}" 사용자를 차단하시겠습니까?`,
    severity: 'danger',
    details: '차단된 사용자는 플랫폼에 접근할 수 없습니다.',
    confirmText: '차단',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Reject submission confirmation (admin)
 */
export function renderRejectSubmissionConfirm(props: {
  submissionTitle: string
  onConfirm: string
}): string {
  const { submissionTitle, onConfirm } = props

  return renderConfirmDialog({
    title: '제출 거부',
    message: `"${submissionTitle}" 제출을 거부하시겠습니까?`,
    severity: 'warning',
    details: '거부 사유를 함께 전달하는 것이 좋습니다.',
    confirmText: '거부',
    cancelText: '취소',
    onConfirm
  })
}

/**
 * Client-side JavaScript helpers
 */
export const CONFIRM_DIALOG_HELPERS_SCRIPT = `
/**
 * Confirmation Dialog Helpers
 */
class ConfirmDialogHelper {
  /**
   * Show confirmation dialog
   * @param {Object} config - Dialog configuration
   * @returns {Promise<boolean>} - Resolves to true if confirmed, false if cancelled
   */
  static async show(config) {
    return new Promise((resolve) => {
      const {
        title = '확인',
        message = '계속하시겠습니까?',
        severity = 'warning',
        confirmText = '확인',
        cancelText = '취소',
        details = ''
      } = config;

      const dialogId = \`confirm-dialog-\${Date.now()}\`;

      const severityIcons = {
        info: 'fa-info-circle text-blue-500',
        warning: 'fa-exclamation-triangle text-yellow-500',
        danger: 'fa-exclamation-circle text-red-500'
      };

      const confirmVariants = {
        info: 'bg-blue-600 hover:bg-blue-700',
        warning: 'bg-blue-600 hover:bg-blue-700',
        danger: 'bg-red-600 hover:bg-red-700'
      };

      const dialog = document.createElement('div');
      dialog.id = dialogId;
      dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
      dialog.setAttribute('role', 'dialog');
      dialog.setAttribute('aria-modal', 'true');

      dialog.innerHTML = \`
        <div class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in">
          <div class="px-6 py-4 border-b border-gray-200">
            <div class="flex items-center gap-3">
              <i class="fas \${severityIcons[severity]} text-2xl"></i>
              <h2 class="text-xl font-bold text-gray-800 flex-1">\${title}</h2>
            </div>
          </div>
          
          <div class="px-6 py-4">
            <p class="text-gray-700 mb-3">\${message}</p>
            \${details ? \`
              <div class="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p class="text-sm text-gray-600">\${details}</p>
              </div>
            \` : ''}
          </div>
          
          <div class="px-6 py-4 bg-gray-50 flex flex-col-reverse sm:flex-row gap-2 justify-end">
            <button
              type="button"
              class="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
              data-action="cancel"
            >
              \${cancelText}
            </button>
            <button
              type="button"
              class="px-4 py-2 rounded-lg font-medium transition-colors \${confirmVariants[severity]} text-white"
              data-action="confirm"
            >
              \${confirmText}
            </button>
          </div>
        </div>
      \`;

      const cleanup = () => {
        dialog.remove();
        document.body.style.overflow = '';
        document.removeEventListener('keydown', handleKeydown);
      };

      const handleKeydown = (e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          cleanup();
          resolve(false);
        } else if (e.key === 'Enter' && !e.shiftKey) {
          e.preventDefault();
          cleanup();
          resolve(true);
        }
      };

      dialog.querySelector('[data-action="confirm"]').addEventListener('click', () => {
        cleanup();
        resolve(true);
      });

      dialog.querySelector('[data-action="cancel"]').addEventListener('click', () => {
        cleanup();
        resolve(false);
      });

      dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
          cleanup();
          resolve(false);
        }
      });

      document.addEventListener('keydown', handleKeydown);
      document.body.appendChild(dialog);
      document.body.style.overflow = 'hidden';

      setTimeout(() => {
        dialog.querySelector('[data-action="confirm"]').focus();
      }, 100);
    });
  }

  /**
   * Show delete confirmation
   */
  static async confirmDelete(itemName, itemType = '항목') {
    return await this.show({
      title: \`\${itemType} 삭제\`,
      message: \`"\${itemName}"을(를) 정말 삭제하시겠습니까?\`,
      severity: 'danger',
      details: '삭제된 데이터는 복구할 수 없습니다.',
      confirmText: '삭제',
      cancelText: '취소'
    });
  }

  /**
   * Show logout confirmation
   */
  static async confirmLogout() {
    return await this.show({
      title: '로그아웃',
      message: '로그아웃 하시겠습니까?',
      severity: 'info',
      confirmText: '로그아웃',
      cancelText: '취소'
    });
  }

  /**
   * Show unsaved changes confirmation
   */
  static async confirmUnsavedChanges() {
    return await this.show({
      title: '저장되지 않은 변경사항',
      message: '변경사항이 저장되지 않았습니다. 계속하시겠습니까?',
      severity: 'warning',
      details: '저장하지 않은 변경사항은 모두 손실됩니다.',
      confirmText: '나가기',
      cancelText: '취소'
    });
  }
}

// Make globally available
window.ConfirmDialogHelper = ConfirmDialogHelper;
`

/**
 * Export all confirmation dialog components
 */
export const ConfirmDialogComponents = {
  renderConfirmDialog,
  renderDeleteConfirm,
  renderLogoutConfirm,
  renderUnsavedChangesConfirm,
  renderDeleteAccountConfirm,
  renderBanUserConfirm,
  renderRejectSubmissionConfirm,
  CONFIRM_DIALOG_HELPERS_SCRIPT
}

export default ConfirmDialogComponents
