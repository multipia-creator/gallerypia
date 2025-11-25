/**
 * Layout Preferences Manager
 * Grid vs List view, density options, column count customization
 * Phase 6.4 - Low Priority UX (UX-L-025: Layout Customization)
 */

class LayoutPreferencesManager {
  constructor() {
    this.preferences = this.loadPreferences();
    
    this.init();
  }

  init() {
    console.log('🎨 Layout Preferences Manager initialized');
    
    // Apply saved preferences
    this.applyPreferences();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  // ===== Data Management =====
  
  loadPreferences() {
    const data = localStorage.getItem('gallerypia_layout_preferences');
    return data ? JSON.parse(data) : {
      viewMode: 'grid', // 'grid' | 'list' | 'masonry'
      gridColumns: 4, // 2, 3, 4, 5, 6
      density: 'comfortable', // 'compact' | 'comfortable' | 'spacious'
      showLabels: true,
      showPrices: true,
      cardSize: 'medium', // 'small' | 'medium' | 'large'
      imageRatio: 'square', // 'square' | 'portrait' | 'landscape' | 'original'
      sortBy: 'date',
      sortOrder: 'desc'
    };
  }

  savePreferences() {
    localStorage.setItem('gallerypia_layout_preferences', JSON.stringify(this.preferences));
    this.dispatchEvent('layout-preferences-changed', this.preferences);
  }

  // ===== Preference Setters =====
  
  setViewMode(mode) {
    this.preferences.viewMode = mode;
    this.savePreferences();
    this.applyViewMode();
    this.showToast(`${mode === 'grid' ? '그리드' : mode === 'list' ? '리스트' : '매소너리'} 보기로 전환됨`);
  }

  setGridColumns(columns) {
    this.preferences.gridColumns = columns;
    this.savePreferences();
    this.applyGridColumns();
  }

  setDensity(density) {
    this.preferences.density = density;
    this.savePreferences();
    this.applyDensity();
    this.showToast(`${density === 'compact' ? '컴팩트' : density === 'comfortable' ? '보통' : '여유'} 간격 적용됨`);
  }

  setCardSize(size) {
    this.preferences.cardSize = size;
    this.savePreferences();
    this.applyCardSize();
  }

  setImageRatio(ratio) {
    this.preferences.imageRatio = ratio;
    this.savePreferences();
    this.applyImageRatio();
  }

  toggleLabels() {
    this.preferences.showLabels = !this.preferences.showLabels;
    this.savePreferences();
    this.applyLabelVisibility();
  }

  togglePrices() {
    this.preferences.showPrices = !this.preferences.showPrices;
    this.savePreferences();
    this.applyPriceVisibility();
  }

  // ===== Apply Preferences =====
  
  applyPreferences() {
    this.applyViewMode();
    this.applyGridColumns();
    this.applyDensity();
    this.applyCardSize();
    this.applyImageRatio();
    this.applyLabelVisibility();
    this.applyPriceVisibility();
  }

  applyViewMode() {
    const containers = document.querySelectorAll('[data-layout-container]');
    
    containers.forEach(container => {
      container.className = container.className.replace(/layout-\w+/g, '');
      container.classList.add(`layout-${this.preferences.viewMode}`);
      
      // Apply appropriate grid classes
      if (this.preferences.viewMode === 'grid') {
        container.classList.add('grid', `grid-cols-${this.preferences.gridColumns}`, 'gap-6');
      } else if (this.preferences.viewMode === 'list') {
        container.classList.add('space-y-4');
      } else if (this.preferences.viewMode === 'masonry') {
        container.classList.add('masonry-grid');
      }
    });
    
    // Update toggle buttons
    document.querySelectorAll('[data-view-toggle]').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.viewToggle === this.preferences.viewMode);
    });
  }

  applyGridColumns() {
    const containers = document.querySelectorAll('[data-layout-container]');
    
    containers.forEach(container => {
      if (this.preferences.viewMode === 'grid') {
        container.className = container.className.replace(/grid-cols-\d/g, '');
        container.classList.add(`grid-cols-1`, `md:grid-cols-${Math.floor(this.preferences.gridColumns / 2)}`, `lg:grid-cols-${this.preferences.gridColumns}`);
      }
    });
  }

  applyDensity() {
    const containers = document.querySelectorAll('[data-layout-container]');
    
    const gapClasses = {
      compact: 'gap-2',
      comfortable: 'gap-6',
      spacious: 'gap-8'
    };
    
    containers.forEach(container => {
      container.className = container.className.replace(/gap-\d+/g, '');
      container.classList.add(gapClasses[this.preferences.density]);
    });
    
    // Apply to cards
    const cards = document.querySelectorAll('[data-artwork-card]');
    const paddingClasses = {
      compact: 'p-2',
      comfortable: 'p-4',
      spacious: 'p-6'
    };
    
    cards.forEach(card => {
      const content = card.querySelector('.card-content');
      if (content) {
        content.className = content.className.replace(/p-\d+/g, '');
        content.classList.add(paddingClasses[this.preferences.density]);
      }
    });
  }

  applyCardSize() {
    const cards = document.querySelectorAll('[data-artwork-card]');
    
    const sizeClasses = {
      small: 'h-32',
      medium: 'h-48',
      large: 'h-64'
    };
    
    cards.forEach(card => {
      const img = card.querySelector('img');
      if (img) {
        img.className = img.className.replace(/h-\d+/g, '');
        img.classList.add(sizeClasses[this.preferences.cardSize], 'w-full', 'object-cover');
      }
    });
  }

  applyImageRatio() {
    const cards = document.querySelectorAll('[data-artwork-card]');
    
    const ratioClasses = {
      square: 'aspect-square',
      portrait: 'aspect-[3/4]',
      landscape: 'aspect-[4/3]',
      original: 'aspect-auto'
    };
    
    cards.forEach(card => {
      const imgContainer = card.querySelector('.img-container');
      if (imgContainer) {
        imgContainer.className = imgContainer.className.replace(/aspect-\S+/g, '');
        imgContainer.classList.add(ratioClasses[this.preferences.imageRatio]);
      }
    });
  }

  applyLabelVisibility() {
    const labels = document.querySelectorAll('[data-card-label]');
    labels.forEach(label => {
      label.style.display = this.preferences.showLabels ? '' : 'none';
    });
  }

  applyPriceVisibility() {
    const prices = document.querySelectorAll('[data-card-price]');
    prices.forEach(price => {
      price.style.display = this.preferences.showPrices ? '' : 'none';
    });
  }

  // ===== Event Listeners =====
  
  setupEventListeners() {
    // View mode toggles
    document.addEventListener('click', (e) => {
      const viewToggle = e.target.closest('[data-view-toggle]');
      if (viewToggle) {
        this.setViewMode(viewToggle.dataset.viewToggle);
      }
      
      const densityToggle = e.target.closest('[data-density-toggle]');
      if (densityToggle) {
        this.setDensity(densityToggle.dataset.densityToggle);
      }
      
      const columnsBtn = e.target.closest('[data-columns]');
      if (columnsBtn) {
        this.setGridColumns(parseInt(columnsBtn.dataset.columns));
      }
    });
    
    // Column slider
    const columnSlider = document.getElementById('grid-columns-slider');
    if (columnSlider) {
      columnSlider.value = this.preferences.gridColumns;
      columnSlider.addEventListener('input', (e) => {
        this.setGridColumns(parseInt(e.target.value));
      });
    }
    
    // Toggle switches
    const labelsToggle = document.getElementById('toggle-labels');
    if (labelsToggle) {
      labelsToggle.checked = this.preferences.showLabels;
      labelsToggle.addEventListener('change', () => this.toggleLabels());
    }
    
    const pricesToggle = document.getElementById('toggle-prices');
    if (pricesToggle) {
      pricesToggle.checked = this.preferences.showPrices;
      pricesToggle.addEventListener('change', () => this.togglePrices());
    }
  }

  // ===== UI Rendering =====
  
  renderPreferencesPanel(containerId = 'layout-preferences-panel') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6 space-y-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">레이아웃 설정</h3>
        
        <!-- View Mode -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">보기 모드</label>
          <div class="flex gap-2">
            <button data-view-toggle="grid" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.viewMode === 'grid' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              <i class="fas fa-th mr-2"></i>그리드
            </button>
            <button data-view-toggle="list" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.viewMode === 'list' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              <i class="fas fa-list mr-2"></i>리스트
            </button>
            <button data-view-toggle="masonry" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.viewMode === 'masonry' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              <i class="fas fa-th-large mr-2"></i>매소너리
            </button>
          </div>
        </div>
        
        <!-- Grid Columns -->
        ${this.preferences.viewMode === 'grid' ? `
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-2">
              컬럼 수: <span class="text-indigo-600 font-bold">${this.preferences.gridColumns}</span>
            </label>
            <input type="range" id="grid-columns-slider" 
                   min="2" max="6" step="1" value="${this.preferences.gridColumns}"
                   class="w-full">
            <div class="flex justify-between text-xs text-gray-500 mt-1">
              <span>2</span><span>3</span><span>4</span><span>5</span><span>6</span>
            </div>
          </div>
        ` : ''}
        
        <!-- Density -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">간격</label>
          <div class="flex gap-2">
            <button data-density-toggle="compact" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.density === 'compact' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              컴팩트
            </button>
            <button data-density-toggle="comfortable" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.density === 'comfortable' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              보통
            </button>
            <button data-density-toggle="spacious" 
                    class="flex-1 py-2 px-4 border rounded ${this.preferences.density === 'spacious' ? 'bg-indigo-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}">
              여유
            </button>
          </div>
        </div>
        
        <!-- Display Options -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">표시 옵션</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input type="checkbox" id="toggle-labels" 
                     ${this.preferences.showLabels ? 'checked' : ''}
                     class="mr-2">
              <span class="text-sm text-gray-700">작품명 표시</span>
            </label>
            <label class="flex items-center">
              <input type="checkbox" id="toggle-prices" 
                     ${this.preferences.showPrices ? 'checked' : ''}
                     class="mr-2">
              <span class="text-sm text-gray-700">가격 표시</span>
            </label>
          </div>
        </div>
        
        <!-- Reset -->
        <button onclick="layoutPreferencesManager.resetPreferences()" 
                class="w-full py-2 px-4 border border-gray-300 rounded text-gray-700 hover:bg-gray-50">
          <i class="fas fa-undo mr-2"></i>기본값으로 초기화
        </button>
      </div>
    `;
    
    // Reinitialize event listeners
    this.setupEventListeners();
  }

  // ===== Utilities =====
  
  resetPreferences() {
    if (confirm('레이아웃 설정을 초기화하시겠습니까?')) {
      localStorage.removeItem('gallerypia_layout_preferences');
      this.preferences = this.loadPreferences();
      this.applyPreferences();
      this.renderPreferencesPanel();
      this.showToast('레이아웃 설정이 초기화되었습니다');
    }
  }

  showToast(message) {
    if (window.ToastNotificationManager) {
      window.ToastNotificationManager.show(message, 'info');
    }
  }

  dispatchEvent(eventName, detail) {
    document.dispatchEvent(new CustomEvent(eventName, { detail }));
  }

  // ===== Presets =====
  
  applyPreset(preset) {
    const presets = {
      gallery: {
        viewMode: 'grid',
        gridColumns: 4,
        density: 'comfortable',
        showLabels: true,
        showPrices: true,
        cardSize: 'medium',
        imageRatio: 'square'
      },
      catalog: {
        viewMode: 'list',
        gridColumns: 1,
        density: 'compact',
        showLabels: true,
        showPrices: true,
        cardSize: 'small',
        imageRatio: 'landscape'
      },
      showcase: {
        viewMode: 'masonry',
        gridColumns: 3,
        density: 'spacious',
        showLabels: true,
        showPrices: false,
        cardSize: 'large',
        imageRatio: 'original'
      }
    };
    
    if (presets[preset]) {
      this.preferences = { ...this.preferences, ...presets[preset] };
      this.savePreferences();
      this.applyPreferences();
      this.showToast(`${preset} 프리셋 적용됨`);
    }
  }
}

// Initialize on page load
let layoutPreferencesManager;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    layoutPreferencesManager = new LayoutPreferencesManager();
  });
} else {
  layoutPreferencesManager = new LayoutPreferencesManager();
}
