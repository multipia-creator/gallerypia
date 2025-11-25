/**
 * Keyboard Shortcuts Manager for GalleryPia
 * 
 * Provides global keyboard shortcut functionality:
 * - Register/unregister shortcuts
 * - Modifier keys support (Ctrl, Alt, Shift, Meta)
 * - Shortcut conflicts detection
 * - Context-specific shortcuts (modal, form, etc.)
 * - Help dialog display
 * - Accessibility support
 * 
 * Addresses UX-M-003: Implement keyboard shortcuts
 * 
 * Usage:
 * ```javascript
 * // Register shortcut
 * registerShortcut('Ctrl+N', () => {
 *   createNewArtwork();
 * }, '새 작품 등록');
 * 
 * // Register with context
 * registerShortcut('Enter', () => {
 *   submitForm();
 * }, '제출', { context: 'modal' });
 * 
 * // Show help
 * showShortcutsHelp();
 * 
 * // Unregister
 * unregisterShortcut('Ctrl+N');
 * ```
 */

// =============================================================================
// Global State
// =============================================================================

const shortcuts = new Map();
const contexts = new Set(['global']);
let currentContext = 'global';
let helpDialogOpen = false;

// =============================================================================
// Shortcut Registration
// =============================================================================

/**
 * Register keyboard shortcut
 * @param {string} keys - Key combination (e.g., 'Ctrl+S', 'Alt+N')
 * @param {Function} handler - Handler function
 * @param {string} description - Shortcut description
 * @param {Object} [options] - Additional options
 * @param {string} [options.context='global'] - Shortcut context
 * @param {boolean} [options.preventDefault=true] - Prevent default action
 * @param {string} [options.category='General'] - Shortcut category
 */
function registerShortcut(keys, handler, description, options = {}) {
  const {
    context = 'global',
    preventDefault = true,
    category = 'General'
  } = options;

  const normalizedKeys = normalizeKeys(keys);
  const shortcutKey = `${context}:${normalizedKeys}`;

  // Check for conflicts
  if (shortcuts.has(shortcutKey)) {
    console.warn(`Shortcut ${keys} in context ${context} already registered`);
  }

  shortcuts.set(shortcutKey, {
    keys: normalizedKeys,
    handler,
    description,
    context,
    preventDefault,
    category,
    displayKeys: keys
  });

  contexts.add(context);
}

/**
 * Unregister keyboard shortcut
 * @param {string} keys - Key combination
 * @param {string} [context='global'] - Shortcut context
 */
function unregisterShortcut(keys, context = 'global') {
  const normalizedKeys = normalizeKeys(keys);
  const shortcutKey = `${context}:${normalizedKeys}`;
  shortcuts.delete(shortcutKey);
}

/**
 * Clear all shortcuts in context
 * @param {string} context - Context to clear
 */
function clearContext(context) {
  const keysToDelete = [];
  
  shortcuts.forEach((shortcut, key) => {
    if (shortcut.context === context) {
      keysToDelete.push(key);
    }
  });
  
  keysToDelete.forEach(key => shortcuts.delete(key));
}

// =============================================================================
// Context Management
// =============================================================================

/**
 * Set current shortcut context
 * @param {string} context - Context name
 */
function setShortcutContext(context) {
  currentContext = context;
  contexts.add(context);
}

/**
 * Reset to global context
 */
function resetShortcutContext() {
  currentContext = 'global';
}

/**
 * Get current context
 * @returns {string} Current context
 */
function getShortcutContext() {
  return currentContext;
}

// =============================================================================
// Event Handling
// =============================================================================

/**
 * Handle keydown event
 * @param {KeyboardEvent} event - Keyboard event
 */
function handleKeyDown(event) {
  // Don't handle shortcuts when typing in input fields (except Escape and Enter)
  const target = event.target;
  const isInput = target.tagName === 'INPUT' || 
                  target.tagName === 'TEXTAREA' || 
                  target.isContentEditable;
  
  if (isInput && !['Escape', 'Enter'].includes(event.key)) {
    return;
  }

  // Build key combination
  const keys = buildKeyCombination(event);
  
  // Try current context first
  const contextKey = `${currentContext}:${keys}`;
  const globalKey = `global:${keys}`;
  
  const shortcut = shortcuts.get(contextKey) || shortcuts.get(globalKey);
  
  if (shortcut) {
    if (shortcut.preventDefault) {
      event.preventDefault();
    }
    
    try {
      shortcut.handler(event);
    } catch (error) {
      console.error('Shortcut handler error:', error);
    }
  }
}

