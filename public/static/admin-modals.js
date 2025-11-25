// 관리자 모달 UI 및 기능

// ============================================
// 이미지 업로드 관련
// ============================================

let currentImageMode = 'upload'; // 'upload' or 'url'
let uploadedImageUrl = null;

// 이미지 탭 전환
function switchImageTab(mode) {
    currentImageMode = mode;
    
    const uploadBtn = document.getElementById('uploadTabBtn');
    const urlBtn = document.getElementById('urlTabBtn');
    const uploadArea = document.getElementById('uploadArea');
    const urlArea = document.getElementById('urlArea');
    
    if (mode === 'upload') {
        uploadBtn.classList.add('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
        uploadBtn.classList.remove('bg-white', 'bg-opacity-5', 'text-gray-400');
        urlBtn.classList.remove('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
        urlBtn.classList.add('bg-white', 'bg-opacity-5', 'text-gray-400');
        uploadArea.classList.remove('hidden');
        urlArea.classList.add('hidden');
    } else {
        urlBtn.classList.add('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
        urlBtn.classList.remove('bg-white', 'bg-opacity-5', 'text-gray-400');
        uploadBtn.classList.remove('bg-purple-500', 'bg-opacity-20', 'text-purple-400');
        uploadBtn.classList.add('bg-white', 'bg-opacity-5', 'text-gray-400');
        urlArea.classList.remove('hidden');
        uploadArea.classList.add('hidden');
    }
}

// 드롭존 이벤트 설정
document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    
    if (dropZone) {
        dropZone.addEventListener('click', () => {
            document.getElementById('artwork_image_file').click();
        });
        
        dropZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            dropZone.classList.add('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
        });
        
        dropZone.addEventListener('dragleave', () => {
            dropZone.classList.remove('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
        });
        
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('border-purple-500', 'bg-purple-500', 'bg-opacity-10');
            
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileUpload(files[0]);
            }
        });
    }
});

// 파일 선택 핸들러
function handleFileSelect(event) {
    const file = event.target.files[0];
    if (file) {
        handleFileUpload(file);
    }
}

// 파일 업로드 처리
async function handleFileUpload(file) {
    // 파일 크기 체크 (10MB)
    if (file.size > 10 * 1024 * 1024) {
        alert('파일 크기는 10MB를 초과할 수 없습니다.');
        return;
    }
    
    // 파일 타입 체크
    if (!file.type.startsWith('image/')) {
        alert('이미지 파일만 업로드 가능합니다.');
        return;
    }
    
    // 진행 바 표시
    const progressDiv = document.getElementById('uploadProgress');
    const uploadBar = document.getElementById('uploadBar');
    const uploadPercent = document.getElementById('uploadPercent');
    progressDiv.classList.remove('hidden');
    
    // 이미지 리사이징 (클라이언트 측)
    const resizedBlob = await resizeImage(file, 1920, 1920);
    
    // FormData 생성
    const formData = new FormData();
    formData.append('file', resizedBlob, file.name);
    
    try {
        // 50% - 리사이징 완료
        uploadBar.style.width = '50%';
        uploadPercent.textContent = '50%';
        
        // R2에 업로드
        const response = await fetch('/api/admin/upload/image', {
            method: 'POST',
            body: formData
        });
        
        // 75% - 업로드 완료
        uploadBar.style.width = '75%';
        uploadPercent.textContent = '75%';
        
        const data = await response.json();
        
        if (data.success) {
            uploadedImageUrl = data.url;
            
            // 100% - 완료
            uploadBar.style.width = '100%';
            uploadPercent.textContent = '100%';
            
            // 미리보기 표시
            document.getElementById('artwork_final_image_url').value = data.url;
            document.getElementById('imagePreview').src = data.url;
            document.getElementById('imagePreviewContainer').classList.remove('hidden');
            
            // 진행 바 숨기기
            setTimeout(() => {
                progressDiv.classList.add('hidden');
                uploadBar.style.width = '0%';
            }, 1000);
        } else {
            alert('업로드 실패: ' + (data.message || '알 수 없는 오류'));
            progressDiv.classList.add('hidden');
        }
    } catch (error) {
        console.error('업로드 오류:', error);
        alert('업로드 중 오류가 발생했습니다.');
        progressDiv.classList.add('hidden');
    }
}

