import { type ReactNode } from 'react'
import {
  TelephoneIcon,
  WorldwideIcon,
  IotIcon,
  FileIcon,
  UserLineIcon,
  InvoiceIcon,
  SettingsIcon,
  MiniNavLogo,
} from './icons'

// Figma "Frame 1984077958" set — a single mini-nav rail button.
// 39x39 box, r5, icon 19x19. States:
//   default  -> transparent bg, icon lead #757D86
//   hover    -> bg lead #757D86, icon white
//   selected -> bg accent #0075DB, icon white
export type MiniNavItemState = 'default' | 'hover' | 'selected'

interface MiniNavItemProps {
  icon: ReactNode
  state?: MiniNavItemState
  onClick?: () => void
  'aria-label'?: string
}

export function MiniNavItem({
  icon,
  state = 'default',
  onClick,
  ...rest
}: MiniNavItemProps) {
  const cls =
    state === 'selected'
      ? 'bg-accent text-white'
      : state === 'hover'
        ? 'bg-neutrals-lead text-white'
        : 'bg-transparent text-neutrals-lead hover:bg-neutrals-lead hover:text-white'

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={rest['aria-label']}
      className={`flex h-[39px] w-[39px] items-center justify-center rounded-[5px] transition-colors cursor-pointer ${cls}`}
    >
      <span className="h-[19px] w-[19px]">{icon}</span>
    </button>
  )
}

// Figma "Mini Navigation" — 56px dark rail (#181D24), no corner radius, pad L8 R8 T26 B26.
// Logo at top, a column of MiniNavItems (gap 30), and Settings pinned to the bottom.
interface MiniNavigationProps {
  /** Index of the selected primary item. */
  selected?: number
  onSelect?: (index: number) => void
}

const PRIMARY = [
  { key: 'tel', icon: <TelephoneIcon />, label: 'טלפוניה' },
  { key: 'world', icon: <WorldwideIcon />, label: 'בינלאומי' },
  { key: 'iot', icon: <IotIcon />, label: 'IoT' },
  { key: 'file', icon: <FileIcon />, label: 'מסמכים' },
  { key: 'user', icon: <UserLineIcon />, label: 'משתמשים' },
  { key: 'invoice', icon: <InvoiceIcon />, label: 'חשבוניות' },
]

export function MiniNavigation({
  selected = 2,
  onSelect,
}: MiniNavigationProps) {
  return (
    <div className="flex w-14 flex-col items-center justify-between bg-neutrals-charcoal px-2 py-[26px]">
      <div className="flex flex-col items-center gap-[30px]">
        {/* Menu / logo mark — Figma vector (two #EFEFEF bars, 24×14). */}
        <span className="flex items-center justify-center" aria-label="תפריט">
          <MiniNavLogo />
        </span>
        <div className="flex flex-col items-center gap-[30px]">
          {PRIMARY.map((item, i) => (
            <MiniNavItem
              key={item.key}
              icon={item.icon}
              aria-label={item.label}
              state={i === selected ? 'selected' : 'default'}
              onClick={() => onSelect?.(i)}
            />
          ))}
        </div>
      </div>
      <MiniNavItem icon={<SettingsIcon />} aria-label="הגדרות" />
    </div>
  )
}
