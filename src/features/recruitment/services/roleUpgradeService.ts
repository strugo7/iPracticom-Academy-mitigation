/**
 * החלטת-מנהל על בקשת שדרוג-תפקיד (SRS §1.11, מסמך 35).
 *
 * ⚠️ מעדכן את רשומת-הבקשה בלבד (status/reviewed_by/reviewed_at/review_notes).
 * יישום התפקיד עצמו (User.role) הוא server-side בלבד — RBAC נאכף בשרת, לעולם
 * לא בלקוח (CLAUDE.md §5). ב-Phase 12 זו קריאת-RealApi אחת שגם מעלה את התפקיד.
 */
import type { IApiClient } from '@/lib/api'
import type { RoleUpgradeRequest } from '@/types/entities'

export type RoleUpgradeDecision = 'approved' | 'rejected'

export async function reviewRoleUpgrade(
  api: IApiClient,
  request: RoleUpgradeRequest,
  status: RoleUpgradeDecision,
  notes: string,
  reviewer: { id: string; email: string },
): Promise<RoleUpgradeRequest> {
  return api.roleUpgradeRequests.update(request.id, {
    status,
    reviewed_by: reviewer.email,
    reviewed_at: new Date().toISOString(),
    review_notes: notes.trim() || null,
  })
}

/** מיון מהחדשה לישנה — הרכבה טהורה (CLAUDE.md §4). */
export function sortRoleUpgrades(list: RoleUpgradeRequest[]): RoleUpgradeRequest[] {
  return [...list].sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date))
}
