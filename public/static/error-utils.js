/**
 * Error Utilities
 * 
 * Provides reusable error handling for GalleryPia platform
 * Addresses UX-C-003: Design and Implement Error State Visual Components
 * 
 * Usage:
 * - Import this file in any HTML page that needs error handling
 * - Use global functions: showError, showSuccess, showWarning, showInfo, showFieldError
 * 
 * @module error-utils
 */

// ====================================
// Toast Notifications
// ====================================

/**
 * Show toast notification
 * @param {string} message - Message to display
 * @param {string} severity - Severity level (error, warning, info, success)
 * @param {number} duration - Duration in milliseconds
 * @param {string} position - Position on screen
 */
function showToast(message, severity = 'info', duration = 5000, position = 'top-right') {
  const config = {
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
  };

  const positionClasses = {
    'top-right': 'top-4 right-4',
    'top-left': 'top-4 left-4',
    'bottom-right': 'bottom-4 right-4',
    'bottom-left': 'bottom-4 left-4',
    'top-center': 'top-4 left-1/2 -translate-x-1/2',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2'
  };

  const c = config[severity] || config.info;
  const posClass = positionClasses[position] || positionClasses['top-right'];

  const toast = document.createElement('div');
  toast.id = `toast-${Date.now()}`;
  toast.className = `fixed ${posClass} z-50 animate-slide-in-right`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'assertive');

  toast.innerHTML = `
    <div class="flex items-center gap-3 ${c.bg} border ${c.border} rounded-lg shadow-lg px-4 py-3 min-w-[300px] max-w-md">
      <i class="fas ${c.icon} ${c.color} text-xl" aria-hidden="true"></i>
      <p class="${c.color} flex-1">
        ${message}
      </p>
      <button
        type="button"
        class="${c.color} hover:opacity-75 transition-opacity"
        onclick="this.closest('[role=alert]').remove()"
        aria-label="닫기"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  document.body.appendChild(toast);

  // Auto-remove after duration
  if (duration > 0) {
    setTimeout(() => {
      toast.remove();
    }, duration);
  }

  return toast;
}

/**
 * Show error toast
 * @param {string} message - Error message
 * @param {number} duration - Duration in milliseconds
 */
function showError(message, duration = 5000) {
  return showToast(message, 'error', duration);
}

/**
 * Show success toast
 * @param {string} message - Success message
 * @param {number} duration - Duration in milliseconds
 */
function showSuccess(message, duration = 3000) {
  return showToast(message, 'success', duration);
}

/**
 * Show warning toast
 * @param {string} message - Warning message
 * @param {number} duration - Duration in milliseconds
 */
function showWarning(message, duration = 4000) {
  return showToast(message, 'warning', duration);
}

/**
 * Show info toast
 * @param {string} message - Info message
 * @param {number} duration - Duration in milliseconds
 */
function showInfo(message, duration = 3000) {
  return showToast(message, 'info', duration);
}

// ====================================
// Inline Error Messages
// ====================================

/**
 * Show inline error message
 * @param {string|HTMLElement} selector - Element selector or element
 * @param {string} message - Error message
 * @param {string} severity - Severity level
 */
function showInlineError(selector, message, severity = 'error') {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
    
  if (!element) {
    console.warn('showInlineError: element not found', selector);
    return;
  }

  const config = {
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
  };

  const c = config[severity] || config.error;

  const errorDiv = document.createElement('div');
  errorDiv.className = `rounded-lg border ${c.border} ${c.bg} p-4 mb-4`;
  errorDiv.setAttribute('role', 'alert');
  errorDiv.setAttribute('aria-live', 'polite');

  errorDiv.innerHTML = `
    <div class="flex items-start gap-3">
      <div class="flex-shrink-0">
        <i class="fas ${c.icon} ${c.color} text-xl" aria-hidden="true"></i>
      </div>
      <div class="flex-1">
        <p class="${c.color} text-sm">
          ${message}
        </p>
      </div>
      <button
        type="button"
        class="flex-shrink-0 ${c.color} hover:opacity-75 transition-opacity"
        onclick="this.parentElement.parentElement.remove()"
        aria-label="닫기"
      >
        <i class="fas fa-times"></i>
      </button>
    </div>
  `;

  // Remove existing error if present
  const existingError = element.querySelector('[role="alert"]');
  if (existingError) {
    existingError.remove();
  }

  // Insert error at the beginning
  element.insertBefore(errorDiv, element.firstChild);

  // Scroll to error
  errorDiv.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

/**
 * Hide inline error
 * @param {string|HTMLElement} selector - Element selector or element
 */
function hideInlineError(selector) {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
    
  if (!element) return;

  const errorDiv = element.querySelector('[role="alert"]');
  if (errorDiv) {
    errorDiv.remove();
  }
}

// ====================================
// Field Errors
// ====================================

/**
 * Show field error
 * @param {string|HTMLElement} fieldSelector - Input field selector or element
 * @param {string} message - Error message
 */
function showFieldError(fieldSelector, message) {
  const field = typeof fieldSelector === 'string' 
    ? document.querySelector(fieldSelector) 
    : fieldSelector;
    
  if (!field) {
    console.warn('showFieldError: field not found', fieldSelector);
    return;
  }

  // Remove existing error
  hideFieldError(field);

  // Add error styling to field
  field.classList.add('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
  field.setAttribute('aria-invalid', 'true');

  // Create error message
  const errorDiv = document.createElement('div');
  errorDiv.className = 'flex items-center gap-1 mt-1 text-red-600 text-sm field-error';
  errorDiv.setAttribute('role', 'alert');
  errorDiv.setAttribute('aria-live', 'polite');
  errorDiv.id = `${field.id || 'field'}-error`;

  errorDiv.innerHTML = `
    <i class="fas fa-exclamation-circle" aria-hidden="true"></i>
    <span>${message}</span>
  `;

  // Insert error after field
  field.parentNode.insertBefore(errorDiv, field.nextSibling);

  // Link field to error
  field.setAttribute('aria-describedby', errorDiv.id);
}

/**
 * Hide field error
 * @param {string|HTMLElement} fieldSelector - Input field selector or element
 */
function hideFieldError(fieldSelector) {
  const field = typeof fieldSelector === 'string' 
    ? document.querySelector(fieldSelector) 
    : fieldSelector;
    
  if (!field) return;

  // Remove error styling
  field.classList.remove('border-red-500', 'focus:ring-red-500', 'focus:border-red-500');
  field.removeAttribute('aria-invalid');
  field.removeAttribute('aria-describedby');

  // Remove error message
  const errorDiv = field.parentNode.querySelector('.field-error');
  if (errorDiv) {
    errorDiv.remove();
  }
}

/**
 * Validate field and show error if invalid
 * @param {string|HTMLElement} fieldSelector - Input field selector or element
 * @param {Function} validator - Validation function that returns error message or null
 * @returns {boolean} - True if valid, false if invalid
 */
function validateField(fieldSelector, validator) {
  const field = typeof fieldSelector === 'string' 
    ? document.querySelector(fieldSelector) 
    : fieldSelector;
    
  if (!field) return false;

  const errorMessage = validator(field.value);
  
  if (errorMessage) {
    showFieldError(field, errorMessage);
    return false;
  } else {
    hideFieldError(field);
    return true;
  }
}

// ====================================
// Error Dialogs
// ====================================

/**
 * Show error dialog
 * @param {Object} options - Dialog options
 * @param {string} options.title - Dialog title
 * @param {string} options.message - Dialog message
 * @param {string} options.severity - Severity level (error, warning, info)
 * @param {string} options.details - Additional details
 * @param {Array} options.actions - Array of action buttons
 */
function showErrorDialog(options) {
  const {
    title = '오류',
    message = '오류가 발생했습니다.',
    severity = 'error',
    details = '',
    actions = []
  } = options;

  const config = {
    error: {
      icon: 'fa-exclamation-circle',
      color: 'text-red-700'
    },
    warning: {
      icon: 'fa-exclamation-triangle',
      color: 'text-yellow-700'
    },
    info: {
      icon: 'fa-info-circle',
      color: 'text-blue-700'
    }
  };

  const c = config[severity] || config.error;
  const dialogId = `error-dialog-${Date.now()}`;

  // Default actions
  const defaultActions = actions.length > 0 ? actions : [
    {
      text: '확인',
      onClick: () => closeErrorDialog(dialogId),
      variant: 'primary'
    }
  ];

  const overlay = document.createElement('div');
  overlay.id = dialogId;
  overlay.className = 'error-dialog-overlay fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4';
  overlay.setAttribute('role', 'dialog');
  overlay.setAttribute('aria-modal', 'true');
  overlay.setAttribute('aria-labelledby', `${dialogId}-title`);

  overlay.innerHTML = `
    <div 
      class="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden"
      onclick="event.stopPropagation()"
    >
      <!-- Header -->
      <div class="px-6 py-4 border-b border-gray-200 flex items-center gap-3">
        <i class="fas ${c.icon} ${c.color} text-2xl" aria-hidden="true"></i>
        <h2 id="${dialogId}-title" class="text-xl font-bold text-gray-800 flex-1">
          ${title}
        </h2>
        <button
          type="button"
          class="text-gray-400 hover:text-gray-600 transition-colors"
          onclick="document.getElementById('${dialogId}').remove()"
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
        ${defaultActions.map((action, index) => {
          const variantClasses = {
            primary: 'bg-blue-600 hover:bg-blue-700 text-white',
            secondary: 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-300',
            danger: 'bg-red-600 hover:bg-red-700 text-white'
          };
          const classes = variantClasses[action.variant || 'primary'];
          
          return `
            <button
              type="button"
              id="${dialogId}-action-${index}"
              class="px-4 py-2 rounded-lg font-medium transition-colors ${classes}"
            >
              ${action.text}
            </button>
          `;
        }).join('')}
      </div>
    </div>
  `;

  document.body.appendChild(overlay);

  // Add click handlers for actions
  defaultActions.forEach((action, index) => {
    const button = document.getElementById(`${dialogId}-action-${index}`);
    if (button && action.onClick) {
      button.addEventListener('click', () => {
        if (typeof action.onClick === 'function') {
          action.onClick();
        } else {
          eval(action.onClick);
        }
      });
    }
  });

  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeErrorDialog(dialogId);
    }
  });

  // Close on Escape key
  const handleEscape = (e) => {
    if (e.key === 'Escape') {
      closeErrorDialog(dialogId);
      document.removeEventListener('keydown', handleEscape);
    }
  };
  document.addEventListener('keydown', handleEscape);

  return dialogId;
}

/**
 * Close error dialog
 * @param {string} dialogId - Dialog ID
 */
function closeErrorDialog(dialogId) {
  const dialog = document.getElementById(dialogId);
  if (dialog) {
    dialog.remove();
  }
}

// ====================================
// Error Banners
// ====================================

/**
 * Show error banner at top of page
 * @param {Object} options - Banner options
 */
function showErrorBanner(options) {
  const {
    message = '오류가 발생했습니다.',
    severity = 'error',
    title = '',
    actions = [],
    dismissible = true,
    sticky = false,
    position = 'top'
  } = options;

  const config = {
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
  };

  const c = config[severity] || config.error;
  const bannerId = `error-banner-${Date.now()}`;
  const positionClass = position === 'top' ? 'top-0' : 'bottom-0';
  const stickyClass = sticky ? 'sticky' : 'relative';

  const banner = document.createElement('div');
  banner.id = bannerId;
  banner.className = `${stickyClass} ${positionClass} left-0 right-0 z-50`;
  banner.setAttribute('role', 'alert');
  banner.setAttribute('aria-live', 'assertive');

  banner.innerHTML = `
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
      <div class="rounded-lg border ${c.border} ${c.bg} p-4 shadow-lg">
        <div class="flex items-center gap-4">
          <div class="flex-shrink-0">
            <i class="fas ${c.icon} ${c.color} text-2xl" aria-hidden="true"></i>
          </div>
          
          <div class="flex-1">
            ${title ? `
              <h3 class="font-bold ${c.color} text-lg mb-1">
                ${title}
              </h3>
            ` : ''}
            <p class="${c.color}">
              ${message}
            </p>
          </div>
          
          ${actions.length > 0 ? `
            <div class="flex items-center gap-2">
              ${actions.map((action, index) => `
                <button
                  type="button"
                  id="${bannerId}-action-${index}"
                  class="px-4 py-2 rounded-lg font-medium transition-colors ${
                    action.variant === 'primary'
                      ? `bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'blue'}-600 text-white hover:bg-${severity === 'error' ? 'red' : severity === 'warning' ? 'yellow' : 'blue'}-700`
                      : `${c.color} hover:underline`
                  }"
                >
                  ${action.text}
                </button>
              `).join('')}
            </div>
          ` : ''}
          
          ${dismissible ? `
            <button
              type="button"
              class="flex-shrink-0 ${c.color} hover:opacity-75 transition-opacity"
              onclick="document.getElementById('${bannerId}').remove()"
              aria-label="닫기"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
          ` : ''}
        </div>
      </div>
    </div>
  `;

  // Insert at beginning of body or at specific position
  if (position === 'top') {
    document.body.insertBefore(banner, document.body.firstChild);
  } else {
    document.body.appendChild(banner);
  }

  // Add click handlers for actions
  actions.forEach((action, index) => {
    const button = document.getElementById(`${bannerId}-action-${index}`);
    if (button && action.onClick) {
      button.addEventListener('click', () => {
        if (typeof action.onClick === 'function') {
          action.onClick();
        } else {
          eval(action.onClick);
        }
      });
    }
  });

  return bannerId;
}

/**
 * Hide error banner
 * @param {string} bannerId - Banner ID
 */
function hideErrorBanner(bannerId) {
  const banner = document.getElementById(bannerId);
  if (banner) {
    banner.remove();
  }
}

// ====================================
// Export for use in other scripts
// ====================================

if (typeof window !== 'undefined') {
  window.ErrorUtils = {
    // Toast notifications
    showToast,
    showError,
    showSuccess,
    showWarning,
    showInfo,
    
    // Inline errors
    showInlineError,
    hideInlineError,
    
    // Field errors
    showFieldError,
    hideFieldError,
    validateField,
    
    // Dialogs
    showErrorDialog,
    closeErrorDialog,
    
    // Banners
    showErrorBanner,
    hideErrorBanner
  };
}

console.log('✅ Error Utils initialized');
