/**
 * Search Component Library for GalleryPia
 * 
 * Provides comprehensive search UI components with:
 * - Real-time search with debounce
 * - Loading indicators
 * - Result counts
 * - Clear button
 * - Recent searches
 * - Search suggestions
 * - Filter integration
 * 
 * Addresses UX-H-005: Add search feedback and loading indicators
 * 
 * Usage:
 * ```typescript
 * import { renderSearchBar, renderSearchResults } from './components/search'
 * 
 * // Basic search bar
 * const searchHtml = renderSearchBar({
 *   placeholder: '작품 검색...',
 *   onSearch: 'handleSearch',
 *   debounceMs: 300
 * });
 * 
 * // Search with filters
 * const advancedSearch = renderSearchBar({
 *   placeholder: '작가 또는 작품명 검색',
 *   onSearch: 'handleArtworkSearch',
 *   showFilters: true,
 *   filters: [
 *     { id: 'category', label: '카테고리', options: [...] },
 *     { id: 'price', label: '가격대', options: [...] }
 *   ]
 * });
 * ```
 */

export interface SearchBarProps {
  /** Placeholder text */
  placeholder?: string;
  
  /** Initial search value */
  value?: string;
  
  /** Search input name attribute */
  name?: string;
  
  /** Function name to call on search (client-side) */
  onSearch?: string;
  
  /** Debounce delay in milliseconds */
  debounceMs?: number;
  
  /** Show clear button */
  showClear?: boolean;
  
  /** Show search button */
  showSearchButton?: boolean;
  
  /** Enable autocomplete/suggestions */
  enableAutocomplete?: boolean;
  
  /** Show recent searches */
  showRecentSearches?: boolean;
  
  /** Maximum recent searches to show */
  maxRecentSearches?: number;
  
  /** Show filters dropdown */
  showFilters?: boolean;
  
  /** Filter options */
  filters?: SearchFilter[];
  
  /** Additional CSS classes */
  className?: string;
  
  /** Search bar size */
  size?: 'sm' | 'md' | 'lg';
  
  /** Full width */
  fullWidth?: boolean;
  
  /** Auto focus on mount */
  autoFocus?: boolean;
  
  /** Minimum characters before search */
  minChars?: number;
}

export interface SearchFilter {
  id: string;
  label: string;
  options: Array<{
    value: string;
    label: string;
  }>;
}

export interface SearchResultsProps {
  /** Search query */
  query: string;
  
  /** Total result count */
  totalResults: number;
  
  /** Current page results */
  results: any[];
  
  /** Render function for each result item */
  renderItem: (item: any) => string;
  
  /** Show loading state */
  isLoading?: boolean;
  
  /** Show empty state */
  isEmpty?: boolean;
  
  /** Empty state message */
  emptyMessage?: string;
  
  /** Show pagination */
  showPagination?: boolean;
  
  /** Current page */
  currentPage?: number;
  
  /** Total pages */
  totalPages?: number;
  
  /** Results per page */
  perPage?: number;
}

// =============================================================================
// Search Bar Component
// =============================================================================

/**
 * Render search bar with real-time feedback
 */
