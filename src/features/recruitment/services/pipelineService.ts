/**
 * גזירת צינור-הגיוס מרשומות ה-Invite (SRS §1.7, מסמך 35) — סינון, מיון וספירות.
 * הרכבה טהורה (ללא קריאות API) כך שנוחה לבדיקה (CLAUDE.md §4).
 */
import type { InviteStatus } from '@/lib/constants/enums'
import type { Invite } from '@/types/entities'
import { PIPELINE_STATUS_ORDER } from '../constants'
import type { StageCount } from '../types'

/**
 * רק הזמנות-מועמד, מהחדשה לישנה. הזמנות-עובד (userManagement) תמיד type='user';
 * 23/56 מהרשומות האמיתיות הן הזמנות-מועמד ישנות עם type=null (מלפני הוספת השדה,
 * ראו entities.ts) — ולכן הסינון הוא "כל מה שאינו user", לא "candidate" בלבד.
 */
export function candidateInvites(invites: Invite[]): Invite[] {
  return invites
    .filter((inv) => inv.type !== 'user')
    .sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date))
}

/** ספירת מועמדים לכל שלב-צינור, בסדר PIPELINE_STATUS_ORDER (רק שלבים עם ≥1). */
export function stageCounts(invites: Invite[]): StageCount[] {
  const counts = new Map<InviteStatus, number>()
  for (const inv of invites) {
    if (!inv.status) continue
    counts.set(inv.status, (counts.get(inv.status) ?? 0) + 1)
  }
  return PIPELINE_STATUS_ORDER.filter((s) => counts.has(s)).map((status) => ({
    status,
    count: counts.get(status) ?? 0,
  }))
}

/** סינון לפי שלב (null = הכל). */
export function filterByStage(invites: Invite[], status: InviteStatus | null): Invite[] {
  return status ? invites.filter((inv) => inv.status === status) : invites
}
