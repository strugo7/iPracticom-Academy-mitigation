/**
 * useDepartmentProgress — דשבורד המנהלים (PROGRESS_ENGINE.md §12).
 * מנהל בפועל = משתמש עם managed_department (מסמך 35 §6.3, לא role==='manager').
 * אוסף את חברי המחלקה המנוהלת + כל אירועיהם + הקטלוג, ומריץ את האגרגציה
 * הטהורה — אותו מנוע של הדשבורד האישי, ולכן אותם מספרים בהגדרה.
 *
 * הערת ביצועים (RealApi, Phase 12): כאן נשלפים כל אירועי ה-UserProgress
 * ומקובצים בצד הלקוח — מול ה-API הארגוני יידרש endpoint מסנן/אגרגטיבי
 * (מתועד ב-API_CONTRACT, שלב 2.2).
 */
import { useQuery } from '@tanstack/react-query'
import { ApiError, apiClient, type IApiClient } from '@/lib/api'
import {
  aggregateDepartmentProgress,
  type DepartmentProgress,
} from '@/lib/services/departmentProgressService'
import type { UserProgress } from '@/types/entities'

export const departmentProgressQueryKey = (managerUserId: string) =>
  ['department-progress', managerUserId] as const

/** הרכבת הקלט והרצת האגרגציה — מופרד מה-hook כדי להיבדק בלי React */
export async function fetchDepartmentProgress(
  api: IApiClient,
  managerUserId: string,
  now: Date,
): Promise<DepartmentProgress> {
  const manager = await api.users.findById(managerUserId)
  if (!manager) {
    throw new ApiError('not_found', `משתמש ${managerUserId} לא נמצא`)
  }
  const department = manager.managed_department
  if (!department) {
    throw new ApiError(
      'validation',
      'למשתמש אין מחלקה מנוהלת — גישת מנהל נקבעת לפי managed_department',
    )
  }

  const [members, allEvents, tracks, trackModules, topics, lessons, exams] =
    await Promise.all([
      api.users.findMany({ filter: { department } }),
      api.userProgress.findMany(),
      api.learningTracks.findMany(),
      api.trackModules.findMany(),
      api.topics.findMany(),
      api.moduleLessons.findMany(),
      api.exams.findMany(),
    ])

  const memberIds = new Set(members.map((m) => m.id))
  const eventsByUserId = new Map<string, UserProgress[]>()
  for (const e of allEvents) {
    if (!memberIds.has(e.user_id)) continue
    const group = eventsByUserId.get(e.user_id)
    if (group) group.push(e)
    else eventsByUserId.set(e.user_id, [e])
  }

  return aggregateDepartmentProgress({
    department,
    members,
    eventsByUserId,
    catalog: { tracks, trackModules, topics, lessons, exams },
    now,
  })
}

/** האגרגציה המחלקתית + מצבי loading/error של react-query */
export function useDepartmentProgress(managerUserId: string | undefined) {
  return useQuery<DepartmentProgress>({
    queryKey: departmentProgressQueryKey(managerUserId ?? ''),
    enabled: Boolean(managerUserId),
    queryFn: async () => {
      if (!managerUserId) throw new ApiError('validation', 'חסר מזהה משתמש')
      return fetchDepartmentProgress(apiClient, managerUserId, new Date())
    },
  })
}
