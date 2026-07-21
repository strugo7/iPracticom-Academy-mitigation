/**
 * מטא-נתוני התצוגה של מסך המונחים (שלב 6.8, מסמך 17).
 * הצבעים והאייקונים מגיעים 1:1 ממפת `this.CAT` / `this.DIFF` שב-
 * design-export/Concepts.dc.html, ממופים לשמות-הצבע של DS-Badge (אותם זוגות
 * fg/bg בדיוק — ראו colorMap ב-components/ui/Badge.tsx).
 */
import type { ComponentType, SVGProps } from 'react'
import {
  CONCEPT_CATEGORIES,
  type ConceptCategory,
  type ContentStatus,
  type DifficultyLevel,
} from '@/lib/constants/enums'
import {
  GeneralIcon,
  HardwareIcon,
  NetworksIcon,
  OrgIcon,
  ProtocolsIcon,
  SecurityIcon,
  ServicesIcon,
  SoftwareIcon,
} from './conceptIcons'

/** תת-קבוצת צבעי DS-Badge שבשימוש במסך הזה. */
export type ConceptBadgeColor =
  | 'accent'
  | 'caution'
  | 'bronze'
  | 'cobalt'
  | 'success'
  | 'warning'
  | 'neutral'
  | 'indigo'

interface CategoryMeta {
  color: ConceptBadgeColor
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  /** מחלקות רקע+טקסט (אותם זוגות טוקנים של ה-Badge), ונקודת-הצבע של השבב. */
  fg: string
  bg: string
  dot: string
}

const CATEGORY_META: Record<ConceptCategory, CategoryMeta> = {
  רשתות: {
    color: 'accent',
    icon: NetworksIcon,
    fg: 'text-accent',
    bg: 'bg-hues-sky',
    dot: 'bg-accent',
  },
  אבטחה: {
    color: 'caution',
    icon: SecurityIcon,
    fg: 'text-caution',
    bg: 'bg-hues-salmon',
    dot: 'bg-caution',
  },
  חומרה: {
    color: 'bronze',
    icon: HardwareIcon,
    fg: 'text-hues-bronze',
    bg: 'bg-hues-latte/30',
    dot: 'bg-hues-bronze',
  },
  תוכנה: {
    color: 'cobalt',
    icon: SoftwareIcon,
    fg: 'text-hues-cobalt',
    bg: 'bg-hues-sky',
    dot: 'bg-hues-cobalt',
  },
  פרוטוקולים: {
    color: 'success',
    icon: ProtocolsIcon,
    fg: 'text-success',
    bg: 'bg-hues-mint',
    dot: 'bg-success',
  },
  שירותים: {
    color: 'warning',
    icon: ServicesIcon,
    fg: 'text-[#8A6E00]',
    bg: 'bg-hues-yellow/30',
    dot: 'bg-[#8A6E00]',
  },
  כללי: {
    color: 'neutral',
    icon: GeneralIcon,
    fg: 'text-neutrals-lead',
    bg: 'bg-neutrals-silver',
    dot: 'bg-neutrals-lead',
  },
  ארגוני: {
    color: 'indigo',
    icon: OrgIcon,
    fg: 'text-hues-cobalt',
    bg: 'bg-hues-sky/50',
    dot: 'bg-hues-cobalt',
  },
}

/**
 * מטא לקטגוריה כלשהי שמגיעה מה-API. קטגוריות-ציוד ("מצלמות אבטחה") אינן
 * מבין ה-8 של ה-SRS ואין להן אייקון בעיצוב — הן נופלות ל-'כללי' (ניטרלי)
 * במקום שיומצא להן אייקון (CLAUDE.md §6.1: לא ממציאים).
 */
export function categoryMeta(category: string): CategoryMeta {
  return CATEGORY_META[category as ConceptCategory] ?? CATEGORY_META['כללי']
}

/** האם הקטגוריה היא אחת מ-8 הקנוניות (ולכן יש לה אייקון משלה). */
export function isCanonicalCategory(category: string): category is ConceptCategory {
  return (CONCEPT_CATEGORIES as readonly string[]).includes(category)
}

interface LabelMeta {
  label: string
  color: ConceptBadgeColor
}

/** רמת-קושי — התוויות של Concepts.dc.html (מתחילים/בינוני/מתקדם). */
export const DIFFICULTY_META: Record<DifficultyLevel, LabelMeta> = {
  beginner: { label: 'מתחילים', color: 'success' },
  intermediate: { label: 'בינוני', color: 'warning' },
  advanced: { label: 'מתקדם', color: 'caution' },
}

/** סטטוסי-עריכה (ללא 'deleted' — לא ניתן לבחירה בעורך). */
export type EditableConceptStatus = Extract<
  ContentStatus,
  'draft' | 'published' | 'archived'
>

export const STATUS_META: Record<EditableConceptStatus, LabelMeta> = {
  published: { label: 'פורסם', color: 'success' },
  draft: { label: 'טיוטה', color: 'warning' },
  archived: { label: 'בארכיון', color: 'neutral' },
}

export const EDITABLE_STATUSES: EditableConceptStatus[] = [
  'draft',
  'published',
  'archived',
]

/** ברירות-מחדל למונח חדש — SRS §1.9 (difficulty def intermediate, status def draft). */
export const DEFAULT_DIFFICULTY: DifficultyLevel = 'intermediate'
export const DEFAULT_STATUS: EditableConceptStatus = 'draft'
export const DEFAULT_CATEGORY: ConceptCategory = 'כללי'

/** אורך מרבי לתיאור הקצר (design-export/Term Editor: maxlength=140). */
export const SHORT_DESCRIPTION_MAX = 140

/** מספר התגיות (related_terms) שמוצגות על כרטיס לפני "+N". */
export const CARD_TAGS_SHOWN = 3

/** ארבעת שלבי האשף (design-export/Term Editor: STEPPER). */
export const WIZARD_STEPS = [
  { step: 1, label: 'בסיס' },
  { step: 2, label: 'תוכן' },
  { step: 3, label: 'מדיה וקישורים' },
  { step: 4, label: 'קשרים' },
] as const

export const WIZARD_STEP_COUNT = WIZARD_STEPS.length
