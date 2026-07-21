/**
 * אייקוני הקטגוריות ואייקוני-הסקשנים של מסך המונחים.
 *
 * נוהל-הפער (CLAUDE.md §6.1, שלב 1): ל-registry של ה-DS (109 אייקונים) אין
 * אייקוני רשת/מגן/חומרה/פרוטוקול — לכן ה-SVG-ים כאן מועתקים **as-is** מתוך
 * `design-export/Concepts.dc.html` (מפת `this.CAT` שם) ו-`Term Editor.dc.html`.
 * לא הומצא כאן אף path. הצבע מגיע תמיד מ-`currentColor` של ההורה.
 *
 * אייקונים שכן קיימים ב-DS (חיפוש, פלוס, עין, קישור, סגירה…) — נלקחים מ-`Icon`
 * ולא משוכפלים כאן.
 */
import type { SVGProps } from 'react'

type IconProps = SVGProps<SVGSVGElement> & { size?: number }

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {children}
    </svg>
  )
}

export function NetworksIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="16" y="16" width="6" height="6" rx="1" />
      <rect x="2" y="16" width="6" height="6" rx="1" />
      <rect x="9" y="2" width="6" height="6" rx="1" />
      <path d="M5 16v-3a1 1 0 0 1 1-1h12a1 1 0 0 1 1 1v3" />
      <path d="M12 12V8" />
    </Svg>
  )
}

export function SecurityIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </Svg>
  )
}

export function HardwareIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="4" y="4" width="16" height="16" rx="2" />
      <rect x="9" y="9" width="6" height="6" />
      <path d="M15 2v2M9 2v2M15 20v2M9 20v2M20 15h2M20 9h2M2 15h2M2 9h2" />
    </Svg>
  )
}

export function SoftwareIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="M10 4v4" />
      <path d="M2 8h20" />
    </Svg>
  )
}

export function ProtocolsIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="m8 3 4 4-4 4" />
      <path d="M4 7h16" />
      <path d="m16 21-4-4 4-4" />
      <path d="M20 17H4" />
    </Svg>
  )
}

export function ServicesIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <rect x="2" y="3" width="20" height="8" rx="2" />
      <rect x="2" y="13" width="20" height="8" rx="2" />
      <path d="M6 7h.01M6 17h.01" />
    </Svg>
  )
}

export function GeneralIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </Svg>
  )
}

export function OrgIcon(props: IconProps) {
  return (
    <Svg {...props}>
      <path d="M6 22V4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18Z" />
      <path d="M10 6h4M10 10h4M10 14h4" />
      <path d="M6 22h12" />
    </Svg>
  )
}

/** אייקון השיעור בסקשן "מופיע בתוכן" (CTYPE.lesson ב-Concepts.dc.html). */
export function LessonTypeIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <circle cx="12" cy="12" r="10" />
      <polygon points="10 8 16 12 10 16 10 8" />
    </Svg>
  )
}

/** אייקון סקשן "מופיע בתוכן" / "קישור לתוכן" (שכבות). */
export function LayersIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </Svg>
  )
}

/** אייקון סקשן "הסבר מלא" (שורות טקסט). */
export function TextLinesIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <line x1="17" y1="10" x2="3" y2="10" />
      <line x1="21" y1="6" x2="3" y2="6" />
      <line x1="21" y1="14" x2="3" y2="14" />
      <line x1="17" y1="18" x2="3" y2="18" />
    </Svg>
  )
}

/** אייקון סקשן "דוגמאות" (נורה). */
export function BulbIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M9 18h6" />
      <path d="M10 22h4" />
      <path d="M15.09 14c.18-.98.65-1.74 1.41-2.5A4.65 4.65 0 0 0 18 8 6 6 0 0 0 6 8c0 1 .23 2.23 1.5 3.5A4.61 4.61 0 0 1 8.91 14" />
    </Svg>
  )
}

/** אייקון סקשן "מילים נרדפות" (חילוף). */
export function SynonymsIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="m18 16 4-4-4-4" />
      <path d="m6 8-4 4 4 4" />
      <path d="m14.5 4-5 16" />
    </Svg>
  )
}

/** אייקון סקשן "מונחים קשורים" (גרף). */
export function RelatedTermsIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </Svg>
  )
}

/** אייקון "קישור חיצוני" (יציאה מהמסגרת). */
export function ExternalLinkIcon(props: IconProps) {
  return (
    <Svg strokeWidth={2} {...props}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Svg>
  )
}