/**
 * Build key combination string from event
 * @param {KeyboardEvent} event - Keyboard event
 * @returns {string} Key combination
 */
function buildKeyCombination(event) {
  const parts = [];
  
  if (event.ctrlKey || event.metaKey) parts.push('ctrl');
  if (event.altKey) parts.push('alt');
  if (event.shiftKey) parts.push('shift');
  
  // Get the actual key
  let key = event.key.toLowerCase();
  
  // Normalize special keys
  const keyMap = {
    'escape': 'esc',
    'arrowup': 'up',
    'arrowdown': 'down',
    'arrowleft': 'left',
    'arrowright': 'right',
    ' ': 'space'
  };
  
  key = keyMap[key] || key;
  
  // Don't add modifier keys as the main key
  if (!['control', 'alt', 'shift', 'meta'].includes(key)) {
    parts.push(key);
  }
  
  return parts.join('+');
}

/**
 * Normalize key combination string
 * @param {string} keys - Key combination
 * @returns {string} Normalized keys
 */
function normalizeKeys(keys) {
  return keys.toLowerCase()
    .replace(/\s+/g, '')
    .replace(/command|cmd|meta/g, 'ctrl')
    .replace(/option/g, 'alt')
    .split('+')
    .sort((a, b) => {
      const order = { ctrl: 0, alt: 1, shift: 2 };
      return (order[a] ?? 999) - (order[b] ?? 999);
    })
    .join('+');
}

// =============================================================================
// Default Shortcuts
// =============================================================================

/**
 * Register default application shortcuts
 */
function registerDefaultShortcuts() {
  // Navigation
  registerShortcut('/', () => {
    const searchInput = document.querySelector('#search-input, [type="search"]');
    if (searchInput) {
      searchInput.focus();
    }
  }, '검색 포커스', { category: 'Navigation' });

  registerShortcut('Escape', () => {
    // Close modals, dialogs, dropdowns
    const modal = document.querySelector('.modal.show, [role="dialog"]:not([style*="display: none"])');
    if (modal) {
      const closeBtn = modal.querySelector('.modal-close, [data-dismiss="modal"]');
      if (closeBtn) {
        closeBtn.click();
      }
    }
    
    // Close dropdowns
    const dropdowns = document.querySelectorAll('.dropdown-menu[style*="display: block"]');
    dropdowns.forEach(dropdown => {
      dropdown.style.display = 'none';
    });
    
    // Hide tooltips
    if (typeof hideAllTooltips === 'function') {
      hideAllTooltips();
    }
  }, 'Close modal/dialog', { category: 'Navigation' });

  // Help
  registerShortcut('?', () => {
    showShortcutsHelp();
  }, '단축키 도움말', { category: 'Help', preventDefault: false });

  // Common actions
  registerShortcut('Ctrl+K', () => {
    const searchInput = document.querySelector('#search-input, [type="search"]');
    if (searchInput) {
      searchInput.focus();
      searchInput.select();
    }
  }, '빠른 검색', { category: 'Actions' });
}

// =============================================================================
// Help Dialog
// =============================================================================

/**
 * Show keyboard shortcuts help dialog
 */
