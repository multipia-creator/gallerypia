/**
 * Success Feedback Utilities for GalleryPia
 * 
 * Provides visual success feedback for user actions including:
 * - Success messages (toast notifications)
 * - Success highlighting (element flash effect)
 * - Success animations (checkmarks, confetti)
 * - Form success states
 * - Action completion feedback
 * 
 * Addresses UX-H-004: Implement success feedback for user actions
 * 
 * Usage:
 * ```javascript
 * // Show success toast
 * showSuccess('작품이 저장되었습니다!');
 * 
 * // Highlight element on success
 * highlightSuccess('#artwork-card-123');
 * 
 * // Show success with action
 * showSuccessWithAction('작품이 저장되었습니다!', '보기', () => {
 *   window.location.href = '/gallery/123';
 * });
 * 
 * // Show checkmark animation
 * showSuccessCheckmark('#upload-container');
 * 
 * // Form success state
 * setFormSuccess('#contact-form', '메시지가 전송되었습니다!');
 * ```
 */

// =============================================================================
// Success Toast Notifications
// =============================================================================

/**
 * Show success toast notification
 * @param {string} message - Success message
 * @param {number} [duration=4000] - Display duration in milliseconds
 * @param {Object} [options] - Additional options
 * @param {string} [options.position='top-right'] - Toast position
 * @param {boolean} [options.dismissible=true] - Allow manual dismissal
 * @param {string} [options.icon='check'] - Icon type
 */
function showSuccess(message, duration = 4000, options = {}) {
  const {
    position = 'top-right',
    dismissible = true,
    icon = 'check'
  } = options;

  const toastId = `toast-success-${Date.now()}`;
  const positionClass = getToastPositionClass(position);
  
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `success-toast ${positionClass} animate-slide-in`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  
  const iconHtml = getSuccessIcon(icon);
  
  toast.innerHTML = `
    <div class="success-toast-content">
      <div class="success-toast-icon">${iconHtml}</div>
      <div class="success-toast-message">${message}</div>
      ${dismissible ? '<button class="success-toast-close" aria-label="닫기">&times;</button>' : ''}
    </div>
    <div class="success-toast-progress"></div>
  `;
  
  document.body.appendChild(toast);
  
  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Setup close button
  if (dismissible) {
    const closeBtn = toast.querySelector('.success-toast-close');
    closeBtn.addEventListener('click', () => dismissToast(toastId));
  }
  
  // Auto dismiss with progress bar
  if (duration > 0) {
    const progressBar = toast.querySelector('.success-toast-progress');
    progressBar.style.animation = `progress ${duration}ms linear`;
    
    setTimeout(() => {
      dismissToast(toastId);
    }, duration);
  }
  
  return toastId;
}

/**
 * Show success toast with action button
 * @param {string} message - Success message
 * @param {string} actionLabel - Action button label
 * @param {Function} actionCallback - Action button callback
 * @param {number} [duration=6000] - Display duration (0 = no auto-dismiss)
 */
function showSuccessWithAction(message, actionLabel, actionCallback, duration = 6000) {
  const toastId = `toast-success-action-${Date.now()}`;
  
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = 'success-toast top-right animate-slide-in';
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  
  toast.innerHTML = `
    <div class="success-toast-content">
      <div class="success-toast-icon">${getSuccessIcon('check')}</div>
      <div class="success-toast-message">${message}</div>
      <button class="success-toast-action">${actionLabel}</button>
      <button class="success-toast-close" aria-label="닫기">&times;</button>
    </div>
    ${duration > 0 ? '<div class="success-toast-progress"></div>' : ''}
  `;
  
  document.body.appendChild(toast);
  
  // Trigger entrance animation
  requestAnimationFrame(() => {
    toast.classList.add('show');
  });
  
  // Setup action button
  const actionBtn = toast.querySelector('.success-toast-action');
  actionBtn.addEventListener('click', () => {
    actionCallback();
    dismissToast(toastId);
  });
  
  // Setup close button
  const closeBtn = toast.querySelector('.success-toast-close');
  closeBtn.addEventListener('click', () => dismissToast(toastId));
  
  // Auto dismiss with progress bar
  if (duration > 0) {
    const progressBar = toast.querySelector('.success-toast-progress');
    progressBar.style.animation = `progress ${duration}ms linear`;
    
    setTimeout(() => {
      dismissToast(toastId);
    }, duration);
  }
  
  return toastId;
}

