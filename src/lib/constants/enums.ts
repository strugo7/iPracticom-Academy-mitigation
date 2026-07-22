/**
 * ערכי enum של הדומיין. מקורות-אמת (לא להמציא):
 * - roles: מסמך 35 §6.2 (בפועל user/admin; instructor/manager נתמכים ב-enum).
 * - block types: מסמך 18 §1 (26 בלוקים, 5 משפחות, v2).
 * - node colors: מסמך 06 §2 + מסמך 05 (שפת צבעי הצמתים ל-Playbook).
 * - status: ערכים אמיתיים מ-data/app-backup-2026-06-29.json.
 */

// ── תפקידים (User.role) ────────────────────────────────────────────────────
// הערה: מנהל בפועל נקבע לפי managed_department מוגדר, לא לפי role (מסמך 35 §6.3).
export const USER_ROLES = ['user', 'instructor', 'manager', 'admin'] as const
export type UserRole = (typeof USER_ROLES)[number]

// ── סוגי בלוקים v2 (26, ב-5 משפחות) — מסמך 18 §1 ──────────────────────────
export const BLOCK_FAMILIES = {
  textStructure: [
    'text',
    'heading',
    'list',
    'quote',
    'note',
    'motivation',
    'separator',
    'divider',
    'page_break',
    'table',
  ],
  media: ['image', 'video', 'pdf', 'lesson_cover'],
  interactive: [
    'flashcard',
    'quiz',
    'labeled_graphic',
    'tabs',
    'graph',
    'interactive_widget',
    'network_canvas',
    'simulator_embed',
  ],
  aiEmbed: ['ai_generated', 'html_embed', 'designed_section', 'gamma_embed'],
} as const

export const BLOCK_TYPES = [
  ...BLOCK_FAMILIES.textStructure,
  ...BLOCK_FAMILIES.media,
  ...BLOCK_FAMILIES.interactive,
  ...BLOCK_FAMILIES.aiEmbed,
] as const
export type BlockType = (typeof BLOCK_TYPES)[number] // 26 ערכים

export const EDITOR_VERSIONS = ['v1', 'v2'] as const
export type EditorVersion = (typeof EDITOR_VERSIONS)[number]

// ── צמתי Playbook (TroubleshootingFlow) — מסמך 06 §2 ──────────────────────
export const PLAYBOOK_NODE_TYPES = [
  'start',
  'question',
  'action',
  'solution',
  'end',
  'linked_flow',
] as const
export type PlaybookNodeType = (typeof PLAYBOOK_NODE_TYPES)[number]

/** צבע לכל סוג צומת — שפה נפרדת מטוקני ה-DS (מסמך 06 §, ננעל במסמך 05). */
export const PLAYBOOK_NODE_COLORS: Record<PlaybookNodeType, string> = {
  start: '#0075DB', // כחול כהה
  question: '#2EB4FF', // כחול מותג
  action: '#F59E0B', // ענבר
  solution: '#22C55E', // ירוק
  end: '#757D86', // אפור
  linked_flow: '#8B5CF6', // סגול
}

// ── סוגי אירועי התקדמות (UserProgress.progress_type) ──────────────────────
// SRS §1.5 + הדאטה האמיתי. lesson_quiz_attempt הוא legacy שקיים בדאטה (4 רשומות)
// ואינו נספר באף מדד (PROGRESS_ENGINE.md §8-ג).
export const PROGRESS_TYPES = [
  'lesson_started',
  'lesson_completed',
  'exam_attempt',
  'exam_passed',
  'module_completed',
  'topic_completed',
  'track_completed',
  'lesson_quiz_attempt',
] as const
export type ProgressType = (typeof PROGRESS_TYPES)[number]

// ── ערכי status אמיתיים (data/app-backup) ─────────────────────────────────
// מחזור-חיים של תוכן (LearningTrack/SharedModule/Topic/ModuleLesson/Question/...).
export const CONTENT_STATUS = [
  'draft',
  'published',
  'archived',
  'deleted',
] as const
export type ContentStatus = (typeof CONTENT_STATUS)[number]

