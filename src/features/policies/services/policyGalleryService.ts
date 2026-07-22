/**
 * הרכבת גלריית הנהלים: טעינת הנתונים (procedures + users + acknowledgements)
 * דרך apiClient, הרכבת PolicyListItem[], וסינון טהור לפי הפילטרים.
 * הרכבת-המודל והסינון הם פונקציות טהורות (נבדקות ב-*.test.ts, ללא React/IO).
 */
import type { IApiClient } from '@/lib/api/types'
import type { ProcedureStatus } from '@/lib/constants/enums'
import type {
  Procedure,
  ProcedureAcknowledgement,
  User,
} from '@/types/entities'
import type { PolicyFilters, PolicyListItem, PolicyType } from '../types'
import {
  completionPercent,
  countSignedInAudience,
  resolveAudienceIds,
} from './policyAudience'

/** נהלים שאינם 'deleted' — הגלריה (admin) מציגה את כל השאר. */
const isVisibleInGallery = (p: Procedure): boolean => p.status !== 'deleted'

/** תווית קהל-היעד לשורה: מחלקה יחידה / "N מחלקות" / "כל המחלקות". */
function departmentLabel(departments: string[] | null | undefined): string {
  const depts = departments ?? []
  if (depts.length === 0) return 'כל המחלקות'
  if (depts.length === 1) return depts[0] as string
  return `${depts.length} מחלקות`
}

const policyType = (p: Procedure): PolicyType =>
  p.content_type === 'file' ? 'file' : 'written'

/** מרכיב שורת-גלריה בודדת מנוהל + קהל-היעד + החתימות. */
export function toPolicyListItem(
  procedure: Procedure,
  users: User[],
  acknowledgements: ProcedureAcknowledgement[],
): PolicyListItem {
  const audienceIds = resolveAudienceIds(procedure, users)
  const signedCount = countSignedInAudience(
    procedure.id,
    audienceIds,
    acknowledgements,
  )
  const audienceCount = audienceIds.size
  return {
    id: procedure.id,
    title: procedure.title,
    version: procedure.version ?? '1.0',
    departmentLabel: departmentLabel(procedure.departments),
    category: procedure.category ?? 'כללי',
    type: policyType(procedure),
    requiresAck: Boolean(procedure.requires_acknowledgement),
    status: (procedure.status ?? 'published') as ProcedureStatus,
    signedCount,
    audienceCount,
    percent: completionPercent(signedCount, audienceCount),
  }
}

/** מרכיב את כל שורות הגלריה (מסונן מ-deleted, ממוין: פורסם קודם ואז לפי כותרת). */
export function assemblePolicyList(
  procedures: Procedure[],
  users: User[],
  acknowledgements: ProcedureAcknowledgement[],
): PolicyListItem[] {
  return procedures
    .filter(isVisibleInGallery)
    .map((p) => toPolicyListItem(p, users, acknowledgements))
    .sort((a, b) => {
      if (a.status !== b.status) {
        if (a.status === 'published') return -1
        if (b.status === 'published') return 1
      }
      return a.title.localeCompare(b.title, 'he')
    })
}

/** סינון טהור של השורות לפי מצב הפילטרים (חיפוש/קטגוריה/סטטוס/קרא-וחתום). */
export function filterPolicies(
  items: PolicyListItem[],
  filters: PolicyFilters,
): PolicyListItem[] {
  const query = filters.search.trim()
  return items.filter((item) => {
    if (query && !item.title.includes(query)) return false
    if (filters.category && item.category !== filters.category) return false
    if (filters.status && item.status !== filters.status) return false
    if (filters.ackOnly && !item.requiresAck) return false
    if (
      filters.department &&
      item.departmentLabel !== filters.department &&
      item.departmentLabel !== 'כל המחלקות'
    ) {
      return false
    }
    return true
  })
}

/** רשימת הקטגוריות הקיימות בפועל בדאטה (לצ'יפ הקטגוריה בגלריה). */
export function availableCategories(items: PolicyListItem[]): string[] {
  return [...new Set(items.map((i) => i.category))].sort((a, b) =>
    a.localeCompare(b, 'he'),
  )
}

/** רשימת שמות-המחלקות הקיימות בפועל בשורות (לצ'יפ המחלקה). */
export function availableDepartments(items: PolicyListItem[]): string[] {
  return [...new Set(items.map((i) => i.departmentLabel))]
    .filter((d) => d !== 'כל המחלקות')
    .sort((a, b) => a.localeCompare(b, 'he'))
}

/** טעינת הנתונים הדרושים לגלריה — מופרד מה-hook כדי להיבדק ללא React. */
export async function fetchPolicyGalleryData(apiClient: IApiClient): Promise<{
  procedures: Procedure[]
  users: User[]
  acknowledgements: ProcedureAcknowledgement[]
}> {
  const [procedures, users, acknowledgements] = await Promise.all([
    apiClient.procedures.findMany(),
    apiClient.users.findMany(),
    apiClient.procedureAcknowledgements.findMany(),
  ])
  return { procedures, users, acknowledgements }
}
