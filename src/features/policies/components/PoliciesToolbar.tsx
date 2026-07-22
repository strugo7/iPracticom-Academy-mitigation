/**
 * סרגל הגלריה (design-export/Policies.dc.html:62-70): חיפוש + צ'יפי-פילטר
 * (קטגוריה / סטטוס / קרא-וחתום / מחלקה). הצ'יפים מיושמים עם DS FilterSelect
 * (select מעוצב עם chevron), במקום ה-dropdown-popover של העיצוב (פער DS).
 */
import { FilterSelect, Icon, Input } from '@/components/ui'
import { POLICY_STATUS_META } from '../constants'
import type { PolicyFilters } from '../types'

const STATUS_OPTIONS = (['published', 'draft', 'archived'] as const).map(
  (key) => ({ value: key, label: POLICY_STATUS_META[key].label }),
)

interface PoliciesToolbarProps {
  filters: PolicyFilters
  categories: string[]
  departments: string[]
  onChange: (patch: Partial<PolicyFilters>) => void
}

export function PoliciesToolbar({
  filters,
  categories,
  departments,
  onChange,
}: PoliciesToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <div className="min-w-[220px] flex-1">
        <Input
          value={filters.search}
          onChange={(e) => onChange({ search: e.target.value })}
          placeholder="חיפוש נוהל…"
          leadingIcon={<Icon name="Search" size={16} />}
        />
      </div>

      <FilterSelect
        label="קטגוריה"
        value={filters.category}
        options={categories.map((c) => ({ value: c, label: c }))}
        onChange={(category) => onChange({ category })}
      />
      <FilterSelect
        label="סטטוס"
        value={filters.status}
        options={STATUS_OPTIONS}
        onChange={(status) =>
          onChange({ status: (status as PolicyFilters['status']) ?? null })
        }
      />
      <FilterSelect
        label="קרא וחתום"
        value={filters.ackOnly ? 'yes' : null}
        options={[{ value: 'yes', label: 'דורש אישור' }]}
        onChange={(value) => onChange({ ackOnly: value === 'yes' })}
      />
      <FilterSelect
        label="מחלקה"
        value={filters.department}
        options={departments.map((d) => ({ value: d, label: d }))}
        onChange={(department) => onChange({ department })}
      />
    </div>
  )
}
