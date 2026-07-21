/**
 * הזמנת-משתמש חדשה (SRS §2.1 generateInviteToken / resendInvitation /
 * cancelInvitation, מסמך 26). שומר token_hash (SHA-256) בלבד — הטוקן הגולמי
 * חוזר פעם אחת ב-magicLink להעתקה/שליחה, לעולם לא נכתב ל-DB (CLAUDE.md §5).
 * type='user' תמיד — הזמנות-מועמד (type='candidate') שייכות ל-feature הגיוס.
 */
import type { IApiClient } from '@/lib/api'
import type { UserRole } from '@/lib/constants/enums'
import { sha256Hex } from '@/lib/utils/hash'
import type { Invite } from '@/types/entities'
import { INVITE_TOKEN_TTL_DAYS, MAGIC_LINK_HOST } from '../constants'

export interface CreateInviteInput {
  email: string
  fullName: string
  department: string
  role: UserRole
}

export interface CreatedInvite {
  invite: Invite
  magicLink: string
}

export async function createInvite(
  api: IApiClient,
  input: CreateInviteInput,
  invitedBy: { id: string; email: string },
): Promise<CreatedInvite> {
  const jti = crypto.randomUUID()
  const rawToken = crypto.randomUUID()
  const tokenHash = await sha256Hex(rawToken)
  const now = new Date()
  const expiresAt = new Date(now.getTime() + INVITE_TOKEN_TTL_DAYS * 86_400_000)

  const invite = await api.invites.create({
    email: input.email,
    department: input.department,
    type: 'user',
    requested_role: 'employee',
    target_system_role: input.role,
    require_assessment: false,
    candidate_full_name: input.fullName,
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

export function pendingInvitesForDepartment(invites: Invite[], departmentName: string): Invite[] {
  return invites
    .filter((inv) => inv.type === 'user' && inv.department === departmentName)
    .sort((a, b) => Date.parse(b.created_date) - Date.parse(a.created_date))
}

export async function resendInvite(api: IApiClient, invite: Invite): Promise<Invite> {
  return api.invites.update(invite.id, {
    resend_count: (invite.resend_count ?? 0) + 1,
    last_sent_at: new Date().toISOString(),
  })
}

export async function cancelInvite(api: IApiClient, inviteId: string): Promise<Invite> {
  return api.invites.update(inviteId, { status: 'canceled' })
}
