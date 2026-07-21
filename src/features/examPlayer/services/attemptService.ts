/**
 * מחזור-חיים של ExamAttempt (מסמך 14 + SRS §1.4). אין RPC מתועד ל-submitExam —
 * כמו progressEvents.ts, כותבים ישירות מול apiClient.examAttempts/userProgress
 * (IResource CRUD, לפי CLAUDE.md §2 mock-first).
 *
 * מוסכמת אינדקסים: user_answers/detailed_results תמיד נשמרים לפי המזהים
 * המקוריים (correct_answer_index של Question, סדר order_items המקורי) —
 * לא לפי מיקום-התצוגה המעורבב. ה-UI ממיר תצוגה→מקור דרך answer_orders בזמן
 * הבחירה, כך שהניקוד תמיד טהור מהערבוב.
 */
import { ApiError, type IApiClient } from '@/lib/api'
import type {
  Exam,
  ExamAttempt,
  ExamDetailedResultQuestion,
  Question,
} from '@/types/entities'
import { buildShuffleForExam } from './shuffle'

const FINISHED_STATUSES = new Set<ExamAttempt['status']>([
  'completed',
  'timed_out',
])

function generateSeed(): number {
  return Math.floor(Math.random() * 0x7fffffff)
}

export interface StartOrResumeAttemptInput {
  api: IApiClient
  userId: string
  exam: Exam
  questions: Question[]
}

/** מחזיר ניסיון in_progress קיים (resume), או יוצר חדש — אחרי בדיקת max_attempts. */
export async function startOrResumeAttempt({
  api,
  userId,
  exam,
  questions,
}: StartOrResumeAttemptInput): Promise<ExamAttempt> {
  const existing = await api.examAttempts.findMany({
    filter: { user_id: userId, exam_id: exam.id },
  })

  const inProgress = existing.find((a) => a.status === 'in_progress')
  if (inProgress) return inProgress

  const finishedCount = existing.filter((a) =>
    FINISHED_STATUSES.has(a.status ?? null),
  ).length
  const maxAttempts = exam.max_attempts ?? Number.POSITIVE_INFINITY
  if (finishedCount >= maxAttempts) {
    throw new ApiError(
      'validation',
      `נוצל מספר הניסיונות המרבי (${maxAttempts}) למבחן זה`,
    )
  }

  const seed = generateSeed()
  const { questionOrder, answerOrders } = buildShuffleForExam(
    exam,
    questions,
    seed,
  )

  return api.examAttempts.create({
    exam_id: exam.id,
    user_id: userId,
    attempt_number: existing.length + 1,
    seed,
    question_order: questionOrder,
    answer_orders: answerOrders,
    current_index: 0,
    user_answers: {},
    status: 'in_progress',
    started_at: new Date().toISOString(),
    feedback_shown: false,
  })
}

export interface SaveProgressInput {
  currentIndex: number
  userAnswers: Record<string, unknown>
}

export async function saveProgress(
  api: IApiClient,
  attemptId: string,
  progress: SaveProgressInput,
): Promise<void> {
  await api.examAttempts.update(attemptId, {
    current_index: progress.currentIndex,
    user_answers: progress.userAnswers,
  })
}

export interface ScoredAttempt {
  score: number
  passed: boolean
  detailedResults: { questions: ExamDetailedResultQuestion[] }
}

function isOrderCorrect(userAnswer: unknown, correctIds: string[]): boolean {
  if (!Array.isArray(userAnswer) || userAnswer.length !== correctIds.length) {
    return false
  }
  return userAnswer.every((id, index) => id === correctIds[index])
}

/** פונקציה טהורה — ללא IO. ניקוד באחוזים (0-100), עובר לפי exam.passing_score. */
export function scoreAttempt(
  exam: Pick<Exam, 'passing_score'>,
  questions: Question[],
  userAnswers: Record<string, unknown>,
): ScoredAttempt {
  let earned = 0
  let max = 0
  const detailedQuestions: ExamDetailedResultQuestion[] = questions.map(
    (question) => {
      const points = question.points ?? 1
      const userAnswer = userAnswers[question.id]
      let isCorrect: boolean
      let correctAnswer: unknown

      if (question.question_type === 'order_sequence') {
        const correctIds = (question.order_items ?? []).map((item) => item.id)
        correctAnswer = correctIds
        isCorrect = isOrderCorrect(userAnswer, correctIds)
      } else {
        correctAnswer = question.correct_answer_index
        isCorrect =
          userAnswer !== undefined && userAnswer === question.correct_answer_index
      }

      max += points
      const pointsEarned = isCorrect ? points : 0
      earned += pointsEarned

      return {
        question_id: question.id,
        user_answer: userAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        points_earned: pointsEarned,
        max_points: points,
      }
    },
  )

  const score = max > 0 ? Math.round((earned / max) * 100) : 0
  const passed = score >= (exam.passing_score ?? 70)

  return { score, passed, detailedResults: { questions: detailedQuestions } }
}

export type SubmitReason = 'manual' | 'timeout'

export interface SubmitAttemptInput {
  api: IApiClient
  userId: string
  attempt: ExamAttempt
  exam: Exam
  questions: Question[]
  reason: SubmitReason
}

/** כותב את ה-ExamAttempt הסופי + אירועי UserProgress (exam_attempt תמיד, exam_passed רק אם עבר). */
export async function submitAttempt({
  api,
  userId,
  attempt,
  exam,
  questions,
  reason,
}: SubmitAttemptInput): Promise<ExamAttempt> {
  const { score, passed, detailedResults } = scoreAttempt(
    exam,
    questions,
    attempt.user_answers ?? {},
  )
  const startedAt = attempt.started_at
    ? new Date(attempt.started_at).getTime()
    : Date.now()
  const timeSpentSeconds = Math.max(
    0,
    Math.round((Date.now() - startedAt) / 1000),
  )
  const submittedAt = new Date().toISOString()

  const updated = await api.examAttempts.update(attempt.id, {
    status: reason === 'timeout' ? 'timed_out' : 'completed',
    score,
    passed,
    detailed_results: detailedResults,
    submitted_at: submittedAt,
    time_spent_seconds: timeSpentSeconds,
  })

  await api.userProgress.create({
    user_id: userId,
    exam_id: exam.id,
    track_id: exam.linked_track_id ?? null,
    topic_id: exam.linked_topic_id ?? null,
    lesson_id: exam.linked_lesson_id ?? null,
    progress_type: 'exam_attempt',
    score,
    completed_at: submittedAt,
    time_spent_minutes: Math.max(1, Math.round(timeSpentSeconds / 60)),
    exam_answers: detailedResults.questions.map((q) => ({
      question_id: q.question_id,
      user_answer: q.user_answer,
      is_correct: q.is_correct,
      points_earned: q.points_earned,
    })),
  })

  if (passed) {
    await api.userProgress.create({
      user_id: userId,
      exam_id: exam.id,
      track_id: exam.linked_track_id ?? null,
      topic_id: exam.linked_topic_id ?? null,
      lesson_id: exam.linked_lesson_id ?? null,
      progress_type: 'exam_passed',
      score,
      completed_at: submittedAt,
    })
  }

  return updated
}
