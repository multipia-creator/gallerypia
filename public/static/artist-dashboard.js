// ====================================
// Artist Dashboard
// ====================================

// ====================================
// Loading State Helper
// ====================================

/**
 * Set button loading state
 * @param {HTMLButtonElement} button - Button element
 * @param {boolean} isLoading - Loading state
 * @param {string} loadingText - Text to show when loading
 */
function setButtonLoading(button, isLoading, loadingText = 'Processing...') {
  if (!button) return;

  if (isLoading) {
    button.disabled = true;
    button.dataset.originalHtml = button.innerHTML;
    button.innerHTML = `
      <span class="inline-flex items-center gap-2">
        <svg 
          class="animate-spin inline-block w-4 h-4 border-2 text-current"
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span>${loadingText}</span>
      </span>
    `;
    button.setAttribute('aria-busy', 'true');
    button.classList.add('opacity-75', 'cursor-not-allowed');
  } else {
    button.disabled = false;
    if (button.dataset.originalHtml) {
      button.innerHTML = button.dataset.originalHtml;
      delete button.dataset.originalHtml;
    }
    button.removeAttribute('aria-busy');
    button.classList.remove('opacity-75', 'cursor-not-allowed');
  }
}

// Check authentication on page load
if (!requireAuth(['artist'])) {
    // Redirected to login or home
}

let mySubmissions = [];

// Load data on page load
document.addEventListener('DOMContentLoaded', function() {
    loadMySubmissions();
    updateNavigation();
});

// ====================================
// Load My Submissions
// ====================================
async function loadMySubmissions() {
    try {
        const response = await apiCall('/api/submissions/my-submissions');
        const data = await response.json();
        
        if (data.success) {
            mySubmissions = data.data;
            renderSubmissions();
        } else {
            showMessage('제출 내역을 불러오는데 실패했습니다', 'error');
        }
    } catch (error) {
        console.error('Load submissions error:', error);
        showMessage('오류가 발생했습니다', 'error');
    }
}

