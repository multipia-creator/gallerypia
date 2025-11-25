/**
 * GalleryPia - Quick View Modal Component
 * 
 * TypeScript component for quick preview without navigation
 * Server-side rendering support with Cloudflare Pages
 * 
 * Features:
 * - Fast preview modal
 * - Image gallery
 * - Key information display
 * - Quick actions (like, share, view details)
 * - Keyboard navigation (arrow keys, escape)
 * - Touch gestures for mobile
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

export interface QuickViewProps {
  item: any;
  type?: 'artwork' | 'artist' | 'collection' | 'transaction';
  showActions?: boolean;
  onClose?: () => void;
}

/**
 * Render quick view modal for artwork
 */
export function renderArtworkQuickView(artwork: {
  id: number;
  title: string;
  artist_name: string;
  artist_id: number;
  category: string;
  image_url: string;
  price_krw: number;
  price_eth: number;
  description?: string;
  nft_minted: boolean;
  views_count: number;
  likes_count: number;
  created_at: string;
}): string {
  return `
    <div class="quick-view-modal fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4" 
         onclick="if(event.target === this) closeQuickView()">
      <div class="quick-view-container bg-gray-900 rounded-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-0">
          <!-- Image Section -->
          <div class="relative bg-black flex items-center justify-center p-8">
            <img 
              src="${artwork.image_url}" 
              alt="${artwork.title}"
              class="max-w-full max-h-[70vh] object-contain"
              loading="eager"
            />
            
            <!-- Close Button -->
            <button 
              onclick="closeQuickView()"
              class="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="닫기"
            >
              <i class="fas fa-times text-xl"></i>
            </button>
            
            <!-- NFT Badge -->
            ${artwork.nft_minted ? `
              <div class="absolute top-4 left-4 px-4 py-2 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-full text-white font-bold text-sm">
                <i class="fas fa-certificate mr-2"></i>NFT 민팅됨
              </div>
            ` : ''}
            
            <!-- Navigation Arrows -->
            <button 
              onclick="quickViewPrevious()"
              class="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="이전"
            >
              <i class="fas fa-chevron-left text-xl"></i>
            </button>
            
            <button 
              onclick="quickViewNext()"
              class="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-12 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
              aria-label="다음"
            >
              <i class="fas fa-chevron-right text-xl"></i>
            </button>
          </div>
          
          <!-- Info Section -->
          <div class="p-8 overflow-y-auto max-h-[90vh]">
            <!-- Header -->
            <div class="mb-6">
              <div class="flex items-start justify-between mb-4">
                <div class="flex-1">
                  <h2 class="text-3xl font-bold text-white mb-2">${artwork.title}</h2>
                  <a 
                    href="/artist/${artwork.artist_id}" 
                    class="text-purple-400 hover:text-purple-300 transition-colors flex items-center gap-2"
                  >
                    <i class="fas fa-user-circle"></i>
                    <span>${artwork.artist_name}</span>
                  </a>
                </div>
              </div>
              
              <div class="flex items-center gap-2 text-sm">
                <span class="px-3 py-1 bg-purple-600/20 text-purple-400 rounded-full">
                  ${artwork.category}
                </span>
                <span class="text-gray-500">
                  <i class="far fa-eye mr-1"></i>${artwork.views_count || 0}
                </span>
                <span class="text-gray-500">
                  <i class="far fa-heart mr-1"></i>${artwork.likes_count || 0}
                </span>
              </div>
            </div>
            
            <!-- Price -->
            <div class="mb-6 p-4 bg-gray-800 rounded-xl">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-gray-400 text-sm mb-1">현재 가격</p>
                  <p class="text-3xl font-bold text-white">${(artwork.price_krw / 10000).toFixed(0)}만원</p>
                  <p class="text-purple-400 text-sm">${artwork.price_eth.toFixed(3)} ETH</p>
                </div>
                <button class="px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white rounded-lg font-semibold transition-all">
                  구매하기
                </button>
              </div>
            </div>
            
            <!-- Description -->
            ${artwork.description ? `
              <div class="mb-6">
                <h3 class="text-lg font-bold text-white mb-3">작품 설명</h3>
                <p class="text-gray-400 leading-relaxed">${artwork.description}</p>
              </div>
            ` : ''}
            
            <!-- Quick Actions -->
            <div class="mb-6 flex gap-2">
              <button 
                onclick="toggleLike(${artwork.id})"
                class="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <i class="far fa-heart"></i>
                <span>좋아요</span>
              </button>
              
              <button 
                onclick="shareArtwork(${artwork.id})"
                class="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <i class="fas fa-share-alt"></i>
                <span>공유</span>
              </button>
              
              <button 
                onclick="addToCollection(${artwork.id})"
                class="flex-1 px-4 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <i class="fas fa-folder-plus"></i>
                <span>컬렉션</span>
              </button>
            </div>
            
            <!-- Details -->
            <div class="space-y-3">
              <div class="flex items-center justify-between py-2 border-b border-gray-800">
                <span class="text-gray-500">작품 ID</span>
                <span class="text-white font-mono">#${artwork.id}</span>
              </div>
              
              <div class="flex items-center justify-between py-2 border-b border-gray-800">
                <span class="text-gray-500">등록일</span>
                <span class="text-white">${new Date(artwork.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              
              <div class="flex items-center justify-between py-2 border-b border-gray-800">
                <span class="text-gray-500">NFT 상태</span>
                <span class="text-white">${artwork.nft_minted ? '민팅 완료' : '민팅 전'}</span>
              </div>
            </div>
            
            <!-- Full Details Button -->
            <div class="mt-6 pt-6 border-t border-gray-800">
              <a 
                href="/artwork/${artwork.id}"
                class="block w-full px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white text-center rounded-lg font-semibold transition-colors"
              >
                전체 상세정보 보기
                <i class="fas fa-arrow-right ml-2"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render quick view modal for artist
 */
export function renderArtistQuickView(artist: {
  id: number;
  name: string;
  bio?: string;
  profile_image?: string;
  artworks_count: number;
  followers_count: number;
  total_sales: number;
}): string {
  return `
    <div class="quick-view-modal fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
         onclick="if(event.target === this) closeQuickView()">
      <div class="quick-view-container bg-gray-900 rounded-2xl max-w-2xl w-full p-8">
        <div class="flex items-center justify-between mb-6">
          <h2 class="text-2xl font-bold text-white">아티스트 미리보기</h2>
          <button 
            onclick="closeQuickView()"
            class="w-10 h-10 bg-gray-800 hover:bg-gray-700 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="flex items-start gap-6 mb-6">
          <img 
            src="${artist.profile_image || '/static/default-avatar.png'}" 
            alt="${artist.name}"
            class="w-24 h-24 rounded-full object-cover"
          />
          
          <div class="flex-1">
            <h3 class="text-2xl font-bold text-white mb-2">${artist.name}</h3>
            ${artist.bio ? `<p class="text-gray-400 mb-4">${artist.bio}</p>` : ''}
            
            <div class="grid grid-cols-3 gap-4">
              <div>
                <p class="text-gray-500 text-sm">작품 수</p>
                <p class="text-white font-bold text-xl">${artist.artworks_count}</p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">팔로워</p>
                <p class="text-white font-bold text-xl">${artist.followers_count}</p>
              </div>
              <div>
                <p class="text-gray-500 text-sm">총 판매액</p>
                <p class="text-white font-bold text-xl">${(artist.total_sales / 10000).toFixed(0)}만원</p>
              </div>
            </div>
          </div>
        </div>
        
        <div class="flex gap-3">
          <button class="flex-1 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-semibold transition-colors">
            <i class="fas fa-user-plus mr-2"></i>팔로우
          </button>
          <a 
            href="/artist/${artist.id}"
            class="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white text-center rounded-lg font-semibold transition-colors"
          >
            프로필 보기
          </a>
        </div>
      </div>
    </div>
  `;
}

/**
 * Render quick view modal for collection
 */
export function renderCollectionQuickView(collection: {
  id: number;
  name: string;
  description?: string;
  cover_image?: string;
  artworks_count: number;
  total_value: number;
}): string {
  return `
    <div class="quick-view-modal fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4"
         onclick="if(event.target === this) closeQuickView()">
      <div class="quick-view-container bg-gray-900 rounded-2xl max-w-2xl w-full overflow-hidden">
        <div class="relative h-64">
          <img 
            src="${collection.cover_image || '/static/placeholder.jpg'}" 
            alt="${collection.name}"
            class="w-full h-full object-cover"
          />
          <button 
            onclick="closeQuickView()"
            class="absolute top-4 right-4 w-10 h-10 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center transition-colors"
          >
            <i class="fas fa-times"></i>
          </button>
        </div>
        
        <div class="p-8">
          <h2 class="text-3xl font-bold text-white mb-4">${collection.name}</h2>
          
          ${collection.description ? `
            <p class="text-gray-400 mb-6 leading-relaxed">${collection.description}</p>
          ` : ''}
          
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="p-4 bg-gray-800 rounded-lg">
              <p class="text-gray-500 text-sm mb-1">작품 수</p>
              <p class="text-white font-bold text-2xl">${collection.artworks_count}개</p>
            </div>
            <div class="p-4 bg-gray-800 rounded-lg">
              <p class="text-gray-500 text-sm mb-1">총 가치</p>
              <p class="text-white font-bold text-2xl">${(collection.total_value / 10000).toFixed(0)}만원</p>
            </div>
          </div>
          
          <a 
            href="/collection/${collection.id}"
            class="block w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white text-center rounded-lg font-semibold transition-all"
          >
            컬렉션 전체 보기
            <i class="fas fa-arrow-right ml-2"></i>
          </a>
        </div>
      </div>
    </div>
  `;
}
