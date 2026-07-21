/**
 * הרכבת ProfileViewModel — זהות, מסלול-משויך, בלוק סטטיסטיקות, רדאר-ביצועים
 * והיסטוריית-מבחנים עם drill-down (doc 09 §3). פונקציות טהורות מעל הקטלוג
 * הגולמי + UserProgressView (progressService/progressInsights, Phase 1) —
 * לא מחשבות שום דבר שכבר מחושב שם (avg_progress, total_xp, level וכו').
 *
 * user_answer/correct_answer ב-detailed_results: אינדקס (multiple_choice/
 * true_false) או מערך-מזהים (order_sequence) — מוסכמת attemptService.ts.
 */
import type {
  Exam,
  ExamAttempt,
  ExamDetailedResultQuestion,
  LearningTrack,
  Question,
  User,
} from '@/types/entities'
import type { UserProgressView } from '@/lib/hooks/useProgress'
import type {
  ExamHistoryEntry,
  ExamHistoryOption,
  ExamHistoryQuestion,
  PerformanceRadarPoint,
  ProfileIdentity,
  ProfileStatTile,
  ProfileTrackSummary,
  ProfileViewModel,
} from '../types'

const FINISHED_STATUSES = new Set<ExamAttempt['status']>([
  'completed',
  'timed_out',
])

const HEBREW_MONTHS = [
  'ינואר',
  'פברואר',
  'מרץ',
  'אפריל',
  'מאי',
  'יוני',
  'יולי',
  'אוגוסט',
  'ספטמבר',
  'אוקטובר',
  'נובמבר',
  'דצמבר',
]

function formatJoinedLabel(createdDate: string): string {
  const d = new Date(createdDate)
  return `הצטרפות: ${HEBREW_MONTHS[d.getMonth()]} ${d.getFullYear()}`
}

function formatDateLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function buildIdentity(
  user: Pick<
    User,
    'full_name' | 'department' | 'profile_picture_url' | 'created_date'
  >,
  progress: UserProgressView,
): ProfileIdentity {
  return {
    fullName: user.full_name,
    department: user.department ?? null,
    profilePictureUrl: user.profile_picture_url ?? null,
    joinedLabel: formatJoinedLabel(user.created_date),
    totalXp: progress.stats.total_xp,
    level: progress.insights.level,
    certificatesEarned: progress.stats.certificates_earned,
    avgProgressPercent: progress.stats.avg_progress,
  }
}

export function buildTrackSummary(
  track: LearningTrack | null,
  progress: UserProgressView,
): ProfileTrackSummary | null {
  if (!track) return null
  return {
    trackId: track.id,
    title: track.title ?? '',
    lessonsDone: progress.stats.lessons_completed,
    lessonsTotal: progress.stats.total_lessons_in_track,
    percent: progress.stats.avg_progress,
  }
}

export function buildStatTiles(progress: UserProgressView): ProfileStatTile[] {
  const hours = (progress.stats.total_time_spent_minutes / 60).toFixed(1)
  return [
    { key: 'hours', icon: 'Clock', value: hours, label: 'שעות למידה' },
    {
      key: 'courses',
      icon: 'Play2',
      value: String(progress.stats.completed_courses),
      label: 'קורסים שהושלמו',
    },
    {
      key: 'certificates',
      icon: 'SuccessV',
      value: String(progress.stats.certificates_earned),
      label: 'תעודות',
    },
    {
      key: 'exams',
      icon: 'File',
      value: `${progress.insights.exams_passed_in_track}/${progress.insights.total_exams_in_track}`,
      label: 'מבחנים שעברת',
    },
    {
      key: 'xp',
      icon: 'ArrowNorthEast',
      value: progress.stats.total_xp.toLocaleString('he-IL'),
      label: 'סך XP',
    },
  ]
}

