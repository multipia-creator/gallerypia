/**
 * Search Utilities for GalleryPia
 * 
 * Client-side search functionality including:
 * - Debounced search input
 * - Recent search history
 * - Search suggestions
 * - Filter management
 * - Loading state handling
 * - Result count display
 * 
 * Addresses UX-H-005: Add search feedback and loading indicators
 * 
 * Usage:
 * ```javascript
 * // Setup search with debounce
 * setupSearch('#search-input', async (query) => {
 *   const results = await fetchSearchResults(query);
 *   displaySearchResults(results);
 * }, 300);
 * 
 * // Show search loading
 * setSearchLoading('#search-bar', true);
 * 
 * // Update result count
 * updateSearchResultCount('#search-bar', 42);
 * 
 * // Manage recent searches
 * saveRecentSearch('NFT 아트');
 * loadRecentSearches('search-bar-123', 5);
 * ```
 */

// =============================================================================
// Debounced Search Setup
// =============================================================================

/**
 * Setup debounced search on input element
 * @param {string|HTMLElement} input - Input element or selector
 * @param {Function} searchCallback - Async function to call with search query
 * @param {number} [debounceMs=300] - Debounce delay in milliseconds
 * @param {Object} [options] - Additional options
 * @param {number} [options.minChars=2] - Minimum characters before search
 * @param {boolean} [options.showLoading=true] - Show loading indicator
 * @param {boolean} [options.saveRecent=true] - Save to recent searches
 */
function setupSearch(input, searchCallback, debounceMs = 300, options = {}) {
  const {
    minChars = 2,
    showLoading = true,
    saveRecent = true
  } = options;

  const inputElement = typeof input === 'string' ? document.querySelector(input) : input;
  if (!inputElement) return;

  const searchBar = inputElement.closest('.search-bar');
  let debounceTimer;
  let lastSearchValue = '';

  inputElement.addEventListener('input', function(e) {
    const value = e.target.value.trim();
    
    // Clear existing timer
    clearTimeout(debounceTimer);
    
    // Show/hide clear button
    if (searchBar) {
      const clearBtn = searchBar.querySelector('.search-clear');
      if (clearBtn) {
        clearBtn.style.display = value ? 'block' : 'none';
      }
    }

    // Handle empty search
    if (value.length === 0) {
      if (showLoading && searchBar) {
        setSearchLoading(searchBar, false);
      }
      if (typeof searchCallback === 'function') {
        searchCallback('');
      }
      return;
    }

    // Check minimum characters
    if (value.length < minChars) {
      return;
    }

    // Skip if same as last search
    if (value === lastSearchValue) {
      return;
    }

    // Show loading
    if (showLoading && searchBar) {
      setSearchLoading(searchBar, true);
    }

    // Debounced search
    debounceTimer = setTimeout(async () => {
      lastSearchValue = value;
      
      try {
        await searchCallback(value);
        
        // Save to recent searches
        if (saveRecent) {
          saveRecentSearch(value);
        }
      } catch (error) {
        console.error('Search error:', error);
        if (typeof showError === 'function') {
          showError('검색 중 오류가 발생했습니다.');
        }
      } finally {
        if (showLoading && searchBar) {
          setSearchLoading(searchBar, false);
        }
      }
    }, debounceMs);
  });

  // Handle Enter key
  inputElement.addEventListener('keydown', function(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      clearTimeout(debounceTimer);
      
      const value = e.target.value.trim();
      if (value.length >= minChars && value !== lastSearchValue) {
        lastSearchValue = value;
        
        if (showLoading && searchBar) {
          setSearchLoading(searchBar, true);
        }
        
        searchCallback(value).then(() => {
          if (saveRecent) {
            saveRecentSearch(value);
          }
        }).finally(() => {
          if (showLoading && searchBar) {
            setSearchLoading(searchBar, false);
          }
        });
      }
    }
  });
}

// =============================================================================
// Search Loading State
// =============================================================================

/**
 * Set search loading state
 * @param {string|HTMLElement} searchBar - Search bar element or selector
 * @param {boolean} isLoading - Loading state
 */
