/**
 * ============================================
 * ⏳ W2-H2: Consistent Loading States
 * ============================================
 * Provides unified loading indicators across the entire application
 */

// Active loading states tracker
const activeLoadingStates = new Map();

/**
 * Show global loading overlay
 * @param {string} message - Loading message (optional)
 */
function showGlobalLoading(message = '로딩 중...') {
  let overlay = document.getElementById('global-loading-overlay');
  
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'global-loading-overlay';
    overlay.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9998]';
    overlay.innerHTML = `
      <div class="bg-white rounded-lg p-8 flex flex-col items-center gap-4 shadow-2xl">
        <div class="relative">
          <div class="w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
        </div>
        <p id="global-loading-message" class="text-gray-700 font-medium text-lg">${message}</p>
      </div>
    `;
    document.body.appendChild(overlay);
  } else {
    overlay.classList.remove('hidden');
    const messageEl = overlay.querySelector('#global-loading-message');
    if (messageEl) messageEl.textContent = message;
  }
  
  // Lock body scroll
  if (typeof lockBodyScroll === 'function') {
    lockBodyScroll();
  }
}

/**
 * Hide global loading overlay
 */
function hideGlobalLoading() {
  const overlay = document.getElementById('global-loading-overlay');
  if (overlay) {
    overlay.classList.add('hidden');
  }
  
  // Unlock body scroll
  if (typeof unlockBodyScroll === 'function') {
    unlockBodyScroll();
  }
}

/**
 * Show inline loading spinner in a container
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} message - Loading message
 * @param {string} size - Spinner size: 'small', 'medium', 'large'
 */
function showInlineLoading(container, message = '로딩 중...', size = 'medium') {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) {
    console.warn('Container not found for inline loading:', container);
    return;
  }
  
  const sizeClasses = {
    small: 'w-6 h-6 border-2',
    medium: 'w-12 h-12 border-3',
    large: 'w-16 h-16 border-4'
  };
  
  const spinnerClass = sizeClasses[size] || sizeClasses.medium;
  
  // Store original content
  if (!element.dataset.originalContent) {
    element.dataset.originalContent = element.innerHTML;
  }
  
  element.innerHTML = `
    <div class="flex flex-col items-center justify-center gap-3 py-8">
      <div class="${spinnerClass} border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
      ${message ? `<p class="text-gray-600 text-sm">${message}</p>` : ''}
    </div>
  `;
  
  // Track active loading state
  activeLoadingStates.set(element, true);
}

/**
 * Hide inline loading spinner and restore original content
 * @param {string|HTMLElement} container - Container selector or element
 */
function hideInlineLoading(container) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) {
    console.warn('Container not found for hiding inline loading:', container);
    return;
  }
  
  if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent;
    delete element.dataset.originalContent;
  }
  
  // Remove from active loading states
  activeLoadingStates.delete(element);
}

/**
 * Show button loading state (disable button, show spinner)
 * @param {string|HTMLElement} button - Button selector or element
 * @param {string} loadingText - Text to show during loading
 */
function showButtonLoading(button, loadingText = '처리 중...') {
  const element = typeof button === 'string' 
    ? document.querySelector(button) 
    : button;
    
  if (!element) {
    console.warn('Button not found:', button);
    return;
  }
  
  // Store original state
  if (!element.dataset.originalContent) {
    element.dataset.originalContent = element.innerHTML;
    element.dataset.originalDisabled = element.disabled;
  }
  
  // Set loading state
  element.disabled = true;
  element.innerHTML = `
    <span class="flex items-center gap-2">
      <div class="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
      <span>${loadingText}</span>
    </span>
  `;
  
  // Track active loading state
  activeLoadingStates.set(element, true);
}

/**
 * Hide button loading state (restore button, enable)
 * @param {string|HTMLElement} button - Button selector or element
 */
function hideButtonLoading(button) {
  const element = typeof button === 'string' 
    ? document.querySelector(button) 
    : button;
    
  if (!element) {
    console.warn('Button not found:', button);
    return;
  }
  
  if (element.dataset.originalContent) {
    element.innerHTML = element.dataset.originalContent;
    element.disabled = element.dataset.originalDisabled === 'true';
    delete element.dataset.originalContent;
    delete element.dataset.originalDisabled;
  }
  
  // Remove from active loading states
  activeLoadingStates.delete(element);
}

/**
 * Show skeleton loading (placeholder content)
 * @param {string|HTMLElement} container - Container selector or element
 * @param {string} type - Skeleton type: 'card', 'list', 'text', 'image'
 * @param {number} count - Number of skeleton items
 */
