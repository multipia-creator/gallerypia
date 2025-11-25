/**
 * Validation Middleware Helper
 * Wraps Hono's zod-validator with custom error handling
 */

import { zValidator } from '@hono/zod-validator'
import type { ZodSchema } from 'zod'
import type { Context } from 'hono'

/**
 * Validate request body with Zod schema
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return zValidator('json', schema, (result, c: Context) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: 'Validation failed',
        details: result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400)
    }
  })
}

/**
 * Validate query parameters with Zod schema
 */
export function validateQuery<T>(schema: ZodSchema<T>) {
  return zValidator('query', schema, (result, c: Context) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: 'Invalid query parameters',
        details: result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400)
    }
  })
}

/**
 * Validate route parameters with Zod schema
 */
export function validateParam<T>(schema: ZodSchema<T>) {
  return zValidator('param', schema, (result, c: Context) => {
    if (!result.success) {
      return c.json({
        success: false,
        error: 'Invalid route parameter',
        details: result.error.errors.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      }, 400)
    }
  })
}
