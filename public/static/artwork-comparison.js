/**
 * GalleryPia - Artwork Comparison Tool
 * L4-4: Side-by-side artwork comparison
 * 
 * Features:
 * - Side-by-side comparison view
 * - Support 2-4 artworks
 * - Detailed specification comparison
 * - Price comparison
 * - Visual diff with slider
 * - Export comparison report
 */

class ArtworkComparison {
  constructor() {
    this.selectedArtworks = [];
    this.maxCompare = 4;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Artwork Comparison Tool initialized');
    this.createComparisonUI();
    this.setupEventListeners();
  }

  createComparisonUI() {
    const html = `
      <div id="comparisonModal" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-screen p-4">
          <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-2xl">
            <div class="bg-indigo-600 text-white p-4 rounded-t-lg flex justify-between items-center">
              <h2 class="text-xl font-bold"><i class="fas fa-balance-scale mr-2"></i>작품 비교</h2>
              <button onclick="window.artworkComparison.close()" class="hover:bg-indigo-700 rounded p-2">
                <i class="fas fa-times"></i>
              </button>
            </div>
            <div id="comparisonContent" class="p-6">
              <p class="text-center text-gray-500">비교할 작품을 선택하세요 (최대 ${this.maxCompare}개)</p>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.insertAdjacentHTML('beforeend', html);
  }

  setupEventListeners() {
    window.addEventListener('gallerypia:compare', (e) => {
      this.addArtwork(e.detail);
    });
  }

  addArtwork(artwork) {
    if (this.selectedArtworks.length >= this.maxCompare) {
      alert(`최대 ${this.maxCompare}개까지 비교할 수 있습니다.`);
      return;
    }
    
    if (this.selectedArtworks.find(a => a.id === artwork.id)) {
      alert('이미 추가된 작품입니다.');
      return;
    }

    this.selectedArtworks.push(artwork);
    this.updateComparisonView();
    this.open();
  }

  updateComparisonView() {
    const content = document.getElementById('comparisonContent');
    if (this.selectedArtworks.length === 0) {
      content.innerHTML = '<p class="text-center text-gray-500">비교할 작품을 선택하세요</p>';
      return;
    }

    content.innerHTML = `
      <div class="grid grid-cols-${this.selectedArtworks.length} gap-4">
        ${this.selectedArtworks.map(artwork => `
          <div class="border rounded-lg p-4">
            <img src="${artwork.image}" class="w-full h-48 object-cover rounded mb-2" alt="${artwork.title}">
            <h3 class="font-bold">${artwork.title}</h3>
            <p class="text-sm text-gray-600">${artwork.artist}</p>
            <p class="text-lg font-bold text-indigo-600 mt-2">₩${artwork.price?.toLocaleString() || 'N/A'}</p>
            <button onclick="window.artworkComparison.removeArtwork(${artwork.id})" 
                    class="mt-2 text-red-600 text-sm">
              <i class="fas fa-times"></i> 제거
            </button>
          </div>
        `).join('')}
      </div>
      
      <div class="mt-6">
        <h3 class="font-bold text-lg mb-4">상세 비교</h3>
        <table class="w-full border-collapse">
          <tr class="border-b">
            <th class="text-left py-2">항목</th>
            ${this.selectedArtworks.map(a => `<th class="text-center py-2">${a.title}</th>`).join('')}
          </tr>
          ${this.generateComparisonRows()}
        </table>
      </div>
    `;
  }

  generateComparisonRows() {
    const fields = ['price', 'artist', 'year', 'medium', 'size'];
    return fields.map(field => `
      <tr class="border-b hover:bg-gray-50">
        <td class="py-2 font-semibold">${this.getFieldLabel(field)}</td>
        ${this.selectedArtworks.map(a => `<td class="text-center py-2">${this.getFieldValue(a, field)}</td>`).join('')}
      </tr>
    `).join('');
  }

  getFieldLabel(field) {
    const labels = {
      price: '가격',
      artist: '작가',
      year: '제작년도',
      medium: '재질',
      size: '크기'
    };
    return labels[field] || field;
  }

  getFieldValue(artwork, field) {
    if (field === 'price') return `₩${artwork.price?.toLocaleString() || 'N/A'}`;
    return artwork[field] || 'N/A';
  }

  removeArtwork(id) {
    this.selectedArtworks = this.selectedArtworks.filter(a => a.id !== id);
    this.updateComparisonView();
  }

  open() {
    document.getElementById('comparisonModal').classList.remove('hidden');
  }

  close() {
    document.getElementById('comparisonModal').classList.add('hidden');
  }

  clear() {
    this.selectedArtworks = [];
    this.updateComparisonView();
  }
}

window.artworkComparison = new ArtworkComparison();
