/**
 * Advanced Search System V2
 * Boolean operators, field-specific search, visual search, saved searches
 * Phase 6.7 - Low Priority UX (UX-L-037 to UX-L-041: Advanced Search)
 */

class AdvancedSearchSystem {
  constructor() {
    this.searchHistory = this.loadSearchHistory();
    this.savedSearches = this.loadSavedSearches();
    this.currentQuery = {};
    
    this.init();
  }

  init() {
    console.log('🔍 Advanced Search System V2 initialized');
    this.setupEventListeners();
  }

  loadSearchHistory() {
    const data = localStorage.getItem('gallerypia_search_history_v2');
    return data ? JSON.parse(data) : [];
  }

  loadSavedSearches() {
    const data = localStorage.getItem('gallerypia_saved_searches');
    return data ? JSON.parse(data) : [];
  }

  saveSearchHistory() {
    localStorage.setItem('gallerypia_search_history_v2', JSON.stringify(this.searchHistory.slice(0, 50)));
  }

  saveSavedSearches() {
    localStorage.setItem('gallerypia_saved_searches', JSON.stringify(this.savedSearches));
  }

  async performSearch(query) {
    this.currentQuery = query;
    this.addToHistory(query);
    
    try {
      const response = await fetch('/api/search/advanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query)
      });
      
      const results = await response.json();
      this.renderResults(results);
      
      return results;
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async visualSearch(imageFile) {
    const formData = new FormData();
    formData.append('image', imageFile);
    
    try {
      const response = await fetch('/api/search/visual', {
        method: 'POST',
        body: formData
      });
      
      const results = await response.json();
      this.renderResults(results);
      
      this.showToast('이미지 검색 완료', 'success');
      return results;
    } catch (error) {
      console.error('Visual search failed:', error);
      this.showToast('이미지 검색 실패', 'error');
      return [];
    }
  }

  parseAdvancedQuery(queryString) {
    // Parse boolean operators: AND, OR, NOT
    // Parse field-specific: title:keywords artist:"name" price:100-1000
    const query = {
      must: [],
      should: [],
      mustNot: [],
      filters: {}
    };
    
    // Split by spaces but preserve quoted strings
    const tokens = queryString.match(/[^\s"']+|"([^"]*)"|'([^']*)'/g) || [];
    
    let currentOperator = 'must'; // Default to AND
    
    tokens.forEach(token => {
      token = token.replace(/["']/g, ''); // Remove quotes
      
      if (token === 'AND') {
        currentOperator = 'must';
      } else if (token === 'OR') {
        currentOperator = 'should';
      } else if (token === 'NOT') {
        currentOperator = 'mustNot';
      } else if (token.includes(':')) {
        // Field-specific search
        const [field, value] = token.split(':');
        
        if (field === 'price' && value.includes('-')) {
          const [min, max] = value.split('-').map(Number);
          query.filters.priceMin = min;
          query.filters.priceMax = max;
        } else {
          query.filters[field] = value;
        }
      } else {
        query[currentOperator].push(token);
      }
    });
    
    return query;
  }

  addToHistory(query) {
    this.searchHistory.unshift({
      query,
      timestamp: Date.now()
    });
    this.saveSearchHistory();
  }

  saveCurrentSearch(name) {
    const search = {
      id: `search_${Date.now()}`,
      name,
      query: this.currentQuery,
      createdAt: Date.now()
    };
    
    this.savedSearches.push(search);
    this.saveSavedSearches();
    this.showToast(`검색 "${name}" 저장됨`, 'success');
  }

  loadSavedSearch(searchId) {
    const search = this.savedSearches.find(s => s.id === searchId);
    if (search) {
      this.performSearch(search.query);
    }
  }

  deleteSavedSearch(searchId) {
    const index = this.savedSearches.findIndex(s => s.id === searchId);
    if (index !== -1) {
      this.savedSearches.splice(index, 1);
      this.saveSavedSearches();
      this.renderSavedSearches();
      this.showToast('검색 삭제됨', 'success');
    }
  }

  renderSearchInterface(containerId = 'advanced-search-interface') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold mb-4">고급 검색</h3>
        
        <!-- Search Input -->
        <div class="mb-4">
          <input type="text" 
                 id="advanced-search-input" 
                 class="w-full p-3 border rounded" 
                 placeholder="예: title:산수화 AND artist:김홍도 price:100000-500000">
          <p class="text-sm text-gray-500 mt-2">
            팁: AND, OR, NOT 연산자 사용 가능, field:value 형식으로 필드 검색
          </p>
        </div>
        
        <!-- Quick Filters -->
        <div class="grid grid-cols-3 gap-4 mb-4">
          <div>
            <label class="block text-sm font-medium mb-1">카테고리</label>
            <select id="category-filter" class="w-full p-2 border rounded">
              <option value="">전체</option>
              <option value="painting">회화</option>
              <option value="sculpture">조각</option>
              <option value="photo">사진</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">가격대</label>
            <select id="price-filter" class="w-full p-2 border rounded">
              <option value="">전체</option>
              <option value="0-100000">10만원 이하</option>
              <option value="100000-500000">10-50만원</option>
              <option value="500000-1000000">50-100만원</option>
              <option value="1000000-">100만원 이상</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">정렬</label>
            <select id="sort-filter" class="w-full p-2 border rounded">
              <option value="relevance">관련도순</option>
              <option value="date">최신순</option>
              <option value="price-asc">가격 낮은순</option>
              <option value="price-desc">가격 높은순</option>
            </select>
          </div>
        </div>
        
        <!-- Action Buttons -->
        <div class="flex gap-2 mb-6">
          <button onclick="advancedSearchSystem.submitSearch()" 
                  class="flex-1 bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">
            <i class="fas fa-search mr-2"></i>검색
          </button>
          <button onclick="advancedSearchSystem.showSaveSearchDialog()" 
                  class="px-4 py-2 border rounded hover:bg-gray-50">
            <i class="fas fa-bookmark"></i>
          </button>
          <button onclick="document.getElementById('visual-search-input').click()" 
                  class="px-4 py-2 border rounded hover:bg-gray-50">
            <i class="fas fa-image"></i>
          </button>
          <input type="file" 
                 id="visual-search-input" 
                 accept="image/*" 
                 class="hidden" 
                 onchange="advancedSearchSystem.handleVisualSearch(this)">
        </div>
        
        <!-- Saved Searches -->
        <div class="mb-4">
          <h4 class="font-bold mb-2">저장된 검색</h4>
          <div id="saved-searches-list" class="space-y-2">
            ${this.renderSavedSearchesList()}
          </div>
        </div>
        
        <!-- Search History -->
        <div>
          <h4 class="font-bold mb-2">최근 검색</h4>
          <div id="search-history-list" class="space-y-1">
            ${this.renderSearchHistoryList()}
          </div>
        </div>
      </div>
      
      <!-- Results -->
      <div id="search-results-container" class="mt-6"></div>
    `;
  }

  renderSavedSearchesList() {
    if (this.savedSearches.length === 0) {
      return '<p class="text-sm text-gray-500">저장된 검색이 없습니다</p>';
    }
    
    return this.savedSearches.map(search => `
      <div class="flex justify-between items-center p-2 bg-gray-50 rounded hover:bg-gray-100">
        <button onclick="advancedSearchSystem.loadSavedSearch('${search.id}')" 
                class="flex-1 text-left">
          <i class="fas fa-bookmark text-indigo-600 mr-2"></i>${search.name}
        </button>
        <button onclick="advancedSearchSystem.deleteSavedSearch('${search.id}')" 
                class="text-red-500 hover:text-red-700">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    `).join('');
  }

  renderSearchHistoryList() {
    if (this.searchHistory.length === 0) {
      return '<p class="text-sm text-gray-500">검색 기록이 없습니다</p>';
    }
    
    return this.searchHistory.slice(0, 10).map(item => `
      <button onclick="advancedSearchSystem.performSearch(${JSON.stringify(item.query).replace(/"/g, '&quot;')})" 
              class="block w-full text-left text-sm text-gray-600 hover:text-indigo-600 p-1">
        ${JSON.stringify(item.query)}
      </button>
    `).join('');
  }

  renderResults(results) {
    const container = document.getElementById('search-results-container');
    if (!container) return;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold mb-4">검색 결과 (${results.length}개)</h3>
        <div class="grid grid-cols-4 gap-6">
          ${results.map(artwork => this.renderResultCard(artwork)).join('')}
        </div>
      </div>
    `;
  }

  renderResultCard(artwork) {
    return `
      <div class="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow">
        <img src="${artwork.imageUrl}" alt="${artwork.title}" class="w-full h-48 object-cover">
        <div class="p-4">
          <h4 class="font-semibold text-gray-800 line-clamp-1">${artwork.title}</h4>
          <p class="text-sm text-gray-600">${artwork.artist}</p>
          <p class="text-lg font-bold text-indigo-600 mt-2">${this.formatPrice(artwork.price)}</p>
        </div>
      </div>
    `;
  }

  submitSearch() {
    const input = document.getElementById('advanced-search-input');
    const queryString = input.value.trim();
    
    if (!queryString) return;
    
    const query = this.parseAdvancedQuery(queryString);
    
    // Add filters from selects
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter && categoryFilter.value) {
      query.filters.category = categoryFilter.value;
    }
    
    const priceFilter = document.getElementById('price-filter');
    if (priceFilter && priceFilter.value) {
      const [min, max] = priceFilter.value.split('-');
      if (min) query.filters.priceMin = parseInt(min);
      if (max) query.filters.priceMax = parseInt(max);
    }
    
    const sortFilter = document.getElementById('sort-filter');
    if (sortFilter && sortFilter.value) {
      query.sort = sortFilter.value;
    }
    
    this.performSearch(query);
  }

  handleVisualSearch(input) {
    const file = input.files[0];
    if (file) {
      this.visualSearch(file);
    }
  }

  showSaveSearchDialog() {
    const name = prompt('검색 이름:');
    if (name) {
      this.saveCurrentSearch(name);
      this.renderSearchInterface();
    }
  }

  setupEventListeners() {
    // Enter key to search
    document.addEventListener('keypress', (e) => {
      if (e.target.id === 'advanced-search-input' && e.key === 'Enter') {
        this.submitSearch();
      }
    });
  }

  formatPrice(price) {
    if (!price) return '가격 문의';
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW' }).format(price);
  }

  showToast(message, type) {
    if (window.ToastNotificationManager) {
      window.ToastNotificationManager.show(message, type);
    }
  }
}

let advancedSearchSystem;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    advancedSearchSystem = new AdvancedSearchSystem();
  });
} else {
  advancedSearchSystem = new AdvancedSearchSystem();
}