/**
 * Dismiss success toast
 * @param {string} toastId - Toast element ID
 */
function dismissToast(toastId) {
  const toast = document.getElementById(toastId);
  if (!toast) return;
  
  toast.classList.remove('show');
  toast.classList.add('animate-slide-out');
  
  setTimeout(() => {
    toast.remove();
  }, 300);
}

// =============================================================================
// Success Highlighting
// =============================================================================

/**
 * Highlight element with success animation
 * @param {string|HTMLElement} target - Target element or selector
 * @param {number} [duration=2000] - Animation duration
 */
function highlightSuccess(target, duration = 2000) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  // Add success highlight class
  element.classList.add('success-highlight');
  
  // Remove after animation completes
  setTimeout(() => {
    element.classList.remove('success-highlight');
  }, duration);
}

/**
 * Flash element with success color
 * @param {string|HTMLElement} target - Target element or selector
 * @param {number} [flashes=2] - Number of flashes
 */
function flashSuccess(target, flashes = 2) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  let currentFlash = 0;
  
  const flash = () => {
    element.classList.add('success-flash');
    
    setTimeout(() => {
      element.classList.remove('success-flash');
      currentFlash++;
      
      if (currentFlash < flashes) {
        setTimeout(flash, 200);
      }
    }, 300);
  };
  
  flash();
}

// =============================================================================
// Success Checkmark Animations
// =============================================================================

/**
 * Show animated success checkmark
 * @param {string|HTMLElement} container - Container element or selector
 * @param {Object} [options] - Options
 * @param {number} [options.size=64] - Checkmark size in pixels
 * @param {string} [options.color='#22c55e'] - Checkmark color
 * @param {number} [options.duration=3000] - Display duration (0 = permanent)
 */
function showSuccessCheckmark(container, options = {}) {
  const {
    size = 64,
    color = '#22c55e',
    duration = 3000
  } = options;
  
  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return;
  
  const checkmarkId = `checkmark-${Date.now()}`;
  
  const checkmarkDiv = document.createElement('div');
  checkmarkDiv.id = checkmarkId;
  checkmarkDiv.className = 'success-checkmark-container';
  checkmarkDiv.innerHTML = `
    <svg class="success-checkmark" width="${size}" height="${size}" viewBox="0 0 64 64">
      <circle class="success-checkmark-circle" cx="32" cy="32" r="30" fill="none" stroke="${color}" stroke-width="4"/>
      <path class="success-checkmark-check" fill="none" stroke="${color}" stroke-width="4" stroke-linecap="round" d="M20,32 L28,40 L44,24"/>
    </svg>
  `;
  
  element.appendChild(checkmarkDiv);
  
  // Trigger animations
  requestAnimationFrame(() => {
    checkmarkDiv.classList.add('show');
  });
  
  // Auto remove
  if (duration > 0) {
    setTimeout(() => {
      checkmarkDiv.classList.add('fade-out');
      setTimeout(() => {
        checkmarkDiv.remove();
      }, 300);
    }, duration);
  }
  
  return checkmarkId;
}

/**
 * Show inline success checkmark next to element
 * @param {string|HTMLElement} target - Target element or selector
 * @param {string} [message] - Optional success message
 */
