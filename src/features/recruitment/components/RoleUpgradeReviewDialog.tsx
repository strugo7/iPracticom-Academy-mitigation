/**
 * דיאלוג בדיקת בקשת שדרוג-תפקיד + החלטה (Phase 8.3 משני, מסמך 35). בקשה ממתינה:
 * נימוק + הערות + אשר/דחה. בקשה שכבר הוכרעה: תצוגה-בלבד (תוצאה + הערות-בודק).
 * נבנה על Dialog של ה-DS (אין drawer — פער מאומת, §6.1).
 */
import { useState } from 'react'
import { Badge, Button, Dialog, FieldLabel, Icon, Textarea } from '@/components/ui'
import { avatarHueClass, initialsOf } from '@/lib/constants/invites'
import type { RoleUpgradeRequest } from '@/types/entities'
import { ROLE_UPGRADE_STATUS_META, roleUpgradeRoleLabel } from '../constants'
import type { RoleUpgradeDecision } from '../services/roleUpgradeService'

interface Props {
  request: RoleUpgradeRequest
  isSaving: boolean
  onDecide: (status: RoleUpgradeDecision, notes: string) => void
  onClose: () => void
}

export function RoleUpgradeReviewDialog({ request, isSaving, onDecide, onClose }: Props) {
  const status = request.status ?? 'pending'
  const isPending = status === 'pending'
  const [notes, setNotes] = useState(request.review_notes ?? '')

  return (
    <Dialog
      open
      onClose={onClose}
      title="בדיקת בקשת שדרוג-תפקיד"
      size="md"
      footer={
        isPending ? (
          <>
            <Button variant="outlined" disabled={isSaving} onClick={() => onDecide('rejected', notes)}>
              דחה
            </Button>
            <Button variant="primary" disabled={isSaving} onClick={() => onDecide('approved', notes)}>
              {isSaving ? 'שומר…' : 'אשר שדרוג'}
            </Button>
          </>
        ) : (
          <Button variant="white" onClick={onClose}>
            סגור
          </Button>
        )
      }
    >
      <div className="flex flex-col gap-5">
        <div className="flex items-center gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full text-body font-semibold text-white ${avatarHueClass(request.user_id)}`}
          >
            {initialsOf(request.user_name)}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-body text-neutrals-charcoal">
              {request.user_name}
            </div>
            <div className="truncate text-small text-neutrals-nickel">
              {request.user_email}
              {request.department ? ` · ${request.department}` : ''}
            </div>
          </div>
        </div>

        <div>
          <FieldLabel>שדרוג מבוקש</FieldLabel>
          <div className="flex items-center gap-2">
            <Badge color="neutral">{roleUpgradeRoleLabel(request.current_role)}</Badge>
            <Icon name="ArrowWest" size={16} className="text-neutrals-nickel" />
            <Badge color="accent">{roleUpgradeRoleLabel(request.requested_role)}</Badge>
          </div>
        </div>

        {request.justification && (
          <div>
            <FieldLabel>נימוק הבקשה</FieldLabel>
            <div className="rounded-lg border border-neutrals-silver bg-white p-3 text-small leading-relaxed text-neutrals-lead">
              {request.justification}
            </div>
          </div>
        )}

        {isPending ? (
          <div>
            <FieldLabel>הערות</FieldLabel>
            <Textarea
              rows={3}
              placeholder="נימוק ההחלטה (נשמר עם הבקשה)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>
        ) : (
          <>
            <p className="m-0 flex items-center gap-2 text-tiny text-neutrals-nickel">
              תוצאה:
              <Badge color={ROLE_UPGRADE_STATUS_META[status].badgeColor}>
                {ROLE_UPGRADE_STATUS_META[status].label}
              </Badge>
            </p>
            {request.review_notes && (
              <div>
                <FieldLabel>הערות הבודק</FieldLabel>
                <div className="rounded-lg border border-neutrals-silver bg-white p-3 text-small leading-relaxed text-neutrals-lead">
                  {request.review_notes}
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </Dialog>
  )
}
