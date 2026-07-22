/**
 * שירות פח-האשפה: איגוד פריטים מחוקים (deleted_at != null) מארבע הישויות,
 * שחזור (restore), ומחיקה-לצמיתות (purge). לוגיקה טהורה למיפוי + I/O דרך
 * apiClient. הסמן האחיד למחיקה הוא `deleted_at` (בלתי-תלוי ב-status).
 */
import type { IApiClient } from '@/lib/api/types'
import type {
  Concept,
  DeletionAudit,
  ModuleLesson,
  Procedure,
  TroubleshootingFlow,
} from '@/types/entities'
import type { DeletedItem, TrashEntityType } from '../types'

/** patch שמנקה את סימני-המחיקה (משותף לכל הסוגים בשחזור). */
const CLEAR_DELETION: DeletionAudit = {
  deleted_at: null,
  deleted_by_id: null,
  deleted_by_name: null,
  deletion_reason: null,
}

const isDeleted = (r: DeletionAudit): boolean => Boolean(r.deleted_at)

/** תאריך-מחיקה בפורמט ישראלי (Asia/Jerusalem). */
export function formatDeletedAt(iso: string | null | undefined): string {
  if (!iso) return ''
  return new Intl.DateTimeFormat('he-IL', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  }).format(new Date(iso))
}

function toItem(
  entityType: TrashEntityType,
  typeLabel: string,
  icon: DeletedItem['icon'],
  id: string,
  title: string,
  audit: DeletionAudit,
): DeletedItem {
  return {
    entityType,
    typeLabel,
    icon,
    id,
    title: title || '(ללא כותרת)',
    deletedByName: audit.deleted_by_name ?? null,
    deletedAt: audit.deleted_at ?? null,
    reason: audit.deletion_reason ?? null,
  }
}

/** מאגד את כל הפריטים המחוקים מכל ארבע הישויות, ממוין מהחדש-שנמחק לישן. */
export async function listDeleted(
  apiClient: IApiClient,
): Promise<DeletedItem[]> {
  const [procedures, lessons, concepts, flows] = await Promise.all([
    apiClient.procedures.findMany(),
    apiClient.moduleLessons.findMany(),
    apiClient.concepts.findMany(),
    apiClient.troubleshootingFlows.findMany(),
  ])

  const items: DeletedItem[] = []
  for (const p of procedures as Procedure[]) {
    if (isDeleted(p))
      items.push(toItem('procedure', 'נוהל', 'File', p.id, p.title, p))
  }
  for (const l of lessons as ModuleLesson[]) {
    if (isDeleted(l)) {
      items.push(
        toItem('lesson', 'שיעור', 'StickyNoteLine', l.id, l.title ?? '', l),
      )
    }
  }
  for (const c of concepts as Concept[]) {
    if (isDeleted(c)) {
      items.push(toItem('concept', 'מונח', 'QuestionFill', c.id, c.term, c))
    }
  }
  for (const f of flows as TroubleshootingFlow[]) {
    if (isDeleted(f)) {
      items.push(
        toItem('flow', 'תסריט שיחה', 'DataFlow', f.id, f.title ?? '', f),
      )
    }
  }

  return items.sort((a, b) =>
    (b.deletedAt ?? '').localeCompare(a.deletedAt ?? ''),
  )
}

/**
 * משחזר פריט מהפח: מנקה סימני-מחיקה. לישויות עם status (נוהל/שיעור/מונח) —
 * חוזר ל-'draft' (לא מפרסם אוטומטית). לתסריט (ללא status) — ניקוי בלבד.
 */
export async function restoreItem(
  apiClient: IApiClient,
  item: DeletedItem,
): Promise<void> {
  switch (item.entityType) {
    case 'procedure':
      await apiClient.procedures.update(item.id, {
        status: 'draft',
        ...CLEAR_DELETION,
      })
      break
    case 'lesson':
      await apiClient.moduleLessons.update(item.id, {
        status: 'draft',
        ...CLEAR_DELETION,
      })
      break
    case 'concept':
      await apiClient.concepts.update(item.id, {
        status: 'draft',
        ...CLEAR_DELETION,
      })
      break
    case 'flow':
      await apiClient.troubleshootingFlows.update(item.id, CLEAR_DELETION)
      break
  }
}

/** מוחק פריט לצמיתות (hard delete) — בלתי-הפיך, אדמין בלבד (נאכף ב-UI/שרת). */
export async function purgeItem(
  apiClient: IApiClient,
  item: DeletedItem,
): Promise<void> {
  switch (item.entityType) {
    case 'procedure':
      await apiClient.procedures.delete(item.id)
      break
    case 'lesson':
      await apiClient.moduleLessons.delete(item.id)
      break
    case 'concept':
      await apiClient.concepts.delete(item.id)
      break
    case 'flow':
      await apiClient.troubleshootingFlows.delete(item.id)
      break
  }
}
