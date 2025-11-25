// Role-specific Dashboard Functions for Museum, Gallery, and Expert

// ========== Museum Dashboard ==========

async function loadMuseumDashboard(userId) {
    const dashboardHtml = `
        <div class="space-y-6">
            <h2 class="text-3xl font-bold text-white mb-6">
                <i class="fas fa-landmark mr-3 text-rose-500"></i>
                뮤지엄 대시보드
            </h2>
            
            <!-- 전시 통계 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">전체 전시</div>
                    <div class="text-3xl font-bold text-gradient" id="totalExhibitions">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">진행 중</div>
                    <div class="text-3xl font-bold text-green-400" id="openExhibitions">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">전시 작품 수</div>
                    <div class="text-3xl font-bold text-cyan-400" id="totalArtworks">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">총 방문자</div>
                    <div class="text-3xl font-bold text-amber-400" id="totalVisitors">0</div>
                </div>
            </div>
            
            <!-- 전시 목록 -->
            <div class="card-nft rounded-2xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-calendar-alt mr-2"></i>
                        전시 관리
                    </h3>
                    <button onclick="showCreateExhibitionModal()" class="px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg font-semibold hover:opacity-90 transition">
                        <i class="fas fa-plus mr-2"></i>새 전시 만들기
                    </button>
                </div>
                <div id="exhibitionsList" class="space-y-4"></div>
            </div>
        </div>
    `;
    
    document.getElementById('roleSpecificContent').innerHTML = dashboardHtml;
    
    // Load exhibitions
    await loadExhibitions(userId);
}

async function loadExhibitions(userId) {
    try {
        const response = await fetch(`/api/exhibitions?organizer_id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const exhibitions = data.exhibitions;
            
            // Update statistics
            document.getElementById('totalExhibitions').textContent = exhibitions.length;
            document.getElementById('openExhibitions').textContent = exhibitions.filter(e => e.status === 'open').length;
            
            let totalArtworks = 0;
            let totalVisitors = 0;
            exhibitions.forEach(e => {
                totalArtworks += e.artwork_count || 0;
                totalVisitors += e.visitor_count || 0;
            });
            document.getElementById('totalArtworks').textContent = totalArtworks;
            document.getElementById('totalVisitors').textContent = totalVisitors;
            
            // Display exhibitions
            const listHtml = exhibitions.map(exhibition => `
                <div class="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-6 hover:bg-opacity-10 transition">
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <h4 class="text-xl font-bold text-white mb-2">${exhibition.title}</h4>
                            <p class="text-gray-400 text-sm mb-3">${exhibition.description || ''}</p>
                            <div class="flex flex-wrap gap-3 text-sm">
                                <span class="text-gray-400">
                                    <i class="fas fa-calendar mr-1"></i>
                                    ${exhibition.start_date} ~ ${exhibition.end_date}
                                </span>
                                <span class="text-gray-400">
                                    <i class="fas fa-map-marker-alt mr-1"></i>
                                    ${exhibition.location}
                                </span>
                                <span class="text-gray-400">
                                    <i class="fas fa-images mr-1"></i>
                                    ${exhibition.artwork_count || 0}개 작품
                                </span>
                                <span class="${exhibition.status === 'open' ? 'text-green-400' : 'text-gray-400'}">
                                    <i class="fas fa-circle mr-1 text-xs"></i>
                                    ${getExhibitionStatusText(exhibition.status)}
                                </span>
                            </div>
                        </div>
                        <div class="flex gap-2 ml-4">
                            <button onclick="viewExhibition(${exhibition.id})" class="px-3 py-2 bg-cyan-500 bg-opacity-20 text-cyan-400 rounded-lg hover:bg-opacity-30 transition">
                                <i class="fas fa-eye"></i>
                            </button>
                            <button onclick="editExhibition(${exhibition.id})" class="px-3 py-2 bg-blue-500 bg-opacity-20 text-blue-400 rounded-lg hover:bg-opacity-30 transition">
                                <i class="fas fa-edit"></i>
                            </button>
                            <button onclick="deleteExhibition(${exhibition.id})" class="px-3 py-2 bg-red-500 bg-opacity-20 text-red-400 rounded-lg hover:bg-opacity-30 transition">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('exhibitionsList').innerHTML = listHtml || '<p class="text-gray-500 text-center py-8">아직 전시가 없습니다. 새 전시를 만들어보세요!</p>';
        }
    } catch (error) {
        console.error('전시 목록 로드 실패:', error);
    }
}

function getExhibitionStatusText(status) {
    const statusMap = {
        'planning': '기획중',
        'open': '진행중',
        'closed': '종료',
        'cancelled': '취소됨'
    };
    return statusMap[status] || status;
}

function showCreateExhibitionModal() {
    alert('전시 생성 모달은 개발 중입니다.');
    // TODO: Implement exhibition creation modal
}

function viewExhibition(id) {
    window.location.href = `/exhibition/${id}`;
}

