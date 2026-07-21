/**
 * הזמנת-מועמד (SRS §2.1 generateInviteToken, type='candidate' — מסמך 35).
 * מקבילה ל-inviteService של userManagement אך למחזור-חיי המועמד: קובעת
 * require_assessment / exam_id / assigned_track_id. שומרת token_hash (SHA-256)
 * בלבד — הטוקן הגולמי חוזר פעם אחת ב-magicLink, לעולם לא נכתב ל-DB (CLAUDE.md §5).
 */
import type { IApiClient } from '@/lib/api'
import { INVITE_TOKEN_TTL_DAYS, MAGIC_LINK_HOST } from '@/lib/constants/invites'
import { sha256Hex } from '@/lib/utils/hash'
import type { Invite } from '@/types/entities'
import type { CandidateInviteDraft } from '../types'

export interface CreatedCandidateInvite {
  invite: Invite
  magicLink: string
}

export async function createCandidateInvite(
  api: IApiClient,
  draft: CandidateInviteDraft,
  invitedBy: { id: string; email: string },
): Promise<CreatedCandidateInvite> {
  const jti = crypto.randomUUID()
  const rawToken = crypto.randomUUID()
  const tokenHash = await sha256Hex(rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INVITE_TOKEN_TTL_DAYS * 86_400_000)

  const invite = await api.invites.create({
    email: draft.email,
    department: draft.department,
    type: 'candidate',
    requested_role: 'candidate',
    target_system_role: draft.targetRole,
    require_assessment: draft.requireAssessment,
    candidate_full_name: draft.fullName,
    exam_id: draft.examId || null,
    assigned_track_id: draft.assignedTrackId || null,
    status: 'pending',
    jti,
    token_hash: tokenHash,
    token_expires_at: expiresAt.toISOString(),
    resend_count: 0,
    invited_by_user_id: invitedBy.id,
    invited_by_user_email: invitedBy.email,
    last_sent_at: now.toISOString(),
  })

  return { invite, magicLink: `${MAGIC_LINK_HOST}/${rawToken}` }
}

/** שליחה-חוזרת (resend_count++) — מקבילה לפעולת ההזמנה של userManagement. */
export async function resendCandidateInvite(api: IApiClient, invite: Invite): Promise<Invite> {
  return api.invites.update(invite.id, {
    resend_count: (invite.resend_count ?? 0) + 1,
    last_sent_at: new Date().toISOString(),
  })
}

export async function cancelCandidateInvite(api: IApiClient, inviteId: string): Promise<Invite> {
  return api.invites.update(inviteId, { status: 'canceled' })
}
