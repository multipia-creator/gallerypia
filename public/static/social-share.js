/**
 * GalleryPia - Social Share System
 * L4-6: Open Graph, Twitter Cards, social sharing
 */

class SocialShare {
  constructor() {
    this.platforms = {
      facebook: { name: 'Facebook', icon: 'fab fa-facebook-f', color: '#1877F2' },
      twitter: { name: 'Twitter', icon: 'fab fa-twitter', color: '#1DA1F2' },
      pinterest: { name: 'Pinterest', icon: 'fab fa-pinterest', color: '#E60023' },
      linkedin: { name: 'LinkedIn', icon: 'fab fa-linkedin-in', color: '#0A66C2' },
      kakao: { name: 'KakaoTalk', icon: 'fas fa-comment', color: '#FEE500' },
      copy: { name: 'Link Copy', icon: 'fas fa-link', color: '#6B7280' }
    };
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  init() {
    console.log('Social Share System initialized');
    this.injectMetaTags();
  }

  injectMetaTags() {
    // Add Open Graph and Twitter Card meta tags dynamically
    const metaTags = [
      { property: 'og:site_name', content: 'GalleryPia' },
      { property: 'og:type', content: 'website' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:site', content: '@gallerypia' }
    ];

    metaTags.forEach(tag => {
      const meta = document.createElement('meta');
      if (tag.property) meta.setAttribute('property', tag.property);
      if (tag.name) meta.setAttribute('name', tag.name);
      meta.setAttribute('content', tag.content);
      document.head.appendChild(meta);
    });
  }

  share(platform, data) {
    const { title, description, image, url } = data;
    const shareUrl = url || window.location.href;

    const urls = {
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(shareUrl)}`,
      pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(description)}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    };

    if (platform === 'copy') {
      this.copyToClipboard(shareUrl);
      return;
    }

    if (urls[platform]) {
      window.open(urls[platform], '_blank', 'width=600,height=400');
    }
  }

  copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
      if (window.showSuccessToast) {
        window.showSuccessToast('링크가 클립보드에 복사되었습니다');
      } else {
        alert('링크가 복사되었습니다');
      }
    });
  }

  createShareButton(data) {
    return `
      <button onclick="window.socialShare.showShareModal(${JSON.stringify(data).replace(/"/g, '&quot;')})" 
              class="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700">
        <i class="fas fa-share-alt mr-2"></i>공유
      </button>
    `;
  }

  showShareModal(data) {
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4';
    modal.innerHTML = `
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h3 class="text-xl font-bold mb-4">공유하기</h3>
        <div class="grid grid-cols-3 gap-3">
          ${Object.entries(this.platforms).map(([key, platform]) => `
            <button onclick="window.socialShare.share('${key}', ${JSON.stringify(data).replace(/"/g, '&quot;')}); this.closest('.fixed').remove();" 
                    class="flex flex-col items-center p-3 rounded-lg hover:bg-gray-100 transition-colors">
              <i class="${platform.icon} text-2xl mb-2" style="color: ${platform.color}"></i>
              <span class="text-xs">${platform.name}</span>
            </button>
          `).join('')}
        </div>
        <button onclick="this.closest('.fixed').remove()" class="mt-4 w-full bg-gray-200 py-2 rounded-lg hover:bg-gray-300">
          닫기
        </button>
      </div>
    `;
    document.body.appendChild(modal);
  }
}

window.socialShare = new SocialShare();
