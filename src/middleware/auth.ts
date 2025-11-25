/**
 * Authentication Middleware
 * Security improvements for GalleryPia v11.1
 */

import { Context, Next } from 'hono'
import { getCookie, setCookie } from 'hono/cookie'

// JWT secret (should be in environment variables)
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

// Simple JWT implementation (in production, use proper library)
export function generateToken(payload: any): string {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
  const body = btoa(JSON.stringify(payload))
  const signature = btoa(`${header}.${body}.${JWT_SECRET}`) // Simplified
  return `${header}.${body}.${signature}`
}

export function verifyToken(token: string): any | null {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return null
    
    const payload = JSON.parse(atob(parts[1]))
    
    // Check expiration
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null
    }
    
    return payload
  } catch {
    return null
  }
}

// Middleware to require authentication
export async function requireAuth(c: Context, next: Next) {
  // Try to get token from cookie (secure) or header (fallback)
  let token = getCookie(c, 'auth_token')
  
  if (!token) {
    const authHeader = c.req.header('Authorization')
    token = authHeader?.replace('Bearer ', '')
  }
  
  if (!token) {
    return c.json({ error: 'Unauthorized', message: '로그인이 필요합니다' }, 401)
  }
  
  const payload = verifyToken(token)
  
  if (!payload) {
    return c.json({ error: 'Unauthorized', message: '유효하지 않은 토큰입니다' }, 401)
  }
  
  // Attach user info to context
  c.set('userId', payload.userId)
  c.set('userRole', payload.role)
  
  await next()
}

// Middleware to require specific role
export function requireRole(allowedRoles: string[]) {
  return async (c: Context, next: Next) => {
    await requireAuth(c, async () => {
      const userRole = c.get('userRole')
      
      if (!userRole || !allowedRoles.includes(userRole)) {
        return c.json({ 
          error: 'Forbidden', 
          message: '이 작업을 수행할 권한이 없습니다' 
        }, 403)
      }
      
      await next()
    })
  }
}

// Set httpOnly cookie
export function setAuthCookie(c: Context, token: string, options: { maxAge?: number } = {}) {
  setCookie(c, 'auth_token', token, {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: options.maxAge || 7 * 24 * 60 * 60, // 7 days default
  })
}

// Clear auth cookie
export function clearAuthCookie(c: Context) {
  setCookie(c, 'auth_token', '', {
    httpOnly: true,
    secure: true,
    sameSite: 'Strict',
    path: '/',
    maxAge: 0,
  })
}

// Password validation
export interface PasswordValidation {
  valid: boolean
  errors: string[]
  strength: 'weak' | 'medium' | 'strong'
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = []
  
  if (password.length < 8) {
    errors.push('8자 이상이어야 합니다')
  }
  
  if (!/[A-Z]/.test(password)) {
    errors.push('대문자를 1개 이상 포함해야 합니다')
  }
  
  if (!/[a-z]/.test(password)) {
    errors.push('소문자를 1개 이상 포함해야 합니다')
  }
  
  if (!/[0-9]/.test(password)) {
    errors.push('숫자를 1개 이상 포함해야 합니다')
  }
  
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('특수문자를 1개 이상 포함해야 합니다')
  }
  
  // Calculate strength
  let strength: 'weak' | 'medium' | 'strong' = 'weak'
  if (errors.length === 0 && password.length >= 12) {
    strength = 'strong'
  } else if (errors.length <= 1) {
    strength = 'medium'
  }
  
  return {
    valid: errors.length === 0,
    errors,
    strength
  }
}

// Email validation
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Rate limiting tracker (in-memory, for production use Redis)
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkLoginAttempts(identifier: string): { allowed: boolean; remainingAttempts: number } {
  const now = Date.now()
  const attempts = loginAttempts.get(identifier)
  
  // Clear old attempts (15 minutes)
  if (attempts && now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.delete(identifier)
    return { allowed: true, remainingAttempts: 5 }
  }
  
  if (attempts && attempts.count >= 5) {
    return { allowed: false, remainingAttempts: 0 }
  }
  
  return { allowed: true, remainingAttempts: 5 - (attempts?.count || 0) }
}

export function recordLoginAttempt(identifier: string, success: boolean) {
  if (success) {
    loginAttempts.delete(identifier)
    return
  }
  
  const attempts = loginAttempts.get(identifier)
  if (attempts) {
    attempts.count++
    attempts.lastAttempt = Date.now()
  } else {
    loginAttempts.set(identifier, { count: 1, lastAttempt: Date.now() })
  }
}

// Hash password (simple implementation, use bcrypt in production)
export async function hashPassword(password: string): Promise<string> {
  // In production, use: const bcrypt = require('bcrypt'); return await bcrypt.hash(password, 10);
  // For now, use simple base64 encoding (NOT SECURE, just for demonstration)
  return btoa(password + JWT_SECRET)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  // In production, use: return await bcrypt.compare(password, hash);
  return btoa(password + JWT_SECRET) === hash
}
