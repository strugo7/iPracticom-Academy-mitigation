/**
 * שליחת התראות מ-ניהול-משתמשים (SRS §2.1 createNotification, מסמך 26):
 * "שלח הודעה" (טקסט חופשי) ו"שלח מבחן כניסה" (הקצאה + התראה). אין רשומות
 * Notification בגיבוי — נכתבות כאן לראשונה (ראו entities.ts).
 */
import type { IApiClient } from '@/lib/api'
import type { Exam } from '@/types/entities'

export async function sendSystemMessage(
  api: IApiClient,
  userId: string,
  message: string,
): Promise<void> {
  await api.notifications.create({
    user_id: userId,
    type: 'system_alert',
    title: 'הודעה ממנהל המערכת',
    message,
    priority: 'medium',
    is_read: false,
  })
}

export async function sendEntranceExamAssignment(
  api: IApiClient,
  userId: string,
  exam: Exam,
): Promise<void> {
  await api.notifications.create({
    user_id: userId,
    type: 'system_alert',
    title: 'הוקצה לך מבחן כניסה',
    message: `הוקצה לך מבחן "${exam.title ?? ''}" להשלמה.`,
    priority: 'high',
    is_read: false,
    link: `/exams/${exam.exam_id}/take`,
  })
}
