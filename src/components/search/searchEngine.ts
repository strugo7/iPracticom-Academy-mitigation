import { EXTERNAL_SYSTEMS } from '@/config/externalSystems'

export type SearchCategory = 'page' | 'system' | 'lesson' | 'concept'

export interface SearchResultItem {
  id: string
  title: string
  subtitle?: string
  category: SearchCategory
  categoryLabel: string
  url: string
  isExternal?: boolean
  badge?: string
  keywords?: string[]
}

const STORAGE_KEY = 'ipa_recent_searches_v1'
const MAX_RECENT_SEARCHES = 6

export const SUGGESTED_SEARCHES = [
  'Fireberry CRM',
  'Priority',
  'נהלי עבודה ושירות',
  'אבטחת מידע',
  'מילון מושגים',
  'ניהול משתמשים',
  'Active Directory',
]

/**
 * דפי ניווט קיימים במערכת
 */
const NAVIGATION_PAGES: SearchResultItem[] = [
  {
    id: 'page-dashboard',
    title: 'דשבורד ראשי',
    subtitle: 'תמונת מצב, מדדים והתקדמות אישית',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/dashboard',
    keywords: ['ראשי', 'בית', 'מדדים', 'dashboard', 'home'],
  },
  {
    id: 'page-trainings',
    title: 'מרכז למידה והכשרות',
    subtitle: 'שיעורים, קורסים ומסלולי הכשרה',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/trainings',
    keywords: ['למידה', 'שיעורים', 'קורסים', 'הכשרה', 'trainings', 'learning'],
  },
  {
    id: 'page-policies',
    title: 'נהלים פנים-ארגוניים',
    subtitle: 'ספריית הנהלים, קרא וחתום ואבטחת מידע',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/policies',
    keywords: ['נהלים', 'פוליסי', 'אבטחה', 'policies', 'rules'],
  },
  {
    id: 'page-concepts',
    title: 'מילון מושגים (Glossary)',
    subtitle: 'מונחים מקצועיים, אבטחה, רשתות ופרוטוקולים',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/concepts',
    keywords: ['מונחים', 'מושגים', 'מילון', 'glossary', 'terms'],
  },
  {
    id: 'page-manager',
    title: 'לוח מנהל',
    subtitle: 'דוחות התקדמות צוות, מעקב הסמכות ומנהלים',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/manager',
    keywords: ['מנהל', 'דוחות', 'צוות', 'מעקב', 'manager'],
  },
  {
    id: 'page-content',
    title: 'ניהול תוכן ושיעורים',
    subtitle: 'עורך השיעורים, בנית קורסים ומאגר שאלות',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/content',
    keywords: ['תוכן', 'עורך', 'שיעורים', 'content'],
  },
  {
    id: 'page-exams',
    title: 'בנק שאלות ומבחנים',
    subtitle: 'מבחני הסמכה, בחנים ושאלות',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/exams',
    keywords: ['מבחנים', 'בנק שאלות', 'הסמכה', 'exams'],
  },
  {
    id: 'page-media',
    title: 'ספריית מדיה',
    subtitle: 'קבצי וידאו, תמונות ומסמכים הדרכתיים',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/media',
    keywords: ['מדיה', 'תמונות', 'וידאו', 'מסמכים', 'media'],
  },
  {
    id: 'page-system-settings',
    title: 'הגדרות מערכת ומשתמשים',
    subtitle: 'ניהול משתמשים, מיתוג והגדרות אבטחה',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/settings',
    keywords: ['הגדרות', 'אבטחה', 'מיתוג', 'משתמשים', 'settings', 'users'],
  },
  {
    id: 'page-recycle-bin',
    title: 'סל מחזור',
    subtitle: 'שחזור פריטים שנמחקו מהמערכת',
    category: 'page',
    categoryLabel: 'ניווט במערכת',
    url: '/recycle-bin',
    keywords: ['סל מחזור', 'שחזור', 'אשפה', 'trash', 'recycle'],
  },
]

/**
 * שיעורים וקורסים במערכת
 */
const SAMPLE_LESSONS: SearchResultItem[] = [
  {
    id: 'lesson-service-basics',
    title: 'תקשורת שירותית ומצוינות בשירות',
    subtitle: 'שיעור 1 • מסלול יסודות השירות',
    category: 'lesson',
    categoryLabel: 'שיעור',
    url: '/trainings/689a24dc5ab69f2ded6a6252',
    badge: 'שיעור חובה',
    keywords: ['שירות', 'תקשורת', 'לקוחות', 'מצוינות'],
  },
  {
    id: 'lesson-fireberry-crm',
    title: 'עבודה יעילה במערכת Fireberry CRM',
    subtitle: 'שיעור 2 • תפעול מערכות',
    category: 'lesson',
    categoryLabel: 'שיעור',
    url: '/trainings/689a24dc5ab69f2ded6a6252',
    badge: 'מערכות פנים',
    keywords: ['fireberry', 'crm', 'לקוחות', 'כרטיס לקוח'],
  },
  {
    id: 'lesson-cyber-security',
    title: 'אבטחת מידע והגנת פרטיות בארגון',
    subtitle: 'שיעור 3 • אבטחת מידע',
    category: 'lesson',
    categoryLabel: 'שיעור',
    url: '/policies/seed-procedure-03',
    badge: 'הסמכה',
    keywords: ['סייבר', 'אבטחה', 'פרטיות', 'סיסמאות', 'פישינג'],
  },
  {
    id: 'lesson-objections',
    title: 'טכניקות מתקדמות לטיפול בהתנגדויות',
    subtitle: 'שיעור 4 • מיומנויות שיחה',
    category: 'lesson',
    categoryLabel: 'שיעור',
    url: '/trainings/689a24dc5ab69f2ded6a6252',
    badge: 'מכירות ושירות',
    keywords: ['התנגדויות', 'משא ומתן', 'שיחה', 'מכירה'],
  },
]

