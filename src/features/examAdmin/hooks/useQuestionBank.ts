/**
 * טעינת מאגר-השאלות + מצב-סינון. שכבת react-query היחידה מול apiClient.questions;
 * הסינון עצמו טהור (questionSearch) ונגזר ב-useMemo. הקומפוננטה רק צורכת.
 */
import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  categoryOptions,
  filterQuestions,
  hasActiveFilters,
} from '../services/questionSearch'
import { listQuestions } from '../services/questionService'
import { EMPTY_QUESTION_FILTERS, type QuestionFilters } from '../types'

export const questionsQueryKey = ['examAdmin', 'questions'] as const

export function useQuestionBank() {
  const query = useQuery({
    queryKey: questionsQueryKey,
    queryFn: () => listQuestions(apiClient),
  })
  const [filters, setFilters] = useState<QuestionFilters>(EMPTY_QUESTION_FILTERS)

  const all = query.data ?? []
  const filtered = useMemo(() => filterQuestions(all, filters), [all, filters])
  const categories = useMemo(() => categoryOptions(all), [all])

  return {
    query,
    filters,
    setFilters,
    resetFilters: () => setFilters(EMPTY_QUESTION_FILTERS),
    filtered,
    categories,
    total: all.length,
    isFiltering: hasActiveFilters(filters),
  }
}
