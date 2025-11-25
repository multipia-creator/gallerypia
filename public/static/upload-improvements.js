/**
 * ============================================
 * 🔴 C4-1, C4-2: NFT Upload Improvements
 * ============================================
 * - Multi-file upload support
 * - Image preview before upload
 * - Upload progress tracking
 * - Metadata input helpers
 */

let selectedFiles = [];

document.addEventListener('DOMContentLoaded', () => {
  initUploadImprovements();
});

function initUploadImprovements() {
  // Initialize drag-drop if container exists
  const uploadContainer = document.getElementById('upload-container');
  if (uploadContainer) {
    setupDragDrop(uploadContainer);
  }
  
  // Add tooltips to metadata fields
  addMetadataTooltips();
  
  // Add preview container
  addPreviewContainer();
}

// ============================================
// C4-1: Multi-file Upload
// ============================================

function setupDragDrop(container) {
  // Create enhanced upload zone
  container.innerHTML = `
    <div id="upload-zone" class="border-2 border-dashed border-purple-300 rounded-lg p-12 text-center hover:border-purple-500 transition-colors cursor-pointer bg-purple-50 hover:bg-purple-100">
      <i class="fas fa-cloud-upload-alt text-6xl text-purple-400 mb-4"></i>
      <p class="text-xl font-medium mb-2 text-gray-700">파일을 드래그하거나 클릭하여 업로드</p>
      <p class="text-sm text-gray-500 mb-4">최대 10개 파일, 각 10MB 이하, JPG/PNG/GIF</p>
      <div class="flex justify-center gap-4 text-sm text-gray-600">
        <span><i class="fas fa-check text-green-500 mr-1"></i> 다중 파일 지원</span>
        <span><i class="fas fa-check text-green-500 mr-1"></i> 실시간 미리보기</span>
        <span><i class="fas fa-check text-green-500 mr-1"></i> 진행률 표시</span>
      </div>
      <input type="file" id="file-input-multi" multiple accept="image/*" class="hidden">
    </div>
    
    <!-- Preview Container -->
    <div id="preview-container" class="mt-6 hidden">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-bold">선택된 파일 (<span id="file-count">0</span>개)</h3>
        <button onclick="clearAllFiles()" class="text-sm text-red-600 hover:underline">
          <i class="fas fa-times-circle mr-1"></i> 전체 삭제
        </button>
      </div>
      <div id="preview-grid" class="grid grid-cols-2 md:grid-cols-4 gap-4"></div>
    </div>
    
    <!-- Upload Progress -->
    <div id="upload-progress-container" class="mt-6 hidden">
      <h3 class="text-lg font-bold mb-4">업로드 진행 중...</h3>
      <div id="upload-progress-list"></div>
    </div>
  `;
  
  const uploadZone = container.querySelector('#upload-zone');
  const fileInput = container.querySelector('#file-input-multi');
  
  // Click to upload
  uploadZone.addEventListener('click', () => fileInput.click());
  
  // Drag & Drop events
  uploadZone.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadZone.classList.add('border-purple-600', 'bg-purple-200');
  });
  
  uploadZone.addEventListener('dragleave', () => {
    uploadZone.classList.remove('border-purple-600', 'bg-purple-200');
  });
  
  uploadZone.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadZone.classList.remove('border-purple-600', 'bg-purple-200');
    
    const files = Array.from(e.dataTransfer.files);
    handleFileSelection(files);
  });
  
  fileInput.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleFileSelection(files);
  });
}

