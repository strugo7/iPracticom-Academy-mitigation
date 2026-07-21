/**
 * פירוט שאלות ניסיון-מבחן — הליבה של "היסטוריית מבחנים" (doc 09 §3.6):
 * לכל שאלה, נוסח, האפשרויות עם סימון תשובה-נבחרת/נכונה, ניקוד, וההסבר.
 * 1:1 עם design-export/UserProfile.dc.html (EXAM HISTORY → drill-down).
 */
import { Badge, Icon } from '@/components/ui'
import type { ExamHistoryQuestion } from '../types'

function OptionRow({
  text,
  isCorrect,
  isSelected,
}: {
  text: string
  isCorrect: boolean
  isSelected: boolean
}) {
  const wrongSelected = isSelected && !isCorrect
  const border = isCorrect
    ? 'border-success'
    : wrongSelected
      ? 'border-caution'
      : 'border-neutrals-silver'
  const bg = isCorrect
    ? 'bg-hues-mint/40'
    : wrongSelected
      ? 'bg-hues-salmon/30'
      : 'bg-white'
  const textColor = isCorrect
    ? 'text-success'
    : wrongSelected
      ? 'text-caution'
      : 'text-neutrals-lead'
  const dot = isCorrect
    ? 'border-success bg-success'
    : wrongSelected
      ? 'border-caution bg-caution'
      : 'border-neutrals-palladium bg-white'

  return (
    <div
      className={`flex items-center gap-2.5 rounded-md border-[1.5px] px-3 py-2 ${border} ${bg}`}
    >
      <span
        className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 text-white ${dot}`}
      >
        {isCorrect && <Icon name="Check" size={12} />}
        {wrongSelected && <Icon name="Close" size={12} />}
      </span>
      <span className={`flex-1 text-tiny ${isCorrect || wrongSelected ? 'font-semibold' : ''} ${textColor}`}>
        {text}
      </span>
      {isCorrect && (
        <span className="text-[12px] font-semibold text-success">
          {isSelected ? 'בחרת · נכון' : 'התשובה הנכונה'}
        </span>
      )}
      {wrongSelected && (
        <span className="text-[12px] font-semibold text-caution">בחרת</span>
      )}
    </div>
  )
}

function OrderSequenceSummary({
  userOrder,
  correctOrder,
}: {
  userOrder: string[]
  correctOrder: string[]
}) {
  return (
    <div className="flex flex-col gap-2 text-tiny">
      <div>
        <span className="font-semibold text-neutrals-lead">הסדר שבחרת: </span>
        <span className="text-neutrals-charcoal">{userOrder.join(' ← ') || '—'}</span>
      </div>
      <div>
        <span className="font-semibold text-success">הסדר הנכון: </span>
        <span className="text-neutrals-charcoal">{correctOrder.join(' ← ')}</span>
      </div>
    </div>
  )
}

export function ExamAttemptDetail({
  questions,
}: {
  questions: ExamHistoryQuestion[]
}) {
  return (
    <div className="flex flex-col gap-4 px-4 pb-4">
      {questions.map((q) => (
        <div
          key={q.questionId}
          className="rounded-lg border border-neutrals-silver bg-white p-4"
        >
          <div className="mb-3 flex items-start justify-between gap-3">
            <div className="text-tiny font-semibold leading-[1.4] text-neutrals-charcoal">
              {q.questionText}
            </div>
            <Badge color={q.isCorrect ? 'success' : 'caution'}>
              {q.pointsEarned}/{q.maxPoints}
            </Badge>
          </div>

          {q.questionType === 'order_sequence' ? (
            <div className="mb-3">
              <OrderSequenceSummary
                userOrder={q.userOrder ?? []}
                correctOrder={q.correctOrder ?? []}
              />
            </div>
          ) : (
            <div className="mb-3 flex flex-col gap-2">
              {q.options.map((option) => (
                <OptionRow key={option.text} {...option} />
              ))}
            </div>
          )}

          {q.explanation && (
            <div className="flex gap-2.5 rounded-md bg-neutrals-whisper px-3.5 py-3">
              <Icon
                name="QuestionFill"
                size={17}
                className="mt-0.5 shrink-0 text-accent"
              />
              <div>
                <div className="mb-0.5 text-[12.5px] font-semibold text-accent">
                  הסבר
                </div>
                <div className="text-tiny leading-[1.55] text-neutrals-lead">
                  {q.explanation}
                </div>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
