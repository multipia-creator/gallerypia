// ========================================
// 인증 상태 관리
// ========================================

// 전역 사용자 상태
window.currentUser = null;

// 페이지 로드 시 자동 인증 복구
async function restoreAuthState() {
  const token = localStorage.getItem('authToken')
  if (!token) {
    console.log('No auth token found')
    return false
  }
  
  try {
    const response = await axios.get('/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    
    if (response.data.success) {
      window.currentUser = response.data.data
      updateUIForAuthState(true)
      console.log('Auth restored:', window.currentUser.email)
      return true
    }
  } catch (error) {
    console.log('Token expired or invalid:', error.message)
    localStorage.removeItem('authToken')
    window.currentUser = null
    updateUIForAuthState(false)
    return false
  }
  
  return false
}

// 인증 상태에 따라 UI 업데이트
function updateUIForAuthState(isAuthenticated) {
  const loginBtn = document.getElementById('loginBtn')
  const signupBtn = document.getElementById('signupBtn')
  const userMenu = document.getElementById('userMenu')
  
  if (isAuthenticated && window.currentUser) {
    if (loginBtn) loginBtn.style.display = 'none'
    if (signupBtn) signupBtn.style.display = 'none'
    if (userMenu) {
      userMenu.style.display = 'block'
      const userNameEl = document.getElementById('userName')
      if (userNameEl) userNameEl.textContent = window.currentUser.name
    }
  } else {
    if (loginBtn) loginBtn.style.display = 'block'
    if (signupBtn) signupBtn.style.display = 'block'
    if (userMenu) userMenu.style.display = 'none'
  }
}

// 로그아웃 함수
async function logout() {
  const token = localStorage.getItem('authToken')
  
  if (token) {
    try {
      await axios.post('/api/auth/logout', {}, {
        headers: { 'Authorization': `Bearer ${token}` }
      })
    } catch (error) {
      console.error('Logout error:', error)
    }
  }
  
  localStorage.removeItem('authToken')
  window.currentUser = null
  updateUIForAuthState(false)
  window.location.href = '/'
}

// ========================================
// SPA 라우팅
// ========================================

let currentPage = '/';
let currentCategory = 'all';

// 페이지 네비게이션
function navigateTo(event, path) {
  if (event) {
    event.preventDefault();
  }
  
  currentPage = path;
  window.history.pushState({}, '', path);
  
  // 네비게이션 활성화 상태 업데이트
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === path) {
      link.classList.add('active');
    }
  });
  
  renderPage();
}

// 페이지 렌더링
function renderPage() {
  const content = document.getElementById('app-content');
  
  if (currentPage === '/' || currentPage === '') {
    renderHomePage(content);
  } else if (currentPage === '/gallery') {
    renderGalleryPage(content);
  } else if (currentPage === '/artists') {
    renderArtistsPage(content);
  } else if (currentPage === '/collections') {
    renderCollectionsPage(content);
  } else if (currentPage.startsWith('/artwork/')) {
    const id = currentPage.split('/')[2];
    renderArtworkDetailPage(content, id);
  } else if (currentPage.startsWith('/artist/')) {
    const id = currentPage.split('/')[2];
    renderArtistDetailPage(content, id);
  } else {
    renderHomePage(content);
  }
}

// ========================================
// 홈페이지
// ========================================

