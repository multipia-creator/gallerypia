/**
 * Advanced Filtering System
 * Multi-criteria filtering with AND/OR logic
 * Version: 1.0.0
 */

class AdvancedFilterManager {
  constructor(options = {}) {
    this.filters = {};
    this.logic = options.logic || 'AND'; // AND or OR
    this.onFilterChange = options.onFilterChange || (() => {});
    this.savedFilters = this.loadSavedFilters();
    
    this.init();
  }
  
  init() {
    this.bindFilterControls();
  }
  
  bindFilterControls() {
    // Price range
    const priceMin = document.getElementById('filter-price-min');
    const priceMax = document.getElementById('filter-price-max');
    
    if (priceMin && priceMax) {
      [priceMin, priceMax].forEach(input => {
        input.addEventListener('change', () => {
          this.setFilter('price', {
            min: parseFloat(priceMin.value) || 0,
            max: parseFloat(priceMax.value) || Infinity
          });
        });
      });
    }
    
    // Date range
    const dateFrom = document.getElementById('filter-date-from');
    const dateTo = document.getElementById('filter-date-to');
    
    if (dateFrom && dateTo) {
      [dateFrom, dateTo].forEach(input => {
        input.addEventListener('change', () => {
          this.setFilter('date', {
            from: new Date(dateFrom.value),
            to: new Date(dateTo.value)
          });
        });
      });
    }
    
    // Category checkboxes
    const categoryCheckboxes = document.querySelectorAll('[name="filter-category"]');
    categoryCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selectedCategories = Array.from(categoryCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.setFilter('categories', selectedCategories);
      });
    });
    
    // Artist select
    const artistSelect = document.getElementById('filter-artist');
    if (artistSelect) {
      artistSelect.addEventListener('change', () => {
        this.setFilter('artist', artistSelect.value);
      });
    }
    
    // Status checkboxes  
    const statusCheckboxes = document.querySelectorAll('[name="filter-status"]');
    statusCheckboxes.forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        const selectedStatuses = Array.from(statusCheckboxes)
          .filter(cb => cb.checked)
          .map(cb => cb.value);
        this.setFilter('statuses', selectedStatuses);
      });
    });
  }
  
  setFilter(key, value) {
    if (value === null || value === undefined || value === '' ||
        (Array.isArray(value) && value.length === 0)) {
      delete this.filters[key];
    } else {
      this.filters[key] = value;
    }
    
    this.onFilterChange(this.filters);
    this.updateFilterBadge();
  }
  
  getFilters() {
    return { ...this.filters };
  }
  
  clearFilters() {
    this.filters = {};
    this.resetFilterControls();
    this.onFilterChange(this.filters);
    this.updateFilterBadge();
  }
  
  resetFilterControls() {
    // Reset all filter inputs
    const inputs = document.querySelectorAll('[id^="filter-"]');
    inputs.forEach(input => {
      if (input.type === 'checkbox') {
        input.checked = false;
      } else {
        input.value = '';
      }
    });
  }
  
  updateFilterBadge() {
    const filterCount = Object.keys(this.filters).length;
    const badge = document.getElementById('filter-count-badge');
    
    if (badge) {
      if (filterCount > 0) {
        badge.textContent = filterCount;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    }
  }
  
  // Saved filter presets
  saveFilter(name) {
    this.savedFilters[name] = { ...this.filters };
    localStorage.setItem('gallerypia_saved_filters', JSON.stringify(this.savedFilters));
    
    if (window.showSuccess) {
      window.showSuccess(`Filter "${name}" saved successfully`);
    }
  }
  
  loadFilter(name) {
    if (this.savedFilters[name]) {
      this.filters = { ...this.savedFilters[name] };
      this.applyFiltersToControls();
      this.onFilterChange(this.filters);
      this.updateFilterBadge();
    }
  }
  
  deleteFilter(name) {
    delete this.savedFilters[name];
    localStorage.setItem('gallerypia_saved_filters', JSON.stringify(this.savedFilters));
  }
  
  loadSavedFilters() {
    const saved = localStorage.getItem('gallerypia_saved_filters');
    return saved ? JSON.parse(saved) : {};
  }
  
  getSavedFilters() {
    return { ...this.savedFilters };
  }
  
  applyFiltersToControls() {
    // Apply current filters to UI controls
    for (const [key, value] of Object.entries(this.filters)) {
      if (key === 'price') {
        const priceMin = document.getElementById('filter-price-min');
        const priceMax = document.getElementById('filter-price-max');
        if (priceMin) priceMin.value = value.min;
        if (priceMax) priceMax.value = value.max === Infinity ? '' : value.max;
      } else if (key === 'date') {
        const dateFrom = document.getElementById('filter-date-from');
        const dateTo = document.getElementById('filter-date-to');
        if (dateFrom) dateFrom.value = value.from.toISOString().split('T')[0];
        if (dateTo) dateTo.value = value.to.toISOString().split('T')[0];
      } else if (key === 'categories' && Array.isArray(value)) {
        value.forEach(cat => {
          const checkbox = document.querySelector(`[name="filter-category"][value="${cat}"]`);
          if (checkbox) checkbox.checked = true;
        });
      }
    }
  }
  
  // Export filter as URL params
  toURLParams() {
    const params = new URLSearchParams();
    
    for (const [key, value] of Object.entries(this.filters)) {
      if (Array.isArray(value)) {
        params.set(key, value.join(','));
      } else if (typeof value === 'object') {
        params.set(key, JSON.stringify(value));
      } else {
        params.set(key, value);
      }
    }
    
    return params.toString();
  }
  
  // Import filter from URL params
  fromURLParams(params) {
    const urlParams = new URLSearchParams(params);
    
    for (const [key, value] of urlParams.entries()) {
      try {
        const parsed = JSON.parse(value);
        this.filters[key] = parsed;
      } catch {
        if (value.includes(',')) {
          this.filters[key] = value.split(',');
        } else {
          this.filters[key] = value;
        }
      }
    }
    
    this.applyFiltersToControls();
    this.updateFilterBadge();
  }
}

// Global helpers
window.AdvancedFilterManager = AdvancedFilterManager;

window.initAdvancedFilter = function(options) {
  return new AdvancedFilterManager(options);
};

console.log('✅ Advanced Filter loaded');
