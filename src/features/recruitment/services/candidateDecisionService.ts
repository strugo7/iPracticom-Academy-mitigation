/**
 * החלטת-מנהל על הערכת-מועמד (SRS §2.1 makeCandidateDecision — מסמך 35).
 *
 * ⚠️ סימולציית-לקוח של פונקציית-שרת: ב-Phase 12 (RealApi) זו קריאה אטומית אחת
 * שגם קולטת/דוחה את המשתמש. כאן אנו מעדכנים את ההערכה, ובאישור — גם מסמנים את
 * ההזמנה המקושרת כ-'hired'. עדכון-ההזמנה best-effort (ייתכן שאין הזמנה תואמת
 * בדאטת ה-mock); כשל בו לא מבטל את עדכון-ההערכה שכבר בוצע.
 */
import type { IApiClient } from '@/lib/api'
import type { EvaluationDecision } from '@/lib/constants/enums'
import type { CandidateAssessment } from '@/types/entities'

export async function makeCandidateDecision(
  api: IApiClient,
  assessment: CandidateAssessment,
  decision: EvaluationDecision,
  notes: string,
): Promise<CandidateAssessment> {
  const updated = await api.candidateAssessments.update(assessment.id, {
    evaluation_decision: decision,
    evaluation_date: new Date().toISOString(),
    evaluator_notes: notes.trim() || null,
  })

  if (decision === 'approved' && assessment.invite_id) {
    try {
      await api.invites.update(assessment.invite_id, { status: 'hired' })
    } catch {
      // אין הזמנה תואמת (mock) — ההערכה עודכנה, מסמנים כטופל ומתעלמים.
    }
  }

  return updated
}
