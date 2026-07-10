/**
 * בדיקת הרכבת מעקב המועמדים — שליפת CandidateAssessment וסיכום דרך
 * summarizeCandidateAssessments. הלוגיקה עצמה נבדקת בשירות; כאן רק ההרכבה.
 */
import { describe, expect, it } from 'vitest'
import type { IApiClient } from '@/lib/api'
import type { CandidateAssessment } from '@/types/entities'
import { fetchCandidateTracking } from './useCandidateProgress'

const assessment: CandidateAssessment = {
  id: 'ca1',
  invite_id: 'inv1',
  candidate_email: 'dana@x.com',
  score: 88,
  submitted_at: '2026-03-09T10:00:00.000Z',
  evaluation_decision: 'approved',
  created_date: '2026-03-09T10:00:00.000Z',
  updated_date: '2026-03-09T10:00:00.000Z',
}

const fakeApi = {
  candidateAssessments: { findMany: async () => [assessment] },
} as unknown as IApiClient

describe('fetchCandidateTracking', () => {
  it('שולף את כל ההערכות ומחזיר את הסיכום הממופה', async () => {
    const tracking = await fetchCandidateTracking(fakeApi)
    expect(tracking.summary.total_candidates).toBe(1)
    expect(tracking.candidates[0]).toMatchObject({
      candidate_email: 'dana@x.com',
      latest_score: 88,
      latest_decision: 'approved',
    })
  })
})
