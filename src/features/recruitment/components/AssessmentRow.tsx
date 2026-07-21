/**
 * שורת-הערכה בטאב ההערכות (Phase 8.3) — אווטאר + שם + מייל + ציון + החלטה
 * נוכחית + חץ-כניסה לקריאה. השורה כולה כפתור (פותח את דיאלוג-הקריאה).
 */
import { Badge, Icon } from '@/components/ui'
import { avatarHueClass, initialsOf } from '@/lib/constants/invites'
import type { CandidateAssessment } from '@/types/entities'
import { EVALUATION_DECISION_META, SCORE_PASS_THRESHOLD } from '../constants'

interface Props {
  assessment: CandidateAssessment
  onReview: (assessment: CandidateAssessment) => void
}

export function AssessmentRow({ assessment, onReview }: Props) {
  const name = assessment.candidate_full_name || assessment.candidate_email
  const decision = assessment.evaluation_decision ?? 'pending_review'
  const decisionMeta = EVALUATION_DECISION_META[decision]
  const scoreColor = assessment.score >= SCORE_PASS_THRESHOLD ? 'success' : 'caution'

  return (
    <button
      type="button"
      onClick={() => onReview(assessment)}
      className="flex w-full items-center gap-3 rounded-lg border border-neutrals-silver bg-white p-3 text-start transition-colors hover:bg-neutrals-whisper"
    >
      <span
        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold text-white ${avatarHueClass(assessment.id)}`}
      >
        {initialsOf(name)}
      </span>
      <div className="min-w-0 flex-1">
        <div className="font-semibold text-small text-neutrals-charcoal">{name}</div>
        <div className="mt-1 truncate text-tiny text-neutrals-nickel">
          {assessment.candidate_email}
        </div>
      </div>
      <Badge color={scoreColor}>ציון {assessment.score}</Badge>
      <Badge color={decisionMeta.badgeColor}>{decisionMeta.label}</Badge>
      <Icon name="ChevronLeft" size={18} className="shrink-0 text-neutrals-nickel" />
    </button>
  )
}
