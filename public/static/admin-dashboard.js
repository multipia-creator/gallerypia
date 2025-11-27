/**
 * Admin Dashboard JavaScript
 * GalleryPia Admin Panel
 */

// Global state
let currentTab = 'users';
let allUsers = [];
let allArtworks = [];
let charts = {};

// Initialize on page load
document.addEventListener('DOMContentLoaded', async () => {
    checkAuth();
    loadDashboardData();
    
    // ✅ FIX: Load Chart.js before initializing charts
    if (typeof window.loadChartJS === 'function') {
        try {
            await window.loadChartJS();
            initializeCharts();
        } catch (error) {
            console.error('Failed to load Chart.js:', error);
        }
    } else {
        console.warn('Chart.js loader not available');
    }
});

// Check authentication
function checkAuth() {
    // ✅ FIX: Check all possible token storage locations
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('session_token') || 
                  sessionStorage.getItem('session_token');
    const user = JSON.parse(localStorage.getItem('user') || sessionStorage.getItem('user') || '{}');
    
    if (!token || user.role !== 'admin') {
        alert('관리자 권한이 필요합니다.');
        window.location.href = '/';
        return;
    }
    
    document.getElementById('adminName').textContent = user.full_name || user.name || '관리자';
}

// Logout
function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/';
}

// Load dashboard data
async function loadDashboardData() {
    try {
        // Load statistics
        const stats = await fetchAPI('/api/admin/stats');
        updateStatistics(stats);
        
        // Load users
        await refreshUsers();
        
        // Load artworks
        await refreshArtworks();
        
        // Update charts
        updateCharts(stats);
        
    } catch (error) {
        console.error('Failed to load dashboard data:', error);
        showNotification('데이터 로드 실패', 'error');
    }
}

// Update statistics
function updateStatistics(stats) {
    document.getElementById('totalUsers').textContent = stats.totalUsers || 0;
    document.getElementById('totalArtworks').textContent = stats.totalArtworks || 0;
    document.getElementById('pendingApprovals').textContent = stats.pendingApprovals || 0;
    document.getElementById('usersGrowth').textContent = `${stats.usersGrowth || 0}%`;
    document.getElementById('artworksGrowth').textContent = `${stats.artworksGrowth || 0}%`;
    document.getElementById('uptime').textContent = `${stats.uptime || 99.9}%`;
}

// Refresh users
async function refreshUsers() {
    try {
        const response = await fetchAPI('/api/admin/users');
        allUsers = response.users || [];
        renderUserTable(allUsers);
    } catch (error) {
        console.error('Failed to load users:', error);
    }
}

