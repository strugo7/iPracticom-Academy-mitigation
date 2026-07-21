/**
 * קבועי feature הגיוס (Phase 8, מסמך 35). מקור-אמת יחיד לתוויות הטאבים
 * ולמפתחותיהם — לא משוכפל בקומפוננטות (CLAUDE.md §4).
 */
import type { TabItem } from '@/components/ui'
import type {
  EvaluationDecision,
  InviteStatus,
  RoleUpgradeStatus,
} from '@/lib/constants/enums'
import type { BadgeColor } from '@/lib/constants/invites'
import type { InviteAudience } from './types'

/** מפתחות שלושת הטאבים של קונסולת-הגיוס. */
export const RECRUITMENT_TAB_KEYS = ['candidates', 'assessments', 'roleUpgrades'] as const
export type RecruitmentTabKey = (typeof RECRUITMENT_TAB_KEYS)[number]

/** הגדרות הטאבים (סדר-תצוגה) — נצרך ע"י RecruitmentWorkspace. */
export const RECRUITMENT_TABS: TabItem[] = [
  { id: 'candidates', label: 'מועמדים' },
  { id: 'assessments', label: 'הערכות' },
  { id: 'roleUpgrades', label: 'בקשות שדרוג' },
]

/**
 * סדר שלבי-הצינור (pipeline) לפי מחזור-החיים של Invite.status (SRS §1.7):
 * ממתינה → התחילה → מבחן הוגש → הושלמה → התקבל/ה, ואז השלבים הסופיים.
 * נצרך למסנן-השלבים ולספירות בטאב המועמדים.
 */
export const PIPELINE_STATUS_ORDER: InviteStatus[] = [
  'pending',
  'started',
  'test_submitted',
  'completed',
  'hired',
  'expired',
  'canceled',
]

/** מטא-דאטה של החלטת-הערכה (CandidateAssessment.evaluation_decision — SRS §1.4). */
export const EVALUATION_DECISION_META: Record<
  EvaluationDecision,
  { label: string; badgeColor: BadgeColor }
> = {
  pending_review: { label: 'ממתין לבדיקה', badgeColor: 'warning' },
  approved: { label: 'אושר', badgeColor: 'success' },
  rejected: { label: 'נדחה', badgeColor: 'caution' },
  requires_interview: { label: 'לראיון', badgeColor: 'accent' },
}

/** סדר-תצוגה של החלטות (מסנן + ספירות בטאב ההערכות). */
export const EVALUATION_DECISION_ORDER: EvaluationDecision[] = [
  'pending_review',
  'approved',
  'rejected',
  'requires_interview',
]

/** ההחלטות הניתנות-לבחירה בפעולת-מנהל (ללא pending_review — מצב-פתיחה בלבד). */
export const DECIDABLE_DECISIONS: Exclude<EvaluationDecision, 'pending_review'>[] = [
  'approved',
  'requires_interview',
  'rejected',
]

/** סף-מעבר לצביעת הציון (SRS learning_defaults.passing_score, def 70). */
export const SCORE_PASS_THRESHOLD = 70

/** מטא-דאטה של מצב בקשת שדרוג-תפקיד (RoleUpgradeRequest.status — SRS §1.11). */
export const ROLE_UPGRADE_STATUS_META: Record<
  RoleUpgradeStatus,
  { label: string; badgeColor: BadgeColor }
> = {
  pending: { label: 'ממתינה', badgeColor: 'warning' },
  approved: { label: 'אושרה', badgeColor: 'success' },
  rejected: { label: 'נדחתה', badgeColor: 'caution' },
}

export const ROLE_UPGRADE_STATUS_ORDER: RoleUpgradeStatus[] = [
  'pending',
  'approved',
  'rejected',
]

/**
 * תוויות עבריות לערכי-התפקיד בבקשות-שדרוג. הערכים אינם USER_ROLES (כוללים
 * `system_admin`), ולכן מפה ייעודית עם נפילה-לערך-הגולמי לערכים לא-מוכרים.
 */
const ROLE_UPGRADE_ROLE_LABELS: Record<string, string> = {
  user: 'משתמש',
  instructor: 'מדריך',
  manager: 'מנהל',
  admin: 'אדמין',
  system_admin: 'מנהל מערכת',
}

export function roleUpgradeRoleLabel(role: string): string {
  return ROLE_UPGRADE_ROLE_LABELS[role] ?? role
}

/**
 * צעדי דף-נחיתת-ההזמנה לפי קהל (Welcome Invite.dc.html — STEPS). מקור-אמת יחיד
 * לתוכן, לא משוכפל בקומפוננטה.
 */
export const WELCOME_STEPS: Record<InviteAudience, { title: string; text: string }[]> = {
  candidate: [
    {
      title: 'אשרו את ההזמנה',
      text: 'לחיצה אחת על הכפתור מאמתת את כתובת המייל שלכם ופותחת את התהליך.',
    },
    {
      title: 'עברו מבחן כניסה (כ-20 דק׳)',
      text: 'מבחן קצר בתחום התפקיד. התשובות נשלחות ישירות לצוות הגיוס.',
    },
  ],
  employee: [
    {
      title: 'אשרו את ההזמנה',
      text: 'לחיצה אחת על הכפתור מאמתת את כתובת המייל שלכם ופותחת את החשבון.',
    },
    {
      title: 'התחילו את מסלול ההכשרה שלכם',
      text: 'המערכת תוביל אתכם צעד-אחר-צעד לפי המחלקה שלכם.',
    },
  ],
}

export function welcomeSubtitle(audience: InviteAudience, department: string): string {
  return audience === 'candidate'
    ? `הוזמנת להצטרף כמועמד/ת לתפקיד במחלקת ${department} ב-iPracticom. שמחים שהגעת עד לכאן!`
    : `הוזמנת להצטרף כעובד/ת חדש/ה במחלקת ${department} ב-iPracticom. מתרגשים לצאת איתך לדרך!`
}
