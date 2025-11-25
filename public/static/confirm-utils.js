/**
 * Confirmation Dialog Utilities
 * 
 * Client-side utilities for confirmation dialogs in GalleryPia platform
 * Addresses UX-H-003: Missing Confirmation Dialogs
 * 
 * Usage:
 * - Import this file in HTML pages that need confirmation dialogs
 * - Use async/await pattern for clean confirm flow
 * 
 * @module confirm-utils
 */

// ====================================
// Confirmation Dialog
// ====================================

/**
 * Show confirmation dialog
 * @param {Object} config - Dialog configuration
 * @param {string} config.title - Dialog title
 * @param {string} config.message - Main message
 * @param {string} config.severity - Severity: 'info', 'warning', 'danger'
 * @param {string} config.details - Additional details
 * @param {string} config.confirmText - Confirm button text
 * @param {string} config.cancelText - Cancel button text
 * @returns {Promise<boolean>} - True if confirmed, false if cancelled
 * 
 * @example
 * const confirmed = await confirm({
 *   title: '삭제 확인',
 *   message: '정말 삭제하시겠습니까?',
 *   severity: 'danger'
 * })
 * if (confirmed) {
 *   // Proceed with deletion
 * }
 */
async function confirm(config = {}) {
  return new Promise((resolve) => {
    const {
      title = '확인',
      message = '계속하시겠습니까?',
      severity = 'warning',
      confirmText = '확인',
      cancelText = '취소',
      details = ''
    } = config;

    const dialogId = `confirm-dialog-${Date.now()}`;

    const severityConfig = {
      info: {
        icon: 'fa-info-circle',
        iconColor: 'text-blue-500',
        confirmClass: 'bg-blue-600 hover:bg-blue-700'
      },
      warning: {
        icon: 'fa-exclamation-triangle',
        iconColor: 'text-yellow-500',
        confirmClass: 'bg-blue-600 hover:bg-blue-700'
      },
      danger: {
        icon: 'fa-exclamation-circle',
        iconColor: 'text-red-500',
        confirmClass: 'bg-red-600 hover:bg-red-700'
      }
    };

    const config_data = severityConfig[severity] || severityConfig.warning;

    const dialog = document.createElement('div');
    dialog.id = dialogId;
    dialog.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
    dialog.setAttribute('role', 'dialog');
    dialog.setAttribute('aria-modal', 'true');
    dialog.setAttribute('aria-labelledby', `${dialogId}-title`);

    dialog.innerHTML = `
      <div 
        class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in"
        onclick="event.stopPropagation()"
      >
        <!-- Header -->
        <div class="px-6 py-4 border-b border-gray-200">
          <div class="flex items-center gap-3">
            <div class="flex-shrink-0">
              <i class="fas ${config_data.icon} ${config_data.iconColor} text-2xl" aria-hidden="true"></i>
            </div>
            <h2 id="${dialogId}-title" class="text-xl font-bold text-gray-800 flex-1">
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
            class="px-4 py-2 rounded-lg font-medium transition-colors bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300"
            data-action="cancel"
          >
            ${cancelText}
          </button>
          <button
            type="button"
            class="px-4 py-2 rounded-lg font-medium transition-colors ${config_data.confirmClass} text-white"
            data-action="confirm"
          >
            ${confirmText}
          </button>
        </div>
      </div>
    `;

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
      } else if (e.key === 'Enter' && !e.shiftKey && e.target.tagName === 'BUTTON') {
        // Let button handle the click
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

    // Focus confirm button
    setTimeout(() => {
      const confirmBtn = dialog.querySelector('[data-action="confirm"]');
      if (confirmBtn) {
        confirmBtn.focus();
      }
    }, 100);
  });
}

// ====================================
// Preset Confirmations
// ====================================

/**
 * Confirm delete action
 * @param {string} itemName - Name of item to delete
 * @param {string} itemType - Type of item (default: '항목')
 * @returns {Promise<boolean>}
 */
async function confirmDelete(itemName, itemType = '항목') {
  return await confirm({
    title: `${itemType} 삭제`,
    message: `"${itemName}"을(를) 정말 삭제하시겠습니까?`,
    severity: 'danger',
    details: '삭제된 데이터는 복구할 수 없습니다.',
    confirmText: '삭제',
    cancelText: '취소'
  });
}

/**
 * Confirm logout
 * @returns {Promise<boolean>}
 */
async function confirmLogout() {
  return await confirm({
    title: '로그아웃',
    message: '로그아웃 하시겠습니까?',
    severity: 'info',
    confirmText: '로그아웃',
    cancelText: '취소'
  });
}

/**
 * Confirm unsaved changes
 * @returns {Promise<boolean>}
 */
