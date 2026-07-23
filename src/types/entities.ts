/**
 * טיפוסי הישויות הגלובליים — 19 הישויות של הגיבוי (data/app-backup-2026-06-29.json).
 * שמות השדות לפי הדאטה האמיתי (מסמך 35 §2.1, §6.1) — לא לפי schema-export.
 * User מוגדר במלואו (קובע-דפוס); שאר הישויות מתחילות מ-BaseEntity ומועשרות
 * בשלב ה-feature שלהן, אחרי קריאת ההגדרה ב-SRS (כלל CLAUDE.md 6.3).
 */
import type {
  ContentStatus,
  DifficultyLevel,
  EditorVersion,
  EvaluationDecision,
  ExamAttemptStatus,
  ExamContextType,
  ExamType,
  FeedbackPolicy,
  InviteStatus,
  InviteType,
  NotificationPriority,
  NotificationType,
  ProcedureContentType,
  ProcedureStatus,
  ProgressType,
  QuestionType,
  RequestedRole,
  RoleUpgradeStatus,
  SecurityAttemptType,
  SecurityLogStatus,
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
 * מטא-דאטת מחיקה רכה (soft-delete) — משותפת לכל הישויות ה"ניתנות-למחיקה"
 * (נהלים/שיעורים/מונחים/תסריטי-שיחה). `deleted_at != null` הוא הסמן האחיד
 * ל"נמצא בפח האשפה" (בלתי-תלוי ב-status, כי TroubleshootingFlow חסר status).
 * מקור: DDL — עמודות deleted_at/deleted_by/deleted_by_name/deletion_reason.
 */
export interface DeletionAudit {
  /** חותמת-מחיקה — הסמן האחיד לפח האשפה (null = חי). */
  deleted_at?: string | null
  /** מי מחק (audit). */
  deleted_by_id?: string | null
  /** snapshot שם המוחק (audit). */
  deleted_by_name?: string | null
  /** סיבת המחיקה (audit — חובה בעת מחיקה). */
  deletion_reason?: string | null
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

/**
 * מבנה ארגוני (SRS §1.11 — שורה תקציר בלבד, אין נתונים בגיבוי). היררכי דרך
 * `parent_id`; אין FK מ-User — שיוך חבר/מנהל-מחלקה נעשה לפי התאמת-שם מול
 * `User.department`/`User.managed_department` (השדות היחידים שקיימים על
 * User, ראו הערה שם) — לא לפי `id`. מספר-חברים לא מאוחסן כאן; נגזר בזמן-אמת
 * (userManagement feature, doc 26) כדי שלא יתיישן.
 */
export interface Department extends BaseEntity {
  name: string
  parent_id?: string | null
  order_index?: number | null
  description?: string | null
}

// ── היררכיית הלמידה (SRS §1.2) — הורחב בשלב 3.1 (learning catalog + track
//    details) מעבר לשדות מנוע-ההתקדמות של Phase 1 ─────────────────────────
export interface LearningTrack extends BaseEntity {
  title?: string | null
  /** קבוצת-היעד — המכנה נקבע לפי category == user.department */
  category?: string | null
  description?: string | null
  difficulty_level?: DifficultyLevel | null
  estimated_hours?: number | null
  image_url?: string | null
  /** צבע-מבטא להתאמת הכרטיס למחלקה (TrackCard) */
  color?: string | null
  status?: ContentStatus | null
  /** SRS §1.2 — סדר תצוגה בעץ התוכן (ContentManager, doc 12). */
  order_index?: number | null
}

export interface SharedModule extends BaseEntity {
  title?: string | null
  description?: string | null
  estimated_duration?: number | null
  status?: ContentStatus | null
}

export interface TrackModule extends BaseEntity {
  track_id: string
  /**
   * SRS §1.2 מסמן חובה, אך רשומה אחת בגיבוי האמיתי (id=689c9b9431a6c2c373ad390a)
   * חסרה את השדה לגמרי ובמקומו נושאת שדות של SharedModule (title/description/
   * estimated_duration/status) — כפילות-נתונים ב-Base44, לא תקלת-ייבוא.
   * נשאר nullish כאן כדי לשקף את המציאות; רשומות כאלה מסוננות בשכבת
   * ה-assembly (trackDetailsService), לא ב-type/schema.
   */
  shared_module_id?: string | null
  order_index?: number | null
}

export interface Topic extends BaseEntity {
  shared_module_id: string
  title?: string | null
  description?: string | null
  order_index?: number | null
  status?: ContentStatus | null
}

/** תצוגה/נראות ברמת-בלוק (SRS §1.2.1) — שני השדות עלולים להיות null ישירות, לא אובייקט עם שדות null */
export interface BlockStyling {
  backgroundColor?: string | null
  textColor?: string | null
  fontSize?: string | null
  alignment?: 'left' | 'center' | 'right' | 'justify' | null
  padding?: string | null
  margin?: string | null
}

export interface BlockVisibility {
  hidden?: boolean | null
  conditional?: Record<string, unknown> | null
}

/**
 * מעטפת-בלוק גנרית v2 (SRS §1.2.1). `data` נשאר גמיש כאן במכוון — הצורות
 * המדויקות ל-26 הסוגים (שסוטות מטבלאות מסמכים 20-23 מול הדאטה האמיתי) חיות
 * ב-src/features/lessonPlayer/blockSchemas.ts, לא בשכבת הטיפוסים הגלובלית.
 */
export interface LessonBlockEnvelope {
  id: string
  type: string
  order_index: number
  data: Record<string, unknown>
  styling?: BlockStyling | null
  visibility?: BlockVisibility | null
}

export interface ModuleLesson extends BaseEntity, DeletionAudit {
  /** 9 רשומות בגיבוי האמיתי חסרות topic_id (שיעורים יתומים) — ראו הערה ב-TrackModule */
  topic_id?: string | null
  title?: string | null
  introduction_text?: string | null
  learning_objectives?: string[] | null
  duration_minutes?: number | null
  order_index?: number | null
  /** אכיפת-רצף — doc 04 */
  require_previous_lesson?: boolean | null
  xp_reward?: number | null
  linked_exam_id?: string | null
  /** רק 'published' נספר במכנה של avg_progress */
  status?: ContentStatus | null
  /** קובע renderer — v1 (pages, legacy) אינו נתמך בנגן (מסמך 19); def v1 */
  editor_version?: EditorVersion | null
  /** תוכן v2 בלבד — 13/89 שיעורים אמיתיים חסרים editor_version/blocks (legacy v1) */
  blocks?: LessonBlockEnvelope[] | null
}

export type ModuleExam = BaseEntity

/**
 * גרסת-שיעור (SRS §1.2 LessonVersion) — snapshot מלא של השיעור בנקודת-זמן,
 * נוצר בשמירה ידנית מעורך השיעורים (שלב 6.2). `data` מחזיק את מצב השיעור
 * (בעיקר blocks[]) כפי שהיה. אין רשומות בגיבוי Base44 — נוצר קדימה בלבד.
 */
export interface LessonVersion extends BaseEntity {
  lesson_id: string
  version_number: number
  description?: string | null
  data: LessonVersionSnapshot
  created_by_email?: string | null
  created_by_name?: string | null
}

/** ה-snapshot ששמור על LessonVersion.data — תת-קבוצה של שדות ModuleLesson. */
export interface LessonVersionSnapshot {
  title?: string | null
  introduction_text?: string | null
  learning_objectives?: string[] | null
  duration_minutes?: number | null
  xp_reward?: number | null
  require_previous_lesson?: boolean | null
  linked_exam_id?: string | null
  status?: ContentStatus | null
  blocks: LessonBlockEnvelope[]
}

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
/** פריט-שאלה של סוג order_sequence — סדר ה-array הוא הסדר הנכון (SRS §1.4). */
export interface OrderSequenceItem {
  id: string
  text: string
}

/**
 * מאגר-שאלות (SRS §1.4). 4 סוגים מתועדים ב-SRS/עיצוב, אך 'matching' חסר לגמרי
 * מהדאטה האמיתי (0 מתוך 317) ומ-QUESTION_TYPES בקוד — לא ממומש (שלב ה-ExamPlayer,
 * 2026-07-11: הוחלט במפורש לדלג עליו, לא לבנות לתרחיש שאין לו נתון אמיתי אחד).
 */
export interface Question extends BaseEntity {
  title?: string | null
  question_text: string
  question_type: QuestionType
  category: string
  topic_tags?: string[] | null
  difficulty_level?: DifficultyLevel | null
  /** רלוונטי ל-multiple_choice/true_false בלבד */
  options?: string[] | null
  correct_answer_index?: number | null
  /** רלוונטי ל-order_sequence בלבד */
  order_items?: OrderSequenceItem[] | null
  explanation?: string | null
  points?: number | null
  usage_count?: number | null
  success_rate?: number | null
  status?: ContentStatus | null
}

/** הפניה למאגר-השאלות בתוך מבחן — לא עותק, לפי question_id (SRS §1.4). */
export interface ExamQuestionRef {
  question_id: string
  order_index: number
  points?: number | null
}

/** מבחן (SRS §1.4, 35 שדות בדאטה). הורחב משדות מנוע-ההתקדמות בשלב ה-ExamPlayer. */
export interface Exam extends BaseEntity {
  exam_id: string
  title?: string | null
  description?: string | null
  category?: string | null
  topic_tags?: string[] | null
  difficulty_level?: DifficultyLevel | null
  exam_type?: ExamType | null
  /** מבחני כניסה למועמדים — מחוץ למדדי ההתקדמות של עובדים */
  is_entrance_exam?: boolean | null
  target_roles?: UserRole[] | null
  target_departments?: string[] | null
  /** עוגן-ההקשר: מבחן-שיעור/נושא נספר במכנה "מבחנים במסלול"; none — לא */
  context_type?: ExamContextType | null
  context_id?: string | null
  linked_track_id?: string | null
  linked_module_id?: string | null
  linked_topic_id?: string | null
  linked_lesson_id?: string | null
  linked_entity_id?: string | null
  questions?: ExamQuestionRef[] | null
  time_limit_minutes?: number | null
  passing_score?: number | null
  max_attempts?: number | null
  shuffle_questions?: boolean | null
  shuffle_answers?: boolean | null
  feedback_policy?: FeedbackPolicy | null
  show_results_immediately?: boolean | null
  show_score_on_completion?: boolean | null
  show_correct_answers?: boolean | null
  status?: ContentStatus | null
  usage_count?: number | null
  average_score?: number | null
}

/** תוצאת-שאלה מפורטת בתוך ExamAttempt.detailed_results (SRS §1.4). */
export interface ExamDetailedResultQuestion {
  question_id: string
  user_answer?: unknown
  correct_answer?: unknown
  is_correct: boolean
  points_earned: number
  max_points: number
}

export interface ExamDetailedResults {
  questions: ExamDetailedResultQuestion[]
}

/**
 * ניסיון-בחינה של עובד רשום (SRS §1.4). question_order/answer_orders הם *תוצאת*
 * הערבוב (לא רק ה-seed) — מחושבים פעם אחת ביצירת הניסיון ומשוחזרים מהם תמיד,
 * לא מחושבים מחדש (כדי לשמר seed עקבי גם אחרי רענון/resume — ראו shuffle.ts).
 */
export interface ExamAttempt extends BaseEntity {
  exam_id: string
  user_id: string
  attempt_number: number
  seed?: number | null
  question_order?: string[] | null
  answer_orders?: Record<string, number[]> | null
  current_index?: number | null
  /** question_id -> תשובת המשתמש (number ל-multiple_choice/true_false, string[] ל-order_sequence) */
  user_answers?: Record<string, unknown> | null
  score?: number | null
  status?: ExamAttemptStatus | null
  started_at?: string | null
  submitted_at?: string | null
  time_spent_seconds?: number | null
  passed?: boolean | null
  feedback_shown?: boolean | null
  detailed_results?: ExamDetailedResults | null
}
/** קישור חיצוני על מונח — SRS §1.9 `external_links(array: {title,url})`. */
export interface ConceptExternalLink {
  title: string
  url: string
}

/**
 * מונח (KMS, שלב 6.8) — SRS §1.9 + `schema/DDL_mysql.sql` (טבלת `concepts`).
 * שים לב לשני דיוקים שנגזרים מהדאטה האמיתי ומה-DDL, ולא מהעיצוב:
 * - `related_terms` הוא מערך **תוויות עבריות לתצוגה** ("גלאי עשן"), לא מזהי-ישות
 *   (RELATIONSHIPS.md: "stays JSON by data reality").
 * - `related_lessons` מכיל מזהי ModuleLesson בלבד — ה-junction `concept_lessons`.
 *   אין קישור פולימורפי לתסריטים/נהלים; זו הצעת-הרחבה במסמך 17 שטרם אושרה.
 */
export interface Concept extends BaseEntity, DeletionAudit {
  term: string
  short_description: string
  /** HTML — עובר sanitizeRichText לפני רינדור (CLAUDE.md §5). */
  full_description: string
  category: string
  difficulty_level?: DifficultyLevel | null
  status?: ContentStatus | null
  image_url?: string | null
  synonyms?: string[] | null
  related_terms?: string[] | null
  examples?: string[] | null
  external_links?: ConceptExternalLink[] | null
  view_count?: number | null
  created_by_name?: string | null
  /** מזהי ModuleLesson (junction concept_lessons) — ריק בגיבוי, מוכן בסכמה. */
  related_lessons?: string[] | null
}

/**
 * תסריט-שיחה / תרשים-פתרון-תקלות ("Playbook", SRS §1.8, DDL
 * `troubleshooting_flows`). שדות-הכרטיס של ספריית ה-Playbooks (מסמך 05) —
 * loose ואופציונליים כמו שאר הישויות. `flow_data` (הגרף עצמו, §1.8.1) נשאר
 * `unknown` עד שלב העורך (7.2). אין `status` — הישות משתמשת ב-`is_published`,
 * ולכן `deleted_at` (מ-DeletionAudit) הוא סמן-המחיקה-הרכה.
 */
export interface TroubleshootingFlow extends BaseEntity, DeletionAudit {
  title?: string | null
  description?: string | null
  category?: string | null
  difficulty_level?: string | null
  tags?: string[] | null
  usage_count?: number | null
  success_rate?: number | null
  /** דקות */
  avg_completion_time?: number | null
  is_published?: boolean | null
  /** `{ nodes[], connections[] }` — מבנה מלא ב-SRS §1.8.1, נטען בעורך (שלב 7.2). */
  flow_data?: unknown
}

/**
 * שיחת-שירות מתועדת (SRS §1.8 `TroubleshootingSession`). כשלא נמצא Playbook
 * מתאים, `missing_flow=true` מסמן פער לטיפול בלשונית "תסריטים חסרים" (מסמך 05
 * §4.1). `handled` מסמן שהטיפול הושלם. אין שדות-חובה.
 */
export interface TroubleshootingSession extends BaseEntity {
  agent_name?: string | null
  phone_number?: string | null
  missing_flow?: boolean | null
  missing_flow_description?: string | null
  duration_minutes?: number | null
  solution_found?: boolean | null
  handled?: boolean | null
  flow_id?: string | null
}

/** SRS §1.7 `Invite.metadata` — שדות תצפיתיים בגיבוי האמיתי, לא סכמה נעולה. */
export interface InviteMetadata {
  created_by?: string | null
  invitation_sent_at?: string | null
  selected_exam_id?: string | null
  assigned_track_id?: string | null
}

/**
 * הזמנה (SRS §1.7, גיוס+ניהול-משתמשים). שמות השדות לפי הדאטה האמיתי
 * (56 רשומות, מסמך 26). `token` הוא legacy base64 — הזרימה החדשה
 * (generateInviteToken, userManagement feature) שומרת `token_hash` בלבד
 * ומחזירה את הטוקן הגולמי פעם אחת ב-magic_link, לעולם לא ב-DB (CLAUDE.md §5).
 */
export interface Invite extends BaseEntity {
  email: string
  department?: string | null
  /** חסר ב-23/56 רשומות אמיתיות (הזמנות-מועמד מלפני הוספת השדה) — nullish בכוונה */
  type?: InviteType | null
  requested_role?: RequestedRole | null
  /** התפקיד שייקבע בקליטה */
  target_system_role?: UserRole | null
  require_assessment?: boolean | null
  candidate_full_name?: string | null
  exam_id?: string | null
  assigned_track_id?: string | null
  status?: InviteStatus | null
  /** nonce ייחודי (UUID) */
  jti: string
  token?: string | null
  /** SHA-256 — היחיד שנשמר בזרימה החדשה */
  token_hash?: string | null
  token_expires_at?: string | null
  token_used_at?: string | null
  magic_link_opened_at?: string | null
  assessment_completed_at?: string | null
  last_sent_at?: string | null
  resend_count?: number | null
  invited_by_user_id?: string | null
  invited_by_user_email?: string | null
  notes?: string | null
  decision_notes?: string | null
  decision_made_by?: string | null
  decision_made_at?: string | null
  metadata?: InviteMetadata | null
  is_sample?: boolean | null
}

/**
 * התראה (SRS §1.11 — אין רשומות בגיבוי, "אין עדיין ישות התראות" לפי הערת
 * TopBar.tsx). נכתבת לראשונה ע"י userManagement feature (שליחת-הודעה/מבחן-כניסה).
 */
export interface Notification extends BaseEntity {
  user_id: string
  type: NotificationType
  title: string
  message: string
  priority?: NotificationPriority | null
  is_read?: boolean | null
  link?: string | null
  dedupe_key?: string | null
  metadata?: Record<string, unknown> | null
}

/** פריט-תשובה בפירוט מבחן-הכניסה (SRS §1.4 `answers.questions[]`, מהדאטה האמיתי). */
export interface CandidateAnswerItem {
  question_id: string
  question_text: string
  user_answer?: string | null
  correct_answer?: string | null
  is_correct?: boolean | null
  points_earned?: number | null
  max_points?: number | null
}

/** פירוט התשובות של הגשת-מועמד — המבנה האמיתי הוא `{ questions: [...] }`. */
export interface CandidateAnswers {
  questions: CandidateAnswerItem[]
}

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
  /** פירוט per-שאלה (נכון/שגוי, ניקוד) — לקריאת הבודק (Phase 8.3). */
  answers?: CandidateAnswers | null
  evaluation_decision?: EvaluationDecision | null
  evaluation_date?: string | null
  evaluator_notes?: string | null
  ai_summary?: string | null
  /** מקושר רק אחרי קליטה — המועמד עדיין לא משתמש בעת ההגשה */
  user_id?: string | null
}
/**
 * בקשת שדרוג-תפקיד של משתמש קיים (SRS §1.11, מסמך 35 — 2 רשומות אמיתיות).
 * שדות-התפקיד הם מחרוזות: ערכי-הדאטה כוללים `system_admin` שאינו ב-USER_ROLES,
 * ולכן לא מוקלדים כ-UserRole (ראו roleUpgradeRoleLabel ב-recruitment/constants).
 */
export interface RoleUpgradeRequest extends BaseEntity {
  user_id: string
  user_email: string
  user_name: string
  requested_role: string
  current_role: string
  department?: string | null
  justification?: string | null
  status?: RoleUpgradeStatus | null
  reviewed_by?: string | null
  reviewed_at?: string | null
  review_notes?: string | null
}
/**
 * הגדרת-מערכת גנרית — key/value(JSON)/description (SRS §1.11, systemSettings
 * feature, מסמך 16). מפתחות ידועים (מסמך 16): `email_whitelist` (אמיתי,
 * ראו services/emailWhitelistService.ts), ו-`ip_whitelist`/`security_policy`/
 * `branding`/`learning_defaults`/`pdf_export_defaults` (חדשים, נכתבים ע"י
 * systemSettings — אין להם רשומה בגיבוי).
 */
export interface AppSetting extends BaseEntity {
  key: string
  value: Record<string, unknown>
  description?: string | null
}

/**
 * לוג-אבטחה (SRS §1.11) — אין רשומות בגיבוי; נכתב לראשונה ע"י
 * mockAuthProvider (התחברות אמיתית בפועל) ו-systemSettings (תצוגה/סינון).
 */
export interface SecurityLog extends BaseEntity {
  email: string
  ip_address?: string | null
  user_agent?: string | null
  attempt_type: SecurityAttemptType
  status: SecurityLogStatus
  path?: string | null
  details?: string | null
  metadata?: Record<string, unknown> | null
}
export type WizardConfig = BaseEntity
export type Course = BaseEntity
export type KnowledgeArticle = BaseEntity

/** סוג נכס מדיה — נגזר מ-file_type בעת ההעלאה (Media Library, מסמך 15). */
export type MediaFileType = 'image' | 'gif' | 'video' | 'pdf'

/** הפניה בודדת ל"היכן בשימוש" — denormalized. מעקב-השימוש החי + ה-backfill
 *  של URLs גולמיים קיימים הם שלב נפרד (handoff מסמך 15); כאן נשמר as-is. */
export interface MediaUsageRef {
  /** סוג הישות המפנה — קובע את אייקון/צבע ההפניה */
  ref_type: 'question' | 'exam' | 'module' | 'track' | 'lesson'
  /** הכיתוב המוצג ("שאלה Q-152 · מאגר השאלות") */
  label: string
  /** מזהה הישות המפנה (לניווט עתידי) */
  ref_id?: string | null
}

/**
 * נכס מדיה בספריית ה-DAM המרכזית (מסמך 15, SRS §1).
 * ליבת ה-SRS: title, file_url, file_type, file_size, tags.
 * הרחבות שמסמך 15 מאשר במפורש (topic/dimensions/thumbnail_url/alt/usage) —
 * אופציונליות. מעלה = created_by_id→User; תאריך העלאה = created_date (BaseEntity).
 */
export interface MediaAsset extends BaseEntity {
  title: string
  file_url: string
  file_type?: MediaFileType | null
  /** גודל בבתים */
  file_size?: number | null
  tags?: string[] | null
  /** נושא/קטגוריה למיון (הרחבת מסמך 15 מעבר ל-SRS §1) */
  topic?: string | null
  /** מימדים לתצוגה: "1920×1080" לתמונה/וידאו, "24 עמ׳" ל-PDF */
  dimensions?: string | null
  thumbnail_url?: string | null
  alt?: string | null
  /** רשימת הפניות "היכן בשימוש" (denormalized — ראו MediaUsageRef) */
  usage?: MediaUsageRef[] | null
}

/**
 * נוהל פנים-ארגוני (SRS §2.6 `Procedure`, DDL `procedures`). מנהל כותב/מפרסם
 * נהלים לעובדים בדרישת "קרא וחתום". מזהה Base44 (ObjectID) נשמר as-is כ-PK.
 *
 * חובה לפי SRS: title, content_type. RLS: read `{}` (כל מאומת רואה published);
 * write admin/manager. `category` נשאר `string` (DDL `VARCHAR(100)` ללא CHECK,
 * כמו Concept) — רשימת-ההיצע לעורך חיה ב-constants של feature הנהלים.
 *
 * ⚠️ שדה `blocks`: מודל-התוכן שנבחר הוא בלוקים (כמו ModuleLesson), אך ה-DDL
 * הנוכחי שומר `content` LONGTEXT HTML בלבד ואין עמודת `blocks`. במצב Mock-first
 * זה נשמר as-is; יש לאשר מול צוות ה-API הארגוני הוספת עמודת `blocks` JSON
 * ל-`procedures` (או סריאליזציה ל-`content`) לקראת Phase 12 (CLAUDE.md §6).
 */
export interface Procedure extends BaseEntity, DeletionAudit {
  title: string
  summary?: string | null
  /** תוכן HTML גולמי (content_type='html') — מסונן לפני רינדור */
  content?: string | null
  content_type: ProcedureContentType
  /** מסמך שהועלה (content_type='file') */
  file_url?: string | null
  category?: string | null
  /** קבוצת-יעד: שמות מחלקות שהנוהל משויך אליהן (targeting config, נשאר JSON) */
  departments?: string[] | null
  /** קבוצת-יעד: מזהי-משתמשים ספציפיים (targeting config, נשאר JSON) */
  assigned_user_ids?: string[] | null
  version?: string | null
  /** האם דרושה חתימת קרא-וחתום מהמשויכים (SRS def true) */
  requires_acknowledgement?: boolean | null
  published_date?: string | null
  status?: ProcedureStatus | null
  /** תוכן מבוסס-בלוקים v2 (מנצל את LessonBlockEnvelope; DDL: `procedures.blocks`) */
  blocks?: LessonBlockEnvelope[] | null
  // מטא-דאטת מחיקה (soft-delete) — מ-DeletionAudit; DDL: deleted_at/deleted_by/…
}

/**
 * אישור קרא-וחתום (SRS §2.6 `ProcedureAcknowledgement`, DDL
 * `procedure_acknowledgements`). רשומת-חתימה אחת פר (נוהל, משתמש) — DDL
 * `UNIQUE(procedure_id, user_id)`. אין רשומות בגיבוי; נכתבת ב-runtime בלבד
 * (המשתמש חותם). RLS read: admin/manager או בעלים; write: בעלים בלבד.
 * user_name/user_email הם snapshot-audit לאי-התכחשות; ip_address לתיעוד.
 */
export interface ProcedureAcknowledgement extends BaseEntity {
  procedure_id: string
  user_id: string
  user_name?: string | null
  user_email?: string | null
  /** חותמת-הזמן של החתימה ("נחתם") */
  acknowledged_at: string
  ip_address?: string | null
}
