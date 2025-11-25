/**
 * ============================================
 * 🎨 W1-C15 & W1-C16: UI Improvements
 * - Toast Deduplication System
 * - Modal Scroll Lock
 * ============================================
 */

// ============================================
// 🔧 W1-C15: Toast Deduplication System
// ============================================

// Active toast tracker
const activeToasts = new Map();
const TOAST_DEDUPE_TIMEOUT = 3000; // Same message within 3s will be ignored

/**
 * Show a toast notification with deduplication
 * @param {string} message - Toast message
 * @param {string} type - Toast type: 'info', 'success', 'error', 'warning'
 * @param {number} duration - Duration in milliseconds (default: 3000)
 */
function showToast(message, type = 'info', duration = 3000) {
  // Deduplication: Check if same message is already active
  const toastKey = `${type}:${message}`;
  
  if (activeToasts.has(toastKey)) {
    const existingTime = activeToasts.get(toastKey);
    if (Date.now() - existingTime < TOAST_DEDUPE_TIMEOUT) {
      console.log('🚫 Duplicate toast prevented:', message);
      return; // Prevent duplicate toast
    }
  }
  
  // Mark this toast as active
  activeToasts.set(toastKey, Date.now());
  
  // Clean up old entries after timeout
  setTimeout(() => {
    activeToasts.delete(toastKey);
  }, TOAST_DEDUPE_TIMEOUT);
  
  // Create toast container if not exists
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'fixed top-4 right-4 z-[9999] space-y-2';
    toastContainer.setAttribute('role', 'alert');
    toastContainer.setAttribute('aria-live', 'polite');
    document.body.appendChild(toastContainer);
  }
  
  // Toast styling by type
  const styles = {
    info: 'bg-blue-500 border-blue-600',
    success: 'bg-green-500 border-green-600',
    error: 'bg-red-500 border-red-600',
    warning: 'bg-yellow-500 border-yellow-600'
  };
  
  const icons = {
    info: '<i class="fas fa-info-circle"></i>',
    success: '<i class="fas fa-check-circle"></i>',
    error: '<i class="fas fa-exclamation-circle"></i>',
    warning: '<i class="fas fa-exclamation-triangle"></i>'
  };
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `${styles[type]} text-white px-6 py-3 rounded-lg shadow-xl border-l-4 flex items-center gap-3 min-w-[300px] max-w-[500px] animate-slide-in-right`;
  toast.innerHTML = `
    <div class="flex-shrink-0 text-xl">${icons[type]}</div>
    <div class="flex-1 font-medium text-sm">${escapeHtml(message)}</div>
    <button class="flex-shrink-0 ml-2 text-white hover:text-gray-200 transition-colors" onclick="this.parentElement.remove()" aria-label="닫기">
      <i class="fas fa-times"></i>
    </button>
  `;
  
  // Add to container
  toastContainer.appendChild(toast);
  
  // Auto remove after duration
  setTimeout(() => {
    toast.style.animation = 'slide-out-right 0.3s ease-out';
    setTimeout(() => {
      toast.remove();
      
      // Remove container if empty
      if (toastContainer.children.length === 0) {
        toastContainer.remove();
      }
    }, 300);
  }, duration);
}

// Convenience functions
function showInfoToast(message, duration) {
  showToast(message, 'info', duration);
}

function showSuccessToast(message, duration) {
  showToast(message, 'success', duration);
}

function showErrorToast(message, duration) {
  showToast(message, 'error', duration);
}

function showWarningToast(message, duration) {
  showToast(message, 'warning', duration);
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ============================================
// 🔧 W1-C16: Modal Scroll Lock System
// ============================================

// Track scroll lock state
let scrollLockCount = 0;
let originalOverflow = '';
let originalPaddingRight = '';

/**
 * Lock body scroll when modal opens (W1-C16)
 */
function lockBodyScroll() {
  if (scrollLockCount === 0) {
    // Save original styles
    originalOverflow = document.body.style.overflow;
    originalPaddingRight = document.body.style.paddingRight;
    
    // Calculate scrollbar width
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    
    // Apply lock
    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }
  }
  
  scrollLockCount++;
  console.log(`✅ Body scroll locked (count: ${scrollLockCount})`);
}

/**
 * Unlock body scroll when modal closes (W1-C16)
 */
function unlockBodyScroll() {
  if (scrollLockCount > 0) {
    scrollLockCount--;
  }
  
  if (scrollLockCount === 0) {
    // Restore original styles
    document.body.style.overflow = originalOverflow;
    document.body.style.paddingRight = originalPaddingRight;
    console.log('✅ Body scroll unlocked');
  }
}

/**
 * Enhanced modal open/close with scroll lock
 */
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return;
  }
  
  // Lock scroll (W1-C16)
  lockBodyScroll();
  
  // Show modal
  modal.classList.remove('hidden');
  modal.classList.add('flex');
  
  // Focus management for accessibility
  const firstFocusable = modal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) {
    setTimeout(() => firstFocusable.focus(), 100);
  }
  
  // Close on backdrop click
  modal.addEventListener('click', function(e) {
    if (e.target === modal) {
      closeModal(modalId);
    }
  }, { once: true });
  
  // Close on Escape key
  const escapeHandler = (e) => {
    if (e.key === 'Escape') {
      closeModal(modalId);
      document.removeEventListener('keydown', escapeHandler);
    }
  };
  document.addEventListener('keydown', escapeHandler);
  modal.dataset.escapeHandler = 'attached';
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return;
  }
  
  // Hide modal
  modal.classList.add('hidden');
  modal.classList.remove('flex');
  
  // Unlock scroll (W1-C16)
  unlockBodyScroll();
}

/**
 * Toggle modal (open/close)
 */
function toggleModal(modalId) {
  const modal = document.getElementById(modalId);
  if (!modal) return;
  
  if (modal.classList.contains('hidden')) {
    openModal(modalId);
  } else {
    closeModal(modalId);
  }
}

// ============================================
// Global Exposure
// ============================================

// Make functions globally accessible
window.showToast = showToast;
window.showInfoToast = showInfoToast;
window.showSuccessToast = showSuccessToast;
window.showErrorToast = showErrorToast;
window.showWarningToast = showWarningToast;
window.lockBodyScroll = lockBodyScroll;
window.unlockBodyScroll = unlockBodyScroll;
window.openModal = openModal;
window.closeModal = closeModal;
window.toggleModal = toggleModal;

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slide-in-right {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  @keyframes slide-out-right {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }
  
  .animate-slide-in-right {
    animation: slide-in-right 0.3s ease-out;
  }
`;
document.head.appendChild(style);

console.log('✅ UI Improvements loaded (W1-C15: Toast Deduplication, W1-C16: Modal Scroll Lock)');
