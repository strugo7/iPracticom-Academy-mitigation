/**
 * שליפת קלט ה-ExamPlayer — מבחן + שאלותיו (מסמך 14). מראה את התבנית של
 * fetchLessonPlayerInput (features/lessonPlayer). "בר-ביצוע" רק אם המבחן
 * 'published' — מבחן draft/archived לא נטען לביצוע (כמו isPlayableLesson).
 */
import { ApiError, type IApiClient } from '@/lib/api'
import type { Exam, Question } from '@/types/entities'

export interface ExamPlayerInput {
  exam: Exam
  /** בסדר order_index הקנוני (לא מעורבב) — הערבוב בפועל נגזר ממנו ב-attemptService */
  questions: Question[]
}

export async function fetchExamPlayerInput(
  api: IApiClient,
  examId: string,
): Promise<ExamPlayerInput> {
  const exam = await api.exams.findById(examId)
  if (!exam) {
    throw new ApiError('not_found', `מבחן ${examId} לא נמצא`)
  }
  if (exam.status !== 'published') {
    throw new ApiError('not_found', `מבחן ${examId} אינו זמין לביצוע`)
  }

  const refs = [...(exam.questions ?? [])].sort(
    (a, b) => a.order_index - b.order_index,
  )
  const questions = await Promise.all(
    refs.map(async (ref) => {
      const question = await api.questions.findById(ref.question_id)
      if (!question) {
        throw new ApiError(
          'not_found',
          `שאלה ${ref.question_id} של מבחן ${examId} לא נמצאה`,
        )
      }
      return question
    }),
  )

  return { exam, questions }
}
