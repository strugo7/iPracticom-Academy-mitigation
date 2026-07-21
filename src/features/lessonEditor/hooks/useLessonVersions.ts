/**
 * useLessonVersions — היסטוריית הגרסאות (LessonVersion, SRS §1.2). קורא את
 * הגרסאות דרך apiClient; יוצר גרסה חדשה (snapshot) בשמירה ידנית. אין רשומות
 * בגיבוי Base44, ולכן ל-MockApi אין fixture — שגיאת ה-fixture מתורגמת לרשימה
 * ריקה (ה-RealApi ב-Phase 11 יחזיר [] באופן טבעי, ללא שגיאה).
 */
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ApiError, apiClient } from '@/lib/api'
import { useAuth } from '@/lib/auth'
import type { LessonVersion } from '@/types/entities'
import type { LessonVersionSnapshot } from '../types'

export const lessonVersionsQueryKey = (lessonId: string) =>
  ['lesson-versions', lessonId] as const

async function loadVersions(lessonId: string): Promise<LessonVersion[]> {
  try {
    return await apiClient.lessonVersions.findMany({
      filter: { lesson_id: lessonId },
      sort: '-version_number',
    })
  } catch (error) {
    // אין fixture ל-LessonVersion (לא קיים בגיבוי) → אין גרסאות עדיין.
    if (error instanceof ApiError && error.code === 'server') return []
    throw error
  }
}

export function useLessonVersions(lessonId: string | undefined) {
  const queryClient = useQueryClient()
  const { user } = useAuth()

  const query = useQuery({
    queryKey: lessonVersionsQueryKey(lessonId ?? ''),
    enabled: Boolean(lessonId),
    queryFn: () => loadVersions(lessonId as string),
  })

  const versions = query.data ?? []

  const createVersion = useMutation({
    mutationFn: async (input: {
      description: string
      snapshot: LessonVersionSnapshot
    }) => {
      if (!lessonId) throw new Error('missing lessonId')
      const nextNumber =
        versions.reduce((max, v) => Math.max(max, v.version_number), 0) + 1
      return apiClient.lessonVersions.create({
        lesson_id: lessonId,
        version_number: nextNumber,
        description: input.description || null,
        data: input.snapshot,
        created_by_name: user?.full_name ?? null,
        created_by_email: user?.email ?? null,
      })
    },
    onSuccess: () => {
      if (lessonId) {
        queryClient.invalidateQueries({
          queryKey: lessonVersionsQueryKey(lessonId),
        })
      }
    },
  })

  return { query, versions, createVersion }
}
