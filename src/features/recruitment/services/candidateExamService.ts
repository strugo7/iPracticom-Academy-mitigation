/**
 * מבחן-הכניסה של מועמד (SRS §2.1 fetchExamDataForCandidate / submitCandidateAssessment,
 * Phase 8.2 — מסמך 35).
 *
 * ⚠️ סימולציית-לקוח: ב-Phase 12 השליפה (public) והחישוב הם server-side. כאן
 * שולפים את המבחן ושאלותיו מה-MockAPI, מחשבים ציון בצד-לקוח ויוצרים
 * CandidateAssessment (עם answers.questions[]) — ההגשה מופיעה מיד בטאב ההערכות.
 */
import type { IApiClient } from '@/lib/api'
import type { CreateInput } from '@/lib/api/types'
import type { CandidateAssessment, Invite } from '@/types/entities'
import type { CandidateExamData, CandidateExamQuestion } from '../types'

/** שליפת מבחן-הכניסה של ההזמנה + שאלותיו (לפי ExamQuestionRef, בסדר order_index). */
export async function fetchExamForCandidate(
  api: IApiClient,
  invite: Invite,
): Promise<CandidateExamData | null> {
  if (!invite.exam_id) return null
  const exam = await api.exams.findById(invite.exam_id)
  if (!exam) return null

  const refs = [...(exam.questions ?? [])].sort((a, b) => a.order_index - b.order_index)
  const allQuestions = await api.questions.findMany()
  const byId = new Map(allQuestions.map((q) => [q.id, q]))

  const questions: CandidateExamQuestion[] = []
  for (const ref of refs) {
    const q = byId.get(ref.question_id)
    // רק שאלות מבוססות-אפשרויות (multiple_choice/true_false) — התואם לדאטת מבחני-הכניסה.
    if (!q || !q.options || q.options.length === 0 || q.correct_answer_index == null) continue
    questions.push({
      id: q.id,
      text: q.question_text,
      options: q.options,
      correctIndex: q.correct_answer_index,
      maxPoints: ref.points ?? q.points ?? 1,
    })
  }

  return {
    examTitle: exam.title ?? 'מבחן כניסה',
    timeLimitMinutes: exam.time_limit_minutes ?? null,
    questions,
  }
}

export interface CandidateExamSubmission {
  invite: Invite
  data: CandidateExamData
  /** questionId → אינדקס האפשרות שנבחרה */
  answers: Record<string, number>
  timeSpentSeconds: number
}

/** חישוב ציון ובניית רשומת-הערכה (טהור — CLAUDE.md §4). */
export function buildAssessment(
  sub: CandidateExamSubmission,
): CreateInput<CandidateAssessment> {
  const { invite, data, answers, timeSpentSeconds } = sub

  const items = data.questions.map((q) => {
    const selected = answers[q.id]
    const isCorrect = selected === q.correctIndex
    return {
      question_id: q.id,
      question_text: q.text,
      user_answer: selected != null ? (q.options[selected] ?? null) : null,
      correct_answer: q.options[q.correctIndex] ?? null,
      is_correct: isCorrect,
      points_earned: isCorrect ? q.maxPoints : 0,
      max_points: q.maxPoints,
    }
  })

  const totalPoints = data.questions.reduce((sum, q) => sum + q.maxPoints, 0)
  const earned = items.reduce((sum, it) => sum + (it.points_earned ?? 0), 0)
  const score = totalPoints > 0 ? Math.round((earned / totalPoints) * 100) : 0
  const correct = items.filter((it) => it.is_correct).length

  return {
    invite_id: invite.id,
    candidate_email: invite.email,
    candidate_full_name: invite.candidate_full_name ?? null,
    department: invite.department ?? null,
    score,
    total_questions: data.questions.length,
    correct_answers: correct,
    time_spent_seconds: timeSpentSeconds,
    submitted_at: new Date().toISOString(),
    attempt_number: 1,
    is_retake: false,
    answers: { questions: items },
    evaluation_decision: 'pending_review',
  }
}

/** יצירת ההערכה + קידום ההזמנה ל-'test_submitted' (best-effort, כמו קליטת-השרת). */
export async function submitCandidateAssessment(
  api: IApiClient,
  sub: CandidateExamSubmission,
): Promise<CandidateAssessment> {
  const created = await api.candidateAssessments.create(buildAssessment(sub))
  try {
    await api.invites.update(sub.invite.id, {
      status: 'test_submitted',
      assessment_completed_at: new Date().toISOString(),
    })
  } catch {
    // אין הזמנה תואמת (mock) — ההערכה נוצרה, מתעלמים.
  }
  return created
}
