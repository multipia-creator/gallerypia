/**
 * Types and Utility Functions Tests
 */

import { describe, it, expect } from 'vitest'
import { 
  calculateFinalValue,
  calculateArtistAchievement,
  calculateArtworkContent,
  calculateCertification,
  calculatePopularity,
  scoreToKRW,
  krwToEth,
  ethToKrw
} from '../src/types'

describe('Calculate Final Value', () => {
  it('should calculate value with all modules', () => {
    const result = calculateFinalValue(
      80, // artistScore
      85, // artworkScore
      90, // certificationScore
      75, // expertScore
      70, // popularityScore
      {
        artist: 0.25,
        artwork: 0.30,
        certification: 0.15,
        expert: 0.20,
        popularity: 0.10
      }
    )

    expect(result).toBeGreaterThan(0)
    expect(result).toBeLessThanOrEqual(100)
  })

  it('should handle perfect scores', () => {
    const result = calculateFinalValue(
      100, 100, 100, 100, 100,
      {
        artist: 0.20,
        artwork: 0.20,
        certification: 0.20,
        expert: 0.20,
        popularity: 0.20
      }
    )

    expect(result).toBe(100)
  })

  it('should handle minimum scores', () => {
    const result = calculateFinalValue(
      0, 0, 0, 0, 0,
      {
        artist: 0.20,
        artwork: 0.20,
        certification: 0.20,
        expert: 0.20,
        popularity: 0.20
      }
    )

    expect(result).toBe(0)
  })

  it('should weight scores appropriately', () => {
    // Higher weight on artist
    const highArtist = calculateFinalValue(
      100, 0, 0, 0, 0,
      {
        artist: 0.80,
        artwork: 0.05,
        certification: 0.05,
        expert: 0.05,
        popularity: 0.05
      }
    )

    expect(highArtist).toBeGreaterThan(70)
  })

  it('should return consistent values', () => {
    const weights = {
      artist: 0.25,
      artwork: 0.30,
      certification: 0.15,
      expert: 0.20,
      popularity: 0.10
    }

    const result1 = calculateFinalValue(75, 80, 85, 70, 65, weights)
    const result2 = calculateFinalValue(75, 80, 85, 70, 65, weights)

    expect(result1).toBe(result2)
  })

  it('should throw error if weights do not sum to 1.0', () => {
    expect(() => calculateFinalValue(
      80, 80, 80, 80, 80,
      {
        artist: 0.20,
        artwork: 0.20,
        certification: 0.20,
        expert: 0.20,
        popularity: 0.10 // Sum = 0.90
      }
    )).toThrow('가중치의 합은 1.0이어야 합니다')
  })
})

describe('Score Conversion Functions', () => {
  it('should convert score to KRW correctly', () => {
    const basePrice = 10000000 // 1천만원
    
    // 0점 = 1배 = 1천만원
    expect(scoreToKRW(0, basePrice)).toBe(10000000)
    
    // 50점 = 6배 = 6천만원
    expect(scoreToKRW(50, basePrice)).toBe(60000000)
    
    // 100점 = 11배 = 1억1천만원
    expect(scoreToKRW(100, basePrice)).toBe(110000000)
  })

  it('should convert KRW to ETH correctly', () => {
    const ethPrice = 4500000 // 1 ETH = 450만원
    
    expect(krwToEth(4500000, ethPrice)).toBe(1.0)
    expect(krwToEth(9000000, ethPrice)).toBe(2.0)
    expect(krwToEth(2250000, ethPrice)).toBe(0.5)
  })

  it('should convert ETH to KRW correctly', () => {
    const ethPrice = 4500000
    
    expect(ethToKrw(1.0, ethPrice)).toBe(4500000)
    expect(ethToKrw(2.0, ethPrice)).toBe(9000000)
    expect(ethToKrw(0.5, ethPrice)).toBe(2250000)
  })
})
