/**
 * טיפוסי ה-view-model של feature הנהלים (policies). לא ישויות גולמיות —
 * הרשומות הגולמיות (Procedure/ProcedureAcknowledgement) מגיעות מ-@/types/entities;
 * כאן חיים המודלים המורכבים שהשירותים מרכיבים עבור ה-UI.
 */
import type {
  ProcedureContentType,
  ProcedureStatus,
} from '@/lib/constants/enums'
import type { LessonBlockEnvelope } from '@/types/entities'

/** שני מצבי העמוד — ספריית הנהלים ומעקב קרא-וחתום (design-export/Policies.dc.html). */
export const POLICIES_VIEW = {
  library: 'library',
  tracking: 'tracking',
} as const
export type PoliciesView = (typeof POLICIES_VIEW)[keyof typeof POLICIES_VIEW]

/** סוג התוכן כפי שמוצג בגלריה — נגזר מ-Procedure.content_type. */
export type PolicyType = 'written' | 'file'

/** מצב הפילטרים של הגלריה (מעל useSearchParams בהמשך; כרגע state מקומי). */
export interface PolicyFilters {
  search: string
  category: string | null
  status: ProcedureStatus | null
  /** צ'יפ "קרא וחתום" — true מציג רק נהלים הדורשים אישור. */
  ackOnly: boolean
  department: string | null
}

export const EMPTY_POLICY_FILTERS: PolicyFilters = {
  search: '',
  category: null,
  status: null,
  ackOnly: false,
  department: null,
}

/** שורת-נוהל מורכבת לתצוגה בגלריה (design-export/Policies.dc.html, library). */
export interface PolicyListItem {
  id: string
  title: string
  version: string
  /** תיאור קהל-היעד: שם מחלקה יחיד / "N מחלקות" / "כל המחלקות". */
  departmentLabel: string
  category: string
  type: PolicyType
  /** האם הנוהל דורש קרא-וחתום (Procedure.requires_acknowledgement). */
  requiresAck: boolean
  status: ProcedureStatus
  /** כמה מקהל-היעד כבר חתמו. */
  signedCount: number
  /** גודל קהל-היעד (מחלקות + עובדים ספציפיים). */
  audienceCount: number
  /** מד-המילוי: אחוז החתומים מתוך קהל-היעד (0 כשאין קהל-יעד). */
  percent: number
}

/** פריט בתוכן-העניינים של הצפייה בנוהל (design TOC — עוגני-כותרות ממוספרים). */
export interface PolicyTocItem {
  anchor: string
  label: string
  index: number
}

/** סטטוס חתימה של עובד בודד במעקב קרא-וחתום. */
export type EmployeeSignStatus = 'signed' | 'pending'

/** צ'יפ הסגמנט במעקב "פילוח לפי עובד" (design ackFilters). */
export type TrackingEmployeeFilter = 'all' | 'signed' | 'pending'

export interface TrackingEmployee {
  userId: string
  name: string
  department: string | null
  status: EmployeeSignStatus
  /** מתי חתם (null אם ממתין). */
  acknowledgedAt: string | null
}

export interface DepartmentBreakdown {
  name: string
  signed: number
  total: number
  percent: number
}

/** סוגי-הבלוקים הנתמכים בעורך הנוהל (קטלוג מצומצם — design palette). */
export type PolicyBlockType =
  'text' | 'heading' | 'list' | 'image' | 'table' | 'separator' | 'pdf'

/** טיוטת-העורך — מצב מקומי הניתן לעריכה, ממופה מ/אל Procedure בשמירה. */
export interface PolicyDraft {
  title: string
  summary: string
  category: string
  version: string
  status: ProcedureStatus
  contentType: ProcedureContentType
  fileUrl: string | null
  requiresAcknowledgement: boolean
  departments: string[]
  assignedUserIds: string[]
  blocks: LessonBlockEnvelope[]
}

/** מודל המעקב המלא לנוהל בודד (design-export/Policies.dc.html, tracking view). */
export interface PolicyTracking {
  procedureId: string
  title: string
  version: string
  departmentLabel: string
  signed: number
  pending: number
  total: number
  percent: number
  byDepartment: DepartmentBreakdown[]
  employees: TrackingEmployee[]
}
