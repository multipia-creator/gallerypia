import { Hono } from 'hono'
import type { Context } from 'hono'

interface Bindings {
  DB: D1Database
}

const recommendations = new Hono<{ Bindings: Bindings }>()

// 사용자 맞춤 추천
recommendations.get('/personalized', async (c: Context) => {
  try {
    const userId = c.req.query('userId')
    const limit = parseInt(c.req.query('limit') || '10')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    // 1. 사용자가 최근 조회/좋아요한 작품의 카테고리 분석
    const userPreferences = await c.env.DB.prepare(`
      SELECT 
        a.category,
        COUNT(*) as interaction_count
      FROM user_activity_logs ual
      JOIN artworks a ON CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) = a.id
      WHERE ual.user_id = ?
        AND ual.event_type IN ('artwork_view', 'artwork_like')
        AND ual.created_at >= datetime('now', '-30 days')
      GROUP BY a.category
      ORDER BY interaction_count DESC
      LIMIT 3
    `).bind(userId).all()

    const preferredCategories = userPreferences.results?.map((r: any) => r.category) || []

    // 2. 선호 카테고리에서 인기 작품 추천 (이미 본 작품 제외)
    const placeholders = preferredCategories.map(() => '?').join(',')
    const query = `
      SELECT DISTINCT
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        ar.name as artist_name,
        a.views_count + a.likes_count * 2 as popularity_score
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.category IN (${placeholders || "''"})
        AND a.id NOT IN (
          SELECT CAST(json_extract(event_data, '$.artworkId') AS INTEGER)
          FROM user_activity_logs
          WHERE user_id = ? AND event_type IN ('artwork_view', 'artwork_like')
        )
      ORDER BY popularity_score DESC, a.created_at DESC
      LIMIT ?
    `

    const result = await c.env.DB.prepare(query)
      .bind(...preferredCategories, userId, limit)
      .all()

    return c.json({ 
      artworks: result.results || [],
      preferredCategories
    })
  } catch (error) {
    console.error('❌ Personalized recommendations error:', error)
    return c.json({ error: 'Failed to get recommendations' }, 500)
  }
})

// 유사 작품 추천
recommendations.get('/similar/:artworkId', async (c: Context) => {
  try {
    const artworkId = c.req.param('artworkId')
    const limit = parseInt(c.req.query('limit') || '6')

    // 현재 작품 정보
    const artwork = await c.env.DB.prepare(`
      SELECT category, artist_id, current_price_krw
      FROM artworks
      WHERE id = ?
    `).bind(artworkId).first()

    if (!artwork) {
      return c.json({ error: 'Artwork not found' }, 404)
    }

    // 유사 작품 찾기 (같은 카테고리 또는 같은 작가)
    const result = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        ar.name as artist_name,
        CASE 
          WHEN a.artist_id = ? THEN 3
          WHEN a.category = ? THEN 2
          WHEN ABS(a.current_price_krw - ?) < 10000000 THEN 1
          ELSE 0
        END as similarity_score
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id != ?
      ORDER BY similarity_score DESC, RANDOM()
      LIMIT ?
    `).bind(
      artwork.artist_id,
      artwork.category,
      artwork.current_price_krw,
      artworkId,
      limit
    ).all()

    return c.json({ artworks: result.results || [] })
  } catch (error) {
    console.error('❌ Similar artworks error:', error)
    return c.json({ error: 'Failed to get similar artworks' }, 500)
  }
})

// 트렌딩 작품 추천
recommendations.get('/trending', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const days = parseInt(c.req.query('days') || '7')

    const result = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        ar.name as artist_name,
        COUNT(DISTINCT ual.id) as recent_activity,
        a.views_count + a.likes_count * 2 as base_popularity,
        (COUNT(DISTINCT ual.id) * 10 + a.views_count + a.likes_count * 2) as trending_score
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      LEFT JOIN user_activity_logs ual ON 
        ual.event_type IN ('artwork_view', 'artwork_like')
        AND CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) = a.id
        AND ual.created_at >= datetime('now', '-' || ? || ' days')
      GROUP BY a.id, a.title, a.image_url, a.category, a.current_price_krw, ar.name
      ORDER BY trending_score DESC
      LIMIT ?
    `).bind(days, limit).all()

    return c.json({ artworks: result.results || [] })
  } catch (error) {
    console.error('❌ Trending recommendations error:', error)
    return c.json({ error: 'Failed to get trending artworks' }, 500)
  }
})

