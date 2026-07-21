/**
 * סרגל הגלריה (design-export/Concepts.dc.html שורות 51-99): חיפוש + מיון,
 * שורת שבבי-קטגוריה נגללת, ושורת רמה/סטטוס + תגית פעילה + מונה-תוצאות.
 *
 * "מומלצים" של אפשרויות-המיון בעיצוב הושמט במכוון — ל-Concept אין `is_featured`
 * (לא ב-SRS §1.9, לא ב-DDL ולא בדאטה). ראו הערה ב-types.ts.
 */
import { Icon, Input, Tag } from '@/components/ui'
import { DIFFICULTY_LEVELS, type DifficultyLevel } from '@/lib/constants/enums'
import {
  categoryMeta,
  DIFFICULTY_META,
  EDITABLE_STATUSES,
  STATUS_META,
} from '../constants'
import type { CategoryChip, ConceptFilters, ConceptSort } from '../types'
import { FilterChip } from './FilterChip'

const SORT_OPTIONS: { key: ConceptSort; label: string; icon: 'SortAZ' | 'View' }[] = [
  { key: 'az', label: 'א-ב', icon: 'SortAZ' },
  { key: 'views', label: 'הכי נצפה', icon: 'View' },
]

interface ConceptsToolbarProps {
  filters: ConceptFilters
  onChange: (patch: Partial<ConceptFilters>) => void
  chips: CategoryChip[]
  resultCount: number
}

export function ConceptsToolbar({
  filters,
  onChange,
  chips,
  resultCount,
}: ConceptsToolbarProps) {
  const toggle = <T,>(current: T | null, next: T): T | null =>
    current === next ? null : next

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <div className="min-w-[220px] flex-1">
          <Input
            value={filters.search}
            onChange={(e) => onChange({ search: e.target.value })}
            placeholder="חיפוש מונח, תיאור או תגית…"
            leadingIcon={<Icon name="Search" size={16} />}
          />
        </div>
        <div className="flex flex-none items-center overflow-hidden rounded-lg border border-neutrals-silver bg-white">
          {SORT_OPTIONS.map((option) => {
            const active = filters.sort === option.key
            return (
              <button
                key={option.key}
                type="button"
                aria-pressed={active}
                onClick={() => onChange({ sort: option.key })}
                className={`flex items-center gap-1.5 px-4 py-2 text-[13px] font-semibold transition-colors ${
                  active
                    ? 'bg-accent text-white'
                    : 'text-neutrals-lead hover:bg-neutrals-whisper'
                }`}
              >
                <Icon name={option.icon} size={14} />
                {option.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <FilterChip
          selected={filters.category === null}
          onClick={() => onChange({ category: null })}
          count={chips.reduce((sum, chip) => sum + chip.count, 0)}
        >
          הכל
        </FilterChip>
        {chips.map((chip) => {
          const meta = categoryMeta(chip.category)
          return (
            <FilterChip
              key={chip.category}
              selected={filters.category === chip.category}
              onClick={() =>
                onChange({ category: toggle(filters.category, chip.category) })
              }
              selectedFg={meta.fg}
              selectedBg={meta.bg}
              dotClassName={meta.dot}
              count={chip.count}
            >
              {chip.category}
            </FilterChip>
          )
        })}
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-neutrals-nickel">רמה</span>
          <div className="flex items-center gap-1">
            {DIFFICULTY_LEVELS.map((level: DifficultyLevel) => (
              <FilterChip
                key={level}
                selected={filters.difficulty === level}
                onClick={() =>
                  onChange({ difficulty: toggle(filters.difficulty, level) })
                }
              >
                {DIFFICULTY_META[level].label}
              </FilterChip>
            ))}
          </div>
        </div>

        <span className="h-5 w-px bg-neutrals-silver" aria-hidden="true" />

        <div className="flex items-center gap-2">
          <span className="text-[12px] font-semibold text-neutrals-nickel">סטטוס</span>
          <div className="flex items-center gap-1">
            {EDITABLE_STATUSES.map((status) => (
              <FilterChip
                key={status}
                selected={filters.status === status}
                onClick={() => onChange({ status: toggle(filters.status, status) })}
              >
                {STATUS_META[status].label}
              </FilterChip>
            ))}
          </div>
        </div>

        {filters.tag && (
          <>
            <span className="h-5 w-px bg-neutrals-silver" aria-hidden="true" />
            <Tag type="blue" onRemove={() => onChange({ tag: null })}>
              {`תגית: ${filters.tag}`}
            </Tag>
          </>
        )}

        <span className="ms-auto text-small text-neutrals-lead">
          {`${resultCount} מונחים`}
        </span>
      </div>
    </div>
  )
}
