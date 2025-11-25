/**
 * Dashboard Customizer
 * Drag-and-drop dashboard widget customization
 * Phase 6.4 - Low Priority UX (UX-L-026: Customizable Dashboard)
 */

class DashboardCustomizer {
  constructor() {
    this.widgets = this.loadWidgets();
    this.draggedWidget = null;
    this.availableWidgets = this.getAvailableWidgets();
    
    this.init();
  }

  init() {
    console.log('📊 Dashboard Customizer initialized');
    
    // Enable drag-and-drop
    this.enableDragAndDrop();
    
    // Render dashboard
    this.renderDashboard();
  }

  // ===== Data Management =====
  
  loadWidgets() {
    const data = localStorage.getItem('gallerypia_dashboard_widgets');
    return data ? JSON.parse(data) : this.getDefaultWidgets();
  }

  saveWidgets() {
    localStorage.setItem('gallerypia_dashboard_widgets', JSON.stringify(this.widgets));
    this.dispatchEvent('dashboard-widgets-changed', { widgets: this.widgets });
  }

  getDefaultWidgets() {
    return [
      { id: 'stats', type: 'stats', position: 0, size: 'large', visible: true },
      { id: 'recent', type: 'recent-artworks', position: 1, size: 'medium', visible: true },
      { id: 'popular', type: 'popular-artworks', position: 2, size: 'medium', visible: true },
      { id: 'activity', type: 'activity-feed', position: 3, size: 'small', visible: true }
    ];
  }

  getAvailableWidgets() {
    return [
      { type: 'stats', name: '통계 요약', icon: 'fa-chart-bar', sizes: ['large'] },
      { type: 'recent-artworks', name: '최근 작품', icon: 'fa-clock', sizes: ['small', 'medium', 'large'] },
      { type: 'popular-artworks', name: '인기 작품', icon: 'fa-fire', sizes: ['small', 'medium', 'large'] },
      { type: 'activity-feed', name: '활동 피드', icon: 'fa-stream', sizes: ['small', 'medium'] },
      { type: 'recommendations', name: '추천 작품', icon: 'fa-star', sizes: ['medium', 'large'] },
      { type: 'collections', name: '내 컬렉션', icon: 'fa-folder', sizes: ['small', 'medium'] },
      { type: 'favorites', name: '즐겨찾기', icon: 'fa-heart', sizes: ['small', 'medium'] },
      { type: 'analytics', name: '분석', icon: 'fa-chart-line', sizes: ['large'] },
      { type: 'calendar', name: '일정', icon: 'fa-calendar', sizes: ['medium'] },
      { type: 'messages', name: '메시지', icon: 'fa-envelope', sizes: ['small', 'medium'] }
    ];
  }

  // ===== Widget Management =====
  
  addWidget(type) {
    const widgetInfo = this.availableWidgets.find(w => w.type === type);
    if (!widgetInfo) return;
    
    const widget = {
      id: `${type}_${Date.now()}`,
      type,
      position: this.widgets.length,
      size: widgetInfo.sizes[0], // Default to first available size
      visible: true
    };
    
    this.widgets.push(widget);
    this.saveWidgets();
    this.renderDashboard();
    
    this.showToast(`${widgetInfo.name} 위젯 추가됨`);
  }

  removeWidget(widgetId) {
    const index = this.widgets.findIndex(w => w.id === widgetId);
    if (index === -1) return;
    
    if (confirm('이 위젯을 제거하시겠습니까?')) {
      this.widgets.splice(index, 1);
      this.reorderWidgets();
      this.saveWidgets();
      this.renderDashboard();
      this.showToast('위젯 제거됨');
    }
  }

  toggleWidget(widgetId) {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    widget.visible = !widget.visible;
    this.saveWidgets();
    this.renderDashboard();
  }

  resizeWidget(widgetId, newSize) {
    const widget = this.widgets.find(w => w.id === widgetId);
    if (!widget) return;
    
    const widgetInfo = this.availableWidgets.find(w => w.type === widget.type);
    if (!widgetInfo || !widgetInfo.sizes.includes(newSize)) return;
    
    widget.size = newSize;
    this.saveWidgets();
    this.renderDashboard();
  }

  moveWidget(fromIndex, toIndex) {
    const [widget] = this.widgets.splice(fromIndex, 1);
    this.widgets.splice(toIndex, 0, widget);
    this.reorderWidgets();
    this.saveWidgets();
    this.renderDashboard();
  }

  reorderWidgets() {
    this.widgets.forEach((widget, index) => {
      widget.position = index;
    });
  }

  // ===== Drag and Drop =====
  