// 신규 작품 추천
recommendations.get('/new', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')

    const result = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        a.created_at,
        ar.name as artist_name
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.created_at >= datetime('now', '-30 days')
      ORDER BY a.created_at DESC
      LIMIT ?
    `).bind(limit).all()

    return c.json({ artworks: result.results || [] })
  } catch (error) {
    console.error('❌ New artworks error:', error)
    return c.json({ error: 'Failed to get new artworks' }, 500)
  }
})

// 고가 작품 추천 (투자용)
recommendations.get('/premium', async (c: Context) => {
  try {
    const limit = parseInt(c.req.query('limit') || '10')
    const minPrice = parseInt(c.req.query('minPrice') || '50000000') // 5천만원 이상

    const result = await c.env.DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        a.valuation_score,
        ar.name as artist_name,
        ar.rank as artist_rank
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.current_price_krw >= ?
      ORDER BY a.valuation_score DESC, a.current_price_krw DESC
      LIMIT ?
    `).bind(minPrice, limit).all()

    return c.json({ artworks: result.results || [] })
  } catch (error) {
    console.error('❌ Premium artworks error:', error)
    return c.json({ error: 'Failed to get premium artworks' }, 500)
  }
})

// ML 기반 하이브리드 추천 (Collaborative + Content-Based)
recommendations.get('/hybrid/:userId', async (c: Context) => {
  try {
    const userId = c.req.param('userId')
    const limit = parseInt(c.req.query('limit') || '12')

    // 1. Get user interaction patterns
    const userInteractions = await c.env.DB.prepare(`
      SELECT 
        CAST(json_extract(event_data, '$.artworkId') AS INTEGER) as artwork_id,
        event_type,
        COUNT(*) as interaction_count
      FROM user_activity_logs
      WHERE user_id = ?
        AND event_type IN ('artwork_view', 'artwork_like', 'artwork_share')
        AND created_at >= datetime('now', '-60 days')
      GROUP BY artwork_id, event_type
    `).bind(userId).all()

    const viewedIds = new Set()
    const likedIds = new Set()
    
    userInteractions.results?.forEach((row: any) => {
      if (row.event_type === 'artwork_view') viewedIds.add(row.artwork_id)
      if (row.event_type === 'artwork_like') likedIds.add(row.artwork_id)
    })

    // 2. Content-based: Find similar artworks based on user preferences
    const preferredFeatures = await c.env.DB.prepare(`
      SELECT 
        a.category,
        a.artist_id,
        COUNT(*) as frequency
      FROM user_activity_logs ual
      JOIN artworks a ON CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) = a.id
      WHERE ual.user_id = ?
        AND ual.event_type IN ('artwork_like', 'artwork_view')
        AND ual.created_at >= datetime('now', '-60 days')
      GROUP BY a.category, a.artist_id
      ORDER BY frequency DESC
      LIMIT 10
    `).bind(userId).all()

    const preferredCategories = [...new Set(
      preferredFeatures.results?.map((r: any) => r.category) || []
    )]
    const preferredArtists = [...new Set(
      preferredFeatures.results?.map((r: any) => r.artist_id).filter((id: any) => id) || []
    )]

    // 3. Collaborative filtering: Find similar users' liked artworks
    const similarUsersArtworks = await c.env.DB.prepare(`
      WITH user_likes AS (
        SELECT CAST(json_extract(event_data, '$.artworkId') AS INTEGER) as artwork_id
        FROM user_activity_logs
        WHERE user_id = ? AND event_type = 'artwork_like'
      ),
      similar_users AS (
        SELECT DISTINCT ual.user_id
        FROM user_activity_logs ual
        JOIN user_likes ul ON CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) = ul.artwork_id
        WHERE ual.user_id != ?
          AND ual.event_type = 'artwork_like'
        GROUP BY ual.user_id
        HAVING COUNT(*) >= 2
        LIMIT 50
      )
      SELECT 
        CAST(json_extract(ual.event_data, '$.artworkId') AS INTEGER) as artwork_id,
        COUNT(DISTINCT ual.user_id) as similar_user_count
      FROM user_activity_logs ual
      JOIN similar_users su ON ual.user_id = su.user_id
      WHERE ual.event_type = 'artwork_like'
      GROUP BY artwork_id
      ORDER BY similar_user_count DESC
      LIMIT 20
    `).bind(userId, userId).all()

    const collaborativeIds = similarUsersArtworks.results?.map((r: any) => r.artwork_id) || []

    // 4. Combine both approaches with popularity
    const categoryFilter = preferredCategories.length > 0 
      ? `a.category IN (${preferredCategories.map(() => '?').join(',')})` 
      : '1=1'
    
    const artistFilter = preferredArtists.length > 0
      ? `a.artist_id IN (${preferredArtists.map(() => '?').join(',')})` 
      : '1=1'

    const excludeIds = [...viewedIds].join(',') || '0'

    const hybridQuery = `
      SELECT 
        a.id,
        a.title,
        a.image_url,
        a.category,
        a.current_price_krw,
        a.views_count,
        a.likes_count,
        a.valuation_score,
        ar.name as artist_name,
        CASE 
          WHEN ${artistFilter} THEN 40
          WHEN ${categoryFilter} THEN 30
          ELSE 0
        END as content_score,
        (a.views_count * 0.1 + a.likes_count * 0.5 + COALESCE(a.valuation_score, 0) * 2) as popularity_score
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id NOT IN (${excludeIds})
      ORDER BY 
        (content_score * 0.4 + popularity_score * 0.3) DESC,
        a.created_at DESC
      LIMIT ?
    `

    const bindings = [...preferredCategories, ...preferredArtists, limit]
    const result = await c.env.DB.prepare(hybridQuery).bind(...bindings).all()

    return c.json({ 
      artworks: result.results || [],
      algorithm: 'hybrid',
      preferredCategories,
      collaborativeMatches: collaborativeIds.length
    })
  } catch (error) {
    console.error('❌ Hybrid recommendations error:', error)
    return c.json({ error: 'Failed to get hybrid recommendations' }, 500)
  }
})