function showInlineSuccess(target, message) {
  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return;
  
  // Remove existing inline success
  const existing = element.nextElementSibling;
  if (existing && existing.classList.contains('inline-success')) {
    existing.remove();
  }
  
  const successDiv = document.createElement('div');
  successDiv.className = 'inline-success animate-fade-in';
  successDiv.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <circle cx="10" cy="10" r="9" stroke="#22c55e" stroke-width="2"/>
      <path d="M6 10 L9 13 L14 7" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    ${message ? `<span>${message}</span>` : ''}
  `;
  
  element.parentNode.insertBefore(successDiv, element.nextSibling);
  
  // Auto remove after 3 seconds
  setTimeout(() => {
    successDiv.classList.add('animate-fade-out');
    setTimeout(() => successDiv.remove(), 300);
  }, 3000);
}

// =============================================================================
// Form Success States
// =============================================================================

/**
 * Set form to success state
 * @param {string|HTMLFormElement} form - Form element or selector
 * @param {string} message - Success message
 * @param {Object} [options] - Options
 * @param {boolean} [options.resetForm=false] - Reset form after success
 * @param {boolean} [options.disableForm=false] - Disable form after success
 * @param {number} [options.redirectDelay=0] - Redirect after delay (ms)
 * @param {string} [options.redirectUrl] - URL to redirect to
 */
function setFormSuccess(form, message, options = {}) {
  const {
    resetForm = false,
    disableForm = false,
    redirectDelay = 0,
    redirectUrl
  } = options;
  
  const formElement = typeof form === 'string' ? document.querySelector(form) : form;
  if (!formElement) return;
  
  // Remove any existing error states
  formElement.classList.remove('form-error');
  const errorMessages = formElement.querySelectorAll('.field-error, .form-error-message');
  errorMessages.forEach(msg => msg.remove());
  
  // Add success state
  formElement.classList.add('form-success');
  
  // Show success message
  const existingMessage = formElement.querySelector('.form-success-message');
  if (existingMessage) {
    existingMessage.textContent = message;
  } else {
    const successMessage = document.createElement('div');
    successMessage.className = 'form-success-message animate-slide-down';
    successMessage.setAttribute('role', 'status');
    successMessage.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#22c55e"/>
        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${message}</span>
    `;
    
    formElement.insertBefore(successMessage, formElement.firstChild);
  }
  
  // Reset form if requested
  if (resetForm) {
    setTimeout(() => {
      formElement.reset();
    }, 300);
  }
  
  // Disable form if requested
  if (disableForm) {
    const inputs = formElement.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.disabled = true;
    });
  }
  
  // Redirect if requested
  if (redirectDelay > 0 && redirectUrl) {
    setTimeout(() => {
      window.location.href = redirectUrl;
    }, redirectDelay);
  }
}

/**
 * Clear form success state
 * @param {string|HTMLFormElement} form - Form element or selector
 */
function clearFormSuccess(form) {
  const formElement = typeof form === 'string' ? document.querySelector(form) : form;
  if (!formElement) return;
  
  formElement.classList.remove('form-success');
  
  const successMessage = formElement.querySelector('.form-success-message');
  if (successMessage) {
    successMessage.classList.add('animate-fade-out');
    setTimeout(() => successMessage.remove(), 300);
  }
  
  // Re-enable form inputs
  const inputs = formElement.querySelectorAll('input, select, textarea, button');
  inputs.forEach(input => {
    input.disabled = false;
  });
}

// =============================================================================
// Action Success Feedback
// =============================================================================

/**
 * Show success feedback for button action
 * @param {string|HTMLElement} button - Button element or selector
 * @param {string} [successText='완료!'] - Success text to show
 * @param {number} [duration=2000] - Duration to show success state
 */