// מחזור-חיים של הזמנה/מועמד (Invite/CandidateAssessment) — אשכול הגיוס.
// 'canceled' מתועד ב-SRS §1.7/PRD §3.3 אך לא הופיע ב-56 הרשומות האמיתיות
// (מדגם קטן) — נדרש בפועל לפעולת "בטל הזמנה" (מסמך 26, userManagement).
export const INVITE_STATUS = [
  'pending',
  'started',
  'test_submitted',
  'completed',
  'hired',
  'expired',
  'canceled',
] as const
export type InviteStatus = (typeof INVITE_STATUS)[number]

// סוג הזמנה (Invite.type) — data: user/candidate (מסמך 26).
export const INVITE_TYPES = ['user', 'candidate'] as const
export type InviteType = (typeof INVITE_TYPES)[number]

// תפקיד מבוקש (Invite.requested_role) — SRS §1.7.
export const REQUESTED_ROLES = ['candidate', 'employee'] as const
export type RequestedRole = (typeof REQUESTED_ROLES)[number]

// סוג התראה (Notification.type) — SRS §1.11. חדשות (userManagement, מסמך 26):
// new_user_created (מבחן-כניסה נשלח), system_alert (הודעת-אדמין חופשית).
export const NOTIFICATION_TYPES = [
  'candidate_assessed',
  'candidate_hired',
  'candidate_rejected',
  'invite_expiring',
  'new_user_created',
  'new_invite_sent',
  'system_alert',
  'lesson_created',
  'course_completed',
  'ai_lesson_ready',
  'ai_lesson_failed',
  'exam_failed',
  'track_deadline_approaching',
  'new_learning_content',
] as const
export type NotificationType = (typeof NOTIFICATION_TYPES)[number]

// עדיפות התראה (Notification.priority) — SRS §1.11, def medium.
export const NOTIFICATION_PRIORITIES = ['low', 'medium', 'high'] as const
export type NotificationPriority = (typeof NOTIFICATION_PRIORITIES)[number]

// סוג-ניסיון של SecurityLog — SRS §1.11 (systemSettings, מסמך 16).
export const SECURITY_ATTEMPT_TYPES = [
  'unauthorized_domain_login',
  'two_factor_failed',
  'whitelist_denied',
  'user_login',
  'rate_limit_exceeded',
  'other',
] as const
export type SecurityAttemptType = (typeof SECURITY_ATTEMPT_TYPES)[number]

// סטטוס SecurityLog — SRS §1.11, def blocked.
export const SECURITY_LOG_STATUSES = ['blocked', 'success', 'error'] as const
export type SecurityLogStatus = (typeof SECURITY_LOG_STATUSES)[number]

// עוגן-ההקשר של מבחן (Exam.context_type) — data: lesson(11)/topic(2)/none(4).
export const EXAM_CONTEXT_TYPES = ['lesson', 'topic', 'none'] as const
export type ExamContextType = (typeof EXAM_CONTEXT_TYPES)[number]

// סוג מבחן (Exam.exam_type) — SRS §1.4 + data (lesson_exam/standalone_exam/topic_exam).
export const EXAM_TYPES = [
  'track_exam',
  'module_exam',
  'topic_exam',
  'lesson_exam',
  'standalone_exam',
] as const
export type ExamType = (typeof EXAM_TYPES)[number]

// מדיניות משוב (Exam.feedback_policy) — SRS §1.4; null בחלק מהדאטה האמיתי.
export const FEEDBACK_POLICIES = ['immediate', 'none'] as const
export type FeedbackPolicy = (typeof FEEDBACK_POLICIES)[number]

