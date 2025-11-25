/**
 * Image Preview & Lightbox for GalleryPia
 * 
 * Provides advanced image preview functionality:
 * - Fullscreen lightbox
 * - Zoom in/out
 * - Pan/drag
 * - Rotate
 * - Gallery navigation (prev/next)
 * - Keyboard shortcuts
 * - Touch gestures (pinch-to-zoom)
 * - Thumbnail strip
 * 
 * Addresses UX-M-005: Improve image preview functionality
 * 
 * Usage:
 * ```javascript
 * // Initialize image preview
 * initializeImagePreview('.artwork-image');
 * 
 * // Open lightbox programmatically
 * openLightbox('/path/to/image.jpg', {
 *   title: '작품 제목',
 *   description: '작품 설명'
 * });
 * 
 * // Open gallery lightbox
 * openGalleryLightbox(images, 0); // Open at index 0
 * ```
 */

// =============================================================================
// Global State
// =============================================================================

let lightboxOpen = false;
let currentImageIndex = 0;
let images = [];
let zoomLevel = 1;
let rotation = 0;
let isDragging = false;
let startX = 0;
let startY = 0;
let translateX = 0;
let translateY = 0;

// =============================================================================
// Initialize Image Preview
// =============================================================================

/**
 * Initialize image preview on all matching elements
 * @param {string} selector - Image selector
 * @param {Object} [options] - Configuration options
 */
function initializeImagePreview(selector, options = {}) {
  const imageElements = document.querySelectorAll(selector);
  
  imageElements.forEach((img, index) => {
    img.style.cursor = 'pointer';
    img.setAttribute('data-preview-index', index);
    
    img.addEventListener('click', (e) => {
      e.preventDefault();
      
      // Build images array
      images = Array.from(imageElements).map(el => ({
        src: el.src || el.dataset.src,
        thumbnail: el.src,
        title: el.alt || el.dataset.title || '',
        description: el.dataset.description || ''
      }));
      
      openLightbox(images[index].src, {
        title: images[index].title,
        description: images[index].description,
        gallery: images.length > 1,
        index
      });
    });
  });
}

// =============================================================================
// Lightbox Management
// =============================================================================

/**
 * Open lightbox with single image
 * @param {string} imageSrc - Image source URL
 * @param {Object} options - Lightbox options
 */
function openLightbox(imageSrc, options = {}) {
  const {
    title = '',
    description = '',
    gallery = false,
    index = 0
  } = options;

  if (lightboxOpen) {
    closeLightbox();
  }

  currentImageIndex = index;
  resetTransform();

  // Create lightbox HTML
  const lightboxHTML = `
    <div class="lightbox-overlay" id="lightbox-overlay">
      <div class="lightbox-container">
        <!-- Header -->
        <div class="lightbox-header">
          <div class="lightbox-info">
            ${title ? `<h3 class="lightbox-title">${title}</h3>` : ''}
            ${description ? `<p class="lightbox-description">${description}</p>` : ''}
          </div>
          
          <div class="lightbox-controls">
            <button type="button" class="lightbox-btn" onclick="zoomIn()" title="확대 (Ctrl++)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35M11 8v6M8 11h6"/>
              </svg>
            </button>
            
            <button type="button" class="lightbox-btn" onclick="zoomOut()" title="축소 (Ctrl+-)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="11" cy="11" r="8"/>
                <path d="M21 21l-4.35-4.35M8 11h6"/>
              </svg>
            </button>
            
            <button type="button" class="lightbox-btn" onclick="resetZoom()" title="원본 크기 (Ctrl+0)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="18" height="18" rx="2"/>
                <path d="M9 9h6v6H9z"/>
              </svg>
            </button>
            
            <button type="button" class="lightbox-btn" onclick="rotateImage()" title="회전 (R)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
              </svg>
            </button>
            
            <button type="button" class="lightbox-btn" onclick="closeLightbox()" title="닫기 (Esc)">
              <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M18 6L6 18M6 6l12 12"/>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- Image Container -->
        <div class="lightbox-content" id="lightbox-content">
          ${gallery ? `
            <button type="button" class="lightbox-nav lightbox-nav-prev" onclick="previousImage()" title="이전 (←)">
              <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M15 18l-6-6 6-6"/>
              </svg>
            </button>
          ` : ''}
          
          <div class="lightbox-image-container" id="lightbox-image-container">
            <img 
              src="${imageSrc}" 
              alt="${title}"
              class="lightbox-image"
              id="lightbox-image"
              draggable="false"
            />
          </div>
          
          ${gallery ? `
            <button type="button" class="lightbox-nav lightbox-nav-next" onclick="nextImage()" title="다음 (→)">
              <svg width="32" height="32" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M9 18l6-6-6-6"/>
              </svg>
            </button>
          ` : ''}
        </div>
        
        <!-- Gallery Thumbnails -->
        ${gallery && images.length > 1 ? `
          <div class="lightbox-thumbnails" id="lightbox-thumbnails">
            ${images.map((img, idx) => `
              <div class="lightbox-thumbnail ${idx === index ? 'active' : ''}" onclick="goToImage(${idx})">
                <img src="${img.thumbnail}" alt="${img.title}">
              </div>
            `).join('')}
          </div>
        ` : ''}
        
        <!-- Footer Info -->
        <div class="lightbox-footer">
          ${gallery ? `
            <span class="lightbox-counter">${index + 1} / ${images.length}</span>
          ` : ''}
          <span class="lightbox-zoom">확대: ${Math.round(zoomLevel * 100)}%</span>
        </div>
      </div>
    </div>
  `;

  // Add to body
  const container = document.createElement('div');
  container.innerHTML = lightboxHTML;
  document.body.appendChild(container.firstElementChild);

  // Prevent body scroll
  document.body.style.overflow = 'hidden';
  
  lightboxOpen = true;

  // Setup event listeners
  setupLightboxEvents();
}

