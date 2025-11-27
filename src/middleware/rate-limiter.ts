/**
 * Rate Limiting Middleware
 * Token Bucket Algorithm for API rate limiting
 */

import type { Context, Next } from 'hono'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxRequests: number   // Maximum requests per window
  message?: string      // Custom error message
  skipSuccessfulRequests?: boolean
}

interface TokenBucket {
  tokens: number
  lastRefill: number
}

// In-memory store for rate limiting (per-instance)
// In production, consider using Cloudflare KV or Durable Objects
const buckets = new Map<string, TokenBucket>()

/**
 * Create a rate limiter middleware
 */
export function rateLimiter(config: RateLimitConfig) {
  const {
    windowMs,
    maxRequests,
    message = 'Too many requests, please try again later.',
    skipSuccessfulRequests = false
  } = config

  return async (c: Context, next: Next) => {
    // Get client identifier (IP address)
    const clientId = getClientId(c)
    
    // Get or create token bucket for this client
    const now = Date.now()
    let bucket = buckets.get(clientId)
    
    if (!bucket) {
      bucket = {
        tokens: maxRequests,
        lastRefill: now
      }
      buckets.set(clientId, bucket)
    }
    
    // Refill tokens based on time passed
    const timePassed = now - bucket.lastRefill
    const refillAmount = (timePassed / windowMs) * maxRequests
    
    bucket.tokens = Math.min(maxRequests, bucket.tokens + refillAmount)
    bucket.lastRefill = now
    
    // Check if request is allowed
    if (bucket.tokens < 1) {
      const retryAfter = Math.ceil((windowMs - timePassed) / 1000)
      
      return c.json({
        success: false,
        error: message,
        retryAfter: retryAfter
      }, 429, {
        'Retry-After': retryAfter.toString(),
        'X-RateLimit-Limit': maxRequests.toString(),
        'X-RateLimit-Remaining': '0',
        'X-RateLimit-Reset': new Date(now + windowMs).toISOString()
      })
    }
    
    // Consume one token
    bucket.tokens -= 1
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', maxRequests.toString())
    c.header('X-RateLimit-Remaining', Math.floor(bucket.tokens).toString())
    c.header('X-RateLimit-Reset', new Date(bucket.lastRefill + windowMs).toISOString())
    
    await next()
    
    // If request failed and skipSuccessfulRequests is true, refund the token
    if (skipSuccessfulRequests && c.res.status >= 400) {
      bucket.tokens = Math.min(maxRequests, bucket.tokens + 1)
    }
  }
}

/**
 * Get client identifier from request
 */
function getClientId(c: Context): string {
  // Try to get real IP from Cloudflare headers
  const cfConnectingIp = c.req.header('CF-Connecting-IP')
  if (cfConnectingIp) return cfConnectingIp
  
  // Fallback to X-Forwarded-For
  const xForwardedFor = c.req.header('X-Forwarded-For')
  if (xForwardedFor) {
    return xForwardedFor.split(',')[0].trim()
  }
  
  // Fallback to X-Real-IP
  const xRealIp = c.req.header('X-Real-IP')
  if (xRealIp) return xRealIp
  
  // Last resort: use a default identifier
  return 'unknown'
}

/**
 * Cleanup old buckets periodically
 */
export function cleanupRateLimiters(olderThan: number = 3600000) {
  const now = Date.now()
  for (const [key, bucket] of buckets.entries()) {
    if (now - bucket.lastRefill > olderThan) {
      buckets.delete(key)
    }
  }
}

/**
 * Predefined rate limiters
 */
// Detect if we're in local development mode
const isDevelopment = typeof process !== 'undefined' && process.env?.NODE_ENV === 'development'

export const rateLimiters = {
  // Strict rate limiting for authentication endpoints (relaxed in dev)
  auth: rateLimiter({
    windowMs: isDevelopment ? 60 * 1000 : 15 * 60 * 1000, // 1min dev, 15min prod
    maxRequests: isDevelopment ? 100 : 5,                   // 100 dev, 5 prod
    message: '인증 시도가 너무 많습니다. 15분 후에 다시 시도해주세요.'
  }),
  
  // Moderate rate limiting for general API endpoints
  api: rateLimiter({
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: isDevelopment ? 1000 : 100,  // 1000 dev, 100 prod
    message: 'API 요청이 너무 많습니다. 잠시 후에 다시 시도해주세요.'
  }),
  
  // Strict rate limiting for data modification endpoints
  mutation: rateLimiter({
    windowMs: 60 * 1000,       // 1 minute
    maxRequests: isDevelopment ? 200 : 20,    // 200 dev, 20 prod
    message: '데이터 수정 요청이 너무 많습니다. 잠시 후에 다시 시도해주세요.'
  }),
  
  // Very strict rate limiting for registration/signup (relaxed in dev)
  signup: rateLimiter({
    windowMs: isDevelopment ? 60 * 1000 : 60 * 60 * 1000,  // 1min dev, 1hr prod
    maxRequests: isDevelopment ? 100 : 3,                   // 100 dev, 3 prod
    message: '회원가입 시도가 너무 많습니다. 1시간 후에 다시 시도해주세요.'
  })
}

// Note: Cleanup is not automatic in Cloudflare Workers (no setInterval in global scope)
// You can call cleanupRateLimiters() manually in a Cron trigger or scheduled job
// For now, cleanup happens naturally as buckets refill and old data is overwritten
