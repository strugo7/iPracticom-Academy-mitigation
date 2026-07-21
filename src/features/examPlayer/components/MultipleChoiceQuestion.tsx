/** שאלת רב-ברירה (מסמך 14 + design-export/Exam Player.dc.html — .ep-opt). */
import type { Question } from '@/types/entities'

const OPTION_KEYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו']

export interface MultipleChoiceQuestionProps {
  question: Question
  /** permutation של אינדקסים מקוריים — סדר-התצוגה (buildShuffleForExam) */
  answerOrder: number[]
  /** האינדקס המקורי הנבחר (לא אינדקס-תצוגה) */
  value: number | undefined
  onAnswer: (originalIndex: number) => void
}

export function MultipleChoiceQuestion({
  question,
  answerOrder,
  value,
  onAnswer,
}: MultipleChoiceQuestionProps) {
  const options = question.options ?? []

  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {answerOrder.map((originalIndex, displayIndex) => {
        const selected = value === originalIndex
        return (
          <button
            key={originalIndex}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onAnswer(originalIndex)}
            className={`flex min-h-[62px] w-full items-center gap-3.5 rounded-2xl border px-4 text-start transition-colors ${
              selected
                ? 'border-accent bg-hues-sky/40'
                : 'border-neutrals-silver bg-white hover:border-accent/40 hover:bg-hues-sky/10'
            }`}
          >
            <span
              className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-tiny-bold ${
                selected
                  ? 'bg-accent text-white'
                  : 'bg-neutrals-whisper text-neutrals-nickel'
              }`}
            >
              {OPTION_KEYS[displayIndex] ?? displayIndex + 1}
            </span>
            <span
              className={`flex-1 text-small ${selected ? 'font-semibold text-[#0d3a66]' : 'text-neutrals-charcoal'}`}
            >
              {options[originalIndex]}
            </span>
            <span
              aria-hidden="true"
              className={`h-5 w-5 flex-none rounded-full border-2 ${
                selected ? 'border-accent bg-accent' : 'border-neutrals-palladium'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
