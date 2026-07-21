/**
 * גופי-העריכה הספציפיים לסוג-שאלה (3 סוגים) — design-export/Question Bank.dc.html
 * (שורות 202-282). כולם controlled: מקבלים QuestionDraft + onChange ומעדכנים
 * את הפלח הרלוונטי. סידור נעשה בחיצים למעלה/למטה (כמו העיצוב), לא בגרירה.
 */
import { Icon, IconButton } from '@/components/ui'
import { newOrderItem } from '../services/questionForm'
import type { QuestionDraft } from '../types'

interface BodyProps {
  draft: QuestionDraft
  onChange: (patch: Partial<QuestionDraft>) => void
}

/** כפתור-הוספה מקווקו (accent) — design-export: addAnswer/addItem. */
function AddDashed({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 self-start rounded-lg border border-dashed border-accent bg-white px-4 py-2 text-[12px] font-semibold text-accent transition-colors hover:bg-hues-sky"
    >
      <Icon name="Plus" size={15} />
      {label}
    </button>
  )
}

export function MultipleChoiceBody({ draft, onChange }: BodyProps) {
  const setOption = (i: number, v: string) =>
    onChange({ options: draft.options.map((o, idx) => (idx === i ? v : o)) })
  const addOption = () => onChange({ options: [...draft.options, ''] })
  const removeOption = (i: number) => {
    const options = draft.options.filter((_, idx) => idx !== i)
    let correctIndex = draft.correctIndex
    if (i < correctIndex) correctIndex -= 1
    if (correctIndex >= options.length) correctIndex = options.length - 1
    onChange({ options, correctIndex: Math.max(0, correctIndex) })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutrals-charcoal">
          תשובות
        </span>
        <span className="text-[12px] text-neutrals-nickel">
          סמנו את התשובה הנכונה
        </span>
      </div>
      {draft.options.map((opt, i) => {
        const correct = draft.correctIndex === i
        return (
          <div
            // biome-ignore lint/suspicious/noArrayIndexKey: אין מזהה יציב לתשובה
            key={i}
            className={`flex items-center gap-2 rounded-lg border p-2 px-3 transition-colors ${
              correct
                ? 'border-success bg-hues-mint'
                : 'border-neutrals-silver bg-white'
            }`}
          >
            <button
              type="button"
              aria-label="סמן כתשובה נכונה"
              onClick={() => onChange({ correctIndex: i })}
              className={`flex size-6 flex-none items-center justify-center rounded-full border-2 bg-white transition-colors ${
                correct ? 'border-success' : 'border-neutrals-palladium'
              }`}
            >
              <span
                className={`size-3 rounded-full ${correct ? 'bg-success' : 'bg-transparent'}`}
              />
            </button>
            <input
              value={opt}
              onChange={(e) => setOption(i, e.target.value)}
              placeholder={`תשובה ${i + 1}`}
              className="min-w-0 flex-1 border-0 bg-transparent text-small text-neutrals-charcoal outline-none placeholder:text-neutrals-nickel"
            />
            {correct && (
              <span className="flex flex-none items-center gap-1 text-[12px] font-semibold text-success">
                <Icon name="Check" size={13} />
                נכונה
              </span>
            )}
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="הסר תשובה"
              onClick={() => removeOption(i)}
            >
              <Icon name="Close" size={15} />
            </IconButton>
          </div>
        )
      })}
      <AddDashed label="הוסף תשובה" onClick={addOption} />
    </div>
  )
}

export function TrueFalseBody({ draft, onChange }: BodyProps) {
  const on = draft.trueFalseCorrect
  const cell = (active: boolean, tone: 'true' | 'false') =>
    active
      ? tone === 'true'
        ? 'border-success bg-hues-mint text-success'
        : 'border-caution bg-hues-salmon text-caution'
      : 'border-neutrals-silver bg-white text-neutrals-lead'
  return (
    <div className="flex flex-col gap-2">
      <span className="text-[12px] font-semibold text-neutrals-charcoal">
        התשובה הנכונה
      </span>
      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => onChange({ trueFalseCorrect: true })}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-body font-semibold transition-colors ${cell(on, 'true')}`}
        >
          <Icon name="Check" size={20} />
          נכון
        </button>
        <button
          type="button"
          onClick={() => onChange({ trueFalseCorrect: false })}
          className={`flex items-center justify-center gap-2 rounded-lg border-2 p-4 text-body font-semibold transition-colors ${cell(!on, 'false')}`}
        >
          <Icon name="Close" size={20} />
          לא נכון
        </button>
      </div>
    </div>
  )
}

export function OrderSequenceBody({ draft, onChange }: BodyProps) {
  const items = draft.orderItems
  const setText = (i: number, text: string) =>
    onChange({
      orderItems: items.map((it, idx) => (idx === i ? { ...it, text } : it)),
    })
  const addItem = () => onChange({ orderItems: [...items, newOrderItem()] })
  const removeItem = (i: number) =>
    onChange({ orderItems: items.filter((_, idx) => idx !== i) })
  const move = (i: number, dir: -1 | 1) => {
    const j = i + dir
    if (j < 0 || j >= items.length) return
    const next = [...items]
    ;[next[i], next[j]] = [next[j], next[i]]
    onChange({ orderItems: next })
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[12px] font-semibold text-neutrals-charcoal">
          פריטים לסידור
        </span>
        <span className="text-[12px] text-neutrals-nickel">
          הסדר כאן = הסדר הנכון
        </span>
      </div>
      {items.map((item, i) => (
        <div
          key={item.id}
          className="flex items-center gap-2 rounded-lg border border-neutrals-silver bg-white p-2 px-3"
        >
          <span className="flex size-6 flex-none items-center justify-center rounded-lg bg-hues-sky text-[12px] font-semibold text-accent">
            {i + 1}
          </span>
          <input
            value={item.text}
            onChange={(e) => setText(i, e.target.value)}
            placeholder={`פריט ${i + 1}`}
            className="min-w-0 flex-1 border-0 bg-transparent text-small text-neutrals-charcoal outline-none placeholder:text-neutrals-nickel"
          />
          <div className="flex flex-none flex-col gap-0.5">
            <button
              type="button"
              aria-label="הזז למעלה"
              onClick={() => move(i, -1)}
              className="flex h-[18px] w-[22px] items-center justify-center rounded text-neutrals-nickel transition-colors hover:bg-hues-sky hover:text-accent"
            >
              <Icon name="ChevronUp" size={14} />
            </button>
            <button
              type="button"
              aria-label="הזז למטה"
              onClick={() => move(i, 1)}
              className="flex h-[18px] w-[22px] items-center justify-center rounded text-neutrals-nickel transition-colors hover:bg-hues-sky hover:text-accent"
            >
              <Icon name="ChevronDown" size={14} />
            </button>
          </div>
          <IconButton
            variant="ghost"
            size="sm"
            aria-label="הסר פריט"
            onClick={() => removeItem(i)}
          >
            <Icon name="Close" size={15} />
          </IconButton>
        </div>
      ))}
      <AddDashed label="הוסף פריט" onClick={addItem} />
    </div>
  )
}
