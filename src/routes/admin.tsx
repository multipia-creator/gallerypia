import { Hono } from 'hono'
import type { Context } from 'hono'

const admin = new Hono()

// Admin Stats API
admin.get('/stats', async (c: Context) => {
  const { DB } = c.env
  
  try {
    // Get total users count
    const usersResult = await DB.prepare('SELECT COUNT(*) as count FROM users').first()
    const totalUsers = usersResult?.count || 0
    
    // Get total artworks count
    const artworksResult = await DB.prepare('SELECT COUNT(*) as count FROM artworks').first()
    const totalArtworks = artworksResult?.count || 0
    
    // Get pending artworks count
    const pendingResult = await DB.prepare("SELECT COUNT(*) as count FROM artworks WHERE status='pending'").first()
    const pendingApprovals = pendingResult?.count || 0
    
    // Calculate growth (mock data for now)
    const usersGrowth = 12.5
    const artworksGrowth = 8.3
    
    // User growth data for chart
    const userGrowthData = [5, 8, 12, 7, 15, 20, 18]
    
    // Artwork status data for chart
    const approvedResult = await DB.prepare("SELECT COUNT(*) as count FROM artworks WHERE status='approved'").first()
    const rejectedResult = await DB.prepare("SELECT COUNT(*) as count FROM artworks WHERE status='rejected'").first()
    
    const artworkStatusData = [
      approvedResult?.count || 0,
      pendingResult?.count || 0,
      rejectedResult?.count || 0
    ]
    
    return c.json({
      success: true,
      totalUsers,
      totalArtworks,
      pendingApprovals,
      usersGrowth,
      artworksGrowth,
      uptime: 99.9,
      userGrowthData,
      artworkStatusData
    })
  } catch (error) {
    console.error('Admin stats error:', error)
    return c.json({ success: false, error: 'Failed to fetch stats' }, 500)
  }
})

// Get all users
admin.get('/users', async (c: Context) => {
  const { DB } = c.env
  
  try {
    const users = await DB.prepare(`
      SELECT id, email, name, role, created_at 
      FROM users 
      ORDER BY created_at DESC 
      LIMIT 100
    `).all()
    
    return c.json({
      success: true,
      users: users.results || []
    })
  } catch (error) {
    console.error('Get users error:', error)
    return c.json({ success: false, error: 'Failed to fetch users' }, 500)
  }
})

// Delete user
admin.delete('/users/:id', async (c: Context) => {
  const { DB } = c.env
  const userId = c.req.param('id')
  
  try {
    await DB.prepare('DELETE FROM users WHERE id = ?').bind(userId).run()
    
    return c.json({
      success: true,
      message: 'User deleted successfully'
    })
  } catch (error) {
    console.error('Delete user error:', error)
    return c.json({ success: false, error: 'Failed to delete user' }, 500)
  }
})

// Get all artworks
admin.get('/artworks', async (c: Context) => {
  const { DB } = c.env
  
  try {
    const artworks = await DB.prepare(`
      SELECT 
        a.id,
        a.title,
        a.description,
        a.image_url,
        a.status,
        a.created_at,
        u.name as artist_name
      FROM artworks a
      LEFT JOIN users u ON a.artist_id = u.id
      ORDER BY a.created_at DESC
      LIMIT 50
    `).all()
    
    return c.json({
      success: true,
      artworks: artworks.results || []
    })
  } catch (error) {
    console.error('Get artworks error:', error)
    return c.json({ success: false, error: 'Failed to fetch artworks' }, 500)
  }
})

// Approve artwork
admin.post('/artworks/:id/approve', async (c: Context) => {
  const { DB } = c.env
  const artworkId = c.req.param('id')
  
  try {
    await DB.prepare(`
      UPDATE artworks 
      SET status = 'approved', 
          approved_at = datetime('now')
      WHERE id = ?
    `).bind(artworkId).run()
    
    return c.json({
      success: true,
      message: 'Artwork approved successfully'
    })
  } catch (error) {
    console.error('Approve artwork error:', error)
    return c.json({ success: false, error: 'Failed to approve artwork' }, 500)
  }
})

// Reject artwork
admin.post('/artworks/:id/reject', async (c: Context) => {
  const { DB } = c.env
  const artworkId = c.req.param('id')
  const { reason } = await c.req.json()
  
  try {
    await DB.prepare(`
      UPDATE artworks 
      SET status = 'rejected',
          rejection_reason = ?,
          rejected_at = datetime('now')
      WHERE id = ?
    `).bind(reason, artworkId).run()
    
    return c.json({
      success: true,
      message: 'Artwork rejected successfully'
    })
  } catch (error) {
    console.error('Reject artwork error:', error)
    return c.json({ success: false, error: 'Failed to reject artwork' }, 500)
  }
})

// Get system logs
admin.get('/logs', async (c: Context) => {
  // Mock logs for now
  const logs = [
    { timestamp: new Date(Date.now() - 1000 * 60 * 5), level: 'info', message: 'User login: admin@gallerypia.com' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 10), level: 'info', message: 'Artwork approved: ID 42' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 15), level: 'warn', message: 'Rate limit exceeded: IP 192.168.1.100' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 20), level: 'info', message: 'Database backup completed' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 25), level: 'error', message: 'Failed API call: /api/artworks/999' },
    { timestamp: new Date(Date.now() - 1000 * 60 * 30), level: 'info', message: 'New user registered: artist@example.com' }
  ]
  
  return c.json({
    success: true,
    logs
  })
})

// Trigger manual backup
admin.post('/backup/trigger', async (c: Context) => {
  try {
    // This would trigger the backup script
    // For now, just return success
    console.log('Manual backup triggered by admin')
    
    return c.json({
      success: true,
      message: 'Backup started',
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Backup trigger error:', error)
    return c.json({ success: false, error: 'Failed to trigger backup' }, 500)
  }
})

export default admin
