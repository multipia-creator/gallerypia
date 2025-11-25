/**
 * GalleryPia - Bulk Actions Utilities
 * 
 * Client-side JavaScript for bulk selection and actions
 * Works with any list/grid of selectable items
 * 
 * Features:
 * - Multi-select with checkboxes
 * - Select all / deselect all
 * - Shift-click range selection
 * - Bulk action toolbar
 * - Action confirmation
 * - Progress tracking for bulk operations
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

class BulkActions {
  constructor(options) {
    this.containerId = options.containerId;
    this.itemSelector = options.itemSelector || '.selectable-item';
    this.checkboxSelector = options.checkboxSelector || '.bulk-checkbox';
    this.onSelectionChange = options.onSelectionChange || (() => {});
    this.onBulkAction = options.onBulkAction || (() => {});
    
    this.selectedItems = new Set();
    this.lastCheckedIndex = null;
    this.isShiftPressed = false;
    
    this.init();
  }
  
  init() {
    this.attachEvents();
    this.createToolbar();
    this.updateToolbar();
    
    console.log(`Bulk actions initialized for: ${this.containerId}`);
  }
  
  attachEvents() {
    const container = document.getElementById(this.containerId);
    if (!container) return;
    
    // Checkbox change events
    container.addEventListener('change', (e) => {
      if (e.target.matches(this.checkboxSelector)) {
        this.handleCheckboxChange(e);
      }
    });
    
    // Select all checkbox
    const selectAllCheckbox = document.getElementById(`${this.containerId}-select-all`);
    if (selectAllCheckbox) {
      selectAllCheckbox.addEventListener('change', (e) => {
        this.handleSelectAll(e.target.checked);
      });
    }
    
    // Track shift key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = true;
      }
    });
    
    document.addEventListener('keyup', (e) => {
      if (e.key === 'Shift') {
        this.isShiftPressed = false;
      }
    });
  }
  
  handleCheckboxChange(event) {
    const checkbox = event.target;
    const itemId = checkbox.dataset.itemId;
    const itemIndex = parseInt(checkbox.dataset.itemIndex);
    
    if (checkbox.checked) {
      this.selectedItems.add(itemId);
    } else {
      this.selectedItems.delete(itemId);
    }
    
    // Handle shift-click range selection
    if (this.isShiftPressed && this.lastCheckedIndex !== null) {
      this.selectRange(this.lastCheckedIndex, itemIndex, checkbox.checked);
    }
    
    this.lastCheckedIndex = itemIndex;
    this.updateToolbar();
    this.updateSelectAllCheckbox();
    this.onSelectionChange(Array.from(this.selectedItems));
  }
  
  selectRange(startIndex, endIndex, checked) {
    const container = document.getElementById(this.containerId);
    const checkboxes = Array.from(container.querySelectorAll(this.checkboxSelector));
    
    const start = Math.min(startIndex, endIndex);
    const end = Math.max(startIndex, endIndex);
    
    for (let i = start; i <= end; i++) {
      const checkbox = checkboxes[i];
      if (checkbox) {
        checkbox.checked = checked;
        const itemId = checkbox.dataset.itemId;
        
        if (checked) {
          this.selectedItems.add(itemId);
        } else {
          this.selectedItems.delete(itemId);
        }
      }
    }
  }
  
  handleSelectAll(checked) {
    const container = document.getElementById(this.containerId);
    const checkboxes = container.querySelectorAll(this.checkboxSelector);
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = checked;
      const itemId = checkbox.dataset.itemId;
      
      if (checked) {
        this.selectedItems.add(itemId);
      } else {
        this.selectedItems.delete(itemId);
      }
    });
    
    this.updateToolbar();
    this.onSelectionChange(Array.from(this.selectedItems));
  }
  
  updateSelectAllCheckbox() {
    const selectAllCheckbox = document.getElementById(`${this.containerId}-select-all`);
    if (!selectAllCheckbox) return;
    
    const container = document.getElementById(this.containerId);
    const checkboxes = container.querySelectorAll(this.checkboxSelector);
    const checkedCount = container.querySelectorAll(`${this.checkboxSelector}:checked`).length;
    
    selectAllCheckbox.checked = checkedCount === checkboxes.length && checkboxes.length > 0;
    selectAllCheckbox.indeterminate = checkedCount > 0 && checkedCount < checkboxes.length;
  }
  
  createToolbar() {
    let toolbar = document.getElementById(`${this.containerId}-bulk-toolbar`);
    if (toolbar) return; // Already exists
    
    toolbar = document.createElement('div');
    toolbar.id = `${this.containerId}-bulk-toolbar`;
    toolbar.className = 'bulk-actions-toolbar fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-purple-500 rounded-xl shadow-2xl px-6 py-4 z-50 transition-all duration-300';
    toolbar.style.display = 'none';
    
    toolbar.innerHTML = `
      <div class="flex items-center gap-6">
        <div class="flex items-center gap-3">
          <span class="text-purple-400 font-semibold">
            <i class="fas fa-check-square mr-2"></i>
            <span id="${this.containerId}-selected-count">0</span>개 선택됨
          </span>
          <button 
            onclick="window.bulkActionsClear('${this.containerId}')"
            class="text-gray-400 hover:text-white transition-colors"
          >
            <i class="fas fa-times mr-1"></i>선택 해제
          </button>
        </div>
        
        <div class="h-8 w-px bg-gray-700"></div>
        
        <div class="flex items-center gap-2">
          <button 
            onclick="window.bulkActionsExecute('${this.containerId}', 'delete')"
            class="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i class="fas fa-trash"></i>
            <span>삭제</span>
          </button>
          
          <button 
            onclick="window.bulkActionsExecute('${this.containerId}', 'export')"
            class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i class="fas fa-download"></i>
            <span>내보내기</span>
          </button>
          
          <button 
            onclick="window.bulkActionsExecute('${this.containerId}', 'archive')"
            class="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i class="fas fa-archive"></i>
            <span>보관</span>
          </button>
          
          <button 
            onclick="window.bulkActionsExecute('${this.containerId}', 'share')"
            class="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors flex items-center gap-2"
          >
            <i class="fas fa-share"></i>
            <span>공유</span>
          </button>
        </div>
      </div>
    `;
    
    document.body.appendChild(toolbar);
  }
  
  updateToolbar() {
    const toolbar = document.getElementById(`${this.containerId}-bulk-toolbar`);
    const countElement = document.getElementById(`${this.containerId}-selected-count`);
    
    if (toolbar && countElement) {
      const count = this.selectedItems.size;
      countElement.textContent = count;
      
      if (count > 0) {
        toolbar.style.display = 'block';
        toolbar.style.opacity = '0';
        toolbar.style.transform = 'translate(-50%, 20px)';
        
        // Animate in
        setTimeout(() => {
          toolbar.style.opacity = '1';
          toolbar.style.transform = 'translate(-50%, 0)';
        }, 10);
      } else {
        toolbar.style.opacity = '0';
        toolbar.style.transform = 'translate(-50%, 20px)';
        
        setTimeout(() => {
          toolbar.style.display = 'none';
        }, 300);
      }
    }
  }
  
  clearSelection() {
    this.selectedItems.clear();
    
    const container = document.getElementById(this.containerId);
    const checkboxes = container.querySelectorAll(this.checkboxSelector);
    checkboxes.forEach(checkbox => {
      checkbox.checked = false;
    });
    
    this.updateToolbar();
    this.updateSelectAllCheckbox();
    this.onSelectionChange([]);
  }
  
  async executeAction(action) {
    const selectedIds = Array.from(this.selectedItems);
    
    if (selectedIds.length === 0) {
      alert('선택된 항목이 없습니다.');
      return;
    }
    
    // Confirmation for destructive actions
    if (action === 'delete') {
      const confirmed = await this.confirmAction(
        `${selectedIds.length}개 항목을 삭제하시겠습니까?`,
        '삭제된 항목은 복구할 수 없습니다.'
      );
      
      if (!confirmed) return;
    }
    
    // Show progress
    const progressBar = this.showProgress();
    
    try {
      // Execute action via callback
      await this.onBulkAction(action, selectedIds, (progress) => {
        this.updateProgress(progressBar, progress);
      });
      
      this.hideProgress(progressBar);
      this.clearSelection();
      
      // Show success message
      this.showNotification(`${selectedIds.length}개 항목에 대한 작업이 완료되었습니다.`, 'success');
      
    } catch (error) {
      console.error('Bulk action error:', error);
      this.hideProgress(progressBar);
      this.showNotification('작업 중 오류가 발생했습니다.', 'error');
    }
  }
  
  async confirmAction(title, message) {
    // Use browser confirm for now, can be replaced with custom modal
    return confirm(`${title}\n\n${message}`);
  }
  
  showProgress() {
    const progressBar = document.createElement('div');
    progressBar.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[100]';
    progressBar.innerHTML = `
      <div class="bg-gray-800 rounded-xl p-8 max-w-md w-full">
        <h3 class="text-white text-xl font-bold mb-4">작업 진행 중...</h3>
        <div class="w-full bg-gray-700 rounded-full h-4 overflow-hidden">
          <div class="bulk-progress-bar bg-gradient-to-r from-purple-500 to-cyan-500 h-full transition-all duration-300" style="width: 0%"></div>
        </div>
        <p class="bulk-progress-text text-gray-400 text-sm mt-3">0%</p>
      </div>
    `;
    
    document.body.appendChild(progressBar);
    return progressBar;
  }
  
  updateProgress(progressBar, percent) {
    const bar = progressBar.querySelector('.bulk-progress-bar');
    const text = progressBar.querySelector('.bulk-progress-text');
    
    if (bar) bar.style.width = `${percent}%`;
    if (text) text.textContent = `${Math.round(percent)}%`;
  }
  
  hideProgress(progressBar) {
    setTimeout(() => {
      progressBar.remove();
    }, 500);
  }
  
  showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-[101] ${
      type === 'success' ? 'bg-green-600' : type === 'error' ? 'bg-red-600' : 'bg-blue-600'
    } text-white`;
    notification.innerHTML = `
      <div class="flex items-center gap-3">
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} text-xl"></i>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.style.opacity = '0';
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }
  
  getSelectedItems() {
    return Array.from(this.selectedItems);
  }
  
  getSelectedCount() {
    return this.selectedItems.size;
  }
}

// Global helper functions
window.bulkActionsClear = function(containerId) {
  const instance = window.__bulkActionsInstances?.[containerId];
  if (instance) {
    instance.clearSelection();
  }
};

window.bulkActionsExecute = function(containerId, action) {
  const instance = window.__bulkActionsInstances?.[containerId];
  if (instance) {
    instance.executeAction(action);
  }
};

window.initializeBulkActions = function(options) {
  const instance = new BulkActions(options);
  
  if (!window.__bulkActionsInstances) {
    window.__bulkActionsInstances = {};
  }
  
  window.__bulkActionsInstances[options.containerId] = instance;
  return instance;
};

// Auto-initialize on DOM load
document.addEventListener('DOMContentLoaded', function() {
  const containers = document.querySelectorAll('[data-bulk-actions]');
  
  containers.forEach(container => {
    const containerId = container.id;
    if (!containerId) return;
    
    window.initializeBulkActions({
      containerId,
      itemSelector: container.dataset.itemSelector || '.selectable-item',
      checkboxSelector: container.dataset.checkboxSelector || '.bulk-checkbox'
    });
  });
  
  console.log(`Auto-initialized ${containers.length} bulk action containers`);
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { BulkActions };
}
