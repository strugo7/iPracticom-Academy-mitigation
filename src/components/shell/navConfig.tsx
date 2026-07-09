/**
 * תצורת הניווט של המעטפת — פריטים, יעדים, שערי-תפקיד וכותרות עמוד.
 * הסרגל וה-router נגזרים מכאן; שינוי ניווט = שינוי בקובץ הזה בלבד.
 *
 * שני מבנים לפי תפקיד (אישור המוצר, 2026-07-09):
 * - משתמש רגיל: רשימה שטוחה (design-export/AppShell.dc.html).
 * - מדריך/מנהל/אדמין: מבנה SideNav.dc.html — "לוח הבית", "ניהול מחלקה"
 *   (מנהל+), ו"ניהול תוכן" כקבוצה נפתחת עם תת-קבוצת "ניהול מאגר מבחנים".
 */
import type { ComponentType, SVGProps } from 'react'
import { canManageContent, isManager } from '@/lib/auth'
import type { User } from '@/types/entities'
import {
  CertificateIcon,
  ContentIcon,
  DashboardIcon,
  GlossaryIcon,
  HelpIcon,
  LogoutIcon,
  ManagerDashboardIcon,
  MediaIcon,
  PoliciesIcon,
  QuizBankIcon,
  SettingsIcon,
  TrainingsIcon,
  TroubleshootingIcon,
} from './icons'

type NavIcon = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>

export interface NavItem {
  to: string
  label: string
  icon: NavIcon
}

/** תת-פריט בקבוצת "ניהול תוכן": קישור עם אייקון, או תת-קבוצה עם קישורי-נקודה. */
export type ContentChild =
  | { kind: 'link'; to: string; label: string; icon: NavIcon }
  | {
      kind: 'group'
      label: string
      icon: NavIcon
      children: { to: string; label: string }[]
    }

export interface NavGroup {
  kind: 'group'
  label: string
  icon: NavIcon
  /** יעד האייקון היחיד במצב סרגל מכווץ (SideNav.dc.html navClosed) */
  collapsedTo: string
  children: ContentChild[]
}

export type NavEntry = ({ kind: 'link' } & NavItem) | NavGroup

/** קבוצת "ניהול תוכן" — תוכן וסדר לפי SideNav.dc.html (subItemsPre/quiz/subItemsPost). */
export const CONTENT_GROUP: NavGroup = {
  kind: 'group',
  label: 'ניהול תוכן',
  icon: ContentIcon,
  collapsedTo: '/content',
  children: [
    {
      kind: 'link',
      to: '/content',
      label: 'ניהול מאגר הידע הארגוני',
      icon: ContentIcon,
    },
    {
      kind: 'group',
      label: 'ניהול מאגר מבחנים',
      icon: QuizBankIcon,
      children: [
        { to: '/questions', label: 'מאגר השאלות' },
        { to: '/exams', label: 'מאגר המבחנים' },
      ],
    },
    { kind: 'link', to: '/media', label: 'מדיה', icon: MediaIcon },
    {
      kind: 'link',
      to: '/certificates',
      label: 'יצירת תעודות סיום',
      icon: CertificateIcon,
    },
    {
      kind: 'link',
      to: '/concepts',
      label: 'יצירת מונחים',
      icon: GlossaryIcon,
    },
    {
      kind: 'link',
      to: '/policies',
      label: 'יצירת נהלים פנים-ארגוניים',
      icon: PoliciesIcon,
    },
  ],
}

/** הניווט הראשי לפי המשתמש — הלוגיקה העסקית של הסרגל. */
export function buildMainNav(user: User): NavEntry[] {
  // מדריך ומעלה = יש הרשאת ניהול תוכן (מנהל בפועל ואדמין כלולים)
  if (!canManageContent(user)) {
    return [
      { kind: 'link', to: '/dashboard', label: 'דשבורד', icon: DashboardIcon },
      {
        kind: 'link',
        to: '/trainings',
        label: 'ההכשרות שלי',
        icon: TrainingsIcon,
      },
      {
        kind: 'link',
        to: '/troubleshooting',
        label: 'פתרון בעיות',
        icon: TroubleshootingIcon,
      },
    ]
  }
  return [
    { kind: 'link', to: '/dashboard', label: 'לוח הבית', icon: DashboardIcon },
    {
      kind: 'link',
      to: '/trainings',
      label: 'ההכשרות שלי',
      icon: TrainingsIcon,
    },
    ...(isManager(user)
      ? [
          {
            kind: 'link',
            to: '/manager',
            label: 'ניהול מחלקה',
            icon: ManagerDashboardIcon,
          } as const,
        ]
      : []),
    CONTENT_GROUP,
    {
      kind: 'link',
      to: '/troubleshooting',
      label: 'פתרון בעיות',
      icon: TroubleshootingIcon,
    },
  ]
}

/** הסקשן התחתון הקבוע (מסמך 11 §3) — יציאה מטופלת בנפרד (פעולה, לא ניתוב). */
export const FOOTER_NAV_ITEMS: NavItem[] = [
  { to: '/help', label: 'מרכז עזרה', icon: HelpIcon },
  { to: '/settings', label: 'הגדרות', icon: SettingsIcon },
]

export const LOGOUT_ITEM = { label: 'יציאה', icon: LogoutIcon }

/** כותרת + תת-כותרת לסרגל העליון, לפי הנתיב. תת-כותרת רק היכן שהעיצוב מגדיר. */
export const PAGE_META: Record<string, { title: string; subtitle?: string }> = {
  '/dashboard': { title: 'דשבורד', subtitle: 'מבט-על על ההכשרות והפעילות שלך' },
  '/trainings': { title: 'ההכשרות שלי' },
  '/troubleshooting': { title: 'פתרון בעיות' },
  '/manager': { title: 'ניהול מחלקה' },
  '/users': { title: 'ניהול משתמשים' },
  '/content': { title: 'ניהול מאגר הידע הארגוני' },
  '/questions': { title: 'מאגר השאלות' },
  '/exams': { title: 'מאגר המבחנים' },
  '/media': { title: 'מדיה' },
  '/certificates': { title: 'יצירת תעודות סיום' },
  '/concepts': { title: 'יצירת מונחים' },
  '/policies': { title: 'יצירת נהלים פנים-ארגוניים' },
  '/recruitment': { title: 'גיוס' },
  '/admin': { title: 'ניהול המערכת' },
  '/help': { title: 'מרכז עזרה' },
  '/settings': { title: 'הגדרות' },
  '/profile': { title: 'הפרופיל שלי' },
}

export function getPageMeta(
  pathname: string,
  user?: User | null,
): { title: string; subtitle?: string } {
  // התאמה לפי ה-segment הראשון, כך שגם נתיבי-בת (למשל /trainings/123) מקבלים כותרת
  const root = `/${pathname.split('/')[1] ?? ''}`
  // הדשבורד נקרא "לוח הבית" בתצוגת מדריך/מנהל/אדמין (SideNav.dc.html)
  if (root === '/dashboard' && user && canManageContent(user)) {
    return { title: 'לוח הבית', subtitle: PAGE_META['/dashboard'].subtitle }
  }
  return PAGE_META[root] ?? { title: '' }
}
