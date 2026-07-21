/**
 * כל פעולות-הכתיבה של מאגר-השאלות תחת useMutation אחד (מנתב לפי op ל-
 * questionService), עם invalidate של רשימת-השאלות (וגם המבחנים — שינוי שאלה
 * משפיע על הבונה) ומצב pending/error גלובלי.
 */
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Question } from '@/types/entities'
import {
  createQuestion,
  createQuestions,
  deleteQuestion,
  duplicateQuestion,
  setQuestionStatus,
  updateQuestion,
} from '../services/questionService'
import type { QuestionContentInput } from '../services/questionForm'
import type { EditableStatus } from '../types'
import { examsQueryKey } from './useExamList'
import { questionsQueryKey } from './useQuestionBank'

type Vars =
  | { op: 'create'; input: QuestionContentInput }
  | { op: 'update'; id: string; input: QuestionContentInput }
  | { op: 'duplicate'; source: Question }
  | { op: 'status'; id: string; status: EditableStatus }
  | { op: 'delete'; id: string }
  | { op: 'importMany'; inputs: QuestionContentInput[] }

async function run(vars: Vars): Promise<Question | Question[] | void> {
  switch (vars.op) {
    case 'create':
      return createQuestion(apiClient, vars.input)
    case 'update':
      return updateQuestion(apiClient, vars.id, vars.input)
    case 'duplicate':
      return duplicateQuestion(apiClient, vars.source)
    case 'status':
      return setQuestionStatus(apiClient, vars.id, vars.status)
    case 'delete':
      return deleteQuestion(apiClient, vars.id)
    case 'importMany':
      return createQuestions(apiClient, vars.inputs)
  }
}

export function useQuestionMutations() {
  const queryClient = useQueryClient()
  const mutation = useMutation({
    mutationFn: run,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: questionsQueryKey })
      queryClient.invalidateQueries({ queryKey: examsQueryKey })
    },
  })
  const call = mutation.mutateAsync

  return {
    isPending: mutation.isPending,
    error: mutation.error as Error | null,
    reset: mutation.reset,
    create: (input: QuestionContentInput) =>
      call({ op: 'create', input }) as Promise<Question>,
    update: (id: string, input: QuestionContentInput) =>
      call({ op: 'update', id, input }) as Promise<Question>,
    duplicate: (source: Question) =>
      call({ op: 'duplicate', source }) as Promise<Question>,
    setStatus: (id: string, status: EditableStatus) =>
      call({ op: 'status', id, status }) as Promise<Question>,
    remove: (id: string) => call({ op: 'delete', id }) as Promise<void>,
    importMany: (inputs: QuestionContentInput[]) =>
      call({ op: 'importMany', inputs }) as Promise<Question[]>,
  }
}