// מחזור-חיים של ניסיון-מבחן (ExamAttempt.status) — SRS §1.4. אין ערך 'submitted'
// (פישוט של מסמך 14 בלבד) — auto-submit בתפוגת הטיימר הוא 'timed_out', לא 'completed'.
export const EXAM_ATTEMPT_STATUSES = [
  'in_progress',
  'completed',
  'abandoned',
  'timed_out',
] as const
export type ExamAttemptStatus = (typeof EXAM_ATTEMPT_STATUSES)[number]

// החלטת הערכה על מועמד (CandidateAssessment.evaluation_decision) — SRS §1.4.
export const EVALUATION_DECISIONS = [
  'pending_review',
  'approved',
  'rejected',
  'requires_interview',
] as const
export type EvaluationDecision = (typeof EVALUATION_DECISIONS)[number]

// מצב בקשת שדרוג-תפקיד (RoleUpgradeRequest.status) — SRS §1.11, def pending.
export const ROLE_UPGRADE_STATUSES = [
  'pending',
  'approved',
  'rejected',
] as const
export type RoleUpgradeStatus = (typeof ROLE_UPGRADE_STATUSES)[number]

// סוגי שאלה (Question.question_type) — data.
export const QUESTION_TYPES = [
  'multiple_choice',
  'true_false',
  'order_sequence',
] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]

// רמת קושי (LearningTrack.difficulty_level) — SRS §1.2, def 'beginner'.
export const DIFFICULTY_LEVELS = [
  'beginner',
  'intermediate',
  'advanced',
] as const
export type DifficultyLevel = (typeof DIFFICULTY_LEVELS)[number]

// סוגי נכסי מדיה (MediaAsset.file_type) — ספריית המדיה, מסמך 15.
export const MEDIA_FILE_TYPES = ['image', 'gif', 'video', 'pdf'] as const
export type MediaFileTypeEnum = (typeof MEDIA_FILE_TYPES)[number]

/**
 * קטגוריות מונח (Concept.category) — 8 הקטגוריות הקנוניות של SRS §1.9, והיחידות
 * שיש להן אייקון וצבע ב-design-export/Concepts.dc.html.
 *
 * זו **רשימת-ההיצע של העורך, לא חוזה סגור**: ב-DDL העמודה היא `VARCHAR(100)`
 * ללא CHECK, ובדאטה האמיתי יש גם קטגוריות-ציוד ("מצלמות אבטחה",
 * "מרכזיות ענן (PBX)") — ה-SRS מתיר אותן ("+ קטגוריות-ציוד"). הגלריה מציגה
 * ומסננת כל ערך שמגיע מה-API, עם מטא ניטרלי לקטגוריה שאינה ברשימה הזו,
 * כדי שאף מונח לא ייעלם. אין להמציא אייקון לקטגוריה שהעיצוב לא הגדיר.
 */
export const CONCEPT_CATEGORIES = [
  'רשתות',
  'אבטחה',
  'חומרה',
  'תוכנה',
  'פרוטוקולים',
  'שירותים',
  'כללי',
  'ארגוני',
] as const
export type ConceptCategory = (typeof CONCEPT_CATEGORIES)[number]

// ── נהלים (Procedure) — SRS §2.6, טבלת `procedures` ב-DDL ────────────────────
// מחזור-חיים של נוהל (Procedure.status) — DDL CHECK IN(draft/published/archived/
// deleted), SRS def 'draft'. משתמש רגיל רואה 'published' בלבד (API_CONTRACT §).
export const PROCEDURE_STATUS = [
  'draft',
  'published',
  'archived',
  'deleted',
] as const
export type ProcedureStatus = (typeof PROCEDURE_STATUS)[number]

// סוג-תוכן של נוהל (Procedure.content_type) — DDL CHECK IN(html/file), def 'html'.
// 'html' → בלוקים/HTML נערכים בעורך; 'file' → מסמך שהועלה (file_url).
export const PROCEDURE_CONTENT_TYPES = ['html', 'file'] as const
export type ProcedureContentType = (typeof PROCEDURE_CONTENT_TYPES)[number]
