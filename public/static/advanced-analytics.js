/**
 * GALLERYPIA - Advanced Analytics & Business Intelligence
 * Phase 14: Real-time Dashboard, AI Predictions, User Behavior Analysis
 */

class AdvancedAnalytics {
  constructor() {
    this.metrics = new Map();
    this.charts = new Map();
    this.realTimeData = null;
    this.updateInterval = null;
    this.init();
  }

  async init() {
    console.log('📊 Advanced Analytics initializing...');
    await this.loadDashboard();
    this.startRealTimeUpdates();
  }

  async loadDashboard() {
    console.log('📊 Loading analytics dashboard...');
    try {
      const response = await fetch('/api/analytics/dashboard');
      const result = await response.json();
      
      if (result.success) {
        this.realTimeData = {
          revenue: result.revenue,
          users: result.users,
          transactions: result.transactions,
          trending: result.trending,
          predictions: result.predictions,
          timestamp: new Date().toISOString()
        };

        this.renderDashboard(this.realTimeData);
        this.trackEvent('dashboard_loaded');
        
        return this.realTimeData;
      }
    } catch (error) {
      console.error('❌ Dashboard load failed:', error);
    }
    return null;
  }

  renderDashboard(data) {
    console.log('🎨 Rendering dashboard with real-time data...');
    
    // KPI 카드 렌더링
    this.renderKPICards(data);
    
    // 차트 렌더링
    this.renderRevenueChart(data.revenue);
    this.renderUserGrowthChart(data.users);
    this.renderTransactionChart(data.transactions);
    this.renderTrendingArtworks(data.trending);
    this.renderPredictions(data.predictions);
  }

  renderKPICards(data) {
    const kpiContainer = document.getElementById('kpi-cards') || this.createKPIContainer();
    
    kpiContainer.innerHTML = `
      <div class="kpi-grid">
        <div class="kpi-card revenue">
          <div class="kpi-icon">💰</div>
          <div class="kpi-value">${this.formatCurrency(data.revenue.total)}</div>
          <div class="kpi-label">Total Revenue</div>
          <div class="kpi-change ${data.revenue.change >= 0 ? 'positive' : 'negative'}">
            ${data.revenue.change >= 0 ? '↑' : '↓'} ${Math.abs(data.revenue.change)}%
          </div>
        </div>

        <div class="kpi-card users">
          <div class="kpi-icon">👥</div>
          <div class="kpi-value">${this.formatNumber(data.users.total)}</div>
          <div class="kpi-label">Active Users</div>
          <div class="kpi-change positive">↑ ${data.users.growth}%</div>
        </div>

        <div class="kpi-card transactions">
          <div class="kpi-icon">📊</div>
          <div class="kpi-value">${this.formatNumber(data.transactions.count)}</div>
          <div class="kpi-label">Transactions</div>
          <div class="kpi-change positive">↑ ${data.transactions.volume_change}%</div>
        </div>

        <div class="kpi-card conversion">
          <div class="kpi-icon">🎯</div>
          <div class="kpi-value">${data.users.conversion_rate}%</div>
          <div class="kpi-label">Conversion Rate</div>
          <div class="kpi-change positive">↑ ${data.users.conversion_change}%</div>
        </div>
      </div>
    `;
  }

  createKPIContainer() {
    const container = document.createElement('div');
    container.id = 'kpi-cards';
    document.body.appendChild(container);
    return container;
  }

