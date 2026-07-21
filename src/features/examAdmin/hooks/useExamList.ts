/**
 * טעינת רשימת-המבחנים + חיפוש-כותרת. שכבת react-query מול apiClient.exams.
 */
import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { createDraftExam, deleteExam, listExams } from '../services/examService'
import { questionsQueryKey } from './useQuestionBank'

export const examsQueryKey = ['examAdmin', 'exams'] as const

export function useExamList() {
  const query = useQuery({
    queryKey: examsQueryKey,
    queryFn: () => listExams(apiClient),
  })
  const [search, setSearch] = useState('')

  const all = query.data ?? []
  const exams = useMemo(() => {
    const term = search.trim()
    return term ? all.filter((e) => (e.title ?? '').includes(term)) : all
  }, [all, search])

  return { query, search, setSearch, exams, total: all.length }
}

/** יצירת/מחיקת מבחן ברמת-הרשימה (usage_count מסונכרן ע"י examService במחיקה). */
export function useExamListMutations() {
  const queryClient = useQueryClient()
  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: examsQueryKey })
    queryClient.invalidateQueries({ queryKey: questionsQueryKey })
  }
  const create = useMutation({
    mutationFn: () => createDraftExam(apiClient),
    onSuccess: invalidate,
  })
  const remove = useMutation({
    mutationFn: (id: string) => deleteExam(apiClient, id),
    onSuccess: invalidate,
  })
  return {
    createDraft: () => create.mutateAsync(),
    deleteExam: (id: string) => remove.mutateAsync(id),
    isPending: create.isPending || remove.isPending,
    error: (create.error ?? remove.error) as Error | null,
  }
}
