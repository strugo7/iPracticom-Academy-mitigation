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
export const INVITE_STATUS = [
  'pending',
  'started',
  'test_submitted',
  'completed',
  'hired',
  'expired',
] as const
export type InviteStatus = (typeof INVITE_STATUS)[number]

// סוגי שאלה (Question.question_type) — data.
export const QUESTION_TYPES = [
  'multiple_choice',
  'true_false',
  'order_sequence',
] as const
export type QuestionType = (typeof QUESTION_TYPES)[number]
