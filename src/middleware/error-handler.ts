/**
 * GalleryPia v9.0 - Centralized Error Handler
 * 
 * Purpose: Consistent error handling and logging across all APIs
 * Features: Request tracking, structured logging, error codes
 */

import type { Context } from 'hono'
import type { StatusCode } from 'hono/utils/http-status'

// =============================================================================
// Error Classes
// =============================================================================

export class AppError extends Error {
  constructor(
    public statusCode: StatusCode,
    public code: string,
    message: string,
    public details?: any,
    public isOperational: boolean = true
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: any) {
    super(400, 'VALIDATION_ERROR', message, details)
  }
}

export class AuthenticationError extends AppError {
  constructor(message: string = 'Authentication required') {
    super(401, 'AUTHENTICATION_ERROR', message)
  }
}

export class AuthorizationError extends AppError {
  constructor(message: string = 'Insufficient permissions') {
    super(403, 'AUTHORIZATION_ERROR', message)
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(404, 'NOT_FOUND', `${resource} not found`)
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(409, 'CONFLICT', message)
  }
}

export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(429, 'RATE_LIMIT_EXCEEDED', message)
  }
}

export class DatabaseError extends AppError {
  constructor(message: string, details?: any) {
    super(500, 'DATABASE_ERROR', message, details, false)
  }
}

// =============================================================================
// Error Response Structure
// =============================================================================

interface ErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: any
    requestId: string
    timestamp: string
    path?: string
    method?: string
  }
}

// =============================================================================
// Logger
// =============================================================================

class Logger {
  private logLevel: string = process.env.LOG_LEVEL || 'info'

  error(data: any) {
    if (this.shouldLog('error')) {
      console.error(JSON.stringify({
        level: 'error',
        timestamp: new Date().toISOString(),
        ...data
      }))
    }
  }

  warn(data: any) {
    if (this.shouldLog('warn')) {
      console.warn(JSON.stringify({
        level: 'warn',
        timestamp: new Date().toISOString(),
        ...data
      }))
    }
  }

  info(data: any) {
    if (this.shouldLog('info')) {
      console.log(JSON.stringify({
        level: 'info',
        timestamp: new Date().toISOString(),
        ...data
      }))
    }
  }

  debug(data: any) {
    if (this.shouldLog('debug')) {
      console.log(JSON.stringify({
        level: 'debug',
        timestamp: new Date().toISOString(),
        ...data
      }))
    }
  }

  private shouldLog(level: string): boolean {
    const levels = ['error', 'warn', 'info', 'debug']
    const currentLevelIndex = levels.indexOf(this.logLevel)
    const requestedLevelIndex = levels.indexOf(level)
    return requestedLevelIndex <= currentLevelIndex
  }
}

export const logger = new Logger()

// =============================================================================
// Error Handler Middleware
// =============================================================================

export const errorHandler = async (err: Error, c: Context) => {
  // Generate request ID for tracking
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID()
  const timestamp = new Date().toISOString()
  const path = c.req.path
  const method = c.req.method

  // Log error details
  logger.error({
    requestId,
    path,
    method,
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack,
      ...(err instanceof AppError && {
        code: err.code,
        statusCode: err.statusCode,
        details: err.details,
        isOperational: err.isOperational
      })
    },
    user: c.get('user')?.sub || 'anonymous'
  })

  // Handle known application errors
  if (err instanceof AppError) {
    const response: ErrorResponse = {
      success: false,
      error: {
        code: err.code,
        message: err.message,
        requestId,
        timestamp,
        path,
        method
      }
    }

    // Include details only in development
    if (process.env.NODE_ENV === 'development' && err.details) {
      response.error.details = err.details
    }

    return c.json(response, err.statusCode)
  }

  // Handle Zod validation errors
  if (err.name === 'ZodError') {
    try {
      const zodError = JSON.parse(err.message)
      const response: ErrorResponse = {
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Request validation failed',
          details: zodError.errors,
          requestId,
          timestamp,
          path,
          method
        }
      }
      return c.json(response, 400)
    } catch {
      // Fall through to generic error
    }
  }

  // Handle unexpected errors
  logger.error({
    requestId,
    message: 'Unhandled error',
    error: {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  })

  const response: ErrorResponse = {
    success: false,
    error: {
      code: 'INTERNAL_SERVER_ERROR',
      message: process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message,
      requestId,
      timestamp,
      path,
      method
    }
  }

  // Include stack trace only in development
  if (process.env.NODE_ENV === 'development') {
    response.error.details = {
      stack: err.stack
    }
  }

  return c.json(response, 500)
}

// =============================================================================
// Request Logger Middleware
// =============================================================================

export const requestLogger = async (c: Context, next: Function) => {
  const start = Date.now()
  const requestId = c.req.header('X-Request-ID') || crypto.randomUUID()
  
  // Add request ID to context
  c.header('X-Request-ID', requestId)

  logger.info({
    requestId,
    type: 'request',
    method: c.req.method,
    path: c.req.path,
    query: c.req.query(),
    userAgent: c.req.header('User-Agent'),
    ip: c.req.header('CF-Connecting-IP') || c.req.header('X-Forwarded-For')
  })

  await next()

  const duration = Date.now() - start

  logger.info({
    requestId,
    type: 'response',
    method: c.req.method,
    path: c.req.path,
    status: c.res.status,
    duration: `${duration}ms`
  })
}

// =============================================================================
// Not Found Handler
// =============================================================================

export const notFoundHandler = (c: Context) => {
  return c.json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${c.req.method} ${c.req.path} not found`,
      requestId: c.req.header('X-Request-ID') || crypto.randomUUID(),
      timestamp: new Date().toISOString()
    }
  }, 404)
}
