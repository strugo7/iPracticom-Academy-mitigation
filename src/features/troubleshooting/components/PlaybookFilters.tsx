/**
 * שורת החיפוש + הפילטרים של הספרייה (design-export/Troubleshooting.dc.html):
 * תיבת-חיפוש חופשית + שלושה בוררי-DS (קטגוריה / רמת קושי / תגית). האפשרויות
 * נגזרות מהדאטה, כדי שלא יוצג בורר ריק.
 */
import { FilterSelect, Icon, Input } from '@/components/ui'
import type { FilterOption, PlaybookFilters as Filters } from '../types'

export function PlaybookFilters({
  filters,
  patchFilters,
  categoryOptions,
  difficultyOptions,
  tagOptions,
}: {
  filters: Filters
  patchFilters: (patch: Partial<Filters>) => void
  categoryOptions: FilterOption[]
  difficultyOptions: FilterOption[]
  tagOptions: FilterOption[]
}) {
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className="min-w-[220px] flex-1">
        <Input
          value={filters.search}
          onChange={(e) => patchFilters({ search: e.target.value })}
          placeholder="חיפוש לפי תקלה, מוצר או תגית…"
          aria-label="חיפוש Playbooks"
          leadingIcon={<Icon name="Search" size={18} />}
        />
      </div>
      <FilterSelect
        label="קטגוריה"
        value={filters.category}
        options={categoryOptions}
        onChange={(value) => patchFilters({ category: value })}
      />
      <FilterSelect
        label="רמת קושי"
        value={filters.difficulty}
        options={difficultyOptions}
        onChange={(value) => patchFilters({ difficulty: value })}
      />
      <FilterSelect
        label="תגית"
        value={filters.tag}
        options={tagOptions}
        onChange={(value) => patchFilters({ tag: value })}
      />
    </div>
  )
}