function handleFileSelection(files) {
  const validFiles = files.filter(file => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      if (typeof showErrorToast === 'function') {
        showErrorToast(`${file.name}은(는) 이미지 파일이 아닙니다`);
      }
      return false;
    }
    
    // Validate file size (10MB)
    if (file.size > 10 * 1024 * 1024) {
      if (typeof showErrorToast === 'function') {
        showErrorToast(`${file.name}은(는) 10MB를 초과합니다`);
      }
      return false;
    }
    
    return true;
  });
  
  // Check total count
  if (selectedFiles.length + validFiles.length > 10) {
    if (typeof showErrorToast === 'function') {
      showErrorToast('최대 10개 파일까지만 업로드 가능합니다');
    }
    return;
  }
  
  // Add to selected files
  selectedFiles = [...selectedFiles, ...validFiles];
  
  if (typeof showSuccessToast === 'function') {
    showSuccessToast(`${validFiles.length}개 파일 선택됨 (총 ${selectedFiles.length}개)`);
  }
  
  renderPreviews();
}

// ============================================
// C4-2: Image Preview
// ============================================

function renderPreviews() {
  const previewContainer = document.getElementById('preview-container');
  const previewGrid = document.getElementById('preview-grid');
  const fileCount = document.getElementById('file-count');
  
  if (selectedFiles.length === 0) {
    previewContainer.classList.add('hidden');
    return;
  }
  
  previewContainer.classList.remove('hidden');
  fileCount.textContent = selectedFiles.length;
  previewGrid.innerHTML = '';
  
  selectedFiles.forEach((file, index) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const previewItem = document.createElement('div');
      previewItem.className = 'relative group';
      previewItem.innerHTML = `
        <div class="aspect-square rounded-lg overflow-hidden border-2 border-gray-200 group-hover:border-purple-500 transition-colors">
          <img src="${e.target.result}" class="w-full h-full object-cover">
        </div>
        <button onclick="removeFile(${index})" 
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 hover:bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity">
          <i class="fas fa-times"></i>
        </button>
        <div class="mt-2 text-sm text-gray-600 truncate" title="${file.name}">
          ${file.name}
        </div>
        <div class="text-xs text-gray-400">
          ${(file.size / 1024 / 1024).toFixed(2)} MB
        </div>
      `;
      previewGrid.appendChild(previewItem);
    };
    
    reader.readAsDataURL(file);
  });
}

function removeFile(index) {
  selectedFiles.splice(index, 1);
  renderPreviews();
  
  if (typeof showInfoToast === 'function') {
    showInfoToast('파일이 제거되었습니다');
  }
}

function clearAllFiles() {
  if (selectedFiles.length === 0) return;
  
  if (confirm(`${selectedFiles.length}개 파일을 모두 삭제하시겠습니까?`)) {
    selectedFiles = [];
    renderPreviews();
    
    if (typeof showInfoToast === 'function') {
      showInfoToast('전체 파일이 제거되었습니다');
    }
  }
}

// ============================================
// Upload with Progress
// ============================================

async function uploadSelectedFiles() {
  if (selectedFiles.length === 0) {
    if (typeof showWarningToast === 'function') {
      showWarningToast('업로드할 파일을 선택해주세요');
    }
    return;
  }
  
  const progressContainer = document.getElementById('upload-progress-container');
  const progressList = document.getElementById('upload-progress-list');
  
  progressContainer.classList.remove('hidden');
  progressList.innerHTML = '';
  
  const uploadedArtworks = [];
  
  for (let i = 0; i < selectedFiles.length; i++) {
    const file = selectedFiles[i];
    
    // Create progress item
    const progressItem = document.createElement('div');
    progressItem.id = `progress-${i}`;
    progressItem.className = 'mb-4 p-4 bg-white border rounded-lg';
    progressItem.innerHTML = `
      <div class="flex items-center gap-3 mb-2">
        <img src="${URL.createObjectURL(file)}" class="w-16 h-16 object-cover rounded">
        <div class="flex-1">
          <div class="font-medium">${file.name}</div>
          <div class="text-sm text-gray-500">${(file.size / 1024 / 1024).toFixed(2)} MB</div>
        </div>
        <div id="status-${i}" class="text-yellow-600">
          <i class="fas fa-spinner fa-spin"></i>
        </div>
      </div>
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div id="progress-bar-${i}" class="bg-purple-600 h-2 rounded-full transition-all" style="width: 0%"></div>
      </div>
    `;
    progressList.appendChild(progressItem);
    
    try {
      // Upload file
      const result = await uploadSingleFile(file, i);
      uploadedArtworks.push(result);
      
      // Update status
      document.getElementById(`status-${i}`).innerHTML = '<i class="fas fa-check-circle text-green-500"></i>';
      document.getElementById(`progress-bar-${i}`).style.width = '100%';
      
    } catch (error) {
      console.error(`Upload failed for ${file.name}:`, error);
      document.getElementById(`status-${i}`).innerHTML = '<i class="fas fa-times-circle text-red-500"></i>';
    }
  }
  
  if (uploadedArtworks.length > 0) {
    if (typeof showSuccessToast === 'function') {
      showSuccessToast(`${uploadedArtworks.length}개 작품이 업로드되었습니다`);
    }
    
    // Redirect to my artworks
    setTimeout(() => {
      window.location.href = '/my-artworks';
    }, 2000);
  }
}

