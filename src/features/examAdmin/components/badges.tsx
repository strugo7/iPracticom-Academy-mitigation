/**
 * עטיפות-תצוגה קטנות סביב DS-Badge + צ'יפ-אייקון-סוג צבעוני. מקור-אמת יחיד
 * לתוויות/צבעים: constants.ts. משמש בטבלת-המאגר, בעורך, ברשימת-המבחנים ובפאנל.
 */
import { Badge } from '@/components/ui'
import type {
  DifficultyLevel,
  ExamType,
  QuestionType,
} from '@/lib/constants/enums'
import {
  DIFFICULTY_META,
  EXAM_TYPE_META,
  QUESTION_TYPE_META,
  STATUS_META,
} from '../constants'
import { ExamIcon, type ExamGlyphName } from '../icons'
import type { BadgeColor } from '../constants'
import type { EditableStatus } from '../types'

export function QuestionTypeBadge({ type }: { type: QuestionType }) {
  const m = QUESTION_TYPE_META[type]
  return <Badge color={m.color}>{m.label}</Badge>
}

export function DifficultyBadge({ level }: { level: DifficultyLevel }) {
  const m = DIFFICULTY_META[level]
  return <Badge color={m.color}>{m.label}</Badge>
}

export function StatusBadge({ status }: { status: EditableStatus }) {
  const m = STATUS_META[status]
  return <Badge color={m.color}>{m.label}</Badge>
}

export function ExamTypeBadge({ type }: { type: ExamType }) {
  const m = EXAM_TYPE_META[type]
  return <Badge color={m.color}>{m.label}</Badge>
}

/** מחלקות סטטיות bg/fg/activeBg לצ'יפ-אייקון (Tailwind JIT דורש מחרוזות שלמות). */
const CHIP: Record<BadgeColor, { bg: string; fg: string; activeBg: string }> = {
  accent: { bg: 'bg-hues-sky', fg: 'text-accent', activeBg: 'bg-accent' },
  success: { bg: 'bg-hues-mint', fg: 'text-success', activeBg: 'bg-success' },
  bronze: { bg: 'bg-hues-bronze/40', fg: 'text-hues-bronze', activeBg: 'bg-hues-bronze' },
  warning: { bg: 'bg-hues-yellow', fg: 'text-warning', activeBg: 'bg-warning' },
  caution: { bg: 'bg-hues-salmon', fg: 'text-caution', activeBg: 'bg-caution' },
  neutral: { bg: 'bg-neutrals-silver', fg: 'text-neutrals-lead', activeBg: 'bg-neutrals-lead' },
  denim: { bg: 'bg-hues-sky', fg: 'text-hues-denim', activeBg: 'bg-hues-denim' },
  indigo: { bg: 'bg-hues-indigo', fg: 'text-hues-indigo', activeBg: 'bg-hues-indigo' },
}

/** צ'יפ-אייקון מרובע צבעוני (design-export: 32/40px, radius 8). */
export function ExamGlyphChip({
  glyph,
  color,
  size = 32,
  iconSize,
  active,
}: {
  glyph: ExamGlyphName
  color: BadgeColor
  size?: number
  iconSize?: number
  /** מצב-נבחר: רקע-מלא + אייקון לבן (בורר-הסוג בעורך) */
  active?: boolean
}) {
  const c = CHIP[color]
  return (
    <span
      className={`flex flex-none items-center justify-center rounded-lg ${
        active ? `${c.activeBg} text-white` : `${c.bg} ${c.fg}`
      }`}
      style={{ width: size, height: size }}
    >
      <ExamIcon name={glyph} size={iconSize ?? Math.round(size * 0.56)} />
    </span>
  )
}
