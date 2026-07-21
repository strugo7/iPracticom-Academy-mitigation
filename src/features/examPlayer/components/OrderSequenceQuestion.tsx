/**
 * שאלת סידור-רצף (מסמך 14 + design-export/Exam Player.dc.html — moveOrder).
 * כפתורי מעלה/מטה (לא drag&drop — כך גם בעיצוב המקורי, מונע תלות חדשה ב-DnD).
 * הסידור הראשוני (לפני מגע) מגיע מ-answerOrder (הערבוב); לאחר מגע ראשון,
 * value (מזהי הפריטים בסדר הנוכחי) הוא מקור-האמת היחיד.
 */
import { Icon, IconButton } from '@/components/ui'
import type { Question } from '@/types/entities'

export interface OrderSequenceQuestionProps {
  question: Question
  /** permutation של אינדקסים מקוריים ב-order_items — סדר-התצוגה ההתחלתי (buildShuffleForExam) */
  answerOrder: number[]
  /** מזהי הפריטים בסדר הנוכחי שהמשתמש קבע; undefined = טרם נגע */
  value: string[] | undefined
  onAnswer: (orderedIds: string[]) => void
}

export function OrderSequenceQuestion({
  question,
  answerOrder,
  value,
  onAnswer,
}: OrderSequenceQuestionProps) {
  const items = question.order_items ?? []
  const itemById = new Map(items.map((item) => [item.id, item.text]))
  const currentIds =
    value ?? answerOrder.map((originalIndex) => items[originalIndex]?.id ?? '')

  function move(position: number, direction: -1 | 1) {
    const target = position + direction
    if (target < 0 || target >= currentIds.length) return
    const next = [...currentIds]
    ;[next[position], next[target]] = [next[target], next[position]]
    onAnswer(next)
  }

  return (
    <ol className="flex flex-col gap-2">
      {currentIds.map((id, position) => (
        <li
          key={id}
          className="flex items-center gap-3 rounded-2xl border border-neutrals-silver bg-white px-4 py-3"
        >
          <span className="flex h-8 w-8 flex-none items-center justify-center rounded-lg bg-neutrals-whisper text-tiny-bold text-neutrals-nickel">
            {position + 1}
          </span>
          <span className="flex-1 text-small text-neutrals-charcoal">
            {itemById.get(id)}
          </span>
          <div className="flex flex-none flex-col gap-1">
            <IconButton
              type="button"
              variant="outline"
              size="sm"
              aria-label="הזז מעלה"
              disabled={position === 0}
              onClick={() => move(position, -1)}
            >
              <Icon name="ChevronUp" size={16} />
            </IconButton>
            <IconButton
              type="button"
              variant="outline"
              size="sm"
              aria-label="הזז מטה"
              disabled={position === currentIds.length - 1}
              onClick={() => move(position, 1)}
            >
              <Icon name="ChevronDown" size={16} />
            </IconButton>
          </div>
        </li>
      ))}
    </ol>
  )
}
