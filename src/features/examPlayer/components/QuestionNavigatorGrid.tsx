/** רשת-ניווט השאלות + legend (מסמך 14 + design-export/Exam Player.dc.html). */
import type { Question } from '@/types/entities'
import { computeQuestionStatus, QUESTION_STATUS_STYLE } from './questionStatus'

const LEGEND_ORDER = ['answered', 'flagged', 'skipped', 'current', 'notseen'] as const

export interface QuestionNavigatorGridProps {
  questions: Question[]
  current: number
  answers: Record<string, unknown>
  flagged: Record<number, boolean>
  visited: Record<number, boolean>
  onJump: (index: number) => void
}

export function QuestionNavigatorGrid({
  questions,
  current,
  answers,
  flagged,
  visited,
  onJump,
}: QuestionNavigatorGridProps) {
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, index) => {
          const status = computeQuestionStatus({
            index,
            current,
            answered: answers[question.id] !== undefined,
            flagged: Boolean(flagged[index]),
            visited: Boolean(visited[index]),
          })
          const style = QUESTION_STATUS_STYLE[status]
          return (
            <button
              key={question.id}
              type="button"
              onClick={() => onJump(index)}
              title={`שאלה ${index + 1} — ${style.label}`}
              className={`relative aspect-square rounded-xl border-2 font-sans text-small font-semibold transition-transform hover:-translate-y-0.5 ${style.bg} ${style.border} ${style.text} ${
                status === 'current' ? 'ring-2 ring-accent/30' : ''
              }`}
            >
              {index + 1}
              {flagged[index] && status !== 'current' && (
                <span
                  aria-hidden="true"
                  className="absolute -top-1 -start-1 h-[18px] w-[18px] rounded-full border-2 border-white bg-[#8A6E00]"
                />
              )}
            </button>
          )
        })}
      </div>

      <div className="mt-2 flex flex-col gap-2 border-t border-neutrals-silver pt-4">
        {LEGEND_ORDER.map((status) => {
          const style = QUESTION_STATUS_STYLE[status]
          return (
            <div key={status} className="flex items-center gap-2 text-tiny">
              <span
                aria-hidden="true"
                className={`h-4 w-4 flex-none rounded-md border-2 ${style.bg} ${style.border}`}
              />
              <span className="text-neutrals-lead">{style.label}</span>
            </div>
          )
        })}
      </div>
    </div>
  )
}
