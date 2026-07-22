/**
 * טיפוסי פח-האשפה (recycleBin) — feature חוצה-מערכת המאגד פריטים שנמחקו-רכות
 * (deleted_at != null) מכל הישויות הניתנות-למחיקה: נהלים, שיעורים, מונחים,
 * ותסריטי-שיחה. ה-view-model אחיד לכל הסוגים.
 */
import type { IconName } from '@/components/ui'

/** ארבעת סוגי-הישויות הניתנים למחיקה (פח אשפה מאוחד). */
export type TrashEntityType = 'procedure' | 'lesson' | 'concept' | 'flow'

/** פריט מחוק אחיד לתצוגה בפח. */
export interface DeletedItem {
  entityType: TrashEntityType
  /** תווית-סוג בעברית: נוהל / שיעור / מונח / תסריט שיחה. */
  typeLabel: string
  icon: IconName
  id: string
  title: string
  deletedByName: string | null
  deletedAt: string | null
  reason: string | null
}

/** צ'יפ הסינון לפי סוג. */
export type TrashFilter = 'all' | TrashEntityType
