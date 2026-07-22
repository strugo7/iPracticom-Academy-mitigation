/**
 * מעקב קרא-וחתום: בהינתן נוהל + משתמשים + אישורים, מחשב מי חתם ומי ממתין,
 * סיכום כללי, ופילוח מחלקתי. לוגיקה טהורה (נבדקת ב-*.test.ts). מנצל את
 * resolveAudienceIds המשותף — קהל-היעד זהה לזה של מד-המילוי בגלריה.
 */
import type { IApiClient } from '@/lib/api/types'
import type {
  Procedure,
  ProcedureAcknowledgement,
  User,
} from '@/types/entities'
import type {
  DepartmentBreakdown,
  PolicyTracking,
  TrackingEmployee,
} from '../types'
import { completionPercent, resolveAudienceIds } from './policyAudience'

const departmentLabel = (departments: string[] | null | undefined): string => {
  const depts = departments ?? []
  if (depts.length === 0) return 'כל המחלקות'
  if (depts.length === 1) return depts[0] as string
  return `${depts.length} מחלקות`
}

/** ממפה procedure_id→user_id→acknowledged_at (אחרון גובר; חתימה אחת פר משתמש). */
function signedAtByUser(
  procedureId: string,
  acknowledgements: ProcedureAcknowledgement[],
): Map<string, string> {
  const map = new Map<string, string>()
  for (const ack of acknowledgements) {
    if (ack.procedure_id !== procedureId) continue
    map.set(ack.user_id, ack.acknowledged_at)
  }
  return map
}

/** בונה את שורות העובדים — ממתינים קודם (design), ואז לפי שם. */
function buildEmployees(
  audienceUsers: User[],
  signedAt: Map<string, string>,
): TrackingEmployee[] {
  return audienceUsers
    .map((user) => {
      const acknowledgedAt = signedAt.get(user.id) ?? null
      return {
        userId: user.id,
        name: user.full_name,
        department: user.department ?? null,
        status: acknowledgedAt ? 'signed' : 'pending',
        acknowledgedAt,
      } satisfies TrackingEmployee
    })
    .sort((a, b) => {
      if (a.status !== b.status) return a.status === 'pending' ? -1 : 1
      return a.name.localeCompare(b.name, 'he')
    })
}

/** פילוח מחלקתי — קיבוץ קהל-היעד לפי מחלקה וספירת חתומים בכל אחת. */
function buildDepartmentBreakdown(
  audienceUsers: User[],
  signedAt: Map<string, string>,
): DepartmentBreakdown[] {
  const groups = new Map<string, { signed: number; total: number }>()
  for (const user of audienceUsers) {
    const name = user.department ?? 'ללא מחלקה'
    const group = groups.get(name) ?? { signed: 0, total: 0 }
    group.total += 1
    if (signedAt.has(user.id)) group.signed += 1
    groups.set(name, group)
  }
  return [...groups.entries()]
    .map(([name, g]) => ({
      name,
      signed: g.signed,
      total: g.total,
      percent: completionPercent(g.signed, g.total),
    }))
    .sort((a, b) => b.total - a.total || a.name.localeCompare(b.name, 'he'))
}

/** מחשב את מודל המעקב המלא לנוהל בודד. */
export function computePolicyTracking(
  procedure: Procedure,
  users: User[],
  acknowledgements: ProcedureAcknowledgement[],
): PolicyTracking {
  const audienceIds = resolveAudienceIds(procedure, users)
  const audienceUsers = users.filter((u) => audienceIds.has(u.id))
  const signedAt = signedAtByUser(procedure.id, acknowledgements)

  const employees = buildEmployees(audienceUsers, signedAt)
  const signed = employees.filter((e) => e.status === 'signed').length
  const total = audienceUsers.length

  return {
    procedureId: procedure.id,
    title: procedure.title,
    version: procedure.version ?? '1.0',
    departmentLabel: departmentLabel(procedure.departments),
    signed,
    pending: total - signed,
    total,
    percent: completionPercent(signed, total),
    byDepartment: buildDepartmentBreakdown(audienceUsers, signedAt),
    employees,
  }
}

/** טעינת הנתונים למעקב נוהל בודד — מופרד מה-hook לבדיקה ללא React. */
export async function fetchPolicyTracking(
  apiClient: IApiClient,
  procedureId: string,
): Promise<PolicyTracking | null> {
  const procedure = await apiClient.procedures.findById(procedureId)
  if (!procedure) return null
  const [users, acknowledgements] = await Promise.all([
    apiClient.users.findMany(),
    apiClient.procedureAcknowledgements.findMany({
      filter: { procedure_id: procedureId },
    }),
  ])
  return computePolicyTracking(procedure, users, acknowledgements)
}