function setSearchLoading(searchBar, isLoading) {
  const element = typeof searchBar === 'string' ? document.querySelector(searchBar) : searchBar;
  if (!element) return;

  const loadingIndicator = element.querySelector('.search-loading');
  const searchIcon = element.querySelector('.search-icon');
  const input = element.querySelector('.search-input');

  if (loadingIndicator) {
    loadingIndicator.style.display = isLoading ? 'block' : 'none';
  }

  if (searchIcon) {
    searchIcon.style.opacity = isLoading ? '0' : '1';
  }

  if (input) {
    if (isLoading) {
      input.setAttribute('aria-busy', 'true');
    } else {
      input.removeAttribute('aria-busy');
    }
  }
}

// =============================================================================
// Search Result Count
// =============================================================================

/**
 * Update search result count display
 * @param {string|HTMLElement} searchBar - Search bar element or selector
 * @param {number} count - Number of results
 * @param {string} [query] - Search query
 */
function updateSearchResultCount(searchBar, count, query) {
  const element = typeof searchBar === 'string' ? document.querySelector(searchBar) : searchBar;
  if (!element) return;

  const countContainer = element.querySelector('.search-results-count');
  if (!countContainer) return;

  if (count > 0) {
    const badge = countContainer.querySelector('.search-count-badge');
    if (badge) {
      badge.textContent = query 
        ? `"${query}" 검색 결과: ${count.toLocaleString()}개`
        : `${count.toLocaleString()}개`;
    }
    countContainer.style.display = 'flex';
  } else {
    countContainer.style.display = 'none';
  }
}

/**
 * Clear search result count
 * @param {string|HTMLElement} searchBar - Search bar element or selector
 */
function clearSearchResultCount(searchBar) {
  const element = typeof searchBar === 'string' ? document.querySelector(searchBar) : searchBar;
  if (!element) return;

  const countContainer = element.querySelector('.search-results-count');
  if (countContainer) {
    countContainer.style.display = 'none';
  }
}

// =============================================================================
// Clear Search
// =============================================================================

/**
 * Clear search input and results
 * @param {string} inputId - Input element ID
 */
function clearSearch(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  input.value = '';
  input.focus();

  // Hide clear button
  const searchBar = input.closest('.search-bar');
  if (searchBar) {
    const clearBtn = searchBar.querySelector('.search-clear');
    if (clearBtn) {
      clearBtn.style.display = 'none';
    }

    // Clear loading
    setSearchLoading(searchBar, false);

    // Clear result count
    clearSearchResultCount(searchBar);
  }

  // Trigger search with empty query
  const onSearch = searchBar?.dataset.onSearch;
  if (onSearch && typeof window[onSearch] === 'function') {
    window[onSearch]('');
  }

  // Dispatch input event
  input.dispatchEvent(new Event('input', { bubbles: true }));
}

// =============================================================================
// Recent Searches Management
// =============================================================================

const RECENT_SEARCHES_KEY = 'gallerypia_recent_searches';
const MAX_RECENT_SEARCHES = 10;

/**
 * Save search query to recent searches
 * @param {string} query - Search query
 */
function saveRecentSearch(query) {
  if (!query || query.length < 2) return;

  try {
    let recentSearches = getRecentSearches();
    
    // Remove if already exists
    recentSearches = recentSearches.filter(s => s !== query);
    
    // Add to beginning
    recentSearches.unshift(query);
    
    // Limit to max
    recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    
    // Save to localStorage
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(recentSearches));
  } catch (error) {
    console.error('Failed to save recent search:', error);
  }
}

/**
 * Get recent searches from localStorage
 * @returns {string[]} Array of recent search queries
 */
function getRecentSearches() {
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Failed to get recent searches:', error);
    return [];
  }
}

/**
 * Clear all recent searches
 * @param {string} [searchBarId] - Search bar ID to update UI
 */
function clearRecentSearches(searchBarId) {
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
    
    if (searchBarId) {
      loadRecentSearches(searchBarId, 0);
    }
  } catch (error) {
    console.error('Failed to clear recent searches:', error);
  }
}

/**
 * Load and display recent searches
 * @param {string} searchBarId - Search bar ID
 * @param {number} maxItems - Maximum items to display
 */