/** ממוצע ציון (0–100) על ניסיונות שהוגשו, מקובץ לפי Exam.category */
export function buildPerformanceRadar(
  attempts: ExamAttempt[],
  examsById: Map<string, Exam>,
): PerformanceRadarPoint[] {
  const scoresByCategory = new Map<string, number[]>()
  for (const attempt of attempts) {
    if (!FINISHED_STATUSES.has(attempt.status ?? null)) continue
    if (attempt.score == null) continue
    const category = examsById.get(attempt.exam_id)?.category
    if (!category) continue
    const scores = scoresByCategory.get(category)
    if (scores) scores.push(attempt.score)
    else scoresByCategory.set(category, [attempt.score])
  }
  return Array.from(scoresByCategory.entries()).map(([category, scores]) => ({
    category,
    score: Math.round(scores.reduce((sum, s) => sum + s, 0) / scores.length),
  }))
}

function buildExamHistoryQuestion(
  detail: ExamDetailedResultQuestion,
  question: Question | undefined,
): ExamHistoryQuestion {
  const questionType = question?.question_type ?? 'multiple_choice'
  const options: ExamHistoryOption[] = []
  let userOrder: string[] | null = null
  let correctOrder: string[] | null = null

  if (questionType === 'order_sequence') {
    const items = question?.order_items ?? []
    const textById = new Map(items.map((item) => [item.id, item.text]))
    correctOrder = items.map((item) => item.text)
    const rawUserOrder = Array.isArray(detail.user_answer)
      ? (detail.user_answer as unknown[])
      : []
    userOrder = rawUserOrder.map((id) => textById.get(String(id)) ?? String(id))
  } else if (question?.options) {
    question.options.forEach((text, index) => {
      options.push({
        text,
        isCorrect: index === question.correct_answer_index,
        isSelected: index === detail.user_answer,
      })
    })
  }

  return {
    questionId: detail.question_id,
    questionText: question?.question_text ?? '',
    questionType,
    isCorrect: detail.is_correct,
    pointsEarned: detail.points_earned,
    maxPoints: detail.max_points,
    options,
    userOrder,
    correctOrder,
    explanation: question?.explanation ?? null,
  }
}

/** ניסיונות שהוגשו בלבד (completed/timed_out), מהחדש לישן, עם join ל-Exam+Question */
export function buildExamHistory(
  attempts: ExamAttempt[],
  examsById: Map<string, Exam>,
  questionsById: Map<string, Question>,
): ExamHistoryEntry[] {
  return attempts
    .filter(
      (a): a is ExamAttempt & { submitted_at: string } =>
        FINISHED_STATUSES.has(a.status ?? null) && Boolean(a.submitted_at),
    )
    .slice()
    .sort((a, b) => Date.parse(b.submitted_at) - Date.parse(a.submitted_at))
    .map((attempt) => {
      const exam = examsById.get(attempt.exam_id)
      const questions = (attempt.detailed_results?.questions ?? []).map(
        (detail) =>
          buildExamHistoryQuestion(detail, questionsById.get(detail.question_id)),
      )
      return {
        attemptId: attempt.id,
        examId: attempt.exam_id,
        title: exam?.title ?? 'מבחן',
        submittedAtLabel: formatDateLabel(attempt.submitted_at),
        questionCount: questions.length,
        scorePercent: attempt.score ?? 0,
        passed: Boolean(attempt.passed),
        questions,
      }
    })
}

export interface AssembleProfileInput {
  user: User
  track: LearningTrack | null
  progress: UserProgressView
  attempts: ExamAttempt[]
  exams: Exam[]
  questions: Question[]
}

export function assembleProfileViewModel(
  input: AssembleProfileInput,
): ProfileViewModel {
  const examsById = new Map(input.exams.map((e) => [e.id, e]))
  const questionsById = new Map(input.questions.map((q) => [q.id, q]))
  return {
    identity: buildIdentity(input.user, input.progress),
    track: buildTrackSummary(input.track, input.progress),
    stats: buildStatTiles(input.progress),
    radar: buildPerformanceRadar(input.attempts, examsById),
    examHistory: buildExamHistory(input.attempts, examsById, questionsById),
  }
}
