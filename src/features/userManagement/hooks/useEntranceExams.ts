/** מבחני-כניסה זמינים לשליחה לעובד קיים (Exam.is_entrance_exam, מסמך 26). */
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import { entranceExamOptions } from '../services/userDirectoryService'

export const entranceExamsQueryKey = ['userManagement', 'entranceExams'] as const

export function useEntranceExams() {
  const query = useQuery({
    queryKey: entranceExamsQueryKey,
    queryFn: () => apiClient.exams.findMany(),
  })
  return { options: entranceExamOptions(query.data ?? []), query }
}
