/**
 * Tooltip Utilities for GalleryPia
 * 
 * Client-side tooltip functionality including:
 * - Auto-initialization on page load
 * - Dynamic tooltip creation and positioning
 * - Viewport boundary detection
 * - Keyboard accessibility (focus/blur events)
 * - Touch device support
 * - Show/hide animations
 * - Multiple tooltip instances management
 * 
 * Addresses UX-M-001: Add tooltips for icons and actions
 * 
 * Usage:
 * ```javascript
 * // Auto-initialize all tooltips on page load
 * initializeTooltips();
 * 
 * // Create tooltip programmatically
 * createTooltip('#my-button', {
 *   content: '작품 삭제',
 *   position: 'top',
 *   shortcut: 'Del'
 * });
 * 
 * // Show/hide manually
 * showTooltip('#my-button');
 * hideTooltip('#my-button');
 * 
 * // Destroy tooltip
 * destroyTooltip('#my-button');
 * ```
 */

// =============================================================================
// Global Tooltip State
// =============================================================================

const tooltipInstances = new Map();
let activeTooltip = null;
let tooltipShowTimer = null;
let tooltipHideTimer = null;
const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;

// =============================================================================
// Auto-Initialize Tooltips
// =============================================================================

/**
 * Initialize all tooltips on page
 * Call this on DOMContentLoaded or after dynamic content load
 */
function initializeTooltips() {
  // Find all elements with data-tooltip attributes
  const tooltipTriggers = document.querySelectorAll('[data-tooltip-content]');
  
  tooltipTriggers.forEach(trigger => {
    const content = trigger.getAttribute('data-tooltip-content');
    const position = trigger.getAttribute('data-tooltip-position') || 'top';
    const shortcut = trigger.getAttribute('data-tooltip-shortcut');
    const theme = trigger.getAttribute('data-tooltip-theme') || 'dark';
    
    createTooltip(trigger, {
      content,
      position,
      shortcut,
      theme
    });
  });
  
  // Find all icon buttons with tooltips
  const iconButtons = document.querySelectorAll('.btn-icon[aria-describedby]');
  
  iconButtons.forEach(button => {
    const tooltipId = button.getAttribute('aria-describedby');
    const tooltipElement = document.getElementById(tooltipId);
    
    if (tooltipElement) {
      setupTooltipEvents(button, tooltipElement);
    }
  });
}

// =============================================================================
// Create Tooltip
// =============================================================================

/**
 * Create and attach tooltip to element
 * @param {string|HTMLElement} target - Target element or selector
 * @param {Object} options - Tooltip options
 * @param {string} options.content - Tooltip content
 * @param {string} [options.position='top'] - Tooltip position
 * @param {string} [options.shortcut] - Keyboard shortcut
 * @param {string} [options.theme='dark'] - Tooltip theme
 * @param {number} [options.showDelay=200] - Show delay in ms
 * @param {number} [options.hideDelay=0] - Hide delay in ms
 * @param {boolean} [options.autoPosition=true] - Auto-adjust position
 * @param {string} [options.maxWidth='200px'] - Maximum width
 * @returns {string} Tooltip ID
 */
