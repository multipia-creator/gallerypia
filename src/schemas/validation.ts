/**
 * Validation Schemas using Zod
 * Centralized input validation for API endpoints
 */

import { z } from 'zod'

// ============================================
// Common Schemas
// ============================================

export const emailSchema = z.string()
  .trim() // Trim FIRST before validation
  .toLowerCase() // Then lowercase
  .email('유효한 이메일 주소를 입력해주세요')
  .min(5, '이메일은 최소 5자 이상이어야 합니다')
  .max(255, '이메일은 255자를 초과할 수 없습니다')
  .refine((val) => !val.includes('..'), '이메일에 연속된 점(.)을 사용할 수 없습니다')

export const passwordSchema = z.string()
  .min(8, '비밀번호는 최소 8자 이상이어야 합니다')
  .max(100, '비밀번호는 100자를 초과할 수 없습니다')
  .regex(/[A-Z]/, '비밀번호는 최소 1개의 대문자를 포함해야 합니다')
  .regex(/[a-z]/, '비밀번호는 최소 1개의 소문자를 포함해야 합니다')
  .regex(/[0-9]/, '비밀번호는 최소 1개의 숫자를 포함해야 합니다')
  .regex(/[!@#$%^&*(),.?":{}|<>]/, '비밀번호는 최소 1개의 특수문자를 포함해야 합니다')
  .refine((val) => !/(.)\1{2,}/.test(val), '동일한 문자를 3번 이상 연속 사용할 수 없습니다')
  .refine((val) => !/^(password|12345678|qwerty)/i.test(val), '일반적인 비밀번호는 사용할 수 없습니다')

export const nameSchema = z.string()
  .min(2, '이름은 최소 2자 이상이어야 합니다')
  .max(100, '이름은 100자를 초과할 수 없습니다')
  .trim()

export const idSchema = z.coerce.number()
  .int('ID는 정수여야 합니다')
  .positive('ID는 양수여야 합니다')

export const pageSchema = z.coerce.number()
  .int('페이지 번호는 정수여야 합니다')
  .positive('페이지 번호는 양수여야 합니다')
  .default(1)

export const limitSchema = z.coerce.number()
  .int('제한 수는 정수여야 합니다')
  .positive('제한 수는 양수여야 합니다')
  .max(100, '최대 100개까지만 조회 가능합니다')
  .default(20)

// ============================================
// Authentication Schemas
// ============================================

export const phoneSchema = z.string()
  .regex(/^01[016789]-?\d{3,4}-?\d{4}$/, '올바른 휴대폰 번호 형식이 아닙니다')
  .transform(val => val.replace(/-/g, ''))
  .optional()

export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  password_hash: z.string().optional(), // Backward compatibility
  username: nameSchema.optional(),
  full_name: nameSchema,
  name: nameSchema.optional(), // Backward compatibility
  role: z.enum(['buyer', 'seller', 'artist', 'expert', 'museum', 'gallery', 'collector', 'curator'])
    .default('buyer'),
  phone: phoneSchema,
  bio: z.string().max(1000, 'bio는 1000자를 초과할 수 없습니다').optional(),
  wallet_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, '유효한 Ethereum 주소가 아닙니다')
    .optional(),
  organization_name: z.string().min(2).max(200).optional(),
  organization_type: z.enum(['public', 'private', 'commercial', 'non_profit']).optional(),
  organization_address: z.string().max(500).optional(),
  organization_website: z.string().url().optional().or(z.literal('')),
  organization_contact_email: emailSchema.optional(),
  organization_phone: phoneSchema,
  organization_description: z.string().max(2000).optional()
}).refine((data) => {
  // Museum/Gallery requires organization fields
  if (data.role === 'museum' || data.role === 'gallery') {
    return data.organization_name && data.organization_type
  }
  return true
}, {
  message: '기관 계정은 기관명과 기관 유형이 필수입니다',
  path: ['organization_name']
})

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, '비밀번호를 입력해주세요')
})

export const forgotPasswordSchema = z.object({
  email: emailSchema
})

export const resetPasswordSchema = z.object({
  token: z.string().min(1, '토큰이 필요합니다'),
  newPassword: passwordSchema
})

export const metamaskLoginSchema = z.object({
  wallet_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, '유효한 Ethereum 주소가 아닙니다'),
  signature: z.string().min(1, '서명이 필요합니다')
})

