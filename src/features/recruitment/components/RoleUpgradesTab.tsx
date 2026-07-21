/**
 * טאב בקשות שדרוג-תפקיד (Phase 8.3 משני, מסמך 35) — רשימה, מסנן לפי סטטוס עם
 * ספירות, ודיאלוג בדיקה+החלטה. מצבי loading/empty/error/success ממומשים.
 */
import { useMemo, useState } from 'react'
import { Alert, Loader, Tabs, type TabItem, ToastStack } from '@/components/ui'
import type { RoleUpgradeStatus } from '@/lib/constants/enums'
import { useToasts } from '@/lib/hooks/useToasts'
import type { RoleUpgradeRequest } from '@/types/entities'
import { ROLE_UPGRADE_STATUS_META, ROLE_UPGRADE_STATUS_ORDER } from '../constants'
import {
  useRoleUpgradeRequests,
  useRoleUpgradeReviewMutation,
} from '../hooks/useRoleUpgradeRequests'
import type { RoleUpgradeDecision } from '../services/roleUpgradeService'
import { RoleUpgradeReviewDialog } from './RoleUpgradeReviewDialog'
import { RoleUpgradeRow } from './RoleUpgradeRow'

export function RoleUpgradesTab() {
  const query = useRoleUpgradeRequests()
  const reviewMutation = useRoleUpgradeReviewMutation()
  const { toasts, notify } = useToasts()

  const [statusFilter, setStatusFilter] = useState<RoleUpgradeStatus | null>(null)
  const [reviewing, setReviewing] = useState<RoleUpgradeRequest | null>(null)

  const requests = useMemo(() => query.data ?? [], [query.data])

  const counts = useMemo(() => {
    const m = new Map<RoleUpgradeStatus, number>()
    for (const r of requests) {
      const s = r.status ?? 'pending'
      m.set(s, (m.get(s) ?? 0) + 1)
    }
    return ROLE_UPGRADE_STATUS_ORDER.filter((s) => m.has(s)).map((status) => ({
      status,
      count: m.get(status) ?? 0,
    }))
  }, [requests])

  const filtered = useMemo(
    () =>
      statusFilter
        ? requests.filter((r) => (r.status ?? 'pending') === statusFilter)
        : requests,
    [requests, statusFilter],
  )

  const filterTabs: TabItem[] = [
    { id: 'all', label: `הכל · ${requests.length}` },
    ...counts.map((c) => ({
      id: c.status,
      label: `${ROLE_UPGRADE_STATUS_META[c.status].label} · ${c.count}`,
    })),
  ]

  const handleDecide = (status: RoleUpgradeDecision, notes: string) => {
    if (!reviewing) return
    reviewMutation
      .mutateAsync({ request: reviewing, status, notes })
      .then(() => {
        setReviewing(null)
        notify('success', status === 'approved' ? 'הבקשה אושרה' : 'הבקשה נדחתה')
      })
      .catch(() => notify('error', 'שמירת ההחלטה נכשלה'))
  }

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader label="טוען בקשות…" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert kind="error" title="שגיאה בטעינת הבקשות">
          לא ניתן לטעון את בקשות השדרוג כרגע. נסו לרענן את העמוד.
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-6">
      {requests.length === 0 ? (
        <div className="flex h-full items-center justify-center p-10 text-center text-neutrals-nickel">
          אין בקשות שדרוג-תפקיד ממתינות.
        </div>
      ) : (
        <>
          <div className="mb-4 min-w-0 max-w-full overflow-x-auto pb-0.5">
            <Tabs
              variant="pill"
              tabs={filterTabs}
              value={statusFilter ?? 'all'}
              onChange={(id) =>
                setStatusFilter(id === 'all' ? null : (id as RoleUpgradeStatus))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-small text-neutrals-nickel">
                אין בקשות בקטגוריה זו.
              </p>
            ) : (
              filtered.map((request) => (
                <RoleUpgradeRow key={request.id} request={request} onReview={setReviewing} />
              ))
            )}
          </div>
        </>
      )}

      {reviewing && (
        <RoleUpgradeReviewDialog
          request={reviewing}
          isSaving={reviewMutation.isPending}
          onDecide={handleDecide}
          onClose={() => setReviewing(null)}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  )
}
