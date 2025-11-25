/**
 * Advanced Analytics Dashboard - Phase 10.4
 * 고급 사용자 행동 분석 및 대시보드
 */

class AdvancedAnalyticsDashboard {
  constructor() {
    this.charts = {}
    this.refreshInterval = null
    this.selectedPeriod = 30 // days
  }

  async init() {
    console.log('🚀 Advanced Analytics Dashboard initialized')
    await this.loadAllAnalytics()
    this.startAutoRefresh()
  }

  async loadAllAnalytics() {
    await Promise.all([
      this.loadCohortAnalysis(),
      this.loadFunnelAnalysis(),
      this.loadEngagementMetrics(),
      this.loadUserSegments(),
      this.loadActivityHeatmap(),
      this.loadDemographics(),
      this.loadLifetimeValue()
    ])
  }

  // ============================================
  // Cohort Analysis (코호트 분석)
  // ============================================
  async loadCohortAnalysis() {
    try {
      const response = await fetch(`/api/analytics/cohort-analysis?months=6`)
      const data = await response.json()

      if (data.cohorts && data.cohorts.length > 0) {
        this.renderCohortTable(data.cohorts)
        this.renderCohortChart(data.cohorts)
      }
    } catch (error) {
      console.error('❌ Cohort analysis error:', error)
    }
  }