// ============================================
// Artwork Schemas
// ============================================

export const createArtworkSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(255, '제목은 255자를 초과할 수 없습니다'),
  description: z.string()
    .max(5000, '설명은 5000자를 초과할 수 없습니다')
    .optional(),
  artist_id: idSchema,
  image_url: z.string()
    .url('유효한 URL을 입력해주세요')
    .max(1000, 'URL은 1000자를 초과할 수 없습니다'),
  nft_token_id: z.string()
    .max(255, 'NFT 토큰 ID는 255자를 초과할 수 없습니다')
    .optional(),
  nft_contract_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, '유효한 Ethereum 주소가 아닙니다')
    .optional(),
  blockchain: z.enum(['ethereum', 'polygon', 'klaytn', 'flow'])
    .default('ethereum'),
  price: z.coerce.number()
    .nonnegative('가격은 음수일 수 없습니다')
    .optional(),
  status: z.enum(['pending', 'approved', 'rejected'])
    .default('pending')
})

export const updateArtworkSchema = createArtworkSchema.partial()

export const getArtworksQuerySchema = z.object({
  page: pageSchema,
  limit: limitSchema,
  artist_id: idSchema.optional(),
  status: z.enum(['pending', 'approved', 'rejected']).optional(),
  blockchain: z.enum(['ethereum', 'polygon', 'klaytn', 'flow']).optional(),
  search: z.string().max(255).optional(),
  sort_by: z.enum(['created_at', 'price', 'title', 'artist_name'])
    .default('created_at'),
  order: z.enum(['asc', 'desc']).default('desc')
})

// ============================================
// Artist Schemas
// ============================================

export const createArtistSchema = z.object({
  name: nameSchema,
  bio: z.string().max(5000, 'bio는 5000자를 초과할 수 없습니다').optional(),
  profile_image: z.string().url('유효한 URL을 입력해주세요').optional(),
  website: z.string().url('유효한 URL을 입력해주세요').optional(),
  social_links: z.string().max(1000).optional(),
  verified: z.boolean().default(false),
  wallet_address: z.string()
    .regex(/^0x[a-fA-F0-9]{40}$/, '유효한 Ethereum 주소가 아닙니다')
    .optional()
})

export const updateArtistSchema = createArtistSchema.partial()

// ============================================
// Exhibition Schemas
// ============================================

export const createExhibitionSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(255, '제목은 255자를 초과할 수 없습니다'),
  description: z.string()
    .max(5000, '설명은 5000자를 초과할 수 없습니다')
    .optional(),
  curator_id: idSchema,
  start_date: z.string()
    .datetime('유효한 날짜 형식이 아닙니다 (ISO 8601)'),
  end_date: z.string()
    .datetime('유효한 날짜 형식이 아닙니다 (ISO 8601)'),
  location: z.string().max(255).optional(),
  banner_image: z.string().url('유효한 URL을 입력해주세요').optional(),
  status: z.enum(['upcoming', 'ongoing', 'ended']).default('upcoming')
})

export const updateExhibitionSchema = createExhibitionSchema.partial()

// ============================================
// Evaluation Schemas
// ============================================

export const createEvaluationSchema = z.object({
  artwork_id: idSchema,
  expert_id: idSchema,
  originality_score: z.coerce.number()
    .min(0, '점수는 0 이상이어야 합니다')
    .max(100, '점수는 100 이하여야 합니다'),
  technical_score: z.coerce.number().min(0).max(100),
  aesthetic_score: z.coerce.number().min(0).max(100),
  market_score: z.coerce.number().min(0).max(100),
  social_score: z.coerce.number().min(0).max(100),
  comments: z.string().max(5000).optional()
})

// ============================================
// Comment Schemas
// ============================================

export const createCommentSchema = z.object({
  artwork_id: idSchema,
  content: z.string()
    .min(1, '댓글 내용을 입력해주세요')
    .max(2000, '댓글은 2000자를 초과할 수 없습니다'),
  parent_id: idSchema.optional()
})

export const updateCommentSchema = z.object({
  content: z.string()
    .min(1, '댓글 내용을 입력해주세요')
    .max(2000, '댓글은 2000자를 초과할 수 없습니다')
})
