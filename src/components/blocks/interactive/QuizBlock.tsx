import { useState } from 'react'
import { Icon } from '@/components/ui'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/**
 * בדיקה פורמטיבית קלה בתוך שיעור — לא מבחן (Exam) מלא: אין ערבוב-seed
 * (doc 14/35 — תחום ExamPlayer, שלב נפרד), אין ציון נשמר. הצגה עוקבת פשוטה.
 */
export function QuizBlock({ data }: { data: ParsedBlockDataMap['quiz'] }) {
  const [index, setIndex] = useState(0)
  const [selected, setSelected] = useState<number | null>(null)
  const total = data.questions.length
  const question = data.questions[index]

  if (!question) return null
  const revealed = selected !== null

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutrals-silver bg-white p-5">
      <div className="text-[12.5px] font-semibold text-neutrals-lead">
        שאלה {index + 1} מתוך {total}
      </div>
      <p className="m-0 text-[16px] font-semibold text-neutrals-charcoal">
        {question.question}
      </p>
      <div className="flex flex-col gap-2">
        {question.options.map((option, i) => {
          const isCorrectOption = i === question.correct_answer
          const isWrongSelected = revealed && selected === i && !isCorrectOption
          const highlight = revealed && isCorrectOption
          return (
            <button
              key={i}
              type="button"
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={`flex items-center justify-between rounded-lg border px-4 py-2.5 text-start text-[14.5px] transition-colors disabled:cursor-default ${
                highlight
                  ? 'border-success bg-hues-mint text-success'
                  : isWrongSelected
                    ? 'border-caution bg-hues-salmon text-caution'
                    : 'border-neutrals-silver bg-white text-neutrals-charcoal hover:bg-neutrals-whisper'
              }`}
            >
              <span>{option}</span>
              {highlight && <Icon name="Check" size={16} />}
              {isWrongSelected && <Icon name="Close" size={16} />}
            </button>
          )
        })}
      </div>
      {revealed && question.explanation && (
        <p className="m-0 text-[13.5px] text-neutrals-lead">
          {question.explanation}
        </p>
      )}
      {revealed && index < total - 1 && (
        <button
          type="button"
          onClick={() => {
            setSelected(null)
            setIndex((i) => i + 1)
          }}
          className="self-start rounded-lg bg-accent px-4 py-2 text-[13.5px] font-semibold text-white"
        >
          שאלה הבאה
        </button>
      )}
    </div>
  )
}
