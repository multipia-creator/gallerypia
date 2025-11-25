/**
 * Security Headers Middleware
 * Implements OWASP security best practices
 */

import type { Context, Next } from 'hono'

/**
 * Add comprehensive security headers to all responses
 */
export async function securityHeaders(c: Context, next: Next) {
  await next()
  
  // Strict Transport Security (HSTS)
  // Force HTTPS for 1 year, include subdomains, allow preloading
  c.header('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload')
  
  // Content Security Policy (CSP)
  // Prevent XSS by controlling resource loading
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com https://cdn.jsdelivr.net https://browser.sentry-cdn.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net",
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net",
    "img-src 'self' data: https: http:",
    "connect-src 'self' https://api.opensea.io https://api.etherscan.io https://*.sentry.io",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests"
  ].join('; ')
  c.header('Content-Security-Policy', csp)
  
  // X-Frame-Options
  // Prevent clickjacking attacks
  c.header('X-Frame-Options', 'DENY')
  
  // X-Content-Type-Options
  // Prevent MIME type sniffing
  c.header('X-Content-Type-Options', 'nosniff')
  
  // X-XSS-Protection
  // Enable browser XSS filter (legacy browsers)
  c.header('X-XSS-Protection', '1; mode=block')
  
  // Referrer-Policy
  // Control referrer information
  c.header('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // Permissions-Policy
  // Control browser features
  const permissionsPolicy = [
    'geolocation=()',
    'microphone=()',
    'camera=()',
    'payment=()',
    'usb=()',
    'magnetometer=()',
    'gyroscope=()',
    'accelerometer=()'
  ].join(', ')
  c.header('Permissions-Policy', permissionsPolicy)
  
  // X-DNS-Prefetch-Control
  // Control DNS prefetching
  c.header('X-DNS-Prefetch-Control', 'off')
  
  // X-Download-Options
  // Prevent IE from executing downloads
  c.header('X-Download-Options', 'noopen')
  
  // X-Permitted-Cross-Domain-Policies
  // Restrict Adobe Flash and PDF cross-domain requests
  c.header('X-Permitted-Cross-Domain-Policies', 'none')
}

/**
 * Enhanced CORS configuration
 */
export function corsConfig() {
  return {
    origin: (origin: string) => {
      // Allow same-origin requests
      if (!origin) return true
      
      // Allow Cloudflare Pages domains
      if (origin.endsWith('.pages.dev')) return true
      if (origin === 'https://gallerypia.pages.dev') return true
      if (origin === 'https://gallerypia.com') return true
      
      // Allow localhost for development
      if (origin.startsWith('http://localhost:')) return true
      if (origin.startsWith('http://127.0.0.1:')) return true
      
      // Deny all other origins
      return false
    },
    allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
    exposeHeaders: ['X-RateLimit-Limit', 'X-RateLimit-Remaining', 'X-RateLimit-Reset'],
    maxAge: 86400, // 24 hours
    credentials: true
  }
}

/**
 * CORS preflight handler
 */
export async function handleCorsPreflight(c: Context) {
  const origin = c.req.header('Origin')
  
  // Check if origin is allowed
  const config = corsConfig()
  const isAllowed = typeof config.origin === 'function' 
    ? config.origin(origin || '')
    : config.origin === '*' || config.origin === origin
  
  if (!isAllowed) {
    return c.json({ success: false, error: 'Origin not allowed' }, 403)
  }
  
  return c.text('', 204, {
    'Access-Control-Allow-Origin': origin || '*',
    'Access-Control-Allow-Methods': config.allowMethods.join(', '),
    'Access-Control-Allow-Headers': config.allowHeaders.join(', '),
    'Access-Control-Max-Age': config.maxAge.toString(),
    'Access-Control-Allow-Credentials': config.credentials ? 'true' : 'false'
  })
}
