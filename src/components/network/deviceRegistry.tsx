/**
 * רגיסטר סוגי-הרכיבים של טופולוגיית הרשת (שלב 6.4b, מסמך 21 §4).
 * אייקוני ה-device אינם קיימים ב-109 אייקוני ה-DS — לפי נוהל-הפער (CLAUDE.md
 * §6.1 שלב 1) נלקחו AS-IS מה-SVG ה-inline ב-design-export/Network Canvas.dc.html
 * (this.IC, שורות 330-338). צבעים = hues אמיתיים בלבד (this.COL, שורה 368).
 */
import type { ReactNode } from 'react'

export type DeviceType =
  | 'modem'
  | 'router'
  | 'switch'
  | 'ap'
  | 'ipad'
  | 'voip'
  | 'printer'
  | 'register'
  | 'credit'

interface DeviceMeta {
  /** תווית פלטה קצרה. */
  label: string
  /** תיאור-סוג ל-Inspector (design-export typeLabel). */
  typeLabel: string
  /** צבע המותג לרכיב (hue אמיתי). */
  color: string
  icon: ReactNode
}

const S = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
}

/** אייקון device inline (currentColor); מקבל את הגודל מההורה. */
function svg(children: ReactNode) {
  return (
    <svg viewBox="0 0 24 24" width="100%" height="100%" {...S}>
      {children}
    </svg>
  )
}

export const DEVICE_REGISTRY: Record<DeviceType, DeviceMeta> = {
  modem: {
    label: 'מודם',
    typeLabel: 'מודם DOCSIS',
    color: '#004E9B',
    icon: svg(
      <>
        <rect x="2" y="6" width="20" height="12" rx="2" />
        <circle cx="6.5" cy="12" r="1.1" />
        <path d="M10 12h8" />
      </>,
    ),
  },
  router: {
    label: 'ראוטר',
    typeLabel: 'ראוטר / שער רשת',
    color: '#0075DB',
    icon: svg(
      <>
        <rect x="2" y="14" width="20" height="8" rx="2" />
        <path d="M6.5 18h.01M11 18h.01" />
        <path d="M15 12V8" />
        <path d="M17.8 6.2a4 4 0 0 0-5.6 0" />
        <path d="M20.6 3.4a8 8 0 0 0-11.3 0" />
      </>,
    ),
  },
  switch: {
    label: 'סוויץ׳',
    typeLabel: 'Switch מנוהל',
    color: '#2EB4FF',
    icon: svg(
      <>
        <rect x="2" y="8" width="20" height="8" rx="2" />
        <path d="M6 12h.01M10 12h.01M14 12h.01M18 12h.01" />
      </>,
    ),
  },
  ap: {
    label: 'אקסס פוינט',
    typeLabel: 'נקודת גישה Wi-Fi',
    color: '#51D5A5',
    icon: svg(
      <>
        <path d="M5 12.55a8 8 0 0 1 14 0" />
        <path d="M8.5 16.05a4 4 0 0 1 7 0" />
        <path d="M2 8.82a15 15 0 0 1 20 0" />
        <line x1="12" y1="20" x2="12.01" y2="20" />
      </>,
    ),
  },
  ipad: {
    label: 'iPad',
    typeLabel: 'טאבלט',
    color: '#9EA5AD',
    icon: svg(
      <>
        <rect x="5" y="2" width="14" height="20" rx="2" />
        <line x1="12" y1="18" x2="12.01" y2="18" />
      </>,
    ),
  },
  voip: {
    label: 'טלפון VoIP',
    typeLabel: 'טלפון IP',
    color: '#8E7057',
    icon: svg(
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92z" />,
    ),
  },
  printer: {
    label: 'מדפסת',
    typeLabel: 'מדפסת רשת',
    color: '#9EA5AD',
    icon: svg(
      <>
        <polyline points="6 9 6 2 18 2 18 9" />
        <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
        <rect x="6" y="14" width="12" height="8" />
      </>,
    ),
  },
  register: {
    label: 'קופה רושמת',
    typeLabel: 'עמדת קופה POS',
    color: '#BCA28D',
    icon: svg(
      <>
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1Z" />
        <path d="M8 7h8M8 11h8M8 15h5" />
      </>,
    ),
  },
  credit: {
    label: 'בולק אשראי',
    typeLabel: 'מסוף סליקת אשראי',
    color: '#51D5A5',
    icon: svg(
      <>
        <rect x="2" y="5" width="20" height="14" rx="2" />
        <line x1="2" y1="10" x2="22" y2="10" />
        <line x1="6" y1="15" x2="9" y2="15" />
      </>,
    ),
  },
}

/** סדר הפלטה (מסמך 21 §4). */
export const PALETTE_ORDER: DeviceType[] = [
  'modem',
  'router',
  'switch',
  'ap',
  'ipad',
  'voip',
  'printer',
  'register',
  'credit',
]

export function deviceMeta(type: string): DeviceMeta {
  return DEVICE_REGISTRY[type as DeviceType] ?? DEVICE_REGISTRY.switch
}
