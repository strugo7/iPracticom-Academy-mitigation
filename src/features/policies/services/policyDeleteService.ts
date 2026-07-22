/**
 * מחיקת נוהל — **soft-delete מתועד** (CLAUDE.md §5: פעולה רגישה נרשמת לביקורת).
 * לא מוחק את הרשומה: מסמן status='deleted' ושומר מי מחק, מתי, ולמה. כך הנוהל
 * נעלם מהגלריה (מסונן ב-policyGalleryService) אך נשמר לתיעוד ובקרה.
 * הרשאה (מנהל בלבד) נאכפת בשרת; הבדיקה בלקוח היא נוחות-UI (isManager).
 */
import type { IApiClient } from '@/lib/api/types'
import type { Procedure, User } from '@/types/entities'

/** אורך-מינימום לסיבת-מחיקה (מונע "." ריק). */
export const MIN_DELETION_REASON_LENGTH = 3

/** האם סיבת-המחיקה תקינה (לאחר trim). */
export function isValidDeletionReason(reason: string): boolean {
  return reason.trim().length >= MIN_DELETION_REASON_LENGTH
}

/**
 * מוחק נוהל (soft) עם תיעוד. זורק אם הסיבה ריקה/קצרה מדי — הוולידציה כאן
 * ולא רק ב-UI, כדי שגם קריאות אחרות יחויבו בסיבה.
 */
export async function softDeleteProcedure(
  apiClient: IApiClient,
  procedureId: string,
  user: User,
  reason: string,
): Promise<Procedure> {
  if (!isValidDeletionReason(reason)) {
    throw new Error('deletion reason required')
  }
  return apiClient.procedures.update(procedureId, {
    status: 'deleted',
    deleted_by_id: user.id,
    deleted_by_name: user.full_name,
    deleted_at: new Date().toISOString(),
    deletion_reason: reason.trim(),
  })
}
