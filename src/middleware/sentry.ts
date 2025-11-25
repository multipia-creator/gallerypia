import type { Context, Next } from 'hono'

/**
 * Lightweight error tracking middleware
 * Note: Sentry has been removed to reduce bundle size (saves ~1MB)
 * For production error tracking, consider:
 * 1. Using Cloudflare Workers Analytics Engine
 * 2. External logging service via fetch API
 * 3. Cloudflare Logpush
 */

interface ErrorLog {
  timestamp: string
  error: string
  stack?: string
  user?: { id?: string; email?: string }
  request: {
    path: string
    method: string
    query: Record<string, unknown>
  }
}

export async function initSentry(_dsn: string, environment: string) {
  console.log(`📊 Error tracking initialized for ${environment}`)
  // Placeholder for future external error tracking integration
}

export async function sentryErrorHandler(c: Context, next: Next) {
  try {
    await next()
  } catch (error) {
    // Create structured error log
    const errorLog: ErrorLog = {
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      user: {
        id: c.get('user')?.id?.toString(),
        email: c.get('user')?.email
      },
      request: {
        path: c.req.path,
        method: c.req.method,
        query: c.req.query()
      }
    }
    
    // Log to console (will appear in Cloudflare Workers logs)
    console.error('❌ Application Error:', JSON.stringify(errorLog, null, 2))
    
    // TODO: Send to external logging service if configured
    // Example: await fetch('https://your-logging-service.com/errors', { 
    //   method: 'POST', 
    //   body: JSON.stringify(errorLog) 
    // })
    
    // Re-throw to let default error handler deal with it
    throw error
  }
}
