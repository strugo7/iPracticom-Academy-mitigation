/**
 * סט האייקונים של נגן ה-Playbooks — סגנון outline (stroke) קוהרנטי, נלקח 1:1
 * מ-`design-export/FlowPlayer.dc.html`. זהו **פער מאומת** מול רגיסטר ה-DS
 * (109 אייקונים בסגנון fill; אין בו wrench / star / thumbs / פרצופי-מצב-רוח /
 * info-circle). לפי נוהל-הפער (CLAUDE.md §6.1 שלב 1) מומשו מקובץ ה-design-export,
 * `stroke="currentColor"` (הצבע מסמן מצב) — אין text-glyphs. אין תלות ב-lucide.
 */
import type { CSSProperties, ReactNode } from 'react'

interface IconDef {
  sw?: number
  el: ReactNode
}

const ICONS = {
  /** chevron ימינה = "חזרה" ב-RTL (header). */
  back: { el: <polyline points="9 18 15 12 9 6" /> },
  close: {
    el: (
      <>
        <line x1="18" y1="6" x2="6" y2="18" />
        <line x1="6" y1="6" x2="18" y2="18" />
      </>
    ),
  },
  chevronDown: { el: <polyline points="6 9 12 15 18 9" /> },
  chevronBack: { el: <polyline points="15 18 9 12 15 6" /> },
  play: { el: <polygon points="6 3 20 12 6 21 6 3" /> },
  clock: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
  },
  activity: {
    el: (
      <>
        <line x1="6" y1="20" x2="6" y2="14" />
        <line x1="12" y1="20" x2="12" y2="9" />
        <line x1="18" y1="20" x2="18" y2="4" />
      </>
    ),
  },
  question: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </>
    ),
  },
  wrench: {
    el: (
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    ),
  },
  check: { sw: 2.4, el: <polyline points="20 6 9 17 4 12" /> },
  info: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 16v-4M12 8h.01" />
      </>
    ),
  },
  image: {
    sw: 1.8,
    el: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <circle cx="9" cy="9" r="2" />
        <path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" />
      </>
    ),
  },
  arrowStart: {
    el: (
      <>
        <path d="M19 12H5" />
        <path d="m12 19-7-7 7-7" />
      </>
    ),
  },
  link: {
    el: (
      <>
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </>
    ),
  },
  external: {
    el: (
      <>
        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
        <polyline points="15 3 21 3 21 9" />
        <line x1="10" y1="14" x2="21" y2="3" />
      </>
    ),
  },
  thumbUp: {
    el: (
      <>
        <path d="M7 10v12" />
        <path d="M15 5.88 14 10h5.83a2 2 0 0 1 1.92 2.56l-2.33 8A2 2 0 0 1 17.5 22H4a2 2 0 0 1-2-2v-8a2 2 0 0 1 2-2h2.76a2 2 0 0 0 1.79-1.11L12 2a3.13 3.13 0 0 1 3 3.88z" />
      </>
    ),
  },
  thumbDown: {
    el: (
      <>
        <path d="M17 14V2" />
        <path d="M9 18.12 10 14H4.17a2 2 0 0 1-1.92-2.56l2.33-8A2 2 0 0 1 6.5 2H20a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-2.76a2 2 0 0 0-1.79 1.11L12 22a3.13 3.13 0 0 1-3-3.88z" />
      </>
    ),
  },
  star: {
    sw: 1.8,
    el: (
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    ),
  },
  moodAngry: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <path d="M7.5 8 10 9" />
        <path d="m14 9 2.5-1" />
        <path d="M9 10h.01" />
        <path d="M15 10h.01" />
      </>
    ),
  },
  moodFrown: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M16 16s-1.5-2-4-2-4 2-4 2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </>
    ),
  },
  moodMeh: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <line x1="8" y1="15" x2="16" y2="15" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </>
    ),
  },
  moodSmile: {
    el: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" y1="9" x2="9.01" y2="9" />
        <line x1="15" y1="9" x2="15.01" y2="9" />
      </>
    ),
  },
} satisfies Record<string, IconDef>

export type PlayerIconName = keyof typeof ICONS

interface PlayerIconProps {
  name: PlayerIconName
  size?: number
  strokeWidth?: number
  /** למילוי כוכב-דירוג פעיל (star) — ברירת-מחדל none (outline). */
  fill?: string
  className?: string
  style?: CSSProperties
}

export function PlayerIcon({
  name,
  size = 20,
  strokeWidth,
  fill = 'none',
  className,
  style,
}: PlayerIconProps) {
  const def = ICONS[name]
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={fill}
      stroke="currentColor"
      strokeWidth={strokeWidth ?? def.sw ?? 2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
      aria-hidden="true"
    >
      {def.el}
    </svg>
  )
}
