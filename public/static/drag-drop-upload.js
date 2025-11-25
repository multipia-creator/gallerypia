/**
 * Drag & Drop File Upload for GalleryPia
 * 
 * Provides drag-and-drop file upload functionality:
 * - Visual drag-over feedback
 * - File type validation
 * - File size validation
 * - Multiple file support
 * - Image preview generation
 * - Upload progress tracking
 * - Error handling
 * 
 * Addresses UX-M-004: Add drag & drop file upload
 * 
 * Usage:
 * ```javascript
 * // Initialize drag-drop zone
 * initializeDragDrop('#upload-zone', {
 *   onFiles: (files) => {
 *     uploadFiles(files);
 *   },
 *   accept: ['image/*'],
 *   maxSize: 10 * 1024 * 1024, // 10MB
 *   multiple: true
 * });
 * 
 * // Create upload zone programmatically
 * const uploader = createUploadZone('#container', {
 *   onUpload: async (file) => {
 *     return await uploadToServer(file);
 *   }
 * });
 * ```
 */

// =============================================================================
// Drag & Drop Zone Initialization
// =============================================================================

/**
 * Initialize drag-drop zone
 * @param {string|HTMLElement} target - Target element or selector
 * @param {Object} options - Configuration options
 * @param {Function} options.onFiles - Callback when files are dropped
 * @param {Array} [options.accept] - Accepted file types (MIME types or extensions)
 * @param {number} [options.maxSize] - Maximum file size in bytes
 * @param {number} [options.maxFiles] - Maximum number of files
 * @param {boolean} [options.multiple=true] - Allow multiple files
 * @param {boolean} [options.preview=true] - Show image previews
 * @param {string} [options.message] - Custom drop zone message
 */
function initializeDragDrop(target, options = {}) {
  const {
    onFiles,
    accept = [],
    maxSize = 10 * 1024 * 1024, // 10MB default
    maxFiles = 10,
    multiple = true,
    preview = true,
    message = '파일을 드래그하거나 클릭하여 업로드'
  } = options;

  const element = typeof target === 'string' ? document.querySelector(target) : target;
  if (!element) return null;

  // Add drag-drop styling
  element.classList.add('drag-drop-zone');
  
  if (!element.querySelector('.drag-drop-content')) {
    element.innerHTML = `
      <div class="drag-drop-content">
        <svg class="drag-drop-icon" width="48" height="48" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M24 8v32M8 24h32" stroke-linecap="round"/>
        </svg>
        <p class="drag-drop-message">${message}</p>
        <p class="drag-drop-hint">또는 클릭하여 파일 선택</p>
      </div>
      <input type="file" class="drag-drop-input" ${multiple ? 'multiple' : ''} ${accept.length ? `accept="${accept.join(',')}"` : ''} style="display: none;">
    `;
  }

  const input = element.querySelector('.drag-drop-input');

  // Prevent default drag behaviors
  ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    element.addEventListener(eventName, preventDefaults, false);
    document.body.addEventListener(eventName, preventDefaults, false);
  });

  // Highlight drop zone when item is dragged over
  ['dragenter', 'dragover'].forEach(eventName => {
    element.addEventListener(eventName, () => {
      element.classList.add('drag-drop-active');
    }, false);
  });

  ['dragleave', 'drop'].forEach(eventName => {
    element.addEventListener(eventName, () => {
      element.classList.remove('drag-drop-active');
    }, false);
  });

  // Handle dropped files
  element.addEventListener('drop', (e) => {
    const dt = e.dataTransfer;
    const files = Array.from(dt.files);
    
    handleFiles(files, { accept, maxSize, maxFiles, multiple, onFiles, preview });
  }, false);

  // Handle click to select files
  element.addEventListener('click', () => {
    input.click();
  });

  input.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFiles(files, { accept, maxSize, maxFiles, multiple, onFiles, preview });
  });

  return {
    element,
    input,
    reset() {
      input.value = '';
      element.classList.remove('drag-drop-active');
    }
  };
}

/**
 * Prevent default drag behaviors
 */
function preventDefaults(e) {
  e.preventDefault();
  e.stopPropagation();
}

// =============================================================================
// File Handling
// =============================================================================

/**
 * Handle selected/dropped files
 * @param {Array} files - File objects
 * @param {Object} options - Validation options
 */
function handleFiles(files, options) {
  const { accept, maxSize, maxFiles, multiple, onFiles, preview } = options;

  // Limit number of files
  if (!multiple && files.length > 1) {
    if (typeof showError === 'function') {
      showError('한 번에 하나의 파일만 업로드할 수 있습니다.');
    }
    return;
  }

  if (files.length > maxFiles) {
    if (typeof showError === 'function') {
      showError(`최대 ${maxFiles}개의 파일만 업로드할 수 있습니다.`);
    }
    return;
  }

  // Validate files
  const validFiles = [];
  const errors = [];

  files.forEach(file => {
    // Check file type
    if (accept.length > 0 && !isFileTypeAccepted(file, accept)) {
      errors.push(`${file.name}: 지원하지 않는 파일 형식입니다.`);
      return;
    }

    // Check file size
    if (file.size > maxSize) {
      errors.push(`${file.name}: 파일 크기가 너무 큽니다. (최대 ${formatFileSize(maxSize)})`);
      return;
    }

    validFiles.push(file);
  });

  // Show errors
  if (errors.length > 0) {
    if (typeof showError === 'function') {
      showError(errors.join('\n'));
    } else {
      console.error('File validation errors:', errors);
    }
  }

  // Process valid files
  if (validFiles.length > 0) {
    if (preview && validFiles.some(f => f.type.startsWith('image/'))) {
      generatePreviews(validFiles);
    }

    if (onFiles) {
      onFiles(validFiles);
    }
  }
}

