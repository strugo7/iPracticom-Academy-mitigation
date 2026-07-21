/**
 * שורת-מועמד בצינור הגיוס (Phase 8.1) — אווטאר + שם + מייל + תגית-סטטוס +
 * פעולות (שלח-שוב/בטל לשלבים פתוחים). שפה-ויזואלית זהה לשורת-ההזמנה של
 * userManagement (מקור: User Management.dc.html) — נצרכת גם בטאב ההערכות (8.3).
 */
import { Badge, Icon, IconButton } from '@/components/ui'
import {
  INVITE_STATUS_META,
  OPEN_INVITE_STATUSES,
  ROLE_META,
  avatarHueClass,
  initialsOf,
} from '@/lib/constants/invites'
import type { Invite } from '@/types/entities'

interface Props {
  invite: Invite
  onResend: (invite: Invite) => void
  onCancel: (inviteId: string) => void
}

export function CandidateRow({ invite, onResend, onCancel }: Props) {
  const meta = invite.status ? INVITE_STATUS_META[invite.status] : null
  const isOpen = invite.status ? OPEN_INVITE_STATUSES.includes(invite.status) : false
  const name = invite.candidate_full_name || invite.email
  const role = invite.target_system_role

  return (
    <div className="flex items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3">
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${avatarHueClass(invite.id)}`}
      >
        {initialsOf(name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-small text-neutrals-charcoal">{name}</span>
          {role && role !== 'user' && (
            <Badge color={ROLE_META[role].badgeColor}>{ROLE_META[role].label}</Badge>
          )}
        </div>
        <div className="mt-1 truncate text-tiny text-neutrals-nickel">{invite.email}</div>
      </div>
      {meta && <Badge color={meta.badgeColor}>{meta.label}</Badge>}
      {isOpen && (
        <div className="flex shrink-0 gap-1">
          <IconButton
            variant="ghost"
            size="sm"
            title="שלח שוב"
            aria-label="שלח שוב"
            onClick={() => onResend(invite)}
          >
            <Icon name="MailLine" size={15} />
          </IconButton>
          <IconButton
            variant="ghost"
            size="sm"
            title="בטל"
            aria-label="בטל"
            onClick={() => onCancel(invite.id)}
          >
            <Icon name="Close" size={15} />
          </IconButton>
        </div>
      )}
    </div>
  )
}
