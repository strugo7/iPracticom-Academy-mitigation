/**
 * פירוט תשובות מבחן-הכניסה (Phase 8.3) — לכל שאלה: טקסט, תשובת-המועמד, התשובה
 * הנכונה (כשטעה), תגית נכון/שגוי וניקוד. הצבע מסמן מצב (ירוק=נכון, אדום=שגוי).
 */
import { Badge } from '@/components/ui'
import type { CandidateAnswerItem } from '@/types/entities'

interface Props {
  questions: CandidateAnswerItem[]
}

export function AssessmentAnswerList({ questions }: Props) {
  if (questions.length === 0) {
    return (
      <p className="py-8 text-center text-small text-neutrals-nickel">
        אין פירוט תשובות זמין להגשה זו.
      </p>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      {questions.map((q, i) => {
        const correct = q.is_correct === true
        return (
          <div
            key={q.question_id || i}
            className="rounded-lg border border-neutrals-silver bg-white p-3"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0 text-small font-semibold text-neutrals-charcoal">
                <span className="text-neutrals-nickel">{i + 1}.</span> {q.question_text}
              </div>
              <Badge color={correct ? 'success' : 'caution'}>{correct ? 'נכון' : 'שגוי'}</Badge>
            </div>
            <div className="mt-2 flex flex-col gap-1 text-small">
              <div>
                <span className="text-neutrals-nickel">תשובת המועמד: </span>
                <span className={correct ? 'text-hues-teal' : 'text-hues-strawberry'}>
                  {q.user_answer || '— לא נענתה'}
                </span>
              </div>
              {!correct && (
                <div>
                  <span className="text-neutrals-nickel">התשובה הנכונה: </span>
                  <span className="text-hues-teal">{q.correct_answer || '—'}</span>
                </div>
              )}
            </div>
            <div className="mt-1.5 text-tiny text-neutrals-nickel">
              {q.points_earned ?? 0}/{q.max_points ?? 0} נק׳
            </div>
          </div>
        )
      })}
    </div>
  )
}