function showShortcutsHelp() {
  if (helpDialogOpen) {
    hideShortcutsHelp();
    return;
  }

  // Group shortcuts by category
  const categories = {};
  
  shortcuts.forEach(shortcut => {
    if (shortcut.context !== currentContext && shortcut.context !== 'global') {
      return;
    }
    
    const category = shortcut.category || 'General';
    if (!categories[category]) {
      categories[category] = [];
    }
    
    categories[category].push(shortcut);
  });

  // Build help dialog HTML
  const dialogHTML = `
    <div class="shortcuts-help-overlay" onclick="hideShortcutsHelp()">
      <div class="shortcuts-help-dialog" onclick="event.stopPropagation()" role="dialog" aria-modal="true" aria-labelledby="shortcuts-title">
        <div class="shortcuts-help-header">
          <h2 id="shortcuts-title" class="text-2xl font-bold">키보드 단축키</h2>
          <button type="button" class="shortcuts-help-close" onclick="hideShortcutsHelp()" aria-label="닫기">
            <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M6 6 L18 18 M18 6 L6 18"/>
            </svg>
          </button>
        </div>
        
        <div class="shortcuts-help-content">
          ${Object.entries(categories).map(([category, items]) => `
            <div class="shortcuts-category">
              <h3 class="shortcuts-category-title">${category}</h3>
              <div class="shortcuts-list">
                ${items.map(shortcut => `
                  <div class="shortcut-item">
                    <span class="shortcut-description">${shortcut.description}</span>
                    <kbd class="shortcut-keys">${formatShortcutKeys(shortcut.displayKeys)}</kbd>
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
        
        <div class="shortcuts-help-footer">
          <button type="button" class="btn btn-primary" onclick="hideShortcutsHelp()">
            닫기
          </button>
        </div>
      </div>
    </div>
  `;

  // Add to body
  const container = document.createElement('div');
  container.id = 'shortcuts-help-container';
  container.innerHTML = dialogHTML;
  document.body.appendChild(container);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  helpDialogOpen = true;

  // Focus trap
  const dialog = container.querySelector('.shortcuts-help-dialog');
  const closeBtn = dialog.querySelector('.shortcuts-help-close');
  setTimeout(() => closeBtn.focus(), 100);
}

/**
 * Hide keyboard shortcuts help dialog
 */
function hideShortcutsHelp() {
  const container = document.getElementById('shortcuts-help-container');
  if (container) {
    container.remove();
  }
  
  document.body.style.overflow = '';
  helpDialogOpen = false;
}

/**
 * Format shortcut keys for display
 * @param {string} keys - Key combination
 * @returns {string} Formatted keys
 */
function formatShortcutKeys(keys) {
  return keys
    .split('+')
    .map(key => {
      const keyMap = {
        'ctrl': '⌃',
        'cmd': '⌘',
        'alt': '⌥',
        'shift': '⇧',
        'enter': '↵',
        'esc': '⎋',
        'space': '␣',
        'up': '↑',
        'down': '↓',
        'left': '←',
        'right': '→'
      };
      
      return keyMap[key.toLowerCase()] || key.toUpperCase();
    })
    .join(' ');
}

// =============================================================================
// Cheat Sheet Display
// =============================================================================

/**
 * Show floating shortcut cheat sheet
 * @param {Array} shortcuts - Array of {keys, description} objects
 */
function showShortcutCheatSheet(shortcuts) {
  const cheatSheetHTML = `
    <div class="shortcut-cheat-sheet">
      <h3 class="text-sm font-semibold mb-2">단축키</h3>
      <div class="space-y-1">
        ${shortcuts.map(shortcut => `
          <div class="flex justify-between items-center text-xs">
            <span class="text-gray-600">${shortcut.description}</span>
            <kbd class="shortcut-keys-small">${formatShortcutKeys(shortcut.keys)}</kbd>
          </div>
        `).join('')}
      </div>
    </div>
  `;

  const existing = document.querySelector('.shortcut-cheat-sheet');
  if (existing) {
    existing.remove();
  }

  const container = document.createElement('div');
  container.innerHTML = cheatSheetHTML;
  document.body.appendChild(container.firstElementChild);
}

/**
 * Hide shortcut cheat sheet
 */
function hideShortcutCheatSheet() {
  const cheatSheet = document.querySelector('.shortcut-cheat-sheet');
  if (cheatSheet) {
    cheatSheet.remove();
  }
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Check if shortcut is registered
 * @param {string} keys - Key combination
 * @param {string} [context='global'] - Context
 * @returns {boolean} True if registered
 */
function hasShortcut(keys, context = 'global') {
  const normalizedKeys = normalizeKeys(keys);
  const shortcutKey = `${context}:${normalizedKeys}`;
  return shortcuts.has(shortcutKey);
}

/**
 * Get all registered shortcuts
 * @param {string} [context] - Filter by context
 * @returns {Array} Array of shortcuts
 */
function getAllShortcuts(context) {
  const result = [];
  
  shortcuts.forEach(shortcut => {
    if (!context || shortcut.context === context) {
      result.push(shortcut);
    }
  });
  
  return result;
}

/**
 * Disable all shortcuts
 */
function disableShortcuts() {
  document.removeEventListener('keydown', handleKeyDown);
}

/**
 * Enable shortcuts
 */
function enableShortcuts() {
  document.addEventListener('keydown', handleKeyDown);
}

// =============================================================================
// Initialize
// =============================================================================

// Setup keyboard event listener
document.addEventListener('keydown', handleKeyDown);

// Register default shortcuts
registerDefaultShortcuts();

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    registerShortcut,
    unregisterShortcut,
    clearContext,
    setShortcutContext,
    resetShortcutContext,
    getShortcutContext,
    showShortcutsHelp,
    hideShortcutsHelp,
    showShortcutCheatSheet,
    hideShortcutCheatSheet,
    hasShortcut,
    getAllShortcuts,
    disableShortcuts,
    enableShortcuts
  };
}