  renderCohortTable(cohorts) {
    const container = document.getElementById('cohort-table')
    if (!container) return

    // 코호트별로 데이터 그룹화
    const cohortGroups = {}
    cohorts.forEach(row => {
      if (!cohortGroups[row.cohort_month]) {
        cohortGroups[row.cohort_month] = []
      }
      cohortGroups[row.cohort_month].push(row)
    })

    // 테이블 HTML 생성
    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white/5 border border-white/10 rounded-lg">
          <thead>
            <tr class="bg-white/10">
              <th class="px-4 py-3 text-left text-white font-semibold">Cohort</th>
              <th class="px-4 py-3 text-left text-white font-semibold">Size</th>
    `

    // 월별 헤더
    const months = [...new Set(cohorts.map(c => c.activity_month))].sort()
    months.forEach(month => {
      html += `<th class="px-4 py-3 text-center text-white font-semibold">${month}</th>`
    })

    html += `
            </tr>
          </thead>
          <tbody>
    `

    // 각 코호트별 행
    Object.keys(cohortGroups).sort().reverse().forEach(cohortMonth => {
      const cohortData = cohortGroups[cohortMonth]
      const cohortSize = cohortData[0].cohort_size

      html += `
        <tr class="border-t border-white/10 hover:bg-white/5">
          <td class="px-4 py-3 text-white font-medium">${cohortMonth}</td>
          <td class="px-4 py-3 text-gray-300">${cohortSize}</td>
      `

      months.forEach(month => {
        const monthData = cohortData.find(d => d.activity_month === month)
        if (monthData) {
          const rate = monthData.retention_rate
          const color = rate >= 50 ? 'text-green-400' : rate >= 25 ? 'text-yellow-400' : 'text-red-400'
          html += `<td class="px-4 py-3 text-center ${color} font-semibold">${rate}%</td>`
        } else {
          html += `<td class="px-4 py-3 text-center text-gray-600">-</td>`
        }
      })

      html += `</tr>`
    })

    html += `
          </tbody>
        </table>
      </div>
    `

    container.innerHTML = html
  }

  renderCohortChart(cohorts) {
    const canvas = document.getElementById('cohort-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    // 데이터 준비
    const cohortMonths = [...new Set(cohorts.map(c => c.cohort_month))].sort()
    const datasets = cohortMonths.map((cohortMonth, index) => {
      const cohortData = cohorts.filter(c => c.cohort_month === cohortMonth)
      return {
        label: cohortMonth,
        data: cohortData.map(d => d.retention_rate),
        borderColor: `hsl(${index * 60}, 70%, 50%)`,
        backgroundColor: `hsla(${index * 60}, 70%, 50%, 0.1)`,
        tension: 0.4
      }
    })

    if (this.charts.cohort) {
      this.charts.cohort.destroy()
    }

    this.charts.cohort = new Chart(ctx, {
      type: 'line',
      data: {
        labels: [...new Set(cohorts.map(c => c.activity_month))].sort(),
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '코호트별 리텐션율 추이',
            color: '#fff',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    })
  }

  // ============================================
  // Funnel Analysis (퍼널 분석)
  // ============================================
  async loadFunnelAnalysis() {
    try {
      const response = await fetch(`/api/analytics/funnel-analysis?days=${this.selectedPeriod}`)
      const data = await response.json()

      if (data.funnel && data.funnel.length > 0) {
        this.renderFunnelChart(data.funnel)
      }
    } catch (error) {
      console.error('❌ Funnel analysis error:', error)
    }
  }

  renderFunnelChart(funnel) {
    const canvas = document.getElementById('funnel-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    const stages = funnel.map(f => {
      const names = {
        'signup': '회원가입',
        'artwork_view': '작품 조회',
        'artwork_like': '좋아요',
        'artwork_purchase': '구매'
      }
      return names[f.stage] || f.stage
    })

    if (this.charts.funnel) {
      this.charts.funnel.destroy()
    }

    this.charts.funnel = new Chart(ctx, {
      type: 'bar',
      data: {
        labels: stages,
        datasets: [{
          label: '사용자 수',
          data: funnel.map(f => f.user_count),
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)'
          ]
        }, {
          label: '전환율 (%)',
          data: funnel.map(f => f.conversion_rate),
          type: 'line',
          borderColor: 'rgb(239, 68, 68)',
          backgroundColor: 'rgba(239, 68, 68, 0.1)',
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '사용자 전환 퍼널',
            color: '#fff',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            max: 100,
            ticks: { color: '#fff' },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    })
  }

  // ============================================
  // Engagement Metrics (참여도 지표)
  // ============================================
  async loadEngagementMetrics() {
    try {
      const response = await fetch(`/api/analytics/engagement-metrics?days=${this.selectedPeriod}`)
      const data = await response.json()

      if (data.metrics && data.metrics.length > 0) {
        this.renderEngagementChart(data.metrics)
      }
    } catch (error) {
      console.error('❌ Engagement metrics error:', error)
    }
  }

  renderEngagementChart(metrics) {
    const canvas = document.getElementById('engagement-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (this.charts.engagement) {
      this.charts.engagement.destroy()
    }

    this.charts.engagement = new Chart(ctx, {
      type: 'line',
      data: {
        labels: metrics.map(m => m.date).reverse(),
        datasets: [{
          label: 'DAU (일일 활성 사용자)',
          data: metrics.map(m => m.dau).reverse(),
          borderColor: 'rgb(139, 92, 246)',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          yAxisID: 'y'
        }, {
          label: '사용자당 이벤트',
          data: metrics.map(m => m.events_per_user).reverse(),
          borderColor: 'rgb(16, 185, 129)',
          backgroundColor: 'rgba(16, 185, 129, 0.1)',
          yAxisID: 'y1'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '사용자 참여도 추이',
            color: '#fff',
            font: { size: 16 }
          },
          legend: {
            labels: { color: '#fff' }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            ticks: { color: '#fff' },
            grid: { color: 'rgba(255,255,255,0.1)' }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            ticks: { color: '#fff' },
            grid: { drawOnChartArea: false }
          },
          x: {
            ticks: { color: '#fff', maxRotation: 45 },
            grid: { color: 'rgba(255,255,255,0.1)' }
          }
        }
      }
    })
  }

  // ============================================
  // User Segments (사용자 세그먼트)
  // ============================================
  async loadUserSegments() {
    try {
      const response = await fetch(`/api/analytics/user-segments?days=${this.selectedPeriod}`)
      const data = await response.json()

      if (data.segments && data.segments.length > 0) {
        this.renderSegmentsChart(data.segments)
      }
    } catch (error) {
      console.error('❌ User segments error:', error)
    }
  }

  renderSegmentsChart(segments) {
    const canvas = document.getElementById('segments-chart')
    if (!canvas) return

    const ctx = canvas.getContext('2d')

    if (this.charts.segments) {
      this.charts.segments.destroy()
    }

    this.charts.segments = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: segments.map(s => s.segment),
        datasets: [{
          data: segments.map(s => s.user_count),
          backgroundColor: [
            'rgba(139, 92, 246, 0.8)',
            'rgba(59, 130, 246, 0.8)',
            'rgba(16, 185, 129, 0.8)',
            'rgba(245, 158, 11, 0.8)',
            'rgba(239, 68, 68, 0.8)'
          ]
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          title: {
            display: true,
            text: '사용자 세그먼트 분포',
            color: '#fff',
            font: { size: 16 }
          },
          legend: {
            position: 'right',
            labels: { color: '#fff' }
          }
        }
      }
    })
  }

  // ============================================
  // Activity Heatmap (활동 히트맵)
  // ============================================
  async loadActivityHeatmap() {
    try {
      const response = await fetch(`/api/analytics/activity-heatmap?days=${this.selectedPeriod}`)
      const data = await response.json()

      if (data.heatmap && data.heatmap.length > 0) {
        this.renderHeatmap(data.heatmap)
      }
    } catch (error) {
      console.error('❌ Activity heatmap error:', error)
    }
  }

  renderHeatmap(heatmap) {
    const container = document.getElementById('heatmap-container')
    if (!container) return

    const days = ['일', '월', '화', '수', '목', '금', '토']
    const hours = Array.from({ length: 24 }, (_, i) => i)

    // 최대값 찾기 (색상 스케일용)
    const maxActivity = Math.max(...heatmap.map(h => h.activity_count))

    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full">
          <thead>
            <tr>
              <th class="px-2 py-2 text-white font-semibold">시간</th>
    `

    days.forEach(day => {
      html += `<th class="px-2 py-2 text-white font-semibold text-center">${day}</th>`
    })

    html += `
            </tr>
          </thead>
          <tbody>
    `

    hours.forEach(hour => {
      html += `<tr><td class="px-2 py-2 text-gray-400 text-sm">${hour}시</td>`
      
      days.forEach((_, dayIndex) => {
        const cell = heatmap.find(h => h.day_of_week === dayIndex && h.hour_of_day === hour)
        const activity = cell ? cell.activity_count : 0
        const intensity = activity / maxActivity
        const color = `rgba(139, 92, 246, ${intensity})`
        
        html += `
          <td class="px-2 py-2 text-center text-white text-xs font-semibold border border-white/10" 
              style="background-color: ${color}">
            ${activity || ''}
          </td>
        `
      })

      html += `</tr>`
    })

    html += `
          </tbody>
        </table>
      </div>
      <div class="mt-4 flex items-center justify-center gap-2 text-sm text-gray-400">
        <span>낮음</span>
        <div class="flex gap-1">
          ${Array.from({ length: 5 }, (_, i) => `
            <div class="w-4 h-4 rounded" style="background-color: rgba(139, 92, 246, ${(i + 1) * 0.2})"></div>
          `).join('')}
        </div>
        <span>높음</span>
      </div>
    `

    container.innerHTML = html
  }

