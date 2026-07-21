/**
 * תצוגה-מקדימה של המבחן (design-export/Exam Builder.dc.html שורות 318-341) —
 * רשימת-שאלות ממוספרת לקריאה בלבד. משתמש ב-DS Dialog (עקבי עם שאר המערכת).
 */
import { Badge, Dialog } from '@/components/ui'
import { QUESTION_TYPE_META } from '../constants'
import type { ExamQuestionRow } from '../types'

export function ExamPreviewDialog({
  open,
  title,
  passingScore,
  rows,
  totalPoints,
  onClose,
}: {
  open: boolean
  title: string
  passingScore: number
  rows: ExamQuestionRow[]
  totalPoints: number
  onClose: () => void
}) {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      size="lg"
      title={`תצוגה מקדימה — ${title || 'מבחן ללא שם'}`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <Badge color="accent">{`${rows.length} שאלות`}</Badge>
          <Badge color="success">{`ציון מעבר ${passingScore}%`}</Badge>
          <Badge color="bronze">{`${totalPoints} נקודות`}</Badge>
        </div>
        {rows.map((row, i) => (
          <div
            key={row.question.id}
            className="rounded-2xl border border-neutrals-silver bg-white p-4"
          >
            <div className="flex items-start gap-3">
              <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-accent text-small font-semibold text-white">
                {i + 1}
              </span>
              <div className="flex-1">
                <div className="text-body font-semibold leading-snug text-neutrals-charcoal">
                  {row.question.question_text}
                </div>
                <div className="mt-2 text-[12px] text-neutrals-nickel">
                  {QUESTION_TYPE_META[row.question.question_type].label} · {row.points} נקודות
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Dialog>
  )
}
