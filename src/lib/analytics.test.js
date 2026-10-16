import { describe, expect, it } from 'vitest'
import {
  buildAnalyticsSummary,
  buildFunnel,
  countByStage,
  countReached,
  formatPercentage,
  toRate,
} from './analytics'
import { COLUMNS } from '../pages/dashboard/dashboardData'

// ---------------------------------------------------------------------------
// Fixtures & helpers
// ---------------------------------------------------------------------------

const app = (status) => ({ status })
const apps = (status, count) => Array.from({ length: count }, () => app(status))

// 9 tracked, 7 sent, 4 reached interview, 1 reached offer.
const MIXED = [
  ...apps('to_apply', 2),
  ...apps('applied', 2),
  ...apps('rejected', 1),
  ...apps('interview', 3),
  ...apps('offer', 1),
]

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------

describe('countReached', () => {
  it('counts an application toward every stage it has reached', () => {
    const offer = [app('offer')]

    expect(countReached(offer, 'applied')).toBe(1)
    expect(countReached(offer, 'interview')).toBe(1)
    expect(countReached(offer, 'offer')).toBe(1)
  })

  it('counts rejected applications as sent only', () => {
    const rejected = [app('rejected')]

    expect(countReached(rejected, 'applied')).toBe(1)
    expect(countReached(rejected, 'interview')).toBe(0)
    expect(countReached(rejected, 'offer')).toBe(0)
  })

  it('ignores unknown or missing statuses', () => {
    const unknown = [app('archived'), app(undefined), {}]

    expect(countReached(unknown, 'to_apply')).toBe(0)
    expect(countReached(unknown, 'applied')).toBe(0)
    expect(countReached(unknown, 'interview')).toBe(0)
    expect(countReached(unknown, 'offer')).toBe(0)
  })

  it('counts stages across a mixed set of applications', () => {
    expect(countReached(MIXED, 'to_apply')).toBe(9)
    expect(countReached(MIXED, 'applied')).toBe(7)
    expect(countReached(MIXED, 'interview')).toBe(4)
    expect(countReached(MIXED, 'offer')).toBe(1)
  })
})

describe('toRate', () => {
  it('divides the numerator by the denominator', () => {
    expect(toRate(1, 4)).toBe(0.25)
    expect(toRate(0, 4)).toBe(0)
  })

  // 0 would render as "0%", which falsely claims a measured rate.
  it('returns null, not 0, when the denominator is 0', () => {
    expect(toRate(0, 0)).toBeNull()
  })
})

describe('formatPercentage', () => {
  it('rounds to a whole percent', () => {
    expect(formatPercentage(0)).toBe('0%')
    expect(formatPercentage(0.25)).toBe('25%')
    expect(formatPercentage(4 / 7)).toBe('57%')
    expect(formatPercentage(1 / 3)).toBe('33%')
    expect(formatPercentage(1)).toBe('100%')
  })

  it('shows a dash for null', () => {
    expect(formatPercentage(null)).toBe('—')
  })
})

describe('countByStage', () => {
  it('returns one entry per column in board order, keeping title and tone', () => {
    expect(countByStage(MIXED, COLUMNS)).toEqual([
      {
        id: 'to_apply',
        title: 'To apply',
        tone: 'bg-brand-blue',
        count: 2,
        share: 2 / 9,
      },
      {
        id: 'applied',
        title: 'Applied / Waiting',
        tone: 'bg-brand-pink',
        count: 2,
        share: 2 / 9,
      },
      {
        id: 'interview',
        title: 'Interview',
        tone: 'bg-brand-green',
        count: 3,
        share: 3 / 9,
      },
      {
        id: 'offer',
        title: 'Offer',
        tone: 'bg-brand-yellow',
        count: 1,
        share: 1 / 9,
      },
    ])
  })

  it('gives every column a null share when there are no applications', () => {
    const stages = countByStage([], COLUMNS)

    expect(stages).toHaveLength(COLUMNS.length)
    for (const stage of stages) {
      expect(stage.count).toBe(0)
      expect(stage.share).toBeNull()
    }
  })
})

describe('buildFunnel', () => {
  it('returns Sent, Interview and Offer in that order with reached counts', () => {
    expect(buildFunnel(MIXED)).toEqual([
      { id: 'applied', title: 'Sent', count: 7 },
      { id: 'interview', title: 'Interview', count: 4 },
      { id: 'offer', title: 'Offer', count: 1 },
    ])
  })
})

describe('buildAnalyticsSummary', () => {
  it('summarises a mixed set of applications', () => {
    const summary = buildAnalyticsSummary(MIXED, COLUMNS)

    expect(summary.total).toBe(9)
    expect(summary.sent).toBe(7)
    expect(summary.stages).toEqual(countByStage(MIXED, COLUMNS))
    expect(summary.funnel).toEqual(buildFunnel(MIXED))
    expect(summary.conversions).toEqual({
      appliedToInterview: 4 / 7,
      interviewToOffer: 1 / 4,
    })
  })

  it('has null conversion rates when nothing has been sent', () => {
    const summary = buildAnalyticsSummary(apps('to_apply', 3), COLUMNS)

    expect(summary.sent).toBe(0)
    expect(summary.conversions).toEqual({
      appliedToInterview: null,
      interviewToOffer: null,
    })
  })

  it('has a null interview → offer rate when nothing reached interview', () => {
    const summary = buildAnalyticsSummary(
      [...apps('applied', 2), app('rejected')],
      COLUMNS
    )

    expect(summary.conversions).toEqual({
      appliedToInterview: 0,
      interviewToOffer: null,
    })
  })
})