// 알고리즘 설명 API
recommendations.get('/algorithm-info/:userId', async (c: Context) => {
  try {
    const userId = c.req.param('userId')

    const stats = await c.env.DB.prepare(`
      SELECT 
        COUNT(DISTINCT CASE WHEN event_type = 'artwork_view' THEN id END) as views,
        COUNT(DISTINCT CASE WHEN event_type = 'artwork_like' THEN id END) as likes,
        COUNT(DISTINCT CASE WHEN event_type = 'search' THEN id END) as searches
      FROM user_activity_logs
      WHERE user_id = ?
        AND created_at >= datetime('now', '-60 days')
    `).bind(userId).first()

    const totalInteractions = (stats?.views || 0) + (stats?.likes || 0) + (stats?.searches || 0)
    
    let algorithm = 'Popularity-Based'
    let description = '사용자 기록이 없어 인기 작품을 추천합니다'
    let confidence = 50

    if (totalInteractions >= 30) {
      algorithm = 'Advanced Hybrid'
      description = '고도화된 ML 알고리즘으로 개인화된 추천을 제공합니다'
      confidence = Math.min(90 + (totalInteractions - 30) * 0.3, 98)
    } else if (totalInteractions >= 10) {
      algorithm = 'Hybrid (Content + Collaborative)'
      description = '작품 특성과 사용자 패턴을 결합하여 추천합니다'
      confidence = 70 + Math.min(totalInteractions, 20)
    } else if (totalInteractions > 0) {
      algorithm = 'Content-Based'
      description = '작품 특성을 분석하여 유사한 작품을 추천합니다'
      confidence = 60 + (totalInteractions * 2)
    }

    return c.json({
      algorithm,
      description,
      confidence: Math.round(confidence),
      dataPoints: totalInteractions,
      stats: {
        views: stats?.views || 0,
        likes: stats?.likes || 0,
        searches: stats?.searches || 0
      }
    })
  } catch (error) {
    console.error('❌ Algorithm info error:', error)
    return c.json({ error: 'Failed to get algorithm info' }, 500)
  }
})

export default recommendations