async function uploadSingleFile(file, index) {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    
    // Progress tracking
    xhr.upload.addEventListener('progress', (e) => {
      if (e.lengthComputable) {
        const percent = (e.loaded / e.total) * 100;
        const progressBar = document.getElementById(`progress-bar-${index}`);
        if (progressBar) {
          progressBar.style.width = `${percent}%`;
        }
      }
    });
    
    xhr.addEventListener('load', () => {
      if (xhr.status === 200) {
        try {
          const response = JSON.parse(xhr.responseText);
          resolve(response);
        } catch (error) {
          reject(error);
        }
      } else {
        reject(new Error(`Upload failed: ${xhr.status}`));
      }
    });
    
    xhr.addEventListener('error', () => reject(new Error('Network error')));
    
    const formData = new FormData();
    formData.append('image', file);
    
    // TODO: Add metadata fields
    formData.append('title', file.name.replace(/\.[^/.]+$/, '')); // Remove extension
    formData.append('category', '디지털아트');
    formData.append('current_price', '0.1');
    
    xhr.open('POST', '/api/artworks');
    xhr.send(formData);
  });
}

// ============================================
// Metadata Input Helpers
// ============================================

function addMetadataTooltips() {
  const metadataFields = {
    'title': '작품의 제목을 입력하세요. 독창적이고 기억하기 쉬운 제목을 권장합니다.',
    'description': '작품의 주제, 제작 배경, 사용된 기법 등을 상세히 작성해주세요. 최소 50자 이상 권장합니다.',
    'category': '작품의 카테고리를 선택하세요. 구매자가 작품을 찾는 데 도움이 됩니다.',
    'current_price': 'ETH 단위로 가격을 입력하세요. 시장 가격을 참고하여 적정 가격을 설정하세요.'
  };
  
  Object.entries(metadataFields).forEach(([fieldId, tooltip]) => {
    const field = document.getElementById(fieldId);
    if (!field) return;
    
    const label = field.previousElementSibling;
    if (label && label.tagName === 'LABEL') {
      const tooltipBtn = document.createElement('button');
      tooltipBtn.type = 'button';
      tooltipBtn.className = 'ml-1 text-gray-400 hover:text-gray-600';
      tooltipBtn.innerHTML = '<i class="fas fa-question-circle"></i>';
      tooltipBtn.title = tooltip;
      
      tooltipBtn.addEventListener('click', () => {
        if (typeof showInfoToast === 'function') {
          showInfoToast(tooltip, 5000);
        } else {
          alert(tooltip);
        }
      });
      
      label.appendChild(tooltipBtn);
    }
  });
}

function addPreviewContainer() {
  // Already handled in setupDragDrop
}

// ============================================
// Global Exposure
// ============================================

window.selectedFiles = selectedFiles;
window.removeFile = removeFile;
window.clearAllFiles = clearAllFiles;
window.uploadSelectedFiles = uploadSelectedFiles;

console.log('✅ Upload improvements loaded (C4-1, C4-2)');
