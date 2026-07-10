/**
 * הרכבת כרטיס-הקטלוג (TracksCatalog, doc 03) — עוטף את ה-view-model שכבר
 * חושב ע"י trackDetailsService עבור המסלול המוקצה, ומקטלג את הסטטוס.
 *
 * שינוי (אימות ידני בדפדפן, אחרי Task 16): בעבר מיפה ישירות מ-progress_stats
 * (Phase 1) — אך זה כלל היסטוריית-השלמות של שיעורים שנמחקו מהקטלוג (9 מתוך 24
 * אצל tallevi), ויצר אי-התאמה גלויה מול TrackDetails לאותו מסלול (62% מול 38%).
 * כעת שני הדפים חולקים בדיוק את אותו חישוב (assembleTrackDetails) — עקביות
 * מובטחת by construction, לא רק בכוונה.
 */
import type {
  TrackCatalogItem,
  TrackCatalogStatus,
  TrackDetailsViewModel,
} from '../types'

export function assembleTrackCatalog(
  assignedTrackDetails: TrackDetailsViewModel | null,
): TrackCatalogItem[] {
  if (!assignedTrackDetails) return []
  const { track, lessonsDone, lessonsTotal, percent } = assignedTrackDetails
  if (track.status !== 'published') return []

  const status: TrackCatalogStatus =
    lessonsTotal > 0 && lessonsDone >= lessonsTotal
      ? 'completed'
      : lessonsDone > 0
        ? 'in_progress'
        : 'not_started'

  return [
    {
      track,
      status,
      lessonsCompleted: lessonsDone,
      lessonsTotal,
      percent,
    },
  ]
}
