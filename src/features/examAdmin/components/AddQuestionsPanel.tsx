/**
 * פאנל-הוספת-שאלות בבונה (design-export/Exam Builder.dc.html שורות 246-316):
 * CTA "צור שאלה חדשה", חיפוש + פילטרים, סרגל-בחירה, ותוצאות עם checkbox +
 * תצוגה-מקדימה + הוסף/במבחן. בחירה-מרובה → "הוסף נבחרות".
 */
import { useMemo, useState } from 'react'
import { Badge, Button, Checkbox, Icon, IconButton } from '@/components/ui'
import { QUESTION_TYPES, type QuestionType } from '@/lib/constants/enums'
import { QUESTION_TYPE_META } from '../constants'
import {
  filterQuestions,
  questionPreview,
} from '../services/questionSearch'
import type { Question } from '@/types/entities'
import { EMPTY_QUESTION_FILTERS } from '../types'
import { DifficultyBadge, QuestionTypeBadge } from './badges'
import { FilterSelect } from './fields'

interface Props {
  pool: Question[]
  categories: string[]
  inExam: (id: string) => boolean
  onAdd: (q: Question) => void
  onAddMany: (qs: Question[]) => void
  onCreateNew: () => void
  onClose: () => void
}

export function AddQuestionsPanel({
  pool,
  categories,
  inExam,
  onAdd,
  onAddMany,
  onCreateNew,
  onClose,
}: Props) {
  const [filters, setFilters] = useState(EMPTY_QUESTION_FILTERS)
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const results = useMemo(() => filterQuestions(pool, filters), [pool, filters])
  const patch = (p: Partial<typeof filters>) => setFilters((f) => ({ ...f, ...p }))

  const toggleSelect = (id: string) => {
    if (inExam(id)) return
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }
  const addSelected = () => {
    const chosen = pool.filter((q) => selected.has(q.id) && !inExam(q.id))
    onAddMany(chosen)
    setSelected(new Set())
  }

  return (
    <div className="fixed inset-0 z-60 flex justify-start">
      <button
        type="button"
        aria-label="סגור"
        onClick={onClose}
        className="absolute inset-0 bg-neutrals-charcoal/40 backdrop-blur-sm"
      />
      <aside
        className="relative flex h-full w-full max-w-full flex-col bg-white shadow-menu sm:w-[480px]"
        role="dialog"
        aria-modal="true"
        aria-label="הוספת שאלות"
      >
        {/* head */}
        <div className="flex-none border-b border-neutrals-silver p-6 pb-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <span className="flex size-10 items-center justify-center rounded-lg bg-hues-sky text-accent">
                <Icon name="Table" size={19} />
              </span>
              <div>
                <h2 className="text-h4 font-semibold text-neutrals-charcoal">הוספת שאלות</h2>
                <span className="text-[12px] text-neutrals-nickel">מתוך מאגר השאלות</span>
              </div>
            </div>
            <IconButton variant="outline" size="md" aria-label="סגור" onClick={onClose}>
              <Icon name="Close" size={18} />
            </IconButton>
          </div>

          {/* create-new hero */}
          <button
            type="button"
            onClick={onCreateNew}
            className="mb-4 flex w-full items-center gap-3 rounded-2xl bg-accent-gradient p-4 text-start text-white shadow-card transition-opacity hover:opacity-95"
          >
            <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-white/20">
              <Icon name="Plus" size={20} />
            </span>
            <div className="flex-1">
              <div className="text-small font-semibold">צור שאלה חדשה</div>
              <div className="text-[12px] opacity-90">תיווסף למאגר ולמבחן הזה בבת אחת</div>
            </div>
            <Icon name="ChevronLeft" size={18} />
          </button>

          <div className="mb-3">
            <input
              value={filters.search}
              onChange={(e) => patch({ search: e.target.value })}
              placeholder="חיפוש שאלה במאגר…"
              className="h-10 w-full rounded-lg border border-neutrals-silver bg-white px-3 text-small text-neutrals-charcoal outline-none focus:border-accent"
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              label="קטגוריה"
              value={filters.category}
              onChange={(category) => patch({ category })}
              options={categories.map((c) => ({ value: c, label: c }))}
            />
            <FilterSelect
              label="סוג"
              value={filters.questionType}
              onChange={(v) => patch({ questionType: v as QuestionType | null })}
              options={QUESTION_TYPES.map((t) => ({
                value: t,
                label: QUESTION_TYPE_META[t].label,
              }))}
            />
          </div>
        </div>

        {/* selection bar */}
        {selected.size > 0 && (
          <div className="flex flex-none items-center justify-between gap-2 border-b border-neutrals-silver bg-hues-sky px-6 py-3">
            <span className="text-small font-semibold text-accent">
              {selected.size} שאלות נבחרו
            </span>
            <Button
              variant="primary"
              onClick={addSelected}
              leadingIcon={<Icon name="Plus" size={14} />}
            >
              הוסף נבחרות
            </Button>
          </div>
        )}

        {/* results */}
        <div className="flex flex-1 flex-col gap-2 overflow-y-auto p-6">
          {results.length === 0 && (
            <div className="py-8 text-center text-small text-neutrals-lead">
              לא נמצאו שאלות במאגר התואמות את החיפוש.
            </div>
          )}
          {results.map((q) => {
            const added = inExam(q.id)
            const isSelected = selected.has(q.id)
            return (
              <div
                key={q.id}
                role="button"
                tabIndex={0}
                onClick={() => toggleSelect(q.id)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    toggleSelect(q.id)
                  }
                }}
                className={`flex items-start gap-3 rounded-lg border-[1.5px] p-3 text-start transition-colors ${
                  added
                    ? 'border-success bg-hues-mint'
                    : isSelected
                      ? 'border-accent bg-hues-sky'
                      : 'border-neutrals-silver bg-white hover:border-neutrals-palladium'
                }`}
              >
                <Checkbox checked={added || isSelected} disabled={added} onChange={() => toggleSelect(q.id)} />
                <div className="min-w-0 flex-1">
                  <div className="text-small font-semibold leading-snug text-neutrals-charcoal">
                    {q.question_text}
                  </div>
                  <div className="mt-2 rounded-lg bg-neutrals-whisper p-2 text-[12px] leading-relaxed text-neutrals-lead line-clamp-2">
                    {questionPreview(q)}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-2">
                    <QuestionTypeBadge type={q.question_type} />
                    <DifficultyBadge level={q.difficulty_level ?? 'intermediate'} />
                    <span className="text-[12px] text-neutrals-nickel">
                      {q.category} · {q.points ?? 1} נק׳
                    </span>
                  </div>
                </div>
                <div className="flex-none self-center">
                  {added ? (
                    <Badge color="success">
                      <span className="inline-flex items-center gap-1">
                        <Icon name="Check" size={12} />
                        במבחן
                      </span>
                    </Badge>
                  ) : (
                    <Button
                      variant="outlined"
                      onClick={(e) => {
                        e.stopPropagation()
                        onAdd(q)
                      }}
                    >
                      הוסף
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </aside>
    </div>
  )
}
