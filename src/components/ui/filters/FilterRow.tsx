import { ClearIcon } from './icons'

// Figma "Filter Row" component — horizontal RTL row, gap 8.
// Contains an optional "clear filters" link-button (blue text + clear icon) and a
// horizontal group of filter buttons (gap 16). Renders its children (FilterButton list).
interface FilterRowProps {
  /** Show the leading "clear filters" link button. */
  showClear?: boolean
  clearLabel?: React.ReactNode
  onClear?: () => void
  children: React.ReactNode
}

export function FilterRow({
  showClear = true,
  clearLabel = 'נקה סינונים',
  onClear,
  children,
}: FilterRowProps) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex flex-wrap items-center gap-4">{children}</div>
      {showClear && (
        <button
          type="button"
          onClick={onClear}
          className="inline-flex h-7 shrink-0 items-center gap-2 rounded-[20px] py-1 font-sans text-[16px] leading-5 font-normal text-accent cursor-pointer hover:underline"
        >
          <ClearIcon />
          {clearLabel}
        </button>
      )}
    </div>
  )
}