function editExhibition(id) {
    alert('전시 편집 기능은 개발 중입니다.');
    // TODO: Implement exhibition edit modal
}

async function deleteExhibition(id) {
    if (!confirm('이 전시를 삭제하시겠습니까?')) return;
    
    try {
        const response = await fetch(`/api/exhibitions/${id}`, { method: 'DELETE' });
        const data = await response.json();
        
        if (data.success) {
            alert('전시가 삭제되었습니다.');
            location.reload();
        } else {
            alert('삭제 실패: ' + data.message);
        }
    } catch (error) {
        console.error('전시 삭제 실패:', error);
        alert('삭제 중 오류가 발생했습니다.');
    }
}

// ========== Gallery Dashboard ==========

async function loadGalleryDashboard(userId) {
    const dashboardHtml = `
        <div class="space-y-6">
            <h2 class="text-3xl font-bold text-white mb-6">
                <i class="fas fa-building-columns mr-3 text-teal-500"></i>
                갤러리 대시보드
            </h2>
            
            <!-- 큐레이션 통계 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">전체 요청</div>
                    <div class="text-3xl font-bold text-gradient" id="totalRequests">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">대기 중</div>
                    <div class="text-3xl font-bold text-yellow-400" id="pendingRequests">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">수락됨</div>
                    <div class="text-3xl font-bold text-green-400" id="acceptedRequests">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">큐레이션 작품</div>
                    <div class="text-3xl font-bold text-cyan-400" id="curatedArtworks">0</div>
                </div>
            </div>
            
            <!-- 큐레이션 요청 목록 -->
            <div class="card-nft rounded-2xl p-6">
                <div class="flex justify-between items-center mb-6">
                    <h3 class="text-2xl font-bold text-white">
                        <i class="fas fa-palette mr-2"></i>
                        큐레이션 요청 관리
                    </h3>
                    <button onclick="showCreateRequestModal()" class="px-4 py-2 bg-gradient-to-r from-teal-500 to-cyan-500 text-white rounded-lg font-semibold hover:opacity-90 transition">
                        <i class="fas fa-plus mr-2"></i>새 요청 보내기
                    </button>
                </div>
                <div id="requestsList" class="space-y-4"></div>
            </div>
        </div>
    `;
    
    document.getElementById('roleSpecificContent').innerHTML = dashboardHtml;
    
    // Load curation requests
    await loadCurationRequests(userId);
}

async function loadCurationRequests(userId) {
    try {
        const response = await fetch(`/api/curation-requests?gallery_id=${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const requests = data.requests;
            
            // Update statistics
            document.getElementById('totalRequests').textContent = requests.length;
            document.getElementById('pendingRequests').textContent = requests.filter(r => r.status === 'pending').length;
            document.getElementById('acceptedRequests').textContent = requests.filter(r => r.status === 'accepted').length;
            document.getElementById('curatedArtworks').textContent = requests.filter(r => r.status === 'completed').length;
            
            // Display requests
            const listHtml = requests.map(request => `
                <div class="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-6 hover:bg-opacity-10 transition">
                    <div class="flex gap-4">
                        <img src="${request.artwork_image}" alt="${request.artwork_title}" class="w-24 h-24 rounded-lg object-cover">
                        <div class="flex-1">
                            <h4 class="text-xl font-bold text-white mb-2">${request.artwork_title}</h4>
                            <p class="text-gray-400 text-sm mb-2">작가: ${request.artist_name}</p>
                            <p class="text-gray-300 text-sm mb-3">${request.request_message || ''}</p>
                            <div class="flex flex-wrap gap-3 text-sm">
                                <span class="text-amber-400">
                                    <i class="fas fa-percent mr-1"></i>
                                    수수료 ${request.offer_percentage}%
                                </span>
                                <span class="text-gray-400">
                                    <i class="fas fa-clock mr-1"></i>
                                    기간 ${request.duration_months}개월
                                </span>
                                <span class="${getRequestStatusColor(request.status)}">
                                    <i class="fas fa-circle mr-1 text-xs"></i>
                                    ${getRequestStatusText(request.status)}
                                </span>
                            </div>
                            ${request.response_message ? `<p class="text-gray-400 text-sm mt-2 italic">응답: ${request.response_message}</p>` : ''}
                        </div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('requestsList').innerHTML = listHtml || '<p class="text-gray-500 text-center py-8">아직 큐레이션 요청이 없습니다.</p>';
        }
    } catch (error) {
        console.error('큐레이션 요청 로드 실패:', error);
    }
}

function getRequestStatusText(status) {
    const statusMap = {
        'pending': '대기 중',
        'accepted': '수락됨',
        'rejected': '거절됨',
        'completed': '완료'
    };
    return statusMap[status] || status;
}

function getRequestStatusColor(status) {
    const colorMap = {
        'pending': 'text-yellow-400',
        'accepted': 'text-green-400',
        'rejected': 'text-red-400',
        'completed': 'text-blue-400'
    };
    return colorMap[status] || 'text-gray-400';
}

