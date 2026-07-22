/**
 * מפעיל את progressEvents.ts מתוך React: lesson_started ברגע שהשיעור נטען
 * (guard-ed ע"י ref כדי לא לירות פעמיים ב-re-render/StrictMode), ו-finishLesson
 * ליצירת lesson_completed (+topic/track) בסיום. מבטל את שני ה-caches שתלויים
 * בהתקדמות — progressQueryKey (סטטיסטיקות גלובליות) ו-trackDetailsQueryKey
 * (עץ-התוכן של דף המסלול) — לפי המוסכמה ב-useProgress.ts.
 */
import { useEffect, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import { progressQueryKey } from '@/lib/hooks/useProgress'
import { trackDetailsQueryKey } from '@/features/learning'
import type { ModuleLesson } from '@/types/entities'
import {
  completeLesson,
  ensureLessonStarted,
  type CompleteLessonOutcome,
} from '../services/progressEvents'

export function useLessonProgressEvents(
  trackId: string,
  lesson: ModuleLesson | undefined,
) {
  const queryClient = useQueryClient()
  const { user } = useAuth()
  const startedForLessonId = useRef<string | null>(null)
  // אתחול ב-0; הערך האמיתי נקבע באפקט (mountedAtRef.current = Date.now()) בטעינת
  // השיעור — הימנעות מקריאה לא-טהורה ב-render (react-hooks/purity).
  const mountedAtRef = useRef<number>(0)

  useEffect(() => {
    if (!user || !lesson) return
    if (startedForLessonId.current === lesson.id) return
    startedForLessonId.current = lesson.id
    mountedAtRef.current = Date.now()
    void ensureLessonStarted(apiClient, user.id, lesson, trackId).then(() => {
      queryClient.invalidateQueries({
        queryKey: trackDetailsQueryKey(trackId, user.id),
      })
    })
  }, [user, lesson, trackId, queryClient])

  async function finishLesson(): Promise<CompleteLessonOutcome | null> {
    if (!user || !lesson) return null
    const timeSpentMinutes = Math.max(
      1,
      Math.round((Date.now() - mountedAtRef.current) / 60000),
    )
    const outcome = await completeLesson({
      api: apiClient,
      userId: user.id,
      trackId,
      lesson,
      timeSpentMinutes,
    })
    queryClient.invalidateQueries({ queryKey: progressQueryKey(user.id) })
    queryClient.invalidateQueries({
      queryKey: trackDetailsQueryKey(trackId, user.id),
    })
    return outcome
  }

  return { finishLesson }
}
