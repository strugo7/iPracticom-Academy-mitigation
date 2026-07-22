/**
 * קבועי feature הנהלים — מפות תווית/צבע, רשימת קטגוריות ההיצע לעורך, ומטא-סוג.
 * מקורות: design-export/Policies.dc.html + Policy Editor.dc.html:430.
 */
import type { IconName } from '@/components/ui'
import type { ProcedureStatus } from '@/lib/constants/enums'
import type { PolicyBlockType, PolicyType } from './types'

/**
 * רשימת-ההיצע של קטגוריות הנוהל (Policy Editor.dc.html:430). זו **רשימת
 * היצע ולא חוזה סגור** — ב-DDL `procedures.category` הוא `VARCHAR(100)` ללא
 * CHECK (כמו Concept.category); הגלריה מציגה ומסננת כל ערך שמגיע מה-API.
 */
export const POLICY_CATEGORIES = [
  'בטיחות בעבודה',
  'תפעול',
  'אבטחת מידע',
  'כללי',
  'משאבי אנוש',
] as const

/** מטא-סטטוס לנוהל — Badge (colored pill + text, ללא נקודה — Shira gate #8). */
export const POLICY_STATUS_META: Record<
  ProcedureStatus,
  { label: string; color: 'success' | 'warning' | 'neutral' }
> = {
  published: { label: 'פורסם', color: 'success' },
  draft: { label: 'טיוטה', color: 'warning' },
  archived: { label: 'ארכיון', color: 'neutral' },
  deleted: { label: 'נמחק', color: 'neutral' },
}

/** מטא-סוג — נגזר מ-content_type (design typeMeta): כתוב=Edit, קובץ=File. */
export const POLICY_TYPE_META: Record<
  PolicyType,
  { label: string; icon: IconName }
> = {
  written: { label: 'כתוב', icon: 'Edit' },
  file: { label: 'קובץ', icon: 'File' },
}

/** ספי-צבע למד-המילוי (design meterCol): ≥80% ירוק, ≥50% גרדיאנט, אחרת ענבר. */
export const POLICY_METER_DONE_THRESHOLD = 80

/** פלטת רקע לאווטרים במעקב (design AVB) — נבחרת דטרמיניסטית לפי אינדקס. */
export const AVATAR_PALETTE = [
  '#0075DB',
  '#00857C',
  '#7C4DDA',
  '#E0860B',
  '#2EB4FF',
  '#C94236',
] as const

/** בוחר צבע-אווטר יציב לפי מזהה (hash פשוט → אינדקס בפלטה). */
export function avatarColor(seed: string): string {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) | 0
  }
  return AVATAR_PALETTE[Math.abs(hash) % AVATAR_PALETTE.length] as string
}

/**
 * פלטת הבלוקים בעורך (design palette — 7 סוגים). האייקונים מרגיסטר ה-DS בלבד
 * (109 שמות) — הרגיסטר חסר אייקוני-טקסט ייעודיים, ולכן נבחרו הקרובים ביותר.
 */
export const POLICY_BLOCK_PALETTE: {
  type: PolicyBlockType
  label: string
  icon: IconName
}[] = [
  { type: 'text', label: 'טקסט', icon: 'StickyNoteLine' },
  { type: 'heading', label: 'כותרת', icon: 'Menu' },
  { type: 'list', label: 'רשימה', icon: 'SideMenu' },
  { type: 'image', label: 'תמונה', icon: 'Image' },
  { type: 'table', label: 'טבלה', icon: 'Table' },
  { type: 'pdf', label: 'PDF', icon: 'File' },
  { type: 'separator', label: 'מפריד', icon: 'Minus' },
]

/** מצבי-הסטטוס הזמינים בעורך (Tabs) — schema-faithful: טיוטה/פורסם. */
export const POLICY_EDITOR_STATUS_TABS: {
  id: ProcedureStatus
  label: string
}[] = [
  { id: 'draft', label: 'טיוטה' },
  { id: 'published', label: 'פורסם' },
]