async function confirmUnsavedChanges() {
  return await confirm({
    title: '저장되지 않은 변경사항',
    message: '변경사항이 저장되지 않았습니다. 계속하시겠습니까?',
    severity: 'warning',
    details: '저장하지 않은 변경사항은 모두 손실됩니다.',
    confirmText: '나가기',
    cancelText: '취소'
  });
}

/**
 * Confirm account deletion
 * @returns {Promise<boolean>}
 */
async function confirmDeleteAccount() {
  return await confirm({
    title: '계정 삭제',
    message: '정말로 계정을 삭제하시겠습니까?',
    severity: 'danger',
    details: '계정을 삭제하면 모든 데이터가 영구적으로 삭제되며 복구할 수 없습니다.',
    confirmText: '계정 삭제',
    cancelText: '취소'
  });
}

/**
 * Confirm ban user (admin)
 * @param {string} userName - User name to ban
 * @returns {Promise<boolean>}
 */
async function confirmBanUser(userName) {
  return await confirm({
    title: '사용자 차단',
    message: `"${userName}" 사용자를 차단하시겠습니까?`,
    severity: 'danger',
    details: '차단된 사용자는 플랫폼에 접근할 수 없습니다.',
    confirmText: '차단',
    cancelText: '취소'
  });
}

/**
 * Confirm reject submission (admin)
 * @param {string} submissionTitle - Submission title
 * @returns {Promise<boolean>}
 */
async function confirmRejectSubmission(submissionTitle) {
  return await confirm({
    title: '제출 거부',
    message: `"${submissionTitle}" 제출을 거부하시겠습니까?`,
    severity: 'warning',
    details: '거부 사유를 함께 전달하는 것이 좋습니다.',
    confirmText: '거부',
    cancelText: '취소'
  });
}

/**
 * Confirm cancel with form data
 * @param {boolean} hasChanges - Whether form has unsaved changes
 * @returns {Promise<boolean>}
 */
async function confirmCancelForm(hasChanges = true) {
  if (!hasChanges) {
    return true; // No confirmation needed
  }

  return await confirmUnsavedChanges();
}

// ====================================
// Form Protection
// ====================================

/**
 * Protect form from accidental navigation
 * @param {string|HTMLFormElement} formSelector - Form selector or element
 * @param {Function} checkDirty - Function that returns true if form has changes
 */
function protectForm(formSelector, checkDirty) {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;
    
  if (!form) {
    console.warn('protectForm: form not found', formSelector);
    return;
  }

  // Warn on page unload
  const handleBeforeUnload = (e) => {
    if (checkDirty()) {
      e.preventDefault();
      e.returnValue = ''; // Chrome requires returnValue to be set
      return '변경사항이 저장되지 않았습니다.';
    }
  };

  window.addEventListener('beforeunload', handleBeforeUnload);

  // Clean up on form submit
  form.addEventListener('submit', () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  });

  // Return cleanup function
  return () => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
  };
}

/**
 * Track form changes automatically
 * @param {string|HTMLFormElement} formSelector - Form selector or element
 * @returns {Object} - { isDirty: Function, markClean: Function, cleanup: Function }
 */
function trackFormChanges(formSelector) {
  const form = typeof formSelector === 'string' 
    ? document.querySelector(formSelector) 
    : formSelector;
    
  if (!form) {
    console.warn('trackFormChanges: form not found', formSelector);
    return { isDirty: () => false, markClean: () => {}, cleanup: () => {} };
  }

  let dirty = false;
  const originalValues = new FormData(form);

  const checkChanges = () => {
    const currentValues = new FormData(form);
    
    for (const [key, value] of currentValues.entries()) {
      if (originalValues.get(key) !== value) {
        return true;
      }
    }
    
    return false;
  };

  const handleInput = () => {
    dirty = checkChanges();
  };

  form.addEventListener('input', handleInput);
  form.addEventListener('change', handleInput);

  return {
    isDirty: () => dirty,
    markClean: () => {
      dirty = false;
      // Update original values
      const currentValues = new FormData(form);
      originalValues.forEach((value, key) => {
        originalValues.set(key, currentValues.get(key));
      });
    },
    cleanup: () => {
      form.removeEventListener('input', handleInput);
      form.removeEventListener('change', handleInput);
    }
  };
}

// ====================================
// Export for use in other scripts
// ====================================

if (typeof window !== 'undefined') {
  window.ConfirmUtils = {
    // Core
    confirm,
    
    // Presets
    confirmDelete,
    confirmLogout,
    confirmUnsavedChanges,
    confirmDeleteAccount,
    confirmBanUser,
    confirmRejectSubmission,
    confirmCancelForm,
    
    // Form protection
    protectForm,
    trackFormChanges
  };
}

console.log('✅ Confirm Utils initialized');