function renderHomePage(container) {
  container.innerHTML = `
    <!-- 히어로 섹션 -->
    <section class="gradient-bg text-white py-20">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="text-center max-w-4xl mx-auto">
                <h1 class="text-5xl md:text-6xl font-bold mb-6 leading-tight">
                    미술품 가치의<br/>새로운 기준
                </h1>
                <p class="text-xl md:text-2xl mb-8 text-purple-100 font-light">
                    객관적인 가치산정 시스템으로 미술품 거래의 투명성을 높입니다
                </p>
                <div class="flex flex-col sm:flex-row justify-center gap-4">
                    <button onclick="navigateTo(null, '/gallery')" class="px-8 py-4 bg-white text-purple-600 rounded-lg hover:bg-gray-100 font-bold text-lg shadow-xl transition">
                        <i class="fas fa-images mr-2"></i>작품 둘러보기
                    </button>
                    <button class="px-8 py-4 bg-purple-800 text-white rounded-lg hover:bg-purple-900 font-bold text-lg shadow-xl transition">
                        <i class="fas fa-calculator mr-2"></i>가치 산정하기
                    </button>
                </div>
            </div>
            
            <!-- 통계 -->
            <div class="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4" id="home-stats">
                <div class="stat-card rounded-xl p-6 text-center">
                    <div class="skeleton text-3xl font-bold text-purple-600 mb-2 h-10"></div>
                    <div class="text-gray-600 text-sm font-medium">전체 작품</div>
                </div>
                <div class="stat-card rounded-xl p-6 text-center">
                    <div class="skeleton text-3xl font-bold text-purple-600 mb-2 h-10"></div>
                    <div class="text-gray-600 text-sm font-medium">등록 작가</div>
                </div>
                <div class="stat-card rounded-xl p-6 text-center">
                    <div class="skeleton text-3xl font-bold text-purple-600 mb-2 h-10"></div>
                    <div class="text-gray-600 text-sm font-medium">민팅된 NFT</div>
                </div>
                <div class="stat-card rounded-xl p-6 text-center">
                    <div class="skeleton text-3xl font-bold text-purple-600 mb-2 h-10"></div>
                    <div class="text-gray-600 text-sm font-medium">총 작품 가치</div>
                </div>
            </div>
        </div>
    </section>

    <!-- 인기 작품 -->
    <section class="py-16">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center mb-8">
                <h2 class="section-title text-3xl font-bold text-gray-900">
                    인기 작품
                </h2>
                <button onclick="navigateTo(null, '/gallery')" class="text-purple-600 hover:text-purple-700 font-medium">
                    전체 보기 <i class="fas fa-arrow-right ml-1"></i>
                </button>
            </div>
            
            <div id="home-artworks" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <!-- 로딩 스켈레톤 -->
                ${generateSkeletonCards(8)}
            </div>
        </div>
    </section>

    <!-- 가치산정 소개 -->
    <section class="py-16 bg-white">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 class="section-title text-3xl font-bold text-center text-gray-900 mb-12">
                과학적인 가치산정 시스템
            </h2>
            <div class="grid md:grid-cols-2 gap-8">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8">
                    <div class="flex items-center mb-6">
                        <div class="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mr-4">
                            <i class="fas fa-chart-line text-white text-xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900">정량적 평가</h3>
                    </div>
                    <ul class="space-y-4 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-600 mt-1 mr-3 text-lg"></i>
                            <div><strong class="font-semibold">시장 수요도:</strong> 현재 미술 시장의 트렌드와 수요 분석</div>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-blue-600 mt-1 mr-3 text-lg"></i>
                            <div><strong class="font-semibold">희소성:</strong> 작품의 에디션 수와 유사 작품 비교</div>
                        </li>
                    </ul>
                </div>
                
                <div class="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-8">
                    <div class="flex items-center mb-6">
                        <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mr-4">
                            <i class="fas fa-star text-white text-xl"></i>
                        </div>
                        <h3 class="text-2xl font-bold text-gray-900">정성적 평가</h3>
                    </div>
                    <ul class="space-y-4 text-gray-700">
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-purple-600 mt-1 mr-3 text-lg"></i>
                            <div><strong class="font-semibold">예술적 완성도:</strong> 작품의 미적 수준과 완성도</div>
                        </li>
                        <li class="flex items-start">
                            <i class="fas fa-check-circle text-purple-600 mt-1 mr-3 text-lg"></i>
                            <div><strong class="font-semibold">독창성:</strong> 작가의 고유한 예술적 시각</div>
                        </li>
                    </ul>
                </div>
            </div>
        </div>
    </section>
  `;
  
  loadHomeStats();
  loadHomeArtworks();
}

