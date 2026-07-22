/**
 * שליחת תזכורת קרא-וחתום לעובדים שטרם חתמו. בעולם האמיתי זו הפונקציה
 * `sendProcedureNotification` (SRS §2.6) שרצה דרך n8n→Resend (Phase 12). כאן,
 * במצב Mock, התזכורת יוצרת רשומת Notification לכל ממתין — כך היא מזינה את
 * מרכז-ההתראות באפליקציה ומדגימה את הזרימה מקצה-לקצה על נתונים אמיתיים.
 */
import type { IApiClient } from '@/lib/api/types'
import type { PolicyTracking, TrackingEmployee } from '../types'

/** יוצר התראת-תזכורת לעובד בודד. */
async function notifyEmployee(
  apiClient: IApiClient,
  procedureId: string,
  title: string,
  employee: TrackingEmployee,
): Promise<void> {
  await apiClient.notifications.create({
    user_id: employee.userId,
    type: 'system_alert',
    title: 'תזכורת: נוהל לקריאה וחתימה',
    message: `נדרשת קריאה וחתימה על הנוהל "${title}".`,
    priority: 'medium',
    is_read: false,
    link: `/policies/${procedureId}`,
    dedupe_key: `policy-reminder:${procedureId}:${employee.userId}`,
  })
}

/** שולח תזכורת לכל הממתינים בנוהל. מחזיר את מספר הנמענים. */
export async function remindAllPending(
  apiClient: IApiClient,
  tracking: PolicyTracking,
): Promise<number> {
  const pending = tracking.employees.filter((e) => e.status === 'pending')
  await Promise.all(
    pending.map((employee) =>
      notifyEmployee(apiClient, tracking.procedureId, tracking.title, employee),
    ),
  )
  return pending.length
}

/** שולח תזכורת לעובד בודד (כפתור "תזכורת" בשורה). */
export async function remindEmployee(
  apiClient: IApiClient,
  procedureId: string,
  title: string,
  employee: TrackingEmployee,
): Promise<void> {
  await notifyEmployee(apiClient, procedureId, title, employee)
}
