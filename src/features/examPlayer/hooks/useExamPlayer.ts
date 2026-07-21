/** useExamPlayer — קלט ה-ExamPlayer (מבחן + שאלות). מראה את useLessonPlayer. */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import {
  fetchExamPlayerInput,
  type ExamPlayerInput,
} from '../services/examPlayerService'

export const examPlayerQueryKey = (examId: string) =>
  ['exam-player', examId] as const

export function useExamPlayer(examId: string | undefined) {
  return useQuery<ExamPlayerInput>({
    queryKey: examPlayerQueryKey(examId ?? ''),
    enabled: Boolean(examId),
    queryFn: () => fetchExamPlayerInput(apiClient, examId as string),
  })
}
