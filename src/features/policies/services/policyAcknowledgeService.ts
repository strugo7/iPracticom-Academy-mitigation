/**
 * חתימת קרא-וחתום (SRS §2.6 `acknowledgeProcedure`). יוצר ProcedureAcknowledgement
 * למשתמש הנוכחי, עם snapshot של שם/מייל וחותמת-זמן. מכבד את
 * UNIQUE(procedure_id, user_id) — חתימה קיימת מוחזרת as-is (אידמפוטנטי), לא
 * נוצרת כפילות. ip_address נשאר null בצד-הלקוח (השרת ימלא ב-Phase 12).
 */
import type { IApiClient } from '@/lib/api/types'
import type { ProcedureAcknowledgement, User } from '@/types/entities'

/** מאתר את חתימת המשתמש על נוהל (null אם טרם חתם). */
export async function findUserAcknowledgement(
  apiClient: IApiClient,
  procedureId: string,
  userId: string,
): Promise<ProcedureAcknowledgement | null> {
  const matches = await apiClient.procedureAcknowledgements.findMany({
    filter: { procedure_id: procedureId, user_id: userId },
    limit: 1,
  })
  return matches[0] ?? null
}

/**
 * חותם על הנוהל בשם המשתמש. אם כבר חתם — מחזיר את החתימה הקיימת (UNIQUE),
 * כדי שלחיצה כפולה/רענון לא ייצרו רשומה שנייה.
 */
export async function acknowledgeProcedure(
  apiClient: IApiClient,
  procedureId: string,
  user: User,
): Promise<ProcedureAcknowledgement> {
  const existing = await findUserAcknowledgement(
    apiClient,
    procedureId,
    user.id,
  )
  if (existing) return existing

  return apiClient.procedureAcknowledgements.create({
    procedure_id: procedureId,
    user_id: user.id,
    user_name: user.full_name,
    user_email: user.email,
    acknowledged_at: new Date().toISOString(),
    ip_address: null,
  })
}
