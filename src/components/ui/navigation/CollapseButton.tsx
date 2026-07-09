import { type ReactNode } from 'react'
import { ChevronVIcon } from './icons'

// Figma "Collpase Button" set. 224 wide, pad R14, label = 14px/600.
// Axes: Collapsed (bool), Hover (bool), Selected (bool).
// Color logic (arrow + label share one color):
//   default (not hover / not selected) -> palladium #BCC3CB
//   hover                              -> accent #0075DB
//   selected                           -> white  #FFFFFF (sits on a dark surface)
// Per Figma: Collapsed=false (section expanded) shows the chevron pointing UP;
// Collapsed=true (section closed) shows it pointing DOWN.
interface CollapseButtonProps {
  children: ReactNode
  collapsed?: boolean
  hover?: boolean
  selected?: boolean
  onClick?: () => void
}

export function CollapseButton({
  children,
  collapsed = false,
  hover = false,
  selected = false,
  onClick,
}: CollapseButtonProps) {
  const color = selected
    ? 'text-white'
    : hover
      ? 'text-accent'
      : 'text-neutrals-palladium'

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex h-6 w-full items-center pr-3.5 font-sans cursor-pointer select-none transition-colors ${color}`}
    >
      {/* RTL: label right-aligned on the right (14px from the right edge),
          chevron flush at the left edge. */}
      <span className="flex-1 text-right text-tiny-bold">{children}</span>
      <span className="shrink-0">
        <ChevronVIcon open={collapsed} />
      </span>
    </button>
  )
}
