/**
 * הרכבת כרטיסי-הקטלוג (TracksCatalog, doc 03) — ממפה מסלולים + progress_stats
 * שכבר חושבו ב-Phase 1 (recalculateUserStats) לכרטיס. אין כאן שום חישוב
 * התקדמות חדש. מקבל מערך מסלולים (לא מסלול יחיד) כך שתצוגת-הריבוי העתידית
 * של מנהל/אדמין (doc 03, נדחתה במפורש) תהיה תוספת, לא שכתוב.
 */
import type { ProgressStats } from '@/lib/services/progressService'
import type { LearningTrack, User } from '@/types/entities'
import type { TrackCatalogItem, TrackCatalogStatus } from '../types'

export function assembleTrackCatalog(
  tracks: LearningTrack[],
  user: Pick<User, 'assigned_track_id'>,
  stats: Pick<
    ProgressStats,
    'lessons_completed' | 'total_lessons_in_track' | 'avg_progress'
  >,
): TrackCatalogItem[] {
  const assigned = tracks.find((t) => t.id === user.assigned_track_id)
  if (!assigned || assigned.status !== 'published') return []

  const lessonsTotal = stats.total_lessons_in_track
  const lessonsCompleted = stats.lessons_completed
  const status: TrackCatalogStatus =
    lessonsTotal > 0 && lessonsCompleted >= lessonsTotal
      ? 'completed'
      : lessonsCompleted > 0
        ? 'in_progress'
        : 'not_started'

  return [
    {
      track: assigned,
      status,
      lessonsCompleted,
      lessonsTotal,
      percent: stats.avg_progress,
    },
  ]
}