/**
 * Close lightbox
 */
function closeLightbox() {
  const overlay = document.getElementById('lightbox-overlay');
  if (overlay) {
    overlay.remove();
  }
  
  document.body.style.overflow = '';
  lightboxOpen = false;
  resetTransform();
}

// =============================================================================
// Gallery Navigation
// =============================================================================

/**
 * Go to specific image in gallery
 * @param {number} index - Image index
 */
function goToImage(index) {
  if (index < 0 || index >= images.length) return;
  
  currentImageIndex = index;
  resetTransform();
  updateLightboxImage();
  updateThumbnailsActive();
}

/**
 * Go to next image
 */
function nextImage() {
  if (currentImageIndex < images.length - 1) {
    goToImage(currentImageIndex + 1);
  }
}

/**
 * Go to previous image
 */
function previousImage() {
  if (currentImageIndex > 0) {
    goToImage(currentImageIndex - 1);
  }
}

/**
 * Update lightbox image
 */
function updateLightboxImage() {
  const img = document.getElementById('lightbox-image');
  const titleEl = document.querySelector('.lightbox-title');
  const descEl = document.querySelector('.lightbox-description');
  const counterEl = document.querySelector('.lightbox-counter');
  
  if (!img) return;
  
  const currentImage = images[currentImageIndex];
  
  img.src = currentImage.src;
  img.alt = currentImage.title;
  
  if (titleEl) titleEl.textContent = currentImage.title;
  if (descEl) descEl.textContent = currentImage.description;
  if (counterEl) counterEl.textContent = `${currentImageIndex + 1} / ${images.length}`;
}

/**
 * Update active thumbnail
 */
function updateThumbnailsActive() {
  const thumbnails = document.querySelectorAll('.lightbox-thumbnail');
  thumbnails.forEach((thumb, idx) => {
    if (idx === currentImageIndex) {
      thumb.classList.add('active');
    } else {
      thumb.classList.remove('active');
    }
  });
}

// =============================================================================
// Zoom Controls
// =============================================================================

/**
 * Zoom in
 */
function zoomIn() {
  zoomLevel = Math.min(zoomLevel + 0.25, 5);
  applyTransform();
}

/**
 * Zoom out
 */
function zoomOut() {
  zoomLevel = Math.max(zoomLevel - 0.25, 0.5);
  applyTransform();
}

/**
 * Reset zoom to 100%
 */
function resetZoom() {
  zoomLevel = 1;
  translateX = 0;
  translateY = 0;
  rotation = 0;
  applyTransform();
}

/**
 * Rotate image 90 degrees
 */
function rotateImage() {
  rotation = (rotation + 90) % 360;
  applyTransform();
}

/**
 * Reset all transforms
 */
function resetTransform() {
  zoomLevel = 1;
  rotation = 0;
  translateX = 0;
  translateY = 0;
  applyTransform();
}

/**
 * Apply transform to image
 */
function applyTransform() {
  const img = document.getElementById('lightbox-image');
  const zoomEl = document.querySelector('.lightbox-zoom');
  
  if (img) {
    img.style.transform = `
      translate(${translateX}px, ${translateY}px)
      scale(${zoomLevel})
      rotate(${rotation}deg)
    `;
    
    // Update cursor based on zoom
    const container = document.getElementById('lightbox-image-container');
    if (container) {
      container.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
    }
  }
  
  if (zoomEl) {
    zoomEl.textContent = `확대: ${Math.round(zoomLevel * 100)}%`;
  }
}

// =============================================================================
// Event Handlers
// =============================================================================

/**
 * Setup lightbox event listeners
 */
