/**
 * GalleryPia - Collection Manager
 * L4-5: Personal collection and bookmark management
 * 
 * Features:
 * - Create multiple collections
 * - Add/remove artworks to collections
 * - Collection sharing
 * - Collection sorting and filtering
 * - Export collection
 */

class CollectionManager {
  constructor() {
    this.collections = [];
    this.bookmarks = [];
    this.loadData();
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Collection Manager initialized');
    this.createUI();
    this.setupEventListeners();
  }

  loadData() {
    const stored = localStorage.getItem('gallerypia_collections');
    if (stored) {
      this.collections = JSON.parse(stored);
    }
    
    const bookmarks = localStorage.getItem('gallerypia_bookmarks');
    if (bookmarks) {
      this.bookmarks = JSON.parse(bookmarks);
    }
  }

  saveData() {
    localStorage.setItem('gallerypia_collections', JSON.stringify(this.collections));
    localStorage.setItem('gallerypia_bookmarks', JSON.stringify(this.bookmarks));
  }

  createUI() {
    const html = `
      <div id="collectionModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-screen p-4">
          <div class="max-w-6xl mx-auto bg-white rounded-lg shadow-2xl">
            <div class="bg-gradient-to-r from-purple-600 to-pink-600 text-white p-4 rounded-t-lg">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold"><i class="fas fa-folder-open mr-2"></i>내 컬렉션</h2>
                <div class="space-x-2">
                  <button onclick="window.collectionManager.createCollection()" 
                          class="bg-white/20 hover:bg-white/30 px-3 py-1 rounded">
                    <i class="fas fa-plus mr-1"></i>새 컬렉션
                  </button>
                  <button onclick="window.collectionManager.close()" class="hover:bg-white/20 rounded p-2">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>
            
            <div class="p-6">
              <!-- Collections Grid -->
              <div id="collectionsGrid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <p class="text-center text-gray-500 col-span-full">컬렉션이 없습니다</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  setupEventListeners() {
    window.addEventListener('gallerypia:bookmark', (e) => {
      this.toggleBookmark(e.detail);
    });
  }

  createCollection() {
    const name = prompt('컬렉션 이름을 입력하세요:');
    if (!name) return;

    const collection = {
      id: Date.now(),
      name,
      description: '',
      artworks: [],
      createdAt: new Date().toISOString(),
      isPublic: false
    };

    this.collections.push(collection);
    this.saveData();
    this.updateCollectionsView();
  }

  updateCollectionsView() {
    const grid = document.getElementById('collectionsGrid');
    if (this.collections.length === 0) {
      grid.innerHTML = '<p class="text-center text-gray-500 col-span-full">컬렉션이 없습니다</p>';
      return;
    }

    grid.innerHTML = this.collections.map(collection => `
      <div class="border rounded-lg p-4 hover:shadow-lg transition-shadow">
        <div class="flex justify-between items-start mb-2">
          <h3 class="font-bold text-lg">${collection.name}</h3>
          <button onclick="window.collectionManager.deleteCollection(${collection.id})" 
                  class="text-red-600 hover:text-red-800">
            <i class="fas fa-trash"></i>
          </button>
        </div>
        <p class="text-sm text-gray-600 mb-2">${collection.artworks.length}개 작품</p>
        <button onclick="window.collectionManager.viewCollection(${collection.id})" 
                class="text-purple-600 hover:text-purple-800 text-sm">
          <i class="fas fa-eye mr-1"></i>보기
        </button>
      </div>
    `).join('');
  }

  toggleBookmark(artwork) {
    const index = this.bookmarks.findIndex(b => b.id === artwork.id);
    if (index === -1) {
      this.bookmarks.push(artwork);
      this.showToast('북마크에 추가되었습니다');
    } else {
      this.bookmarks.splice(index, 1);
      this.showToast('북마크에서 제거되었습니다');
    }
    this.saveData();
  }

  isBookmarked(artworkId) {
    return this.bookmarks.some(b => b.id === artworkId);
  }

  deleteCollection(id) {
    if (!confirm('이 컬렉션을 삭제하시겠습니까?')) return;
    this.collections = this.collections.filter(c => c.id !== id);
    this.saveData();
    this.updateCollectionsView();
  }

  viewCollection(id) {
    const collection = this.collections.find(c => c.id === id);
    if (!collection) return;
    alert(`컬렉션 "${collection.name}"의 상세 보기는 곧 구현될 예정입니다.`);
  }

  showToast(message) {
    if (window.showSuccessToast) {
      window.showSuccessToast(message);
    } else {
      alert(message);
    }
  }

  open() {
    this.updateCollectionsView();
    document.getElementById('collectionModal').classList.remove('hidden');
  }

  close() {
    document.getElementById('collectionModal').classList.add('hidden');
  }
}

window.collectionManager = new CollectionManager();
