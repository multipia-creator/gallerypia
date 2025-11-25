/**
 * GalleryPia v9.0 - Authentication Utilities
 * 
 * Purpose: Secure password hashing, JWT generation, token management
 * Security: bcrypt hashing, cryptographically secure tokens
 */

import bcrypt from 'bcryptjs'
import { sign, verify } from 'hono/jwt'
import type { JWTPayload } from 'hono/utils/jwt/types'

// =============================================================================
// Password Hashing
// =============================================================================

/**
 * Hash password using bcrypt with configurable rounds
 */
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12', 10)
  return await bcrypt.hash(password, saltRounds)
}

/**
 * Verify password against hash
 */
export async function verifyPassword(
  password: string,
  hash: string
): Promise<boolean> {
  try {
    return await bcrypt.compare(password, hash)
  } catch (error) {
    return false
  }
}

// =============================================================================
// JWT Token Management
// =============================================================================

interface UserPayload {
  sub: string        // User ID
  email: string
  role: string
  name: string
}

interface AccessTokenPayload extends UserPayload, JWTPayload {
  type: 'access'
  iat: number
  exp: number
  jti: string        // Unique token ID for revocation
}

interface RefreshTokenPayload extends JWTPayload {
  sub: string
  type: 'refresh'
  iat: number
  exp: number
  jti: string
}

/**
 * Generate access token (short-lived)
 */
export async function generateAccessToken(
  user: UserPayload
): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = parseExpiration(process.env.JWT_EXPIRATION || '7d')
  
  const payload: AccessTokenPayload = {
    ...user,
    type: 'access',
    iat: now,
    exp: now + expiresIn,
    jti: generateTokenId()
  }

  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  return await sign(payload, secret)
}

/**
 * Generate refresh token (long-lived)
 */
export async function generateRefreshToken(userId: string): Promise<string> {
  const now = Math.floor(Date.now() / 1000)
  const expiresIn = parseExpiration(process.env.JWT_REFRESH_EXPIRATION || '30d')
  
  const payload: RefreshTokenPayload = {
    sub: userId,
    type: 'refresh',
    iat: now,
    exp: now + expiresIn,
    jti: generateTokenId()
  }

  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured')
  }

  return await sign(payload, secret)
}

/**
 * Verify access token
 */
export async function verifyAccessToken(
  token: string
): Promise<AccessTokenPayload> {
  const secret = process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_SECRET not configured')
  }

  try {
    const payload = await verify(token, secret) as AccessTokenPayload
    
    if (payload.type !== 'access') {
      throw new Error('Invalid token type')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid or expired token')
  }
}

/**
 * Verify refresh token
 */
export async function verifyRefreshToken(
  token: string
): Promise<RefreshTokenPayload> {
  const secret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
  if (!secret) {
    throw new Error('JWT_REFRESH_SECRET not configured')
  }

  try {
    const payload = await verify(token, secret) as RefreshTokenPayload
    
    if (payload.type !== 'refresh') {
      throw new Error('Invalid token type')
    }

    return payload
  } catch (error) {
    throw new Error('Invalid or expired refresh token')
  }
}

/**
 * Generate cryptographically secure token ID
 */
function generateTokenId(): string {
  return crypto.randomUUID()
}

/**
 * Parse expiration string to seconds
 */
function parseExpiration(exp: string): number {
  const units: Record<string, number> = {
    s: 1,
    m: 60,
    h: 3600,
    d: 86400,
    w: 604800
  }

  const match = exp.match(/^(\d+)([smhdw])$/)
  if (!match) {
    throw new Error(`Invalid expiration format: ${exp}`)
  }

  const [, value, unit] = match
  return parseInt(value, 10) * units[unit]
}

// =============================================================================
// Token Revocation
// =============================================================================

/**
 * Check if token is revoked (implement against database)
 */
export async function isTokenRevoked(
  jti: string,
  db: any
): Promise<boolean> {
  try {
    const result = await db
      .prepare('SELECT 1 FROM revoked_tokens WHERE jti = ? AND expires_at > ?')
      .bind(jti, Date.now())
      .first()
    
    return !!result
  } catch (error) {
    // If table doesn't exist or error occurs, assume not revoked
    return false
  }
}

/**
 * Revoke token (add to blacklist)
 */
export async function revokeToken(
  jti: string,
  expiresAt: number,
  db: any
): Promise<void> {
  try {
    await db
      .prepare('INSERT OR IGNORE INTO revoked_tokens (jti, expires_at, revoked_at) VALUES (?, ?, ?)')
      .bind(jti, expiresAt * 1000, Date.now())
      .run()
  } catch (error) {
    console.error('Failed to revoke token:', error)
    throw new Error('Token revocation failed')
  }
}

/**
 * Clean up expired revoked tokens (run periodically)
 */
export async function cleanupRevokedTokens(db: any): Promise<void> {
  try {
    await db
      .prepare('DELETE FROM revoked_tokens WHERE expires_at < ?')
      .bind(Date.now())
      .run()
  } catch (error) {
    console.error('Failed to cleanup revoked tokens:', error)
  }
}

// =============================================================================
// Session Management
// =============================================================================

/**
 * Generate session token (legacy support)
 */
export function generateSessionToken(): string {
  // For backward compatibility with existing system
  return crypto.randomUUID() + '-' + Date.now().toString(36)
}

/**
 * Validate session token format
 */
export function isValidSessionToken(token: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}-[0-9a-z]+$/.test(token)
}
