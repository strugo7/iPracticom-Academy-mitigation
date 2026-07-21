/**
 * שליפת קלט נגן-השיעור — שיעור בודד + המבחן המקושר (אם יש), מראה את התבנית
 * של fetchTrackDetailsInput (features/learning). "משחקי" (playable) רק אם
 * v2 עם blocks[] לא-ריק (מסמך 19: v1 legacy אינו נתמך בנגן).
 */
import { ApiError, type IApiClient } from '@/lib/api'
import type { Exam, ModuleLesson } from '@/types/entities'

export interface LessonPlayerInput {
  lesson: ModuleLesson
  linkedExam: Pick<Exam, 'id' | 'title'> | null
}

export async function fetchLessonPlayerInput(
  api: IApiClient,
  lessonId: string,
): Promise<LessonPlayerInput> {
  const lesson = await api.moduleLessons.findById(lessonId)
  if (!lesson) {
    throw new ApiError('not_found', `שיעור ${lessonId} לא נמצא`)
  }
  const linkedExam = lesson.linked_exam_id
    ? await api.exams.findById(lesson.linked_exam_id)
    : null
  return { lesson, linkedExam }
}

/** true אם השיעור ניתן לרינדור בנגן — v2 עם blocks[] לא-ריק בלבד. */
export function isPlayableLesson(lesson: ModuleLesson): boolean {
  return (
    lesson.editor_version === 'v2' &&
    Array.isArray(lesson.blocks) &&
    lesson.blocks.length > 0
  )
}
