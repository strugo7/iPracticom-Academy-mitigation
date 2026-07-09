/**
 * טיפוסי הישויות הגלובליים — 19 הישויות של הגיבוי (data/app-backup-2026-06-29.json).
 * שמות השדות לפי הדאטה האמיתי (מסמך 35 §2.1, §6.1) — לא לפי schema-export.
 * User מוגדר במלואו (קובע-דפוס); שאר הישויות מתחילות מ-BaseEntity ומועשרות
 * בשלב ה-feature שלהן, אחרי קריאת ההגדרה ב-SRS (כלל CLAUDE.md 6.3).
 */
import type { UserRole } from '@/lib/constants/enums'

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

// ── שאר הישויות — בסיס בלבד; מוחלפות בהגדרה מלאה בשלב ה-feature שלהן ───────
export type LearningTrack = BaseEntity
export type SharedModule = BaseEntity
export type TrackModule = BaseEntity
export type Topic = BaseEntity
export type ModuleLesson = BaseEntity
export type ModuleExam = BaseEntity
export type UserProgress = BaseEntity
export type Exam = BaseEntity
export type Question = BaseEntity
export type Concept = BaseEntity
export type TroubleshootingFlow = BaseEntity
export type Invite = BaseEntity
export type CandidateAssessment = BaseEntity
export type RoleUpgradeRequest = BaseEntity
export type AppSetting = BaseEntity
export type WizardConfig = BaseEntity
export type Course = BaseEntity
export type KnowledgeArticle = BaseEntity