// ====================================
// Render Submissions
// ====================================
function renderSubmissions() {
    const container = document.getElementById('submissionsContainer');
    
    if (mySubmissions.length === 0) {
        container.innerHTML = `
            <div class="col-span-full text-center py-16">
                <i class="fas fa-inbox text-6xl text-gray-600 mb-4"></i>
                <p class="text-gray-400 text-lg">제출한 작품이 없습니다</p>
                <button onclick="openSubmissionModal()" 
                        class="mt-4 px-6 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl transition">
                    <i class="fas fa-plus mr-2"></i>첫 작품 제출하기
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = mySubmissions.map(submission => `
        <div class="glass-card rounded-2xl overflow-hidden hover-lift">
            <!-- Image -->
            <div class="relative h-64 bg-dark-800 overflow-hidden">
                <img src="${submission.image_url}" 
                     alt="${submission.title}"
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
                <div class="absolute top-3 right-3">
                    ${getStatusBadge(submission.submission_status)}
                </div>
            </div>
            
            <!-- Content -->
            <div class="p-6">
                <h3 class="text-xl font-bold text-white mb-2">${submission.title}</h3>
                <p class="text-gray-400 text-sm mb-4 line-clamp-2">${submission.description || '설명 없음'}</p>
                
                <div class="flex items-center justify-between text-sm text-gray-400 mb-4">
                    <span><i class="fas fa-tag mr-1"></i>${submission.category || '미분류'}</span>
                    <span><i class="fas fa-calendar mr-1"></i>${formatDate(submission.submitted_at)}</span>
                </div>
                
                ${submission.estimated_price ? `
                    <div class="text-primary-400 font-semibold mb-4">
                        <i class="fas fa-won-sign mr-1"></i>${formatPrice(submission.estimated_price)}
                    </div>
                ` : ''}
                
                ${submission.submission_status === 'rejected' && submission.rejection_reason ? `
                    <div class="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-30 rounded-xl p-3 mb-4">
                        <p class="text-red-400 text-sm">
                            <i class="fas fa-exclamation-circle mr-2"></i>
                            ${submission.rejection_reason}
                        </p>
                    </div>
                ` : ''}
                
                <button onclick="viewSubmissionDetails(${submission.id})"
                        class="w-full py-2 bg-dark-700 hover:bg-dark-600 text-white rounded-xl transition">
                    <i class="fas fa-eye mr-2"></i>상세보기
                </button>
            </div>
        </div>
    `).join('');
}

// ====================================
// Status Badge
// ====================================
function getStatusBadge(status) {
    const badges = {
        'pending': '<span class="px-3 py-1 bg-yellow-500 bg-opacity-20 border border-yellow-500 text-yellow-400 text-xs font-semibold rounded-full">심사 대기</span>',
        'under_review': '<span class="px-3 py-1 bg-blue-500 bg-opacity-20 border border-blue-500 text-blue-400 text-xs font-semibold rounded-full">심사 중</span>',
        'approved': '<span class="px-3 py-1 bg-green-500 bg-opacity-20 border border-green-500 text-green-400 text-xs font-semibold rounded-full">승인됨</span>',
        'rejected': '<span class="px-3 py-1 bg-red-500 bg-opacity-20 border border-red-500 text-red-400 text-xs font-semibold rounded-full">반려됨</span>'
    };
    return badges[status] || badges['pending'];
}

// ====================================
// Open Submission Modal
// ====================================
function openSubmissionModal() {
    document.getElementById('submissionModal').classList.remove('hidden');
    document.getElementById('submissionForm').reset();
}

function closeSubmissionModal() {
    document.getElementById('submissionModal').classList.add('hidden');
}

// ====================================
// Handle Image Upload
// ====================================
function handleImageUpload(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            document.getElementById('imagePreview').innerHTML = `
                <img src="${e.target.result}" class="max-h-64 rounded-xl">
            `;
            // In production, you would upload to cloud storage here
            // For now, we'll use a placeholder URL
            document.getElementById('imageUrl').value = 'https://via.placeholder.com/800x600?text=Artwork+Image';
        };
        reader.readAsDataURL(file);
    }
}

// ====================================
// Submit Artwork
// ====================================
document.getElementById('submissionForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    // Get submit button for loading state
    const submitButton = this.querySelector('button[type="submit"]');
    
    const formData = {
        title: document.getElementById('artworkTitle').value,
        description: document.getElementById('artworkDescription').value,
        category: document.getElementById('artworkCategory').value,
        technique: document.getElementById('artworkTechnique').value,
        size_width: parseInt(document.getElementById('artworkWidth').value) || null,
        size_height: parseInt(document.getElementById('artworkHeight').value) || null,
        creation_year: parseInt(document.getElementById('artworkYear').value) || null,
        image_url: document.getElementById('imageUrl').value || 'https://via.placeholder.com/800x600?text=Artwork',
        estimated_price: parseInt(document.getElementById('estimatedPrice').value) || null,
        copyright_registration: document.getElementById('copyrightReg').value,
        blockchain_hash: document.getElementById('blockchainHash').value,
        license_type: document.getElementById('licenseType').value
    };
    
    try {
        // Set loading state
        setButtonLoading(submitButton, true, '제출 중...');
        
        const response = await apiCall('/api/submissions/create', {
            method: 'POST',
            body: JSON.stringify(formData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            showMessage('작품이 성공적으로 제출되었습니다!', 'success');
            closeSubmissionModal();
            loadMySubmissions();
            // Note: We don't restore button state since modal closes
        } else {
            setButtonLoading(submitButton, false);
            showMessage(data.message || '작품 제출에 실패했습니다', 'error');
        }
    } catch (error) {
        setButtonLoading(submitButton, false);
        console.error('Submission error:', error);
        showMessage('오류가 발생했습니다', 'error');
    }
});

// ====================================
// View Submission Details
// ====================================
function viewSubmissionDetails(submissionId) {
    const submission = mySubmissions.find(s => s.id === submissionId);
    if (!submission) return;
    
    const modal = document.getElementById('detailModal');
    const content = document.getElementById('detailContent');
    
    content.innerHTML = `
        <div class="space-y-6">
            <!-- Image -->
            <div class="rounded-2xl overflow-hidden">
                <img src="${submission.image_url}" 
                     alt="${submission.title}"
                     class="w-full h-96 object-cover">
            </div>
            
            <!-- Info -->
            <div>
                <div class="flex items-center justify-between mb-4">
                    <h2 class="text-3xl font-bold text-white">${submission.title}</h2>
                    ${getStatusBadge(submission.submission_status)}
                </div>
                
                <p class="text-gray-300 mb-6">${submission.description || '설명 없음'}</p>
                
                <div class="grid grid-cols-2 gap-4 mb-6">
                    <div class="glass-card p-4 rounded-xl">
                        <p class="text-gray-400 text-sm mb-1">카테고리</p>
                        <p class="text-white font-semibold">${submission.category || '미분류'}</p>
                    </div>
                    <div class="glass-card p-4 rounded-xl">
                        <p class="text-gray-400 text-sm mb-1">기법</p>
                        <p class="text-white font-semibold">${submission.technique || '미정'}</p>
                    </div>
                    <div class="glass-card p-4 rounded-xl">
                        <p class="text-gray-400 text-sm mb-1">크기</p>
                        <p class="text-white font-semibold">${submission.size_width}×${submission.size_height}cm</p>
                    </div>
                    <div class="glass-card p-4 rounded-xl">
                        <p class="text-gray-400 text-sm mb-1">제작년도</p>
                        <p class="text-white font-semibold">${submission.creation_year || '미정'}</p>
                    </div>
                </div>
                
                ${submission.estimated_price ? `
                    <div class="glass-card p-4 rounded-xl mb-6">
                        <p class="text-gray-400 text-sm mb-1">예상 가격</p>
                        <p class="text-primary-400 text-2xl font-bold">${formatPrice(submission.estimated_price)}</p>
                    </div>
                ` : ''}
                
                ${submission.admin_notes ? `
                    <div class="glass-card p-4 rounded-xl mb-6">
                        <p class="text-gray-400 text-sm mb-2">관리자 메모</p>
                        <p class="text-white">${submission.admin_notes}</p>
                    </div>
                ` : ''}
                
                <div class="flex items-center justify-between text-sm text-gray-400">
                    <span><i class="fas fa-calendar mr-2"></i>제출일: ${formatDate(submission.submitted_at)}</span>
                    ${submission.reviewed_at ? `
                        <span><i class="fas fa-check-circle mr-2"></i>심사일: ${formatDate(submission.reviewed_at)}</span>
                    ` : ''}
                </div>
            </div>
        </div>
    `;
    
    modal.classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

// ====================================
// Utility Functions
// ====================================
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatPrice(price) {
    if (!price) return '-';
    if (price >= 100000000) return (price / 100000000).toFixed(1) + '억원';
    if (price >= 10000) return (price / 10000).toFixed(0) + '만원';
    return price.toLocaleString() + '원';
}

function showMessage(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500'
    };
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded-xl shadow-lg z-50 animate-fade-in`;
    messageDiv.innerHTML = `
        <i class="fas fa-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'} mr-2"></i>
        ${message}
    `;
    
    document.body.appendChild(messageDiv);
    
    setTimeout(() => {
        messageDiv.remove();
    }, 3000);
}
