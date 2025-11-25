/**
 * Vitest Setup File
 * Global test configuration and utilities
 */

import { beforeAll, afterAll, afterEach } from 'vitest'

// Global test setup
beforeAll(() => {
  console.log('🧪 Starting test suite...')
})

// Global test teardown
afterAll(() => {
  console.log('✅ Test suite completed')
})

// Reset after each test
afterEach(() => {
  // Clean up any test state if needed
})

// Mock environment variables for testing
process.env.NODE_ENV = 'test'