/**
 * Check if file type is accepted
 * @param {File} file - File object
 * @param {Array} accept - Accepted types
 * @returns {boolean} True if accepted
 */
function isFileTypeAccepted(file, accept) {
  return accept.some(type => {
    if (type.endsWith('/*')) {
      // Check category (e.g., 'image/*')
      const category = type.split('/')[0];
      return file.type.startsWith(category + '/');
    } else if (type.startsWith('.')) {
      // Check extension
      return file.name.toLowerCase().endsWith(type.toLowerCase());
    } else {
      // Check exact MIME type
      return file.type === type;
    }
  });
}

// =============================================================================
// Image Preview Generation
// =============================================================================

/**
 * Generate image previews for files
 * @param {Array} files - File objects
 * @returns {Promise<Array>} Array of preview data URLs
 */
function generatePreviews(files) {
  const imageFiles = files.filter(f => f.type.startsWith('image/'));
  const previews = [];

  imageFiles.forEach(file => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      previews.push({
        file,
        dataUrl: e.target.result
      });

      // Fire custom event
      document.dispatchEvent(new CustomEvent('file-preview-generated', {
        detail: { file, dataUrl: e.target.result }
      }));
    };

    reader.readAsDataURL(file);
  });

  return Promise.all(previews);
}

/**
 * Show preview thumbnails
 * @param {string|HTMLElement} container - Container element
 * @param {Array} previews - Array of {file, dataUrl} objects
 */
function showPreviewThumbnails(container, previews) {
  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return;

  const thumbnailsHTML = previews.map((preview, index) => `
    <div class="preview-thumbnail" data-file-index="${index}">
      <img src="${preview.dataUrl}" alt="${preview.file.name}">
      <div class="preview-thumbnail-info">
        <span class="preview-thumbnail-name">${preview.file.name}</span>
        <span class="preview-thumbnail-size">${formatFileSize(preview.file.size)}</span>
      </div>
      <button type="button" class="preview-thumbnail-remove" onclick="removePreview(${index})" aria-label="제거">
        <svg width="16" height="16" fill="currentColor">
          <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
          <path d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1z"/>
        </svg>
      </button>
    </div>
  `).join('');

  element.innerHTML = thumbnailsHTML;
}

// =============================================================================
// Advanced Upload Zone Creator
// =============================================================================

/**
 * Create advanced upload zone with progress tracking
 * @param {string|HTMLElement} container - Container element
 * @param {Object} options - Configuration
 * @returns {Object} Upload zone controller
 */