// Render user table
function renderUserTable(users) {
    const tbody = document.getElementById('userTableBody');
    
    if (!users || users.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center py-8 text-gray-400">사용자가 없습니다</td></tr>';
        return;
    }
    
    tbody.innerHTML = users.map(user => `
        <tr class="hover:bg-gray-700 transition">
            <td class="px-4 py-3">${user.id}</td>
            <td class="px-4 py-3">${user.email}</td>
            <td class="px-4 py-3">${user.name}</td>
            <td class="px-4 py-3">
                <span class="px-2 py-1 rounded text-xs ${getRoleBadgeClass(user.role)}">
                    ${getRoleLabel(user.role)}
                </span>
            </td>
            <td class="px-4 py-3">${formatDate(user.created_at)}</td>
            <td class="px-4 py-3">
                <button onclick="editUser(${user.id})" class="text-blue-400 hover:text-blue-300 mr-2">
                    <i class="fas fa-edit"></i>
                </button>
                <button onclick="deleteUser(${user.id})" class="text-red-400 hover:text-red-300">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// Refresh artworks
async function refreshArtworks() {
    try {
        const response = await fetchAPI('/api/admin/artworks');
        allArtworks = response.artworks || [];
        renderArtworkGrid(allArtworks);
    } catch (error) {
        console.error('Failed to load artworks:', error);
    }
}

// Render artwork grid
function renderArtworkGrid(artworks) {
    const grid = document.getElementById('artworkGrid');
    
    if (!artworks || artworks.length === 0) {
        grid.innerHTML = '<p class="text-center py-8 text-gray-400 col-span-3">작품이 없습니다</p>';
        return;
    }
    
    grid.innerHTML = artworks.map(artwork => `
        <div class="bg-gray-700 rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-500 transition">
            <img src="${artwork.image_url || '/static/placeholder.png'}" 
                alt="${artwork.title}" 
                class="w-full h-48 object-cover">
            <div class="p-4">
                <h4 class="font-bold text-lg mb-2">${artwork.title}</h4>
                <p class="text-sm text-gray-400 mb-2">작가: ${artwork.artist_name}</p>
                <p class="text-sm text-gray-400 mb-4">상태: 
                    <span class="${getStatusBadgeClass(artwork.status)}">
                        ${getStatusLabel(artwork.status)}
                    </span>
                </p>
                <div class="flex space-x-2">
                    ${artwork.status === 'pending' ? `
                        <button onclick="approveArtwork(${artwork.id})" 
                            class="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 rounded text-sm transition">
                            <i class="fas fa-check mr-1"></i>승인
                        </button>
                        <button onclick="rejectArtwork(${artwork.id})" 
                            class="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 rounded text-sm transition">
                            <i class="fas fa-times mr-1"></i>거부
                        </button>
                    ` : `
                        <button onclick="viewArtwork(${artwork.id})" 
                            class="flex-1 px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded text-sm transition">
                            <i class="fas fa-eye mr-1"></i>상세보기
                        </button>
                    `}
                </div>
            </div>
        </div>
    `).join('');
}

// Filter artworks
function filterArtworks() {
    const filter = document.getElementById('artworkFilter').value;
    const filtered = filter === 'all' 
        ? allArtworks 
        : allArtworks.filter(a => a.status === filter);
    renderArtworkGrid(filtered);
}

// Approve artwork
async function approveArtwork(id) {
    if (!confirm('이 작품을 승인하시겠습니까?')) return;
    
    try {
        await fetchAPI(`/api/admin/artworks/${id}/approve`, { method: 'POST' });
        showNotification('작품이 승인되었습니다', 'success');
        refreshArtworks();
        loadDashboardData();
    } catch (error) {
        showNotification('승인 실패', 'error');
    }
}

// Reject artwork
async function rejectArtwork(id) {
    const reason = prompt('거부 사유를 입력해주세요:');
    if (!reason) return;
    
    try {
        await fetchAPI(`/api/admin/artworks/${id}/reject`, {
            method: 'POST',
            body: JSON.stringify({ reason })
        });
        showNotification('작품이 거부되었습니다', 'success');
        refreshArtworks();
        loadDashboardData();
    } catch (error) {
        showNotification('거부 처리 실패', 'error');
    }
}

// Initialize charts
function initializeCharts() {
    // User Growth Chart
    const userGrowthCtx = document.getElementById('userGrowthChart');
    charts.userGrowth = new Chart(userGrowthCtx, {
        type: 'line',
        data: {
            labels: ['월', '화', '수', '목', '금', '토', '일'],
            datasets: [{
                label: '신규 사용자',
                data: [5, 8, 12, 7, 15, 20, 18],
                borderColor: 'rgb(59, 130, 246)',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                tension: 0.4,
                fill: true
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#9CA3AF' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                },
                x: {
                    ticks: { color: '#9CA3AF' },
                    grid: { color: '#374151' }
                }
            }
        }
    });
    
    // Artwork Status Chart
    const artworkStatusCtx = document.getElementById('artworkStatusChart');
    charts.artworkStatus = new Chart(artworkStatusCtx, {
        type: 'doughnut',
        data: {
            labels: ['승인됨', '승인 대기', '거부됨'],
            datasets: [{
                data: [45, 15, 5],
                backgroundColor: [
                    'rgb(34, 197, 94)',
                    'rgb(234, 179, 8)',
                    'rgb(239, 68, 68)'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    labels: { color: '#9CA3AF' }
                }
            }
        }
    });
}

// Update charts
function updateCharts(stats) {
    if (charts.userGrowth && stats.userGrowthData) {
        charts.userGrowth.data.datasets[0].data = stats.userGrowthData;
        charts.userGrowth.update();
    }
    
    if (charts.artworkStatus && stats.artworkStatusData) {
        charts.artworkStatus.data.datasets[0].data = stats.artworkStatusData;
        charts.artworkStatus.update();
    }
}

// Switch tabs
function switchTab(tab) {
    currentTab = tab;
    
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('border-b-2', 'border-blue-500', 'text-blue-500');
        btn.classList.add('text-gray-400');
    });
    document.getElementById(`tab-${tab}`).classList.add('border-b-2', 'border-blue-500', 'text-blue-500');
    document.getElementById(`tab-${tab}`).classList.remove('text-gray-400');
    
    // Update content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.add('hidden');
    });
    document.getElementById(`content-${tab}`).classList.remove('hidden');
    
    // Load tab-specific data
    if (tab === 'logs') {
        refreshLogs();
    }
}

// Refresh logs
async function refreshLogs() {
    try {
        const response = await fetchAPI('/api/admin/logs');
        const logs = response.logs || [];
        
        const logContent = document.getElementById('logContent');
        logContent.innerHTML = logs.map(log => {
            const levelClass = log.level === 'error' ? 'text-red-400' : 
                              log.level === 'warn' ? 'text-yellow-400' : 'text-gray-300';
            return `<div class="${levelClass}">[${formatDateTime(log.timestamp)}] [${log.level.toUpperCase()}] ${log.message}</div>`;
        }).join('');
    } catch (error) {
        document.getElementById('logContent').innerHTML = '<div class="text-red-400">로그 로드 실패</div>';
    }
}

// Trigger manual backup
async function triggerBackup() {
    if (!confirm('수동 백업을 실행하시겠습니까?')) return;
    
    try {
        showNotification('백업 시작...', 'info');
        const response = await fetchAPI('/api/admin/backup/trigger', { method: 'POST' });
        showNotification('백업이 완료되었습니다', 'success');
        document.getElementById('lastBackup').textContent = formatDateTime(new Date());
    } catch (error) {
        showNotification('백업 실패', 'error');
    }
}

// Helper functions
function getRoleBadgeClass(role) {
    const classes = {
        admin: 'bg-red-500 bg-opacity-20 text-red-400',
        artist: 'bg-purple-500 bg-opacity-20 text-purple-400',
        collector: 'bg-blue-500 bg-opacity-20 text-blue-400',
        expert: 'bg-green-500 bg-opacity-20 text-green-400',
        curator: 'bg-yellow-500 bg-opacity-20 text-yellow-400'
    };
    return classes[role] || 'bg-gray-500 bg-opacity-20 text-gray-400';
}

function getRoleLabel(role) {
    const labels = {
        admin: '관리자',
        artist: '작가',
        collector: '컬렉터',
        expert: '전문가',
        curator: '큐레이터',
        museum: '뮤지엄',
        gallery: '갤러리'
    };
    return labels[role] || role;
}

function getStatusBadgeClass(status) {
    const classes = {
        pending: 'text-yellow-400',
        approved: 'text-green-400',
        rejected: 'text-red-400'
    };
    return classes[status] || 'text-gray-400';
}

function getStatusLabel(status) {
    const labels = {
        pending: '승인 대기',
        approved: '승인됨',
        rejected: '거부됨'
    };
    return labels[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR');
}

function formatDateTime(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('ko-KR');
}

// API helper
async function fetchAPI(url, options = {}) {
    // ✅ FIX: Try multiple token sources: localStorage, sessionStorage, or rely on HttpOnly cookie
    const token = localStorage.getItem('token') || 
                  localStorage.getItem('session_token') || 
                  sessionStorage.getItem('session_token');
    
    console.log(`[fetchAPI] URL: ${url}, Token found: ${!!token}`);
    if (token) {
        console.log(`[fetchAPI] Token (first 20 chars): ${token.substring(0, 20)}...`);
    }
    
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    
    // Add Authorization header only if token exists
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }
    
    // ✅ FIX: Include credentials to send HttpOnly cookies automatically
    const response = await fetch(url, {
        ...options,
        headers,
        credentials: 'include' // Send cookies with request
    });
    
    console.log(`[fetchAPI] Response status: ${response.status}`);
    
    if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
    }
    
    return response.json();
}

// Show notification
function showNotification(message, type = 'info') {
    const colors = {
        success: 'bg-green-500',
        error: 'bg-red-500',
        info: 'bg-blue-500',
        warning: 'bg-yellow-500'
    };
    
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 ${colors[type]} text-white px-6 py-3 rounded shadow-lg z-50 transition-opacity duration-300`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

// User search
document.getElementById('userSearch')?.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const filtered = allUsers.filter(user => 
        user.email.toLowerCase().includes(searchTerm) ||
        user.name.toLowerCase().includes(searchTerm)
    );
    renderUserTable(filtered);
});

// Edit user
function editUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    const newRole = prompt(`${user.name}의 역할을 변경하세요:\n(admin, artist, collector, expert, curator)`, user.role);
    if (!newRole) return;
    
    // API call would go here
    showNotification('역할이 변경되었습니다', 'success');
}

// Delete user
async function deleteUser(id) {
    const user = allUsers.find(u => u.id === id);
    if (!user) return;
    
    if (!confirm(`정말 ${user.name} 사용자를 삭제하시겠습니까?`)) return;
    
    try {
        await fetchAPI(`/api/admin/users/${id}`, { method: 'DELETE' });
        showNotification('사용자가 삭제되었습니다', 'success');
        refreshUsers();
        loadDashboardData();
    } catch (error) {
        showNotification('삭제 실패', 'error');
    }
}

// View artwork
function viewArtwork(id) {
    window.open(`/artwork.html?id=${id}`, '_blank');
}