export function renderSearchBar(props: SearchBarProps): string {
  const {
    placeholder = '검색...',
    value = '',
    name = 'q',
    onSearch = 'handleSearch',
    debounceMs = 300,
    showClear = true,
    showSearchButton = false,
    enableAutocomplete = false,
    showRecentSearches = false,
    maxRecentSearches = 5,
    showFilters = false,
    filters = [],
    className = '',
    size = 'md',
    fullWidth = false,
    autoFocus = false,
    minChars = 2
  } = props;

  const sizeClasses = {
    sm: 'search-bar-sm',
    md: 'search-bar-md',
    lg: 'search-bar-lg'
  };

  const searchBarId = `search-bar-${Date.now()}`;
  const inputId = `search-input-${Date.now()}`;

  return `
    <div class="search-bar ${sizeClasses[size]} ${fullWidth ? 'w-full' : ''} ${className}" 
         id="${searchBarId}"
         data-debounce="${debounceMs}"
         data-on-search="${onSearch}"
         data-min-chars="${minChars}">
      
      <div class="search-bar-container">
        <!-- Search Icon -->
        <div class="search-icon">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
            <circle cx="8.5" cy="8.5" r="5.5" stroke-width="2"/>
            <path d="M12.5 12.5 L16 16" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </div>

        <!-- Search Input -->
        <input
          type="text"
          id="${inputId}"
          name="${name}"
          class="search-input"
          placeholder="${placeholder}"
          value="${value}"
          autocomplete="${enableAutocomplete ? 'on' : 'off'}"
          ${autoFocus ? 'autofocus' : ''}
          aria-label="${placeholder}"
        />

        <!-- Loading Indicator -->
        <div class="search-loading" style="display: none;">
          <svg class="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="3" stroke-opacity="0.25"/>
            <path fill="currentColor" d="M12 2a10 10 0 0 1 10 10h-3a7 7 0 0 0-7-7V2z"/>
          </svg>
        </div>

        <!-- Clear Button -->
        ${showClear ? `
          <button
            type="button"
            class="search-clear"
            style="display: none;"
            aria-label="검색어 지우기"
            onclick="clearSearch('${inputId}')">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <circle cx="10" cy="10" r="8" stroke-width="2"/>
              <path d="M7 7 L13 13 M13 7 L7 13" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        ` : ''}

        <!-- Search Button -->
        ${showSearchButton ? `
          <button
            type="submit"
            class="search-submit-btn"
            aria-label="검색">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <circle cx="8.5" cy="8.5" r="5.5" stroke-width="2"/>
              <path d="M12.5 12.5 L16 16" stroke-width="2" stroke-linecap="round"/>
            </svg>
          </button>
        ` : ''}

        <!-- Filters Toggle -->
        ${showFilters && filters.length > 0 ? `
          <button
            type="button"
            class="search-filters-toggle"
            onclick="toggleSearchFilters('${searchBarId}')"
            aria-label="필터 열기"
            aria-expanded="false">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor">
              <path d="M3 6h14M6 10h8M8 14h4" stroke-width="2" stroke-linecap="round"/>
            </svg>
            <span>필터</span>
          </button>
        ` : ''}
      </div>

      <!-- Recent Searches -->
      ${showRecentSearches ? `
        <div class="search-recent" id="${searchBarId}-recent" style="display: none;">
          <div class="search-recent-header">
            <span class="text-sm font-medium text-gray-600">최근 검색어</span>
            <button type="button" class="text-sm text-gray-500 hover:text-gray-700" onclick="clearRecentSearches('${searchBarId}')">
              모두 지우기
            </button>
          </div>
          <div class="search-recent-list" id="${searchBarId}-recent-list">
            <!-- Recent searches populated by JS -->
          </div>
        </div>
      ` : ''}

      <!-- Autocomplete Suggestions -->
      ${enableAutocomplete ? `
        <div class="search-suggestions" id="${searchBarId}-suggestions" style="display: none;">
          <div class="search-suggestions-list" id="${searchBarId}-suggestions-list">
            <!-- Suggestions populated by JS -->
          </div>
        </div>
      ` : ''}

      <!-- Filters Panel -->
      ${showFilters && filters.length > 0 ? `
        <div class="search-filters-panel" id="${searchBarId}-filters" style="display: none;">
          ${filters.map(filter => `
            <div class="search-filter-group">
              <label class="search-filter-label">${filter.label}</label>
              <select name="filter_${filter.id}" class="search-filter-select">
                <option value="">전체</option>
                ${filter.options.map(opt => `
                  <option value="${opt.value}">${opt.label}</option>
                `).join('')}
              </select>
            </div>
          `).join('')}
          
          <div class="search-filters-actions">
            <button type="button" class="btn btn-sm btn-secondary" onclick="resetSearchFilters('${searchBarId}')">
              초기화
            </button>
            <button type="button" class="btn btn-sm btn-primary" onclick="applySearchFilters('${searchBarId}')">
              적용
            </button>
          </div>
        </div>
      ` : ''}

      <!-- Results Count (populated by JS) -->
      <div class="search-results-count" id="${searchBarId}-count" style="display: none;">
        <span class="search-count-badge"></span>
      </div>
    </div>

    <script>
      // Initialize search bar on DOM load
      (function() {
        const searchBar = document.getElementById('${searchBarId}');
        const searchInput = document.getElementById('${inputId}');
        const clearBtn = searchBar.querySelector('.search-clear');
        const loadingIndicator = searchBar.querySelector('.search-loading');
        
        let debounceTimer;
        let lastSearchValue = '';

        // Setup input event listeners
        searchInput.addEventListener('input', function(e) {
          const value = e.target.value.trim();
          
          // Show/hide clear button
          if (clearBtn) {
            clearBtn.style.display = value ? 'block' : 'none';
          }

          // Debounced search
          clearTimeout(debounceTimer);
          
          if (value.length >= ${minChars} && value !== lastSearchValue) {
            // Show loading indicator
            if (loadingIndicator) {
              loadingIndicator.style.display = 'block';
            }

            debounceTimer = setTimeout(() => {
              lastSearchValue = value;
              
              // Call search handler
              if (typeof window['${onSearch}'] === 'function') {
                window['${onSearch}'](value);
              }
            }, ${debounceMs});
          } else if (value.length === 0) {
            // Clear results
            if (loadingIndicator) {
              loadingIndicator.style.display = 'none';
            }
            if (typeof window['${onSearch}'] === 'function') {
              window['${onSearch}']('');
            }
          }
        });

        // Handle Enter key
        searchInput.addEventListener('keydown', function(e) {
          if (e.key === 'Enter') {
            e.preventDefault();
            clearTimeout(debounceTimer);
            
            const value = e.target.value.trim();
            if (value.length >= ${minChars}) {
              if (typeof window['${onSearch}'] === 'function') {
                window['${onSearch}'](value);
              }
            }
          }
        });

        // Load recent searches if enabled
        ${showRecentSearches ? `
          loadRecentSearches('${searchBarId}', ${maxRecentSearches});
          
          // Show recent searches on focus
          searchInput.addEventListener('focus', function() {
            const recentPanel = document.getElementById('${searchBarId}-recent');
            if (recentPanel && !this.value) {
              recentPanel.style.display = 'block';
            }
          });
        ` : ''}

        // Hide suggestions/recent on outside click
        document.addEventListener('click', function(e) {
          if (!searchBar.contains(e.target)) {
            const recentPanel = document.getElementById('${searchBarId}-recent');
            const suggestionsPanel = document.getElementById('${searchBarId}-suggestions');
            if (recentPanel) recentPanel.style.display = 'none';
            if (suggestionsPanel) suggestionsPanel.style.display = 'none';
          }
        });
      })();
    </script>
  `;
}

