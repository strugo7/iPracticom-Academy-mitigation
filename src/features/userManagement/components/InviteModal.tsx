/**
 * מודאל "הזמן משתמש" (design-export שורות 287-341): טופס → נוצר (magic link
 * להעתקה) + רשימת הזמנות-ממתינות למחלקה הנבחרת (שלח-שוב/בטל).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Badge,
  Button,
  Dialog,
  FieldLabel,
  Icon,
  IconButton,
  Input,
  Tabs,
  type TabItem,
} from '@/components/ui'
import { USER_ROLES, type UserRole } from '@/lib/constants/enums'
import type { Department, Invite } from '@/types/entities'
import {
  INVITE_STATUS_META,
  OPEN_INVITE_STATUSES,
  ROLE_META,
  avatarHueClass,
  initialsOf,
} from '../constants'
import { CopyIcon } from '../icons'
import { EMPTY_INVITE_DRAFT, type InviteDraft } from '../types'

interface CreatedInvite {
  invite: Invite
  magicLink: string
}

interface Props {
  department: Department
  createdInvite: CreatedInvite | null
  isCreating: boolean
  pendingInvites: Invite[]
  onCreate: (draft: InviteDraft) => void
  onResend: (invite: Invite) => void
  onCancel: (inviteId: string) => void
  onClose: () => void
  notify: (message: string) => void
}

const ROLE_TABS: TabItem[] = USER_ROLES.map((r) => ({
  id: r,
  label: ROLE_META[r].label,
}))

/** ההורה מרכיב את המודאל הזה רק כש-inviteOpen===true (unmount מלא בסגירה). */
export function InviteModal({
  department,
  createdInvite,
  isCreating,
  pendingInvites,
  onCreate,
  onResend,
  onCancel,
  onClose,
  notify,
}: Props) {
  const [draft, setDraft] = useState<InviteDraft>(EMPTY_INVITE_DRAFT)

  const canCreate = draft.email.includes('@')

  return (
    <Dialog
      open
      onClose={onClose}
      title="הזמן משתמש"
      size="md"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            {createdInvite ? 'סגור' : 'ביטול'}
          </Button>
          {!createdInvite && (
            <Button
              variant="primary"
              disabled={!canCreate || isCreating}
              onClick={() =>
                onCreate({ ...draft, role: draft.role as UserRole })
              }
              leadingIcon={<Icon name="Plus" size={16} />}
            >
              {isCreating ? 'יוצר…' : 'צור הזמנה'}
            </Button>
          )}
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <p className="m-0 text-small text-neutrals-lead">
          המשתמש יקבל קישור הצטרפות למייל.
        </p>

        {createdInvite ? (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-hues-mint text-success">
                <Icon name="Check" size={28} />
              </span>
              <div className="text-h4 font-semibold text-neutrals-charcoal">
                ההזמנה נוצרה
              </div>
              <div className="inline-flex items-center gap-2 font-semibold text-small text-success">
                <Icon name="MailLine" size={15} />
                נשלח למייל {createdInvite.invite.email}
              </div>
            </div>
            <div>
              <FieldLabel>קישור הצטרפות (Magic Link)</FieldLabel>
              <div className="flex items-center gap-2">
                <div
                  dir="ltr"
                  className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-neutrals-silver bg-neutrals-whisper px-3"
                >
                  <Icon
                    name="Link"
                    size={16}
                    className="shrink-0 text-neutrals-nickel"
                  />
                  <span className="min-w-0 flex-1 truncate text-small text-neutrals-charcoal">
                    {createdInvite.magicLink}
                  </span>
                </div>
                <Button
                  variant="primary"
                  leadingIcon={<CopyIcon size={16} />}
                  onClick={() => {
                    void navigator.clipboard.writeText(createdInvite.magicLink)
                    notify('הקישור הועתק')
                  }}
                >
                  העתק
                </Button>
              </div>
            </div>
            <p className="m-0 text-tiny text-neutrals-nickel">
              הקישור תקף ל-7 ימים. ניתן לשלוח שוב או לבטל מרשימת ההזמנות
              הממתינות.
            </p>
            {/* Link (client-side) ולא <a>/טאב-חדש: MockApi שומר את ההזמנה בזיכרון
                בלבד — רענון/טאב-חדש היו מאבדים אותה (mockApi.ts §4). */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
              <Link
                to={`/join/${createdInvite.magicLink.split('/').pop() ?? ''}`}
                className="inline-flex items-center gap-1.5 text-small font-semibold text-accent hover:underline"
              >
                <Icon name="View" size={15} />
                תצוגה מקדימה (hero)
              </Link>
              <Link
                to={`/join/${createdInvite.magicLink.split('/').pop() ?? ''}?style=ticket`}
                className="inline-flex items-center gap-1.5 text-small font-semibold text-accent hover:underline"
              >
                <Icon name="View" size={15} />
                תצוגת כרטיס
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="אימייל"
                dir="ltr"
                placeholder="name@company.co.il"
                value={draft.email}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, email: e.target.value }))
                }
              />
              <Input
                label="שם מלא"
                placeholder="שם המשתמש"
                value={draft.fullName}
                onChange={(e) =>
                  setDraft((d) => ({ ...d, fullName: e.target.value }))
                }
              />
            </div>
            <div>
              <FieldLabel>מחלקה</FieldLabel>
              <div className="flex h-10 items-center gap-2 rounded-lg border border-neutrals-silver bg-white px-3 text-body text-neutrals-charcoal">
                {department.name}
              </div>
            </div>
            <div>
              <FieldLabel>תפקיד</FieldLabel>
              <Tabs
                variant="pill"
                tabs={ROLE_TABS}
                value={draft.role}
                onChange={(id) =>
                  setDraft((d) => ({ ...d, role: id as UserRole }))
                }
              />
            </div>
          </>
        )}

        <div className="flex flex-col gap-3 border-t border-neutrals-silver pt-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-small text-neutrals-charcoal">
              הזמנות ממתינות
            </span>
            <Badge color="accent">{pendingInvites.length}</Badge>
          </div>
          <div className="flex flex-col gap-2">
            {pendingInvites.length === 0 && (
              <p className="m-0 text-small text-neutrals-nickel">
                אין הזמנות עבור מחלקה זו.
              </p>
            )}
            {pendingInvites.map((invite) => {
              const meta = invite.status
                ? INVITE_STATUS_META[invite.status]
                : null
              const isOpen = invite.status
                ? OPEN_INVITE_STATUSES.includes(invite.status)
                : false
              const name = invite.candidate_full_name || invite.email
              return (
                <div
                  key={invite.id}
                  className="flex items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3"
                >
                  <span
                    className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${avatarHueClass(invite.id)}`}
                  >
                    {initialsOf(name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-small text-neutrals-charcoal">
                        {name}
                      </span>
                      {invite.target_system_role && (
                        <Badge
                          color={
                            ROLE_META[invite.target_system_role].badgeColor
                          }
                        >
                          {ROLE_META[invite.target_system_role].label}
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 text-tiny text-neutrals-nickel">
                      הוזמן ע״י {invite.invited_by_user_email ?? '—'}
                    </div>
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
            })}
          </div>
        </div>
      </div>
    </Dialog>
  )
}
