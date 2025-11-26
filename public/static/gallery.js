// 갤러리 필터링 및 정렬 JavaScript

// 현재 활성 탭
let currentGalleryTab = 'all';

// 갤러리 탭 전환 함수
function switchGalleryTab(tab) {
    currentGalleryTab = tab;
    
    // 탭 버튼 스타일 업데이트
    document.querySelectorAll('.gallery-tab').forEach(btn => {
        btn.classList.remove('bg-gradient-to-r', 'from-purple-600', 'to-cyan-500', 'text-white');
        btn.classList.add('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
    });
    
    const activeTab = document.getElementById(`tab${tab.charAt(0).toUpperCase() + tab.slice(1).replace('s', '')}`);
    if (activeTab) {
        activeTab.classList.remove('text-gray-400', 'hover:text-white', 'hover:bg-white/5');
        activeTab.classList.add('bg-gradient-to-r', 'from-purple-600', 'to-cyan-500', 'text-white');
    }
    
    // 필터 적용
    applyFilters();
}

// 전역 스코프로 export
window.switchGalleryTab = switchGalleryTab;

// 가격 포맷 함수
function formatPrice(price) {
    if (price >= 1000000000) return (price / 100000000).toFixed(1) + '억원';
    if (price >= 10000000) return (price / 10000000).toFixed(0) + '천만원';
    if (price >= 10000) return (price / 10000).toFixed(0) + '만원';
    return price.toLocaleString() + '원';
}

// 필터링 함수
function filterGallery() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const categoryFilter = document.getElementById('categoryFilter').value;
    const priceFilter = document.getElementById('priceFilter').value;
    
    const items = document.querySelectorAll('.gallery-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        const title = item.getAttribute('data-title') || '';
        const artist = item.getAttribute('data-artist') || '';
        const category = item.getAttribute('data-category') || '';
        const price = parseInt(item.getAttribute('data-price')) || 0;
        
        // 검색어 매치
        const searchMatch = !searchTerm || 
                           title.includes(searchTerm) || 
                           artist.includes(searchTerm);
        
        // 카테고리 매치
        const categoryMatch = !categoryFilter || category === categoryFilter;
        
        // 가격 범위 매치
        let priceMatch = true;
        if (priceFilter) {
            const [min, max] = priceFilter.split('-').map(Number);
            priceMatch = price >= min && price <= max;
        }
        
        // 모든 조건 만족 시 표시
        if (searchMatch && categoryMatch && priceMatch) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 결과 카운트 업데이트
    document.getElementById('resultCount').textContent = visibleCount;
    
    // 결과 없음 표시
    const noResults = document.getElementById('noResults');
    const grid = document.getElementById('galleryGrid');
    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        grid.classList.remove('hidden');
    }
}

// 정렬 함수
function sortGallery() {
    const sortOrder = document.getElementById('sortOrder').value;
    const grid = document.getElementById('galleryGrid');
    const items = Array.from(document.querySelectorAll('.gallery-item'));
    
    items.sort((a, b) => {
        switch (sortOrder) {
            case 'newest':
                return new Date(b.getAttribute('data-created')) - new Date(a.getAttribute('data-created'));
            case 'oldest':
                return new Date(a.getAttribute('data-created')) - new Date(b.getAttribute('data-created'));
            case 'price_high':
                return parseInt(b.getAttribute('data-price')) - parseInt(a.getAttribute('data-price'));
            case 'price_low':
                return parseInt(a.getAttribute('data-price')) - parseInt(b.getAttribute('data-price'));
            case 'popular':
                return parseInt(b.getAttribute('data-views')) - parseInt(a.getAttribute('data-views'));
            default:
                return 0;
        }
    });
    
    // DOM 재배치
    items.forEach(item => grid.appendChild(item));
}

// 빠른 필터 함수
function quickFilter(type) {
    // 필터 초기화
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    
    const items = document.querySelectorAll('.gallery-item');
    let visibleCount = 0;
    
    items.forEach(item => {
        let show = false;
        
        switch (type) {
            case 'minted':
                show = item.getAttribute('data-minted') === '1';
                break;
            case 'korean':
                const artist = item.getAttribute('data-artist') || '';
                // 한글 감지 (간단한 방법)
                show = /[ㄱ-ㅎ|ㅏ-ㅣ|가-힣]/.test(artist);
                break;
            case 'high-value':
                const price = parseInt(item.getAttribute('data-price')) || 0;
                show = price >= 100000000; // 1억원 이상
                break;
        }
        
        if (show) {
            item.style.display = '';
            visibleCount++;
        } else {
            item.style.display = 'none';
        }
    });
    
    // 결과 카운트 업데이트
    document.getElementById('resultCount').textContent = visibleCount;
    
    // 결과 없음 표시
    const noResults = document.getElementById('noResults');
    const grid = document.getElementById('galleryGrid');
    if (visibleCount === 0) {
        noResults.classList.remove('hidden');
        grid.classList.add('hidden');
    } else {
        noResults.classList.add('hidden');
        grid.classList.remove('hidden');
    }
}

// 필터 초기화
function resetFilters() {
    document.getElementById('searchInput').value = '';
    document.getElementById('categoryFilter').value = '';
    document.getElementById('priceFilter').value = '';
    document.getElementById('sortOrder').value = 'newest';
    
    filterGallery();
    sortGallery();
}

// 이미지 lazy loading
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('.gallery-item img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.src; // 실제로는 data-src를 사용하는 것이 좋지만, 여기서는 간단히
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
});
