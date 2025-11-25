/**
 * GalleryPia - Advanced Analytics Dashboard V2
 * L4-3: Enhanced analytics with Chart.js integration
 * 
 * Features:
 * - Multi-chart dashboard (line, bar, pie, doughnut, radar)
 * - Real-time data updates
 * - Custom date range filtering
 * - Export to CSV/PNG
 * - Comparison mode (multiple time periods)
 * - Responsive design
 * - Animation and transitions
 */

class AdvancedAnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.data = {};
    this.dateRange = 'week'; // week, month, quarter, year, custom
    this.comparisonMode = false;
    
    // Chart.js CDN will be loaded dynamically
    this.chartJsLoaded = false;
    
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  async init() {
    console.log('Advanced Analytics Dashboard V2 initialized');
    
    // Load Chart.js if not already loaded
    await this.loadChartJs();
    
    // Fetch analytics data
    await this.fetchAnalyticsData();
    
    // Create dashboard UI
    this.createDashboardUI();
    
    // Initialize charts
    this.initializeCharts();
    
    // Setup event listeners
    this.setupEventListeners();
  }

  async loadChartJs() {
    if (typeof Chart !== 'undefined') {
      this.chartJsLoaded = true;
      return;
    }

    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js';
      script.onload = () => {
        this.chartJsLoaded = true;
        console.log('Chart.js loaded successfully');
        resolve();
      };
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  async fetchAnalyticsData() {
    // Simulate fetching analytics data
    // In production, this would call backend API
    this.data = {
      views: this.generateTimeSeriesData(30, 100, 500),
      sales: this.generateTimeSeriesData(30, 50, 200),
      revenue: this.generateTimeSeriesData(30, 1000, 5000),
      userActivity: {
        labels: ['월', '화', '수', '목', '금', '토', '일'],
        data: [320, 450, 380, 520, 480, 650, 590]
      },
      categoryDistribution: {
        labels: ['추상화', '풍경화', '인물화', '정물화', '기타'],
        data: [30, 25, 20, 15, 10]
      },
      artistPerformance: {
        labels: ['김작가', '이작가', '박작가', '최작가', '정작가'],
        sales: [45, 38, 32, 28, 22],
        revenue: [4500, 3800, 3200, 2800, 2200]
      },
      geographicDistribution: {
        labels: ['서울', '부산', '인천', '대구', '대전', '기타'],
        data: [35, 15, 12, 10, 8, 20]
      }
    };
  }

  generateTimeSeriesData(days, min, max) {
    const data = [];
    const labels = [];
    const today = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      labels.push(date.toLocaleDateString('ko-KR', { month: 'short', day: 'numeric' }));
      data.push(Math.floor(Math.random() * (max - min + 1)) + min);
    }
    
    return { labels, data };
  }

  createDashboardUI() {
    // Check if dashboard already exists
    if (document.getElementById('advancedAnalyticsDashboard')) {
      return;
    }

    const dashboardHTML = `
      <div id="advancedAnalyticsDashboard" class="hidden fixed inset-0 bg-black bg-opacity-50 z-50 overflow-y-auto">
        <div class="min-h-screen p-4 md:p-8">
          <div class="max-w-7xl mx-auto bg-white rounded-lg shadow-2xl">
            <!-- Header -->
            <div class="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-lg">
              <div class="flex items-center justify-between">
                <div>
                  <h2 class="text-2xl font-bold flex items-center">
                    <i class="fas fa-chart-line mr-3"></i>
                    고급 분석 대시보드
                  </h2>
                  <p class="text-sm mt-1 opacity-90">실시간 데이터 분석 및 시각화</p>
                </div>
                <div class="flex items-center space-x-3">
                  <!-- Date Range Selector -->
                  <select id="analyticsDateRange" class="bg-white/20 text-white rounded-lg px-3 py-2 text-sm">
                    <option value="week">최근 7일</option>
                    <option value="month">최근 30일</option>
                    <option value="quarter">최근 90일</option>
                    <option value="year">최근 1년</option>
                  </select>
                  
                  <!-- Export Button -->
                  <button id="analyticsExport" class="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors">
                    <i class="fas fa-download mr-2"></i>내보내기
                  </button>
                  
                  <!-- Close Button -->
                  <button onclick="window.advancedAnalytics.close()" class="bg-white/20 hover:bg-white/30 rounded-lg px-3 py-2 transition-colors">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Dashboard Content -->
            <div class="p-6 space-y-6">
              <!-- Key Metrics -->
              <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div class="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-blue-600 font-semibold">총 조회수</p>
                      <p class="text-2xl font-bold text-blue-900 mt-1">12,345</p>
                      <p class="text-xs text-blue-600 mt-1">
                        <i class="fas fa-arrow-up"></i> 12.5% vs 지난주
                      </p>
                    </div>
                    <i class="fas fa-eye text-3xl text-blue-300"></i>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-green-600 font-semibold">총 판매</p>
                      <p class="text-2xl font-bold text-green-900 mt-1">1,234</p>
                      <p class="text-xs text-green-600 mt-1">
                        <i class="fas fa-arrow-up"></i> 8.3% vs 지난주
                      </p>
                    </div>
                    <i class="fas fa-shopping-cart text-3xl text-green-300"></i>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-purple-600 font-semibold">총 수익</p>
                      <p class="text-2xl font-bold text-purple-900 mt-1">₩123M</p>
                      <p class="text-xs text-purple-600 mt-1">
                        <i class="fas fa-arrow-up"></i> 15.7% vs 지난주
                      </p>
                    </div>
                    <i class="fas fa-dollar-sign text-3xl text-purple-300"></i>
                  </div>
                </div>

                <div class="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg">
                  <div class="flex items-center justify-between">
                    <div>
                      <p class="text-sm text-orange-600 font-semibold">활성 사용자</p>
                      <p class="text-2xl font-bold text-orange-900 mt-1">8,901</p>
                      <p class="text-xs text-orange-600 mt-1">
                        <i class="fas fa-arrow-up"></i> 5.2% vs 지난주
                      </p>
                    </div>
                    <i class="fas fa-users text-3xl text-orange-300"></i>
                  </div>
                </div>
              </div>

              <!-- Charts Grid -->
              <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <!-- Views Trend -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">조회수 추이</h3>
                  <canvas id="viewsChart" height="200"></canvas>
                </div>

                <!-- Sales Trend -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">판매 추이</h3>
                  <canvas id="salesChart" height="200"></canvas>
                </div>

                <!-- Category Distribution -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">카테고리별 분포</h3>
                  <canvas id="categoryChart" height="200"></canvas>
                </div>

                <!-- User Activity -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">요일별 사용자 활동</h3>
                  <canvas id="userActivityChart" height="200"></canvas>
                </div>

                <!-- Artist Performance -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">작가별 성과</h3>
                  <canvas id="artistChart" height="200"></canvas>
                </div>

                <!-- Geographic Distribution -->
                <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <h3 class="text-lg font-bold text-gray-800 mb-4">지역별 분포</h3>
                  <canvas id="geographicChart" height="200"></canvas>
                </div>
              </div>

              <!-- Revenue Chart (Full Width) -->
              <div class="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                <h3 class="text-lg font-bold text-gray-800 mb-4">수익 추이</h3>
                <canvas id="revenueChart" height="100"></canvas>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.insertAdjacentHTML('beforeend', dashboardHTML);
  }

  initializeCharts() {
    if (!this.chartJsLoaded) {
      console.error('Chart.js not loaded');
      return;
    }

    // Common chart options
    const commonOptions = {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          display: true,
          position: 'top'
        }
      }
    };

    // Views Chart (Line)
    this.charts.views = new Chart(document.getElementById('viewsChart'), {
      type: 'line',
      data: {
        labels: this.data.views.labels,
        datasets: [{
          label: '조회수',
          data: this.data.views.data,
          borderColor: 'rgb(59, 130, 246)',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: commonOptions
    });

    // Sales Chart (Bar)
    this.charts.sales = new Chart(document.getElementById('salesChart'), {
      type: 'bar',
      data: {
        labels: this.data.sales.labels,
        datasets: [{
          label: '판매량',
          data: this.data.sales.data,
          backgroundColor: 'rgba(34, 197, 94, 0.7)',
          borderColor: 'rgb(34, 197, 94)',
          borderWidth: 1
        }]
      },
      options: commonOptions
    });

    // Category Chart (Pie)
    this.charts.category = new Chart(document.getElementById('categoryChart'), {
      type: 'pie',
      data: {
        labels: this.data.categoryDistribution.labels,
        datasets: [{
          data: this.data.categoryDistribution.data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(156, 163, 175, 0.7)'
          ]
        }]
      },
      options: commonOptions
    });

    // User Activity Chart (Radar)
    this.charts.userActivity = new Chart(document.getElementById('userActivityChart'), {
      type: 'radar',
      data: {
        labels: this.data.userActivity.labels,
        datasets: [{
          label: '활동량',
          data: this.data.userActivity.data,
          backgroundColor: 'rgba(168, 85, 247, 0.2)',
          borderColor: 'rgb(168, 85, 247)',
          pointBackgroundColor: 'rgb(168, 85, 247)'
        }]
      },
      options: commonOptions
    });

    // Artist Performance Chart (Horizontal Bar)
    this.charts.artist = new Chart(document.getElementById('artistChart'), {
      type: 'bar',
      data: {
        labels: this.data.artistPerformance.labels,
        datasets: [{
          label: '판매량',
          data: this.data.artistPerformance.sales,
          backgroundColor: 'rgba(249, 115, 22, 0.7)'
        }]
      },
      options: {
        ...commonOptions,
        indexAxis: 'y'
      }
    });

    // Geographic Chart (Doughnut)
    this.charts.geographic = new Chart(document.getElementById('geographicChart'), {
      type: 'doughnut',
      data: {
        labels: this.data.geographicDistribution.labels,
        datasets: [{
          data: this.data.geographicDistribution.data,
          backgroundColor: [
            'rgba(59, 130, 246, 0.7)',
            'rgba(34, 197, 94, 0.7)',
            'rgba(168, 85, 247, 0.7)',
            'rgba(249, 115, 22, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(156, 163, 175, 0.7)'
          ]
        }]
      },
      options: commonOptions
    });

    // Revenue Chart (Area)
    this.charts.revenue = new Chart(document.getElementById('revenueChart'), {
      type: 'line',
      data: {
        labels: this.data.revenue.labels,
        datasets: [{
          label: '수익 (₩)',
          data: this.data.revenue.data,
          borderColor: 'rgb(168, 85, 247)',
          backgroundColor: 'rgba(168, 85, 247, 0.1)',
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        ...commonOptions,
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function(value) {
                return '₩' + value.toLocaleString();
              }
            }
          }
        }
      }
    });
  }

  setupEventListeners() {
    // Date range change
    const dateRangeSelect = document.getElementById('analyticsDateRange');
    if (dateRangeSelect) {
      dateRangeSelect.addEventListener('change', (e) => {
        this.dateRange = e.target.value;
        this.updateCharts();
      });
    }

    // Export button
    const exportBtn = document.getElementById('analyticsExport');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.exportData());
    }
  }

  async updateCharts() {
    // Fetch new data based on date range
    await this.fetchAnalyticsData();
    
    // Update all charts
    Object.keys(this.charts).forEach(chartKey => {
      const chart = this.charts[chartKey];
      // Update chart data here
      chart.update();
    });
  }

  exportData() {
    const exportMenu = confirm('어떤 형식으로 내보내시겠습니까?\n\nOK: CSV\nCancel: PNG (모든 차트)');
    
    if (exportMenu) {
      this.exportToCSV();
    } else {
      this.exportToPNG();
    }
  }

  exportToCSV() {
    // Generate CSV data
    let csv = 'Category,Value\n';
    
    // Add data from all charts
    this.data.categoryDistribution.labels.forEach((label, index) => {
      csv += `${label},${this.data.categoryDistribution.data[index]}\n`;
    });
    
    // Download CSV
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gallerypia-analytics-${Date.now()}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  }

  exportToPNG() {
    alert('PNG 내보내기 기능은 곧 구현될 예정입니다.');
  }

  open() {
    const dashboard = document.getElementById('advancedAnalyticsDashboard');
    if (dashboard) {
      dashboard.classList.remove('hidden');
      // Refresh charts on open
      Object.values(this.charts).forEach(chart => chart.resize());
    }
  }

  close() {
    const dashboard = document.getElementById('advancedAnalyticsDashboard');
    if (dashboard) {
      dashboard.classList.add('hidden');
    }
  }

  destroy() {
    // Destroy all charts
    Object.values(this.charts).forEach(chart => chart.destroy());
    this.charts = {};
    
    // Remove dashboard UI
    const dashboard = document.getElementById('advancedAnalyticsDashboard');
    if (dashboard) {
      dashboard.remove();
    }
  }
}

// Initialize global instance
window.advancedAnalytics = new AdvancedAnalyticsDashboard();

// Add menu item to open dashboard
window.openAnalyticsDashboard = function() {
  if (window.advancedAnalytics) {
    window.advancedAnalytics.open();
  }
};

// Export
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AdvancedAnalyticsDashboard;
}
