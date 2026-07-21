/** סיווג מצב-ריבוע לניווט (מסמך 14 + design-export/Exam Player.dc.html — SQ). */
import type { QuestionStatus } from '../types'

export interface QuestionStatusInput {
  index: number
  current: number
  answered: boolean
  flagged: boolean
  visited: boolean
}

export function computeQuestionStatus({
  index,
  current,
  answered,
  flagged,
  visited,
}: QuestionStatusInput): QuestionStatus {
  if (index === current) return 'current'
  if (flagged) return 'flagged'
  if (answered) return 'answered'
  if (visited) return 'skipped'
  return 'notseen'
}

/** טוקני-DS לכל מצב — נגזרים מאותה זוגיות-צבע שכבר קיימת ב-Badge.tsx (success/warning/caution/accent). */
export const QUESTION_STATUS_STYLE: Record<
  QuestionStatus,
  { bg: string; border: string; text: string; label: string }
> = {
  answered: {
    bg: 'bg-hues-mint',
    border: 'border-hues-teal/50',
    text: 'text-hues-teal',
    label: 'נענתה',
  },
  flagged: {
    bg: 'bg-hues-yellow/30',
    border: 'border-hues-yellow',
    text: 'text-[#8A6E00]',
    label: 'מסומנת בדגל',
  },
  skipped: {
    bg: 'bg-hues-salmon/40',
    border: 'border-hues-salmon',
    text: 'text-hues-strawberry',
    label: 'דולגה',
  },
  current: {
    bg: 'bg-hues-sky',
    border: 'border-accent',
    text: 'text-accent',
    label: 'נוכחית',
  },
  notseen: {
    bg: 'bg-white',
    border: 'border-neutrals-silver',
    text: 'text-neutrals-lead',
    label: 'טרם נצפתה',
  },
}