  enableDragAndDrop() {
    document.addEventListener('dragstart', (e) => {
      const widget = e.target.closest('[data-widget-draggable="true"]');
      if (!widget) return;
      
      this.draggedWidget = {
        element: widget,
        id: widget.dataset.widgetId,
        position: parseInt(widget.dataset.widgetPosition)
      };
      
      widget.classList.add('opacity-50', 'scale-95');
      e.dataTransfer.effectAllowed = 'move';
    });

    document.addEventListener('dragend', (e) => {
      if (this.draggedWidget) {
        this.draggedWidget.element.classList.remove('opacity-50', 'scale-95');
        this.draggedWidget = null;
      }
      
      document.querySelectorAll('.drop-zone-active').forEach(el => {
        el.classList.remove('drop-zone-active');
      });
    });

    document.addEventListener('dragover', (e) => {
      e.preventDefault();
      
      const dropTarget = e.target.closest('[data-widget-drop-zone="true"]');
      if (!dropTarget || !this.draggedWidget) return;
      
      dropTarget.classList.add('drop-zone-active');
      e.dataTransfer.dropEffect = 'move';
    });

    document.addEventListener('dragleave', (e) => {
      const dropTarget = e.target.closest('[data-widget-drop-zone="true"]');
      if (dropTarget) {
        dropTarget.classList.remove('drop-zone-active');
      }
    });

    document.addEventListener('drop', (e) => {
      e.preventDefault();
      
      const dropTarget = e.target.closest('[data-widget-drop-zone="true"]');
      if (!dropTarget || !this.draggedWidget) return;
      
      dropTarget.classList.remove('drop-zone-active');
      
      const toPosition = parseInt(dropTarget.dataset.widgetPosition);
      
      if (toPosition !== this.draggedWidget.position) {
        this.moveWidget(this.draggedWidget.position, toPosition);
      }
    });
  }

  // ===== Rendering =====
  
  renderDashboard(containerId = 'dashboard-container') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const visibleWidgets = this.widgets.filter(w => w.visible);
    
