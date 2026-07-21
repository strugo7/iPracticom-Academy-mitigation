/**
 * סרגל מאגר-השאלות (design-export שורות 51-76): חיפוש (DS Input) + 4 פילטרים
 * (קטגוריה/סוג/קושי/סטטוס) + שורת-תוצאות עם מונה ותג "מסונן".
 */
import { Badge, Icon, Input } from '@/components/ui'
import {
  DIFFICULTY_LEVELS,
  type DifficultyLevel,
  QUESTION_TYPES,
  type QuestionType,
} from '@/lib/constants/enums'
import { DIFFICULTY_META, QUESTION_TYPE_META, STATUS_META } from '../constants'
import type { EditableStatus, QuestionFilters } from '../types'
import { FilterSelect } from './fields'

const STATUS_KEYS: EditableStatus[] = ['draft', 'published', 'archived']

export function QuestionBankToolbar({
  filters,
  onChange,
  categories,
  count,
  isFiltering,
}: {
  filters: QuestionFilters
  onChange: (patch: Partial<QuestionFilters>) => void
  categories: string[]
  count: number
  isFiltering: boolean
}) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="min-w-[220px] flex-1">
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="חיפוש לפי נוסח השאלה…"
            leadingIcon={<Icon name="Search" size={16} />}
          />
        </div>
        <FilterSelect
          label="קטגוריה"
          value={filters.category}
          onChange={(category) => onChange({ category })}
          options={categories.map((c) => ({ value: c, label: c }))}
        />
        <FilterSelect
          label="סוג"
          value={filters.questionType}
          onChange={(v) => onChange({ questionType: v as QuestionType | null })}
          options={QUESTION_TYPES.map((t) => ({
            value: t,
            label: QUESTION_TYPE_META[t].label,
          }))}
        />
        <FilterSelect
          label="קושי"
          value={filters.difficulty}
          onChange={(v) => onChange({ difficulty: v as DifficultyLevel | null })}
          options={DIFFICULTY_LEVELS.map((d) => ({
            value: d,
            label: DIFFICULTY_META[d].label,
          }))}
        />
        <FilterSelect
          label="סטטוס"
          value={filters.status}
          onChange={(v) => onChange({ status: v as EditableStatus | null })}
          options={STATUS_KEYS.map((s) => ({
            value: s,
            label: STATUS_META[s].label,
          }))}
        />
      </div>

      <div className="flex items-center gap-2">
        <span className="text-small font-semibold text-neutrals-charcoal">{count}</span>
        <span className="text-small text-neutrals-lead">שאלות במאגר</span>
        {isFiltering && <Badge color="accent">מסונן</Badge>}
      </div>
    </div>
  )
}
