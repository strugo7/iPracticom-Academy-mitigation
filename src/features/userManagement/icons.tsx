/**
 * אייקוני ניהול-משתמשים — סט ייעודי ל-feature, מועתקים as-is מהמקור המעצב
 * (design-export/User Management.dc.html, ICONS + עץ המחלקות + מגירת המשתמש).
 * נדרשים כי רגיסטר ה-Icon המשותף של ה-DS (109 גליפים) חסר גליפי-מחלקה/
 * שליחה/איפוס/השבתה/העתקה/שיוך-מנהל/הרשאה/מבחן-כניסה/הודעה. נוהל-הפער
 * (CLAUDE.md §6.1 שלב 1): מממשים מ-design-export לפני בקשת-שירה. גליפי-chrome
 * גנריים (עריכה/חיפוש/צ'ברון/סגירה/הוספה/מייל/קישור) מגיעים מ-DS Icon כרגיל.
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

/** מחלקה עם תת-מחלקות (עץ) */
export function FolderIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 7a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    </svg>
  )
}

/** מחלקת-עלה (עץ) / מונה-חברים */
export function TeamIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
    </svg>
  )
}

/** בניין — כותרת כרטיס הגדרות-מחלקה */
export function BuildingIcon({ size = 23, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 21h18M5 21V7l8-4v18M19 21V11l-6-4" />
      <path d="M9 9v.01M9 12v.01M9 15v.01M9 18v.01" />
    </svg>
  )
}

/** עץ ארגוני — כותרת פאנל העץ + טריגר-מובייל */
export function OrgChartIcon({ size = 17, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M3 3v18h18" />
      <rect x="7" y="6" width="10" height="4" rx="1" />
      <rect x="11" y="14" width="10" height="4" rx="1" />
    </svg>
  )
}

/** הזמן משתמש — כפתור עליון */
export function InvitePersonIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </svg>
  )
}

/** שלח (מבחן-כניסה / הודעה / העתק-קישור) */
export function SendIcon({ size = 15, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M22 2 11 13" />
      <path d="M22 2 15 22l-4-9-9-4 20-7z" />
    </svg>
  )
}

/** איפוס סיסמה */
export function ResetIcon({ size = 15, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M21 2v6h-6" />
      <path d="M3 12a9 9 0 0 1 15-6.7L21 8" />
      <path d="M3 22v-6h6" />
      <path d="M21 12a9 9 0 0 1-15 6.7L3 16" />
    </svg>
  )
}

/** השבת משתמש */
export function PowerOffIcon({ size = 15, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M18.36 6.64A9 9 0 1 1 5.64 6.64" />
      <line x1="12" y1="2" x2="12" y2="12" />
    </svg>
  )
}

/** העתק קישור-הזמנה */
export function CopyIcon({ size = 16, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <rect x="9" y="9" width="13" height="13" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  )
}

/** שיוך מנהל-מחלקה (החלף) */
export function ManagerAssignIcon({ size = 14, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M20 7h-9M14 17H5M17 21a4 4 0 1 0 0-8 4 4 0 0 0 0 8zM7 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z" />
    </svg>
  )
}

/** גישת-ניהול הופעלה (callout) */
export function ShieldCheckIcon({ size = 17, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  )
}

/** שלח מבחן-כניסה — פעולת-מגירה */
export function ExamCheckIcon({ size = 17, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="m9 11 3 3L22 4" />
      <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
    </svg>
  )
}

/** שלח הודעה — פעולת-מגירה */
export function MessageIcon({ size = 17, ...p }: Props) {
  return (
    <svg {...base(size, p)}>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  )
}