function loadRecentSearches(searchBarId, maxItems = 5) {
  const recentPanel = document.getElementById(`${searchBarId}-recent`);
  const recentList = document.getElementById(`${searchBarId}-recent-list`);
  
  if (!recentPanel || !recentList) return;

  const recentSearches = getRecentSearches().slice(0, maxItems);
  
  if (recentSearches.length === 0) {
    recentPanel.style.display = 'none';
    return;
  }

  recentList.innerHTML = recentSearches.map(query => `
    <button 
      type="button" 
      class="search-recent-item"
      onclick="selectRecentSearch('${searchBarId}', '${query.replace(/'/g, "\\'")}')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
        <path d="M8 14A6 6 0 1 1 8 2a6 6 0 0 1 0 12zm0-1A5 5 0 1 0 8 3a5 5 0 0 0 0 10z"/>
        <path d="M7.5 4v4.5l3 1.5.5-.87-2.5-1.25V4z"/>
      </svg>
      <span>${query}</span>
    </button>
  `).join('');
}

/**
 * Select recent search and trigger search
 * @param {string} searchBarId - Search bar ID
 * @param {string} query - Search query
 */
function selectRecentSearch(searchBarId, query) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const input = searchBar.querySelector('.search-input');
  if (!input) return;

  input.value = query;
  
  // Hide recent searches
  const recentPanel = document.getElementById(`${searchBarId}-recent`);
  if (recentPanel) {
    recentPanel.style.display = 'none';
  }

  // Trigger search
  const onSearch = searchBar.dataset.onSearch;
  if (onSearch && typeof window[onSearch] === 'function') {
    setSearchLoading(searchBar, true);
    window[onSearch](query).finally(() => {
      setSearchLoading(searchBar, false);
    });
  }
}

// =============================================================================
// Search Filters
// =============================================================================

/**
 * Toggle search filters panel
 * @param {string} searchBarId - Search bar ID
 */
function toggleSearchFilters(searchBarId) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const filtersPanel = document.getElementById(`${searchBarId}-filters`);
  const toggleBtn = searchBar.querySelector('.search-filters-toggle');
  
  if (!filtersPanel) return;

  const isVisible = filtersPanel.style.display !== 'none';
  
  filtersPanel.style.display = isVisible ? 'none' : 'block';
  
  if (toggleBtn) {
    toggleBtn.setAttribute('aria-expanded', !isVisible);
  }
}

/**
 * Reset search filters to default
 * @param {string} searchBarId - Search bar ID
 */
function resetSearchFilters(searchBarId) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const filtersPanel = document.getElementById(`${searchBarId}-filters`);
  if (!filtersPanel) return;

  // Reset all select elements
  const selects = filtersPanel.querySelectorAll('select');
  selects.forEach(select => {
    select.value = '';
  });

  // Trigger search update
  applySearchFilters(searchBarId);
}

/**
 * Apply search filters
 * @param {string} searchBarId - Search bar ID
 */
function applySearchFilters(searchBarId) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const filtersPanel = document.getElementById(`${searchBarId}-filters`);
  if (!filtersPanel) return;

  // Collect filter values
  const filters = {};
  const selects = filtersPanel.querySelectorAll('select');
  selects.forEach(select => {
    if (select.value) {
      const filterName = select.name.replace('filter_', '');
      filters[filterName] = select.value;
    }
  });

  // Trigger search with filters
  const input = searchBar.querySelector('.search-input');
  const query = input ? input.value.trim() : '';
  
  const onSearch = searchBar.dataset.onSearch;
  if (onSearch && typeof window[onSearch] === 'function') {
    setSearchLoading(searchBar, true);
    window[onSearch](query, filters).finally(() => {
      setSearchLoading(searchBar, false);
    });
  }

  // Close filters panel
  filtersPanel.style.display = 'none';
}

// =============================================================================
// Search Suggestions (Autocomplete)
// =============================================================================

/**
 * Show search suggestions
 * @param {string} searchBarId - Search bar ID
 * @param {string[]} suggestions - Array of suggestion strings
 */
