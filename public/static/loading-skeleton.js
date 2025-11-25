/**
 * GalleryPia - Loading Skeleton System
 * Beautiful loading placeholders for better UX
 */

class LoadingSkeleton {
  constructor() {
    this.skeletonTypes = {
      artworkCard: this.createArtworkCardSkeleton.bind(this),
      artworkGrid: this.createArtworkGridSkeleton.bind(this),
      artistCard: this.createArtistCardSkeleton.bind(this),
      dashboardStats: this.createDashboardStatsSkeleton.bind(this),
      table: this.createTableSkeleton.bind(this),
      profile: this.createProfileSkeleton.bind(this),
      detail: this.createDetailSkeleton.bind(this)
    };
  }

  // Show skeleton in container
  show(containerId, type, count = 1) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const skeletonFunction = this.skeletonTypes[type];
    if (!skeletonFunction) {
      console.warn(`Unknown skeleton type: ${type}`);
      return;
    }

    container.innerHTML = '';
    for (let i = 0; i < count; i++) {
      container.innerHTML += skeletonFunction();
    }
  }

  // Hide skeleton and show content
  hide(containerId, content) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = content;
  }

  createArtworkCardSkeleton() {
    return `
      <div class="bg-white rounded-lg overflow-hidden shadow-md animate-pulse">
        <!-- Image skeleton -->
        <div class="w-full h-48 bg-gray-200"></div>
        
        <!-- Content skeleton -->
        <div class="p-4 space-y-3">
          <!-- Title -->
          <div class="h-5 bg-gray-200 rounded w-3/4"></div>
          
          <!-- Artist -->
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          
          <!-- Price -->
          <div class="flex items-center justify-between mt-4">
            <div class="h-6 bg-gray-200 rounded w-1/3"></div>
            <div class="h-8 w-8 bg-gray-200 rounded-full"></div>
          </div>
        </div>
      </div>
    `;
  }

  createArtworkGridSkeleton() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        ${Array(8).fill(this.createArtworkCardSkeleton()).join('')}
      </div>
    `;
  }

  createArtistCardSkeleton() {
    return `
      <div class="bg-white rounded-lg p-6 animate-pulse">
        <div class="flex items-center space-x-4">
          <!-- Avatar -->
          <div class="w-16 h-16 bg-gray-200 rounded-full flex-shrink-0"></div>
          
          <!-- Info -->
          <div class="flex-1 space-y-2">
            <div class="h-5 bg-gray-200 rounded w-1/2"></div>
            <div class="h-4 bg-gray-200 rounded w-3/4"></div>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-3 gap-4 mt-4">
          <div>
            <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
          <div>
            <div class="h-4 bg-gray-200 rounded w-full mb-1"></div>
            <div class="h-6 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    `;
  }

  createDashboardStatsSkeleton() {
    return `
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        ${Array(4).fill(`
          <div class="bg-white rounded-lg p-6 animate-pulse">
            <div class="flex items-center justify-between">
              <div class="flex-1">
                <div class="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div class="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
              <div class="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  createTableSkeleton() {
    return `
      <div class="bg-white rounded-lg overflow-hidden">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              ${Array(5).fill(`
                <th class="px-6 py-3">
                  <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            ${Array(5).fill(`
              <tr>
                ${Array(5).fill(`
                  <td class="px-6 py-4">
                    <div class="h-4 bg-gray-200 rounded animate-pulse"></div>
                  </td>
                `).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;
  }

  createProfileSkeleton() {
    return `
      <div class="bg-white rounded-lg p-6 animate-pulse">
        <!-- Cover -->
        <div class="h-32 bg-gray-200 rounded-t-lg -m-6 mb-0"></div>
        
        <!-- Avatar -->
        <div class="flex items-end -mt-16 px-6">
          <div class="w-32 h-32 bg-gray-300 rounded-full border-4 border-white"></div>
        </div>
        
        <!-- Info -->
        <div class="mt-4 space-y-3">
          <div class="h-6 bg-gray-200 rounded w-1/3"></div>
          <div class="h-4 bg-gray-200 rounded w-1/2"></div>
          <div class="h-4 bg-gray-200 rounded w-2/3"></div>
          
          <!-- Stats -->
          <div class="flex space-x-6 mt-4">
            ${Array(4).fill(`
              <div>
                <div class="h-4 bg-gray-200 rounded w-16 mb-1"></div>
                <div class="h-6 bg-gray-200 rounded w-12"></div>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    `;
  }

  createDetailSkeleton() {
    return `
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-pulse">
        <!-- Image -->
        <div>
          <div class="w-full aspect-square bg-gray-200 rounded-lg"></div>
          <div class="grid grid-cols-4 gap-2 mt-4">
            ${Array(4).fill('<div class="aspect-square bg-gray-200 rounded"></div>').join('')}
          </div>
        </div>
        
        <!-- Info -->
        <div class="space-y-6">
          <!-- Title -->
          <div>
            <div class="h-8 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div class="h-5 bg-gray-200 rounded w-1/2"></div>
          </div>
          
          <!-- Price -->
          <div class="h-10 bg-gray-200 rounded w-1/3"></div>
          
          <!-- Description -->
          <div class="space-y-2">
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded"></div>
            <div class="h-4 bg-gray-200 rounded w-5/6"></div>
          </div>
          
          <!-- Specs -->
          <div class="grid grid-cols-2 gap-4">
            ${Array(6).fill(`
              <div>
                <div class="h-3 bg-gray-200 rounded w-1/2 mb-1"></div>
                <div class="h-5 bg-gray-200 rounded"></div>
              </div>
            `).join('')}
          </div>
          
          <!-- Buttons -->
          <div class="flex space-x-4">
            <div class="h-12 bg-gray-200 rounded flex-1"></div>
            <div class="h-12 w-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    `;
  }

  // Pulse animation for single element
  pulse(element) {
    if (typeof element === 'string') {
      element = document.querySelector(element);
    }
    
    if (!element) return;
    
    element.classList.add('animate-pulse');
    setTimeout(() => {
      element.classList.remove('animate-pulse');
    }, 1000);
  }

  // Create inline skeleton for any element
  createInlineSkeleton(width = '100%', height = '1rem', className = '') {
    return `<div class="bg-gray-200 rounded animate-pulse ${className}" style="width: ${width}; height: ${height}"></div>`;
  }
}

// Initialize
window.loadingSkeleton = new LoadingSkeleton();

// Helper function for easy use
window.showSkeleton = function(containerId, type, count) {
  window.loadingSkeleton.show(containerId, type, count);
};

window.hideSkeleton = function(containerId, content) {
  window.loadingSkeleton.hide(containerId, content);
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = LoadingSkeleton;
}
