import { describe, expect, it } from 'vitest'
import { computeStreak, localDateIn } from '../server/utils/streak'

describe('computeStreak', () => {
  it('reports nothing for a journal with no completed sessions', () => {
    expect(computeStreak([], '2026-09-17')).toEqual({
      current: 0,
      longest: 0,
      total: 0,
      lastPrayedOn: null,
      prayedToday: false,
    })
  })

  it('counts consecutive days ending today', () => {
    const result = computeStreak(['2026-09-15', '2026-09-16', '2026-09-17'], '2026-09-17')
    expect(result.current).toBe(3)
    expect(result.prayedToday).toBe(true)
  })

  it('keeps the streak alive for the whole day after the last session', () => {
    // Prayed yesterday, not yet today — the day is not over, so it still stands.
    const result = computeStreak(['2026-09-15', '2026-09-16'], '2026-09-17')
    expect(result.current).toBe(2)
    expect(result.prayedToday).toBe(false)
  })

  it('breaks the streak once a full day has been missed', () => {
    const result = computeStreak(['2026-09-14', '2026-09-15'], '2026-09-17')
    expect(result.current).toBe(0)
    expect(result.longest).toBe(2)
    expect(result.total).toBe(2)
  })

  it('counts two sessions on one day as one day', () => {
    const result = computeStreak(['2026-09-17', '2026-09-17', '2026-09-16'], '2026-09-17')
    expect(result.current).toBe(2)
    expect(result.total).toBe(2)
  })

  it('remembers the longest run even after it is broken', () => {
    const result = computeStreak(
      ['2026-01-01', '2026-01-02', '2026-01-03', '2026-01-04', '2026-03-01', '2026-03-02'],
      '2026-03-02',
    )
    expect(result.longest).toBe(4)
    expect(result.current).toBe(2)
  })

  it('crosses a month boundary', () => {
    const result = computeStreak(['2026-08-30', '2026-08-31', '2026-09-01'], '2026-09-01')
    expect(result.current).toBe(3)
  })

  it('crosses a leap day', () => {
    const result = computeStreak(['2028-02-28', '2028-02-29', '2028-03-01'], '2028-03-01')
    expect(result.current).toBe(3)
  })

  it('handles unsorted input', () => {
    const result = computeStreak(['2026-09-17', '2026-09-15', '2026-09-16'], '2026-09-17')
    expect(result.current).toBe(3)
  })
})

describe('localDateIn', () => {
  it('assigns a late-evening session to the local day, not the UTC one', () => {
    // 2026-09-17 23:30 in Manila is already 15:30 UTC the same day,
    // but 22:00 UTC on the 17th is the 18th in Manila.
    const lateManila = new Date('2026-09-17T16:30:00Z') // 00:30 on the 18th, Manila
    expect(localDateIn('Asia/Manila', lateManila)).toBe('2026-09-18')
    expect(localDateIn('UTC', lateManila)).toBe('2026-09-17')
  })

  it('assigns an early-morning session west of UTC to the previous local day', () => {
    const earlyUtc = new Date('2026-09-18T03:00:00Z') // 23:00 on the 17th, New York
    expect(localDateIn('America/New_York', earlyUtc)).toBe('2026-09-17')
  })

  it('falls back to UTC for an unknown zone rather than throwing', () => {
    const at = new Date('2026-09-17T12:00:00Z')
    expect(localDateIn('Not/AZone', at)).toBe('2026-09-17')
  })
})