function createTooltip(target, options = {}) {
  const {
    content,
    position = 'top',
    shortcut,
    theme = 'dark',
    showDelay = 200,
    hideDelay = 0,
    autoPosition = true,
    maxWidth = '200px'
  } = options;

  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return null;

  // Generate unique ID
  const tooltipId = targetElement.id 
    ? `tooltip-${targetElement.id}` 
    : `tooltip-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Check if tooltip already exists
  if (tooltipInstances.has(targetElement)) {
    destroyTooltip(targetElement);
  }

  // Create tooltip element
  const tooltip = document.createElement('div');
  tooltip.id = tooltipId;
  tooltip.className = `tooltip tooltip-${theme} tooltip-${position}`;
  tooltip.setAttribute('role', 'tooltip');
  tooltip.style.maxWidth = maxWidth;
  tooltip.style.display = 'none';
  tooltip.dataset.showDelay = showDelay;
  tooltip.dataset.hideDelay = hideDelay;
  tooltip.dataset.autoPosition = autoPosition;

  // Add arrow
  const arrow = document.createElement('div');
  arrow.className = 'tooltip-arrow';
  tooltip.appendChild(arrow);

  // Add content
  const contentDiv = document.createElement('div');
  contentDiv.className = 'tooltip-content';
  contentDiv.textContent = content;

  // Add shortcut if provided
  if (shortcut) {
    const shortcutSpan = document.createElement('span');
    shortcutSpan.className = 'tooltip-shortcut';
    shortcutSpan.textContent = shortcut;
    contentDiv.appendChild(shortcutSpan);
  }

  tooltip.appendChild(contentDiv);

  // Append to body
  document.body.appendChild(tooltip);

  // Setup events
  setupTooltipEvents(targetElement, tooltip);

  // Store instance
  tooltipInstances.set(targetElement, {
    tooltipId,
    tooltipElement: tooltip,
    options
  });

  // Set aria-describedby
  targetElement.setAttribute('aria-describedby', tooltipId);

  return tooltipId;
}

// =============================================================================
// Setup Tooltip Events
// =============================================================================

/**
 * Setup event listeners for tooltip
 * @param {HTMLElement} target - Target element
 * @param {HTMLElement} tooltip - Tooltip element
 */
function setupTooltipEvents(target, tooltip) {
  // Mouse events
  target.addEventListener('mouseenter', (e) => handleTooltipShow(e, target, tooltip));
  target.addEventListener('mouseleave', (e) => handleTooltipHide(e, target, tooltip));

  // Focus events (keyboard accessibility)
  target.addEventListener('focus', (e) => handleTooltipShow(e, target, tooltip));
  target.addEventListener('blur', (e) => handleTooltipHide(e, target, tooltip));

  // Touch events (mobile)
  if (isTouchDevice) {
    const disableOnTouch = tooltip.dataset.disableTouch === 'true';
    
    if (!disableOnTouch) {
      target.addEventListener('touchstart', (e) => {
        e.preventDefault();
        handleTooltipToggle(e, target, tooltip);
      }, { passive: false });
    }
  }
}

/**
 * Handle tooltip show
 */
function handleTooltipShow(event, target, tooltip) {
  // Clear any existing hide timer
  clearTimeout(tooltipHideTimer);

  // Get show delay
  const showDelay = parseInt(tooltip.dataset.showDelay) || 200;

  // Set show timer
  tooltipShowTimer = setTimeout(() => {
    showTooltipElement(target, tooltip);
  }, showDelay);
}

/**
 * Handle tooltip hide
 */
function handleTooltipHide(event, target, tooltip) {
  // Clear show timer
  clearTimeout(tooltipShowTimer);

  // Get hide delay
  const hideDelay = parseInt(tooltip.dataset.hideDelay) || 0;

  // Set hide timer
  tooltipHideTimer = setTimeout(() => {
    hideTooltipElement(tooltip);
  }, hideDelay);
}

/**
 * Handle tooltip toggle (touch)
 */
function handleTooltipToggle(event, target, tooltip) {
  if (tooltip.style.display === 'none') {
    showTooltipElement(target, tooltip);
    
    // Auto-hide after 3 seconds on touch
    setTimeout(() => {
      hideTooltipElement(tooltip);
    }, 3000);
  } else {
    hideTooltipElement(tooltip);
  }
}

// =============================================================================
// Show/Hide Tooltip
// =============================================================================

/**
 * Show tooltip element with positioning
 * @param {HTMLElement} target - Target element
 * @param {HTMLElement} tooltip - Tooltip element
 */
function showTooltipElement(target, tooltip) {
  // Hide any active tooltip
  if (activeTooltip && activeTooltip !== tooltip) {
    hideTooltipElement(activeTooltip);
  }

  // Position tooltip
  positionTooltip(target, tooltip);

  // Show tooltip
  tooltip.style.display = 'block';
  tooltip.classList.add('tooltip-show');

  // Set as active
  activeTooltip = tooltip;
}

/**
 * Hide tooltip element
 * @param {HTMLElement} tooltip - Tooltip element
 */
function hideTooltipElement(tooltip) {
  if (!tooltip) return;

  tooltip.classList.remove('tooltip-show');
  tooltip.classList.add('tooltip-hide');

  setTimeout(() => {
    tooltip.style.display = 'none';
    tooltip.classList.remove('tooltip-hide');
  }, 150);

  if (activeTooltip === tooltip) {
    activeTooltip = null;
  }
}

/**
 * Show tooltip by target selector
 * @param {string|HTMLElement} target - Target element or selector
 */
function showTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (instance) {
    showTooltipElement(targetElement, instance.tooltipElement);
  }
}

/**
 * Hide tooltip by target selector
 * @param {string|HTMLElement} target - Target element or selector
 */
function hideTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (instance) {
    hideTooltipElement(instance.tooltipElement);
  }
}

/**
 * Hide all tooltips
 */
function hideAllTooltips() {
  tooltipInstances.forEach(instance => {
    hideTooltipElement(instance.tooltipElement);
  });
}

// =============================================================================
// Tooltip Positioning
// =============================================================================

/**
 * Position tooltip relative to target
 * @param {HTMLElement} target - Target element
 * @param {HTMLElement} tooltip - Tooltip element
 */
function positionTooltip(target, tooltip) {
  const targetRect = target.getBoundingClientRect();
  const tooltipRect = tooltip.getBoundingClientRect();
  const arrow = tooltip.querySelector('.tooltip-arrow');
  
  // Get position from class
  let position = 'top';
  tooltip.classList.forEach(cls => {
    if (cls.startsWith('tooltip-') && cls !== 'tooltip-show' && cls !== 'tooltip-hide') {
      const pos = cls.replace('tooltip-', '');
      if (['top', 'bottom', 'left', 'right'].some(p => pos.startsWith(p))) {
        position = pos;
      }
    }
  });

  // Calculate initial position
  let top, left;
  const offset = 8; // Distance from target
  const arrowSize = 6;

  // Base positions
  const positions = {
    'top': () => ({
      top: targetRect.top - tooltipRect.height - offset,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
    }),
    'top-start': () => ({
      top: targetRect.top - tooltipRect.height - offset,
      left: targetRect.left
    }),
    'top-end': () => ({
      top: targetRect.top - tooltipRect.height - offset,
      left: targetRect.right - tooltipRect.width
    }),
    'bottom': () => ({
      top: targetRect.bottom + offset,
      left: targetRect.left + (targetRect.width - tooltipRect.width) / 2
    }),
    'bottom-start': () => ({
      top: targetRect.bottom + offset,
      left: targetRect.left
    }),
    'bottom-end': () => ({
      top: targetRect.bottom + offset,
      left: targetRect.right - tooltipRect.width
    }),
    'left': () => ({
      top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
      left: targetRect.left - tooltipRect.width - offset
    }),
    'left-start': () => ({
      top: targetRect.top,
      left: targetRect.left - tooltipRect.width - offset
    }),
    'left-end': () => ({
      top: targetRect.bottom - tooltipRect.height,
      left: targetRect.left - tooltipRect.width - offset
    }),
    'right': () => ({
      top: targetRect.top + (targetRect.height - tooltipRect.height) / 2,
      left: targetRect.right + offset
    }),
    'right-start': () => ({
      top: targetRect.top,
      left: targetRect.right + offset
    }),
    'right-end': () => ({
      top: targetRect.bottom - tooltipRect.height,
      left: targetRect.right + offset
    })
  };

  const positionFn = positions[position] || positions.top;
  const coords = positionFn();
  top = coords.top;
  left = coords.left;

  // Auto-position if enabled (viewport boundary detection)
  if (tooltip.dataset.autoPosition === 'true') {
    const viewport = {
      width: window.innerWidth,
      height: window.innerHeight
    };

    // Check boundaries
    if (top < 0) {
      // Switch to bottom
      position = position.replace('top', 'bottom');
      const newCoords = positions[position]();
      top = newCoords.top;
    } else if (top + tooltipRect.height > viewport.height) {
      // Switch to top
      position = position.replace('bottom', 'top');
      const newCoords = positions[position]();
      top = newCoords.top;
    }

    if (left < 0) {
      left = 10; // Minimum margin
    } else if (left + tooltipRect.width > viewport.width) {
      left = viewport.width - tooltipRect.width - 10;
    }
  }

  // Apply position
  tooltip.style.top = `${top + window.scrollY}px`;
  tooltip.style.left = `${left + window.scrollX}px`;

  // Position arrow
  if (arrow) {
    if (position.startsWith('top') || position.startsWith('bottom')) {
      arrow.style.left = `${targetRect.left + targetRect.width / 2 - left}px`;
      arrow.style.top = '';
    } else if (position.startsWith('left') || position.startsWith('right')) {
      arrow.style.top = `${targetRect.top + targetRect.height / 2 - top}px`;
      arrow.style.left = '';
    }
  }
}

// =============================================================================
// Destroy Tooltip
// =============================================================================

/**
 * Destroy tooltip and remove from DOM
 * @param {string|HTMLElement} target - Target element or selector
 */
function destroyTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (!instance) return;

  // Remove tooltip element
  instance.tooltipElement.remove();

  // Remove aria-describedby
  targetElement.removeAttribute('aria-describedby');

  // Remove from instances
  tooltipInstances.delete(targetElement);
}

/**
 * Destroy all tooltips
 */
function destroyAllTooltips() {
  tooltipInstances.forEach((instance, target) => {
    instance.tooltipElement.remove();
    target.removeAttribute('aria-describedby');
  });
  
  tooltipInstances.clear();
}

// =============================================================================
// Update Tooltip
// =============================================================================

/**
 * Update tooltip content
 * @param {string|HTMLElement} target - Target element or selector
 * @param {string} newContent - New tooltip content
 */
function updateTooltipContent(target, newContent) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (!instance) return;

  const contentDiv = instance.tooltipElement.querySelector('.tooltip-content');
  if (contentDiv) {
    // Preserve shortcut if exists
    const shortcut = contentDiv.querySelector('.tooltip-shortcut');
    contentDiv.textContent = newContent;
    if (shortcut) {
      contentDiv.appendChild(shortcut);
    }
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if element has tooltip
 * @param {string|HTMLElement} target - Target element or selector
 * @returns {boolean}
 */
function hasTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  return targetElement ? tooltipInstances.has(targetElement) : false;
}

/**
 * Get tooltip instance
 * @param {string|HTMLElement} target - Target element or selector
 * @returns {Object|null}
 */
function getTooltipInstance(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  return targetElement ? tooltipInstances.get(targetElement) : null;
}

/**
 * Enable tooltip
 * @param {string|HTMLElement} target - Target element or selector
 */
function enableTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (instance) {
    instance.tooltipElement.style.pointerEvents = 'auto';
    targetElement.style.pointerEvents = 'auto';
  }
}

/**
 * Disable tooltip
 * @param {string|HTMLElement} target - Target element or selector
 */
function disableTooltip(target) {
  const targetElement = typeof target === 'string' ? document.querySelector(target) : target;
  if (!targetElement) return;

  const instance = tooltipInstances.get(targetElement);
  if (instance) {
    hideTooltipElement(instance.tooltipElement);
    instance.tooltipElement.style.pointerEvents = 'none';
  }
}

// =============================================================================
// Global Event Listeners
// =============================================================================

// Hide tooltips on scroll
let scrollTimeout;
window.addEventListener('scroll', () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    if (activeTooltip) {
      hideTooltipElement(activeTooltip);
    }
  }, 100);
}, { passive: true });

// Hide tooltips on resize
window.addEventListener('resize', () => {
  if (activeTooltip) {
    hideTooltipElement(activeTooltip);
  }
});

// Hide tooltips on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && activeTooltip) {
    hideTooltipElement(activeTooltip);
  }
});

// Auto-initialize on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeTooltips);
} else {
  initializeTooltips();
}

// =============================================================================
// Export for Module Systems
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeTooltips,
    createTooltip,
    showTooltip,
    hideTooltip,
    hideAllTooltips,
    destroyTooltip,
    destroyAllTooltips,
    updateTooltipContent,
    hasTooltip,
    getTooltipInstance,
    enableTooltip,
    disableTooltip
  };
}
