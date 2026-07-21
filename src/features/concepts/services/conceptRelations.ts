/**
 * פונקציות טהורות לעמוד-המונח המלא (wiki-style): פתרון "מונחים קשורים"
 * לקישורים בין-מונחים, ואיחוד "נלמד בשיעורים" משני מקורות.
 */
import type { Concept, ModuleLesson, Topic } from '@/types/entities'
import { conceptIdsInLesson } from '../marker/conceptMarkers'
import type { LinkedLesson } from '../types'

export interface RelatedConceptLink {
  /** התווית כפי שהיא ב-related_terms (תמיד מוצגת). */
  label: string
  /** ה-Concept התואם אם קיים במאגר — אז התווית לחיצה (wiki-link). */
  concept: Concept | null
}

/**
 * `related_terms` הן מחרוזות-תצוגה (RELATIONSHIPS.md), לא מזהי-ישות. כאן מנסים
 * להתאים כל תווית למונח קיים (לפי term או synonym, ללא תלות ברישיות/רווחים) —
 * מה שנמצא הופך ל-wiki-link, השאר נשאר טקסט. לא ממציאים קישור למונח שאינו קיים.
 */
export function resolveRelatedConcepts(
  concept: Concept,
  allConcepts: Concept[],
): RelatedConceptLink[] {
  const norm = (s: string) => s.trim().toLowerCase()
  const byKey = new Map<string, Concept>()
  for (const c of allConcepts) {
    if (c.id === concept.id) continue
    byKey.set(norm(c.term), c)
    for (const syn of c.synonyms ?? []) byKey.set(norm(syn), c)
  }
  return (concept.related_terms ?? []).map((label) => ({
    label,
    concept: byKey.get(norm(label)) ?? null,
  }))
}

/**
 * "נלמד בשיעורים" = איחוד שני מקורות, בלי כפילויות:
 * 1. backlinks — שיעורים שבהם המונח **מסומן בטקסט** (concept markers).
 * 2. related_lessons — קישור מפורש שהוגדר באשף המונח.
 * ה-meta של כל שיעור נגזר מכותרת ה-Topic שלו.
 */
export function resolveLinkedLessons(
  concept: Concept,
  lessons: ModuleLesson[],
  topics: Topic[],
): LinkedLesson[] {
  const topicById = new Map(topics.map((t) => [t.id, t]))
  const wanted = new Set(concept.related_lessons ?? [])
  const result: LinkedLesson[] = []
  const seen = new Set<string>()

  for (const lesson of lessons) {
    const marked = conceptIdsInLesson(lesson).includes(concept.id)
    if (!marked && !wanted.has(lesson.id)) continue
    if (seen.has(lesson.id)) continue
    seen.add(lesson.id)
    const topicTitle = lesson.topic_id ? topicById.get(lesson.topic_id)?.title : null
    result.push({
      lessonId: lesson.id,
      title: lesson.title ?? '',
      meta: topicTitle ? `נושא · ${topicTitle}` : 'שיעור באקדמיה',
    })
  }
  return result.sort((a, b) => a.title.localeCompare(b.title, 'he'))
}