  // ============================================
  // Demographics (인구통계)
  // ============================================
  async loadDemographics() {
    try {
      const response = await fetch('/api/analytics/demographics')
      const data = await response.json()

      if (data.demographics && data.demographics.length > 0) {
        this.renderDemographicsTable(data.demographics)
      }
    } catch (error) {
      console.error('❌ Demographics error:', error)
    }
  }

  renderDemographicsTable(demographics) {
    const container = document.getElementById('demographics-table')
    if (!container) return

    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white/5 border border-white/10 rounded-lg">
          <thead>
            <tr class="bg-white/10">
              <th class="px-4 py-3 text-left text-white font-semibold">역할</th>
              <th class="px-4 py-3 text-right text-white font-semibold">사용자 수</th>
              <th class="px-4 py-3 text-right text-white font-semibold">평균 계정 나이</th>
              <th class="px-4 py-3 text-right text-white font-semibold">7일 활성</th>
              <th class="px-4 py-3 text-right text-white font-semibold">30일 활성</th>
              <th class="px-4 py-3 text-right text-white font-semibold">활성률</th>
            </tr>
          </thead>
          <tbody>
    `

    demographics.forEach(demo => {
      const roleNames = {
        'buyer': '구매자',
        'seller': '판매자',
        'artist': '작가',
        'expert': '전문가',
        'museum': '미술관',
        'gallery': '갤러리',
        'collector': '컬렉터',
        'curator': '큐레이터'
      }

      html += `
        <tr class="border-t border-white/10 hover:bg-white/5">
          <td class="px-4 py-3 text-white font-medium">${roleNames[demo.role] || demo.role}</td>
          <td class="px-4 py-3 text-right text-gray-300">${demo.user_count}</td>
          <td class="px-4 py-3 text-right text-gray-300">${Math.round(demo.avg_account_age_days)}일</td>
          <td class="px-4 py-3 text-right text-gray-300">${demo.active_last_7days}</td>
          <td class="px-4 py-3 text-right text-gray-300">${demo.active_last_30days}</td>
          <td class="px-4 py-3 text-right ${demo.active_rate_7d >= 50 ? 'text-green-400' : 'text-yellow-400'} font-semibold">
            ${demo.active_rate_7d}%
          </td>
        </tr>
      `
    })

    html += `
          </tbody>
        </table>
      </div>
    `

    container.innerHTML = html
  }

  // ============================================
  // Lifetime Value (고객 생애 가치)
  // ============================================
  async loadLifetimeValue() {
    try {
      const response = await fetch('/api/analytics/lifetime-value')
      const data = await response.json()

      if (data.customers && data.customers.length > 0) {
        this.renderLifetimeValueTable(data.customers)
      }
    } catch (error) {
      console.error('❌ Lifetime value error:', error)
    }
  }

  renderLifetimeValueTable(customers) {
    const container = document.getElementById('lifetime-value-table')
    if (!container) return

    let html = `
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white/5 border border-white/10 rounded-lg">
          <thead>
            <tr class="bg-white/10">
              <th class="px-4 py-3 text-left text-white font-semibold">고객</th>
              <th class="px-4 py-3 text-right text-white font-semibold">생애 가치</th>
              <th class="px-4 py-3 text-right text-white font-semibold">구매 횟수</th>
              <th class="px-4 py-3 text-right text-white font-semibold">최근 구매</th>
              <th class="px-4 py-3 text-right text-white font-semibold">가입 후 경과</th>
            </tr>
          </thead>
          <tbody>
    `

    customers.slice(0, 20).forEach(customer => {
      const ltv = parseFloat(customer.lifetime_value).toFixed(2)
      const daysSincePurchase = customer.last_purchase_date ? 
        Math.round((Date.now() - new Date(customer.last_purchase_date).getTime()) / (1000 * 60 * 60 * 24)) : null

      html += `
        <tr class="border-t border-white/10 hover:bg-white/5">
          <td class="px-4 py-3">
            <div class="text-white font-medium">${customer.full_name}</div>
            <div class="text-gray-400 text-sm">${customer.email}</div>
          </td>
          <td class="px-4 py-3 text-right text-green-400 font-bold">${ltv} ETH</td>
          <td class="px-4 py-3 text-right text-gray-300">${customer.total_purchases}회</td>
          <td class="px-4 py-3 text-right text-gray-300">
            ${daysSincePurchase !== null ? `${daysSincePurchase}일 전` : '-'}
          </td>
          <td class="px-4 py-3 text-right text-gray-300">${Math.round(customer.customer_age_days)}일</td>
        </tr>
      `
    })

    html += `
          </tbody>
        </table>
      </div>
    `

    container.innerHTML = html
  }

  // ============================================
  // Auto Refresh
  // ============================================
  startAutoRefresh() {
    // 5분마다 자동 새로고침
    this.refreshInterval = setInterval(() => {
      this.loadAllAnalytics()
    }, 5 * 60 * 1000)
  }

  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval)
      this.refreshInterval = null
    }
  }

  // Period selector
  setPeriod(days) {
    this.selectedPeriod = days
    this.loadAllAnalytics()
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('advanced-analytics-dashboard')) {
      window.advancedAnalytics = new AdvancedAnalyticsDashboard()
      window.advancedAnalytics.init()
    }
  })
} else {
  if (document.getElementById('advanced-analytics-dashboard')) {
    window.advancedAnalytics = new AdvancedAnalyticsDashboard()
    window.advancedAnalytics.init()
  }
}
