import { Hono } from 'hono'
import type { Context } from 'hono'

interface Bindings {
  DB: D1Database
}

const notifications = new Hono<{ Bindings: Bindings }>()

// 알림 조회 (사용자별)
notifications.get('/', async (c: Context) => {
  try {
    const userId = c.req.query('userId')
    const limit = parseInt(c.req.query('limit') || '20')
    const unreadOnly = c.req.query('unreadOnly') === 'true'

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    let query = `
      SELECT 
        id, user_id, type, title, message, 
        link, is_read, created_at
      FROM notifications
      WHERE user_id = ?
    `
    
    if (unreadOnly) {
      query += ' AND is_read = 0'
    }
    
    query += ' ORDER BY created_at DESC LIMIT ?'

    const result = await c.env.DB.prepare(query)
      .bind(userId, limit)
      .all()

    return c.json({
      notifications: result.results || [],
      count: result.results?.length || 0
    })
  } catch (error) {
    console.error('❌ Notifications fetch error:', error)
    return c.json({ error: 'Failed to fetch notifications' }, 500)
  }
})

// 읽지 않은 알림 개수
notifications.get('/unread-count', async (c: Context) => {
  try {
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    const result = await c.env.DB.prepare(`
      SELECT COUNT(*) as count
      FROM notifications
      WHERE user_id = ? AND is_read = 0
    `).bind(userId).first()

    return c.json({ count: result?.count || 0 })
  } catch (error) {
    console.error('❌ Unread count error:', error)
    return c.json({ error: 'Failed to get unread count' }, 500)
  }
})

// 알림 읽음 처리
notifications.put('/:id/read', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE notifications
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Mark as read error:', error)
    return c.json({ error: 'Failed to mark as read' }, 500)
  }
})

// 모든 알림 읽음 처리
notifications.put('/read-all', async (c: Context) => {
  try {
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    await c.env.DB.prepare(`
      UPDATE notifications
      SET is_read = 1, updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND is_read = 0
    `).bind(userId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Mark all as read error:', error)
    return c.json({ error: 'Failed to mark all as read' }, 500)
  }
})

// 알림 삭제
notifications.delete('/:id', async (c: Context) => {
  try {
    const id = c.req.param('id')
    const userId = c.req.query('userId')

    if (!userId) {
      return c.json({ error: 'userId is required' }, 400)
    }

    await c.env.DB.prepare(`
      DELETE FROM notifications
      WHERE id = ? AND user_id = ?
    `).bind(id, userId).run()

    return c.json({ success: true })
  } catch (error) {
    console.error('❌ Delete notification error:', error)
    return c.json({ error: 'Failed to delete notification' }, 500)
  }
})

// 알림 생성 (내부 API)
notifications.post('/create', async (c: Context) => {
  try {
    const { userId, type, title, message, link } = await c.req.json()

    if (!userId || !type || !title || !message) {
      return c.json({ error: 'Missing required fields' }, 400)
    }

    const result = await c.env.DB.prepare(`
      INSERT INTO notifications (user_id, type, title, message, link)
      VALUES (?, ?, ?, ?, ?)
    `).bind(userId, type, title, message, link || null).run()

    return c.json({ 
      success: true,
      notificationId: result.meta.last_row_id
    })
  } catch (error) {
    console.error('❌ Create notification error:', error)
    return c.json({ error: 'Failed to create notification' }, 500)
  }
})

export default notifications
