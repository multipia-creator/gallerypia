import { Hono } from 'hono'
import type { Context } from 'hono'

interface Bindings {
  DB: D1Database
}

const analytics = new Hono<{ Bindings: Bindings }>()

// 사용자 행동 추적 이벤트 기록
analytics.post('/track', async (c: Context) => {
  try {
    const { userId, eventType, eventData, page, referrer } = await c.req.json()

    await c.env.DB.prepare(`
      INSERT INTO user_activity_logs (
        user_id, event_type, event_data, page_url, referrer
      ) VALUES (?, ?, ?, ?, ?)
    `).bind(
      userId || null,
      eventType,
      JSON.stringify(eventData || {}),
      page,
      referrer || null
    ).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Track event error:', error)
    return c.json({ error: 'Failed to track event' }, 500)
  }
})

// 사용자 행동 분석 (일별)
analytics.get('/user-behavior', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '7')

    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        event_type,
        COUNT(*) as count
      FROM user_activity_logs
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at), event_type
      ORDER BY date DESC, count DESC
    `).all()

    return c.json({ data: result.results || [] })
  } catch (error) {
    console.error('❌ User behavior error:', error)
    return c.json({ error: 'Failed to get user behavior' }, 500)
  }
})

// 인기 작품 트렌드
analytics.get('/trending-artworks', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const days = parseInt(c.req.query('days') || '7')

    const result = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.image_url,
        ar.name as artist_name,
        COUNT(DISTINCT ual.id) as activity_count,
        SUM(CASE WHEN ual.event_type = 'artwork_view' THEN 1 ELSE 0 END) as views,
        SUM(CASE WHEN ual.event_type = 'artwork_like' THEN 1 ELSE 0 END) as likes
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN user_activity_logs ual ON 
        ual.event_type IN ('artwork_view', 'artwork_like') 
        AND CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) = a.id
        AND ual.created_at >= datetime('now', '-${days} days')
      GROUP BY a.id, a.title, a.image_url, ar.name
      HAVING activity_count > 0
      ORDER BY activity_count DESC
      LIMIT ?
    `).bind(limit).all()

    return c.json({ artworks: result.results || [] })
  } catch (error) {
    console.error('❌ Trending artworks error:', error)
    return c.json({ error: 'Failed to get trending artworks' }, 500)
  }
})

// 페이지 조회수 통계
analytics.get('/page-views', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '7')

    const result = await c.env.DB.prepare(`
      SELECT 
        page_url,
        COUNT(*) as view_count,
        COUNT(DISTINCT user_id) as unique_visitors,
        AVG(CASE 
          WHEN event_type = 'page_view' 
          THEN CAST(json_extract(event_data, '$.duration') AS INTEGER) 
        END) as avg_duration
      FROM user_activity_logs
      WHERE event_type = 'page_view'
        AND created_at >= datetime('now', '-${days} days')
      GROUP BY page_url
      ORDER BY view_count DESC
      LIMIT 20
    `).all()

    return c.json({ pages: result.results || [] })
  } catch (error) {
    console.error('❌ Page views error:', error)
    return c.json({ error: 'Failed to get page views' }, 500)
  }
})

// 사용자 유입 경로 분석
analytics.get('/traffic-sources', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '7')

    const result = await c.env.DB.prepare(`
      SELECT 
        CASE 
          WHEN referrer IS NULL OR referrer = '' THEN 'Direct'
          WHEN referrer LIKE '%google.%' THEN 'Google'
          WHEN referrer LIKE '%facebook.%' THEN 'Facebook'
          WHEN referrer LIKE '%twitter.%' THEN 'Twitter'
          WHEN referrer LIKE '%instagram.%' THEN 'Instagram'
          ELSE 'Other'
        END as source,
        COUNT(*) as count,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_activity_logs
      WHERE event_type = 'page_view'
        AND created_at >= datetime('now', '-${days} days')
      GROUP BY source
      ORDER BY count DESC
    `).all()

    return c.json({ sources: result.results || [] })
  } catch (error) {
    console.error('❌ Traffic sources error:', error)
    return c.json({ error: 'Failed to get traffic sources' }, 500)
  }
})

