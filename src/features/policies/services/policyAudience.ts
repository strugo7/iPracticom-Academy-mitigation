/**
 * חישוב קהל-היעד של נוהל וספירת החתומים — לוגיקה טהורה המשותפת לגלריה
 * (מד-מילוי) ולמעקב קרא-וחתום (Phase 3). קהל-היעד נגזר מ-targeting config:
 * `departments` (התאמה מול User.department) + `assigned_user_ids` (מזהים ישירים).
 * ChTM: ProcedureAcknowledgement נושא UNIQUE(procedure_id, user_id) — משתמש חותם
 * פעם אחת; לכן ספירה לפי user_id ייחודי מונעת ספירה כפולה.
 */
import type {
  Procedure,
  ProcedureAcknowledgement,
  User,
} from '@/types/entities'

/**
 * מזהי המשתמשים בקהל-היעד. departments ריק ו-assigned ריק → הנוהל מיועד לכולם
 * ("כל המחלקות"). אחרת: איחוד של מי ששייך למחלקה משויכת ומי שברשימת העובדים
 * הספציפיים.
 */
export function resolveAudienceIds(
  procedure: Pick<Procedure, 'departments' | 'assigned_user_ids'>,
  users: User[],
): Set<string> {
  const depts = new Set(procedure.departments ?? [])
  const assigned = new Set(procedure.assigned_user_ids ?? [])

  if (depts.size === 0 && assigned.size === 0) {
    return new Set(users.map((u) => u.id))
  }

  const ids = new Set<string>()
  for (const user of users) {
    if (assigned.has(user.id)) ids.add(user.id)
    else if (user.department && depts.has(user.department)) ids.add(user.id)
  }
  return ids
}

/** מספר החתומים מתוך קהל-היעד (acks של הנוהל שה-user_id שלהם בקהל, ייחודי). */
export function countSignedInAudience(
  procedureId: string,
  audienceIds: Set<string>,
  acknowledgements: ProcedureAcknowledgement[],
): number {
  const signed = new Set<string>()
  for (const ack of acknowledgements) {
    if (ack.procedure_id !== procedureId) continue
    if (!audienceIds.has(ack.user_id)) continue
    signed.add(ack.user_id)
  }
  return signed.size
}

/** אחוז השלמה (0–100). קהל-יעד ריק → 0 (מוצג כ-"—" בגלריה). */
export function completionPercent(signed: number, audience: number): number {
  if (audience <= 0) return 0
  return Math.round((signed / audience) * 100)
}
