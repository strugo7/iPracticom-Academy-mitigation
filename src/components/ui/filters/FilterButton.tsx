import { ChevronDownIcon, UserLineIcon, SortZAIcon } from './icons'
import { FilterValue, type FilterValueState } from './FilterValue'

// Figma "Filter Row / Filter Button" set.
// Axes: Type = Filter | Sort, State = Default | Hover.
// h32, r4, bg white, border 1px (Default #E1E6EC / Hover #BCC3CB), pad L4 R8 T4 B4, gap4.
// RTL visual order (right→left): chevron (charcoal 24px) at the physical-left edge,
// then value, then filter name (lead-gray), then the type icon (nickel 16px,
// Filter→User / Sort→Sort Z-A) at the physical-right edge.
// The selected value uses the FilterValue sub-component.
export type FilterButtonType = 'filter' | 'sort'
export type FilterButtonState = 'default' | 'hover'

interface FilterButtonProps {
  type?: FilterButtonType
  state?: FilterButtonState
  /** Filter / column name (lead-gray label). */
  name: React.ReactNode
  /** Selected value text. */
  value: React.ReactNode
  valueState?: FilterValueState
  onClearValue?: () => void
  onClick?: () => void
}

export function FilterButton({
  type = 'filter',
  state = 'default',
  name,
  value,
  valueState = 'default',
  onClearValue,
  onClick,
}: FilterButtonProps) {
  const border =
    state === 'hover' ? 'border-neutrals-palladium' : 'border-neutrals-silver'
  const TrailingIcon = type === 'sort' ? SortZAIcon : UserLineIcon

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      className={`inline-flex h-8 items-center gap-1 rounded-[4px] border bg-white pl-1 pr-2 py-1 font-sans cursor-pointer select-none transition-colors hover:border-neutrals-palladium ${border}`}
    >
      <span className="inline-flex items-center gap-1">
        <span className="shrink-0 text-neutrals-nickel">
          <TrailingIcon />
        </span>
        <span className="text-[16px] leading-5 font-normal text-neutrals-lead">
          {name}
        </span>
        <FilterValue state={valueState} onClear={onClearValue}>
          {value}
        </FilterValue>
      </span>
      <span className="shrink-0 text-neutrals-charcoal">
        <ChevronDownIcon />
      </span>
    </div>
  )
}