function setupLightboxEvents() {
  const overlay = document.getElementById('lightbox-overlay');
  const content = document.getElementById('lightbox-content');
  const img = document.getElementById('lightbox-image');
  
  // Close on overlay click
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay || e.target === content) {
      closeLightbox();
    }
  });
  
  // Keyboard shortcuts
  document.addEventListener('keydown', handleLightboxKeyboard);
  
  // Mouse drag (pan)
  if (img) {
    img.addEventListener('mousedown', handleDragStart);
    document.addEventListener('mousemove', handleDragMove);
    document.addEventListener('mouseup', handleDragEnd);
    
    // Mouse wheel zoom
    img.addEventListener('wheel', handleMouseWheel, { passive: false });
    
    // Double-click to zoom
    img.addEventListener('dblclick', handleDoubleClick);
  }
  
  // Touch gestures
  if (img) {
    let touchStartDistance = 0;
    let touchStartZoom = 1;
    
    img.addEventListener('touchstart', (e) => {
      if (e.touches.length === 2) {
        // Pinch-to-zoom
        touchStartDistance = getTouchDistance(e.touches);
        touchStartZoom = zoomLevel;
      }
    });
    
    img.addEventListener('touchmove', (e) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const currentDistance = getTouchDistance(e.touches);
        const scale = currentDistance / touchStartDistance;
        zoomLevel = Math.min(Math.max(touchStartZoom * scale, 0.5), 5);
        applyTransform();
      }
    }, { passive: false });
  }
}

/**
 * Handle keyboard shortcuts
 */
function handleLightboxKeyboard(e) {
  if (!lightboxOpen) return;
  
  switch (e.key) {
    case 'Escape':
      closeLightbox();
      break;
    case 'ArrowLeft':
      previousImage();
      break;
    case 'ArrowRight':
      nextImage();
      break;
    case '+':
    case '=':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomIn();
      }
      break;
    case '-':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        zoomOut();
      }
      break;
    case '0':
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        resetZoom();
      }
      break;
    case 'r':
    case 'R':
      rotateImage();
      break;
  }
}

/**
 * Handle drag start
 */
function handleDragStart(e) {
  if (zoomLevel <= 1) return;
  
  isDragging = true;
  startX = e.clientX - translateX;
  startY = e.clientY - translateY;
  
  const container = document.getElementById('lightbox-image-container');
  if (container) {
    container.style.cursor = 'grabbing';
  }
}

/**
 * Handle drag move
 */
function handleDragMove(e) {
  if (!isDragging) return;
  
  e.preventDefault();
  translateX = e.clientX - startX;
  translateY = e.clientY - startY;
  applyTransform();
}

/**
 * Handle drag end
 */
function handleDragEnd() {
  if (!isDragging) return;
  
  isDragging = false;
  
  const container = document.getElementById('lightbox-image-container');
  if (container) {
    container.style.cursor = zoomLevel > 1 ? 'grab' : 'default';
  }
}

/**
 * Handle mouse wheel zoom
 */
function handleMouseWheel(e) {
  e.preventDefault();
  
  const delta = e.deltaY > 0 ? -0.1 : 0.1;
  zoomLevel = Math.min(Math.max(zoomLevel + delta, 0.5), 5);
  applyTransform();
}

/**
 * Handle double-click to zoom
 */
function handleDoubleClick(e) {
  if (zoomLevel === 1) {
    zoomLevel = 2;
  } else {
    zoomLevel = 1;
    translateX = 0;
    translateY = 0;
  }
  applyTransform();
}

/**
 * Get distance between two touch points
 */
function getTouchDistance(touches) {
  const dx = touches[0].clientX - touches[1].clientX;
  const dy = touches[0].clientY - touches[1].clientY;
  return Math.sqrt(dx * dx + dy * dy);
}

// =============================================================================
// Gallery Lightbox Helper
// =============================================================================

/**
 * Open gallery lightbox with array of images
 * @param {Array} imageArray - Array of image objects
 * @param {number} startIndex - Starting index
 */
function openGalleryLightbox(imageArray, startIndex = 0) {
  images = imageArray;
  currentImageIndex = startIndex;
  
  const firstImage = images[startIndex];
  openLightbox(firstImage.src, {
    title: firstImage.title,
    description: firstImage.description,
    gallery: true,
    index: startIndex
  });
}

// =============================================================================
// Cleanup
// =============================================================================

// Cleanup on page unload
window.addEventListener('beforeunload', () => {
  if (lightboxOpen) {
    closeLightbox();
  }
});

// =============================================================================
// Export
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeImagePreview,
    openLightbox,
    closeLightbox,
    openGalleryLightbox,
    goToImage,
    nextImage,
    previousImage,
    zoomIn,
    zoomOut,
    resetZoom,
    rotateImage
  };
}

// Expose functions globally for onclick handlers
window.openLightbox = openLightbox;
window.closeLightbox = closeLightbox;
window.openGalleryLightbox = openGalleryLightbox;
window.goToImage = goToImage;
window.nextImage = nextImage;
window.previousImage = previousImage;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;
window.rotateImage = rotateImage;