function showSearchSuggestions(searchBarId, suggestions) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const suggestionsPanel = document.getElementById(`${searchBarId}-suggestions`);
  const suggestionsList = document.getElementById(`${searchBarId}-suggestions-list`);
  
  if (!suggestionsPanel || !suggestionsList) return;

  if (suggestions.length === 0) {
    suggestionsPanel.style.display = 'none';
    return;
  }

  suggestionsList.innerHTML = suggestions.map(suggestion => `
    <button 
      type="button" 
      class="search-suggestion-item"
      onclick="selectSearchSuggestion('${searchBarId}', '${suggestion.replace(/'/g, "\\'")}')">
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
        <circle cx="7" cy="7" r="5" stroke-width="2"/>
        <path d="M11 11 L14 14" stroke-width="2" stroke-linecap="round"/>
      </svg>
      <span>${suggestion}</span>
    </button>
  `).join('');

  suggestionsPanel.style.display = 'block';
}

/**
 * Select search suggestion
 * @param {string} searchBarId - Search bar ID
 * @param {string} suggestion - Selected suggestion
 */
function selectSearchSuggestion(searchBarId, suggestion) {
  const searchBar = document.getElementById(searchBarId);
  if (!searchBar) return;

  const input = searchBar.querySelector('.search-input');
  if (!input) return;

  input.value = suggestion;
  
  // Hide suggestions
  const suggestionsPanel = document.getElementById(`${searchBarId}-suggestions`);
  if (suggestionsPanel) {
    suggestionsPanel.style.display = 'none';
  }

  // Trigger search
  const onSearch = searchBar.dataset.onSearch;
  if (onSearch && typeof window[onSearch] === 'function') {
    setSearchLoading(searchBar, true);
    window[onSearch](suggestion).finally(() => {
      setSearchLoading(searchBar, false);
    });
  }
}

// =============================================================================
// Mobile Search Overlay
// =============================================================================

/**
 * Open mobile search overlay
 */
function openMobileSearch() {
  const overlay = document.getElementById('mobile-search-overlay');
  if (!overlay) return;

  overlay.style.display = 'flex';
  document.body.style.overflow = 'hidden';
  
  // Focus search input
  const input = overlay.querySelector('.search-input');
  if (input) {
    setTimeout(() => input.focus(), 100);
  }
}

/**
 * Close mobile search overlay
 */
function closeMobileSearch() {
  const overlay = document.getElementById('mobile-search-overlay');
  if (!overlay) return;

  overlay.style.display = 'none';
  document.body.style.overflow = '';
}

// =============================================================================
// Search Results Helpers
// =============================================================================

/**
 * Handle search sort change
 * @param {string} sortValue - Sort option value
 */
function handleSearchSort(sortValue) {
  const currentUrl = new URL(window.location.href);
  currentUrl.searchParams.set('sort', sortValue);
  window.location.href = currentUrl.toString();
}

/**
 * Highlight search query in text
 * @param {string} text - Text to search in
 * @param {string} query - Search query to highlight
 * @returns {string} HTML with highlighted matches
 */
function highlightSearchQuery(text, query) {
  if (!query || !text) return text;

  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  return text.replace(regex, '<mark class="search-highlight">$1</mark>');
}

/**
 * Truncate text for search results
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @param {string} query - Search query to keep in context
 * @returns {string} Truncated text
 */
function truncateSearchResult(text, maxLength = 150, query) {
  if (!text || text.length <= maxLength) return text;

  if (query) {
    const queryIndex = text.toLowerCase().indexOf(query.toLowerCase());
    if (queryIndex !== -1) {
      const start = Math.max(0, queryIndex - Math.floor(maxLength / 2));
      const end = Math.min(text.length, start + maxLength);
      return (start > 0 ? '...' : '') + text.slice(start, end) + (end < text.length ? '...' : '');
    }
  }

  return text.slice(0, maxLength) + '...';
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    setupSearch,
    setSearchLoading,
    updateSearchResultCount,
    clearSearchResultCount,
    clearSearch,
    saveRecentSearch,
    getRecentSearches,
    clearRecentSearches,
    loadRecentSearches,
    selectRecentSearch,
    toggleSearchFilters,
    resetSearchFilters,
    applySearchFilters,
    showSearchSuggestions,
    selectSearchSuggestion,
    openMobileSearch,
    closeMobileSearch,
    handleSearchSort,
    highlightSearchQuery,
    truncateSearchResult
  };
}
