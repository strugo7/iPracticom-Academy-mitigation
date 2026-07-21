import { useState } from 'react'
import { Icon, ProgressBar } from '@/components/ui'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

type CurriculumItem =
  ParsedBlockDataMap['interactive_widget']['widget_config']['curriculum'][number]

interface MiniQuestion {
  q: string
  options: string[]
  correct: number
}

function isMiniQuestion(value: unknown): value is MiniQuestion {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { q?: unknown }).q === 'string' &&
    Array.isArray((value as { options?: unknown }).options)
  )
}

/** שדות q/correct (לא question/correct_answer) — שונה מבלוק quiz העצמאי בכוונה. */
function MiniQuizQuestion({ question }: { question: MiniQuestion }) {
  const [selected, setSelected] = useState<number | null>(null)
  const revealed = selected !== null
  return (
    <div className="rounded-lg border border-neutrals-silver p-3">
      <p className="m-0 mb-2 text-[14.5px] font-semibold text-neutrals-charcoal">
        {question.q}
      </p>
      <div className="flex flex-col gap-1.5">
        {question.options.map((option, i) => {
          const isCorrect = i === question.correct
          const isWrongSelected = revealed && selected === i && !isCorrect
          return (
            <button
              key={i}
              type="button"
              onClick={() => !revealed && setSelected(i)}
              disabled={revealed}
              className={`rounded-lg border px-3 py-2 text-start text-[13.5px] transition-colors disabled:cursor-default ${
                revealed && isCorrect
                  ? 'border-success bg-hues-mint text-success'
                  : isWrongSelected
                    ? 'border-caution bg-hues-salmon text-caution'
                    : 'border-neutrals-silver bg-white text-neutrals-charcoal hover:bg-neutrals-whisper'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function CurriculumStep({ item }: { item: CurriculumItem }) {
  const content = typeof item.content === 'string' ? item.content : null
  const description =
    typeof item.description === 'string' ? item.description : null
  const instructions = Array.isArray(item.instructions)
    ? item.instructions.filter((i): i is string => typeof i === 'string')
    : []
  const questions = Array.isArray(item.questions)
    ? item.questions.filter(isMiniQuestion)
    : []

  return (
    <div className="flex flex-col gap-3">
      <h4 className="m-0 text-[16px] font-semibold text-neutrals-charcoal">
        {item.title}
      </h4>
      {content && (
        <div
          className="text-[14.5px] text-neutrals-charcoal"
          // eslint-disable-next-line react/no-danger -- מסונן דרך sanitizeRichText (DOMPurify)
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(content) }}
        />
      )}
      {description && (
        <p className="m-0 text-[14px] text-neutrals-lead">{description}</p>
      )}
      {instructions.length > 0 && (
        <ol className="ms-5 flex list-decimal flex-col gap-1 text-[14px] text-neutrals-charcoal">
          {instructions.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      )}
      {questions.length > 0 && (
        <div className="flex flex-col gap-2">
          {questions.map((q, i) => (
            <MiniQuizQuestion key={i} question={q} />
          ))}
        </div>
      )}
    </div>
  )
}

/** מיני-קוריקולום הטרוגני (intro/simulation/quiz/summary) — צעד-אחר-צעד. */
export function InteractiveWidgetBlock({
  data,
}: {
  data: ParsedBlockDataMap['interactive_widget']
}) {
  const [index, setIndex] = useState(0)
  const curriculum = data.widget_config.curriculum
  const total = curriculum.length
  const item = curriculum[index]
  if (!item) return null

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-neutrals-silver bg-white p-5">
      <ProgressBar percent={((index + 1) / total) * 100} />
      <CurriculumStep item={item} />
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={() => setIndex((i) => Math.max(i - 1, 0))}
          disabled={index === 0}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent disabled:opacity-30"
        >
          <Icon name="ArrowEast" size={14} />
          הקודם
        </button>
        <span className="text-[12.5px] text-neutrals-lead">
          {index + 1} / {total}
        </span>
        <button
          type="button"
          onClick={() => setIndex((i) => Math.min(i + 1, total - 1))}
          disabled={index === total - 1}
          className="inline-flex items-center gap-1.5 text-[13.5px] font-semibold text-accent disabled:opacity-30"
        >
          הבא
          <Icon name="ArrowWest" size={14} />
        </button>
      </div>
    </div>
  )
}