// 수익 분석 (일별)
analytics.get('/revenue', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '30')

    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transaction_count,
        SUM(CAST(json_extract(event_data, '$.amount') AS REAL)) as total_revenue,
        AVG(CAST(json_extract(event_data, '$.amount') AS REAL)) as avg_transaction_value
      FROM user_activity_logs
      WHERE event_type = 'artwork_purchase'
        AND created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all()

    return c.json({ revenue: result.results || [] })
  } catch (error) {
    console.error('❌ Revenue analytics error:', error)
    return c.json({ error: 'Failed to get revenue analytics' }, 500)
  }
})

// 실시간 온라인 사용자 (최근 5분)
analytics.get('/online-users', async (c: Context) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT COUNT(DISTINCT user_id) as count
      FROM user_activity_logs
      WHERE created_at >= datetime('now', '-5 minutes')
    `).first()

    return c.json({ onlineUsers: result?.count || 0 })
  } catch (error) {
    console.error('❌ Online users error:', error)
    return c.json({ error: 'Failed to get online users' }, 500)
  }
})

// ============================================
// 🚀 Phase 10.4 고급 분석 기능
// ============================================

// Cohort Analysis (코호트 분석) - 사용자 리텐션
analytics.get('/cohort-analysis', async (c: Context) => {
  try {
    const months = parseInt(c.req.query('months') || '6')

    // 코호트별 사용자 수 및 리텐션율 계산
    const result = await c.env.DB.prepare(`
      WITH cohorts AS (
        SELECT 
          strftime('%Y-%m', u.created_at) as cohort_month,
          u.id as user_id,
          strftime('%Y-%m', u.created_at) as user_month
        FROM users u
        WHERE u.created_at >= datetime('now', '-${months} months')
      ),
      activity AS (
        SELECT 
          c.cohort_month,
          c.user_id,
          strftime('%Y-%m', ual.created_at) as activity_month,
          COUNT(*) as activity_count
        FROM cohorts c
        LEFT JOIN user_activity_logs ual ON c.user_id = ual.user_id
        WHERE ual.created_at >= c.user_month
        GROUP BY c.cohort_month, c.user_id, activity_month
      )
      SELECT 
        cohort_month,
        activity_month,
        COUNT(DISTINCT user_id) as active_users,
        (SELECT COUNT(DISTINCT user_id) FROM cohorts WHERE cohort_month = a.cohort_month) as cohort_size,
        ROUND(COUNT(DISTINCT user_id) * 100.0 / 
          (SELECT COUNT(DISTINCT user_id) FROM cohorts WHERE cohort_month = a.cohort_month), 2) as retention_rate
      FROM activity a
      GROUP BY cohort_month, activity_month
      ORDER BY cohort_month, activity_month
    `).all()

    return c.json({ cohorts: result.results || [] })
  } catch (error) {
    console.error('❌ Cohort analysis error:', error)
    return c.json({ error: 'Failed to get cohort analysis' }, 500)
  }
})

// Funnel Analysis (퍼널 분석) - 전환율
analytics.get('/funnel-analysis', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '30')

    // 회원가입 → 작품 조회 → 좋아요 → 구매 퍼널
    const result = await c.env.DB.prepare(`
      WITH funnel_data AS (
        SELECT 
          'signup' as stage,
          1 as step_order,
          COUNT(DISTINCT user_id) as user_count
        FROM user_activity_logs
        WHERE event_type = 'signup' 
          AND created_at >= datetime('now', '-${days} days')
        
        UNION ALL
        
        SELECT 
          'artwork_view' as stage,
          2 as step_order,
          COUNT(DISTINCT user_id) as user_count
        FROM user_activity_logs
        WHERE event_type = 'artwork_view'
          AND created_at >= datetime('now', '-${days} days')
        
        UNION ALL
        
        SELECT 
          'artwork_like' as stage,
          3 as step_order,
          COUNT(DISTINCT user_id) as user_count
        FROM user_activity_logs
        WHERE event_type = 'artwork_like'
          AND created_at >= datetime('now', '-${days} days')
        
        UNION ALL
        
        SELECT 
          'artwork_purchase' as stage,
          4 as step_order,
          COUNT(DISTINCT user_id) as user_count
        FROM user_activity_logs
        WHERE event_type = 'artwork_purchase'
          AND created_at >= datetime('now', '-${days} days')
      )
      SELECT 
        stage,
        step_order,
        user_count,
        ROUND(user_count * 100.0 / 
          (SELECT user_count FROM funnel_data WHERE step_order = 1), 2) as conversion_rate,
        ROUND(user_count * 100.0 / 
          LAG(user_count) OVER (ORDER BY step_order), 2) as step_conversion_rate
      FROM funnel_data
      ORDER BY step_order
    `).all()

    return c.json({ funnel: result.results || [] })
  } catch (error) {
    console.error('❌ Funnel analysis error:', error)
    return c.json({ error: 'Failed to get funnel analysis' }, 500)
  }
})

// User Engagement Metrics (사용자 참여도 지표)
analytics.get('/engagement-metrics', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '30')

    const result = await c.env.DB.prepare(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT user_id) as dau,
        COUNT(*) as total_events,
        ROUND(COUNT(*) * 1.0 / COUNT(DISTINCT user_id), 2) as events_per_user,
        COUNT(DISTINCT CASE WHEN event_type = 'artwork_view' THEN user_id END) as viewers,
        COUNT(DISTINCT CASE WHEN event_type = 'artwork_like' THEN user_id END) as likers,
        COUNT(DISTINCT CASE WHEN event_type = 'artwork_purchase' THEN user_id END) as buyers
      FROM user_activity_logs
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `).all()

    return c.json({ metrics: result.results || [] })
  } catch (error) {
    console.error('❌ Engagement metrics error:', error)
    return c.json({ error: 'Failed to get engagement metrics' }, 500)
  }
})

