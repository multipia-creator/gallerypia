// Advanced Features JavaScript
// Version: v8.16
// Features: Collections, Bundles, Traits, Sweep, Portfolio

// ============================================
// COLLECTION MANAGEMENT
// ============================================

// Load collections list
async function loadCollections(page = 1, filters = {}) {
  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: '20',
      ...filters
    });
    
    const response = await axios.get(`/api/collections?${params}`);
    
    if (response.data.success) {
      displayCollections(response.data.data, response.data.pagination);
    }
  } catch (error) {
    console.error('Collections load error:', error);
    showError('컬렉션 목록을 불러오는데 실패했습니다');
  }
}

// Display collections
function displayCollections(collections, pagination) {
  const container = document.getElementById('collectionsGrid');
  if (!container) return;
  
  let html = '';
  
  collections.forEach(collection => {
    const floorPrice = collection.current_floor_price || collection.floor_price_eth || 0;
    const totalVolume = collection.actual_total_volume || 0;
    const itemsCount = collection.actual_items_count || 0;
    
    html += `
      <div class="card-nft rounded-2xl overflow-hidden hover:shadow-2xl transition cursor-pointer" 
           onclick="viewCollection('${collection.collection_slug}')">
        <!-- Banner Image -->
        <div class="h-32 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600"
             style="background-image: url('${collection.banner_image || ''}'); background-size: cover;">
        </div>
        
        <!-- Collection Info -->
        <div class="p-6">
          <div class="flex items-center mb-4">
            <img src="${collection.logo_image || collection.artist_avatar || 'https://via.placeholder.com/60'}" 
                 alt="${collection.collection_name}" 
                 class="w-16 h-16 rounded-full border-4 border-black -mt-10">
            ${collection.is_verified ? '<i class="fas fa-check-circle text-blue-400 ml-2"></i>' : ''}
          </div>
          
          <h3 class="text-xl font-bold text-white mb-2">${collection.collection_name}</h3>
          <p class="text-gray-400 text-sm mb-4 line-clamp-2">${collection.description || ''}</p>
          
          <div class="flex items-center text-sm text-gray-400 mb-4">
            <img src="${collection.artist_avatar || 'https://via.placeholder.com/24'}" 
                 alt="${collection.artist_name}" 
                 class="w-6 h-6 rounded-full mr-2">
            <span>by ${collection.artist_name}</span>
          </div>
          
          <!-- Stats -->
          <div class="grid grid-cols-3 gap-4 border-t border-white/10 pt-4">
            <div>
              <div class="text-xs text-gray-500 mb-1">Floor</div>
              <div class="text-white font-semibold">${floorPrice.toFixed(4)} ETH</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Volume</div>
              <div class="text-white font-semibold">${totalVolume.toFixed(2)} ETH</div>
            </div>
            <div>
              <div class="text-xs text-gray-500 mb-1">Items</div>
              <div class="text-white font-semibold">${itemsCount}</div>
            </div>
          </div>
          
          ${collection.category ? `<div class="mt-3">
            <span class="text-xs px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full">
              ${collection.category}
            </span>
          </div>` : ''}
        </div>
      </div>
    `;
  });
  
  container.innerHTML = html;
  
  // Pagination
  displayPagination('collectionsPagination', pagination, (page) => loadCollections(page, {}));
}

// View collection detail
async function viewCollection(slug) {
  window.location.href = `/collection/${slug}`;
}


// ============================================
// TRAIT FILTERING
// ============================================

let currentTraitFilters = {};

// Load available traits for a collection
async function loadTraitOptions(collectionId) {
  try {
    const response = await axios.get(`/api/collections/${collectionId}`);
    
    if (response.data.success) {
      displayTraitFilters(response.data.data.traits);
    }
  } catch (error) {
    console.error('Trait options load error:', error);
  }
}

