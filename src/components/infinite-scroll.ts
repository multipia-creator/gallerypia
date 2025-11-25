/**
 * GalleryPia - Infinite Scroll Component
 * 
 * TypeScript component for infinite scroll functionality
 * Server-side rendering support with Cloudflare Pages
 * 
 * Features:
 * - Intersection Observer API for scroll detection
 * - Configurable threshold and root margin
 * - Loading states and error handling
 * - Debounced scroll events
 * - Manual trigger support
 * - End of content detection
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

export interface InfiniteScrollProps {
  containerId: string;
  loadingText?: string;
  endText?: string;
  errorText?: string;
  threshold?: number;
  rootMargin?: string;
  showLoader?: boolean;
}

/**
 * Render infinite scroll container with trigger element
 */
export function renderInfiniteScrollContainer(props: InfiniteScrollProps): string {
  const {
    containerId,
    loadingText = '로딩 중...',
    endText = '모든 항목을 불러왔습니다',
    errorText = '오류가 발생했습니다. 다시 시도해주세요.',
    showLoader = true
  } = props;

  return `
    <div 
      id="${containerId}" 
      class="infinite-scroll-container"
      data-loading-text="${loadingText}"
      data-end-text="${endText}"
      data-error-text="${errorText}"
    >
      <!-- Content will be inserted here -->
      <div id="${containerId}-content" class="infinite-scroll-content">
        <!-- Dynamic content -->
      </div>
      
      ${showLoader ? `
        <!-- Scroll trigger element -->
        <div 
          id="${containerId}-trigger" 
          class="infinite-scroll-trigger"
          style="height: 100px; margin: 2rem 0;"
        >
          <div class="infinite-scroll-loader" style="display: none;">
            <div class="flex items-center justify-center gap-3">
              <svg class="animate-spin h-6 w-6 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span class="text-gray-400">${loadingText}</span>
            </div>
          </div>
          
          <div class="infinite-scroll-end" style="display: none;">
            <div class="text-center text-gray-500 py-4">
              <i class="fas fa-check-circle text-green-500 text-2xl mb-2"></i>
              <p>${endText}</p>
            </div>
          </div>
          
          <div class="infinite-scroll-error" style="display: none;">
            <div class="text-center text-red-500 py-4">
              <i class="fas fa-exclamation-triangle text-2xl mb-2"></i>
              <p>${errorText}</p>
              <button 
                class="infinite-scroll-retry mt-3 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                onclick="retryInfiniteScroll('${containerId}')"
              >
                다시 시도
              </button>
            </div>
          </div>
        </div>
      ` : ''}
    </div>
  `;
}

/**
 * Render gallery grid with infinite scroll support
 */
export function renderInfiniteScrollGallery(props: {
  items: any[];
  containerId: string;
  renderCard: (item: any) => string;
  loadingText?: string;
  endText?: string;
}): string {
  const {
    items,
    containerId,
    renderCard,
    loadingText = '더 많은 작품을 불러오는 중...',
    endText = '모든 작품을 불러왔습니다'
  } = props;

  return `
    <div class="infinite-scroll-gallery">
      ${renderInfiniteScrollContainer({
        containerId,
        loadingText,
        endText,
        showLoader: true
      })}
    </div>
    
    <script>
      // Initialize gallery content
      (function() {
        const contentContainer = document.getElementById('${containerId}-content');
        if (!contentContainer) return;
        
        const items = ${JSON.stringify(items)};
        const renderCard = ${renderCard.toString()};
        
        // Create grid
        const grid = document.createElement('div');
        grid.className = 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6';
        
        // Render initial items
        items.forEach(item => {
          const cardHtml = renderCard(item);
          const cardDiv = document.createElement('div');
          cardDiv.innerHTML = cardHtml;
          grid.appendChild(cardDiv.firstElementChild);
        });
        
        contentContainer.appendChild(grid);
      })();
    </script>
  `;
}

/**
 * Render artwork card for gallery (compatible with existing system)
 */