// User Segments (사용자 세그먼트)
analytics.get('/user-segments', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '30')

    const result = await c.env.DB.prepare(`
      WITH user_stats AS (
        SELECT 
          u.id,
          u.role,
          COUNT(CASE WHEN ual.event_type = 'artwork_view' THEN 1 END) as view_count,
          COUNT(CASE WHEN ual.event_type = 'artwork_like' THEN 1 END) as like_count,
          COUNT(CASE WHEN ual.event_type = 'artwork_purchase' THEN 1 END) as purchase_count,
          SUM(CASE 
            WHEN ual.event_type = 'artwork_purchase' 
            THEN CAST(json_extract(ual.event_data, '$.amount') AS REAL) 
            ELSE 0 
          END) as total_spent
        FROM users u
        LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
          AND ual.created_at >= datetime('now', '-${days} days')
        GROUP BY u.id, u.role
      )
      SELECT 
        CASE 
          WHEN purchase_count >= 5 THEN 'VIP Buyer'
          WHEN purchase_count >= 1 THEN 'Active Buyer'
          WHEN like_count >= 10 THEN 'Engaged User'
          WHEN view_count >= 5 THEN 'Casual Browser'
          ELSE 'New User'
        END as segment,
        role,
        COUNT(*) as user_count,
        ROUND(AVG(view_count), 2) as avg_views,
        ROUND(AVG(like_count), 2) as avg_likes,
        ROUND(AVG(purchase_count), 2) as avg_purchases,
        ROUND(AVG(total_spent), 2) as avg_spent
      FROM user_stats
      GROUP BY segment, role
      ORDER BY 
        CASE segment
          WHEN 'VIP Buyer' THEN 1
          WHEN 'Active Buyer' THEN 2
          WHEN 'Engaged User' THEN 3
          WHEN 'Casual Browser' THEN 4
          ELSE 5
        END
    `).all()

    return c.json({ segments: result.results || [] })
  } catch (error) {
    console.error('❌ User segments error:', error)
    return c.json({ error: 'Failed to get user segments' }, 500)
  }
})