    container.innerHTML = `
      <div class="dashboard-grid">
        ${visibleWidgets.map(widget => this.renderWidget(widget)).join('')}
      </div>
    `;
  }

  renderWidget(widget) {
    const widgetInfo = this.availableWidgets.find(w => w.type === widget.type);
    if (!widgetInfo) return '';
    
    const sizeClasses = {
      small: 'col-span-1',
      medium: 'col-span-2',
      large: 'col-span-3'
    };
    
    return `
      <div class="dashboard-widget ${sizeClasses[widget.size]} bg-white rounded-lg shadow-md p-6 transition-all hover:shadow-xl"
           data-widget-id="${widget.id}"
           data-widget-position="${widget.position}"
           data-widget-draggable="true"
           data-widget-drop-zone="true"
           draggable="true">
        <div class="widget-header flex justify-between items-center mb-4">
          <h3 class="text-lg font-bold text-gray-800 flex items-center">
            <i class="fas ${widgetInfo.icon} mr-2 text-indigo-600"></i>
            ${widgetInfo.name}
          </h3>
          <div class="widget-actions flex gap-2">
            ${this.renderWidgetActions(widget, widgetInfo)}
          </div>
        </div>
        <div class="widget-content">
          ${this.renderWidgetContent(widget)}
        </div>
      </div>
    `;
  }

  renderWidgetActions(widget, widgetInfo) {
    const sizeButtons = widgetInfo.sizes.length > 1 ? `
      <div class="relative group">
        <button class="text-gray-400 hover:text-indigo-600">
          <i class="fas fa-expand-alt"></i>
        </button>
        <div class="hidden group-hover:block absolute right-0 mt-2 bg-white rounded shadow-lg p-2 z-10">
          ${widgetInfo.sizes.map(size => `
            <button onclick="dashboardCustomizer.resizeWidget('${widget.id}', '${size}')"
                    class="block px-4 py-2 text-sm hover:bg-gray-100 ${widget.size === size ? 'text-indigo-600 font-bold' : 'text-gray-700'}">
              ${size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
            </button>
          `).join('')}
        </div>
      </div>
    ` : '';
    
    return `
      <button onclick="dashboardCustomizer.toggleWidget('${widget.id}')"
              class="text-gray-400 hover:text-indigo-600">
        <i class="fas fa-eye${widget.visible ? '' : '-slash'}"></i>
      </button>
      ${sizeButtons}
      <button onclick="dashboardCustomizer.removeWidget('${widget.id}')"
              class="text-gray-400 hover:text-red-600">
        <i class="fas fa-times"></i>
      </button>
      <button class="text-gray-400 hover:text-indigo-600 cursor-move">
        <i class="fas fa-grip-vertical"></i>
      </button>
    `;
  }

  renderWidgetContent(widget) {
    // Widget content would be loaded dynamically or rendered based on type
    const placeholders = {
      'stats': '<div class="grid grid-cols-3 gap-4"><div class="text-center"><div class="text-3xl font-bold text-indigo-600">245</div><div class="text-sm text-gray-600">작품</div></div><div class="text-center"><div class="text-3xl font-bold text-green-600">18</div><div class="text-sm text-gray-600">컬렉션</div></div><div class="text-center"><div class="text-3xl font-bold text-yellow-600">1.2k</div><div class="text-sm text-gray-600">조회수</div></div></div>',
      'recent-artworks': '<div class="space-y-2"><div class="flex gap-2"><img src="/static/placeholder.jpg" class="w-16 h-16 object-cover rounded"><div><div class="font-semibold">작품명</div><div class="text-sm text-gray-600">작가명</div></div></div></div>',
      'popular-artworks': '<div class="space-y-2"><div class="flex gap-2"><img src="/static/placeholder.jpg" class="w-16 h-16 object-cover rounded"><div><div class="font-semibold">인기 작품</div><div class="text-sm text-gray-600">조회수: 1234</div></div></div></div>',
      'activity-feed': '<div class="space-y-2"><div class="text-sm"><span class="font-semibold">홍길동</span>님이 작품을 좋아합니다</div><div class="text-sm"><span class="font-semibold">김철수</span>님이 댓글을 남겼습니다</div></div>',
      'recommendations': '<div class="text-center py-8 text-gray-500">추천 작품 로딩 중...</div>',
      'collections': '<div class="text-center py-8 text-gray-500">컬렉션 로딩 중...</div>',
      'favorites': '<div class="text-center py-8 text-gray-500">즐겨찾기 로딩 중...</div>',
      'analytics': '<div class="text-center py-8 text-gray-500">분석 데이터 로딩 중...</div>',
      'calendar': '<div class="text-center py-8 text-gray-500">일정 로딩 중...</div>',
      'messages': '<div class="text-center py-8 text-gray-500">메시지 로딩 중...</div>'
    };
    
    return placeholders[widget.type] || '<div class="text-center py-8 text-gray-500">위젯 로딩 중...</div>';
  }

  renderWidgetLibrary(containerId = 'widget-library') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    const activeTypes = this.widgets.map(w => w.type);
    
    container.innerHTML = `
      <div class="bg-white rounded-lg shadow-md p-6">
        <h3 class="text-xl font-bold text-gray-800 mb-4">위젯 라이브러리</h3>
        <div class="grid grid-cols-2 gap-4">
          ${this.availableWidgets.map(widget => `
            <button onclick="dashboardCustomizer.addWidget('${widget.type}')"
                    class="p-4 border rounded hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left ${activeTypes.includes(widget.type) ? 'opacity-50' : ''}"
                    ${activeTypes.includes(widget.type) ? 'disabled' : ''}>
              <i class="fas ${widget.icon} text-2xl text-indigo-600 mb-2"></i>
              <div class="font-semibold text-gray-800">${widget.name}</div>
              <div class="text-xs text-gray-500">사이즈: ${widget.sizes.join(', ')}</div>
            </button>
          `).join('')}
        </div>
        
        <div class="mt-6 pt-6 border-t">
          <button onclick="dashboardCustomizer.resetDashboard()"
                  class="w-full py-2 px-4 bg-gray-100 text-gray-700 rounded hover:bg-gray-200">
            <i class="fas fa-undo mr-2"></i>기본 대시보드로 초기화
          </button>
        </div>
      </div>
    `;
  }

  // ===== Utilities =====
  
  resetDashboard() {
    if (confirm('대시보드를 기본 설정으로 초기화하시겠습니까?')) {
      localStorage.removeItem('gallerypia_dashboard_widgets');
      this.widgets = this.loadWidgets();
      this.renderDashboard();
      this.showToast('대시보드가 초기화되었습니다');
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
}

// Add dashboard-specific CSS
const dashboardStyles = document.createElement('style');
dashboardStyles.textContent = `
  .dashboard-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1.5rem;
  }
  
  .dashboard-widget {
    transition: all 0.3s ease;
  }
  
  .dashboard-widget.drop-zone-active {
    border: 2px dashed #4F46E5;
    background-color: #EEF2FF;
  }
  
  @media (max-width: 1024px) {
    .dashboard-grid {
      grid-template-columns: repeat(2, 1fr);
    }
    .col-span-3 {
      grid-column: span 2;
    }
  }
  
  @media (max-width: 640px) {
    .dashboard-grid {
      grid-template-columns: 1fr;
    }
    .col-span-2, .col-span-3 {
      grid-column: span 1;
    }
  }
`;
document.head.appendChild(dashboardStyles);

// Initialize on page load
let dashboardCustomizer;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    dashboardCustomizer = new DashboardCustomizer();
  });
} else {
  dashboardCustomizer = new DashboardCustomizer();
}
