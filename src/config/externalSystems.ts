/**
 * המערכות הארגוניות בסרגל הניווט (מסמך 30) — זמינות לכל התפקידים.
 * ה-URLs לא קשיחים ב-UI: ברירות המחדל כאן (מ-design-export) ניתנות לדריסה
 * ב-env, ובעתיד ינוהלו מ-AppSetting דרך הגדרות המערכת (מסמך 16) בלי דיפלוי.
 */

export interface ExternalSystem {
  id: string
  /** שם הפריט בסרגל */
  label: string
  /** שם מלא ל-tooltip (title) */
  title: string
  url: string
  /** נתיב תמונת אייקון (public/) — או null לאייקון ה-SVG המובנה (קובייה) */
  iconSrc: string | null
  enabled: boolean
}

const env = import.meta.env

/** '#' = כתובת שטרם נמסרה מהארגון (כמו ב-design-export); הפריט עדיין מוצג. */
export const EXTERNAL_SYSTEMS: ExternalSystem[] = [
  {
    id: 'fireberry',
    label: 'Fireberry',
    title: 'Fireberry — מערכת CRM',
    url: env.VITE_EXT_FIREBERRY_URL ?? 'https://app.fireberry.com',
    iconSrc: '/assets/ext-fireberry.png',
    enabled: true,
  },
  {
    id: 'priority',
    label: 'Priority',
    title: 'Priority — מערכת ERP',
    url: env.VITE_EXT_PRIORITY_URL ?? 'https://www.priority-software.com',
    iconSrc: '/assets/ext-priority.png',
    enabled: true,
  },
  {
    id: 'meckano',
    label: 'Mećkano',
    title: 'Mećkano — שעון נוכחות',
    url: env.VITE_EXT_MECKANO_URL ?? '#',
    iconSrc: '/assets/ext-mekhano.png',
    enabled: true,
  },
  {
    id: 'hadshanut',
    label: 'החדשנות',
    title: 'החדשנות — מרכזיות / PBX',
    url: env.VITE_EXT_HADSHANUT_URL ?? '#',
    iconSrc: '/assets/ext-hadshanut.png',
    enabled: true,
  },
  {
    id: 'internal-app',
    label: 'מערכת נוספת',
    title: 'מערכת נוספת — אפליקציה פנימית',
    url: env.VITE_EXT_INTERNAL_APP_URL ?? '#',
    iconSrc: null,
    enabled: true,
  },
  {
    id: 'drive',
    label: 'דרייב ארגוני',
    title: 'דרייב ארגוני — אחסון קבצים',
    url: env.VITE_EXT_DRIVE_URL ?? '#',
    iconSrc: '/assets/ext-drive.png',
    enabled: true,
  },
]