// Time-based Activity Heatmap (시간대별 활동 히트맵)
analytics.get('/activity-heatmap', async (c: Context) => {
  try {
    const days = parseInt(c.req.query('days') || '30')

    const result = await c.env.DB.prepare(`
      SELECT 
        CAST(strftime('%w', created_at) AS INTEGER) as day_of_week,
        CAST(strftime('%H', created_at) AS INTEGER) as hour_of_day,
        COUNT(*) as activity_count,
        COUNT(DISTINCT user_id) as unique_users
      FROM user_activity_logs
      WHERE created_at >= datetime('now', '-${days} days')
      GROUP BY day_of_week, hour_of_day
      ORDER BY day_of_week, hour_of_day
    `).all()

    return c.json({ heatmap: result.results || [] })
  } catch (error) {
    console.error('❌ Activity heatmap error:', error)
    return c.json({ error: 'Failed to get activity heatmap' }, 500)
  }
})

// Advanced Demographics (고급 인구통계)
analytics.get('/demographics', async (c: Context) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        u.role,
        COUNT(DISTINCT u.id) as user_count,
        AVG(julianday('now') - julianday(u.created_at)) as avg_account_age_days,
        COUNT(DISTINCT CASE 
          WHEN ual.created_at >= datetime('now', '-7 days') 
          THEN u.id 
        END) as active_last_7days,
        COUNT(DISTINCT CASE 
          WHEN ual.created_at >= datetime('now', '-30 days') 
          THEN u.id 
        END) as active_last_30days,
        ROUND(COUNT(DISTINCT CASE 
          WHEN ual.created_at >= datetime('now', '-7 days') 
          THEN u.id 
        END) * 100.0 / COUNT(DISTINCT u.id), 2) as active_rate_7d
      FROM users u
      LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
      GROUP BY u.role
      ORDER BY user_count DESC
    `).all()

    return c.json({ demographics: result.results || [] })
  } catch (error) {
    console.error('❌ Demographics error:', error)
    return c.json({ error: 'Failed to get demographics' }, 500)
  }
})

// Customer Lifetime Value (고객 생애 가치)
analytics.get('/lifetime-value', async (c: Context) => {
  try {
    const result = await c.env.DB.prepare(`
      SELECT 
        u.id,
        u.email,
        u.full_name,
        u.role,
        u.created_at as signup_date,
        COUNT(CASE WHEN ual.event_type = 'artwork_purchase' THEN 1 END) as total_purchases,
        SUM(CASE 
          WHEN ual.event_type = 'artwork_purchase' 
          THEN CAST(json_extract(ual.event_data, '$.amount') AS REAL) 
          ELSE 0 
        END) as lifetime_value,
        MAX(CASE WHEN ual.event_type = 'artwork_purchase' THEN ual.created_at END) as last_purchase_date,
        ROUND(julianday('now') - julianday(u.created_at), 0) as customer_age_days
      FROM users u
      LEFT JOIN user_activity_logs ual ON u.id = ual.user_id
      WHERE u.role IN ('buyer', 'collector')
      GROUP BY u.id, u.email, u.full_name, u.role, u.created_at
      HAVING lifetime_value > 0
      ORDER BY lifetime_value DESC
      LIMIT 100
    `).all()

    return c.json({ customers: result.results || [] })
  } catch (error) {
    console.error('❌ Lifetime value error:', error)
    return c.json({ error: 'Failed to get lifetime value' }, 500)
  }
})

export default analytics