// Display trait filters
function displayTraitFilters(traits) {
  const container = document.getElementById('traitFiltersContainer');
  if (!container) return;
  
  // Group traits by type
  const traitsByType = {};
  traits.forEach(trait => {
    if (!traitsByType[trait.trait_type]) {
      traitsByType[trait.trait_type] = [];
    }
    traitsByType[trait.trait_type].push(trait);
  });
  
  let html = '<div class="space-y-4">';
  
  Object.keys(traitsByType).forEach(traitType => {
    html += `
      <div class="border border-white/10 rounded-lg p-4">
        <button onclick="toggleTraitGroup('${traitType}')" 
                class="w-full flex items-center justify-between text-white font-semibold mb-2">
          <span>${traitType}</span>
          <i class="fas fa-chevron-down transition-transform" id="icon-${traitType}"></i>
        </button>
        
        <div id="trait-group-${traitType}" class="space-y-2">
          ${traitsByType[traitType].map(trait => `
            <label class="flex items-center justify-between cursor-pointer hover:bg-white/5 p-2 rounded">
              <div class="flex items-center">
                <input type="checkbox" 
                       onchange="toggleTraitFilter('${traitType}', '${trait.trait_value}')"
                       class="mr-3 w-4 h-4">
                <span class="text-gray-300">${trait.trait_value}</span>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-500">${trait.count} (${trait.percentage}%)</span>
                ${trait.rarity_percentage < 10 ? 
                  '<span class="text-xs px-2 py-0.5 bg-yellow-500/20 text-yellow-400 rounded">Rare</span>' : ''}
              </div>
            </label>
          `).join('')}
        </div>
      </div>
    `;
  });
  
  html += '</div>';
  
  container.innerHTML = html;
}

// Toggle trait group accordion
function toggleTraitGroup(traitType) {
  const group = document.getElementById(`trait-group-${traitType}`);
  const icon = document.getElementById(`icon-${traitType}`);
  
  if (group.style.display === 'none') {
    group.style.display = 'block';
    icon.classList.remove('fa-chevron-down');
    icon.classList.add('fa-chevron-up');
  } else {
    group.style.display = 'none';
    icon.classList.remove('fa-chevron-up');
    icon.classList.add('fa-chevron-down');
  }
}

// Toggle trait filter
function toggleTraitFilter(traitType, traitValue) {
  const key = `${traitType}:${traitValue}`;
  
  if (currentTraitFilters[key]) {
    delete currentTraitFilters[key];
  } else {
    currentTraitFilters[key] = { type: traitType, value: traitValue };
  }
  
  applyTraitFilters();
}

// Apply trait filters
async function applyTraitFilters() {
  const collectionId = document.getElementById('currentCollectionId')?.value;
  if (!collectionId) return;
  
  const traitsParam = Object.keys(currentTraitFilters).join(',');
  
  try {
    const response = await axios.get('/api/artworks/filter/traits', {
      params: {
        collection_id: collectionId,
        traits: traitsParam,
        page: 1,
        limit: 20
      }
    });
    
    if (response.data.success) {
      displayFilteredArtworks(response.data.data);
      updateFilterSummary();
    }
  } catch (error) {
    console.error('Trait filter error:', error);
    showError('필터 적용에 실패했습니다');
  }
}

// Clear all trait filters
function clearTraitFilters() {
  currentTraitFilters = {};
  
  // Uncheck all checkboxes
  document.querySelectorAll('#traitFiltersContainer input[type="checkbox"]').forEach(checkbox => {
    checkbox.checked = false;
  });
  
  applyTraitFilters();
}

// Update filter summary
function updateFilterSummary() {
  const container = document.getElementById('activeFilters');
  if (!container) return;
  
  const filterCount = Object.keys(currentTraitFilters).length;
  
  if (filterCount === 0) {
    container.innerHTML = '<span class="text-gray-500">필터 없음</span>';
    return;
  }
  
  let html = '<div class="flex flex-wrap gap-2">';
  
  Object.entries(currentTraitFilters).forEach(([key, filter]) => {
    html += `
      <span class="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm flex items-center">
        ${filter.type}: ${filter.value}
        <button onclick="toggleTraitFilter('${filter.type}', '${filter.value}')" 
                class="ml-2 hover:text-red-400">
          <i class="fas fa-times"></i>
        </button>
      </span>
    `;
  });
  
  html += `
    <button onclick="clearTraitFilters()" 
            class="px-3 py-1 bg-red-500/20 text-red-400 rounded-full text-sm hover:bg-red-500/30">
      모두 지우기
    </button>
  `;
  
  html += '</div>';
  
  container.innerHTML = html;
}


// ============================================
// BUNDLE SALES
// ============================================

let selectedArtworksForBundle = [];

// Create bundle modal
function showCreateBundleModal() {
  const modal = document.getElementById('createBundleModal');
  if (modal) {
    modal.classList.remove('hidden');
    loadArtworksForBundle();
  }
}

// Load artworks for bundle creation
async function loadArtworksForBundle() {
  try {
    // Load user's artworks
    const response = await axios.get('/api/artworks', {
      params: {
        owner_only: true,
        status: 'active'
      }
    });
    
    displayArtworksForBundle(response.data || []);
  } catch (error) {
    console.error('Artworks load error:', error);
  }
}

