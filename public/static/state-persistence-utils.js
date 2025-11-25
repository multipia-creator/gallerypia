/**
 * GalleryPia - State Persistence Utilities
 * 
 * Client-side JavaScript for persisting filter/sort states
 * Uses localStorage for persistence across sessions
 * 
 * Features:
 * - Filter state persistence (category, price range, tags)
 * - Sort state persistence (order, direction)
 * - Search query persistence
 * - URL sync for shareable states
 * - Expiration support for temporary states
 * - Multiple namespace support
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class StatePersistence {
  constructor(options = {}) {
    this.namespace = options.namespace || 'gallerypia';
    this.storageKey = `${this.namespace}_state`;
    this.expirationMs = options.expirationMs || (7 * 24 * 60 * 60 * 1000); // 7 days default
    this.syncWithURL = options.syncWithURL !== false; // Default true
    this.autoSave = options.autoSave !== false; // Default true
    
    this.state = this.loadState();
  }
  
  // Save state to localStorage
  saveState(newState) {
    const currentState = this.state || {};
    this.state = { ...currentState, ...newState };
    
    const stateToSave = {
      data: this.state,
      timestamp: Date.now(),
      expiresAt: Date.now() + this.expirationMs
    };
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(stateToSave));
      
      if (this.syncWithURL) {
        this.syncToURL();
      }
      
      this.dispatchStateChangeEvent();
      return true;
    } catch (error) {
      console.error('Failed to save state:', error);
      return false;
    }
  }
  
  // Load state from localStorage
  loadState() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (!stored) {
        return this.loadFromURL() || {};
      }
      
      const parsed = JSON.parse(stored);
      
      // Check expiration
      if (parsed.expiresAt && Date.now() > parsed.expiresAt) {
        console.log('State expired, clearing...');
        this.clearState();
        return this.loadFromURL() || {};
      }
      
      return parsed.data || {};
    } catch (error) {
      console.error('Failed to load state:', error);
      return this.loadFromURL() || {};
    }
  }
  
  // Get specific state value
  get(key, defaultValue = null) {
    return this.state?.[key] ?? defaultValue;
  }
  
  // Set specific state value
  set(key, value) {
    this.saveState({ [key]: value });
  }
  
  // Remove specific state value
  remove(key) {
    if (this.state && key in this.state) {
      delete this.state[key];
      this.saveState(this.state);
    }
  }
  
  // Clear all state
  clearState() {
    this.state = {};
    try {
      localStorage.removeItem(this.storageKey);
      
      if (this.syncWithURL) {
        this.clearURL();
      }
      
      this.dispatchStateChangeEvent();
      return true;
    } catch (error) {
      console.error('Failed to clear state:', error);
      return false;
    }
  }
  
  // Sync state to URL query parameters
  syncToURL() {
    if (!this.syncWithURL) return;
    
    const url = new URL(window.location);
    const params = new URLSearchParams();
    
    // Add state to URL params
    Object.entries(this.state).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        if (typeof value === 'object') {
          params.set(key, JSON.stringify(value));
        } else {
          params.set(key, value);
        }
      }
    });
    
    // Update URL without reload
    url.search = params.toString();
    window.history.replaceState({}, '', url);
  }
  
  // Load state from URL query parameters
  loadFromURL() {
    if (!this.syncWithURL) return {};
    
    const url = new URL(window.location);
    const params = new URLSearchParams(url.search);
    const state = {};
    
    params.forEach((value, key) => {
      try {
        // Try to parse JSON values
        state[key] = JSON.parse(value);
      } catch {
        // Use raw value if not JSON
        state[key] = value;
      }
    });
    
    return state;
  }
  
  // Clear URL query parameters
  clearURL() {
    if (!this.syncWithURL) return;
    
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
  }
  
  // Dispatch custom event for state changes
  dispatchStateChangeEvent() {
    const event = new CustomEvent('statePersistenceChange', {
      detail: {
        namespace: this.namespace,
        state: this.state
      }
    });
    window.dispatchEvent(event);
  }
  
  // Get all state
  getAll() {
    return { ...this.state };
  }
  
  // Check if state has specific key
  has(key) {
    return key in this.state;
  }
}

// Filter state manager
class FilterStatePersistence extends StatePersistence {
  constructor(options = {}) {
    super({ ...options, namespace: options.namespace || 'gallery_filters' });
  }
  
  // Set filter value
  setFilter(filterName, value) {
    const filters = this.get('filters', {});
    filters[filterName] = value;
    this.set('filters', filters);
  }
  
  // Get filter value
  getFilter(filterName, defaultValue = null) {
    const filters = this.get('filters', {});
    return filters[filterName] ?? defaultValue;
  }
  
  // Remove filter
  removeFilter(filterName) {
    const filters = this.get('filters', {});
    delete filters[filterName];
    this.set('filters', filters);
  }
  
  // Get all filters
  getFilters() {
    return this.get('filters', {});
  }
  
  // Clear all filters
  clearFilters() {
    this.set('filters', {});
  }
  
  // Set sort configuration
  setSort(field, direction = 'asc') {
    this.set('sort', { field, direction });
  }
  
  // Get sort configuration
  getSort() {
    return this.get('sort', { field: 'created_at', direction: 'desc' });
  }
  
  // Set search query
  setSearch(query) {
    this.set('search', query);
  }
  
  // Get search query
  getSearch() {
    return this.get('search', '');
  }
  
  // Set pagination
  setPage(page) {
    this.set('page', page);
  }
  
  // Get pagination
  getPage() {
    return this.get('page', 1);
  }
  
  // Set items per page
  setPageSize(size) {
    this.set('pageSize', size);
  }
  
  // Get items per page
  getPageSize() {
    return this.get('pageSize', 20);
  }
}

// View state manager (grid/list, sidebar, etc.)
class ViewStatePersistence extends StatePersistence {
  constructor(options = {}) {
    super({ ...options, namespace: options.namespace || 'gallery_view' });
  }
  
  // Set view mode
  setViewMode(mode) {
    this.set('viewMode', mode);
  }
  
  // Get view mode
  getViewMode(defaultMode = 'grid') {
    return this.get('viewMode', defaultMode);
  }
  
  // Set sidebar state
  setSidebarOpen(isOpen) {
    this.set('sidebarOpen', isOpen);
  }
  
  // Get sidebar state
  getSidebarOpen(defaultState = true) {
    return this.get('sidebarOpen', defaultState);
  }
  
  // Set column count
  setColumns(count) {
    this.set('columns', count);
  }
  
  // Get column count
  getColumns(defaultCount = 4) {
    return this.get('columns', defaultCount);
  }
  
  // Set theme
  setTheme(theme) {
    this.set('theme', theme);
  }
  
  // Get theme
  getTheme(defaultTheme = 'dark') {
    return this.get('theme', defaultTheme);
  }
}

// Recent searches manager
class RecentSearches {
  constructor(options = {}) {
    this.namespace = options.namespace || 'gallery_recent_searches';
    this.storageKey = `${this.namespace}_recent`;
    this.maxItems = options.maxItems || 10;
  }
  
  // Add search query
  add(query) {
    if (!query || typeof query !== 'string') return;
    
    const searches = this.getAll();
    
    // Remove if already exists
    const filtered = searches.filter(s => s.query !== query);
    
    // Add to beginning
    filtered.unshift({
      query,
      timestamp: Date.now()
    });
    
    // Limit to maxItems
    const limited = filtered.slice(0, this.maxItems);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(limited));
    } catch (error) {
      console.error('Failed to save recent search:', error);
    }
  }
  
  // Get all recent searches
  getAll() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to load recent searches:', error);
      return [];
    }
  }
  
  // Remove specific search
  remove(query) {
    const searches = this.getAll();
    const filtered = searches.filter(s => s.query !== query);
    
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to remove recent search:', error);
    }
  }
  
  // Clear all recent searches
  clear() {
    try {
      localStorage.removeItem(this.storageKey);
    } catch (error) {
      console.error('Failed to clear recent searches:', error);
    }
  }
}

// Global instances
window.filterState = new FilterStatePersistence();
window.viewState = new ViewStatePersistence();
window.recentSearches = new RecentSearches();

// Global helper functions
window.saveFilters = function(filters) {
  Object.entries(filters).forEach(([key, value]) => {
    window.filterState.setFilter(key, value);
  });
};

window.loadFilters = function() {
  return window.filterState.getFilters();
};

window.clearFilters = function() {
  window.filterState.clearFilters();
};

window.saveSort = function(field, direction) {
  window.filterState.setSort(field, direction);
};

window.loadSort = function() {
  return window.filterState.getSort();
};

window.saveSearch = function(query) {
  window.filterState.setSearch(query);
  window.recentSearches.add(query);
};

window.loadSearch = function() {
  return window.filterState.getSearch();
};

window.getRecentSearches = function() {
  return window.recentSearches.getAll();
};

window.clearRecentSearches = function() {
  window.recentSearches.clear();
};

window.saveViewMode = function(mode) {
  window.viewState.setViewMode(mode);
};

window.loadViewMode = function() {
  return window.viewState.getViewMode();
};

// Auto-restore state on page load
document.addEventListener('DOMContentLoaded', function() {
  // Restore filters
  const filters = window.filterState.getFilters();
  if (Object.keys(filters).length > 0) {
    console.log('Restored filters:', filters);
    
    // Apply filters to UI
    Object.entries(filters).forEach(([key, value]) => {
      const input = document.querySelector(`[name="${key}"]`);
      if (input) {
        if (input.type === 'checkbox') {
          input.checked = value;
        } else if (input.type === 'radio') {
          if (input.value === value) {
            input.checked = true;
          }
        } else {
          input.value = value;
        }
      }
    });
  }
  
  // Restore sort
  const sort = window.filterState.getSort();
  const sortSelect = document.querySelector('[name="sort"]');
  if (sortSelect && sort.field) {
    sortSelect.value = `${sort.field}_${sort.direction}`;
  }
  
  // Restore search
  const search = window.filterState.getSearch();
  const searchInput = document.querySelector('input[type="search"]');
  if (searchInput && search) {
    searchInput.value = search;
  }
  
  // Restore view mode
  const viewMode = window.viewState.getViewMode();
  const viewButtons = document.querySelectorAll('[data-view-mode]');
  viewButtons.forEach(btn => {
    if (btn.dataset.viewMode === viewMode) {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
  
  console.log('State persistence initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    StatePersistence,
    FilterStatePersistence,
    ViewStatePersistence,
    RecentSearches
  };
}
