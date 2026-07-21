/**
 * גזירות טהורות לפאנל ההגדרות (ContentManager, doc 12) — נתיב ה-node בעץ,
 * שורות המטא (מקביל ל-metaFor בעיצוב, אך מהנתונים האמיתיים) וה-breadcrumb.
 * ללא React, ללא side-effects — נבדק ביחידה.
 */
import type { ContentNode, ParentNode, TrackNode } from '../types'

export interface NodeMetaRow {
  label: string
  value: string
}

const hasChildren = (node: ContentNode): node is ParentNode =>
  node.kind !== 'lesson'

export function childCountOf(node: ContentNode): number {
  return hasChildren(node) ? node.children.length : 0
}

/** נתיב מהשורש ל-node (כולל אותו) לפי rowId — null אם לא נמצא. */
export function findNodePath(
  tracks: TrackNode[],
  rowId: string,
): ContentNode[] | null {
  const walk = (node: ContentNode, trail: ContentNode[]): ContentNode[] | null => {
    const nextTrail = [...trail, node]
    if (node.rowId === rowId) return nextTrail
    if (hasChildren(node)) {
      for (const child of node.children) {
        const found = walk(child, nextTrail)
        if (found) return found
      }
    }
    return null
  }
  for (const track of tracks) {
    const found = walk(track, [])
    if (found) return found
  }
  return null
}

/** ה-breadcrumb = שרשרת ההורים (ללא ה-node עצמו), מופרדת ב-· (design crumb). */
export function breadcrumbOf(path: ContentNode[]): string {
  return path
    .slice(0, -1)
    .map((n) => n.title)
    .join(' · ')
}

const minutesLabel = (n?: number | null) =>
  typeof n === 'number' && n > 0 ? `${n} דק׳` : '—'

/** שלוש שורות המטא לפי סוג ה-node (design metaFor) — מנתונים אמיתיים. */
export function nodeMetaRows(node: ContentNode): NodeMetaRow[] {
  switch (node.kind) {
    case 'track':
      return [
        { label: 'קטגוריה / מחלקה', value: node.track.category || '—' },
        {
          label: 'שעות לימוד',
          value:
            typeof node.track.estimated_hours === 'number'
              ? `${node.track.estimated_hours} שעות`
              : '—',
        },
        { label: 'מספר מודולים', value: String(node.children.length) },
      ]
    case 'module':
      return [
        { label: 'מודול משותף', value: node.sharedCount > 1 ? 'כן' : 'לא' },
        { label: 'מספר נושאים', value: String(node.children.length) },
        { label: 'משך מוערך', value: minutesLabel(node.module.estimated_duration) },
      ]
    case 'topic':
      return [
        { label: 'מספר שיעורים', value: String(node.children.length) },
        {
          label: 'משך מוערך',
          value: minutesLabel(
            node.children.reduce(
              (sum, l) => sum + (l.lesson.duration_minutes ?? 0),
              0,
            ),
          ),
        },
        { label: 'סטטוס', value: node.topic.status === 'published' ? 'פורסם' : 'טיוטה' },
      ]
    case 'lesson':
      return [
        {
          label: 'סוג עורך',
          value: node.lesson.editor_version === 'v2' ? 'בלוקים' : 'קלאסי',
        },
        { label: 'משך', value: minutesLabel(node.lesson.duration_minutes) },
        { label: 'ניקוד XP', value: String(node.lesson.xp_reward ?? 10) },
      ]
  }
}