export function renderArtworkCard(artwork: any): string {
  return `
    <div class="artwork-card bg-gray-800 rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
      <div class="relative aspect-square overflow-hidden">
        <img 
          src="${artwork.image_url || '/static/placeholder.jpg'}" 
          alt="${artwork.title}"
          class="w-full h-full object-cover hover:scale-110 transition-transform duration-500"
          loading="lazy"
        />
        ${artwork.nft_minted ? `
          <span class="absolute top-3 right-3 px-3 py-1 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-xs font-bold">
            NFT
          </span>
        ` : ''}
      </div>
      
      <div class="p-4">
        <h3 class="font-bold text-lg mb-2 text-white truncate">${artwork.title}</h3>
        <p class="text-gray-400 text-sm mb-3">${artwork.artist_name || '알 수 없음'}</p>
        
        <div class="flex items-center justify-between">
          <div class="text-sm">
            <span class="text-gray-500">가격</span>
            <p class="text-purple-400 font-bold">${(artwork.price_krw / 10000).toFixed(0)}만원</p>
          </div>
          
          <div class="flex items-center gap-3 text-gray-500 text-sm">
            <span><i class="far fa-eye"></i> ${artwork.views_count || 0}</span>
            <span><i class="far fa-heart"></i> ${artwork.likes_count || 0}</span>
          </div>
        </div>
        
        <a 
          href="/artwork/${artwork.id}" 
          class="mt-4 block w-full py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white text-center rounded-lg hover:from-purple-700 hover:to-cyan-700 transition-all"
        >
          상세보기
        </a>
      </div>
    </div>
  `;
}

/**
 * Render list view with infinite scroll
 */
export function renderInfiniteScrollList(props: {
  items: any[];
  containerId: string;
  renderRow: (item: any) => string;
  loadingText?: string;
}): string {
  const {
    items,
    containerId,
    renderRow,
    loadingText = '더 많은 항목을 불러오는 중...'
  } = props;

  return `
    ${renderInfiniteScrollContainer({
      containerId,
      loadingText,
      showLoader: true
    })}
    
    <script>
      (function() {
        const contentContainer = document.getElementById('${containerId}-content');
        if (!contentContainer) return;
        
        const items = ${JSON.stringify(items)};
        const renderRow = ${renderRow.toString()};
        
        // Create list
        const list = document.createElement('div');
        list.className = 'space-y-4';
        
        // Render initial items
        items.forEach(item => {
          const rowHtml = renderRow(item);
          const rowDiv = document.createElement('div');
          rowDiv.innerHTML = rowHtml;
          list.appendChild(rowDiv.firstElementChild);
        });
        
        contentContainer.appendChild(list);
      })();
    </script>
  `;
}

/**
 * Render infinite scroll with custom content renderer
 */
export function renderInfiniteScrollCustom(props: {
  containerId: string;
  initialContent: string;
  loadingText?: string;
  endText?: string;
  threshold?: number;
  rootMargin?: string;
}): string {
  const {
    containerId,
    initialContent,
    loadingText = '로딩 중...',
    endText = '끝',
    threshold = 0.1,
    rootMargin = '100px'
  } = props;

  return `
    <div 
      id="${containerId}"
      class="infinite-scroll-container"
      data-threshold="${threshold}"
      data-root-margin="${rootMargin}"
    >
      <div id="${containerId}-content" class="infinite-scroll-content">
        ${initialContent}
      </div>
      
      <div id="${containerId}-trigger" class="infinite-scroll-trigger">
        <div class="infinite-scroll-loader" style="display: none;">
          <div class="flex items-center justify-center gap-3 py-8">
            <svg class="animate-spin h-8 w-8 text-purple-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span class="text-gray-300 text-lg">${loadingText}</span>
          </div>
        </div>
        
        <div class="infinite-scroll-end" style="display: none;">
          <div class="text-center text-gray-400 py-8">
            <i class="fas fa-flag-checkered text-3xl mb-3"></i>
            <p class="text-lg">${endText}</p>
          </div>
        </div>
        
        <div class="infinite-scroll-error" style="display: none;">
          <div class="text-center text-red-400 py-8">
            <i class="fas fa-exclamation-circle text-3xl mb-3"></i>
            <p class="text-lg mb-4">데이터를 불러오는 중 오류가 발생했습니다</p>
            <button 
              class="infinite-scroll-retry px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-semibold"
              onclick="retryInfiniteScroll('${containerId}')"
            >
              <i class="fas fa-redo mr-2"></i>다시 시도
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

// Export types for external use
export type InfiniteScrollState = 'idle' | 'loading' | 'end' | 'error';

export interface InfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  debounceDelay?: number;
  initialPage?: number;
  pageSize?: number;
}
