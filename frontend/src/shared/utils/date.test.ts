import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { formatCompactAge } from './date'

beforeEach(() => {
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-10-17T12:00:00Z'))
})

afterEach(() => vi.useRealTimers())

describe('compact feed timestamps', () => {
  it.each([
    [0, 'now'],
    [-60, 'now'],
    [59, 'now'],
    [60, '1m'],
    [3_599, '59m'],
    [3_600, '1h'],
    [86_399, '23h'],
    [86_400, '1d'],
    [604_800, '1w'],
    [2_592_000, '1mo'],
    [31_536_000, '1y'],
  ])('formats an age of %i seconds as %s', (seconds, expected) => {
    expect(formatCompactAge(new Date(Date.now() - seconds * 1_000).toISOString())).toBe(expected)
  })

  it('preserves an invalid source timestamp', () => {
    expect(formatCompactAge('Unknown date')).toBe('Unknown date')
  })
})
