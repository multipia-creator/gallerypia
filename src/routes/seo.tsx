import { Hono } from 'hono'
import type { Context } from 'hono'

interface Bindings {
  DB: D1Database
}

const seo = new Hono<{ Bindings: Bindings }>()

// sitemap.xml 생성
seo.get('/sitemap.xml', async (c: Context) => {
  try {
    const baseUrl = 'https://gallerypia.pages.dev'
    
    // 정적 페이지
    const staticPages = [
      { loc: '/', priority: '1.0', changefreq: 'daily' },
      { loc: '/gallery', priority: '0.9', changefreq: 'daily' },
      { loc: '/leaderboard', priority: '0.8', changefreq: 'weekly' },
      { loc: '/academy.html', priority: '0.7', changefreq: 'monthly' },
      { loc: '/about', priority: '0.6', changefreq: 'monthly' },
      { loc: '/login.html', priority: '0.5', changefreq: 'monthly' },
      { loc: '/signup.html', priority: '0.5', changefreq: 'monthly' },
    ]

    // 작품 페이지
    const artworks = await c.env.DB.prepare(`
      SELECT id, updated_at
      FROM artworks
      ORDER BY updated_at DESC
      LIMIT 1000
    `).all()

    // 아티스트 페이지
    const artists = await c.env.DB.prepare(`
      SELECT id, updated_at
      FROM artists
      ORDER BY updated_at DESC
      LIMIT 500
    `).all()

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'

    // 정적 페이지
    staticPages.forEach(page => {
      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}${page.loc}</loc>\n`
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`
      xml += `    <priority>${page.priority}</priority>\n`
      xml += '  </url>\n'
    })

    // 작품 페이지
    artworks.results?.forEach((artwork: any) => {
      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}/artwork/${artwork.id}</loc>\n`
      xml += `    <lastmod>${artwork.updated_at}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.7</priority>\n'
      xml += '  </url>\n'
    })

    // 아티스트 페이지
    artists.results?.forEach((artist: any) => {
      xml += '  <url>\n'
      xml += `    <loc>${baseUrl}/artist/${artist.id}</loc>\n`
      xml += `    <lastmod>${artist.updated_at}</lastmod>\n`
      xml += '    <changefreq>weekly</changefreq>\n'
      xml += '    <priority>0.6</priority>\n'
      xml += '  </url>\n'
    })

    xml += '</urlset>'

    return new Response(xml, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=3600'
      }
    })
  } catch (error) {
    console.error('❌ Sitemap generation error:', error)
    return c.text('Error generating sitemap', 500)
  }
})

// robots.txt
seo.get('/robots.txt', async (c: Context) => {
  const robots = `User-agent: *
Allow: /
Disallow: /api/
Disallow: /admin/
Disallow: /dashboard/

Sitemap: https://gallerypia.pages.dev/sitemap.xml
Sitemap: https://gallerypia.com/sitemap.xml
`

  return new Response(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
})

// Schema.org JSON-LD for artwork pages
seo.get('/schema/artwork/:id', async (c: Context) => {
  try {
    const artworkId = c.req.param('id')

    const artwork = await c.env.DB.prepare(`
      SELECT 
        a.*,
        ar.name as artist_name,
        ar.bio as artist_bio
      FROM artworks a
      LEFT JOIN artists ar ON a.artist_id = ar.id
      WHERE a.id = ?
    `).bind(artworkId).first()

    if (!artwork) {
      return c.json({ error: 'Artwork not found' }, 404)
    }

    const schema = {
      "@context": "https://schema.org",
      "@type": "VisualArtwork",
      "name": artwork.title,
      "description": artwork.description || `NFT artwork by ${artwork.artist_name}`,
      "image": artwork.image_url,
      "creator": {
        "@type": "Person",
        "name": artwork.artist_name,
        "description": artwork.artist_bio
      },
      "dateCreated": artwork.created_at,
      "artform": "Digital Art",
      "artMedium": "NFT",
      "offers": {
        "@type": "Offer",
        "price": artwork.current_price_krw,
        "priceCurrency": "KRW",
        "availability": "https://schema.org/InStock",
        "url": `https://gallerypia.pages.dev/artwork/${artwork.id}`
      },
      "aggregateRating": {
        "@type": "AggregateRating",
        "ratingValue": artwork.valuation_score || 0,
        "bestRating": 100,
        "reviewCount": artwork.likes_count || 0
      }
    }

    return c.json(schema)
  } catch (error) {
    console.error('❌ Schema generation error:', error)
    return c.json({ error: 'Failed to generate schema' }, 500)
  }
})

export default seo
