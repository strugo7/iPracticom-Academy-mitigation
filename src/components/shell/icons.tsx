/**
 * אייקוני המעטפת — הועתקו 1:1 (paths + strokes) מהעיצוב הסגור:
 * design-export/AppShell.dc.html + SideNav.dc.html. outline, stroke=currentColor —
 * הצבע מגיע מה-state של הפריט (לבן=פעיל, #AEB9C6=רגיל). אלה אייקוני המסך
 * המעוצב; registry ה-Icon של ה-DS אינו כולל אותם (אין להמציא חלופות).
 */
import type { SVGProps } from 'react'

type Props = SVGProps<SVGSVGElement> & { size?: number }

function base({ size = 20, ...rest }: Props, children: React.ReactNode) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  )
}

/** דשבורד — grid (AppShell.dc.html) */
export function DashboardIcon(p: Props) {
  return base(
    p,
    <>
      <rect x="3" y="3" width="7" height="9" rx="1" />
      <rect x="14" y="3" width="7" height="5" rx="1" />
      <rect x="14" y="12" width="7" height="9" rx="1" />
      <rect x="3" y="16" width="7" height="5" rx="1" />
    </>,
  )
}

/** ההכשרות שלי — graduation cap */
export function TrainingsIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
      <path d="M6 12v5c3 3 9 3 12 0v-5" />
    </>,
  )
}

/** פתרון בעיות — wrench (SideNav.dc.html — העיצוב המאוחר יותר של הסרגל) */
export function TroubleshootingIcon(p: Props) {
  return base(
    p,
    <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />,
  )
}

/** דשבורד ניהול — bar chart */
export function ManagerDashboardIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M3 3v18h18" />
      <rect x="7" y="11" width="3" height="6" rx="1" />
      <rect x="12" y="7" width="3" height="10" rx="1" />
      <rect x="17" y="13" width="3" height="4" rx="1" />
    </>,
  )
}

/** ניהול משתמשים — users */
export function UsersIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </>,
  )
}

/** ניהול תוכן — layers */
export function ContentIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M12 2 2 7l10 5 10-5-10-5z" />
      <path d="m2 17 10 5 10-5" />
      <path d="m2 12 10 5 10-5" />
    </>,
  )
}

/** גיוס — user plus */
export function RecruitmentIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <line x1="19" y1="8" x2="19" y2="14" />
      <line x1="22" y1="11" x2="16" y2="11" />
    </>,
  )
}

/** מרכז עזרה — help circle */
export function HelpIcon(p: Props) {
  return base(
    p,
    <>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </>,
  )
}

/** הגדרות — gear (AppShell.dc.html, סקשן תחתון) */
export function SettingsIcon(p: Props) {
  return base(
    p,
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </>,
  )
}

/** יציאה — logout */
export function LogoutIcon(p: Props) {
  return base(
    p,
    <>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </>,
  )
}

/** כיווץ הסרגל — double chevron (מצביע אל קצה הסרגל הימני ב-RTL) */
export function CollapseIcon(p: Props) {
  return base(
    { size: 18, ...p },
    <>
      <polyline points="13 17 18 12 13 7" />
      <polyline points="6 17 11 12 6 7" />
    </>,
  )
}

/** הרחבת הסרגל — double chevron הפוך */
export function ExpandIcon(p: Props) {
  return base(
    { size: 18, ...p },
    <>
      <polyline points="11 17 6 12 11 7" />
      <polyline points="18 17 13 12 18 7" />
    </>,
  )
}

/** ניהול מאגר מבחנים — checklist (SideNav.dc.html) */
export function QuizBankIcon(p: Props) {
  return base(
    { size: 15, ...p },
    <>
      <path d="m3 17 2 2 4-4" />
      <path d="m3 7 2 2 4-4" />
      <path d="M13 6h8" />
      <path d="M13 12h8" />
      <path d="M13 18h8" />
    </>,
  )
}

/** מדיה — image (SideNav.dc.html) */
export function MediaIcon(p: Props) {
  return base(
    { size: 15, ...p },
    <>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <circle cx="9" cy="9" r="2" />
      <path d="m21 15-3.5-3.5a2 2 0 0 0-2.83 0L7 19" />
    </>,
  )
}

/** יצירת תעודות סיום — award (SideNav.dc.html) */
export function CertificateIcon(p: Props) {
  return base(
    { size: 15, ...p },
    <>
      <circle cx="12" cy="8" r="6" />
      <path d="M15.477 12.89 17 22l-5-3-5 3 1.523-9.11" />
    </>,
  )
}

/** יצירת מונחים — book (SideNav.dc.html) */
export function GlossaryIcon(p: Props) {
  return base(
    { size: 15, ...p },
    <>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
      <path d="M8 7h6" />
      <path d="M8 11h8" />
    </>,
  )
}

/** יצירת נהלים פנים-ארגוניים — file-text (SideNav.dc.html) */
export function PoliciesIcon(p: Props) {
  return base(
    { size: 15, ...p },
    <>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
      <path d="M16 13H8" />
      <path d="M16 17H8" />
    </>,
  )
}

/** chevron down — כותרת "מערכות ארגוניות" (SideNav.dc.html) */
export function ChevronDownIcon(p: Props) {
  return base(
    { size: 14, strokeWidth: 2.2, ...p },
    <polyline points="6 9 12 15 18 9" />,
  )
}

/** external link — קצה פריט מערכת ארגונית */
export function ExternalLinkIcon(p: Props) {
  return base(
    { size: 14, ...p },
    <>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h6" />
    </>,
  )
}

/** external link מוקטן — badge במצב סרגל מכווץ (SideNav.dc.html) */
export function ExternalLinkMiniIcon(p: Props) {
  return base(
    { size: 8, strokeWidth: 3, ...p },
    <path d="M7 17 17 7M9 7h8v8" />,
  )
}

/** קובייה — אייקון "מערכת נוספת" (SideNav.dc.html) */
export function CubeIcon(p: Props) {
  return base(
    { size: 18, ...p },
    <>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <path d="m3.27 6.96 8.73 5.05 8.73-5.05M12 22.08V12" />
    </>,
  )
}

/** חיפוש — סרגל עליון (AppShell.dc.html) */
export function SearchIcon(p: Props) {
  return base(
    { size: 19, ...p },
    <>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </>,
  )
}

/** פעמון התראות — סרגל עליון */
export function BellIcon(p: Props) {
  return base(
    { size: 21, ...p },
    <>
      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
    </>,
  )
}
