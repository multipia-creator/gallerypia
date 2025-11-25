/**
 * Enhanced Authentication Rate Limiter
 * 
 * Protects authentication endpoints from:
 * - Brute force attacks
 * - Credential stuffing
 * - Account enumeration
 * - DDoS attacks
 */

import type { Context, Next } from 'hono'

interface RateLimitConfig {
  windowMs: number      // Time window in milliseconds
  maxAttempts: number   // Maximum attempts per window
  blockDurationMs: number // Block duration after max attempts
  message: string       // Error message
}

interface RateLimitEntry {
  attempts: number
  firstAttempt: number
  blockedUntil?: number
}

// In-memory store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>()

// Cleanup interval (every 10 minutes)
setInterval(() => {
  const now = Date.now()
  for (const [key, entry] of rateLimitStore.entries()) {
    // Remove expired entries
    if (entry.blockedUntil && entry.blockedUntil < now) {
      rateLimitStore.delete(key)
    } else if (now - entry.firstAttempt > 3600000) { // 1 hour
      rateLimitStore.delete(key)
    }
  }
}, 600000) // 10 minutes

/**
 * Get client identifier (IP + User-Agent fingerprint)
 */
function getClientId(c: Context): string {
  const ip = c.req.header('CF-Connecting-IP') 
    || c.req.header('X-Forwarded-For')?.split(',')[0].trim()
    || c.req.header('X-Real-IP')
    || 'unknown'
  
  const userAgent = c.req.header('User-Agent') || 'unknown'
  const fingerprint = `${ip}:${userAgent.substring(0, 50)}`
  
  return fingerprint
}

/**
 * Create rate limiter middleware
 */
export function createAuthRateLimiter(config: RateLimitConfig) {
  return async (c: Context, next: Next) => {
    const clientId = getClientId(c)
    const now = Date.now()
    
    let entry = rateLimitStore.get(clientId)
    
    // Check if client is blocked
    if (entry?.blockedUntil && entry.blockedUntil > now) {
      const remainingSeconds = Math.ceil((entry.blockedUntil - now) / 1000)
      
      return c.json({
        error: config.message,
        blocked_until: new Date(entry.blockedUntil).toISOString(),
        retry_after: remainingSeconds
      }, 429)
    }
    
    // Initialize or update entry
    if (!entry || (now - entry.firstAttempt) > config.windowMs) {
      entry = {
        attempts: 1,
        firstAttempt: now
      }
    } else {
      entry.attempts++
    }
    
    // Check if max attempts exceeded
    if (entry.attempts > config.maxAttempts) {
      entry.blockedUntil = now + config.blockDurationMs
      rateLimitStore.set(clientId, entry)
      
      const remainingSeconds = Math.ceil(config.blockDurationMs / 1000)
      
      return c.json({
        error: config.message,
        blocked_until: new Date(entry.blockedUntil).toISOString(),
        retry_after: remainingSeconds
      }, 429)
    }
    
    rateLimitStore.set(clientId, entry)
    
    // Set rate limit headers
    c.header('X-RateLimit-Limit', config.maxAttempts.toString())
    c.header('X-RateLimit-Remaining', (config.maxAttempts - entry.attempts).toString())
    c.header('X-RateLimit-Reset', new Date(entry.firstAttempt + config.windowMs).toISOString())
    
    await next()
  }
}

/**
 * Login rate limiter (5 attempts per 15 minutes)
 */
export const loginRateLimiter = createAuthRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxAttempts: 5,
  blockDurationMs: 15 * 60 * 1000, // 15 minutes
  message: '로그인 시도 횟수가 초과되었습니다. 15분 후에 다시 시도해주세요.'
})

/**
 * Signup rate limiter (3 attempts per 1 hour)
 */
export const signupRateLimiter = createAuthRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3,
  blockDurationMs: 60 * 60 * 1000, // 1 hour
  message: '회원가입 시도 횟수가 초과되었습니다. 1시간 후에 다시 시도해주세요.'
})

/**
 * Password reset rate limiter (3 attempts per 1 hour)
 */
export const passwordResetRateLimiter = createAuthRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 3,
  blockDurationMs: 60 * 60 * 1000, // 1 hour
  message: '비밀번호 재설정 시도 횟수가 초과되었습니다. 1시간 후에 다시 시도해주세요.'
})

/**
 * Email verification rate limiter (5 attempts per 1 hour)
 */
export const emailVerificationRateLimiter = createAuthRateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxAttempts: 5,
  blockDurationMs: 30 * 60 * 1000, // 30 minutes
  message: '이메일 인증 시도 횟수가 초과되었습니다. 30분 후에 다시 시도해주세요.'
})

/**
 * Record failed login attempt (for account lockout)
 */
export async function recordFailedLogin(email: string, db: any): Promise<void> {
  try {
    const result = await db.prepare(`
      SELECT failed_login_attempts, locked_until 
      FROM users 
      WHERE email = ?
    `).bind(email.toLowerCase()).first()
    
    if (!result) return
    
    const attempts = (result.failed_login_attempts || 0) + 1
    const now = Date.now()
    
    // Lock account after 5 failed attempts
    if (attempts >= 5) {
      const lockedUntil = now + (15 * 60 * 1000) // 15 minutes
      
      await db.prepare(`
        UPDATE users 
        SET failed_login_attempts = ?, 
            locked_until = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).bind(attempts, lockedUntil, email.toLowerCase()).run()
    } else {
      await db.prepare(`
        UPDATE users 
        SET failed_login_attempts = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE email = ?
      `).bind(attempts, email.toLowerCase()).run()
    }
  } catch (error) {
    console.error('Failed to record failed login:', error)
  }
}

/**
 * Reset failed login attempts
 */
export async function resetFailedLoginAttempts(email: string, db: any): Promise<void> {
  try {
    await db.prepare(`
      UPDATE users 
      SET failed_login_attempts = 0, 
          locked_until = NULL,
          updated_at = CURRENT_TIMESTAMP
      WHERE email = ?
    `).bind(email.toLowerCase()).run()
  } catch (error) {
    console.error('Failed to reset failed login attempts:', error)
  }
}

/**
 * Check if account is locked
 */
export async function isAccountLocked(email: string, db: any): Promise<boolean> {
  try {
    const result = await db.prepare(`
      SELECT locked_until 
      FROM users 
      WHERE email = ?
    `).bind(email.toLowerCase()).first()
    
    if (!result || !result.locked_until) return false
    
    const now = Date.now()
    
    // If lock expired, reset attempts
    if (result.locked_until < now) {
      await resetFailedLoginAttempts(email, db)
      return false
    }
    
    return true
  } catch (error) {
    console.error('Failed to check account lock:', error)
    return false
  }
}
