/**
 * שורת בקשת שדרוג-תפקיד (Phase 8.3 משני) — אווטאר + שם + מייל + מעבר-תפקיד
 * (נוכחי→מבוקש) + סטטוס. השורה כפתור הפותח את דיאלוג-הבדיקה.
 */
import { Badge, Icon } from '@/components/ui'
import { avatarHueClass, initialsOf } from '@/lib/constants/invites'
import type { RoleUpgradeRequest } from '@/types/entities'
import { ROLE_UPGRADE_STATUS_META, roleUpgradeRoleLabel } from '../constants'

interface Props {
  request: RoleUpgradeRequest
  onReview: (request: RoleUpgradeRequest) => void
}

export function RoleUpgradeRow({ request, onReview }: Props) {
  const status = request.status ?? 'pending'
  const statusMeta = ROLE_UPGRADE_STATUS_META[status]

  return (
    <button
      type="button"
      onClick={() => onReview(request)}
      className="flex w-full items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3 text-start transition-colors hover:bg-neutrals-whisper"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${avatarHueClass(request.user_id)}`}
      >
        {initialsOf(request.user_name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-small text-neutrals-charcoal">
          {request.user_name}
        </div>
        <div className="mt-1 truncate text-tiny text-neutrals-nickel">{request.user_email}</div>
      </div>
      <div className="flex shrink-0 items-center gap-1.5 text-small">
        <span className="text-neutrals-nickel">{roleUpgradeRoleLabel(request.current_role)}</span>
        <Icon name="ArrowWest" size={15} className="text-neutrals-nickel" />
        <span className="font-semibold text-neutrals-charcoal">
          {roleUpgradeRoleLabel(request.requested_role)}
        </span>
      </div>
      <Badge color={statusMeta.badgeColor}>{statusMeta.label}</Badge>
      <Icon name="ChevronLeft" size={18} className="shrink-0 text-neutrals-nickel" />
    </button>
  )
}