// 이미지 리사이징 함수
function resizeImage(file, maxWidth, maxHeight) {
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;
                
                // 비율 유지하면서 리사이징
                if (width > height) {
                    if (width > maxWidth) {
                        height = (height * maxWidth) / width;
                        width = maxWidth;
                    }
                } else {
                    if (height > maxHeight) {
                        width = (width * maxHeight) / height;
                        height = maxHeight;
                    }
                }
                
                canvas.width = width;
                canvas.height = height;
                
                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0, width, height);
                
                canvas.toBlob((blob) => {
                    resolve(blob);
                }, file.type, 0.9);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    });
}

// 이미지 제거
function removeImage() {
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    document.getElementById('artwork_final_image_url').value = '';
    document.getElementById('artwork_image_url').value = '';
    document.getElementById('artwork_image_file').value = '';
    uploadedImageUrl = null;
}

// ============================================
// 작품 추가/수정 모달
// ============================================

let currentEditingArtworkId = null;

function showAddArtworkModal() {
    currentEditingArtworkId = null;
    document.getElementById('artworkModalTitle').textContent = '새 작품 등록';
    document.getElementById('artworkForm').reset();
    document.getElementById('artworkModal').classList.remove('hidden');
}

async function showEditArtworkModal(id) {
    currentEditingArtworkId = id;
    document.getElementById('artworkModalTitle').textContent = '작품 수정';
    
    // 작품 정보 로드
    try {
        const response = await fetch(`/api/admin/artworks/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const artwork = data.data;
            
            // 폼 필드 채우기
            document.getElementById('artwork_title').value = artwork.title || '';
            document.getElementById('artwork_artist_id').value = artwork.artist_id || '';
            document.getElementById('artwork_description').value = artwork.description || '';
            document.getElementById('artwork_category').value = artwork.category || '';
            document.getElementById('artwork_technique').value = artwork.technique || '';
            document.getElementById('artwork_size_width').value = artwork.size_width || '';
            document.getElementById('artwork_size_height').value = artwork.size_height || '';
            document.getElementById('artwork_creation_year').value = artwork.creation_year || '';
            document.getElementById('artwork_current_price').value = artwork.current_price || '';
            document.getElementById('artwork_status').value = artwork.status || 'draft';
            
            // 이미지 미리보기
            if (artwork.image_url) {
                document.getElementById('imagePreview').src = artwork.image_url;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');
            }
            
            document.getElementById('artworkModal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('작품 정보 로드 실패:', error);
        alert('작품 정보를 불러오는데 실패했습니다.');
    }
}

function closeArtworkModal() {
    document.getElementById('artworkModal').classList.add('hidden');
    document.getElementById('artworkForm').reset();
    document.getElementById('imagePreviewContainer').classList.add('hidden');
    currentEditingArtworkId = null;
}

// 이미지 URL 입력 시 미리보기
document.addEventListener('DOMContentLoaded', () => {
    const urlInput = document.getElementById('artwork_image_url');
    if (urlInput) {
        urlInput.addEventListener('input', function() {
            const url = this.value;
            if (url) {
                document.getElementById('artwork_final_image_url').value = url;
                document.getElementById('imagePreview').src = url;
                document.getElementById('imagePreviewContainer').classList.remove('hidden');
            } else {
                document.getElementById('imagePreviewContainer').classList.add('hidden');
            }
        });
    }
});

// 작품 저장
async function saveArtwork() {
    const form = document.getElementById('artworkForm');
    const formData = new FormData(form);
    
    // 최종 이미지 URL 확인
    const finalImageUrl = document.getElementById('artwork_final_image_url').value;
    if (!finalImageUrl) {
        alert('이미지를 업로드하거나 URL을 입력해주세요.');
        return;
    }
    
    const artworkData = {
        title: formData.get('title'),
        artist_id: parseInt(formData.get('artist_id')),
        description: formData.get('description'),
        category: formData.get('category'),
        technique: formData.get('technique'),
        size_width: parseFloat(formData.get('size_width')) || 0,
        size_height: parseFloat(formData.get('size_height')) || 0,
        creation_year: parseInt(formData.get('creation_year')) || new Date().getFullYear(),
        image_url: finalImageUrl,
        current_price: parseFloat(formData.get('current_price')) || 0,
        status: formData.get('status')
    };
    
    try {
        const url = currentEditingArtworkId 
            ? `/api/admin/artworks/${currentEditingArtworkId}`
            : '/api/admin/artworks';
        
        const method = currentEditingArtworkId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(artworkData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(currentEditingArtworkId ? '작품이 수정되었습니다.' : '작품이 등록되었습니다.');
            closeArtworkModal();
            loadArtworks();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '작품 저장에 실패했습니다.'));
        }
    } catch (error) {
        console.error('작품 저장 실패:', error);
        alert('작품 저장 중 오류가 발생했습니다.');
    }
}

// ============================================
// 작가 추가/수정 모달
// ============================================

let currentEditingArtistId = null;

function showAddArtistModal() {
    currentEditingArtistId = null;
    document.getElementById('artistModalTitle').textContent = '새 작가 등록';
    document.getElementById('artistForm').reset();
    document.getElementById('artistModal').classList.remove('hidden');
}

async function showEditArtistModal(id) {
    currentEditingArtistId = id;
    document.getElementById('artistModalTitle').textContent = '작가 정보 수정';
    
    try {
        const response = await fetch(`/api/admin/artists/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const artist = data.data;
            
            document.getElementById('artist_name').value = artist.name || '';
            document.getElementById('artist_email').value = artist.email || '';
            document.getElementById('artist_bio').value = artist.bio || '';
            document.getElementById('artist_career_years').value = artist.career_years || '';
            document.getElementById('artist_education').value = artist.education || '';
            document.getElementById('artist_solo_exhibitions').value = artist.solo_exhibitions_count || '';
            document.getElementById('artist_group_exhibitions').value = artist.group_exhibitions_count || '';
            document.getElementById('artist_awards').value = artist.competition_awards_count || '';
            document.getElementById('artist_wallet_address').value = artist.wallet_address || '';
            
            document.getElementById('artistModal').classList.remove('hidden');
        }
    } catch (error) {
        console.error('작가 정보 로드 실패:', error);
        alert('작가 정보를 불러오는데 실패했습니다.');
    }
}

