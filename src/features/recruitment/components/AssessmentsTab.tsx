/**
 * טאב ההערכות (Phase 8.3, מסמך 35) — רשימת הערכות מבחן-כניסה, מסנן לפי החלטה
 * עם ספירות, ודיאלוג קריאה+החלטה. מצבי loading/empty/error/success ממומשים.
 */
import { useMemo, useState } from 'react'
import { Alert, Loader, Tabs, type TabItem, ToastStack } from '@/components/ui'
import type { EvaluationDecision } from '@/lib/constants/enums'
import { useToasts } from '@/lib/hooks/useToasts'
import type { CandidateAssessment } from '@/types/entities'
import { EVALUATION_DECISION_META, EVALUATION_DECISION_ORDER } from '../constants'
import {
  useCandidateAssessments,
  useCandidateDecisionMutation,
} from '../hooks/useCandidateAssessments'
import { AssessmentReviewDialog } from './AssessmentReviewDialog'
import { AssessmentRow } from './AssessmentRow'

export function AssessmentsTab() {
  const query = useCandidateAssessments()
  const decisionMutation = useCandidateDecisionMutation()
  const { toasts, notify } = useToasts()

  const [decisionFilter, setDecisionFilter] = useState<EvaluationDecision | null>(null)
  const [reviewing, setReviewing] = useState<CandidateAssessment | null>(null)

  const assessments = useMemo(() => query.data ?? [], [query.data])

  const counts = useMemo(() => {
    const m = new Map<EvaluationDecision, number>()
    for (const a of assessments) {
      const d = a.evaluation_decision ?? 'pending_review'
      m.set(d, (m.get(d) ?? 0) + 1)
    }
    return EVALUATION_DECISION_ORDER.filter((d) => m.has(d)).map((decision) => ({
      decision,
      count: m.get(decision) ?? 0,
    }))
  }, [assessments])

  const filtered = useMemo(
    () =>
      decisionFilter
        ? assessments.filter(
            (a) => (a.evaluation_decision ?? 'pending_review') === decisionFilter,
          )
        : assessments,
    [assessments, decisionFilter],
  )

  const filterTabs: TabItem[] = [
    { id: 'all', label: `הכל · ${assessments.length}` },
    ...counts.map((c) => ({
      id: c.decision,
      label: `${EVALUATION_DECISION_META[c.decision].label} · ${c.count}`,
    })),
  ]

  const handleDecide = (decision: EvaluationDecision, notes: string) => {
    if (!reviewing) return
    decisionMutation
      .mutateAsync({ assessment: reviewing, decision, notes })
      .then(() => {
        setReviewing(null)
        notify('success', 'ההחלטה נשמרה')
      })
      .catch(() => notify('error', 'שמירת ההחלטה נכשלה'))
  }

  if (query.isLoading) {
    return (
      <div className="flex h-full items-center justify-center p-10">
        <Loader label="טוען הערכות…" />
      </div>
    )
  }

  if (query.isError) {
    return (
      <div className="mx-auto max-w-[980px] px-6 py-6">
        <Alert kind="error" title="שגיאה בטעינת ההערכות">
          לא ניתן לטעון את ההערכות כרגע. נסו לרענן את העמוד.
        </Alert>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-[980px] px-6 py-6">
      {assessments.length === 0 ? (
        <div className="flex h-full items-center justify-center p-10 text-center text-neutrals-nickel">
          אין הערכות מבחן-כניסה ממתינות לבדיקה.
        </div>
      ) : (
        <>
          <div className="mb-4 min-w-0 max-w-full overflow-x-auto pb-0.5">
            <Tabs
              variant="pill"
              tabs={filterTabs}
              value={decisionFilter ?? 'all'}
              onChange={(id) =>
                setDecisionFilter(id === 'all' ? null : (id as EvaluationDecision))
              }
            />
          </div>

          <div className="flex flex-col gap-2">
            {filtered.length === 0 ? (
              <p className="py-8 text-center text-small text-neutrals-nickel">
                אין הערכות בקטגוריה זו.
              </p>
            ) : (
              filtered.map((assessment) => (
                <AssessmentRow
                  key={assessment.id}
                  assessment={assessment}
                  onReview={setReviewing}
                />
              ))
            )}
          </div>
        </>
      )}

      {reviewing && (
        <AssessmentReviewDialog
          assessment={reviewing}
          isSaving={decisionMutation.isPending}
          onDecide={handleDecide}
          onClose={() => setReviewing(null)}
        />
      )}

      <ToastStack toasts={toasts} />
    </div>
  )
}