  renderRevenueChart(revenueData) {
    console.log('📈 Rendering revenue chart...');
    
    const ctx = document.getElementById('revenueChart');
    if (!ctx) return;

    if (this.charts.has('revenue')) {
      this.charts.get('revenue').destroy();
    }

    const chart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: revenueData.timeline.map(d => d.date),
        datasets: [{
          label: 'Revenue (ETH)',
          data: revenueData.timeline.map(d => d.amount),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Revenue Trend (Last 30 Days)'
          }
        }
      }
    });

    this.charts.set('revenue', chart);
  }

  renderUserGrowthChart(userData) {
    console.log('📈 Rendering user growth chart...');
    
    const ctx = document.getElementById('userGrowthChart');
    if (!ctx) return;

    if (this.charts.has('users')) {
      this.charts.get('users').destroy();
    }

    const chart = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: userData.timeline.map(d => d.date),
        datasets: [{
          label: 'New Users',
          data: userData.timeline.map(d => d.new_users),
          backgroundColor: 'rgba(54, 162, 235, 0.5)',
          borderColor: 'rgb(54, 162, 235)',
          borderWidth: 1
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'User Growth'
          }
        }
      }
    });

    this.charts.set('users', chart);
  }

  renderTransactionChart(txData) {
    console.log('📊 Rendering transaction chart...');
    
    const ctx = document.getElementById('transactionChart');
    if (!ctx) return;

    if (this.charts.has('transactions')) {
      this.charts.get('transactions').destroy();
    }

    const chart = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Sales', 'Auctions', 'Transfers', 'Mints'],
        datasets: [{
          data: [
            txData.sales,
            txData.auctions,
            txData.transfers,
            txData.mints
          ],
          backgroundColor: [
            'rgba(255, 99, 132, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(75, 192, 192, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        plugins: {
          title: {
            display: true,
            text: 'Transaction Distribution'
          }
        }
      }
    });

    this.charts.set('transactions', chart);
  }

  renderTrendingArtworks(trending) {
    console.log('🔥 Rendering trending artworks...');
    
    const container = document.getElementById('trending-artworks') || this.createTrendingContainer();
    
    container.innerHTML = `
      <h3>🔥 Trending Artworks</h3>
      <div class="trending-grid">
        ${trending.map(artwork => `
          <div class="trending-item" data-id="${artwork.id}">
            <img src="${artwork.image}" alt="${artwork.title}" />
            <div class="trending-info">
              <h4>${artwork.title}</h4>
              <p class="artist">${artwork.artist}</p>
              <p class="price">${this.formatCurrency(artwork.price)} ETH</p>
              <div class="trending-stats">
                <span>👁️ ${this.formatNumber(artwork.views)}</span>
                <span>❤️ ${this.formatNumber(artwork.likes)}</span>
                <span>📈 ${artwork.price_change}%</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  createTrendingContainer() {
    const container = document.createElement('div');
    container.id = 'trending-artworks';
    document.body.appendChild(container);
    return container;
  }

  renderPredictions(predictions) {
    console.log('🔮 Rendering AI predictions...');
    
    const container = document.getElementById('ai-predictions') || this.createPredictionsContainer();
    
    container.innerHTML = `
      <h3>🤖 AI Market Predictions</h3>
      <div class="predictions-grid">
        <div class="prediction-card">
          <h4>Price Forecast</h4>
          <p class="prediction-value">${predictions.price_forecast.direction}</p>
          <p class="prediction-detail">
            Expected ${predictions.price_forecast.change}% change in next 7 days
          </p>
          <div class="confidence">Confidence: ${predictions.price_forecast.confidence}%</div>
        </div>

        <div class="prediction-card">
          <h4>Volume Prediction</h4>
          <p class="prediction-value">${this.formatNumber(predictions.volume_forecast.amount)} ETH</p>
          <p class="prediction-detail">
            Predicted trading volume for next week
          </p>
          <div class="confidence">Confidence: ${predictions.volume_forecast.confidence}%</div>
        </div>

        <div class="prediction-card">
          <h4>Hot Categories</h4>
          <ul class="category-list">
            ${predictions.hot_categories.map(cat => `
              <li>${cat.name} <span class="growth">+${cat.growth}%</span></li>
            `).join('')}
          </ul>
        </div>

        <div class="prediction-card">
          <h4>Recommended Actions</h4>
          <ul class="recommendations">
            ${predictions.recommendations.map(rec => `
              <li class="recommendation ${rec.type}">
                ${rec.action}
              </li>
            `).join('')}
          </ul>
        </div>
      </div>
    `;
  }

  createPredictionsContainer() {
    const container = document.createElement('div');
    container.id = 'ai-predictions';
    document.body.appendChild(container);
    return container;
  }

  async getMarketTrends() {
    console.log('📈 Getting market trends...');
    try {
      const response = await fetch('/api/analytics/market-trends');
      const result = await response.json();
      
      if (result.success) {
        this.trackEvent('market_trends_fetched');
        return {
          price_trends: result.price_trends,
          volume_trends: result.volume_trends,
          popular_categories: result.popular_categories,
          predictions: result.ai_predictions
        };
      }
    } catch (error) {
      console.error('❌ Trends fetch failed:', error);
    }
    return null;
  }

  async getUserBehaviorAnalysis() {
    console.log('👥 Analyzing user behavior...');
    
    try {
      const response = await fetch('/api/analytics/user-behavior');
      const result = await response.json();
      
      if (result.success) {
        this.renderHeatmap(result.heatmap);
        this.renderFunnelAnalysis(result.funnel);
        this.renderUserSegments(result.segments);
        
        this.trackEvent('user_behavior_analyzed');
        return result;
      }
    } catch (error) {
      console.error('❌ User behavior analysis failed:', error);
    }
    return null;
  }

  renderHeatmap(heatmapData) {
    console.log('🗺️ Rendering interaction heatmap...');
    // 히트맵 렌더링 로직 (실제로는 h337.js 같은 라이브러리 사용)
  }

  renderFunnelAnalysis(funnelData) {
    console.log('📉 Rendering funnel analysis...');
    
    const container = document.getElementById('funnel-analysis') || this.createFunnelContainer();
    
    container.innerHTML = `
      <h3>📊 Conversion Funnel</h3>
      <div class="funnel-chart">
        ${funnelData.stages.map((stage, index) => `
          <div class="funnel-stage" style="width: ${100 - index * 10}%">
            <div class="stage-name">${stage.name}</div>
            <div class="stage-value">${this.formatNumber(stage.users)}</div>
            <div class="stage-rate">${stage.conversion_rate}%</div>
          </div>
        `).join('')}
      </div>
    `;
  }

  createFunnelContainer() {
    const container = document.createElement('div');
    container.id = 'funnel-analysis';
    document.body.appendChild(container);
    return container;
  }

  renderUserSegments(segments) {
    console.log('👥 Rendering user segments...');
    
    const container = document.getElementById('user-segments') || this.createSegmentsContainer();
    
    container.innerHTML = `
      <h3>👥 User Segments</h3>
      <div class="segments-grid">
        ${segments.map(segment => `
          <div class="segment-card">
            <h4>${segment.name}</h4>
            <p class="segment-size">${this.formatNumber(segment.users)} users (${segment.percentage}%)</p>
            <div class="segment-metrics">
              <p>Avg. Spend: ${this.formatCurrency(segment.avg_spend)} ETH</p>
              <p>Frequency: ${segment.frequency}</p>
              <p>LTV: ${this.formatCurrency(segment.lifetime_value)} ETH</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  createSegmentsContainer() {
    const container = document.createElement('div');
    container.id = 'user-segments';
    document.body.appendChild(container);
    return container;
  }

  startRealTimeUpdates() {
    console.log('⚡ Starting real-time updates...');
    
    // 30초마다 대시보드 업데이트
    this.updateInterval = setInterval(async () => {
      await this.loadDashboard();
    }, 30000);

    this.trackEvent('realtime_updates_started');
  }

  stopRealTimeUpdates() {
    console.log('⏸️ Stopping real-time updates...');
    
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }

    this.trackEvent('realtime_updates_stopped');
  }

  // Utility functions
  formatCurrency(value) {
    return new Intl.NumberFormat('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 4
    }).format(value);
  }

  formatNumber(value) {
    if (value >= 1000000) {
      return (value / 1000000).toFixed(1) + 'M';
    } else if (value >= 1000) {
      return (value / 1000).toFixed(1) + 'K';
    }
    return value.toString();
  }

  trackEvent(eventName, data = {}) {
    if (window.gtag) {
      window.gtag('event', eventName, {
        event_category: 'Analytics',
        timestamp: new Date().toISOString(),
        ...data
      });
    }
  }

  destroy() {
    this.stopRealTimeUpdates();
    this.charts.forEach(chart => chart.destroy());
    this.charts.clear();
  }
}

window.AdvancedAnalytics = AdvancedAnalytics;
window.analytics = null;

window.initAnalytics = function() {
  if (!window.analytics) {
    window.analytics = new AdvancedAnalytics();
    console.log('✅ Advanced Analytics initialized');
  }
  return window.analytics;
};

console.log('📦 Advanced Analytics module loaded');
