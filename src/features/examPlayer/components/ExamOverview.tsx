/** מסך-סקירה לפני הגשה סופית (מסמך 14 — שלב 2 של ההגשה הדו-שלבית). */
import { Alert, Button } from '@/components/ui'
import type { Question } from '@/types/entities'
import { FlagToggle } from './FlagToggle'
import { computeQuestionStatus, QUESTION_STATUS_STYLE } from './questionStatus'

export interface ExamOverviewProps {
  questions: Question[]
  answers: Record<string, unknown>
  flagged: Record<number, boolean>
  visited: Record<number, boolean>
  onJump: (index: number) => void
  onBack: () => void
  onSubmit: () => void
  onToggleFlag: (index: number) => void
  isSubmitting: boolean
}

function answerText(question: Question, value: unknown): string {
  if (value === undefined) return 'לא נענתה'
  if (question.question_type === 'order_sequence') {
    const total = question.order_items?.length ?? 0
    return `סודרו ${total} פריטים`
  }
  return question.options?.[value as number] ?? 'לא נענתה'
}

const QUESTION_TYPE_LABEL: Record<string, string> = {
  multiple_choice: 'רב-ברירה',
  true_false: 'נכון / לא נכון',
  order_sequence: 'סידור',
}

export function ExamOverview({
  questions,
  answers,
  flagged,
  visited,
  onJump,
  onBack,
  onSubmit,
  onToggleFlag,
  isSubmitting,
}: ExamOverviewProps) {
  const answeredCount = questions.filter(
    (q) => answers[q.id] !== undefined,
  ).length
  const unansweredCount = questions.length - answeredCount
  const flaggedCount = Object.keys(flagged).length

  return (
    <div className="mx-auto flex w-full max-w-[880px] flex-col gap-6 px-6 py-8">
      <div className="grid grid-cols-3 gap-4">
        <div className="rounded-2xl border border-neutrals-silver bg-white p-4 text-center">
          <p className="text-h4 font-semibold text-neutrals-charcoal">
            {answeredCount}/{questions.length}
          </p>
          <p className="text-tiny text-neutrals-lead">שאלות שנענו</p>
        </div>
        <div className="rounded-2xl border border-neutrals-silver bg-white p-4 text-center">
          <p className="text-h4 font-semibold text-[#8A6E00]">
            {flaggedCount}
          </p>
          <p className="text-tiny text-neutrals-lead">מסומנות בדגל</p>
        </div>
        <div className="rounded-2xl border border-neutrals-silver bg-white p-4 text-center">
          <p className="text-h4 font-semibold text-hues-strawberry">
            {unansweredCount}
          </p>
          <p className="text-tiny text-neutrals-lead">ללא מענה</p>
        </div>
      </div>

      {unansweredCount > 0 && (
        <Alert kind="warning" title="יש שאלות שלא נענו">
          <p className="m-0">
            נותרו {unansweredCount} שאלות ללא מענה. ניתן להגיש בכל זאת, אך
            מומלץ לחזור ולהשלים אותן.
          </p>
        </Alert>
      )}

      <ol className="flex flex-col gap-3">
        {questions.map((question, index) => {
          const status = computeQuestionStatus({
            index,
            current: -1,
            answered: answers[question.id] !== undefined,
            flagged: Boolean(flagged[index]),
            visited: Boolean(visited[index]),
          })
          const style = QUESTION_STATUS_STYLE[status]
          return (
            <li
              key={question.id}
              className={`flex items-center gap-4 rounded-2xl border p-4 ${style.border} ${style.bg}/40`}
            >
              <button
                type="button"
                onClick={() => onJump(index)}
                className="flex flex-1 items-start gap-3 text-start"
              >
                <span
                  className={`flex h-8 w-8 flex-none items-center justify-center rounded-lg text-tiny-bold ${style.bg} ${style.text}`}
                >
                  {index + 1}
                </span>
                <span className="flex-1">
                  <span className="block text-tiny text-neutrals-lead">
                    {QUESTION_TYPE_LABEL[question.question_type]}
                  </span>
                  <span className="block text-small text-neutrals-charcoal">
                    {question.question_text}
                  </span>
                  <span
                    className={`block text-tiny ${
                      answers[question.id] !== undefined
                        ? 'text-success'
                        : 'text-hues-strawberry'
                    }`}
                  >
                    {answerText(question, answers[question.id])}
                  </span>
                </span>
              </button>
              <FlagToggle
                flagged={Boolean(flagged[index])}
                onToggle={() => onToggleFlag(index)}
              />
            </li>
          )
        })}
      </ol>

      <div className="mt-4 flex flex-col gap-3 border-t border-neutrals-silver pt-6">
        <p className="text-tiny text-neutrals-lead">
          לאחר ההגשה לא ניתן לשוב ולערוך תשובות.
        </p>
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="outlined" onClick={onBack}>
            חזרה למבחן
          </Button>
          <Button
            type="button"
            variant="primary"
            disabled={isSubmitting}
            onClick={onSubmit}
          >
            {isSubmitting ? 'מגיש…' : 'הגשה סופית'}
          </Button>
        </div>
      </div>
    </div>
  )
}
