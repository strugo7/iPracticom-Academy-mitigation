/**
 * שכבת-הקריאות של feature המונחים מול `apiClient.concepts` (IResource<Concept>).
 * רק כאן נגזרות קריאות ה-API; ה-hooks עוטפים ב-react-query (CLAUDE.md §8).
 */
import type { IApiClient } from '@/lib/api/types'
import type { Concept, ModuleLesson, Topic } from '@/types/entities'
import type { ConceptDraft, LinkedLesson } from '../types'
import { conceptPayload } from './conceptForm'

/** תווית-הקשר כשלשיעור אין נושא משויך (9 שיעורים יתומים בדאטה האמיתי). */
const UNKNOWN_LESSON_CONTEXT = 'שיעור באקדמיה'

export function listConcepts(api: IApiClient): Promise<Concept[]> {
  return api.concepts.findMany({ sort: 'term' })
}

export function getConcept(api: IApiClient, id: string): Promise<Concept | null> {
  return api.concepts.findById(id)
}

export function createConcept(
  api: IApiClient,
  draft: ConceptDraft,
): Promise<Concept> {
  return api.concepts.create({ ...conceptPayload(draft), view_count: 0 })
}

export function updateConcept(
  api: IApiClient,
  id: string,
  draft: ConceptDraft,
): Promise<Concept> {
  return api.concepts.update(id, conceptPayload(draft))
}

export function deleteConcept(api: IApiClient, id: string): Promise<void> {
  return api.concepts.delete(id)
}

/**
 * מאגר השיעורים לבורר "קישור לתוכן" (שלב 4) ולסקשן "מופיע בתוכן".
 * **שיעורים בלבד** — ה-junction `concept_lessons` הוא הקישור היחיד שקיים בסכמה
 * (schema/DDL_mysql.sql:614). קישור פולימורפי לתסריטים/נהלים
 * (`related_content[]`) מסומן במסמך 17 כהצעת-הרחבה חדשה שטרם אושרה מול צוות
 * ה-API — ולכן אינו ממומש כאן.
 *
 * ה-meta של כל שיעור מגיע מכותרת ה-Topic שלו; שני ה-fetches מקבילים.
 */
export async function listLinkedLessonOptions(
  api: IApiClient,
): Promise<LinkedLesson[]> {
  const [lessons, topics] = await Promise.all([
    api.moduleLessons.findMany(),
    api.topics.findMany(),
  ])
  const topicById = new Map(topics.map((t: Topic) => [t.id, t]))
  return lessons
    .filter((lesson: ModuleLesson) => Boolean(lesson.title))
    .map((lesson: ModuleLesson) => toLinkedLesson(lesson, topicById))
    .sort((a, b) => a.title.localeCompare(b.title, 'he'))
}

function toLinkedLesson(
  lesson: ModuleLesson,
  topicById: Map<string, Topic>,
): LinkedLesson {
  const topicTitle = lesson.topic_id
    ? topicById.get(lesson.topic_id)?.title
    : null
  return {
    lessonId: lesson.id,
    title: lesson.title ?? '',
    meta: topicTitle ? `נושא · ${topicTitle}` : UNKNOWN_LESSON_CONTEXT,
  }
}
