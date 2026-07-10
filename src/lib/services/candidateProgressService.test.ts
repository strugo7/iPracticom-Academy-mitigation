/**
 * מעקב ציוני מבחני-כניסה של מועמדים (PROGRESS_ENGINE.md §11) — סיכום טהור
 * מעל CandidateAssessment. בכוונה מחוץ למנוע ההתקדמות: מועמד אינו משתמש עם
 * אירועי UserProgress, וציון-כניסה לא מתערבב ב-avg_score של עובדים.
 */
import { describe, expect, it } from 'vitest'
import type { CandidateAssessment } from '@/types/entities'
import { summarizeCandidateAssessments } from './candidateProgressService'

let seq = 0
const assessment = (
  fields: Partial<CandidateAssessment> &
    Pick<CandidateAssessment, 'candidate_email' | 'score' | 'submitted_at'>,
): CandidateAssessment => ({
  id: `ca-${++seq}`,
  created_date: fields.submitted_at,
  updated_date: fields.submitted_at,
  invite_id: `inv-${seq}`,
  evaluation_decision: 'pending_review',
  ...fields,
})

describe('summarizeCandidateAssessments', () => {
  it('מקבץ לפי מועמד: כמה נסיונות, והציון/ההחלטה מההגשה האחרונה', () => {
    const { candidates } = summarizeCandidateAssessments([
      assessment({
        candidate_email: 'dana@x.com',
        score: 55,
        submitted_at: '2026-03-01T10:00:00.000Z',
        evaluation_decision: 'rejected',
      }),
      assessment({
        candidate_email: 'dana@x.com',
        score: 88,
        submitted_at: '2026-03-09T10:00:00.000Z',
        evaluation_decision: 'approved',
        candidate_full_name: 'דנה לוי',
        is_retake: true,
      }),
      assessment({
        candidate_email: 'yoni@x.com',
        score: 97,
        submitted_at: '2026-03-05T10:00:00.000Z',
      }),
    ])

    expect(candidates).toHaveLength(2)
    const dana = candidates.find((c) => c.candidate_email === 'dana@x.com')
    expect(dana).toMatchObject({
      candidate_full_name: 'דנה לוי',
      attempts: 2,
      latest_score: 88,
      best_score: 88,
      latest_decision: 'approved',
      last_submitted_at: '2026-03-09T10:00:00.000Z',
    })
  })

  it('best_score נשמר גם כשהניסיון האחרון גרוע מהקודם', () => {
    const { candidates } = summarizeCandidateAssessments([
      assessment({
        candidate_email: 'a@x.com',
        score: 94,
        submitted_at: '2026-03-01T10:00:00.000Z',
      }),
      assessment({
        candidate_email: 'a@x.com',
        score: 40,
        submitted_at: '2026-03-08T10:00:00.000Z',
      }),
    ])
    expect(candidates[0]).toMatchObject({ latest_score: 40, best_score: 94 })
  })

  it('ממוין מהגשה אחרונה לישנה — המועמד הטרי ראשון בדשבורד', () => {
    const { candidates } = summarizeCandidateAssessments([
      assessment({
        candidate_email: 'old@x.com',
        score: 80,
        submitted_at: '2026-01-01T10:00:00.000Z',
      }),
      assessment({
        candidate_email: 'new@x.com',
        score: 70,
        submitted_at: '2026-03-01T10:00:00.000Z',
      }),
    ])
    expect(candidates.map((c) => c.candidate_email)).toEqual([
      'new@x.com',
      'old@x.com',
    ])
  })

  it('הסיכום: החלטות פר-מועמד (לא פר-הגשה) וממוצע על הציון האחרון של כל מועמד', () => {
    const { summary } = summarizeCandidateAssessments([
      assessment({
        candidate_email: 'a@x.com',
        score: 50,
        submitted_at: '2026-03-01T10:00:00.000Z',
        evaluation_decision: 'rejected',
      }),
      assessment({
        candidate_email: 'a@x.com',
        score: 90,
        submitted_at: '2026-03-09T10:00:00.000Z',
        evaluation_decision: 'approved',
      }),
      assessment({
        candidate_email: 'b@x.com',
        score: 71,
        submitted_at: '2026-03-02T10:00:00.000Z',
        evaluation_decision: 'requires_interview',
      }),
      assessment({
        candidate_email: 'c@x.com',
        score: 0,
        submitted_at: '2026-03-03T10:00:00.000Z',
      }),
    ])
    expect(summary).toEqual({
      total_candidates: 3,
      total_assessments: 4,
      pending_review: 1,
      approved: 1,
      rejected: 0,
      requires_interview: 1,
      avg_score: Math.round((90 + 71 + 0) / 3),
    })
  })

  it('החלטה חסרה נספרת כ-pending_review (ברירת-המחדל של ה-SRS)', () => {
    const { candidates, summary } = summarizeCandidateAssessments([
      assessment({
        candidate_email: 'a@x.com',
        score: 80,
        submitted_at: '2026-03-01T10:00:00.000Z',
        evaluation_decision: null,
      }),
    ])
    expect(candidates[0].latest_decision).toBe('pending_review')
    expect(summary.pending_review).toBe(1)
  })

  it('קלט ריק — מבנה מאופס, לא נפילה', () => {
    const { candidates, summary } = summarizeCandidateAssessments([])
    expect(candidates).toEqual([])
    expect(summary).toEqual({
      total_candidates: 0,
      total_assessments: 0,
      pending_review: 0,
      approved: 0,
      rejected: 0,
      requires_interview: 0,
      avg_score: 0,
    })
  })
})