function createUploadZone(container, options = {}) {
  const {
    onUpload,
    accept = ['image/*'],
    maxSize = 10 * 1024 * 1024,
    multiple = true,
    autoUpload = false
  } = options;

  const element = typeof container === 'string' ? document.querySelector(container) : container;
  if (!element) return null;

  const files = [];
  let isUploading = false;

  // Create HTML structure
  element.innerHTML = `
    <div class="upload-zone-advanced">
      <div class="upload-zone-drop" id="drop-zone-${Date.now()}">
        <svg width="64" height="64" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M32 8v48M8 32h48" stroke-linecap="round"/>
        </svg>
        <h3 class="text-lg font-semibold">파일을 드래그하거나 클릭하여 업로드</h3>
        <p class="text-sm text-gray-600">최대 ${formatFileSize(maxSize)}</p>
        <input type="file" class="upload-zone-input" ${multiple ? 'multiple' : ''} accept="${accept.join(',')}" style="display: none;">
      </div>
      
      <div class="upload-zone-previews" id="previews-${Date.now()}" style="display: none;"></div>
      
      <div class="upload-zone-actions" style="display: none;">
        <button type="button" class="btn btn-primary" onclick="startUpload()">
          업로드 시작
        </button>
        <button type="button" class="btn btn-secondary" onclick="clearFiles()">
          모두 제거
        </button>
      </div>
    </div>
  `;

  const dropZone = element.querySelector('.upload-zone-drop');
  const previewsContainer = element.querySelector('.upload-zone-previews');
  const actionsContainer = element.querySelector('.upload-zone-actions');
  const input = element.querySelector('.upload-zone-input');

  // Initialize drag-drop
  initializeDragDrop(dropZone, {
    accept,
    maxSize,
    multiple,
    preview: false,
    onFiles: (selectedFiles) => {
      selectedFiles.forEach(file => {
        files.push({
          file,
          id: Date.now() + Math.random(),
          progress: 0,
          status: 'pending'
        });
      });

      updatePreviewsDisplay();

      if (autoUpload) {
        startUpload();
      }
    }
  });

  /**
   * Update previews display
   */
  function updatePreviewsDisplay() {
    if (files.length === 0) {
      previewsContainer.style.display = 'none';
      actionsContainer.style.display = 'none';
      dropZone.style.display = 'flex';
      return;
    }

    dropZone.style.display = 'none';
    previewsContainer.style.display = 'grid';
    actionsContainer.style.display = 'flex';

    previewsContainer.innerHTML = files.map((item, index) => `
      <div class="upload-file-card" data-file-id="${item.id}">
        ${item.file.type.startsWith('image/') ? `
          <div class="upload-file-preview">
            <img src="${URL.createObjectURL(item.file)}" alt="${item.file.name}">
          </div>
        ` : `
          <div class="upload-file-icon">
            <svg width="48" height="48" fill="currentColor">
              <path d="M14 2H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h8a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2z"/>
            </svg>
          </div>
        `}
        
        <div class="upload-file-info">
          <div class="upload-file-name">${item.file.name}</div>
          <div class="upload-file-size">${formatFileSize(item.file.size)}</div>
          
          <div class="upload-file-progress" style="display: ${item.status === 'uploading' ? 'block' : 'none'};">
            <div class="progress-bar h-1">
              <div class="progress-fill bg-blue-600" style="width: ${item.progress}%"></div>
            </div>
            <span class="text-xs text-gray-600">${Math.round(item.progress)}%</span>
          </div>
          
          <div class="upload-file-status">
            ${item.status === 'completed' ? '✓ 완료' : item.status === 'error' ? '✗ 오류' : '대기 중'}
          </div>
        </div>
        
        <button type="button" class="upload-file-remove" onclick="removeFile('${item.id}')" aria-label="제거">
          <svg width="20" height="20" fill="currentColor">
            <path d="M10 0C4.48 0 0 4.48 0 10s4.48 10 10 10 10-4.48 10-10S15.52 0 10 0zm5 13.59L13.59 15 10 11.41 6.41 15 5 13.59 8.59 10 5 6.41 6.41 5 10 8.59 13.59 5 15 6.41 11.41 10 15 13.59z"/>
          </svg>
        </button>
      </div>
    `).join('');
  }

  /**
   * Start uploading files
   */
  async function startUpload() {
    if (isUploading || !onUpload) return;

    isUploading = true;
    const pendingFiles = files.filter(item => item.status === 'pending');

    for (const item of pendingFiles) {
      item.status = 'uploading';
      updatePreviewsDisplay();

      try {
        // Call upload handler with progress callback
        await onUpload(item.file, (progress) => {
          item.progress = progress;
          updateFileProgress(item.id, progress);
        });

        item.status = 'completed';
        item.progress = 100;
      } catch (error) {
        item.status = 'error';
        console.error('Upload error:', error);
      }

      updatePreviewsDisplay();
    }

    isUploading = false;
  }

  /**
   * Update file upload progress
   */
  function updateFileProgress(fileId, progress) {
    const fileCard = previewsContainer.querySelector(`[data-file-id="${fileId}"]`);
    if (!fileCard) return;

    const progressBar = fileCard.querySelector('.progress-fill');
    const progressText = fileCard.querySelector('.upload-file-progress span');

    if (progressBar) {
      progressBar.style.width = `${progress}%`;
    }
    if (progressText) {
      progressText.textContent = `${Math.round(progress)}%`;
    }
  }

  /**
   * Remove file from queue
   */
  function removeFile(fileId) {
    const index = files.findIndex(item => item.id === fileId);
    if (index !== -1) {
      files.splice(index, 1);
      updatePreviewsDisplay();
    }
  }

  /**
   * Clear all files
   */
  function clearFiles() {
    files.length = 0;
    updatePreviewsDisplay();
  }

  // Expose functions globally for onclick handlers
  window.startUpload = startUpload;
  window.removeFile = removeFile;
  window.clearFiles = clearFiles;

  return {
    files,
    startUpload,
    removeFile,
    clearFiles,
    getFiles: () => files.map(item => item.file)
  };
}

// =============================================================================
// Utility Functions
// =============================================================================

/**
 * Format file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Formatted size
 */
function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Upload file to server with progress
 * @param {string} url - Upload URL
 * @param {File} file - File to upload
 * @param {Function} onProgress - Progress callback
 * @returns {Promise} Upload promise
 */
async function uploadFileToServer(url, file, onProgress) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    const formData = new FormData();
    formData.append('file', file);

    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const progress = (e.loaded / e.total) * 100;
        if (onProgress) {
          onProgress(progress);
        }
      }
    });

    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error(`Upload failed: ${xhr.statusText}`));
      }
    });

    xhr.addEventListener('error', () => {
      reject(new Error('Upload failed'));
    });

    xhr.open('POST', url);
    xhr.send(formData);
  });
}

// =============================================================================
// Export
// =============================================================================

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    initializeDragDrop,
    generatePreviews,
    showPreviewThumbnails,
    createUploadZone,
    uploadFileToServer,
    formatFileSize
  };
}
