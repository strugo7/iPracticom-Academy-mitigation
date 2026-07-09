import { type ReactNode } from 'react'

// Figma "00 - Page / Menu Cell" set. 240x32, pad L16 R16 T4 B4, gap 8, HORIZONTAL.
// Only the label is VISIBLE in every variant — the "1" index node and the
// trailing Icon/Plus are present in the source file but set to visible=false,
// so they are NOT rendered here. Label = 18px/400, right-aligned (RTL).
// States:
//   item     -> transparent bg, charcoal text
//   hover    -> bg whisper #F2F5F8
//   focus    -> transparent bg + 4px gradient bar on the leading (right) edge
//   selected -> full gradient bg, white text
// (Figma "Item5" is identical to the default "Item".)
export type MenuCellState = 'item' | 'hover' | 'focus' | 'selected'

interface MenuCellProps {
  /** Optional bold leading index/number. Hidden in Figma — omit to match 1:1. */
  index?: ReactNode
  children: ReactNode
  state?: MenuCellState
  /** Optional trailing icon. Hidden in Figma — omit to match 1:1. */
  trailing?: ReactNode
  onClick?: () => void
}

export function MenuCell({
  index,
  children,
  state = 'item',
  trailing,
  onClick,
}: MenuCellProps) {
  const selected = state === 'selected'
  const focus = state === 'focus'

  const bg =
    state === 'hover'
      ? 'bg-neutrals-whisper'
      : selected
        ? 'bg-accent-gradient'
        : 'bg-transparent'
  const text = selected ? 'text-white' : 'text-neutrals-charcoal'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative flex h-8 w-full items-center gap-2 px-4 py-1 font-sans cursor-pointer select-none transition-colors ${bg} ${text}`}
    >
      {focus && (
        <span
          className="absolute inset-y-0 right-0 w-1 bg-accent-gradient"
          aria-hidden
        />
      )}
      {/* RTL order (first child = rightmost): optional trailing icon on the right,
          label right-aligned, optional "1" index badge on the far left. */}
      {trailing && <span className="shrink-0">{trailing}</span>}
      <span className="flex-1 text-right text-body">{children}</span>
      {index != null && (
        <span className="shrink-0 text-body-bold">{index}</span>
      )}
    </button>
  )
}
