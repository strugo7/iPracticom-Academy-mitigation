import { type ReactNode } from 'react'
import { SortIcon } from './TablePrimitives'

// Figma "Table Header" set (3082:8758). REST-verified: in BOTH variants the sort arrow
// (Icon/Arrow North) and the filter glyph are visible:false — only the label "כותרת"
// (16/600 #181D24) shows. The arrow appears only when a column is actively SORTED, so it
// is opt-in via `sorted`. Default = desktop column header; Group Header = mobile separator.
export type TableHeaderType = 'default' | 'group'

interface TableHeaderProps {
  type?: TableHeaderType
  children?: ReactNode
  sortDir?: 'A-Z' | 'Z-A'
  /** show the sort arrow — only when the column is actively sorted (hidden by default). */
  sorted?: boolean
}

export function TableHeader({
  type = 'default',
  children = 'כותרת',
  sortDir = 'A-Z',
  sorted = false,
}: TableHeaderProps) {
  if (type === 'group') {
    // Group Header (mobile separator): vertical pad 5, gap 10. Arrow hidden unless sorted.
    return (
      <div className="flex items-center gap-2.5 py-[5px] font-sans w-[354px] max-w-full">
        {sorted && <SortIcon dir={sortDir} />}
        <span className="text-small font-semibold text-neutrals-charcoal">
          {children}
        </span>
      </div>
    )
  }
  return (
    <div className="inline-flex items-center gap-2 font-sans">
      {sorted && <SortIcon dir={sortDir} />}
      <span className="text-small font-semibold text-neutrals-charcoal">
        {children}
      </span>
    </div>
  )
}
