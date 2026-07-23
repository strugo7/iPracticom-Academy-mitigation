/**
 * מטא-תצוגה לספריית ה-Playbooks (מסמך 05). הצבעים הם 1:1 מתוך מפת ה-CATS
 * ב-design-export/PlaybookCard.dc.html — פלטת-קטגוריות מותאמת-מותג (לא טוקני-DS
 * גנריים, כי כל קטגוריה צריכה גוון ייחודי ועקבי). קטגוריה שאינה ברשימה מקבלת
 * מטא ניטרלי, כדי שאף Playbook לא ייעלם (כמו גלריית המונחים).
 */

/** צבעי תגית-הקטגוריה (רקע + טקסט), מפתחם ערך ה-category הקנוני (SRS §1.8). */
export const CATEGORY_META: Record<string, { bg: string; fg: string }> = {
  'מרכזיות ענן (PBX)': { bg: '#C9EDFF', fg: '#0075DB' },
  'Firewall MikroTik': { bg: 'rgba(46,180,255,.18)', fg: '#004E9B' },
  'מצלמות אבטחה': { bg: 'rgba(0,133,124,.15)', fg: '#00857C' },
  'מערכות סאונד': { bg: 'rgba(188,162,141,.3)', fg: '#8E7057' },
  'גילוי אש': { bg: '#FFDCD8', fg: '#C94236' },
  'בקרי טמפרטורה': { bg: '#FFEBA4', fg: '#8B700E' },
  רשתות: { bg: '#DDFFEA', fg: '#00857C' },
  כללי: { bg: '#E1E6EC', fg: '#757D86' },
}

/** מטא ניטרלי לקטגוריה שאינה ברשימה (design-export: general). */
export const CATEGORY_FALLBACK = { bg: '#E1E6EC', fg: '#757D86' } as const

export function categoryMeta(category: string | null | undefined): {
  bg: string
  fg: string
} {
  if (!category) return CATEGORY_FALLBACK
  return CATEGORY_META[category] ?? CATEGORY_FALLBACK
}

/** שתי לשוניות הספרייה (design-export/Troubleshooting.dc.html). */
export const LIBRARY_TABS = { library: 'library', missing: 'missing' } as const
export type LibraryTab = (typeof LIBRARY_TABS)[keyof typeof LIBRARY_TABS]