function showCreateRequestModal() {
    alert('큐레이션 요청 생성 모달은 개발 중입니다.');
    // TODO: Implement curation request creation modal
}

// ========== Expert Dashboard ==========

async function loadExpertDashboard(userId) {
    const dashboardHtml = `
        <div class="space-y-6">
            <h2 class="text-3xl font-bold text-white mb-6">
                <i class="fas fa-coins mr-3 text-amber-500"></i>
                전문가 보상 대시보드
            </h2>
            
            <!-- 보상 통계 -->
            <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">총 보상 ETH</div>
                    <div class="text-3xl font-bold text-gradient" id="totalEthRewards">0.000</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">평가 작품 수</div>
                    <div class="text-3xl font-bold text-cyan-400" id="totalEvaluations">0</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">평균 보상</div>
                    <div class="text-3xl font-bold text-green-400" id="averageReward">0.000</div>
                </div>
                <div class="card-nft rounded-2xl p-6">
                    <div class="text-gray-400 text-sm mb-2">이번 달 보상</div>
                    <div class="text-3xl font-bold text-amber-400" id="monthlyReward">0.000</div>
                </div>
            </div>
            
            <!-- 보상 내역 -->
            <div class="card-nft rounded-2xl p-6">
                <h3 class="text-2xl font-bold text-white mb-6">
                    <i class="fas fa-history mr-2"></i>
                    보상 지급 내역
                </h3>
                <div id="rewardsList" class="space-y-4"></div>
            </div>
        </div>
    `;
    
    document.getElementById('roleSpecificContent').innerHTML = dashboardHtml;
    
    // Load expert rewards
    await loadExpertRewards(userId);
}

async function loadExpertRewards(userId) {
    try {
        const response = await fetch(`/api/expert/rewards/${userId}`);
        const data = await response.json();
        
        if (data.success) {
            const rewards = data.rewards;
            const totalEth = data.total_eth || 0;
            
            // Update statistics
            document.getElementById('totalEthRewards').textContent = totalEth.toFixed(4);
            document.getElementById('totalEvaluations').textContent = rewards.length;
            
            const averageReward = rewards.length > 0 ? totalEth / rewards.length : 0;
            document.getElementById('averageReward').textContent = averageReward.toFixed(4);
            
            // Calculate monthly reward (current month)
            const currentMonth = new Date().getMonth();
            const monthlyTotal = rewards
                .filter(r => new Date(r.paid_at).getMonth() === currentMonth)
                .reduce((sum, r) => sum + r.reward_eth, 0);
            document.getElementById('monthlyReward').textContent = monthlyTotal.toFixed(4);
            
            // Display rewards
            const listHtml = rewards.map(reward => `
                <div class="bg-white bg-opacity-5 border border-white border-opacity-10 rounded-xl p-6 hover:bg-opacity-10 transition">
                    <div class="flex gap-4">
                        <img src="${reward.artwork_image}" alt="${reward.artwork_title}" class="w-20 h-20 rounded-lg object-cover">
                        <div class="flex-1">
                            <div class="flex justify-between items-start mb-2">
                                <div>
                                    <h4 class="text-lg font-bold text-white">${reward.artwork_title}</h4>
                                    <p class="text-gray-400 text-sm">평가 ID: #${reward.evaluation_id}</p>
                                </div>
                                <div class="text-right">
                                    <div class="text-2xl font-bold text-amber-400">${reward.reward_eth} ETH</div>
                                    <p class="text-gray-400 text-xs">${new Date(reward.paid_at).toLocaleDateString()}</p>
                                </div>
                            </div>
                            <div class="flex gap-2 text-sm">
                                <span class="text-green-400">
                                    <i class="fas fa-check-circle mr-1"></i>
                                    지급 완료
                                </span>
                                <span class="text-gray-400">
                                    <i class="fas fa-link mr-1"></i>
                                    TX: ${reward.tx_hash.substring(0, 10)}...
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            `).join('');
            
            document.getElementById('rewardsList').innerHTML = listHtml || '<p class="text-gray-500 text-center py-8">아직 보상 내역이 없습니다.</p>';
        }
    } catch (error) {
        console.error('보상 내역 로드 실패:', error);
    }
}

// ========== Initialize Role Dashboard ==========

function initializeRoleDashboard(userRole, userId) {
    // Add role-specific content container if not exists
    if (!document.getElementById('roleSpecificContent')) {
        const container = document.createElement('div');
        container.id = 'roleSpecificContent';
        container.className = 'mt-8';
        
        // Find a good place to insert (after main content)
        const mainContent = document.querySelector('.max-w-7xl');
        if (mainContent) {
            mainContent.appendChild(container);
        }
    }
    
    // Load appropriate dashboard
    switch(userRole) {
        case 'museum':
            loadMuseumDashboard(userId);
            break;
        case 'gallery':
            loadGalleryDashboard(userId);
            break;
        case 'expert':
            loadExpertDashboard(userId);
            break;
        default:
            // No special dashboard for other roles
            break;
    }
}