/**
 * מונחים מתוך מילון המושגים
 */
const SAMPLE_CONCEPTS: SearchResultItem[] = [
  {
    id: 'concept-ad',
    title: 'Active Directory (AD)',
    subtitle: 'שירות ניהול זהויות והרשאות ברשת הארגונית',
    category: 'concept',
    categoryLabel: 'מונח מקצועי',
    url: '/concepts',
    badge: 'ארגוני',
    keywords: ['ad', 'active directory', 'זהויות', 'משתמשים', 'domain'],
  },
  {
    id: 'concept-firewall',
    title: 'Firewall (חומת אש)',
    subtitle: 'מערכת הגנה המסננת תנועת רשת לפי חוקי אבטחה',
    category: 'concept',
    categoryLabel: 'מונח מקצועי',
    url: '/concepts',
    badge: 'אבטחה',
    keywords: ['firewall', 'חומת אש', 'רשת', 'אבטחה'],
  },
  {
    id: 'concept-sla',
    title: 'SLA (Service Level Agreement)',
    subtitle: 'הסכם רמת שירות וזמני מענה מוגדרים מראש',
    category: 'concept',
    categoryLabel: 'מונח מקצועי',
    url: '/concepts',
    badge: 'שירותים',
    keywords: ['sla', 'שירות', 'זמני מענה', 'אמנת שירות'],
  },
  {
    id: 'concept-sip',
    title: 'SIP Trunk / PBX',
    subtitle: 'פרוטוקול תקשורת לניהול שיחות טלפוניה ואינטרנט',
    category: 'concept',
    categoryLabel: 'מונח מקצועי',
    url: '/concepts',
    badge: 'פרוטוקולים',
    keywords: ['sip', 'pbx', 'מרכזיה', 'טלפוניה', 'החדשנות'],
  },
]

/**
 * בניית רשימת המערכות הארגוניות החיצוניות
 */
function getExternalSystemItems(): SearchResultItem[] {
  return EXTERNAL_SYSTEMS.filter((s) => s.enabled).map((sys) => ({
    id: `ext-sys-${sys.id}`,
    title: sys.label,
    subtitle: sys.title,
    category: 'system',
    categoryLabel: 'מערכת פנימית',
    url: sys.url,
    isExternal: true,
    badge: 'קישור חיצוני',
    keywords: [sys.label.toLowerCase(), sys.title.toLowerCase(), sys.id],
  }))
}

/**
 * מנוע החיפוש הראשי - מחפש בכל הקטגוריות במהירות ללא תלות באותיות קטנות/גדולות
 */
export function performSearch(query: string): SearchResultItem[] {
  const cleanQuery = query.trim().toLowerCase()
  if (!cleanQuery) return []

  const allItems: SearchResultItem[] = [
    ...NAVIGATION_PAGES,
    ...getExternalSystemItems(),
    ...SAMPLE_LESSONS,
    ...SAMPLE_CONCEPTS,
  ]

  return allItems.filter((item) => {
    const inTitle = item.title.toLowerCase().includes(cleanQuery)
    const inSubtitle =
      item.subtitle?.toLowerCase().includes(cleanQuery) ?? false
    const inKeywords =
      item.keywords?.some((kw) => kw.toLowerCase().includes(cleanQuery)) ??
      false

    return inTitle || inSubtitle || inKeywords
  })
}

// ==================== ניהול היסטוריית חיפוש ב-localStorage ====================

export function getRecentSearches(): string[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

export function addRecentSearch(query: string): string[] {
  const trimmed = query.trim()
  if (!trimmed) return getRecentSearches()

  const current = getRecentSearches()
  const filtered = current.filter(
    (item) => item.toLowerCase() !== trimmed.toLowerCase(),
  )
  const updated = [trimmed, ...filtered].slice(0, MAX_RECENT_SEARCHES)

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage fail safe
  }
  return updated
}

export function removeRecentSearch(query: string): string[] {
  const current = getRecentSearches()
  const updated = current.filter((item) => item !== query)
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
  } catch {
    // Storage fail safe
  }
  return updated
}

export function clearRecentSearches(): string[] {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch {
    // Storage fail safe
  }
  return []
}