function closeArtistModal() {
    document.getElementById('artistModal').classList.add('hidden');
    document.getElementById('artistForm').reset();
    currentEditingArtistId = null;
}

async function saveArtist() {
    const form = document.getElementById('artistForm');
    const formData = new FormData(form);
    
    const artistData = {
        name: formData.get('name'),
        email: formData.get('email'),
        bio: formData.get('bio'),
        career_years: parseInt(formData.get('career_years')) || 0,
        education: formData.get('education'),
        solo_exhibitions_count: parseInt(formData.get('solo_exhibitions')) || 0,
        group_exhibitions_count: parseInt(formData.get('group_exhibitions')) || 0,
        competition_awards_count: parseInt(formData.get('awards')) || 0,
        wallet_address: formData.get('wallet_address')
    };
    
    try {
        const url = currentEditingArtistId 
            ? `/api/admin/artists/${currentEditingArtistId}`
            : '/api/admin/artists';
        
        const method = currentEditingArtistId ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(artistData)
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(currentEditingArtistId ? '작가 정보가 수정되었습니다.' : '작가가 등록되었습니다.');
            closeArtistModal();
            loadArtists();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '작가 저장에 실패했습니다.'));
        }
    } catch (error) {
        console.error('작가 저장 실패:', error);
        alert('작가 저장 중 오류가 발생했습니다.');
    }
}

// ============================================
// 삭제 기능
// ============================================

async function deleteArtwork(id) {
    if (!confirm('정말로 이 작품을 삭제하시겠습니까?\n\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/artworks/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('작품이 삭제되었습니다.');
            loadArtworks();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '작품 삭제에 실패했습니다.'));
        }
    } catch (error) {
        console.error('작품 삭제 실패:', error);
        alert('작품 삭제 중 오류가 발생했습니다.');
    }
}

async function deleteArtist(id) {
    if (!confirm('정말로 이 작가를 삭제하시겠습니까?\n\n관련된 모든 작품도 함께 삭제됩니다.\n이 작업은 되돌릴 수 없습니다.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/artists/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('작가가 삭제되었습니다.');
            loadArtists();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '작가 삭제에 실패했습니다.'));
        }
    } catch (error) {
        console.error('작가 삭제 실패:', error);
        alert('작가 삭제 중 오류가 발생했습니다.');
    }
}

// ============================================
// OpenSea 대량 가져오기 모달
// ============================================

// OpenSea 작품 데이터 저장
let openSeaArtworksData = [];
let selectedArtworks = new Set();

function showOpenSeaImportModal() {
    document.getElementById('openSeaModal').classList.remove('hidden');
    document.getElementById('openSeaStep1').classList.remove('hidden');
    document.getElementById('openSeaStep2').classList.add('hidden');
    openSeaArtworksData = [];
    selectedArtworks.clear();
}