async function loadHomeStats() {
  try {
    const response = await axios.get('/api/stats');
    if (response.data.success) {
      const stats = response.data.data;
      const statsContainer = document.getElementById('home-stats');
      if (statsContainer) {
        statsContainer.innerHTML = `
          <div class="stat-card rounded-xl p-6 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">\${stats.total_artworks}</div>
              <div class="text-gray-600 text-sm font-medium">전체 작품</div>
          </div>
          <div class="stat-card rounded-xl p-6 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">\${stats.total_artists}</div>
              <div class="text-gray-600 text-sm font-medium">등록 작가</div>
          </div>
          <div class="stat-card rounded-xl p-6 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">\${stats.minted_nfts}</div>
              <div class="text-gray-600 text-sm font-medium">민팅된 NFT</div>
          </div>
          <div class="stat-card rounded-xl p-6 text-center">
              <div class="text-3xl font-bold text-purple-600 mb-2">\${(stats.total_value / 100000000).toFixed(1)}억원</div>
              <div class="text-gray-600 text-sm font-medium">총 작품 가치</div>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error('통계 로드 실패:', error);
  }
}

async function loadHomeArtworks() {
  try {
    const response = await axios.get('/api/artworks?limit=8');
    if (response.data.success) {
      renderArtworkGrid(response.data.data, 'home-artworks');
    }
  } catch (error) {
    console.error('작품 로드 실패:', error);
  }
}

// ========================================
// 갤러리 페이지
// ========================================

function renderGalleryPage(container) {
  container.innerHTML = `
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="section-title text-4xl font-bold text-gray-900 mb-8">작품 갤러리</h1>
            
            <!-- 카테고리 필터 -->
            <div class="flex flex-wrap gap-3 mb-8">
                <button onclick="filterCategory('all')" class="category-btn active px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition">
                    전체
                </button>
                <button onclick="filterCategory('디지털아트')" class="category-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition">
                    디지털아트
                </button>
                <button onclick="filterCategory('회화')" class="category-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition">
                    회화
                </button>
                <button onclick="filterCategory('조각')" class="category-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition">
                    조각
                </button>
                <button onclick="filterCategory('사진')" class="category-btn px-6 py-3 bg-gray-200 text-gray-700 rounded-full font-medium hover:bg-gray-300 transition">
                    사진
                </button>
            </div>
            
            <div id="gallery-artworks" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                ${generateSkeletonCards(12)}
            </div>
        </div>
    </section>
  `;
  
  loadGalleryArtworks();
}

async function loadGalleryArtworks(category = 'all') {
  try {
    const params = { limit: 50 };
    if (category !== 'all') {
      params.category = category;
    }
    
    const response = await axios.get('/api/artworks', { params });
    if (response.data.success) {
      renderArtworkGrid(response.data.data, 'gallery-artworks');
    }
  } catch (error) {
    console.error('갤러리 로드 실패:', error);
  }
}

function filterCategory(category) {
  currentCategory = category;
  
  // 버튼 활성화 상태 업데이트
  document.querySelectorAll('.category-btn').forEach(btn => {
    btn.classList.remove('active');
    const btnText = btn.textContent.trim();
    if ((category === 'all' && btnText === '전체') || btnText === category) {
      btn.classList.add('active');
    }
  });
  
  loadGalleryArtworks(category);
}

// ========================================
// 작가 페이지
// ========================================

function renderArtistsPage(container) {
  container.innerHTML = `
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="section-title text-4xl font-bold text-gray-900 mb-8">작가</h1>
            
            <div id="artists-grid" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                </div>
            </div>
        </div>
    </section>
  `;
  
  loadArtists();
}

async function loadArtists() {
  try {
    const response = await axios.get('/api/artists');
    if (response.data.success) {
      const artists = response.data.data;
      const container = document.getElementById('artists-grid');
      
      if (artists.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><p>등록된 작가가 없습니다.</p></div>';
        return;
      }
      
      container.innerHTML = artists.map(artist => `
        <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer" onclick="viewArtist(\${artist.id})">
            <div class="p-6 text-center">
                <img src="\${artist.profile_image || 'https://i.pravatar.cc/150'}" 
                     class="w-24 h-24 rounded-full mx-auto mb-4 object-cover"
                     alt="\${artist.name}"
                     loading="lazy">
                <h3 class="font-bold text-xl text-gray-900 mb-2">\${artist.name}</h3>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">\${artist.bio || ''}</p>
                <div class="flex justify-center space-x-4 text-sm text-gray-500">
                    <span><i class="fas fa-briefcase mr-1"></i>\${artist.career_years}년</span>
                    <span><i class="fas fa-trophy mr-1"></i>\${artist.awards_count}회</span>
                </div>
            </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('작가 로드 실패:', error);
  }
}

function viewArtist(id) {
  navigateTo(null, `/artist/\${id}`);
}

// ========================================
// 컬렉션 페이지
// ========================================

function renderCollectionsPage(container) {
  container.innerHTML = `
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 class="section-title text-4xl font-bold text-gray-900 mb-8">컬렉션</h1>
            
            <div id="collections-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div class="col-span-full text-center py-12">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                </div>
            </div>
        </div>
    </section>
  `;
  
  loadCollections();
}

async function loadCollections() {
  try {
    const response = await axios.get('/api/collections');
    if (response.data.success) {
      const collections = response.data.data;
      const container = document.getElementById('collections-grid');
      
      if (collections.length === 0) {
        container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><p>컬렉션이 없습니다.</p></div>';
        return;
      }
      
      container.innerHTML = collections.map(collection => `
        <div class="bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition cursor-pointer">
            <div class="h-48 bg-gradient-to-br from-purple-400 to-indigo-500 relative overflow-hidden">
                <img src="\${collection.cover_image}" class="w-full h-full object-cover opacity-80" alt="\${collection.name}" loading="lazy">
            </div>
            <div class="p-6">
                <h3 class="font-bold text-xl text-gray-900 mb-2">\${collection.name}</h3>
                <p class="text-gray-600 text-sm mb-4">\${collection.description || ''}</p>
                <div class="flex items-center justify-between text-sm">
                    <span class="text-gray-500"><i class="fas fa-images mr-1"></i>\${collection.artwork_count}작품</span>
                    <span class="text-gray-500">by \${collection.curator_name || '큐레이터'}</span>
                </div>
            </div>
        </div>
      `).join('');
    }
  } catch (error) {
    console.error('컬렉션 로드 실패:', error);
  }
}

// ========================================
// 작품 상세 페이지
// ========================================

function renderArtworkDetailPage(container, id) {
  container.innerHTML = `
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onclick="history.back()" class="mb-6 text-gray-600 hover:text-gray-900 font-medium">
                <i class="fas fa-arrow-left mr-2"></i>돌아가기
            </button>
            
            <div id="artwork-detail">
                <div class="text-center py-20">
                    <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
                </div>
            </div>
        </div>
    </section>
  `;
  
  loadArtworkDetail(id);
}

async function loadArtworkDetail(id) {
  try {
    const response = await axios.get(`/api/artworks/\${id}`);
    if (response.data.success) {
      const artwork = response.data.data;
      const container = document.getElementById('artwork-detail');
      
      container.innerHTML = `
        <div class="grid lg:grid-cols-2 gap-12">
            <!-- 작품 이미지 -->
            <div>
                <div class="bg-white rounded-2xl overflow-hidden shadow-xl mb-6">
                    <img src="\${artwork.image_url}" alt="\${artwork.title}" class="w-full h-auto" loading="lazy">
                </div>
                
                <!-- 작가 정보 -->
                <div class="bg-white rounded-2xl p-6 shadow-lg">
                    <h3 class="text-lg font-bold mb-4">작가 정보</h3>
                    <div class="flex items-center">
                        <img src="\${artwork.artist_profile_image || 'https://i.pravatar.cc/150'}" 
                             class="w-16 h-16 rounded-full mr-4 object-cover"
                             alt="\${artwork.artist_name}"
                             loading="lazy">
                        <div class="flex-1">
                            <div class="font-bold text-xl">\${artwork.artist_name}</div>
                            <div class="text-gray-600 text-sm mt-1">\${artwork.artist_bio || ''}</div>
                            <div class="flex space-x-4 mt-2 text-sm text-gray-500">
                                <span><i class="fas fa-briefcase mr-1"></i>경력 \${artwork.career_years}년</span>
                                <span><i class="fas fa-trophy mr-1"></i>수상 \${artwork.awards_count}회</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- 작품 정보 -->
            <div>
                <div class="bg-white rounded-2xl p-8 shadow-xl mb-6">
                    <div class="flex items-center justify-between mb-4">
                        <span class="px-4 py-2 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                            \${artwork.category}
                        </span>
                        \${artwork.is_minted ? 
                            '<span class="px-4 py-2 bg-green-100 text-green-700 rounded-full text-sm font-medium"><i class="fas fa-cube mr-1"></i>NFT</span>' : 
                            ''
                        }
                    </div>
                    
                    <h1 class="text-4xl font-bold text-gray-900 mb-4">\${artwork.title}</h1>
                    
                    <div class="flex items-center space-x-4 text-gray-600 mb-6 text-sm">
                        <span><i class="fas fa-eye mr-1"></i>\${artwork.views_count} 조회</span>
                        <span><i class="fas fa-heart mr-1"></i>\${artwork.likes_count} 좋아요</span>
                        <span><i class="fas fa-calendar mr-1"></i>\${artwork.creation_year}년</span>
                    </div>
                    
                    <div class="border-t border-b border-gray-200 py-6 my-6">
                        <div class="grid grid-cols-2 gap-6">
                            <div>
                                <div class="text-sm text-gray-500 mb-1">산정 가치</div>
                                <div class="text-3xl font-bold text-purple-600">\${formatPrice(artwork.estimated_value)}</div>
                            </div>
                            <div>
                                <div class="text-sm text-gray-500 mb-1">현재 가격</div>
                                <div class="text-3xl font-bold text-gray-900">\${formatPrice(artwork.current_price)}</div>
                            </div>
                        </div>
                    </div>
                    
                    <p class="text-gray-700 leading-relaxed mb-6">\${artwork.description || '설명이 없습니다.'}</p>
                    
                    <div class="grid grid-cols-2 gap-4 mb-6 text-sm">
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="text-gray-600 mb-1">크기</div>
                            <div class="font-semibold">\${artwork.size_width} × \${artwork.size_height} cm</div>
                        </div>
                        <div class="bg-gray-50 rounded-lg p-4">
                            <div class="text-gray-600 mb-1">기법</div>
                            <div class="font-semibold">\${artwork.technique || '-'}</div>
                        </div>
                    </div>
                    
                    <div class="flex space-x-4">
                        <button onclick="likeArtwork(\${artwork.id})" class="flex-1 px-6 py-4 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl font-bold transition">
                            <i class="fas fa-heart mr-2"></i>좋아요
                        </button>
                        <button class="flex-1 px-6 py-4 gradient-bg text-white rounded-xl font-bold shadow-lg hover:opacity-90 transition">
                            <i class="fas fa-shopping-cart mr-2"></i>구매하기
                        </button>
                    </div>
                </div>
                
                <!-- 가치산정 상세 -->
                <div class="bg-white rounded-2xl p-8 shadow-xl">
                    <h3 class="text-xl font-bold mb-6">가치산정 상세</h3>
                    
                    <div class="space-y-4">
                        \${renderScoreBar('예술적 완성도', artwork.artistic_quality_score, 'purple')}
                        \${renderScoreBar('독창성', artwork.originality_score, 'indigo')}
                        \${renderScoreBar('문화적 의미', artwork.cultural_significance_score, 'blue')}
                        \${renderScoreBar('기술적 우수성', artwork.technical_excellence_score, 'teal')}
                        \${renderScoreBar('시장 수요도', artwork.market_demand_score, 'orange')}
                        \${renderScoreBar('희소성', artwork.rarity_score, 'pink')}
                    </div>
                </div>
            </div>
        </div>
      `;
    }
  } catch (error) {
    console.error('작품 상세 로드 실패:', error);
    document.getElementById('artwork-detail').innerHTML = `
      <div class="text-center py-20">
          <i class="fas fa-exclamation-circle text-4xl text-red-600 mb-4"></i>
          <p class="text-gray-600">작품을 불러오는데 실패했습니다.</p>
      </div>
    `;
  }
}

function renderScoreBar(label, score, color) {
  return `
    <div>
        <div class="flex justify-between mb-2">
            <span class="text-sm font-medium text-gray-700">\${label}</span>
            <span class="text-sm font-bold text-\${color}-600">\${score}/100</span>
        </div>
        <div class="w-full bg-gray-200 rounded-full h-2.5">
            <div class="bg-\${color}-600 h-2.5 rounded-full transition-all duration-500" style="width: \${score}%"></div>
        </div>
    </div>
  `;
}

// ========================================
// 작가 상세 페이지
// ========================================

function renderArtistDetailPage(container, id) {
  container.innerHTML = `
    <section class="py-12 bg-gray-50">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <button onclick="history.back()" class="mb-6 text-gray-600 hover:text-gray-900 font-medium">
                <i class="fas fa-arrow-left mr-2"></i>돌아가기
            </button>
            
            <div class="text-center py-20">
                <i class="fas fa-spinner fa-spin text-4xl text-purple-600"></i>
            </div>
        </div>
    </section>
  `;
}

// ========================================
// 유틸리티 함수
// ========================================

function generateSkeletonCards(count) {
  let html = '';
  for (let i = 0; i < count; i++) {
    html += `
      <div class="bg-white rounded-xl overflow-hidden shadow-md">
          <div class="skeleton h-64 bg-gray-200"></div>
          <div class="p-5">
              <div class="skeleton h-6 bg-gray-200 mb-3 rounded"></div>
              <div class="skeleton h-4 bg-gray-200 mb-3 rounded w-2/3"></div>
              <div class="skeleton h-8 bg-gray-200 rounded"></div>
          </div>
      </div>
    `;
  }
  return html;
}

function renderArtworkGrid(artworks, containerId) {
  const container = document.getElementById(containerId);
  
  if (!container) return;
  
  if (artworks.length === 0) {
    container.innerHTML = '<div class="col-span-full text-center py-12 text-gray-500"><p>작품이 없습니다.</p></div>';
    return;
  }
  
  container.innerHTML = artworks.map(artwork => `
    <div class="artwork-card bg-white rounded-xl overflow-hidden shadow-md" onclick="viewArtwork(\${artwork.id})">
        <div class="artwork-image-container">
            <img src="\${artwork.image_url}" alt="\${artwork.title}" loading="lazy">
            <div class="absolute top-3 right-3">
                <span class="px-3 py-1 bg-black bg-opacity-70 text-white text-xs rounded-full font-medium">
                    \${artwork.category}
                </span>
            </div>
            \${artwork.is_minted ? '<div class="absolute top-3 left-3"><span class="px-3 py-1 bg-purple-600 text-white text-xs rounded-full font-medium"><i class="fas fa-cube mr-1"></i>NFT</span></div>' : ''}
        </div>
        <div class="p-5">
            <h3 class="font-bold text-lg text-gray-900 mb-2 truncate">\${artwork.title}</h3>
            <div class="flex items-center mb-3">
                <img src="\${artwork.artist_profile_image || 'https://i.pravatar.cc/32'}" 
                     class="w-8 h-8 rounded-full mr-2 object-cover"
                     alt="\${artwork.artist_name}"
                     loading="lazy">
                <span class="text-sm text-gray-600 font-medium">\${artwork.artist_name}</span>
            </div>
            <div class="flex justify-between items-center">
                <div>
                    <div class="text-xs text-gray-500 mb-1">산정가</div>
                    <div class="font-bold text-purple-600">\${formatPrice(artwork.estimated_value)}</div>
                </div>
                <div class="flex items-center space-x-3 text-gray-500 text-sm">
                    <span><i class="fas fa-eye mr-1"></i>\${artwork.views_count}</span>
                    <span><i class="fas fa-heart mr-1"></i>\${artwork.likes_count}</span>
                </div>
            </div>
        </div>
    </div>
  `).join('');
}

function formatPrice(price) {
  if (price >= 100000000) {
    return (price / 100000000).toFixed(1) + '억원';
  } else if (price >= 10000) {
    return (price / 10000).toFixed(0) + '만원';
  }
  return price.toLocaleString() + '원';
}

function viewArtwork(id) {
  navigateTo(null, `/artwork/\${id}`);
}

function likeArtwork(id) {
  alert('지갑 연결 후 이용 가능합니다.');
}

// ========================================
// 인증 상태 확인
// ========================================

function checkAuthStatus() {
  try {
    // Check for session_token from auth.js
    const token = localStorage.getItem('session_token');
    if (token) {
      return {
        id: localStorage.getItem('user_id'),
        role: localStorage.getItem('user_role'),
        name: localStorage.getItem('user_name'),
        token: token
      };
    }
    
    // Fallback: Check for currentUser (legacy support)
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  } catch (e) {
    return null;
  }
}

function updateNavigationVisibility() {
  const user = checkAuthStatus();
  const mypageLink = document.getElementById('mypageLink');
  const signupBtn = document.getElementById('signupBtn');
  const loginBtn = document.getElementById('loginBtn');
  
  if (user) {
    // 로그인 상태
    if (mypageLink) mypageLink.style.display = 'flex';
    if (signupBtn) signupBtn.style.display = 'none';
    if (loginBtn) {
      loginBtn.innerHTML = '<i class="fas fa-sign-out-alt mr-2"></i><span class="text-sm font-medium">로그아웃</span>';
      loginBtn.onclick = function(e) {
        e.preventDefault();
        localStorage.removeItem('currentUser');
        window.location.href = '/';
      };
    }
  } else {
    // 비로그인 상태
    if (mypageLink) mypageLink.style.display = 'none';
    if (signupBtn) signupBtn.style.display = 'flex';
    if (loginBtn) {
      loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i><span class="text-sm font-medium">로그인</span>';
      loginBtn.onclick = null;
    }
  }
}

// ========================================
// 초기화
// ========================================

// 브라우저 뒤로가기/앞으로가기 처리
window.addEventListener('popstate', function() {
  currentPage = window.location.pathname;
  renderPage();
  updateNavigationVisibility();
});

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', async function() {
  console.log('Initializing application...');
  
  // 인증 상태 복구
  await restoreAuthState();
  
  currentPage = window.location.pathname;
  renderPage();
  updateNavigationVisibility();
});
