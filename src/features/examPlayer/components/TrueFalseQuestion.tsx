/**
 * שאלת נכון/לא נכון (מסמך 14 + design-export/Exam Player.dc.html). סמנטיקה
 * קבועה: אינדקס 0 בדאטה האמיתי הוא תמיד "נכון", 1 תמיד "לא נכון" — לכן לא
 * מיושם עליה ערבוב-תצוגה (ראו shuffle.ts), רק multiple_choice/order_sequence.
 */
import type { Question } from '@/types/entities'

export interface TrueFalseQuestionProps {
  question: Question
  value: number | undefined
  onAnswer: (originalIndex: number) => void
}

export function TrueFalseQuestion({
  question,
  value,
  onAnswer,
}: TrueFalseQuestionProps) {
  const trueLabel = question.options?.[0] ?? 'נכון'
  const falseLabel = question.options?.[1] ?? 'לא נכון'

  return (
    <div className="flex gap-4" role="radiogroup">
      <button
        type="button"
        role="radio"
        aria-checked={value === 0}
        onClick={() => onAnswer(0)}
        className={`flex-1 rounded-2xl border px-6 py-8 text-body-bold transition-colors ${
          value === 0
            ? 'border-success bg-hues-mint/60 text-success'
            : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-success/40'
        }`}
      >
        {trueLabel}
      </button>
      <button
        type="button"
        role="radio"
        aria-checked={value === 1}
        onClick={() => onAnswer(1)}
        className={`flex-1 rounded-2xl border px-6 py-8 text-body-bold transition-colors ${
          value === 1
            ? 'border-hues-strawberry bg-hues-salmon/40 text-hues-strawberry'
            : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-hues-strawberry/40'
        }`}
      >
        {falseLabel}
      </button>
    </div>
  )
}
