/**
 * הרכבת עץ מפעל התוכן (ContentManager, doc 12) — קטלוג גולמי → היררכיה מקוננת
 * מסלול → מודול(TrackModule→SharedModule) → נושא → שיעור. פונקציה טהורה.
 *
 * תצוגת אדמין (בניגוד ל-trackDetailsService של feature הלמידה): לא מסונן-מחלקה,
 * כולל טיוטות, וכולל ענפים ריקים (מודול בלי נושאים, נושא בלי שיעורים) — כי זהו
 * כלי-הבנייה שבו האדמין מוסיף תוכן. רשומות 'deleted' מסוננות בכל הרמות.
 */
import type {
  LearningTrack,
  ModuleLesson,
  SharedModule,
  Topic,
  TrackModule,
} from '@/types/entities'
import type {
  ContentTreeViewModel,
  LessonNode,
  ModuleNode,
  TopicNode,
  TrackNode,
} from '../types'

export interface ContentCatalog {
  tracks: LearningTrack[]
  trackModules: TrackModule[]
  sharedModules: SharedModule[]
  topics: Topic[]
  lessons: ModuleLesson[]
}

function byOrder<T extends { order_index?: number | null }>(a: T, b: T): number {
  return (
    (a.order_index ?? Number.MAX_SAFE_INTEGER) -
    (b.order_index ?? Number.MAX_SAFE_INTEGER)
  )
}

const isLive = (status?: string | null) => status !== 'deleted'
const titleOf = (t?: string | null) => (t?.trim() ? t : 'ללא כותרת')

/** קיבוץ לרשימות לפי מפתח, בסינון 'deleted'. */
function groupBy<T>(items: T[], keyOf: (item: T) => string | null): Map<string, T[]> {
  const map = new Map<string, T[]>()
  for (const item of items) {
    const key = keyOf(item)
    if (key === null) continue
    const list = map.get(key)
    if (list) list.push(item)
    else map.set(key, [item])
  }
  return map
}

export function assembleContentTree(catalog: ContentCatalog): ContentTreeViewModel {
  const sharedModuleById = new Map(
    catalog.sharedModules.filter((m) => isLive(m.status)).map((m) => [m.id, m]),
  )

  // כמה מסלולים מקושרים לכל SharedModule (סימון "משותף" + אזהרה).
  const linkCountByModuleId = new Map<string, number>()
  for (const tm of catalog.trackModules) {
    if (!tm.shared_module_id) continue
    linkCountByModuleId.set(
      tm.shared_module_id,
      (linkCountByModuleId.get(tm.shared_module_id) ?? 0) + 1,
    )
  }

  const topicsByModuleId = groupBy(
    catalog.topics.filter((t) => isLive(t.status)),
    (t) => t.shared_module_id ?? null,
  )
  const lessonsByTopicId = groupBy(
    catalog.lessons.filter((l) => isLive(l.status)),
    (l) => l.topic_id ?? null,
  )
  const trackModulesByTrackId = groupBy(
    catalog.trackModules,
    (tm) => tm.track_id ?? null,
  )

  const buildLessons = (topic: Topic): LessonNode[] =>
    (lessonsByTopicId.get(topic.id) ?? [])
      .slice()
      .sort(byOrder)
      .map((lesson) => ({
        rowId: `lesson:${lesson.id}`,
        kind: 'lesson' as const,
        entityId: lesson.id,
        title: titleOf(lesson.title),
        order: lesson.order_index ?? 0,
        lesson,
        topicId: topic.id,
      }))

  const buildTopics = (moduleId: string): TopicNode[] =>
    (topicsByModuleId.get(moduleId) ?? [])
      .slice()
      .sort(byOrder)
      .map((topic) => ({
        rowId: `topic:${topic.id}`,
        kind: 'topic' as const,
        entityId: topic.id,
        title: titleOf(topic.title),
        order: topic.order_index ?? 0,
        topic,
        sharedModuleId: moduleId,
        children: buildLessons(topic),
      }))

  const buildModules = (track: LearningTrack): ModuleNode[] =>
    (trackModulesByTrackId.get(track.id) ?? [])
      .slice()
      // אנומליית-נתונים: קישור בלי shared_module_id תקין מסונן (ראו entities.ts)
      .filter(
        (tm): tm is TrackModule & { shared_module_id: string } =>
          !!tm.shared_module_id && sharedModuleById.has(tm.shared_module_id),
      )
      .sort(byOrder)
      .map((tm) => {
        const module = sharedModuleById.get(tm.shared_module_id) as SharedModule
        return {
          rowId: `module:${tm.id}`,
          kind: 'module' as const,
          entityId: module.id,
          title: titleOf(module.title),
          order: tm.order_index ?? 0,
          module,
          trackModuleId: tm.id,
          trackId: track.id,
          sharedCount: linkCountByModuleId.get(module.id) ?? 1,
          children: buildTopics(module.id),
        }
      })

  const tracks: TrackNode[] = catalog.tracks
    .filter((t) => isLive(t.status))
    .slice()
    .sort(byOrder)
    .map((track) => ({
      rowId: `track:${track.id}`,
      kind: 'track' as const,
      entityId: track.id,
      title: titleOf(track.title),
      order: track.order_index ?? 0,
      track,
      children: buildModules(track),
    }))

  return { tracks, trackCount: tracks.length }
}

/**
 * גיזום העץ לחיפוש: node נשאר אם כותרתו תואמת או שיש לו צאצא תואם (ואבותיו
 * נשמרים לשמירת ההקשר). טהור — לא מוטט את מבנה ה-nodes, רק מסנן ילדים.
 */
export function filterContentTree(
  tracks: TrackNode[],
  query: string,
): TrackNode[] {
  const q = query.trim().toLowerCase()
  if (!q) return tracks
  const matches = (title: string) => title.toLowerCase().includes(q)

  const keepTopic = (topic: TopicNode): TopicNode | null => {
    if (matches(topic.title)) return topic
    const lessons = topic.children.filter((l) => matches(l.title))
    return lessons.length > 0 ? { ...topic, children: lessons } : null
  }
  const keepModule = (module: ModuleNode): ModuleNode | null => {
    if (matches(module.title)) return module
    const topics = module.children
      .map(keepTopic)
      .filter((t): t is TopicNode => t !== null)
    return topics.length > 0 ? { ...module, children: topics } : null
  }
  return tracks
    .map((track): TrackNode | null => {
      if (matches(track.title)) return track
      const modules = track.children
        .map(keepModule)
        .filter((m): m is ModuleNode => m !== null)
      return modules.length > 0 ? { ...track, children: modules } : null
    })
    .filter((t): t is TrackNode => t !== null)
}
