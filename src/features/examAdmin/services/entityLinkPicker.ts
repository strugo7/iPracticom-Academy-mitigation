/**
 * שירותי-בחירה לבורר-הישות של "מקושר אל" (LinkedEntityField/PickerPanel) —
 * שיטוח עץ-התוכן (contentManager) לרשימה שטוחה פר-רמה (track/module/topic/
 * lesson), עם מחלקות-האם (Track.category — הרמה היחידה שנושאת category
 * ב-schema; שאר הרמות יורשות אותה לצורכי סינון) וסינון-טקסט חופשי. פונקציות
 * טהורות.
 *
 * דה-דופ לפי entityId: מודול/נושא/שיעור עשויים להיות משותפים בין כמה מסלולים
 * (SharedModule מקושר ליותר מ-TrackModule אחד — ראו ModuleNode.sharedCount
 * ב-contentManager/types.ts) — אז אותה ישות תופיע פעם אחת בלבד, עם רשימת כל
 * המסלולים/המחלקות שהיא משויכת אליהן (לא שורה כפולה לכל מסלול).
 */
import type {
  ContentNodeKind,
  ContentTreeViewModel,
} from '@/features/contentManager'
import type { ExamDraft } from '../types'

export interface LinkableEntity {
  id: string
  kind: ContentNodeKind
  title: string
  /** כותרות כל המסלולים המכילים (יותר מאחד אם הישות משותפת). */
  trackTitles: string[]
  /** Track.category של כל המסלולים המכילים (מדולל, ללא null) — לסינון-מחלקה. */
  departments: string[]
}

/** שיטוח עץ-התוכן לרמה נבחרת בלבד לרשימת-בחירה שטוחה, מדוללת לפי entityId. */
export function flattenLinkableEntities(
  tree: ContentTreeViewModel,
  kind: ContentNodeKind,
): LinkableEntity[] {
  const byId = new Map<string, LinkableEntity>()

  const add = (
    id: string,
    title: string,
    trackTitle: string,
    department: string | null,
  ) => {
    const existing = byId.get(id)
    if (existing) {
      if (!existing.trackTitles.includes(trackTitle))
        existing.trackTitles.push(trackTitle)
      if (department && !existing.departments.includes(department))
        existing.departments.push(department)
      return
    }
    byId.set(id, {
      id,
      kind,
      title,
      trackTitles: [trackTitle],
      departments: department ? [department] : [],
    })
  }

  for (const track of tree.tracks) {
    const department = track.track.category?.trim() || null
    if (kind === 'track') {
      add(track.entityId, track.title, track.title, department)
      continue
    }
    for (const module of track.children) {
      if (kind === 'module') {
        add(module.entityId, module.title, track.title, department)
        continue
      }
      for (const topic of module.children) {
        if (kind === 'topic') {
          add(topic.entityId, topic.title, track.title, department)
          continue
        }
        for (const lesson of topic.children) {
          add(lesson.entityId, lesson.title, track.title, department)
        }
      }
    }
  }
  return [...byId.values()]
}

export interface LinkableEntityFilters {
  search: string
  /** null = כל המחלקות */
  department: string | null
}

export const EMPTY_LINKABLE_FILTERS: LinkableEntityFilters = {
  search: '',
  department: null,
}

export function filterLinkableEntities(
  items: LinkableEntity[],
  filters: LinkableEntityFilters,
): LinkableEntity[] {
  const q = filters.search.trim().toLowerCase()
  return items.filter((item) => {
    if (filters.department && !item.departments.includes(filters.department))
      return false
    if (q && !item.title.toLowerCase().includes(q)) return false
    return true
  })
}

/**
 * תיקון-טיוטה לאחר בחירה בפאנל — מאפס את כל ה-linked*Id ומציב רק את זה של
 * הרמה שנבחרה, וגוזר category מהמסלול-האם (SRS: category שדה חובה). כשהישות
 * משויכת למחלקה אחת בלבד היא נגזרת אוטומטית; כשהיא משותפת בין כמה מחלקות (או
 * לא משויכת לאף אחת) לא מנחשים — נשמר ה-category הקודם בטיוטה (fallbackCategory).
 */
export function patchForLinkedEntity(
  entity: LinkableEntity,
  fallbackCategory: string,
): Pick<
  ExamDraft,
  | 'linkedTrackId'
  | 'linkedModuleId'
  | 'linkedTopicId'
  | 'linkedLessonId'
  | 'category'
> {
  return {
    linkedTrackId: entity.kind === 'track' ? entity.id : null,
    linkedModuleId: entity.kind === 'module' ? entity.id : null,
    linkedTopicId: entity.kind === 'topic' ? entity.id : null,
    linkedLessonId: entity.kind === 'lesson' ? entity.id : null,
    category:
      entity.departments.length === 1
        ? entity.departments[0]
        : fallbackCategory,
  }
}