// Display artworks selection
function displayArtworksForBundle(artworks) {
  const container = document.getElementById('bundleArtworksSelection');
  if (!container) return;
  
  let html = '<div class="grid grid-cols-2 md:grid-cols-4 gap-4">';
  
  artworks.forEach(artwork => {
    const isSelected = selectedArtworksForBundle.includes(artwork.id);
    
    html += `
      <div class="relative cursor-pointer rounded-lg overflow-hidden border-2 ${
        isSelected ? 'border-purple-500' : 'border-transparent'
      }" onclick="toggleArtworkForBundle(${artwork.id}, ${artwork.price_eth})">
        <img src="${artwork.image_url}" alt="${artwork.title}" class="w-full h-40 object-cover">
        <div class="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div class="text-center text-white">
            <div class="font-semibold">${artwork.title}</div>
            <div class="text-sm">${artwork.price_eth} ETH</div>
          </div>
        </div>
        ${isSelected ? `
          <div class="absolute top-2 right-2 w-6 h-6 bg-purple-500 rounded-full flex items-center justify-center">
            <i class="fas fa-check text-white text-xs"></i>
          </div>
        ` : ''}
      </div>
    `;
  });
  
  html += '</div>';
  
  container.innerHTML = html;
}

// Toggle artwork for bundle
function toggleArtworkForBundle(artworkId, priceEth) {
  const index = selectedArtworksForBundle.findIndex(item => item.id === artworkId);
  
  if (index > -1) {
    selectedArtworksForBundle.splice(index, 1);
  } else {
    selectedArtworksForBundle.push({ id: artworkId, price: priceEth });
  }
  
  updateBundleSummary();
  loadArtworksForBundle(); // Re-render
}

// Update bundle summary
function updateBundleSummary() {
  const container = document.getElementById('bundleSummary');
  if (!container) return;
  
  const totalItems = selectedArtworksForBundle.length;
  const totalPrice = selectedArtworksForBundle.reduce((sum, item) => sum + item.price, 0);
  const discount = parseFloat(document.getElementById('bundleDiscount')?.value || 0);
  const finalPrice = totalPrice * (1 - discount / 100);
  
  container.innerHTML = `
    <div class="space-y-2 text-sm">
      <div class="flex justify-between">
        <span class="text-gray-400">선택된 작품:</span>
        <span class="text-white font-semibold">${totalItems}개</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">원가 합계:</span>
        <span class="text-white">${totalPrice.toFixed(4)} ETH</span>
      </div>
      <div class="flex justify-between">
        <span class="text-gray-400">할인 (${discount}%):</span>
        <span class="text-red-400">-${(totalPrice - finalPrice).toFixed(4)} ETH</span>
      </div>
      <div class="flex justify-between border-t border-white/10 pt-2">
        <span class="text-white font-semibold">최종 가격:</span>
        <span class="text-purple-400 font-bold text-lg">${finalPrice.toFixed(4)} ETH</span>
      </div>
    </div>
  `;
}

// Create bundle
async function createBundle() {
  const bundleName = document.getElementById('bundleName')?.value;
  const description = document.getElementById('bundleDescription')?.value;
  const discount = parseFloat(document.getElementById('bundleDiscount')?.value || 0);
  
  if (!bundleName || selectedArtworksForBundle.length === 0) {
    showError('번들 이름과 작품을 선택해주세요');
    return;
  }
  
  const totalPrice = selectedArtworksForBundle.reduce((sum, item) => sum + item.price, 0);
  const finalPrice = totalPrice * (1 - discount / 100);
  
  try {
    const response = await axios.post('/api/bundles', {
      bundle_name: bundleName,
      description,
      artwork_ids: selectedArtworksForBundle.map(item => item.id),
      total_price_eth: finalPrice,
      discount_percentage: discount,
      listing_type: 'fixed_price'
    });
    
    if (response.data.success) {
      showSuccess('번들이 생성되었습니다!');
      document.getElementById('createBundleModal').classList.add('hidden');
      selectedArtworksForBundle = [];
      loadBundles();
    }
  } catch (error) {
    console.error('Bundle creation error:', error);
    showError('번들 생성에 실패했습니다');
  }
}


// ============================================
// SWEEP PURCHASE
// ============================================

let sweepCart = [];