function showOpenSeaModal() {
    document.getElementById('openSeaModal').classList.remove('hidden');
    // 초기화
    document.getElementById('openSeaCollectionUrl').value = '';
    document.getElementById('openSeaApiKey').value = '';
    document.getElementById('openSeaLimit').value = '50';
    document.getElementById('openSeaStep1').classList.remove('hidden');
    document.getElementById('openSeaStep2').classList.add('hidden');
    openSeaArtworksData = [];
    selectedArtworks.clear();
}

function closeOpenSeaModal() {
    document.getElementById('openSeaModal').classList.add('hidden');
    document.getElementById('openSeaCollectionUrl').value = '';
    document.getElementById('openSeaStep1').classList.remove('hidden');
    document.getElementById('openSeaStep2').classList.add('hidden');
    openSeaArtworksData = [];
    selectedArtworks.clear();
}

function backToStep1() {
    document.getElementById('openSeaStep1').classList.remove('hidden');
    document.getElementById('openSeaStep2').classList.add('hidden');
}

// Step 1: OpenSea 작품 조회
async function loadOpenSeaArtworks() {
    const urlOrSlug = document.getElementById('openSeaCollectionUrl').value.trim();
    const apiKey = document.getElementById('openSeaApiKey').value.trim();
    const limit = parseInt(document.getElementById('openSeaLimit').value) || 50;
    
    if (!urlOrSlug) {
        showNotification('⚠️ OpenSea 컬렉션 URL 또는 이름을 입력해주세요.', 'warning');
        return;
    }
    
    // URL에서 슬러그 추출 또는 슬러그 그대로 사용
    let slug = urlOrSlug;
    const urlPatterns = [
        /opensea\.io\/collection\/([^/?#]+)/,  // https://opensea.io/collection/azuki
        /opensea\.io\/assets\/([^/?#]+)/,       // https://opensea.io/assets/ethereum/0x...
        /^([a-zA-Z0-9\-_]+)$/                   // azuki (슬러그만)
    ];
    
    let matched = false;
    for (const pattern of urlPatterns) {
        const match = urlOrSlug.match(pattern);
        if (match) {
            slug = match[1];
            matched = true;
            break;
        }
    }
    
    if (!matched && urlOrSlug.includes('opensea.io')) {
        showNotification('❌ OpenSea URL 형식이 올바르지 않습니다.<br>예시: https://opensea.io/collection/azuki', 'error');
        return;
    }
    
    const loadButton = document.querySelector('#openSeaStep1 button[onclick="loadOpenSeaArtworks()"]');
    loadButton.disabled = true;
    loadButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>작품 로딩 중...';
    
    // 진행 상태 표시
    showNotification(`🔍 OpenSea에서 "${slug}" 컬렉션 검색 중...`, 'info');
    
    try {
        const response = await fetch('/api/admin/opensea/fetch', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                slug, 
                limit,
                apiKey: apiKey || null 
            })
        });
        
        const data = await response.json();
        
        console.log('OpenSea API 응답:', data);
        
        if (data.success && data.artworks && data.artworks.length > 0) {
            openSeaArtworksData = data.artworks;
            displayOpenSeaArtworks(data.artworks);
            document.getElementById('openSeaStep1').classList.add('hidden');
            document.getElementById('openSeaStep2').classList.remove('hidden');
            
            // 성공 메시지
            showNotification(`✅ ${data.artworks.length}개의 작품을 불러왔습니다!`, 'success');
            
            // 데모 데이터인 경우 경고 메시지 표시
            if (data.isDemo) {
                const messageDiv = document.createElement('div');
                messageDiv.className = 'bg-gradient-to-r from-yellow-900/40 to-orange-900/40 border-2 border-yellow-500/50 rounded-xl p-5 mb-4 animate-pulse-slow';
                messageDiv.innerHTML = `
                    <div class="flex items-start gap-3">
                        <div class="flex-shrink-0 w-10 h-10 bg-yellow-500/20 rounded-full flex items-center justify-center">
                            <i class="fas fa-exclamation-triangle text-yellow-400 text-xl"></i>
                        </div>
                        <div class="flex-1">
                            <div class="text-yellow-300 font-bold mb-2 text-lg">📊 데모 데이터 모드</div>
                            <div class="text-gray-200 text-sm mb-3">${data.message}</div>
                            ${data.authError ? `
                                <div class="bg-black/30 rounded-lg p-3 border border-yellow-500/30">
                                    <div class="flex items-start gap-2">
                                        <i class="fas fa-lightbulb text-cyan-400 mt-0.5"></i>
                                        <div class="text-xs text-gray-300">
                                            <span class="text-cyan-300 font-semibold">실제 OpenSea 데이터를 가져오려면:</span><br>
                                            <a href="https://opensea.io/account/settings/developer" target="_blank" class="text-cyan-400 hover:text-cyan-300 underline inline-flex items-center gap-1 mt-1">
                                                OpenSea Developer 페이지에서 무료 API 키 발급받기 
                                                <i class="fas fa-external-link-alt text-xs"></i>
                                            </a>
                                        </div>
                                    </div>
                                </div>
                            ` : ''}
                        </div>
                    </div>
                `;
                document.getElementById('openSeaStep2').insertBefore(messageDiv, document.getElementById('openSeaStep2').firstChild);
            } else {
                // 실제 데이터 성공 메시지
                const successDiv = document.createElement('div');
                successDiv.className = 'bg-gradient-to-r from-green-900/40 to-emerald-900/40 border-2 border-green-500/50 rounded-xl p-4 mb-4';
                successDiv.innerHTML = `
                    <div class="flex items-center gap-3">
                        <i class="fas fa-check-circle text-green-400 text-2xl"></i>
                        <div class="text-green-300 font-semibold">
                            ✨ 실제 OpenSea 데이터를 성공적으로 불러왔습니다!
                        </div>
                    </div>
                `;
                document.getElementById('openSeaStep2').insertBefore(successDiv, document.getElementById('openSeaStep2').firstChild);
            }
        } else {
            const errorMsg = data.message || '컬렉션 이름을 확인해주세요.';
            console.error('OpenSea 조회 실패:', data);
            
            // 상세한 에러 메시지 표시
            let detailedError = `❌ 작품을 찾을 수 없습니다.<br><br>`;
            detailedError += `<strong>입력값:</strong> ${slug}<br>`;
            detailedError += `<strong>오류:</strong> ${errorMsg}<br><br>`;
            
            if (!apiKey) {
                detailedError += `<span class="text-yellow-300">💡 API 키가 없으면 데모 데이터가 생성되어야 합니다.</span><br>`;
                detailedError += `혹시 서버 오류일 수 있으니 콘솔을 확인해주세요.`;
            } else {
                detailedError += `<span class="text-yellow-300">💡 다음을 확인해주세요:</span><br>`;
                detailedError += `• 컬렉션 슬러그가 정확한지 확인<br>`;
                detailedError += `• API 키가 유효한지 확인<br>`;
                detailedError += `• OpenSea에서 실제로 컬렉션이 존재하는지 확인`;
            }
            
            showNotification(detailedError, 'error');
        }
    } catch (error) {
        console.error('OpenSea 조회 실패:', error);
        showNotification(`⚠️ 네트워크 오류가 발생했습니다.<br><br><strong>오류:</strong> ${error.message}<br><br>서버 연결을 확인해주세요.`, 'error');
    } finally {
        loadButton.disabled = false;
        loadButton.innerHTML = '<i class="fas fa-rocket mr-2"></i>작품 조회하기';
    }
}

// 알림 표시 함수
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    const colors = {
        success: 'from-green-600 to-emerald-600',
        error: 'from-red-600 to-rose-600',
        warning: 'from-yellow-600 to-orange-600',
        info: 'from-cyan-600 to-blue-600'
    };
    
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    
    const duration = type === 'error' ? 10000 : 5000; // 에러는 더 오래 표시
    
    notification.className = `fixed top-4 right-4 z-[9999] bg-gradient-to-r ${colors[type]} text-white px-6 py-4 rounded-xl shadow-2xl max-w-md animate-slide-in`;
    notification.innerHTML = `
        <div class="flex items-start gap-3">
            <i class="fas ${icons[type]} text-xl flex-shrink-0 mt-1"></i>
            <div class="flex-1 text-sm">${message}</div>
            <button onclick="this.parentElement.parentElement.remove()" class="text-white/70 hover:text-white ml-2 flex-shrink-0">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slide-out 0.3s ease-in';
            setTimeout(() => notification.remove(), 300);
        }
    }, duration);
}

// 작품 목록 표시
function displayOpenSeaArtworks(artworks) {
    const container = document.getElementById('openSeaArtworksList');
    container.innerHTML = artworks.map((artwork, index) => `
        <div class="artwork-card bg-gray-900 rounded-lg overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition ${selectedArtworks.has(index) ? 'ring-2 ring-cyan-500' : ''}" 
             onclick="toggleArtworkSelection(${index})">
            <div class="relative aspect-square">
                <img src="${artwork.image_url || 'https://via.placeholder.com/300?text=No+Image'}" 
                     alt="${artwork.name}" 
                     class="w-full h-full object-cover"
                     onerror="this.src='https://via.placeholder.com/300?text=No+Image'" />
                <div class="absolute top-2 right-2">
                    <div class="w-6 h-6 rounded-full ${selectedArtworks.has(index) ? 'bg-cyan-500' : 'bg-gray-700'} flex items-center justify-center">
                        ${selectedArtworks.has(index) ? '<i class="fas fa-check text-white text-xs"></i>' : ''}
                    </div>
                </div>
            </div>
            <div class="p-3">
                <div class="text-white font-semibold text-sm truncate" title="${artwork.name}">${artwork.name}</div>
                <div class="text-gray-400 text-xs mt-1">${artwork.collection}</div>
            </div>
        </div>
    `).join('');
    
    updateSelectedCount();
}

// 작품 선택 토글
function toggleArtworkSelection(index) {
    if (selectedArtworks.has(index)) {
        selectedArtworks.delete(index);
    } else {
        selectedArtworks.add(index);
    }
    displayOpenSeaArtworks(openSeaArtworksData);
}

// 전체 선택
function selectAllArtworks() {
    openSeaArtworksData.forEach((_, index) => selectedArtworks.add(index));
    displayOpenSeaArtworks(openSeaArtworksData);
}

// 전체 해제
function deselectAllArtworks() {
    selectedArtworks.clear();
    displayOpenSeaArtworks(openSeaArtworksData);
}

// 선택된 작품 수 업데이트
function updateSelectedCount() {
    document.getElementById('selectedCount').textContent = selectedArtworks.size;
}

// Step 2: 선택한 작품 가져오기
async function importSelectedArtworks() {
    if (selectedArtworks.size === 0) {
        alert('가져올 작품을 선택해주세요.');
        return;
    }
    
    const importButton = document.querySelector('#openSeaStep2 button[onclick="importSelectedArtworks()"]');
    importButton.disabled = true;
    importButton.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>가져오는 중...';
    
    // 선택된 작품 데이터만 추출
    const selectedArtworksData = Array.from(selectedArtworks).map(index => openSeaArtworksData[index]);
    
    try {
        const response = await fetch('/api/admin/import/opensea', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ 
                artworks: selectedArtworksData 
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert(`${data.imported || 0}개의 작품을 성공적으로 가져왔습니다.`);
            closeOpenSeaModal();
            loadArtworks();
            loadStats();
        } else {
            alert('오류: ' + (data.message || 'OpenSea에서 작품을 가져오는데 실패했습니다.'));
        }
    } catch (error) {
        console.error('OpenSea 가져오기 실패:', error);
        alert('OpenSea에서 작품을 가져오는 중 오류가 발생했습니다.');
    } finally {
        importButton.disabled = false;
        importButton.innerHTML = '<i class="fas fa-download mr-2"></i>선택한 작품 가져오기';
    }
}

// ============================================
// 평가 승인
// ============================================

async function approveValuation(artworkId) {
    if (!confirm('이 작품의 평가를 승인하시겠습니까?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/admin/artworks/${artworkId}/approve`, {
            method: 'POST'
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('평가가 승인되었습니다.');
            loadValuations();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '평가 승인에 실패했습니다.'));
        }
    } catch (error) {
        console.error('평가 승인 실패:', error);
        alert('평가 승인 중 오류가 발생했습니다.');
    }
}

async function rejectValuation(artworkId) {
    const reason = prompt('반려 사유를 입력해주세요:');
    if (!reason) return;
    
    try {
        const response = await fetch(`/api/admin/artworks/${artworkId}/reject`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ reason })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('평가가 반려되었습니다.');
            loadValuations();
            loadStats();
        } else {
            alert('오류: ' + (data.message || '평가 반려에 실패했습니다.'));
        }
    } catch (error) {
        console.error('평가 반려 실패:', error);
        alert('평가 반려 중 오류가 발생했습니다.');
    }
}