// =============================================================================
// Search Results Component
// =============================================================================

/**
 * Render search results with loading/empty states
 */
export function renderSearchResults(props: SearchResultsProps): string {
  const {
    query,
    totalResults,
    results,
    renderItem,
    isLoading = false,
    isEmpty = false,
    emptyMessage = '검색 결과가 없습니다.',
    showPagination = false,
    currentPage = 1,
    totalPages = 1,
    perPage = 20
  } = props;

  // Loading state
  if (isLoading) {
    return `
      <div class="search-results-container">
        <div class="search-results-header">
          <div class="skeleton skeleton-text" style="width: 200px; height: 24px;"></div>
        </div>
        <div class="search-results-grid">
          ${Array(perPage).fill(0).map(() => `
            <div class="card-skeleton">
              <div class="skeleton skeleton-image" style="height: 200px;"></div>
              <div class="skeleton skeleton-text" style="width: 80%; height: 20px; margin-top: 12px;"></div>
              <div class="skeleton skeleton-text" style="width: 60%; height: 16px; margin-top: 8px;"></div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  // Empty state
  if (isEmpty || results.length === 0) {
    return `
      <div class="search-results-container">
        <div class="search-results-empty">
          <svg width="64" height="64" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="28" cy="28" r="18"/>
            <path d="M42 42 L54 54" stroke-linecap="round"/>
            <circle cx="28" cy="28" r="8" fill="none" stroke-dasharray="2 2"/>
          </svg>
          <h3>${emptyMessage}</h3>
          ${query ? `<p><strong>"${query}"</strong>에 대한 검색 결과가 없습니다.</p>` : ''}
          <p class="text-gray-500 mt-2">다른 검색어를 시도해보세요.</p>
        </div>
      </div>
    `;
  }

  // Results display
  return `
    <div class="search-results-container">
      <!-- Results Header -->
      <div class="search-results-header">
        <h3 class="search-results-title">
          ${query ? `"<strong>${query}</strong>"에 대한 ` : ''}
          검색 결과 <span class="search-results-count-badge">${totalResults.toLocaleString()}</span>개
        </h3>
        
        <!-- Sort/Filter Options -->
        <div class="search-results-controls">
          <select class="search-sort-select" onchange="handleSearchSort(this.value)">
            <option value="relevance">관련도순</option>
            <option value="recent">최신순</option>
            <option value="popular">인기순</option>
            <option value="price_low">낮은 가격순</option>
            <option value="price_high">높은 가격순</option>
          </select>
        </div>
      </div>

      <!-- Results Grid -->
      <div class="search-results-grid">
        ${results.map(item => renderItem(item)).join('')}
      </div>

      <!-- Pagination -->
      ${showPagination && totalPages > 1 ? renderSearchPagination({
        currentPage,
        totalPages,
        query
      }) : ''}
    </div>
  `;
}

// =============================================================================
// Search Result Item Components
// =============================================================================

/**
 * Render artwork search result card
 */
export function renderArtworkSearchResult(artwork: any): string {
  return `
    <a href="/gallery/${artwork.id}" class="artwork-search-card card hover-lift">
      <div class="artwork-image-container">
        <img 
          src="${artwork.image_url}" 
          alt="${artwork.title}"
          class="artwork-image"
          loading="lazy"
        />
        ${artwork.is_sold ? '<div class="artwork-sold-badge">판매완료</div>' : ''}
      </div>
      
      <div class="artwork-card-content">
        <h4 class="artwork-title">${artwork.title}</h4>
        <p class="artwork-artist">${artwork.artist_name}</p>
        
        <div class="artwork-meta">
          <span class="artwork-price">₩${artwork.price?.toLocaleString() || '가격문의'}</span>
          <span class="artwork-views">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 3C4.5 3 1.5 5.5 0 8c1.5 2.5 4.5 5 8 5s6.5-2.5 8-5c-1.5-2.5-4.5-5-8-5zm0 8a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/>
            </svg>
            ${artwork.views || 0}
          </span>
        </div>
      </div>
    </a>
  `;
}

/**
 * Render artist search result card
 */
export function renderArtistSearchResult(artist: any): string {
  return `
    <a href="/artist/${artist.id}" class="artist-search-card card hover-lift">
      <div class="artist-avatar">
        <img 
          src="${artist.profile_image_url || '/static/images/default-avatar.png'}" 
          alt="${artist.name}"
        />
      </div>
      
      <div class="artist-card-content">
        <h4 class="artist-name">${artist.name}</h4>
        <p class="artist-bio">${artist.bio || ''}</p>
        
        <div class="artist-stats">
          <span>${artist.artwork_count || 0} 작품</span>
          <span>${artist.follower_count || 0} 팔로워</span>
        </div>
      </div>
    </a>
  `;
}

// =============================================================================
// Search Pagination
// =============================================================================

interface SearchPaginationProps {
  currentPage: number;
  totalPages: number;
  query: string;
  maxButtons?: number;
}

function renderSearchPagination(props: SearchPaginationProps): string {
  const { currentPage, totalPages, query, maxButtons = 7 } = props;

  // Calculate page range
  let startPage = Math.max(1, currentPage - Math.floor(maxButtons / 2));
  let endPage = Math.min(totalPages, startPage + maxButtons - 1);
  
  if (endPage - startPage + 1 < maxButtons) {
    startPage = Math.max(1, endPage - maxButtons + 1);
  }

  const pages = Array.from(
    { length: endPage - startPage + 1 },
    (_, i) => startPage + i
  );

  return `
    <nav class="search-pagination" aria-label="검색 결과 페이지네이션">
      <ul class="pagination">
        <!-- Previous Button -->
        <li class="pagination-item ${currentPage === 1 ? 'disabled' : ''}">
          <a 
            href="?q=${encodeURIComponent(query)}&page=${currentPage - 1}"
            class="pagination-link"
            aria-label="이전 페이지"
            ${currentPage === 1 ? 'tabindex="-1"' : ''}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M10 12 L6 8 L10 4" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </li>

        <!-- First Page -->
        ${startPage > 1 ? `
          <li class="pagination-item">
            <a href="?q=${encodeURIComponent(query)}&page=1" class="pagination-link">1</a>
          </li>
          ${startPage > 2 ? '<li class="pagination-ellipsis">...</li>' : ''}
        ` : ''}

        <!-- Page Numbers -->
        ${pages.map(page => `
          <li class="pagination-item ${page === currentPage ? 'active' : ''}">
            <a 
              href="?q=${encodeURIComponent(query)}&page=${page}" 
              class="pagination-link"
              ${page === currentPage ? 'aria-current="page"' : ''}>
              ${page}
            </a>
          </li>
        `).join('')}

        <!-- Last Page -->
        ${endPage < totalPages ? `
          ${endPage < totalPages - 1 ? '<li class="pagination-ellipsis">...</li>' : ''}
          <li class="pagination-item">
            <a href="?q=${encodeURIComponent(query)}&page=${totalPages}" class="pagination-link">${totalPages}</a>
          </li>
        ` : ''}

        <!-- Next Button -->
        <li class="pagination-item ${currentPage === totalPages ? 'disabled' : ''}">
          <a 
            href="?q=${encodeURIComponent(query)}&page=${currentPage + 1}"
            class="pagination-link"
            aria-label="다음 페이지"
            ${currentPage === totalPages ? 'tabindex="-1"' : ''}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M6 4 L10 8 L6 12" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </a>
        </li>
      </ul>
    </nav>
  `;
}

// =============================================================================
// Compact Search Bar (for header/mobile)
// =============================================================================

/**
 * Render compact search bar for header
 */
export function renderCompactSearchBar(props: Partial<SearchBarProps> = {}): string {
  return renderSearchBar({
    size: 'sm',
    showSearchButton: true,
    showClear: true,
    placeholder: '검색...',
    ...props
  });
}

/**
 * Render mobile search overlay
 */
export function renderMobileSearchOverlay(props: Partial<SearchBarProps> = {}): string {
  return `
    <div class="mobile-search-overlay" id="mobile-search-overlay" style="display: none;">
      <div class="mobile-search-header">
        <button 
          type="button" 
          class="mobile-search-close"
          onclick="closeMobileSearch()"
          aria-label="검색 닫기">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M18 6 L6 18 M6 6 L18 18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        
        ${renderSearchBar({
          size: 'lg',
          fullWidth: true,
          autoFocus: true,
          showClear: true,
          showRecentSearches: true,
          enableAutocomplete: true,
          ...props
        })}
      </div>
      
      <div class="mobile-search-results" id="mobile-search-results">
        <!-- Results populated by JS -->
      </div>
    </div>

    <script>
      function openMobileSearch() {
        const overlay = document.getElementById('mobile-search-overlay');
        if (overlay) {
          overlay.style.display = 'flex';
          document.body.style.overflow = 'hidden';
          
          // Focus search input
          const input = overlay.querySelector('.search-input');
          if (input) {
            setTimeout(() => input.focus(), 100);
          }
        }
      }

      function closeMobileSearch() {
        const overlay = document.getElementById('mobile-search-overlay');
        if (overlay) {
          overlay.style.display = 'none';
          document.body.style.overflow = '';
        }
      }
    </script>
  `;
}
