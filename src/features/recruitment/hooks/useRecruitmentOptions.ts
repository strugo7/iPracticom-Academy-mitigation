/**
 * נתוני-בחירה לטופס הזמנת-מועמד (Phase 8.1): מחלקות, מבחני-כניסה ומסלולים.
 * מבחן-כניסה = Exam.is_entrance_exam (מסמך 26); ערך-המחלקה הוא השם (כפי ש-
 * Invite.department נשמר). כל query עצמאי — react-query מטפל ב-cache.
 */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { SelectOption } from '../types'

export function useRecruitmentOptions() {
  const departments = useQuery({
    queryKey: ['recruitment', 'departments'],
    queryFn: () => apiClient.departments.findMany(),
  })
  const exams = useQuery({
    queryKey: ['recruitment', 'entranceExams'],
    queryFn: () => apiClient.exams.findMany(),
  })
  const tracks = useQuery({
    queryKey: ['recruitment', 'tracks'],
    queryFn: () => apiClient.learningTracks.findMany(),
  })

  const departmentOptions: SelectOption[] = (departments.data ?? []).map((d) => ({
    value: d.name,
    label: d.name,
  }))

  const examOptions: SelectOption[] = (exams.data ?? [])
    .filter((e) => e.is_entrance_exam)
    .map((e) => ({
      value: e.id,
      label: `${e.title ?? '—'} · ${e.questions?.length ?? 0} שאלות`,
    }))

  const trackOptions: SelectOption[] = (tracks.data ?? []).map((t) => ({
    value: t.id,
    label: t.title ?? '—',
  }))

  return {
    departmentOptions,
    examOptions,
    trackOptions,
    isLoading: departments.isLoading || exams.isLoading || tracks.isLoading,
  }
}
