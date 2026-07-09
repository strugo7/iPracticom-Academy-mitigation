/**
 * סרגל הצד של המעטפת (מסמכים 11+30) — בצד ימין (RTL), charcoal, תלוי-role.
 * 1:1 עם design-export/AppShell.dc.html: 252px פתוח / 76px מכווץ, לוגו + כיווץ,
 * ניווט ראשי, סקשן "ניהול · לפי הרשאות", מערכות ארגוניות, וסקשן תחתון קבוע.
 * הפריטים מסוננים לפי המשתמש מ-useAuth; ה-RBAC האמיתי נאכף בשרת.
 */
import { Link, useNavigate } from 'react-router-dom'
import { Logo } from '@/components/ui'
import { useAuth } from '@/lib/auth'
import { cn } from '@/lib/utils/cn'
import { ExternalSystemsNav } from './ExternalSystemsNav'
import { SidebarGroup } from './SidebarGroup'
import { CollapsedTooltip, SidebarLink } from './SidebarLink'
import { CollapseIcon, ExpandIcon, LogoutIcon } from './icons'
import { buildMainNav, FOOTER_NAV_ITEMS, LOGOUT_ITEM } from './navConfig'

interface SidebarProps {
  collapsed: boolean
  onToggleCollapsed: () => void
}

/** כפתור הכיווץ/הרחבה — 34px, radius 10 (AppShell.dc.html). */
function ToggleButton({
  collapsed,
  onClick,
}: {
  collapsed: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      aria-label={collapsed ? 'הרחבת הסרגל' : 'כיווץ הסרגל'}
      onClick={onClick}
      className="flex h-[34px] w-[34px] flex-none cursor-pointer items-center justify-center rounded-[10px] border-0 bg-[#20262F] text-[#AEB9C6] transition-all duration-200 hover:bg-[#2A323D] hover:text-white"
    >
      {collapsed ? <ExpandIcon /> : <CollapseIcon />}
    </button>
  )
}

/** סימן המותג במצב מכווץ — משושה gradient עם "iP" (AppShell.dc.html). */
function BrandMark() {
  return (
    <Link
      to="/dashboard"
      aria-label="iPracticom — לדשבורד"
      className="flex h-[38px] w-[38px] items-center justify-center bg-accent-gradient text-[15px] font-semibold text-white no-underline [clip-path:polygon(50%_0,93%_25%,93%_75%,50%_100%,7%_75%,7%_25%)]"
    >
      <span dir="ltr">iP</span>
    </Link>
  )
}

export function Sidebar({ collapsed, onToggleCollapsed }: SidebarProps) {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  if (!user) return null // ה-guard בניתוב מבטיח משתמש; הגנה כפולה בלבד

  const mainNav = buildMainNav(user)

  const handleLogout = async () => {
    await logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside
      className={cn(
        'sticky top-0 z-30 flex h-svh flex-none flex-col self-start bg-neutrals-charcoal px-3.5 py-[18px] text-white transition-[width] duration-[280ms] ease-[cubic-bezier(0.22,0.61,0.36,1)]',
        collapsed ? 'w-[76px]' : 'w-[252px]',
      )}
    >
      {/* מותג + כיווץ/הרחבה */}
      {collapsed ? (
        <div className="flex flex-col items-center gap-3.5 pb-[18px] pt-1">
          <BrandMark />
          <ToggleButton collapsed onClick={onToggleCollapsed} />
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2.5 px-2 pb-[18px] pt-1">
          <Link
            to="/dashboard"
            aria-label="iPracticom — לדשבורד"
            className="flex items-center no-underline"
          >
            <Logo variant="white" height={22} />
          </Link>
          <ToggleButton collapsed={false} onClick={onToggleCollapsed} />
        </div>
      )}

      {/* ניווט ראשי (תלוי-role): קישורים + קבוצת "ניהול תוכן" למדריך ומעלה */}
      <nav className="-mx-0.5 flex flex-col gap-[5px] overflow-y-auto px-0.5">
        {mainNav.map((entry) =>
          entry.kind === 'group' ? (
            <SidebarGroup
              key={entry.label}
              group={entry}
              collapsed={collapsed}
            />
          ) : (
            <SidebarLink
              key={entry.to}
              to={entry.to}
              label={entry.label}
              icon={entry.icon}
              collapsed={collapsed}
            />
          ),
        )}
      </nav>

      {/* מערכות ארגוניות (מסמך 30) — לכל המשתמשים */}
      <ExternalSystemsNav collapsed={collapsed} />

      {/* סקשן תחתון קבוע: מרכז עזרה · הגדרות · יציאה */}
      <div className="mt-auto flex flex-col gap-1 border-t border-white/10 pt-3">
        {FOOTER_NAV_ITEMS.map((item) => (
          <SidebarLink key={item.to} {...item} collapsed={collapsed} compact />
        ))}
        <button
          type="button"
          onClick={handleLogout}
          className={cn(
            'group relative flex cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl border-0 bg-transparent px-[13px] py-2.5 text-start font-sans text-[14.5px] font-semibold text-[#AEB9C6] transition-colors duration-[180ms] hover:bg-[rgba(229,72,77,0.12)] hover:text-[#FF9A9E]',
            collapsed && 'justify-center',
          )}
        >
          <LogoutIcon size={20} className="flex-none" />
          {!collapsed && <span>{LOGOUT_ITEM.label}</span>}
          {collapsed && <CollapsedTooltip label={LOGOUT_ITEM.label} />}
        </button>
      </div>
    </aside>
  )
}
