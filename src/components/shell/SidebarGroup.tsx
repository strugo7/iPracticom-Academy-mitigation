/**
 * קבוצת "ניהול תוכן" הנפתחת בסרגל — 1:1 עם design-export/SideNav.dc.html:
 * parent עם chevron מסתובב, תתי-פריטים עם קוביית-אייקון 26px, ותת-קבוצה
 * מקוננת ("ניהול מאגר מבחנים") עם קישורי-נקודה. הקבוצה מודגשת ונפתחת
 * אוטומטית כשאחד מנתיבי-הבת פעיל. במצב מכווץ: אייקון יחיד + tooltip.
 */
import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils/cn'
import { ActiveBar, CollapsedTooltip } from './SidebarLink'
import { ChevronDownIcon } from './icons'
import type { ContentChild, NavGroup } from './navConfig'

/** נתיב פעיל = אותו segment ראשון (עקבי עם getPageMeta). */
function useIsPathActive() {
  const { pathname } = useLocation()
  const root = `/${pathname.split('/')[1] ?? ''}`
  return (to: string) => root === to
}

function groupPaths(children: ContentChild[]): string[] {
  return children.flatMap((c) =>
    c.kind === 'link' ? [c.to] : c.children.map((g) => g.to),
  )
}

/**
 * open נשלט ע"י המשתמש, אבל ניווט אל נתיב-בת פותח את הקבוצה אוטומטית —
 * דפוס adjust-state-during-render (בלי effect, לפי react-hooks/set-state-in-effect).
 */
function useAutoOpen(
  active: boolean,
): [boolean, (updater: (o: boolean) => boolean) => void] {
  const [open, setOpen] = useState(active)
  const [prevActive, setPrevActive] = useState(active)
  if (active !== prevActive) {
    setPrevActive(active)
    if (active) setOpen(true)
  }
  return [open, setOpen]
}

/** תת-קבוצה מקוננת (ניהול מאגר מבחנים) — קישורי-נקודה (SideNav.dc.html quizItems). */
function NestedGroup({
  group,
  isActive,
}: {
  group: Extract<ContentChild, { kind: 'group' }>
  isActive: (to: string) => boolean
}) {
  const anyActive = group.children.some((c) => isActive(c.to))
  const [open, setOpen] = useAutoOpen(anyActive)
  const Icon = group.icon

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'flex w-full cursor-pointer items-center gap-2.5 rounded-[10px] border-0 px-[11px] py-[9px] text-start font-sans text-[13.5px] font-semibold transition-colors duration-150',
          anyActive
            ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.16),rgba(0,117,219,0.20))] text-white'
            : 'bg-transparent text-[#9AA6B2] hover:bg-[#20262F] hover:text-white',
        )}
      >
        <span
          className={cn(
            'flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg',
            anyActive
              ? 'bg-accent text-white'
              : 'bg-white/[0.06] text-[#8C97A4]',
          )}
        >
          <Icon />
        </span>
        <span className="min-w-0 flex-1 leading-tight">{group.label}</span>
        <ChevronDownIcon
          className={cn(
            'flex-none transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="animate-nav-sub my-0.5 flex flex-col gap-0.5 ps-5">
          {group.children.map((child) => (
            <NavLink
              key={child.to}
              to={child.to}
              className={({ isActive: active }) =>
                cn(
                  'flex items-center gap-[9px] rounded-[9px] px-2.5 py-2 text-[13px] font-semibold no-underline transition-colors duration-150',
                  active
                    ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.16),rgba(0,117,219,0.20))] text-white'
                    : 'text-[#9AA6B2] hover:bg-[#20262F] hover:text-white',
                )
              }
            >
              {({ isActive: active }) => (
                <>
                  <span
                    aria-hidden
                    className={cn(
                      'h-1.5 w-1.5 flex-none rounded-full',
                      active ? 'bg-hues-indigo' : 'bg-[#5C6675]',
                    )}
                  />
                  <span className="min-w-0 flex-1 leading-tight">
                    {child.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      )}
    </>
  )
}

export function SidebarGroup({
  group,
  collapsed,
}: {
  group: NavGroup
  collapsed: boolean
}) {
  const isActive = useIsPathActive()
  const groupActive = groupPaths(group.children).some(isActive)
  const [open, setOpen] = useAutoOpen(groupActive)
  const Icon = group.icon

  // מצב מכווץ — אייקון יחיד שמוביל ליעד הראשי של הקבוצה (SideNav.dc.html navClosed)
  if (collapsed) {
    return (
      <NavLink
        to={group.collapsedTo}
        className={cn(
          'group relative flex items-center justify-center whitespace-nowrap rounded-xl px-[13px] py-[11px] font-semibold no-underline transition-colors duration-[180ms]',
          groupActive
            ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.18),rgba(0,117,219,0.22))] text-white'
            : 'text-[#AEB9C6] hover:bg-[#20262F] hover:text-white',
        )}
      >
        {groupActive && <ActiveBar />}
        <Icon size={20} className="flex-none" />
        <CollapsedTooltip label={group.label} />
      </NavLink>
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={cn(
          'group relative flex w-full cursor-pointer items-center gap-3 whitespace-nowrap rounded-xl border-0 px-[13px] py-[11px] text-start font-sans text-[15px] font-semibold transition-colors duration-[180ms]',
          groupActive
            ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.18),rgba(0,117,219,0.22))] text-white'
            : 'bg-transparent text-[#AEB9C6] hover:bg-[#20262F] hover:text-white',
        )}
      >
        {groupActive && <ActiveBar />}
        <Icon size={20} className="flex-none" />
        <span className="flex-1">{group.label}</span>
        <ChevronDownIcon
          size={17}
          className={cn(
            'flex-none transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="animate-nav-sub mb-1 mt-0.5 flex flex-col gap-0.5 ps-6">
          {group.children.map((child) =>
            child.kind === 'group' ? (
              <NestedGroup
                key={child.label}
                group={child}
                isActive={isActive}
              />
            ) : (
              <NavLink
                key={child.to}
                to={child.to}
                className={({ isActive: active }) =>
                  cn(
                    'flex items-center gap-2.5 rounded-[10px] px-[11px] py-[9px] text-[13.5px] font-semibold no-underline transition-colors duration-150',
                    active
                      ? 'bg-[linear-gradient(45deg,rgba(46,180,255,0.16),rgba(0,117,219,0.20))] text-white'
                      : 'text-[#9AA6B2] hover:bg-[#20262F] hover:text-white',
                  )
                }
              >
                {({ isActive: active }) => (
                  <>
                    <span
                      className={cn(
                        'flex h-[26px] w-[26px] flex-none items-center justify-center rounded-lg',
                        active
                          ? 'bg-accent text-white'
                          : 'bg-white/[0.06] text-[#8C97A4]',
                      )}
                    >
                      <child.icon />
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      {child.label}
                    </span>
                  </>
                )}
              </NavLink>
            ),
          )}
        </div>
      )}
    </>
  )
}
