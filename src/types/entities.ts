/**
 * טיפוסי הישויות הגלובליים — 19 הישויות של הגיבוי (data/app-backup-2026-06-29.json).
 * שמות השדות לפי הדאטה האמיתי (מסמך 35 §2.1, §6.1) — לא לפי schema-export.
 * User מוגדר במלואו (קובע-דפוס); שאר הישויות מתחילות מ-BaseEntity ומועשרות
 * בשלב ה-feature שלהן, אחרי קריאת ההגדרה ב-SRS (כלל CLAUDE.md 6.3).
 */
import type {
  ContentStatus,
  EvaluationDecision,
  ExamContextType,
  ProgressType,
  UserRole,
} from '@/lib/constants/enums'

/** שדות משותפים לכל רשומת Base44. המזהים המקוריים (ObjectID) נשמרים as-is. */
export interface BaseEntity {
  id: string
  created_date: string
  updated_date: string
  created_by_id?: string | null
}

/**
 * מטמון התקדמות embedded על User — עלול לסטות מאירועי UserProgress
 * (מסמך 35 §6.4). Phase 1 גוזר התקדמות מהאירועים, לא מכאן.
 */
export type ProgressStatsCache = Record<string, unknown>

/** מסמך 35 §6.1 — שדות User האמיתיים. שדות Base44-פנימיים (§6.5) לא מוטיפסים. */
export interface User extends BaseEntity {
  email: string
  full_name: string
  role: UserRole
  department?: string | null
  /** הרשאת מנהל בפועל = יש managed_department, לא role==='manager' (מסמך 35 §6.3) */
  managed_department?: string | null
  phone?: string | null
  profile_picture_url?: string | null
  is_verified?: boolean | null
  disabled?: boolean | null
  disabled_reason?: string | null
  force_password_reset?: boolean | null
  last_activity_date?: string | null
  last_login?: string | null
  total_xp?: number | null
  current_level?: number | null
  assigned_track_id?: string | null
  onboarding_completed?: boolean | null
  profile_completed?: boolean | null
  entrance_exam_passed?: boolean | null
  entrance_exam_score?: number | null
  progress_stats?: ProgressStatsCache | null
}

// ── היררכיית הלמידה — שדות מנוע-ההתקדמות בלבד (PROGRESS_ENGINE.md §4);
//    יושלמו לסכמה המלאה בשלב ה-feature של הלמידה (SRS §1.2) ────────────────
export interface LearningTrack extends BaseEntity {
  title?: string | null
  status?: ContentStatus | null
  /** קבוצת-היעד — המכנה נקבע לפי category == user.department */
  category?: string | null
}

export type SharedModule = BaseEntity

export interface TrackModule extends BaseEntity {
  track_id: string
  shared_module_id: string
  order_index?: number | null
}

export interface Topic extends BaseEntity {
  shared_module_id: string
  title?: string | null
  status?: ContentStatus | null
}

export interface ModuleLesson extends BaseEntity {
  topic_id: string
  title?: string | null
  /** רק 'published' נספר במכנה של avg_progress */
  status?: ContentStatus | null
}

export type ModuleExam = BaseEntity

/** תשובת-מבחן בתוך אירוע התקדמות (SRS §1.5) */
export interface ProgressExamAnswer {
  question_id: string
  user_answer?: unknown
  is_correct?: boolean
  points_earned?: number
}

/**
 * אירוע התקדמות גולמי (append-only) — מקור האמת היחיד להתקדמות.
 * progress_stats תמיד נגזר מהאירועים האלה, לעולם לא מקודם (PROGRESS_ENGINE.md §1).
 * שמות/נוכחות שדות לפי הדאטה האמיתי: completed_at קיים רק על אירועי השלמה/מבחן.
 */
export interface UserProgress extends BaseEntity {
  user_id: string
  progress_type: ProgressType
  track_id?: string | null
  module_id?: string | null
  topic_id?: string | null
  lesson_id?: string | null
  exam_id?: string | null
  completion_percentage?: number | null
  score?: number | null
  time_spent_minutes?: number | null
  completed_at?: string | null
  exam_answers?: ProgressExamAnswer[] | null
}
/** שדות מנוע-ההתקדמות בלבד (35 שדות בדאטה); הסכמה המלאה בשלב ה-feature של המבחנים */
export interface Exam extends BaseEntity {
  title?: string | null
  status?: ContentStatus | null
  /** עוגן-ההקשר: מבחן-שיעור/נושא נספר במכנה "מבחנים במסלול"; none — לא */
  context_type?: ExamContextType | null
  context_id?: string | null
  /** מבחני כניסה למועמדים — מחוץ למדדי ההתקדמות של עובדים */
  is_entrance_exam?: boolean | null
  passing_score?: number | null
}
export type Question = BaseEntity
export type Concept = BaseEntity
export type TroubleshootingFlow = BaseEntity
export type Invite = BaseEntity

/** הגשת מבחן-כניסה של מועמד — שמות השדות מהדאטה האמיתי (10 רשומות) + SRS §1.4 */
export interface CandidateAssessment extends BaseEntity {
  invite_id: string
  candidate_email: string
  candidate_full_name?: string | null
  department?: string | null
  score: number
  total_questions?: number | null
  correct_answers?: number | null
  time_spent_seconds?: number | null
  submitted_at: string
  attempt_number?: number | null
  is_retake?: boolean | null
  evaluation_decision?: EvaluationDecision | null
  evaluation_date?: string | null
  evaluator_notes?: string | null
  ai_summary?: string | null
  /** מקושר רק אחרי קליטה — המועמד עדיין לא משתמש בעת ההגשה */
  user_id?: string | null
}
export type RoleUpgradeRequest = BaseEntity
export type AppSetting = BaseEntity
export type WizardConfig = BaseEntity
export type Course = BaseEntity
export type KnowledgeArticle = BaseEntity
