/**
 * מעקב ציוני מבחני-כניסה של מועמדים (PROGRESS_ENGINE.md §11) — סיכום טהור
 * מעל רשומות CandidateAssessment, לדשבורד המנהלים ולמסכי הגיוס.
 *
 * בכוונה מחוץ ל-recalculateUserStats: מועמד אינו משתמש עם אירועי UserProgress,
 * וציון מבחן-כניסה לא מתערבב ב-avg_score של עובדים.
 */
import type { EvaluationDecision } from '@/lib/constants/enums'
import type { CandidateAssessment } from '@/types/entities'

/** ברירת-המחדל של ה-SRS כשההחלטה טרם נרשמה */
const DEFAULT_DECISION: EvaluationDecision = 'pending_review'

export interface CandidateTrackingEntry {
  candidate_email: string
  candidate_full_name: string | null
  department: string | null
  /** מספר ההגשות של המועמד (כולל retake) */
  attempts: number
  /** הציון וההחלטה מההגשה האחרונה — המצב העדכני של המועמד */
  latest_score: number
  latest_decision: EvaluationDecision
  /** הציון הגבוה ביותר בין כל הנסיונות */
  best_score: number
  last_submitted_at: string
  invite_id: string
}

export interface CandidateTrackingSummary {
  total_candidates: number
  total_assessments: number
  // ספירת החלטות פר-מועמד (לפי ההגשה האחרונה), לא פר-הגשה
  pending_review: number
  approved: number
  rejected: number
  requires_interview: number
  /** ממוצע מעוגל של הציון האחרון של כל מועמד; 0 כשאין מועמדים */
  avg_score: number
}

export interface CandidateTracking {
  /** ממוין מההגשה האחרונה לישנה — הטרי ראשון */
  candidates: CandidateTrackingEntry[]
  summary: CandidateTrackingSummary
}

export function summarizeCandidateAssessments(
  assessments: CandidateAssessment[],
): CandidateTracking {
  // קיבוץ לפי מועמד; "אחרון" נקבע לפי submitted_at
  const byEmail = new Map<string, CandidateAssessment[]>()
  for (const a of assessments) {
    const group = byEmail.get(a.candidate_email)
    if (group) group.push(a)
    else byEmail.set(a.candidate_email, [a])
  }

  const candidates: CandidateTrackingEntry[] = [...byEmail.values()].map(
    (group) => {
      const latest = group.reduce((acc, a) =>
        a.submitted_at > acc.submitted_at ? a : acc,
      )
      return {
        candidate_email: latest.candidate_email,
        candidate_full_name:
          group.map((a) => a.candidate_full_name).find(Boolean) ?? null,
        department: group.map((a) => a.department).find(Boolean) ?? null,
        attempts: group.length,
        latest_score: latest.score,
        latest_decision: latest.evaluation_decision ?? DEFAULT_DECISION,
        best_score: Math.max(...group.map((a) => a.score)),
        last_submitted_at: latest.submitted_at,
        invite_id: latest.invite_id,
      }
    },
  )

  candidates.sort((a, b) =>
    b.last_submitted_at.localeCompare(a.last_submitted_at),
  )

  const decisions: Record<EvaluationDecision, number> = {
    pending_review: 0,
    approved: 0,
    rejected: 0,
    requires_interview: 0,
  }
  let scoreSum = 0
  for (const c of candidates) {
    decisions[c.latest_decision]++
    scoreSum += c.latest_score
  }

  return {
    candidates,
    summary: {
      total_candidates: candidates.length,
      total_assessments: assessments.length,
      ...decisions,
      avg_score:
        candidates.length > 0 ? Math.round(scoreSum / candidates.length) : 0,
    },
  }
}