// Add to sweep cart
async function addToSweepCart(artworkId) {
  try {
    const response = await axios.post('/api/sweep/cart/add', {
      artwork_id: artworkId
    });
    
    if (response.data.success) {
      showSuccess('장바구니에 추가되었습니다');
      updateSweepCartBadge();
    }
  } catch (error) {
    console.error('Sweep cart add error:', error);
    showError('장바구니 추가 실패');
  }
}

// View sweep cart
async function viewSweepCart() {
  try {
    const response = await axios.get('/api/sweep/cart');
    
    if (response.data.success) {
      displaySweepCart(response.data.data);
    }
  } catch (error) {
    console.error('Sweep cart view error:', error);
  }
}

// Display sweep cart
function displaySweepCart(data) {
  const modal = document.getElementById('sweepCartModal');
  if (!modal) return;
  
  modal.classList.remove('hidden');
  
  const { cart, items } = data;
  const container = document.getElementById('sweepCartItems');
  
  let html = '';
  
  if (items.length === 0) {
    html = '<div class="text-center text-gray-400 py-8">장바구니가 비어있습니다</div>';
  } else {
    html = '<div class="space-y-4">';
    
    items.forEach(item => {
      html += `
        <div class="flex items-center space-x-4 p-4 bg-white/5 rounded-lg">
          <img src="${item.image_url}" alt="${item.title}" class="w-20 h-20 object-cover rounded">
          <div class="flex-1">
            <div class="text-white font-semibold">${item.title}</div>
            <div class="text-gray-400 text-sm">by ${item.artist_name}</div>
            <div class="text-purple-400 font-bold mt-1">${item.price_eth} ETH</div>
          </div>
          <button onclick="removeFromSweepCart(${item.id})" class="text-red-400 hover:text-red-300">
            <i class="fas fa-trash"></i>
          </button>
        </div>
      `;
    });
    
    html += '</div>';
    
    html += `
      <div class="border-t border-white/10 mt-6 pt-4">
        <div class="flex justify-between text-lg font-bold">
          <span class="text-white">Total:</span>
          <span class="text-purple-400">${cart.total_price_eth} ETH</span>
        </div>
        <div class="text-sm text-gray-400 mt-1">
          ${cart.total_items} items · Estimated gas: ${cart.estimated_gas_eth || 0} ETH
        </div>
        <button onclick="sweepCheckout()" 
                class="w-full mt-4 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-bold hover:opacity-90">
          Sweep Purchase
        </button>
      </div>
    `;
  }
  
  container.innerHTML = html;
}

// Sweep checkout
async function sweepCheckout() {
  if (!confirm('선택한 작품들을 일괄 구매하시겠습니까?')) return;
  
  try {
    const response = await axios.post('/api/sweep/cart/checkout');
    
    if (response.data.success) {
      showSuccess(`${response.data.data.items_purchased}개 작품 구매 완료!`);
      document.getElementById('sweepCartModal').classList.add('hidden');
      updateSweepCartBadge();
    }
  } catch (error) {
    console.error('Sweep checkout error:', error);
    showError('구매에 실패했습니다');
  }
}


// ============================================
// PORTFOLIO TRACKER
// ============================================

// View portfolio
async function viewPortfolio(userId) {
  try {
    const response = await axios.get(`/api/portfolio/${userId}`);
    
    if (response.data.success) {
      displayPortfolio(response.data.data);
    }
  } catch (error) {
    console.error('Portfolio view error:', error);
  }
}

