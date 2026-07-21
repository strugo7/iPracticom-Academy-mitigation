/** פעולות-מגירת-משתמש שיוצרות התראה: הודעה חופשית / הקצאת מבחן-כניסה. */
import { useMutation } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Exam } from '@/types/entities'
import { sendEntranceExamAssignment, sendSystemMessage } from '../services/notificationService'

export function useNotificationActions() {
  const messageMutation = useMutation({
    mutationFn: ({ userId, message }: { userId: string; message: string }) =>
      sendSystemMessage(apiClient, userId, message),
  })

  const examMutation = useMutation({
    mutationFn: ({ userId, exam }: { userId: string; exam: Exam }) =>
      sendEntranceExamAssignment(apiClient, userId, exam),
  })

  return {
    sendMessage: (userId: string, message: string) =>
      messageMutation.mutateAsync({ userId, message }),
    sendExam: (userId: string, exam: Exam) => examMutation.mutateAsync({ userId, exam }),
    isSendingMessage: messageMutation.isPending,
    isSendingExam: examMutation.isPending,
  }
}
