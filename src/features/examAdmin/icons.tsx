/**
 * אייקוני מאגר-השאלות/בונה-המבחנים — סט ייעודי ל-feature. הגליפים הועתקו as-is
 * מהמקור המעצב: design-export/Question Bank.dc.html + Exam Builder.dc.html
 * (רגיסטרי TYPE/ICONS). נדרשים כי רגיסטר ה-Icon המשותף של ה-DS (109 גליפי
 * טלפוניה/CRM) חסר גליפי סוגי-שאלה, ידית-גרירה, ומסמך-מבחן. נוהל-הפער
 * (CLAUDE.md §6.1 שלב 1): מממשים מ-design-export לפני בקשת-שירה. גליפי-chrome
 * גנריים (חיפוש/שמירה/עריכה/מחיקה/צ'ברון/העלאה…) מגיעים מ-DS Icon כרגיל.
 */
import type { JSX, SVGProps } from 'react'

type Glyph = { mode: 'stroke' | 'fill'; body: JSX.Element }

const G = (body: JSX.Element, mode: 'stroke' | 'fill' = 'stroke'): Glyph => ({
  mode,
  body,
})

const glyphs = {
  // ── סוגי שאלה ──
  multiple_choice: G(
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </>,
  ),
  true_false: G(
    <>
      <rect x="1" y="5" width="22" height="14" rx="7" />
      <circle cx="16" cy="12" r="3" />
    </>,
  ),
  order_sequence: G(
    <>
      <path d="M10 6h11" />
      <path d="M10 12h11" />
      <path d="M10 18h11" />
      <path d="M4 6h1v4" />
      <path d="M4 10h2" />
      <path d="M6 18H4c0-1 2-2 2-3 0-.6-.5-1-1.2-1H4" />
    </>,
  ),
  // ── מסמך-מבחן (list actions / empty state) ──
  exam: G(
    <>
      <path d="M9 11l3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </>,
  ),
  // ── ידית-גרירה (6 נקודות, fill) ──
  grip: G(
    <>
      <circle cx="9" cy="5" r="1.6" />
      <circle cx="15" cy="5" r="1.6" />
      <circle cx="9" cy="12" r="1.6" />
      <circle cx="15" cy="12" r="1.6" />
      <circle cx="9" cy="19" r="1.6" />
      <circle cx="15" cy="19" r="1.6" />
    </>,
    'fill',
  ),
  // ── מבחן-כניסה (log-in) ──
  entrance: G(
    <>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </>,
  ),
} as const

export type ExamGlyphName = keyof typeof glyphs

interface ExamIconProps extends Omit<SVGProps<SVGSVGElement>, 'children'> {
  name: ExamGlyphName
  size?: number
}

/** אייקון-feature: stroke/fill לפי הגליף, `currentColor` תמיד — כמו EditorIcon. */
export function ExamIcon({ name, size = 18, ...rest }: ExamIconProps) {
  const g = glyphs[name]
  const stroke = g.mode === 'stroke'
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {g.body}
    </svg>
  )
}
