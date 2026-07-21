/**
 * כרטיס שאלה יחיד במבחן-הכניסה של המועמד (Phase 8.2). multiple_choice/true_false
 * — אפשרויות כ-Radio של ה-DS; הכרטיס מדגיש את האפשרות שנבחרה.
 */
import { Radio } from '@/components/ui'
import type { CandidateExamQuestion } from '../types'

interface Props {
  index: number
  total: number
  question: CandidateExamQuestion
  selected: number | undefined
  onSelect: (optionIndex: number) => void
}

export function CandidateExamQuestionCard({
  index,
  total,
  question,
  selected,
  onSelect,
}: Props) {
  return (
    <div className="rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-1 text-tiny font-semibold text-neutrals-nickel">
        שאלה {index} מתוך {total}
      </div>
      <div className="mb-4 text-body font-semibold text-neutrals-charcoal">{question.text}</div>
      <div className="flex flex-col gap-2">
        {question.options.map((opt, i) => {
          const active = selected === i
          return (
            <div
              key={i}
              className={`rounded-xl border px-4 py-3 transition-colors ${
                active ? 'border-accent bg-hues-sky/40' : 'border-neutrals-silver hover:bg-neutrals-whisper'
              }`}
            >
              <Radio
                name={question.id}
                checked={active}
                onChange={() => onSelect(i)}
                label={opt}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}