function showSkeletonLoading(container, type = 'card', count = 3) {
  const element = typeof container === 'string' 
    ? document.querySelector(container) 
    : container;
    
  if (!element) {
    console.warn('Container not found for skeleton loading:', container);
    return;
  }
  
  // Store original content
  if (!element.dataset.originalContent) {
    element.dataset.originalContent = element.innerHTML;
  }
  
  const skeletons = {
    card: `
      <div class="bg-white rounded-lg p-4 shadow animate-pulse">
        <div class="bg-gray-300 h-48 rounded mb-4"></div>
        <div class="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
        <div class="bg-gray-300 h-4 rounded w-1/2"></div>
      </div>
    `,
    list: `
      <div class="bg-white rounded p-3 mb-2 shadow animate-pulse flex items-center gap-3">
        <div class="bg-gray-300 h-12 w-12 rounded-full"></div>
        <div class="flex-1">
          <div class="bg-gray-300 h-4 rounded mb-2 w-3/4"></div>
          <div class="bg-gray-300 h-3 rounded w-1/2"></div>
        </div>
      </div>
    `,
    text: `
      <div class="animate-pulse space-y-2">
        <div class="bg-gray-300 h-4 rounded w-full"></div>
        <div class="bg-gray-300 h-4 rounded w-5/6"></div>
        <div class="bg-gray-300 h-4 rounded w-4/6"></div>
      </div>
    `,
    image: `
      <div class="bg-gray-300 w-full h-full rounded animate-pulse"></div>
    `
  };
  
  const skeletonHtml = skeletons[type] || skeletons.card;
  element.innerHTML = Array(count).fill(skeletonHtml).join('');
  
  // Track active loading state
  activeLoadingStates.set(element, true);
}

/**
 * Hide skeleton loading and restore original content
 * @param {string|HTMLElement} container - Container selector or element
 */
function hideSkeletonLoading(container) {
  hideInlineLoading(container); // Same logic as inline loading
}

/**
 * Show progress bar
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} containerId - Container ID for progress bar
 */
function showProgressBar(progress, containerId = 'progress-bar-container') {
  let container = document.getElementById(containerId);
  
  if (!container) {
    container = document.createElement('div');
    container.id = containerId;
    container.className = 'fixed top-0 left-0 right-0 z-[9999]';
    document.body.appendChild(container);
  }
  
  container.innerHTML = `
    <div class="h-1 bg-gray-200">
      <div class="h-full bg-purple-600 transition-all duration-300 ease-out" 
           style="width: ${Math.min(100, Math.max(0, progress))}%"
           role="progressbar"
           aria-valuenow="${progress}"
           aria-valuemin="0"
           aria-valuemax="100"></div>
    </div>
  `;
}

/**
 * Hide progress bar
 * @param {string} containerId - Container ID for progress bar
 */
function hideProgressBar(containerId = 'progress-bar-container') {
  const container = document.getElementById(containerId);
  if (container) {
    container.remove();
  }
}

/**
 * Simulate progress (useful for uploads, downloads)
 * @param {Function} callback - Function that returns current progress (0-100)
 * @param {number} interval - Update interval in ms
 * @param {string} containerId - Container ID for progress bar
 */
function simulateProgress(callback, interval = 100, containerId = 'progress-bar-container') {
  const intervalId = setInterval(() => {
    const progress = callback();
    showProgressBar(progress, containerId);
    
    if (progress >= 100) {
      clearInterval(intervalId);
      setTimeout(() => hideProgressBar(containerId), 500);
    }
  }, interval);
  
  return intervalId;
}

/**
 * Check if any loading state is active
 */
function hasActiveLoading() {
  return activeLoadingStates.size > 0;
}

/**
 * Clear all loading states (emergency cleanup)
 */
function clearAllLoading() {
  // Hide global loading
  hideGlobalLoading();
  
  // Hide progress bar
  hideProgressBar();
  
  // Clear all tracked loading states
  activeLoadingStates.forEach((_, element) => {
    if (element.dataset.originalContent) {
      element.innerHTML = element.dataset.originalContent;
      delete element.dataset.originalContent;
    }
    if (element.disabled !== undefined && element.dataset.originalDisabled) {
      element.disabled = element.dataset.originalDisabled === 'true';
      delete element.dataset.originalDisabled;
    }
  });
  
  activeLoadingStates.clear();
  
  console.log('✅ All loading states cleared');
}

// Global exposure
window.showGlobalLoading = showGlobalLoading;
window.hideGlobalLoading = hideGlobalLoading;
window.showInlineLoading = showInlineLoading;
window.hideInlineLoading = hideInlineLoading;
window.showButtonLoading = showButtonLoading;
window.hideButtonLoading = hideButtonLoading;
window.showSkeletonLoading = showSkeletonLoading;
window.hideSkeletonLoading = hideSkeletonLoading;
window.showProgressBar = showProgressBar;
window.hideProgressBar = hideProgressBar;
window.simulateProgress = simulateProgress;
window.hasActiveLoading = hasActiveLoading;
window.clearAllLoading = clearAllLoading;

// Auto-cleanup on page unload
window.addEventListener('beforeunload', () => {
  clearAllLoading();
});

console.log('✅ Consistent Loading States initialized (W2-H2)');
console.log('📊 Use window.hasActiveLoading() to check active loading states');
console.log('🗑️ Use window.clearAllLoading() to force clear all loading');
