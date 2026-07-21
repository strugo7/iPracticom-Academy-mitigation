/**
 * מודאל "הזמן מועמד" (Phase 8.1, מסמך 35) — טופס → נוצר (magic link להעתקה).
 * מקביל ל-InviteModal של userManagement, עם שדות מחזור-חיי-המועמד: מבחן-כניסה,
 * מסלול משויך ו-require_assessment. מקור-עיצוב: User Management.dc.html (הזמנה).
 */
import { useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Button,
  Dialog,
  FieldLabel,
  Icon,
  Input,
  SelectField,
  Tabs,
  type TabItem,
  Toggle,
} from '@/components/ui'
import { ROLE_META } from '@/lib/constants/invites'
import { USER_ROLES } from '@/lib/constants/enums'
import type { CreatedCandidateInvite } from '../services/candidateInviteService'
import {
  EMPTY_CANDIDATE_INVITE_DRAFT,
  type CandidateInviteDraft,
  type SelectOption,
} from '../types'

interface Props {
  createdInvite: CreatedCandidateInvite | null
  isCreating: boolean
  departmentOptions: SelectOption[]
  examOptions: SelectOption[]
  trackOptions: SelectOption[]
  onCreate: (draft: CandidateInviteDraft) => void
  onClose: () => void
  notify: (message: string) => void
}

const ROLE_TABS: TabItem[] = USER_ROLES.map((r) => ({ id: r, label: ROLE_META[r].label }))

/** ההורה מרכיב את המודאל רק כשהוא פתוח (unmount מלא בסגירה). */
export function CandidateInviteModal({
  createdInvite,
  isCreating,
  departmentOptions,
  examOptions,
  trackOptions,
  onCreate,
  onClose,
  notify,
}: Props) {
  const [draft, setDraft] = useState<CandidateInviteDraft>(EMPTY_CANDIDATE_INVITE_DRAFT)

  const canCreate =
    draft.email.includes('@') &&
    draft.department !== '' &&
    (!draft.requireAssessment || draft.examId !== '')

  return (
    <Dialog
      open
      onClose={onClose}
      title="הזמן מועמד"
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            {createdInvite ? 'סגור' : 'ביטול'}
          </Button>
          {!createdInvite && (
            <Button
              variant="primary"
              disabled={!canCreate || isCreating}
              onClick={() => onCreate(draft)}
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
          המועמד יקבל קישור למבחן-כניסה ולהצטרפות.
        </p>

        {createdInvite ? (
          <>
            <div className="flex flex-col items-center gap-3 py-2 text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-hues-mint text-success">
                <Icon name="Check" size={28} />
              </span>
              <div className="text-h4 font-semibold text-neutrals-charcoal">ההזמנה נוצרה</div>
              <div className="inline-flex items-center gap-2 font-semibold text-small text-success">
                <Icon name="MailLine" size={15} />
                נשלח למייל {createdInvite.invite.email}
              </div>
            </div>
            <div>
              <FieldLabel>קישור למבחן-כניסה (Magic Link)</FieldLabel>
              <div className="flex items-center gap-2">
                <div
                  dir="ltr"
                  className="flex h-10 min-w-0 flex-1 items-center gap-2 rounded-lg border border-neutrals-silver bg-neutrals-whisper px-3"
                >
                  <Icon name="Link" size={16} className="shrink-0 text-neutrals-nickel" />
                  <span className="min-w-0 flex-1 truncate text-small text-neutrals-charcoal">
                    {createdInvite.magicLink}
                  </span>
                </div>
                <Button
                  variant="primary"
                  leadingIcon={<Icon name="Duplicate" size={16} />}
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
              הקישור תקף ל-7 ימים. ניתן לשלוח שוב או לבטל מרשימת המועמדים.
            </p>
            {/* ניווט client-side (Link) ולא <a>/טאב-חדש: MockApi שומר את ההזמנה
                בזיכרון בלבד — רענון/טאב-חדש היו מאבדים אותה (mockApi.ts §4). */}
            <Link
              to={`/join/${createdInvite.magicLink.split('/').pop() ?? ''}`}
              className="inline-flex items-center gap-1.5 text-small font-semibold text-accent hover:underline"
            >
              <Icon name="View" size={15} />
              פתח את דף ההזמנה (תצוגה מקדימה)
            </Link>
          </>
        ) : (
          <>
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="אימייל"
                dir="ltr"
                placeholder="name@company.co.il"
                value={draft.email}
                onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
              />
              <Input
                label="שם מלא"
                placeholder="שם המועמד"
                value={draft.fullName}
                onChange={(e) => setDraft((d) => ({ ...d, fullName: e.target.value }))}
              />
            </div>

            <div>
              <FieldLabel>מחלקה</FieldLabel>
              <SelectField
                value={draft.department}
                onChange={(e) => setDraft((d) => ({ ...d, department: e.target.value }))}
              >
                <option value="">בחר מחלקה</option>
                {departmentOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            </div>

            <div>
              <FieldLabel>תפקיד בקליטה</FieldLabel>
              <Tabs
                variant="pill"
                tabs={ROLE_TABS}
                value={draft.targetRole}
                onChange={(id) =>
                  setDraft((d) => ({ ...d, targetRole: id as CandidateInviteDraft['targetRole'] }))
                }
              />
            </div>

            <Toggle
              checked={draft.requireAssessment}
              onChange={(v) => setDraft((d) => ({ ...d, requireAssessment: v }))}
              label="דרוש מבחן-כניסה לפני החלטה"
            />

            {draft.requireAssessment && (
              <div>
                <FieldLabel>מבחן-כניסה</FieldLabel>
                <SelectField
                  value={draft.examId}
                  onChange={(e) => setDraft((d) => ({ ...d, examId: e.target.value }))}
                >
                  <option value="">בחר מבחן-כניסה</option>
                  {examOptions.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </SelectField>
              </div>
            )}

            <div>
              <FieldLabel>מסלול משויך (אופציונלי)</FieldLabel>
              <SelectField
                value={draft.assignedTrackId}
                onChange={(e) => setDraft((d) => ({ ...d, assignedTrackId: e.target.value }))}
              >
                <option value="">ללא מסלול</option>
                {trackOptions.map((o) => (
                  <option key={o.value} value={o.value}>
                    {o.label}
                  </option>
                ))}
              </SelectField>
            </div>
          </>
        )}
      </div>
    </Dialog>
  )
}
