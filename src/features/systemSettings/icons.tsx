/**
 * אייקוני הגדרות-מערכת — סט ייעודי ל-feature, מועתקים as-is מהמקור המעצב
 * (design-export/System Settings.dc.html: SEC_ICON/DEF_ICON/PDF_ICON/eyeOn/
 * eyeOff + אייקוני הכרטיסים). נדרשים כי רגיסטר ה-Icon המשותף של ה-DS (109
 * גליפים) חסר גליפי מנעול/פלטת-צבעים/פלאג/כניסה/סימן-מים/QR/רשת-Wi-Fi/מכשיר.
 * נוהל-הפער (CLAUDE.md §6.1 שלב 1): מממשים מ-design-export לפני בקשת-שירה.
 */
import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & { size?: number }

function base(size: number, rest: Omit<Props, 'size'>) {
  return {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none' as const,
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
    'aria-hidden': true,
    ...rest,
  }
}

/** מנעול — כותרת סקשן "אבטחת התחברות" */
export function LockIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

/** כדור-ארץ — "דומיינים מותרים" */
export function GlobeIcon({ size = 21, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  )
}

/** שרת/מסך — "הגבלת כתובות IP" */
export function ServerIcon({ size = 21, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
      <path d="M6 8h.01M10 8h.01" />
    </svg>
  )
}

/** גלי-רשת — שורת טווח-IP */
export function WifiIcon({ size = 15, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M5 12.55a11 11 0 0 1 14.08 0" />
      <path d="M1.42 9a16 16 0 0 1 21.16 0" />
      <path d="M8.53 16.11a6 6 0 0 1 6.95 0" />
      <path d="M12 20h.01" />
    </svg>
  )
}

/** פלטת-צבעים — כותרת סקשן "מיתוג" */
export function PaletteIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <circle cx="13.5" cy="6.5" r=".5" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r=".5" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r=".5" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r=".5" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.926 0 1.648-.746 1.648-1.688 0-.437-.18-.835-.437-1.125-.29-.289-.438-.652-.438-1.125a1.64 1.64 0 0 1 1.668-1.668h1.996c3.051 0 5.555-2.503 5.555-5.554C21.965 6.012 17.461 2 12 2z" />
    </svg>
  )
}

/** ברירות-מחדל — עמודות-מדידה */
export function SlidersIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <line x1="4" y1="21" x2="4" y2="14" />
      <line x1="4" y1="10" x2="4" y2="3" />
      <line x1="12" y1="21" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12" y2="3" />
      <line x1="20" y1="21" x2="20" y2="16" />
      <line x1="20" y1="12" x2="20" y2="3" />
      <line x1="1" y1="14" x2="7" y2="14" />
      <line x1="9" y1="8" x2="15" y2="8" />
      <line x1="17" y1="16" x2="23" y2="16" />
    </svg>
  )
}

/** תקע — כותרת סקשן "אינטגרציות" */
export function PlugIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M6 3v7a6 6 0 0 0 12 0V3" />
      <path d="M12 16v5" />
      <path d="M9 3v3M15 3v3" />
    </svg>
  )
}

/** חץ-כניסה — כותרת סקשן "יומני התחברות" */
export function LoginArrowIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
      <polyline points="10 17 15 12 10 7" />
      <line x1="15" y1="12" x2="3" y2="12" />
    </svg>
  )
}

/** כוכב — XP לשיעור (ברירת-מחדל) */
export function StarIcon({ size = 22, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
    </svg>
  )
}

/** טיפה — סימן-מים ב-PDF */
export function WatermarkIcon({ size = 20, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z" />
    </svg>
  )
}

/** QR — קוד אימות בתעודה */
export function QrIcon({ size = 20, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <path d="M14 14h3v3M21 14v7h-4M17 21v-4" />
    </svg>
  )
}

/** מסך שולחני — סוג-מכשיר בלוג-כניסה */
export function DesktopIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8M12 17v4" />
    </svg>
  )
}

/** נייד — סוג-מכשיר בלוג-כניסה */
export function MobileIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  )
}

/** עין פתוחה — הצג מפתח */
export function EyeIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

/** עין חצויה — הסתר מפתח */
export function EyeOffIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
      <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c6.5 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
      <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3.5 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
      <path d="M2 2l20 20" />
    </svg>
  )
}

/** מגן-סימון — כפתור/מודאל "סריקת אבטחה" */
export function ShieldCheckIcon({ size = 18, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}
