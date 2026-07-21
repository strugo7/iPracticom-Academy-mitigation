/**
 * טאב המועמדים (Phase 8.1, מסמך 35) — צינור-הגיוס: מסנן-שלבים עם ספירות +
 * רשימת הזמנות-מועמד + פעולת "הזמן מועמד". מצבי loading/empty/error/success
 * ממומשים (CLAUDE.md §6). הרכבה בלבד — הלוגיקה ב-hooks/services.
 */
import { useMemo, useState } from 'react'
import {
  Alert,
  Button,
  Icon,
  Loader,
  Tabs,
  type TabItem,
  ToastStack,
  ZeroStates,
} from '@/components/ui'
import type { InviteStatus } from '@/lib/constants/enums'
import { INVITE_STATUS_META } from '@/lib/constants/invites'
import { useToasts } from '@/lib/hooks/useToasts'
import { useCandidateInviteMutations, useCandidateInvites } from '../hooks/useCandidateInvites'
import { useRecruitmentOptions } from '../hooks/useRecruitmentOptions'
import { filterByStage, stageCounts } from '../services/pipelineService'
import type { CandidateInviteDraft } from '../types'
import { CandidateInviteModal } from './CandidateInviteModal'
import { CandidateRow } from './CandidateRow'

export function CandidatePipeline() {
  const invitesQuery = useCandidateInvites()
  const mutations = useCandidateInviteMutations()
  const options = useRecruitmentOptions()
  const { toasts, notify } = useToasts()

  const [stage, setStage] = useState<InviteStatus | null>(null)
  const [inviteOpen, setInviteOpen] = useState(false)

  const invites = useMemo(() => invitesQuery.data ?? [], [invitesQuery.data])
  const counts = useMemo(() => stageCounts(invites), [invites])
  const filtered = useMemo(() => filterByStage(invites, stage), [invites, stage])

  const stageTabs: TabItem[] = [
    { id: 'all', label: `הכל · ${invites.length}` },
    ...counts.map((c) => ({
      id: c.status,
      label: `${INVITE_STATUS_META[c.status].label} · ${c.count}`,
    })),
  ]

  const handleCreate = (draft: CandidateInviteDraft) => {
    mutations
      .create(draft)
      .then(() => notify('success', 'הזמנת המועמד נוצרה'))
      .catch(() => notify('error', 'יצירת ההזמנה נכשלה'))
  }

  const handleResend = (invite: (typeof invites)[number]) => {
    mutations
      .resend(invite)
      .then(() => notify('success', 'ההזמנה נשלחה שוב'))
      .catch(() => notify('error', 'השליחה החוזרת נכשלה'))
  }

  const handleCancel = (inviteId: string) => {
    mutations
      .cancel(inviteId)
      .then(() => notify('success', 'ההזמנה בוטלה'))
      .catch(() => notify('error', 'הביטול נכשל'))
  }

  const closeInvite = () => {
    setInviteOpen(false)
    mutations.resetCreate()
  }

  if (invitesQuery.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader label="טוען מועמדים…" />
      </div>
    )
  }

  if (invitesQuery.isError) {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert kind="error" title="שגיאה בטעינת המועמדים">
          לא ניתן לטעון את רשימת המועמדים כרגע. נסו לרענן את העמוד.
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-6">
      {invites.length === 0 ? (
        <ZeroStates
          title="אין עדיין מועמדים בתהליך גיוס"
          cta="הזמן מועמד"
          onCreate={() => setInviteOpen(true)}
        />
      ) : (
        <>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="min-w-0 max-w-full overflow-x-auto pb-0.5">
              <Tabs
                variant="pill"
                tabs={stageTabs}
                value={stage ?? 'all'}
                onChange={(id) => setStage(id === 'all' ? null : (id as InviteStatus))}
              />
            </div>
            <Button
              variant="primary"
              leadingIcon={<Icon name="Plus" size={16} />}
              onClick={() => setInviteOpen(true)}
            >
              הזמן מועמד
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-small text-neutrals-nickel">
                אין מועמדים בשלב זה.
              </p>
            ) : (
              filtered.map((invite) => (
                <CandidateRow
                  key={invite.id}
                  invite={invite}
                  onResend={handleResend}
                  onCancel={handleCancel}
                />
              ))
            )}
          </div>
        </>
      )}

      {inviteOpen && (
        <CandidateInviteModal
          createdInvite={mutations.createdInvite}
          isCreating={mutations.isCreating}
          departmentOptions={options.departmentOptions}
          examOptions={options.examOptions}
          trackOptions={options.trackOptions}
          onCreate={handleCreate}
          onClose={closeInvite}
          notify={(message) => notify('success', message)}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  )
}
