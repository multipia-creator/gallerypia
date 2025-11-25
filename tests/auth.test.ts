/**
 * Authentication System Unit Tests
 * 
 * Tests all critical authentication functions
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { 
  hashPassword, 
  verifyPassword,
  generateAccessToken,
  verifyAccessToken,
  generateSessionToken,
  isValidSessionToken
} from '../src/utils/auth'
import { 
  signupSchema, 
  loginSchema, 
  emailSchema, 
  passwordSchema 
} from '../src/schemas/validation'

describe('Password Hashing', () => {
  it('should hash password successfully', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    
    expect(hash).toBeDefined()
    expect(hash).not.toBe(password)
    expect(hash.length).toBeGreaterThan(50)
  })
  
  it('should verify correct password', async () => {
    const password = 'TestPassword123!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(password, hash)
    
    expect(isValid).toBe(true)
  })
  
  it('should reject incorrect password', async () => {
    const password = 'TestPassword123!'
    const wrongPassword = 'WrongPassword456!'
    const hash = await hashPassword(password)
    const isValid = await verifyPassword(wrongPassword, hash)
    
    expect(isValid).toBe(false)
  })
  
  it('should handle empty password gracefully', async () => {
    const hash = await hashPassword('')
    const isValid = await verifyPassword('', hash)
    
    expect(isValid).toBe(true)
  })
})

describe('JWT Token Management', () => {
  const mockUser = {
    sub: '123',
    email: 'test@example.com',
    role: 'buyer',
    name: 'Test User'
  }
  
  beforeEach(() => {
    process.env.JWT_SECRET = 'test-secret-key-for-testing-purposes'
  })
  
  it('should generate access token', async () => {
    const token = await generateAccessToken(mockUser)
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.split('.').length).toBe(3) // JWT format
  })
  
  it('should verify valid access token', async () => {
    const token = await generateAccessToken(mockUser)
    const payload = await verifyAccessToken(token)
    
    expect(payload.sub).toBe(mockUser.sub)
    expect(payload.email).toBe(mockUser.email)
    expect(payload.role).toBe(mockUser.role)
    expect(payload.type).toBe('access')
  })
  
  it('should reject invalid token', async () => {
    await expect(verifyAccessToken('invalid.token.here')).rejects.toThrow()
  })
  
  it('should include jti (token ID)', async () => {
    const token = await generateAccessToken(mockUser)
    const payload = await verifyAccessToken(token)
    
    expect(payload.jti).toBeDefined()
    expect(typeof payload.jti).toBe('string')
  })
})

describe('Email Validation Schema', () => {
  it('should accept valid emails', () => {
    const validEmails = [
      'test@example.com',
      'user.name@domain.co.kr',
      'firstname+lastname@company.com',
      'test123@test-domain.com'
    ]
    
    validEmails.forEach(email => {
      expect(() => emailSchema.parse(email)).not.toThrow()
    })
  })
  
  it('should reject invalid emails', () => {
    const invalidEmails = [
      'notanemail',
      '@example.com',
      'test@',
      'test..double@example.com',
      'test@example',
      'test @example.com' // space
    ]
    
    invalidEmails.forEach(email => {
      expect(() => emailSchema.parse(email)).toThrow()
    })
  })
  
  it('should normalize email to lowercase', () => {
    const result = emailSchema.parse('TEST@EXAMPLE.COM')
    expect(result).toBe('test@example.com')
  })
  
  it('should trim whitespace', () => {
    const result = emailSchema.parse('  test@example.com  ')
    expect(result).toBe('test@example.com')
  })
})

describe('Password Validation Schema', () => {
  it('should accept strong passwords', () => {
    const strongPasswords = [
      'TestPass123!',
      'MyStr0ng@Password',
      'Complex#Pass1',
      'Secure$2024Pass'
    ]
    
    strongPasswords.forEach(password => {
      expect(() => passwordSchema.parse(password)).not.toThrow()
    })
  })
  
  it('should reject weak passwords', () => {
    const weakPasswords = [
      'short', // too short
      'nouppercase123!', // no uppercase
      'NOLOWERCASE123!', // no lowercase
      'NoNumbers!', // no numbers
      'NoSpecial123', // no special char
      'Password123!', // common password
      '12345678Aa!', // too simple
      'AAA123aaa!' // repeating characters
    ]
    
    weakPasswords.forEach(password => {
      expect(() => passwordSchema.parse(password)).toThrow()
    })
  })
  
  it('should enforce minimum length', () => {
    expect(() => passwordSchema.parse('Test1!')).toThrow()
    expect(() => passwordSchema.parse('Test123!')).not.toThrow()
  })
  
  it('should enforce special character', () => {
    expect(() => passwordSchema.parse('TestPass123')).toThrow()
    expect(() => passwordSchema.parse('TestPass123!')).not.toThrow()
  })
})

describe('Signup Schema Validation', () => {
  const validSignupData = {
    email: 'test@example.com',
    password: 'TestPass123!',
    full_name: 'Test User',
    role: 'buyer' as const,
    phone: '010-1234-5678'
  }
  
  it('should accept valid signup data', () => {
    expect(() => signupSchema.parse(validSignupData)).not.toThrow()
  })
  
  it('should require email', () => {
    const invalid = { ...validSignupData, email: '' }
    expect(() => signupSchema.parse(invalid)).toThrow()
  })
  
  it('should require password', () => {
    const invalid = { ...validSignupData, password: '' }
    expect(() => signupSchema.parse(invalid)).toThrow()
  })
  
  it('should require full_name', () => {
    const invalid = { ...validSignupData, full_name: '' }
    expect(() => signupSchema.parse(invalid)).toThrow()
  })
  
  it('should accept valid roles', () => {
    const roles = ['buyer', 'seller', 'artist', 'expert', 'collector', 'curator']
    
    roles.forEach(role => {
      const data = { ...validSignupData, role }
      expect(() => signupSchema.parse(data)).not.toThrow()
    })
  })
  
  it('should accept museum/gallery roles with organization', () => {
    const museumData = {
      ...validSignupData,
      role: 'museum' as const,
      organization_name: 'Test Museum',
      organization_type: 'public' as const
    }
    expect(() => signupSchema.parse(museumData)).not.toThrow()
    
    const galleryData = {
      ...validSignupData,
      role: 'gallery' as const,
      organization_name: 'Test Gallery',
      organization_type: 'private' as const
    }
    expect(() => signupSchema.parse(galleryData)).not.toThrow()
  })
  
  it('should reject invalid role', () => {
    const invalid = { ...validSignupData, role: 'invalid_role' }
    expect(() => signupSchema.parse(invalid)).toThrow()
  })
  
  it('should normalize phone number', () => {
    const data = { ...validSignupData, phone: '010-1234-5678' }
    const result = signupSchema.parse(data)
    expect(result.phone).toBe('01012345678')
  })
  
  it('should require organization fields for museum/gallery', () => {
    const museumData = {
      ...validSignupData,
      role: 'museum' as const
    }
    
    // Without organization fields - should fail
    expect(() => signupSchema.parse(museumData)).toThrow()
    
    // With organization fields - should pass
    const completeData = {
      ...museumData,
      organization_name: 'Test Museum',
      organization_type: 'public' as const
    }
    expect(() => signupSchema.parse(completeData)).not.toThrow()
  })
})

describe('Login Schema Validation', () => {
  it('should accept valid login data', () => {
    const data = {
      email: 'test@example.com',
      password: 'anypassword'
    }
    expect(() => loginSchema.parse(data)).not.toThrow()
  })
  
  it('should require email', () => {
    const invalid = { password: 'test' }
    expect(() => loginSchema.parse(invalid)).toThrow()
  })
  
  it('should require password', () => {
    const invalid = { email: 'test@example.com' }
    expect(() => loginSchema.parse(invalid)).toThrow()
  })
  
  it('should accept any password length for login', () => {
    // Login doesn't enforce password strength (only signup does)
    const data = {
      email: 'test@example.com',
      password: '123'
    }
    expect(() => loginSchema.parse(data)).not.toThrow()
  })
})

describe('Session Token Management', () => {
  it('should generate valid session token', () => {
    const token = generateSessionToken()
    
    expect(token).toBeDefined()
    expect(typeof token).toBe('string')
    expect(token.length).toBeGreaterThan(30)
  })
  
  it('should generate unique tokens', () => {
    const token1 = generateSessionToken()
    const token2 = generateSessionToken()
    
    expect(token1).not.toBe(token2)
  })
  
  it('should validate correct token format', () => {
    const token = generateSessionToken()
    expect(isValidSessionToken(token)).toBe(true)
  })
  
  it('should reject invalid token format', () => {
    const invalidTokens = [
      'invalid-token',
      '12345678',
      '',
      'a'.repeat(100)
    ]
    
    invalidTokens.forEach(token => {
      expect(isValidSessionToken(token)).toBe(false)
    })
  })
})

describe('Edge Cases', () => {
  it('should handle SQL injection attempts in email', () => {
    const maliciousEmails = [
      "'; DROP TABLE users; --",
      "admin'--",
      "1' OR '1'='1"
    ]
    
    maliciousEmails.forEach(email => {
      expect(() => emailSchema.parse(email)).toThrow()
    })
  })
  
  it('should handle XSS attempts in input', () => {
    const xssAttempts = [
      "<script>alert('XSS')</script>",
      "<img src=x onerror=alert('XSS')>",
      "javascript:alert('XSS')"
    ]
    
    // These should be rejected by validation or escaped
    xssAttempts.forEach(attempt => {
      // Email validation should reject these
      expect(() => emailSchema.parse(attempt)).toThrow()
    })
  })
  
  it('should handle extremely long inputs', () => {
    const longEmail = 'a'.repeat(300) + '@example.com'
    const longPassword = 'A1!'.repeat(50)
    
    expect(() => emailSchema.parse(longEmail)).toThrow()
    expect(() => passwordSchema.parse(longPassword)).toThrow()
  })
  
  it('should handle unicode characters', () => {
    const unicodeEmail = 'test한글@example.com'
    const unicodePassword = 'Test한글123!'
    
    // Email with non-ASCII should be rejected
    expect(() => emailSchema.parse(unicodeEmail)).toThrow()
    
    // Password can contain unicode
    // (Implementation dependent - add test based on your requirements)
  })
})
