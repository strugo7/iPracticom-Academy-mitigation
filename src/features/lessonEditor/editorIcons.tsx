/**
 * אייקוני עורך-השיעורים — סט אייקונים ייעודי ל-feature זה. הגליפים הועתקו
 * as-is מהמקור המעצב של המסך: design-export/Lesson Editor.dc.html (רגיסטר `I`,
 * שורות 920-955 + מחווני outline/eyeOff). נדרשים כי רגיסטר ה-Icon המשותף של
 * ה-DS (טלפוניה/CRM) חסר גליפים לעורך-בלוקים (פסקה, כותרת, כרטיס-זיכרון וכו').
 * נוהל-הפער (CLAUDE.md 6.1, שלב 1): מממשים מ-design-export לפני בקשת-שירה.
 * גליפי-chrome גנריים (הגדרות, עין, עיפרון, וי, חיפוש…) מגיעים מ-DS Icon.
 */
import type { JSX, SVGProps } from 'react'

type Glyph = { mode: 'stroke' | 'fill'; body: JSX.Element }

const G = (body: JSX.Element, mode: 'stroke' | 'fill' = 'stroke'): Glyph => ({
  mode,
  body,
})

const glyphs = {
  // ── block-type glyphs (families) ──
  text: G(
    <>
      <path d="M17 6H9a4 4 0 0 0 0 8h2" />
      <path d="M13 6v14M17 6v14" />
    </>,
  ),
  heading: G(<path d="M6 12h12M6 4v16M18 4v16" />),
  list: G(
    <>
      <path d="M8 6h13M8 12h13M8 18h13" />
      <circle cx="4" cy="6" r="1" />
      <circle cx="4" cy="12" r="1" />
      <circle cx="4" cy="18" r="1" />
    </>,
  ),
  quote: G(
    <>
      <path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" />
      <path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" />
    </>,
  ),
  note: G(
    <>
      <path d="M9 18h6M10 22h4" />
      <path d="M12 2a7 7 0 0 0-4 12.7c.6.5 1 1.3 1 2.1V18h6v-1.2c0-.8.4-1.6 1-2.1A7 7 0 0 0 12 2z" />
    </>,
  ),
  motivation: G(
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />,
  ),
  table: G(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M3 15h18M9 3v18M15 3v18" />
    </>,
  ),
  separator: G(<path d="M3 12h18" />),
  page_break: G(
    <>
      <path d="M6 3v6M6 21v-6M18 3v6M18 21v-6" />
      <path d="M3 12h6M15 12h6" />
    </>,
  ),
  image: G(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.5-3.5a2 2 0 0 0-2.83 0L7 19" />
    </>,
  ),
  video: G(
    <>
      <path d="m22 8-6 4 6 4V8z" />
      <rect x="2" y="6" width="14" height="12" rx="2" />
    </>,
  ),
  pdf: G(
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M9 13h6M9 17h6" />
    </>,
  ),
  lesson_cover: G(
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <path d="M3 14l4-4 5 5 3-3 6 6" />
    </>,
  ),
  flashcard: G(
    <>
      <rect x="2" y="6" width="16" height="14" rx="2" />
      <path d="M22 6v12a2 2 0 0 1-2 2" />
    </>,
  ),
  tabs: G(
    <>
      <rect x="3" y="7" width="18" height="14" rx="2" />
      <path d="M7 7V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v3" />
    </>,
  ),
  // topology (network_canvas, שלב 6.4b) — צמתים מחוברים
  network: G(
    <>
      <rect x="9" y="2" width="6" height="6" rx="1.5" />
      <rect x="2" y="16" width="6" height="6" rx="1.5" />
      <rect x="16" y="16" width="6" height="6" rx="1.5" />
      <path d="M12 8v4M12 12H5v4M12 12h7v4" />
    </>,
  ),
  ai_generated: G(
    <>
      <path d="m12 3 1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4z" />
      <path d="m19 14 .7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z" />
    </>,
  ),
  gamma_embed: G(
    <>
      <path d="M2 3h20" />
      <path d="M4 3v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V3" />
      <path d="M12 16v5M9 21h6" />
    </>,
  ),
  html_embed: G(<path d="m18 16 4-4-4-4M6 8l-4 4 4 4M14.5 4l-5 16" />),
  designed_section: G(
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18M9 21V9" />
    </>,
  ),
  // ── alignment (inspector) ──
  alignRight: G(<path d="M21 6H3M21 12H9M21 18H7" />),
  alignCenter: G(<path d="M21 6H3M18 12H6M19 18H5" />),
  alignLeft: G(<path d="M21 6H3M15 12H3M17 18H3" />),
  alignJustify: G(<path d="M21 6H3M21 12H3M21 18H3" />),
  // ── chrome / affordances (no DS equivalent) ──
  grid: G(
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>,
  ),
  grip: G(
    <>
      <circle cx="9" cy="6" r="1.5" />
      <circle cx="15" cy="6" r="1.5" />
      <circle cx="9" cy="12" r="1.5" />
      <circle cx="15" cy="12" r="1.5" />
      <circle cx="9" cy="18" r="1.5" />
      <circle cx="15" cy="18" r="1.5" />
    </>,
    'fill',
  ),
  style: G(
    <>
      <circle cx="13.5" cy="6.5" r="2.5" />
      <circle cx="6.5" cy="12.5" r="2.5" />
      <circle cx="17" cy="14" r="2.5" />
      <path d="M2 21s2-4 7-4M22 21s-2-6-9-6" />
    </>,
  ),
  eyeOff: G(
    <>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M2 2l20 20" />
    </>,
  ),
  // ── inline text formatting (floating toolbar, design-export §floating TEXT toolbar) ──
  bold: G(
    <>
      <path d="M6 4h8a4 4 0 0 1 0 8H6z" />
      <path d="M6 12h9a4 4 0 0 1 0 8H6z" />
    </>,
  ),
  italic: G(<path d="M19 4h-9M14 20H5M15 4L9 20" />),
  underline: G(
    <>
      <path d="M6 3v7a6 6 0 0 0 12 0V3" />
      <path d="M4 21h16" />
    </>,
  ),
  link: G(
    <>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </>,
  ),
  listOrdered: G(
    <>
      <path d="M10 6h11M10 12h11M10 18h11" />
      <path d="M4 6h1v4M4 10h2M6 18H4l2-2.5V14H4" />
    </>,
  ),
  // ── AI assistant panel + AI blocks (design-export §AI DRAWER, registry `I`) ──
  // single-sparkle wand (topbar/menu "צור טיוטת שיעור")
  wand: G(
    <path d="M15 4V2M15 16v-2M8 9h2M20 9h2M17.8 11.8 19 13M15 9h.01M17.8 6.2 19 5M3 21l9-9M12.2 6.2 11 5" />,
  ),
  // orbit spark (top-bar "AI" button)
  spark: G(
    <>
      <path d="M12 3v3M12 18v3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M3 12h3M18 12h3M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </>,
  ),
  question: G(
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <path d="M12 17h.01" />
    </>,
  ),
  imagePlus: G(
    <>
      <path d="M21 15v6M18 18h6" />
      <path d="M21 11V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h6" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.5-3.5a2 2 0 0 0-2.83 0L8 18" />
    </>,
  ),
  refresh: G(
    <>
      <path d="M3 2v6h6" />
      <path d="M3.51 9a9 9 0 1 0 2.13-3.36L3 8" />
    </>,
  ),
} satisfies Record<string, Glyph>

export type EditorIconName = keyof typeof glyphs

interface EditorIconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: EditorIconName
  size?: number
}

/** אייקון פנימי של העורך — currentColor, ללא גליפי-טקסט (gate #7). */
export function EditorIcon({ name, size = 18, ...rest }: EditorIconProps) {
  const g = glyphs[name]
  const stroke = g.mode === 'stroke'
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={stroke ? 'none' : 'currentColor'}
      stroke={stroke ? 'currentColor' : 'none'}
      strokeWidth={stroke ? 2 : undefined}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={rest['aria-label'] ? undefined : true}
      role={rest['aria-label'] ? 'img' : undefined}
      {...rest}
    >
      {g.body}
    </svg>
  )
}
