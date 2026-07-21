/**
 * טיפוסי ה-view-model של feature הפרופיל — הצורה שהקומפוננטות מצפות לה,
 * נגזרת ע"י services/profileService מהישויות הגולמיות (User, ExamAttempt,
 * Exam, Question) ומ-UserProgressView (progressService, Phase 1). לא ישויות
 * גולמיות ולא מבנה שמור — נבנה מחדש בכל render.
 */
import type { IconName } from '@/components/ui'
import type { QuestionType } from '@/lib/constants/enums'

export interface ProfileIdentity {
  fullName: string
  department: string | null
  profilePictureUrl: string | null
  /** "הצטרף/ה ב<חודש> <שנה>" — נגזר מ-User.created_date */
  joinedLabel: string
  totalXp: number
  level: number
  certificatesEarned: number
  /** 0–100, ProgressStats.avg_progress — מזין את טבעת ההתקדמות בכרטיס הזהות */
  avgProgressPercent: number
}

export interface ProfileTrackSummary {
  trackId: string
  title: string
  lessonsDone: number
  lessonsTotal: number
  percent: number
}

export interface ProfileStatTile {
  key: string
  icon: IconName
  value: string
  label: string
}

export interface PerformanceRadarPoint {
  category: string
  /** ממוצע ציון (0–100) על כל ניסיונות המבחנים בקטגוריה זו */
  score: number
}

export interface ExamHistoryOption {
  text: string
  isCorrect: boolean
  isSelected: boolean
}

export interface ExamHistoryQuestion {
  questionId: string
  questionText: string
  questionType: QuestionType
  isCorrect: boolean
  pointsEarned: number
  maxPoints: number
  /** רק multiple_choice/true_false — order_sequence מוצג כרשימת-סדר, לא אפשרויות */
  options: ExamHistoryOption[]
  /** רק order_sequence */
  userOrder: string[] | null
  correctOrder: string[] | null
  explanation: string | null
}

export interface ExamHistoryEntry {
  attemptId: string
  examId: string
  title: string
  /** תאריך הגשה מפורמט (dd.mm.yyyy) */
  submittedAtLabel: string
  questionCount: number
  scorePercent: number
  passed: boolean
  questions: ExamHistoryQuestion[]
}

export interface ProfileViewModel {
  identity: ProfileIdentity
  track: ProfileTrackSummary | null
  stats: ProfileStatTile[]
  radar: PerformanceRadarPoint[]
  examHistory: ExamHistoryEntry[]
}
