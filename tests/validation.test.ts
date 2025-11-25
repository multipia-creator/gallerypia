/**
 * Validation Schema Tests
 * Test Zod schemas for proper validation
 */

import { describe, it, expect } from 'vitest'
import {
  emailSchema,
  passwordSchema,
  nameSchema,
  idSchema,
  signupSchema,
  loginSchema,
  createArtworkSchema
} from '../src/schemas/validation'

describe('Email Validation', () => {
  it('should accept valid emails', () => {
    expect(() => emailSchema.parse('test@example.com')).not.toThrow()
    expect(() => emailSchema.parse('user+tag@domain.co.uk')).not.toThrow()
  })

  it('should reject invalid emails', () => {
    expect(() => emailSchema.parse('invalid')).toThrow()
    expect(() => emailSchema.parse('test@')).toThrow()
    expect(() => emailSchema.parse('@example.com')).toThrow()
    expect(() => emailSchema.parse('test @example.com')).toThrow()
  })

  it('should enforce length limits', () => {
    expect(() => emailSchema.parse('a@b.co')).not.toThrow() // Min 6 chars, valid TLD
    expect(() => emailSchema.parse('ab@c')).toThrow() // Too short
    expect(() => emailSchema.parse('a'.repeat(250) + '@test.com')).toThrow() // Too long
  })
})

describe('Password Validation', () => {
  it('should accept strong passwords', () => {
    expect(() => passwordSchema.parse('Test1234!')).not.toThrow()
    expect(() => passwordSchema.parse('MyP@ssw0rd')).not.toThrow()
    expect(() => passwordSchema.parse('Secure123Pass!')).not.toThrow()
  })

  it('should reject weak passwords', () => {
    expect(() => passwordSchema.parse('short')).toThrow() // Too short
    expect(() => passwordSchema.parse('lowercase123')).toThrow() // No uppercase
    expect(() => passwordSchema.parse('UPPERCASE123')).toThrow() // No lowercase
    expect(() => passwordSchema.parse('NoNumbers')).toThrow() // No digits
    expect(() => passwordSchema.parse('Test123'.repeat(20))).toThrow() // Too long
  })

  it('should require minimum 8 characters', () => {
    expect(() => passwordSchema.parse('Test12!')).toThrow()
    expect(() => passwordSchema.parse('Test1234!')).not.toThrow()
  })
})

describe('Name Validation', () => {
  it('should accept valid names', () => {
    expect(() => nameSchema.parse('John Doe')).not.toThrow()
    expect(() => nameSchema.parse('김철수')).not.toThrow()
    expect(() => nameSchema.parse('Mary-Jane')).not.toThrow()
  })

  it('should trim whitespace', () => {
    const result = nameSchema.parse('  John Doe  ')
    expect(result).toBe('John Doe')
  })

  it('should enforce length limits', () => {
    expect(() => nameSchema.parse('A')).toThrow() // Too short
    expect(() => nameSchema.parse('AB')).not.toThrow() // Min 2 chars
    expect(() => nameSchema.parse('A'.repeat(101))).toThrow() // Too long
  })
})

describe('ID Validation', () => {
  it('should accept positive integers', () => {
    expect(() => idSchema.parse(1)).not.toThrow()
    expect(() => idSchema.parse('42')).not.toThrow() // Coerced
    expect(() => idSchema.parse(999999)).not.toThrow()
  })

  it('should reject invalid IDs', () => {
    expect(() => idSchema.parse(0)).toThrow() // Not positive
    expect(() => idSchema.parse(-1)).toThrow() // Negative
    expect(() => idSchema.parse(1.5)).toThrow() // Not integer
    expect(() => idSchema.parse('abc')).toThrow() // Not a number
  })

  it('should coerce strings to numbers', () => {
    const result = idSchema.parse('123')
    expect(result).toBe(123)
    expect(typeof result).toBe('number')
  })
})

describe('Signup Schema', () => {
  const validSignup = {
    email: 'test@example.com',
    password: 'Test1234!',
    full_name: 'Test User',
    role: 'buyer' as const,
    phone: '010-1234-5678'
  }

  it('should accept valid signup data', () => {
    expect(() => signupSchema.parse(validSignup)).not.toThrow()
  })

  it('should use default role', () => {
    const data = { ...validSignup }
    delete (data as any).role
    const result = signupSchema.parse(data)
    expect(result.role).toBe('buyer')
  })

  it('should accept optional fields', () => {
    const dataWithOptionals = {
      ...validSignup,
      organization_name: 'Test Organization',
      organization_type: 'private' as const
    }
    expect(() => signupSchema.parse(dataWithOptionals)).not.toThrow()
  })

  it('should normalize phone number', () => {
    const data = {
      ...validSignup,
      phone: '010-1234-5678'
    }
    const result = signupSchema.parse(data)
    expect(result.phone).toBe('01012345678')
  })

  it('should only accept valid roles', () => {
    const invalidRole = { ...validSignup, role: 'invalid' }
    expect(() => signupSchema.parse(invalidRole)).toThrow()
  })
})

describe('Login Schema', () => {
  it('should accept valid login data', () => {
    const validLogin = {
      email: 'test@example.com',
      password: 'anypassword'
    }
    expect(() => loginSchema.parse(validLogin)).not.toThrow()
  })

  it('should require both email and password', () => {
    expect(() => loginSchema.parse({ email: 'test@example.com' })).toThrow()
    expect(() => loginSchema.parse({ password: 'test' })).toThrow()
  })
})

describe('Create Artwork Schema', () => {
  const validArtwork = {
    title: 'Test Artwork',
    description: 'A test artwork description',
    artist_id: 1,
    image_url: 'https://example.com/image.jpg',
    blockchain: 'ethereum' as const
  }

  it('should accept valid artwork data', () => {
    expect(() => createArtworkSchema.parse(validArtwork)).not.toThrow()
  })

  it('should use default blockchain', () => {
    const data = { ...validArtwork }
    delete (data as any).blockchain
    const result = createArtworkSchema.parse(data)
    expect(result.blockchain).toBe('ethereum')
  })

  it('should validate image URL', () => {
    const invalidUrl = { ...validArtwork, image_url: 'not-a-url' }
    expect(() => createArtworkSchema.parse(invalidUrl)).toThrow()
  })

  it('should validate NFT contract address', () => {
    const validContract = {
      ...validArtwork,
      nft_contract_address: '0x1234567890123456789012345678901234567890'
    }
    expect(() => createArtworkSchema.parse(validContract)).not.toThrow()

    const invalidContract = {
      ...validArtwork,
      nft_contract_address: 'invalid'
    }
    expect(() => createArtworkSchema.parse(invalidContract)).toThrow()
  })

  it('should reject negative price', () => {
    const negativePrice = { ...validArtwork, price: -100 }
    expect(() => createArtworkSchema.parse(negativePrice)).toThrow()
  })

  it('should accept valid blockchains', () => {
    const blockchains = ['ethereum', 'polygon', 'klaytn', 'flow']
    blockchains.forEach(blockchain => {
      const data = { ...validArtwork, blockchain }
      expect(() => createArtworkSchema.parse(data)).not.toThrow()
    })
  })
})
