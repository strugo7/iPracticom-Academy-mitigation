/**
 * סרגל החיפוש והסינון של הגלריה — חיפוש חופשי + מיון (שורה עליונה), ושורת
 * תגי-סוג + תפריטי נושא/תגיות/שימוש. הסינון עצמו טהור (mediaSearch); כאן רק UI.
 * עוקב אחר design-export/Media Library.dc.html (toolbar + filter row).
 */
import { Icon, Input } from '@/components/ui'
import { SORT_LABEL, SORT_OPTIONS, TYPE_VISUALS } from '../constants'
import type { MediaFileType } from '@/types/entities'
import type { MediaFilters as Filters, TypeFilter } from '../types'
import { FilterMenu } from './FilterMenu'

interface MediaFiltersProps {
  filters: Filters
  onChange: (patch: Partial<Filters>) => void
  typeCounts: Record<string, number>
  total: number
  topics: string[]
  tags: string[]
}

const TYPE_ORDER: MediaFileType[] = ['image', 'gif', 'video', 'pdf']

export function MediaFilters({
  filters,
  onChange,
  typeCounts,
  total,
  topics,
  tags,
}: MediaFiltersProps) {
  const typeChip = (value: TypeFilter, label: string, count: number, icon?: MediaFileType) => {
    const active = filters.type === value
    return (
      <button
        key={value}
        type="button"
        onClick={() => onChange({ type: value })}
        className={`inline-flex h-8 items-center gap-1.5 rounded-full border-[1.5px] px-4 text-[13px] font-semibold transition-colors ${
          active
            ? 'border-accent bg-accent text-white'
            : 'border-neutrals-silver bg-white text-neutrals-lead hover:border-neutrals-palladium'
        }`}
      >
        {icon && <Icon name={TYPE_VISUALS[icon].icon} size={13} />}
        {label}
        <span className="opacity-70">{count}</span>
      </button>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      {/* חיפוש + מיון */}
      <div className="flex flex-wrap items-center gap-2">
        <Input
          className="min-w-[200px] flex-1"
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="חיפוש מדיה לפי שם או תגית…"
          leadingIcon={<Icon name="Search" size={18} />}
          aria-label="חיפוש מדיה"
        />
        <FilterMenu
          label="מיון"
          activeLabel={SORT_LABEL[filters.sort]}
          options={SORT_OPTIONS}
          selected={filters.sort}
          onSelect={(v) => onChange({ sort: (v as Filters['sort']) ?? 'recent' })}
        />
      </div>

      {/* שורת תגי-סינון */}
      <div className="flex flex-wrap items-center gap-2">
        {typeChip('all', 'הכל', total)}
        {TYPE_ORDER.map((t) =>
          typeChip(t, TYPE_VISUALS[t].label, typeCounts[t] ?? 0, t),
        )}

        <span className="mx-1 h-5 w-px bg-neutrals-silver" />

        <FilterMenu
          label="תגיות"
          activeLabel={filters.tag}
          options={tags.map((t) => ({ value: t, label: t }))}
          selected={filters.tag}
          onSelect={(v) => onChange({ tag: v })}
          clearLabel="כל התגיות"
        />
        <FilterMenu
          label="נושא"
          activeLabel={filters.topic}
          options={topics.map((t) => ({ value: t, label: t }))}
          selected={filters.topic}
          onSelect={(v) => onChange({ topic: v })}
          clearLabel="כל הנושאים"
        />
        <FilterMenu
          label="בשימוש"
          activeLabel={
            filters.usage === 'used'
              ? 'בשימוש'
              : filters.usage === 'unused'
                ? 'לא בשימוש'
                : null
          }
          options={[
            { value: 'used', label: 'בשימוש' },
            { value: 'unused', label: 'לא בשימוש' },
          ]}
          selected={filters.usage === 'all' ? null : filters.usage}
          onSelect={(v) => onChange({ usage: (v as Filters['usage']) ?? 'all' })}
          clearLabel="הכל"
        />
      </div>
    </div>
  )
}
