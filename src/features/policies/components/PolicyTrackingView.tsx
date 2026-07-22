/**
 * מסך מעקב קרא-וחתום לנוהל (design-export/Policies.dc.html, tracking view):
 * כותרת עם חזרה + "שלח תזכורת לכל הממתינים", כרטיס-סיכום, פילוח מחלקתי, ורשימת
 * עובדים עם סינון ותזכורות. הנתונים מ-usePolicyTracking; תזכורות דרך mutation.
 */
import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Alert,
  Button,
  Icon,
  IconButton,
  Loader,
  ToastStack,
} from '@/components/ui'
import { useToasts } from '@/lib/hooks/useToasts'
import { apiClient } from '@/lib/api'
import {
  usePolicyTracking,
  policyTrackingQueryKey,
} from '../hooks/usePolicyTracking'
import {
  remindAllPending,
  remindEmployee,
} from '../services/policyReminderService'
import type {
  PolicyTracking,
  TrackingEmployee,
  TrackingEmployeeFilter,
} from '../types'
import { DepartmentBreakdown } from './tracking/DepartmentBreakdown'
import { EmployeeSignList } from './tracking/EmployeeSignList'
import { TrackingSummary } from './tracking/TrackingSummary'

interface PolicyTrackingViewProps {
  procedureId: string
  onBack: () => void
}

export function PolicyTrackingView({
  procedureId,
  onBack,
}: PolicyTrackingViewProps) {
  const { isLoading, isError, tracking, refetch } =
    usePolicyTracking(procedureId)
  const [filter, setFilter] = useState<TrackingEmployeeFilter>('all')
  const [remindingUserId, setRemindingUserId] = useState<string | null>(null)
  const { toasts, notify } = useToasts()
  const queryClient = useQueryClient()

  const invalidate = () =>
    queryClient.invalidateQueries({
      queryKey: policyTrackingQueryKey(procedureId),
    })

  const remindAll = useMutation({
    mutationFn: (data: PolicyTracking) => remindAllPending(apiClient, data),
    onSuccess: (count) => {
      notify('success', `נשלחה תזכורת ל-${count} ממתינים`)
      invalidate()
    },
    onError: () => notify('error', 'שליחת התזכורות נכשלה'),
  })

  const remindOne = useMutation({
    mutationFn: (employee: TrackingEmployee) =>
      remindEmployee(apiClient, procedureId, tracking?.title ?? '', employee),
    onMutate: (employee) => setRemindingUserId(employee.userId),
    onSuccess: (_data, employee) => {
      notify('success', `נשלחה תזכורת ל${employee.name}`)
      invalidate()
    },
    onError: () => notify('error', 'שליחת התזכורת נכשלה'),
    onSettled: () => setRemindingUserId(null),
  })

  if (isLoading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <Loader />
      </div>
    )
  }

  if (isError || !tracking) {
    return (
      <div className="p-6">
        <Alert kind="error" title="טעינת המעקב נכשלה">
          <div className="flex items-center gap-3">
            <span>לא הצלחנו לטעון את נתוני המעקב.</span>
            <Button variant="outlined" onClick={() => refetch()}>
              נסה שוב
            </Button>
          </div>
        </Alert>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <IconButton
            variant="outline"
            size="md"
            aria-label="חזרה לנהלים"
            onClick={onBack}
          >
            <Icon name="ChevronRight" size={19} />
          </IconButton>
          <div>
            <h1 className="text-h3 font-semibold text-neutrals-charcoal">
              מעקב קרא וחתום
            </h1>
            <p className="mt-0.5 text-small text-neutrals-lead">
              {tracking.title}
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          leadingIcon={<Icon name="MailLine" size={17} />}
          disabled={tracking.pending === 0 || remindAll.isPending}
          onClick={() => remindAll.mutate(tracking)}
        >
          שלח תזכורת לכל הממתינים
        </Button>
      </header>

      <TrackingSummary tracking={tracking} />
      <DepartmentBreakdown rows={tracking.byDepartment} />
      <EmployeeSignList
        employees={tracking.employees}
        filter={filter}
        onFilterChange={setFilter}
        onRemind={(employee) => remindOne.mutate(employee)}
        remindingUserId={remindingUserId}
      />

      <ToastStack toasts={toasts} />
    </div>
  )
}
