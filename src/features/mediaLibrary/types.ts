/**
 * טיפוסי ספריית המדיה (מסמך 15). ה-view-models מפרידים את הישות הגולמית
 * (MediaAsset) מהתצוגה — הקומפוננטות מקבלות רק את מה שהן מציגות.
 */
import type { MediaAsset, MediaFileType } from '@/types/entities'

/** ערך פילטר-סוג: 'all' או אחד מסוגי הקובץ. */
export type TypeFilter = 'all' | MediaFileType

/** סינון לפי מצב-שימוש (design: צ'יפ "בשימוש"). */
export type UsageFilter = 'all' | 'used' | 'unused'

/** אפשרויות מיון (design: "לפי נושא / נוסף לאחרונה / הכי בשימוש"). */
export type MediaSort = 'recent' | 'topic' | 'most-used'

export interface MediaFilters {
  search: string
  type: TypeFilter
  usage: UsageFilter
  topic: string | null
  tag: string | null
  sort: MediaSort
}

export const EMPTY_MEDIA_FILTERS: MediaFilters = {
  search: '',
  type: 'all',
  usage: 'all',
  topic: null,
  tag: null,
  sort: 'recent',
}

/** נכס מועשר לתצוגה: הישות + שדות נגזרים (שם-מעלה, מונה-שימוש, מצב-שימוש). */
export interface MediaAssetView {
  asset: MediaAsset
  /** שם המעלה שהודר מ-created_by_id, או null אם לא נמצא (design: "מערכת") */
  uploaderName: string | null
  usageCount: number
  inUse: boolean
}
