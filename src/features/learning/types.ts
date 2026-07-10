/**
 * טיפוסי ה-view-model של feature הלמידה — הצורה שהקומפוננטות מצפות לה,
 * נגזרת ע"י services/ מהקטלוג הגולמי + progress_stats (Phase 1). לא ישויות
 * גולמיות מה-API ולא מבנה שמור — נבנה מחדש בכל render.
 */
import type { LearningTrack } from '@/types/entities'

export type TrackCatalogStatus = 'not_started' | 'in_progress' | 'completed'

export interface TrackCatalogItem {
  track: LearningTrack
  status: TrackCatalogStatus
  lessonsCompleted: number
  lessonsTotal: number
  /** 0–100, מ-stats.avg_progress (Phase 1) — לא מחושב כאן */
  percent: number
}
