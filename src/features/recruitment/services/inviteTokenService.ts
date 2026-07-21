/**
 * דף נחיתת-ההזמנה (Phase 8.2 — המשטח הציבורי, Welcome Invite.dc.html).
 *
 * ⚠️ סימולציית-לקוח: ב-Phase 12 `fetchInviteByToken`/`consumeInvitation` הן
 * פונקציות-שרת (אימות token-hash + email-match + קליטה אטומית). כאן, במצב
 * mock-first, מגבבים את הטוקן הגולמי ומאתרים לפי token_hash — כדי להדגים את
 * ה"תחושה" מקצה-לקצה מול הדאטה (CLAUDE.md §5: RBAC/קליטה נאכפים בשרת בפועל).
 */
import type { IApiClient } from '@/lib/api'
import { ROLE_META, initialsOf } from '@/lib/constants/invites'
import { sha256Hex } from '@/lib/utils/hash'
import type { Invite } from '@/types/entities'
import { WELCOME_STEPS, welcomeSubtitle } from '../constants'
import type { InviteAudience, WelcomeInviteView } from '../types'

/** איתור הזמנה לפי הטוקן הגולמי (מהמייל) — גיבוב והשוואה מול token_hash. */
export async function findInviteByToken(
  api: IApiClient,
  token: string,
): Promise<Invite | null> {
  if (!token) return null
  const hash = await sha256Hex(token)
  const invites = await api.invites.findMany()
  return invites.find((inv) => inv.token_hash === hash) ?? null
}

/** סימולציית consumeInvitation — סימון פתיחה+שימוש והעברת ההזמנה למצב 'started'. */
export async function consumeInvite(api: IApiClient, invite: Invite): Promise<Invite> {
  const now = new Date().toISOString()
  return api.invites.update(invite.id, {
    status: 'started',
    magic_link_opened_at: invite.magic_link_opened_at ?? now,
    token_used_at: now,
  })
}

function inviteAudience(invite: Invite): InviteAudience {
  return invite.type === 'user' ? 'employee' : 'candidate'
}

/** תאריך-תפוגה בפורמט ישראלי (Asia/Jerusalem) — dd.MM.yyyy. */
function formatExpiry(iso: string | null | undefined): string {
  if (!iso) return '—'
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return '—'
  return new Intl.DateTimeFormat('he-IL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    timeZone: 'Asia/Jerusalem',
  }).format(date)
}

/** מיפוי Invite → מודל-התצוגה של דף-הנחיתה (Welcome Invite.dc.html). */
export function inviteToWelcomeView(invite: Invite): WelcomeInviteView {
  const audience = inviteAudience(invite)
  const inviteeName = invite.candidate_full_name || invite.email
  const inviterName = invite.invited_by_user_email || 'צוות iPracticom'
  const role = invite.target_system_role
  const roleLabel =
    audience === 'candidate' ? 'מועמד/ת' : role ? ROLE_META[role].label : 'עובד/ת חדש/ה'
  const department = invite.department || '—'

  return {
    audience,
    inviteeName,
    inviteeEmail: invite.email,
    inviterName,
    inviterInitials: initialsOf(inviterName),
    department,
    roleLabel,
    subtitle: welcomeSubtitle(audience, department),
    expiryDate: formatExpiry(invite.token_expires_at),
    steps: WELCOME_STEPS[audience].map((s, i) => ({
      num: String(i + 1),
      title: s.title,
      text: s.text,
    })),
  }
}