// Display portfolio
function displayPortfolio(data) {
  const { portfolio, holdings, recent_sales } = data;
  
  // Portfolio summary
  const summaryContainer = document.getElementById('portfolioSummary');
  if (summaryContainer) {
    const pnlClass = portfolio.unrealized_pnl_eth >= 0 ? 'text-green-400' : 'text-red-400';
    
    summaryContainer.innerHTML = `
      <div class="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div class="card-nft p-6">
          <div class="text-gray-400 text-sm mb-2">Total Value</div>
          <div class="text-2xl font-bold text-white">${portfolio.total_value_eth?.toFixed(4) || 0} ETH</div>
          <div class="text-sm text-gray-500 mt-1">₩${(portfolio.total_value_krw || 0).toLocaleString()}</div>
        </div>
        
        <div class="card-nft p-6">
          <div class="text-gray-400 text-sm mb-2">Unrealized P&L</div>
          <div class="text-2xl font-bold ${pnlClass}">${portfolio.unrealized_pnl_eth?.toFixed(4) || 0} ETH</div>
          <div class="text-sm ${pnlClass}">${portfolio.unrealized_pnl_percentage?.toFixed(2) || 0}%</div>
        </div>
        
        <div class="card-nft p-6">
          <div class="text-gray-400 text-sm mb-2">Holdings</div>
          <div class="text-2xl font-bold text-white">${portfolio.total_items || 0}</div>
          <div class="text-sm text-gray-500 mt-1">NFTs</div>
        </div>
        
        <div class="card-nft p-6">
          <div class="text-gray-400 text-sm mb-2">Realized P&L</div>
          <div class="text-2xl font-bold text-cyan-400">${portfolio.realized_pnl_eth?.toFixed(4) || 0} ETH</div>
          <div class="text-sm text-cyan-400">${portfolio.realized_pnl_percentage?.toFixed(2) || 0}%</div>
        </div>
      </div>
    `;
  }
  
  // Holdings list
  const holdingsContainer = document.getElementById('portfolioHoldings');
  if (holdingsContainer && holdings) {
    let html = '<div class="space-y-4">';
    
    holdings.forEach(holding => {
      const pnlClass = holding.unrealized_pnl_eth >= 0 ? 'text-green-400' : 'text-red-400';
      
      html += `
        <div class="card-nft p-4 flex items-center space-x-4">
          <img src="${holding.image_url}" alt="${holding.artwork_title}" class="w-20 h-20 object-cover rounded">
          <div class="flex-1">
            <div class="text-white font-semibold">${holding.artwork_title}</div>
            <div class="text-gray-400 text-sm">by ${holding.artist_name}</div>
            <div class="text-xs text-gray-500 mt-1">
              Bought: ${holding.purchase_price_eth} ETH · 
              Current: ${holding.current_value_eth} ETH · 
              Holding: ${Math.floor(holding.holding_days)} days
            </div>
          </div>
          <div class="text-right">
            <div class="${pnlClass} font-bold">${holding.unrealized_pnl_eth?.toFixed(4)} ETH</div>
            <div class="${pnlClass} text-sm">${holding.pnl_percentage?.toFixed(2)}%</div>
          </div>
        </div>
      `;
    });
    
    html += '</div>';
    holdingsContainer.innerHTML = html;
  }
}


// ============================================
// UTILITY FUNCTIONS
// ============================================

// Show success message
function showSuccess(message) {
  alert(message); // TODO: Replace with toast notification
}

// Show error message
function showError(message) {
  alert('Error: ' + message); // TODO: Replace with toast notification
}

// Display pagination
function displayPagination(containerId, pagination, onPageClick) {
  const container = document.getElementById(containerId);
  if (!container) return;
  
  const { page, pages } = pagination;
  
  let html = '<div class="flex items-center justify-center space-x-2">';
  
  // Previous button
  html += `
    <button onclick="${onPageClick.name}(${page - 1})" 
            ${page <= 1 ? 'disabled' : ''}
            class="px-3 py-1 bg-white/5 text-white rounded hover:bg-white/10 disabled:opacity-50">
      <i class="fas fa-chevron-left"></i>
    </button>
  `;
  
  // Page numbers
  for (let i = Math.max(1, page - 2); i <= Math.min(pages, page + 2); i++) {
    html += `
      <button onclick="${onPageClick.name}(${i})" 
              class="px-3 py-1 ${i === page ? 'bg-purple-500' : 'bg-white/5'} text-white rounded hover:bg-purple-600">
        ${i}
      </button>
    `;
  }
  
  // Next button
  html += `
    <button onclick="${onPageClick.name}(${page + 1})" 
            ${page >= pages ? 'disabled' : ''}
            class="px-3 py-1 bg-white/5 text-white rounded hover:bg-white/10 disabled:opacity-50">
      <i class="fas fa-chevron-right"></i>
    </button>
  `;
  
  html += '</div>';
  
  container.innerHTML = html;
}

// Update sweep cart badge
async function updateSweepCartBadge() {
  try {
    const response = await axios.get('/api/sweep/cart');
    
    if (response.data.success) {
      const badge = document.getElementById('sweepCartBadge');
      if (badge) {
        const count = response.data.data.cart.total_items || 0;
        badge.textContent = count;
        badge.style.display = count > 0 ? 'block' : 'none';
      }
    }
  } catch (error) {
    console.error('Cart badge update error:', error);
  }
}


// Initialize
document.addEventListener('DOMContentLoaded', function() {
  // Update sweep cart badge on page load
  updateSweepCartBadge();
});
