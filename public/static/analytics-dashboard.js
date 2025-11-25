/**
 * Analytics Dashboard
 * Comprehensive analytics for artists and collectors
 * Phase 6.6 - Low Priority UX (UX-L-032 to UX-L-036: Analytics)
 */

class AnalyticsDashboard {
  constructor(userRole = 'collector') {
    this.userRole = userRole; // 'artist' | 'collector'
    this.data = {};
    this.init();
  }

  init() {
    console.log('📊 Analytics Dashboard initialized');
    this.loadAnalyticsData();
  }

  async loadAnalyticsData() {
    try {
      const endpoint = this.userRole === 'artist' ? '/api/analytics/artist' : '/api/analytics/collector';
      const response = await fetch(endpoint);
      this.data = await response.json();
      this.renderDashboard();
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  renderDashboard(containerId = 'analytics-dashboard') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (this.userRole === 'artist') {
      this.renderArtistDashboard(container);
    } else {
      this.renderCollectorDashboard(container);
    }
  }

  renderArtistDashboard(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">작가 분석</h2>
        
        <!-- Key Metrics -->
        <div class="grid grid-cols-4 gap-4">
          ${this.renderMetricCard('총 조회수', this.data.totalViews || 0, 'fa-eye', 'blue')}
          ${this.renderMetricCard('작품 판매', this.data.totalSales || 0, 'fa-shopping-cart', 'green')}
          ${this.renderMetricCard('평균 가격', this.formatCurrency(this.data.avgPrice || 0), 'fa-won-sign', 'indigo')}
          ${this.renderMetricCard('전환율', `${(this.data.conversionRate || 0).toFixed(2)}%`, 'fa-chart-line', 'yellow')}
        </div>
        
        <!-- Charts -->
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4">월별 조회수 추이</h3>
            <canvas id="views-chart"></canvas>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4">지역별 조회자</h3>
            <canvas id="geography-chart"></canvas>
          </div>
        </div>
        
        <!-- Top Artworks -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold mb-4">인기 작품 TOP 5</h3>
          ${this.renderTopArtworks(this.data.topArtworks || [])}
        </div>
      </div>
    `;
    
    // Initialize charts (placeholder)
    this.initializeCharts();
  }

  renderCollectorDashboard(container) {
    container.innerHTML = `
      <div class="space-y-6">
        <h2 class="text-2xl font-bold text-gray-800">컬렉터 분석</h2>
        
        <!-- Portfolio Summary -->
        <div class="grid grid-cols-4 gap-4">
          ${this.renderMetricCard('포트폴리오 가치', this.formatCurrency(this.data.portfolioValue || 0), 'fa-briefcase', 'indigo')}
          ${this.renderMetricCard('총 작품', this.data.totalArtworks || 0, 'fa-image', 'blue')}
          ${this.renderMetricCard('ROI', `${(this.data.roi || 0).toFixed(2)}%`, 'fa-chart-line', 'green')}
          ${this.renderMetricCard('가치 상승', this.formatCurrency(this.data.valueIncrease || 0), 'fa-arrow-up', 'yellow')}
        </div>
        
        <!-- Charts -->
        <div class="grid grid-cols-2 gap-6">
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4">포트폴리오 구성</h3>
            <canvas id="portfolio-composition-chart"></canvas>
          </div>
          <div class="bg-white rounded-lg shadow-md p-6">
            <h3 class="text-lg font-bold mb-4">가치 변동 추이</h3>
            <canvas id="value-trend-chart"></canvas>
          </div>
        </div>
        
        <!-- Investment Performance -->
        <div class="bg-white rounded-lg shadow-md p-6">
          <h3 class="text-lg font-bold mb-4">투자 성과</h3>
          ${this.renderInvestmentPerformance(this.data.investments || [])}
        </div>
      </div>
    `;
    
    this.initializeCharts();
  }

  renderMetricCard(label, value, icon, color) {
    return `
      <div class="bg-white rounded-lg shadow-md p-6">
        <div class="flex justify-between items-start">
          <div>
            <p class="text-sm text-gray-600">${label}</p>
            <p class="text-2xl font-bold text-${color}-600 mt-2">${value}</p>
          </div>
          <i class="fas ${icon} text-2xl text-${color}-400"></i>
        </div>
      </div>
    `;
  }

  renderTopArtworks(artworks) {
    if (artworks.length === 0) {
      return '<p class="text-gray-500 text-center py-4">데이터 없음</p>';
    }
    
    return `
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">순위</th>
            <th class="text-left py-2">작품명</th>
            <th class="text-right py-2">조회수</th>
            <th class="text-right py-2">좋아요</th>
            <th class="text-right py-2">전환율</th>
          </tr>
        </thead>
        <tbody>
          ${artworks.map((artwork, index) => `
            <tr class="border-b hover:bg-gray-50">
              <td class="py-2">${index + 1}</td>
              <td class="py-2 font-semibold">${artwork.title}</td>
              <td class="text-right py-2">${artwork.views.toLocaleString()}</td>
              <td class="text-right py-2">${artwork.likes.toLocaleString()}</td>
              <td class="text-right py-2">${artwork.conversionRate.toFixed(2)}%</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  renderInvestmentPerformance(investments) {
    if (investments.length === 0) {
      return '<p class="text-gray-500 text-center py-4">투자 데이터 없음</p>';
    }
    
    return `
      <table class="w-full">
        <thead>
          <tr class="border-b">
            <th class="text-left py-2">작품명</th>
            <th class="text-right py-2">구매가</th>
            <th class="text-right py-2">현재가</th>
            <th class="text-right py-2">ROI</th>
          </tr>
        </thead>
        <tbody>
          ${investments.map(investment => `
            <tr class="border-b hover:bg-gray-50">
              <td class="py-2 font-semibold">${investment.title}</td>
              <td class="text-right py-2">${this.formatCurrency(investment.purchasePrice)}</td>
              <td class="text-right py-2">${this.formatCurrency(investment.currentValue)}</td>
              <td class="text-right py-2 ${investment.roi >= 0 ? 'text-green-600' : 'text-red-600'}">
                ${investment.roi >= 0 ? '+' : ''}${investment.roi.toFixed(2)}%
              </td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  initializeCharts() {
    // Placeholder for chart initialization
    console.log('📈 Charts would be initialized here (using Chart.js)');
  }

  formatCurrency(amount) {
    return new Intl.NumberFormat('ko-KR', { style: 'currency', currency: 'KRW', maximumFractionDigits: 0 }).format(amount);
  }

  async exportAnalytics(format = 'csv') {
    try {
      const response = await fetch(`/api/analytics/export?format=${format}`);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `analytics_${Date.now()}.${format}`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  }
}

let analyticsDashboard;
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    analyticsDashboard = new AnalyticsDashboard();
  });
} else {
  analyticsDashboard = new AnalyticsDashboard();
}
