/**
 * רשימת-המבחנים (design-export/Exam Builder.dc.html שורות 64-94): טבלת-דסקטופ
 * עם צ'יפ-מבחן, כותרת + כותרת-משנה (קטגוריה·סוג), badge-סוג, מונה-שאלות,
 * ציון-מעבר, badge-סטטוס, פעולת-פתיחה. מחיקה ב-hover.
 */
import { Icon, IconButton } from '@/components/ui'
import { EXAM_TYPE_META } from '../constants'
import { examQuestionCount } from '../services/examService'
import type { Exam } from '@/types/entities'
import type { EditableStatus } from '../types'
import { ExamGlyphChip, ExamTypeBadge, StatusBadge } from './badges'

const COLS = 'grid-cols-[minmax(0,2fr)_120px_110px_110px_120px_72px]'

export function ExamListTable({
  exams,
  onOpen,
  onDelete,
}: {
  exams: Exam[]
  onOpen: (exam: Exam) => void
  onDelete: (exam: Exam) => void
}) {
  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-card">
      <div
        className={`grid ${COLS} items-center gap-2 border-b border-neutrals-silver bg-neutrals-whisper px-5 py-3 text-[12px] font-semibold text-neutrals-nickel`}
      >
        <div>שם המבחן</div>
        <div>סוג</div>
        <div>שאלות</div>
        <div>ציון מעבר</div>
        <div>סטטוס</div>
        <div />
      </div>
      {exams.map((exam) => {
        const type = exam.exam_type ?? 'standalone_exam'
        return (
          <div
            key={exam.id}
            role="button"
            tabIndex={0}
            onClick={() => onOpen(exam)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onOpen(exam)
              }
            }}
            className={`group grid w-full ${COLS} cursor-pointer items-center gap-2 border-b border-neutrals-silver bg-white px-5 py-4 text-start transition-colors last:border-b-0 hover:bg-neutrals-whisper focus:outline-none focus-visible:bg-neutrals-whisper`}
          >
            <div className="flex min-w-0 items-center gap-3">
              <ExamGlyphChip glyph="exam" color="accent" size={40} />
              <div className="min-w-0">
                <div className="truncate text-body font-semibold text-neutrals-charcoal">
                  {exam.title || 'מבחן ללא שם'}
                </div>
                <div className="mt-0.5 truncate text-[12px] text-neutrals-nickel">
                  {exam.category ?? 'ללא קטגוריה'} · {EXAM_TYPE_META[type].label}
                </div>
              </div>
            </div>
            <div><ExamTypeBadge type={type} /></div>
            <div className="text-body font-semibold text-neutrals-charcoal">
              {examQuestionCount(exam)}
              <span className="text-[12px] font-normal text-neutrals-nickel"> שאלות</span>
            </div>
            <div className="text-body font-semibold text-neutrals-charcoal">
              {exam.passing_score ?? 70}
              <span className="text-[12px] font-normal text-neutrals-nickel">%</span>
            </div>
            <div><StatusBadge status={(exam.status as EditableStatus) ?? 'draft'} /></div>
            <div className="flex items-center justify-end">
              <span className="text-neutrals-palladium group-hover:hidden">
                <Icon name="ChevronLeft" size={18} />
              </span>
              <span className="hidden group-hover:block">
                <IconButton
                  variant="outline"
                  size="sm"
                  title="מחק מבחן"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDelete(exam)
                  }}
                >
                  <Icon name="Remove" size={15} />
                </IconButton>
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}
