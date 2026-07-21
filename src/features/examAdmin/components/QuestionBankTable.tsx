/**
 * טבלת מאגר-השאלות (design-export/Question Bank.dc.html שורות 78-147): רשת-דסקטופ
 * + כרטיסי-מובייל. כל שורה: צ'יפ-סוג, נוסח, סטטוס, badges, ניקוד, שיעור-הצלחה,
 * מונה-שימוש, ופעולות hover (עריכה/שכפול/מחיקה).
 */
import { Icon, IconButton } from '@/components/ui'
import { QUESTION_TYPE_META } from '../constants'
import type { Question } from '@/types/entities'
import { DifficultyBadge, ExamGlyphChip, QuestionTypeBadge, StatusBadge } from './badges'
import type { EditableStatus } from '../types'

export interface QuestionRowActions {
  onEdit: (q: Question) => void
  onDuplicate: (q: Question) => void
  onDelete: (q: Question) => void
}

const COLS =
  'grid-cols-[minmax(0,1.9fr)_112px_128px_96px_64px_128px_120px]'

/** צבע פס-ההצלחה לפי סף (design-export: 75/55). */
function successColor(rate: number): string {
  if (rate >= 75) return 'bg-success'
  if (rate >= 55) return 'bg-warning'
  return 'bg-caution'
}

function UsagePill({ count }: { count: number }) {
  const inUse = count > 0
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold ${
        inUse ? 'bg-hues-sky text-accent' : 'bg-neutrals-whisper text-neutrals-nickel'
      }`}
    >
      <Icon name="File" size={13} />
      {inUse ? `ב-${count} מבחנים` : 'לא בשימוש'}
    </span>
  )
}

function SuccessBar({ rate }: { rate: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-neutrals-whisper">
        <div
          className={`h-full rounded-full ${successColor(rate)}`}
          style={{ width: `${Math.min(100, Math.max(0, rate))}%` }}
        />
      </div>
      <span className="text-[12px] font-semibold text-neutrals-lead">{rate}%</span>
    </div>
  )
}

function RowActions({ q, actions }: { q: Question; actions: QuestionRowActions }) {
  const stop = (fn: () => void) => (e: React.MouseEvent) => {
    e.stopPropagation()
    fn()
  }
  return (
    <div className="absolute inset-inline-end-4 flex items-center gap-1 bg-neutrals-whisper ps-6 opacity-0 transition-opacity group-hover:opacity-100">
      <IconButton variant="ghost" size="sm" title="ערוך" onClick={stop(() => actions.onEdit(q))}>
        <Icon name="Edit" size={15} />
      </IconButton>
      <IconButton variant="ghost" size="sm" title="שכפל" onClick={stop(() => actions.onDuplicate(q))}>
        <Icon name="Duplicate" size={15} />
      </IconButton>
      <IconButton variant="outline" size="sm" title="מחק" onClick={stop(() => actions.onDelete(q))}>
        <Icon name="Remove" size={15} />
      </IconButton>
    </div>
  )
}

export function QuestionBankTable({
  questions,
  actions,
}: {
  questions: Question[]
  actions: QuestionRowActions
}) {
  return (
    <>
      {/* DESKTOP */}
      <div className="hidden overflow-hidden rounded-2xl bg-white shadow-card md:block">
        <div
          className={`grid ${COLS} items-center gap-2 border-b border-neutrals-silver bg-neutrals-whisper px-5 py-3 text-[12px] font-semibold text-neutrals-nickel`}
        >
          <div>נוסח השאלה</div>
          <div>סוג</div>
          <div>קטגוריה</div>
          <div>רמת קושי</div>
          <div>ניקוד</div>
          <div>שיעור הצלחה</div>
          <div>שימוש</div>
        </div>
        {questions.map((q) => {
          const meta = QUESTION_TYPE_META[q.question_type]
          return (
            <div
              key={q.id}
              role="button"
              tabIndex={0}
              onClick={() => actions.onEdit(q)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  actions.onEdit(q)
                }
              }}
              className={`group grid w-full ${COLS} cursor-pointer items-center gap-2 border-b border-neutrals-silver bg-white px-5 py-4 text-start transition-colors last:border-b-0 hover:bg-neutrals-whisper focus:outline-none focus-visible:bg-neutrals-whisper`}
            >
              <div className="flex min-w-0 items-center gap-3">
                <ExamGlyphChip glyph={q.question_type} color={meta.color} size={32} />
                <div className="min-w-0">
                  <div className="truncate text-small font-semibold text-neutrals-charcoal">
                    {q.question_text}
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[12px]">
                    <span className="text-neutrals-nickel">{q.id.slice(-6)}</span>
                    <StatusBadge status={(q.status as EditableStatus) ?? 'draft'} />
                  </div>
                </div>
              </div>
              <div><QuestionTypeBadge type={q.question_type} /></div>
              <div className="truncate text-small text-neutrals-charcoal">{q.category}</div>
              <div><DifficultyBadge level={q.difficulty_level ?? 'intermediate'} /></div>
              <div className="text-small font-semibold text-neutrals-charcoal">
                {q.points ?? 1}
                <span className="text-[12px] font-normal text-neutrals-nickel"> נק׳</span>
              </div>
              <div><SuccessBar rate={q.success_rate ?? 0} /></div>
              <div className="relative flex items-center">
                <UsagePill count={q.usage_count ?? 0} />
                <RowActions q={q} actions={actions} />
              </div>
            </div>
          )
        })}
      </div>

      {/* MOBILE */}
      <div className="flex flex-col gap-3 md:hidden">
        {questions.map((q) => {
          const meta = QUESTION_TYPE_META[q.question_type]
          return (
            <button
              key={q.id}
              type="button"
              onClick={() => actions.onEdit(q)}
              className="rounded-2xl bg-white p-4 text-start shadow-card"
            >
              <div className="flex items-start gap-3">
                <ExamGlyphChip glyph={q.question_type} color={meta.color} size={36} />
                <div className="min-w-0 flex-1">
                  <div className="text-body font-semibold text-neutrals-charcoal">
                    {q.question_text}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <QuestionTypeBadge type={q.question_type} />
                    <DifficultyBadge level={q.difficulty_level ?? 'intermediate'} />
                    <span className="text-[12px] text-neutrals-lead">{q.category}</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex items-center gap-4 border-t border-neutrals-silver pt-4">
                <div className="flex-1"><SuccessBar rate={q.success_rate ?? 0} /></div>
                <span className="text-small font-semibold text-neutrals-charcoal">
                  {q.points ?? 1} <span className="text-[12px] font-normal text-neutrals-nickel">נק׳</span>
                </span>
                <UsagePill count={q.usage_count ?? 0} />
              </div>
            </button>
          )
        })}
      </div>
    </>
  )
}
