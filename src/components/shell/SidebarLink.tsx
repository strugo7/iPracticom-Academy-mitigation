/**
 * פריט ניווט בסרגל — מצבי active / hover / collapsed+tooltip, 1:1 עם
 * design-export/AppShell.dc.html (padding 11/13, radius 12, פס accent 3px,
 * gradient פעיל 45deg rgba(46,180,255,.18)→rgba(0,117,219,.22)).
 */
import type { ComponentType, SVGProps } from 'react'
import { NavLink } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'

interface SidebarLinkProps {
  to: string
  label: string
  icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }>
  collapsed: boolean
  /** true בסקשן התחתון — padding 10/13 וטקסט 14.5px (AppShell.dc.html) */
  compact?: boolean
}

/** tooltip במצב מכווץ — נגלה ב-hover, צף משמאל לסרגל (inline-end ב-RTL). */
export function CollapsedTooltip({ label }: { label: string }) {
  return (
    <span
      className="pointer-events-none absolute end-[calc(100%+12px)] top-1/2 z-[60] -translate-y-1/2 translate-x-[6px] whitespace-nowrap rounded-lg bg-[#20262F] px-[11px] py-1.5 text-[13px] font-semibold text-white opacity-0 shadow-[0_8px_22px_rgba(0,0,0,0.34)] transition-all duration-150 group-hover:translate-x-0 group-hover:opacity-100"
      role="tooltip"
    >
      {label}
    </span>
  )
}

/** פס ה-accent של פריט פעיל — 3px, צמוד לקצה ההתחלה (ימין ב-RTL). */
export function ActiveBar() {
  return (
    <span
      aria-hidden
      className="absolute start-0 h-[22px] w-[3px] rounded-[3px] bg-hues-indigo"
    />
  )
}

export function SidebarLink({
  to,
  label,
  icon: Icon,
  collapsed,
  compact = false,
}: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          'group relative flex items-center gap-3 whitespace-nowrap rounded-xl font-semibold no-underline transition-colors duration-[180ms]',
          compact
            ? 'px-[13px] py-2.5 text-[14.5px]'
            : 'px-[13px] py-[11px] text-[15px]',
          collapsed && 'justify-center',
          isActive
            ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.18),rgba(0,117,219,0.22))] text-white'
            : 'text-[#AEB9C6] hover:bg-[#20262F] hover:text-white',
        )
      }
    >
      {({ isActive }) => (
        <>
          {isActive && <ActiveBar />}
          <Icon size={20} className="flex-none" />
          {!collapsed && <span>{label}</span>}
          {collapsed && <CollapsedTooltip label={label} />}
        </>
      )}
    </NavLink>
  )
}
