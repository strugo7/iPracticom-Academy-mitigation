import { type ReactNode, useState } from 'react'
import { CollapseButton } from './CollapseButton'
import { MenuCell, type MenuCellState } from './MenuCell'

// Figma "00 - Section" (standalone COMPONENT, State=Default Collapsed=False).
// 240 wide, white, border silver #E1E6EC, NO corner radius, pad 8, gap 4, VERTICAL.
// = a CollapseButton header + a vertical list of MenuCells.
export interface NavSectionItem {
  label: ReactNode
  index?: ReactNode
  state?: MenuCellState
}

interface NavSectionProps {
  title: ReactNode
  items: NavSectionItem[]
  /** Start collapsed (header only). */
  defaultCollapsed?: boolean
}

export function NavSection({
  title,
  items,
  defaultCollapsed = false,
}: NavSectionProps) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed)
  const [hover, setHover] = useState(false)

  return (
    <div
      className="flex w-60 flex-col gap-1 border border-neutrals-silver bg-white p-2"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <CollapseButton
        collapsed={collapsed}
        hover={hover}
        onClick={() => setCollapsed((c) => !c)}
      >
        {title}
      </CollapseButton>
      {!collapsed && (
        <div className="flex flex-col">
          {items.map((item, i) => (
            <MenuCell key={i} index={item.index} state={item.state}>
              {item.label}
            </MenuCell>
          ))}
        </div>
      )}
    </div>
  )
}
