/**
 * Loading Utilities
 * 
 * Provides reusable loading state management for GalleryPia platform
 * Addresses UX-C-002: No Loading States on Form Submissions
 * 
 * Usage:
 * - Import this file in any HTML page that needs loading states
 * - Use the global functions: setFormLoading, setButtonLoading, showLoadingOverlay, hideLoadingOverlay
 * 
 * @module loading-utils
 */

// ====================================
// Form Loading States
// ====================================

/**
 * Set form loading state
 * Disables all inputs and shows loading spinner on submit button
 * 
 * @param {HTMLFormElement} form - Form element
 * @param {HTMLButtonElement} button - Submit button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show when loading
 * 
 * @example
 * const form = document.getElementById('myForm');
 * const button = form.querySelector('button[type="submit"]');
 * setFormLoading(form, button, true, '제출 중...');
 */
function setFormLoading(form, button, isLoading, loadingText = 'Processing...') {
  if (!form || !button) {
    console.warn('setFormLoading: form or button is null');
    return;
  }

  const inputs = form.querySelectorAll('input, textarea, select, button');

  if (isLoading) {
    // Disable all form inputs
    inputs.forEach(input => {
      input.disabled = true;
    });
    
    // Set button loading state
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg 
          class="animate-spin inline-block w-4 h-4 border-2 text-current"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${loadingText}</span>
      </span>
    `;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('opacity-75', 'cursor-not-allowed');
  } else {
    // Re-enable all form inputs
    inputs.forEach(input => {
      input.disabled = false;
    });
    
    // Restore button state
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.removeAttribute('aria-busy');
    button.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

/**
 * Set button loading state
 * Shows loading spinner inside button without disabling form
 * 
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show when loading
 * 
 * @example
 * const button = document.getElementById('saveButton');
 * setButtonLoading(button, true, 'Saving...');
 */
function setButtonLoading(button, isLoading, loadingText = 'Processing...') {
  if (!button) {
    console.warn('setButtonLoading: button is null');
    return;
  }

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg 
          class="animate-spin inline-block w-4 h-4 border-2 text-current"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${loadingText}</span>
      </span>
    `;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('opacity-75', 'cursor-not-allowed');
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.removeAttribute('aria-busy');
    button.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

// ====================================
// Loading Overlay
// ====================================

/**
 * Show loading overlay
 * Displays full-page loading indicator with message
 * 
 * @param {string} message - Loading message to display
 * 
 * @example
 * showLoadingOverlay('Uploading file...');
 */
function showLoadingOverlay(message = 'Loading...') {
  // Remove existing overlay if present
  hideLoadingOverlay();

  const overlay = document.createElement('div');
  overlay.id = 'gallerypia-loading-overlay';
  overlay.className = 'fixed inset-0 bg-white/90 flex items-center justify-center';
  overlay.style.zIndex = '9999';
  overlay.setAttribute('role', 'alert');
  overlay.setAttribute('aria-live', 'assertive');
  overlay.setAttribute('aria-busy', 'true');

  overlay.innerHTML = `
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
      <p class="mt-4 text-lg font-medium text-gray-700">${message}</p>
    </div>
  `;

  document.body.appendChild(overlay);
  
  // Prevent body scroll
  document.body.style.overflow = 'hidden';
}

/**
 * Hide loading overlay
 * Removes full-page loading indicator
 * 
 * @example
 * hideLoadingOverlay();
 */
function hideLoadingOverlay() {
  const overlay = document.getElementById('gallerypia-loading-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  // Restore body scroll
  document.body.style.overflow = '';
}

// ====================================
// Inline Loading Indicators
// ====================================

/**
 * Show inline loading indicator
 * Replaces element content with loading spinner
 * 
 * @param {string|HTMLElement} selector - Element selector or element
 * @param {string} size - Spinner size (sm, md, lg)
 * 
 * @example
 * showInlineLoading('#myContainer', 'md');
 */
function showInlineLoading(selector, size = 'md') {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
    
  if (!element) {
    console.warn('showInlineLoading: element not found', selector);
    return;
  }

  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-6 h-6 border-2',
    lg: 'w-8 h-8 border-3',
    xl: 'w-12 h-12 border-4'
  };

  element.dataset.originalHtml = element.innerHTML;
  element.innerHTML = `
    <div class="flex items-center justify-center py-4">
      <svg 
        class="animate-spin ${sizeClasses[size]} text-blue-600"
        xmlns="http://www.w3.org/2000/svg" 
        fill="none" 
        viewBox="0 0 24 24"
        aria-hidden="true"
      >
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    </div>
  `;
}

/**
 * Hide inline loading indicator
 * Restores original element content
 * 
 * @param {string|HTMLElement} selector - Element selector or element
 * @param {string} newContent - Optional new content to show instead of original
 * 
 * @example
 * hideInlineLoading('#myContainer');
 */
function hideInlineLoading(selector, newContent = null) {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
    
  if (!element) {
    console.warn('hideInlineLoading: element not found', selector);
    return;
  }

  if (newContent !== null) {
    element.innerHTML = newContent;
  } else if (element.dataset.originalHtml) {
    element.innerHTML = element.dataset.originalHtml;
    delete element.dataset.originalHtml;
  }
}

// ====================================
// Skeleton Loading
// ====================================

/**
 * Show skeleton loading placeholder
 * Useful for loading content like cards, lists, etc.
 * 
 * @param {string|HTMLElement} selector - Element selector or element
 * @param {number} count - Number of skeleton items to show
 * @param {string} type - Skeleton type (card, list, text)
 * 
 * @example
 * showSkeletonLoading('#artworkGrid', 6, 'card');
 */
function showSkeletonLoading(selector, count = 3, type = 'card') {
  const element = typeof selector === 'string' 
    ? document.querySelector(selector) 
    : selector;
    
  if (!element) {
    console.warn('showSkeletonLoading: element not found', selector);
    return;
  }

  element.dataset.originalHtml = element.innerHTML;

  const skeletonTemplates = {
    card: `
      <div class="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
        <div class="bg-gray-300 h-48"></div>
        <div class="p-4 space-y-3">
          <div class="h-5 bg-gray-300 rounded w-3/4"></div>
          <div class="h-4 bg-gray-300 rounded"></div>
          <div class="h-4 bg-gray-300 rounded w-5/6"></div>
        </div>
      </div>
    `,
    list: `
      <div class="flex items-center space-x-4 p-4 bg-white rounded-lg animate-pulse">
        <div class="w-12 h-12 bg-gray-300 rounded-full"></div>
        <div class="flex-1 space-y-2">
          <div class="h-4 bg-gray-300 rounded w-3/4"></div>
          <div class="h-3 bg-gray-300 rounded w-1/2"></div>
        </div>
      </div>
    `,
    text: `
      <div class="space-y-2 animate-pulse">
        <div class="h-4 bg-gray-300 rounded"></div>
        <div class="h-4 bg-gray-300 rounded w-5/6"></div>
        <div class="h-4 bg-gray-300 rounded w-4/5"></div>
      </div>
    `
  };

  const template = skeletonTemplates[type] || skeletonTemplates.card;
  const skeletons = Array.from({ length: count }, () => template).join('');

  element.innerHTML = `
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      ${skeletons}
    </div>
  `;
}

/**
 * Hide skeleton loading
 * Restores original content
 * 
 * @param {string|HTMLElement} selector - Element selector or element
 * @param {string} newContent - Optional new content to show
 * 
 * @example
 * hideSkeletonLoading('#artworkGrid', renderArtworks());
 */
function hideSkeletonLoading(selector, newContent = null) {
  hideInlineLoading(selector, newContent);
}

// ====================================
// Async Wrapper with Loading
// ====================================

/**
 * Wrap async function with automatic loading state management
 * 
 * @param {Function} asyncFn - Async function to execute
 * @param {Object} options - Loading options
 * @param {HTMLElement} options.button - Button to show loading state
 * @param {string} options.loadingText - Loading text for button
 * @param {string} options.overlayMessage - Message for overlay
 * @param {boolean} options.showOverlay - Whether to show overlay
 * 
 * @example
 * await withLoading(async () => {
 *   await axios.post('/api/submit', data);
 * }, {
 *   button: document.getElementById('submitBtn'),
 *   loadingText: 'Submitting...',
 *   showOverlay: true,
 *   overlayMessage: 'Processing your request...'
 * });
 */
async function withLoading(asyncFn, options = {}) {
  const {
    button = null,
    loadingText = 'Processing...',
    overlayMessage = 'Loading...',
    showOverlay = false
  } = options;

  try {
    // Show loading states
    if (button) {
      setButtonLoading(button, true, loadingText);
    }
    if (showOverlay) {
      showLoadingOverlay(overlayMessage);
    }

    // Execute async function
    const result = await asyncFn();
    return result;

  } catch (error) {
    console.error('withLoading error:', error);
    throw error;

  } finally {
    // Hide loading states
    if (button) {
      setButtonLoading(button, false);
    }
    if (showOverlay) {
      hideLoadingOverlay();
    }
  }
}

// ====================================
// Export for use in other scripts
// ====================================

// Make functions globally available
if (typeof window !== 'undefined') {
  window.LoadingUtils = {
    setFormLoading,
    setButtonLoading,
    showLoadingOverlay,
    hideLoadingOverlay,
    showInlineLoading,
    hideInlineLoading,
    showSkeletonLoading,
    hideSkeletonLoading,
    withLoading
  };
}

console.log('✅ Loading Utils initialized');

// ========================================
// Phase 6.1.4: Enhanced Loading Animations
// ========================================

/**
 * Progressive Image Loading (Blur-up technique)
 */
class ProgressiveImageLoader {
  constructor() {
    this.images = [];
    this.init();
  }
  
  init() {
    // Discover progressive images
    const progressiveImages = document.querySelectorAll('[data-progressive-src]');
    progressiveImages.forEach(img => this.loadImage(img));
  }
  
  loadImage(img) {
    const lowResUrl = img.src; // Placeholder/blur image
    const highResUrl = img.dataset.progressiveSrc;
    
    if (!highResUrl) return;
    
    // Add blur effect
    img.style.filter = 'blur(10px)';
    img.style.transition = 'filter 0.5s ease';
    
    // Load high-res image
    const highResImage = new Image();
    highResImage.onload = () => {
      img.src = highResUrl;
      img.style.filter = 'blur(0)';
      img.classList.add('progressive-loaded');
    };
    highResImage.onerror = () => {
      console.error('Failed to load high-res image:', highResUrl);
    };
    highResImage.src = highResUrl;
  }
}

/**
 * Staggered List Item Animations
 */
window.animateListStaggered = function(containerId, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const items = container.children;
  const delay = options.delay || 50; // ms between each item
  const duration = options.duration || 300; // animation duration
  
  Array.from(items).forEach((item, index) => {
    item.style.opacity = '0';
    item.style.transform = 'translateY(20px)';
    item.style.transition = `opacity ${duration}ms ease, transform ${duration}ms ease`;
    
    setTimeout(() => {
      item.style.opacity = '1';
      item.style.transform = 'translateY(0)';
    }, index * delay);
  });
};

/**
 * Skeleton to Content Transition
 */
window.transitionSkeletonToContent = function(containerId, content, options = {}) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const duration = options.duration || 300;
  
  // Fade out skeleton
  container.style.transition = `opacity ${duration}ms ease`;
  container.style.opacity = '0';
  
  setTimeout(() => {
    // Replace content
    container.innerHTML = content;
    container.classList.remove('loading-skeleton');
    
    // Fade in new content with stagger
    setTimeout(() => {
      container.style.opacity = '1';
      window.animateListStaggered(containerId, options);
    }, 50);
  }, duration);
};

// Auto-initialize progressive images
document.addEventListener('DOMContentLoaded', function() {
  window.progressiveImageLoader = new ProgressiveImageLoader();
  console.log('✅ Progressive Image Loader initialized');
});

console.log('✅ Enhanced Loading Animations loaded');
