/**
 * GalleryPia - Share Utilities
 * 
 * Client-side JavaScript for social media sharing
 * 
 * Features:
 * - Platform-specific share URLs
 * - Copy to clipboard
 * - QR code generation
 * - Share tracking
 * - Native Web Share API support
 * 
 * @version 1.0.0
 * @date 2025-11-23
 */

// Share content to various platforms
window.shareContent = function(platform, url, title, description = '', image = '', hashtags = []) {
  url = decodeURIComponent(url);
  title = decodeURIComponent(title);
  description = decodeURIComponent(description);
  image = decodeURIComponent(image);
  
  const shareUrls = {
    twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}${hashtags.length > 0 ? '&hashtags=' + hashtags.join(',') : ''}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}${image ? '&media=' + encodeURIComponent(image) : ''}`,
    reddit: `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`,
    telegram: `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    whatsapp: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + url)}`,
    email: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(description + '\n\n' + url)}`
  };
  
  if (platform === 'copy') {
    copyToClipboard(url, '링크가 클립보드에 복사되었습니다.');
    trackShare(platform, url);
    return;
  }
  
  if (platform === 'native' && navigator.share) {
    navigator.share({
      title: title,
      text: description,
      url: url
    }).then(() => {
      trackShare(platform, url);
      showShareNotification('공유가 완료되었습니다.');
    }).catch((error) => {
      console.error('Share failed:', error);
    });
    return;
  }
  
  const shareUrl = shareUrls[platform];
  if (shareUrl) {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    trackShare(platform, url);
  }
};

// Copy to clipboard
window.copyToClipboard = function(text, successMessage = '복사되었습니다.') {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(text).then(() => {
      showShareNotification(successMessage);
    }).catch((error) => {
      console.error('Copy failed:', error);
      fallbackCopy(text, successMessage);
    });
  } else {
    fallbackCopy(text, successMessage);
  }
};

// Fallback copy method
function fallbackCopy(text, successMessage) {
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  
  try {
    document.execCommand('copy');
    showShareNotification(successMessage);
  } catch (error) {
    console.error('Fallback copy failed:', error);
    showShareNotification('복사에 실패했습니다.', 'error');
  }
  
  document.body.removeChild(textarea);
}

// Copy share link from modal
window.copyShareLink = function() {
  const input = document.getElementById('share-url-input');
  if (input) {
    copyToClipboard(input.value);
  }
};

// Open share modal
window.openShareModal = function() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.classList.remove('hidden');
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.style.opacity = '1';
    }, 10);
  }
};

// Close share modal
window.closeShareModal = function() {
  const modal = document.getElementById('share-modal');
  if (modal) {
    modal.style.opacity = '0';
    setTimeout(() => {
      modal.classList.add('hidden');
    }, 300);
  }
};

// Generate QR code
window.generateQRCode = function(url) {
  // Use QR code API service
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  
  // Create modal with QR code
  const qrModal = document.createElement('div');
  qrModal.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-[101]';
  qrModal.innerHTML = `
    <div class="bg-gray-800 rounded-xl p-8 max-w-sm w-full mx-4">
      <div class="flex items-center justify-between mb-6">
        <h3 class="text-xl font-bold text-white">
          <i class="fas fa-qrcode mr-2 text-purple-500"></i>
          QR 코드
        </h3>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white text-2xl">
          <i class="fas fa-times"></i>
        </button>
      </div>
      
      <div class="bg-white p-4 rounded-lg mb-4">
        <img src="${qrUrl}" alt="QR Code" class="w-full h-auto" />
      </div>
      
      <p class="text-gray-400 text-sm text-center mb-4">
        스마트폰으로 QR 코드를 스캔하세요
      </p>
      
      <div class="flex gap-2">
        <button 
          onclick="downloadQRCode('${qrUrl}')"
          class="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors"
        >
          <i class="fas fa-download mr-2"></i>다운로드
        </button>
        <button 
          onclick="this.closest('.fixed').remove()"
          class="flex-1 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
        >
          닫기
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(qrModal);
};

// Download QR code
window.downloadQRCode = function(qrUrl) {
  const link = document.createElement('a');
  link.href = qrUrl;
  link.download = 'qrcode.png';
  link.click();
  
  showShareNotification('QR 코드가 다운로드되었습니다.');
};

// Track share events
function trackShare(platform, url) {
  // Send to analytics if available
  if (typeof gtag !== 'undefined') {
    gtag('event', 'share', {
      method: platform,
      content_type: 'artwork',
      item_id: url
    });
  }
  
  // Send to backend for tracking
  fetch('/api/tracking/share', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      platform,
      url,
      timestamp: new Date().toISOString()
    })
  }).catch(error => {
    console.error('Share tracking failed:', error);
  });
}

// Show share notification
function showShareNotification(message, type = 'success') {
  const notification = document.createElement('div');
  notification.className = `fixed top-6 right-6 px-6 py-4 rounded-lg shadow-lg z-[102] flex items-center gap-3 ${
    type === 'success' ? 'bg-green-600' : 'bg-red-600'
  } text-white`;
  notification.innerHTML = `
    <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'} text-xl"></i>
    <span>${message}</span>
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.opacity = '0';
    notification.style.transform = 'translateY(-10px)';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Check if Web Share API is supported
window.isNativeShareSupported = function() {
  return navigator.share !== undefined;
};

// Share with native API if available
window.nativeShare = function(title, text, url) {
  if (navigator.share) {
    navigator.share({
      title: title,
      text: text,
      url: url
    }).then(() => {
      trackShare('native', url);
      showShareNotification('공유가 완료되었습니다.');
    }).catch((error) => {
      console.error('Native share failed:', error);
    });
  } else {
    console.warn('Native share not supported');
    openShareModal();
  }
};

// Initialize share buttons
document.addEventListener('DOMContentLoaded', function() {
  // Add native share button if supported
  if (isNativeShareSupported()) {
    const shareButtons = document.querySelectorAll('.share-buttons');
    shareButtons.forEach(container => {
      const url = container.dataset.shareUrl;
      const title = container.dataset.shareTitle;
      
      if (url && title) {
        const nativeButton = document.createElement('button');
        nativeButton.className = 'share-button share-native bg-gradient-to-r from-purple-600 to-cyan-600 hover:from-purple-700 hover:to-cyan-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2';
        nativeButton.innerHTML = '<i class="fas fa-share"></i><span>공유</span>';
        nativeButton.onclick = () => nativeShare(title, '', url);
        
        container.insertBefore(nativeButton, container.firstChild);
      }
    });
  }
  
  // Close modal on escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      closeShareModal();
    }
  });
  
  // Close modal on outside click
  const shareModal = document.getElementById('share-modal');
  if (shareModal) {
    shareModal.addEventListener('click', function(e) {
      if (e.target === shareModal) {
        closeShareModal();
      }
    });
  }
  
  console.log('Share utilities initialized');
});

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    shareContent,
    copyToClipboard,
    generateQRCode,
    isNativeShareSupported,
    nativeShare
  };
}
