/**
 * Advanced Sorting System
 * Multi-level sorting with custom criteria
 * Version: 1.0.0
 */

class AdvancedSortManager {
  constructor(options = {}) {
    this.sortBy = options.sortBy || 'date';
    this.sortOrder = options.sortOrder || 'desc';
    this.secondarySort = options.secondarySort || null;
    this.onSortChange = options.onSortChange || (() => {});
    
    this.sortOptions = {
      date: 'Date Added',
      price: 'Price',
      popularity: 'Popularity',
      trending: 'Trending',
      valuation: 'Valuation Score',
      views: 'Views',
      likes: 'Likes',
      name: 'Name'
    };
    
    this.init();
  }
  
  init() {
    this.bindSortControls();
  }
  
  bindSortControls() {
    const sortSelect = document.getElementById('sort-by');
    const sortOrderBtn = document.getElementById('sort-order');
    
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.setSortBy(sortSelect.value);
      });
    }
    
    if (sortOrderBtn) {
      sortOrderBtn.addEventListener('click', () => {
        this.toggleSortOrder();
      });
    }
  }
  
  setSortBy(field) {
    this.sortBy = field;
    this.onSortChange({ sortBy: this.sortBy, sortOrder: this.sortOrder, secondarySort: this.secondarySort });
    this.updateSortUI();
  }
  
  setSortOrder(order) {
    this.sortOrder = order;
    this.onSortChange({ sortBy: this.sortBy, sortOrder: this.sortOrder, secondarySort: this.secondarySort });
    this.updateSortUI();
  }
  
  toggleSortOrder() {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.onSortChange({ sortBy: this.sortBy, sortOrder: this.sortOrder, secondarySort: this.secondarySort });
    this.updateSortUI();
  }
  
  setSecondarySort(field) {
    this.secondarySort = field;
    this.onSortChange({ sortBy: this.sortBy, sortOrder: this.sortOrder, secondarySort: this.secondarySort });
  }
  
  updateSortUI() {
    const sortOrderBtn = document.getElementById('sort-order');
    if (sortOrderBtn) {
      const icon = sortOrderBtn.querySelector('i');
      if (icon) {
        icon.className = this.sortOrder === 'asc' ? 'fas fa-sort-amount-up' : 'fas fa-sort-amount-down';
      }
    }
  }
  
  // Sort array of items
  sortItems(items) {
    return items.sort((a, b) => {
      const result = this.compareItems(a, b, this.sortBy);
      
      if (result === 0 && this.secondarySort) {
        return this.compareItems(a, b, this.secondarySort);
      }
      
      return this.sortOrder === 'asc' ? result : -result;
    });
  }
  
  compareItems(a, b, field) {
    const aVal = this.getFieldValue(a, field);
    const bVal = this.getFieldValue(b, field);
    
    if (typeof aVal === 'string') {
      return aVal.localeCompare(bVal);
    }
    
    return aVal - bVal;
  }
  
  getFieldValue(item, field) {
    // Map field names to item properties
    const fieldMap = {
      date: 'created_at',
      price: 'price_krw',
      popularity: 'popularity_score',
      trending: 'trending_score',
      valuation: 'valuation_score',
      views: 'views_count',
      likes: 'likes_count',
      name: 'title'
    };
    
    const prop = fieldMap[field] || field;
    return item[prop];
  }
}

window.AdvancedSortManager = AdvancedSortManager;
window.initAdvancedSort = function(options) {
  return new AdvancedSortManager(options);
};

console.log('✅ Advanced Sort loaded');
