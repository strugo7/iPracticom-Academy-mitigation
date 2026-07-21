/**
 * דיאלוג קריאת-הערכה + החלטת-מנהל (Phase 8.3, מסמך 35). שני מבטים פנימיים:
 * "סקירה" (ציון, סטטיסטיקות, סיכום-AI, החלטה+הערות) ו"פירוט תשובות" (נכון/שגוי
 * per-שאלה). נבנה על Dialog של ה-DS (אין drawer ב-DS — פער מאומת, §6.1).
 */
import { useState } from 'react'
import { Badge, Button, Dialog, FieldLabel, Tabs, type TabItem, Textarea } from '@/components/ui'
import type { EvaluationDecision } from '@/lib/constants/enums'
import { avatarHueClass, initialsOf } from '@/lib/constants/invites'
import type { CandidateAssessment } from '@/types/entities'
import {
  DECIDABLE_DECISIONS,
  EVALUATION_DECISION_META,
  SCORE_PASS_THRESHOLD,
} from '../constants'
import { AssessmentAnswerList } from './AssessmentAnswerList'

interface Props {
  assessment: CandidateAssessment
  isSaving: boolean
  onDecide: (decision: EvaluationDecision, notes: string) => void
  onClose: () => void
}

const DECISION_TABS: TabItem[] = DECIDABLE_DECISIONS.map((d) => ({
  id: d,
  label: EVALUATION_DECISION_META[d].label,
}))

function formatDuration(seconds: number | null | undefined): string {
  if (!seconds) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export function AssessmentReviewDialog({ assessment, isSaving, onDecide, onClose }: Props) {
  const current = assessment.evaluation_decision
  const [view, setView] = useState<'review' | 'answers'>('review')
  const [decision, setDecision] = useState<EvaluationDecision>(
    current && current !== 'pending_review' ? current : 'approved',
  )
  const [notes, setNotes] = useState(assessment.evaluator_notes ?? '')

  const name = assessment.candidate_full_name || assessment.candidate_email
  const passed = assessment.score >= SCORE_PASS_THRESHOLD
  const scoreTone = passed ? 'text-hues-teal' : 'text-hues-strawberry'

  const questions = assessment.answers?.questions ?? []
  const correctCount = questions.filter((q) => q.is_correct === true).length

  const viewTabs: TabItem[] = [
    { id: 'review', label: 'סקירה' },
    {
      id: 'answers',
      label: `פירוט תשובות · ${correctCount}/${questions.length}`,
      disabled: questions.length === 0,
    },
  ]

  return (
    <Dialog
      open
      onClose={onClose}
      title="בדיקת הערכת-מועמד"
      size="lg"
      footer={
        <>
          <Button variant="white" onClick={onClose}>
            ביטול
          </Button>
          <Button variant="primary" disabled={isSaving} onClick={() => onDecide(decision, notes)}>
            {isSaving ? 'שומר…' : 'שמור החלטה'}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        {/* כותרת המועמד — קבועה בשני המבטים */}
        <div className="flex items-center gap-3">
          <span
            className={`flex size-12 shrink-0 items-center justify-center rounded-full text-body font-semibold text-white ${avatarHueClass(assessment.id)}`}
          >
            {initialsOf(name)}
          </span>
          <div className="min-w-0">
            <div className="font-semibold text-body text-neutrals-charcoal">{name}</div>
            <div className="truncate text-small text-neutrals-nickel">
              {assessment.candidate_email}
              {assessment.department ? ` · ${assessment.department}` : ''}
            </div>
          </div>
        </div>

        <Tabs tabs={viewTabs} value={view} onChange={(id) => setView(id as 'review' | 'answers')} />

        {view === 'review' ? (
          <>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border border-neutrals-silver bg-neutrals-whisper p-3 text-center">
                <div className="text-tiny text-neutrals-nickel">ציון</div>
                <div className={`text-h4 font-semibold ${scoreTone}`}>{assessment.score}</div>
              </div>
              <div className="rounded-xl border border-neutrals-silver bg-neutrals-whisper p-3 text-center">
                <div className="text-tiny text-neutrals-nickel">תשובות נכונות</div>
                <div className="text-h4 font-semibold text-neutrals-charcoal">
                  {assessment.correct_answers ?? correctCount}
                  <span className="text-small text-neutrals-nickel">
                    /{assessment.total_questions ?? questions.length}
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-neutrals-silver bg-neutrals-whisper p-3 text-center">
                <div className="text-tiny text-neutrals-nickel">משך</div>
                <div className="text-h4 font-semibold text-neutrals-charcoal">
                  {formatDuration(assessment.time_spent_seconds)}
                </div>
              </div>
            </div>

            {assessment.ai_summary && (
              <div>
                <FieldLabel>סיכום AI</FieldLabel>
                <div className="max-h-40 overflow-y-auto rounded-lg border border-neutrals-silver bg-white p-3 text-small leading-relaxed text-neutrals-lead">
                  {assessment.ai_summary}
                </div>
              </div>
            )}

            <div>
              <FieldLabel>החלטה</FieldLabel>
              <Tabs
                variant="pill"
                tabs={DECISION_TABS}
                value={decision}
                onChange={(id) => setDecision(id as EvaluationDecision)}
              />
            </div>

            <div>
              <FieldLabel>הערות</FieldLabel>
              <Textarea
                rows={3}
                placeholder="נימוק ההחלטה (נשמר עם ההערכה)"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {current && (
              <p className="m-0 flex items-center gap-2 text-tiny text-neutrals-nickel">
                החלטה נוכחית:
                <Badge color={EVALUATION_DECISION_META[current].badgeColor}>
                  {EVALUATION_DECISION_META[current].label}
                </Badge>
              </p>
            )}
          </>
        ) : (
          <div className="max-h-[46vh] overflow-y-auto pe-1">
            <AssessmentAnswerList questions={questions} />
          </div>
        )}
      </div>
    </Dialog>
  )
}
