import { useState } from 'react'
import { MenuItemCell, MenuActionCell, PhoneIcon } from './MenuCell'

// Figma "Expandables": a bordered (r=4, #E1E6EC) vertical container.
//  - Item type:    header item-cell (white, +/- expander, blue label+count when open, checkbox)
//                  + child rows (whisper bg, label + count + checkbox, no expander/tag).
//  - Actions type: header action-cell (white, +/- expander, label) + child action rows (whisper).
// Property 1 = Expanded | Minimized (children visible / hidden).

interface ExpandableItemProps {
  group?: string
  count?: string
  children?: { label: string; count?: string }[]
  defaultExpanded?: boolean
}

export function ExpandableItem({
  group = 'שם קבוצה',
  count = '629',
  children = [
    { label: 'ערך 1', count: '629' },
    { label: 'ערך 2', count: '629' },
    { label: 'ערך 3', count: '629' },
    { label: 'ערך 4', count: '629' },
  ],
  defaultExpanded = true,
}: ExpandableItemProps) {
  const [open, setOpen] = useState(defaultExpanded)
  return (
    <div className="w-[303px] overflow-hidden rounded border border-neutrals-silver">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block w-full text-right"
      >
        <MenuItemCell
          label={group}
          count={count}
          state={open ? 'expanded' : 'default'}
          expander={open ? 'minus' : 'plus'}
          checkbox
        />
      </button>
      {open &&
        children.map((c, i) => (
          <MenuItemCell
            key={i}
            label={c.label}
            count={c.count}
            state="hover"
            checkbox
          />
        ))}
    </div>
  )
}

interface ExpandableActionsProps {
  label?: string
  children?: { label: string; icon?: React.ReactNode }[]
  defaultExpanded?: boolean
}

export function ExpandableActions({
  label = 'עריכת שם מספר',
  children = [
    { label: 'עריכת שם מספר' },
    { label: 'עריכת שם מספר' },
    { label: 'עריכת שם מספר' },
    { label: 'עריכת שם מספר' },
  ],
  defaultExpanded = true,
}: ExpandableActionsProps) {
  const [open, setOpen] = useState(defaultExpanded)
  return (
    <div className="w-[303px] overflow-hidden rounded border border-neutrals-silver">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="block w-full text-right"
      >
        <MenuActionCell
          label={label}
          icon={<PhoneIcon />}
          state={open ? 'expanded' : 'default'}
          expander={open ? 'minus' : 'plus'}
        />
      </button>
      {open &&
        children.map((c, i) => (
          <MenuActionCell
            key={i}
            label={c.label}
            icon={c.icon ?? <PhoneIcon />}
            state="hover"
          />
        ))}
    </div>
  )
}