function setButtonSuccess(button, successText = '완료!', duration = 2000) {
  const btnElement = typeof button === 'string' ? document.querySelector(button) : button;
  if (!btnElement) return;
  
  // Store original state
  const originalText = btnElement.textContent;
  const originalDisabled = btnElement.disabled;
  
  // Set success state
  btnElement.classList.add('btn-success');
  btnElement.disabled = true;
  btnElement.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" style="display: inline-block; vertical-align: middle; margin-right: 8px;">
      <circle cx="10" cy="10" r="9" stroke="currentColor" stroke-width="2"/>
      <path d="M6 10 L9 13 L14 7" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
    ${successText}
  `;
  
  // Restore original state
  setTimeout(() => {
    btnElement.classList.remove('btn-success');
    btnElement.textContent = originalText;
    btnElement.disabled = originalDisabled;
  }, duration);
}

/**
 * Show success banner at top of page
 * @param {string} message - Success message
 * @param {Object} [options] - Options
 * @param {boolean} [options.dismissible=true] - Allow dismissal
 * @param {number} [options.duration=5000] - Auto-dismiss duration (0 = no auto-dismiss)
 */
function showSuccessBanner(message, options = {}) {
  const {
    dismissible = true,
    duration = 5000
  } = options;
  
  // Remove existing banner
  const existing = document.querySelector('.success-banner');
  if (existing) {
    existing.remove();
  }
  
  const bannerId = `banner-${Date.now()}`;
  const banner = document.createElement('div');
  banner.id = bannerId;
  banner.className = 'success-banner animate-slide-down';
  banner.setAttribute('role', 'status');
  banner.innerHTML = `
    <div class="success-banner-content">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
        <circle cx="12" cy="12" r="11" fill="#22c55e"/>
        <path d="M7 12 L10.5 15.5 L17 8.5" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
      <span>${message}</span>
      ${dismissible ? '<button class="success-banner-close" aria-label="닫기">&times;</button>' : ''}
    </div>
  `;
  
  document.body.insertBefore(banner, document.body.firstChild);
  
  // Setup close button
  if (dismissible) {
    const closeBtn = banner.querySelector('.success-banner-close');
    closeBtn.addEventListener('click', () => {
      banner.classList.add('animate-slide-up');
      setTimeout(() => banner.remove(), 300);
    });
  }
  
  // Auto dismiss
  if (duration > 0) {
    setTimeout(() => {
      banner.classList.add('animate-slide-up');
      setTimeout(() => banner.remove(), 300);
    }, duration);
  }
  
  return bannerId;
}

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Get toast position class
 * @param {string} position - Position string
 * @returns {string} CSS class
 */
function getToastPositionClass(position) {
  const positions = {
    'top-right': 'top-right',
    'top-left': 'top-left',
    'top-center': 'top-center',
    'bottom-right': 'bottom-right',
    'bottom-left': 'bottom-left',
    'bottom-center': 'bottom-center'
  };
  
  return positions[position] || 'top-right';
}

/**
 * Get success icon SVG
 * @param {string} iconType - Icon type
 * @returns {string} SVG markup
 */
function getSuccessIcon(iconType) {
  const icons = {
    check: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" fill="#22c55e"/>
        <path d="M6 10 L9 13 L14 7" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    checkCircle: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="9" stroke="#22c55e" stroke-width="2"/>
        <path d="M6 10 L9 13 L14 7" stroke="#22c55e" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      </svg>
    `,
    thumbsUp: `
      <svg width="20" height="20" viewBox="0 0 20 20" fill="#22c55e">
        <path d="M2 10.5C2 9.67157 2.67157 9 3.5 9H5V17H3.5C2.67157 17 2 16.3284 2 15.5V10.5Z"/>
        <path d="M6 9V17H8.37868C8.74748 17 9.10182 16.8537 9.36393 16.5916L15.5 10.5L14 5.5C14 4.39543 13.1046 3.5 12 3.5C11.4477 3.5 11 3.94772 11 4.5V9H6Z"/>
      </svg>
    `
  };
  
  return icons[iconType] || icons.check;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    showSuccess,
    showSuccessWithAction,
    dismissToast,
    highlightSuccess,
    flashSuccess,
    showSuccessCheckmark,
    showInlineSuccess,
    setFormSuccess,
    clearFormSuccess,
    setButtonSuccess,
    showSuccessBanner
  };
}
