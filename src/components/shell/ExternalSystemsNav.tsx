/**
 * סקשן "מערכות ארגוניות" בסרגל (מסמך 30) — 1:1 עם design-export/SideNav.dc.html.
 * זמין לכל התפקידים; כל פריט נפתח בלשונית חדשה. במצב מכווץ: אייקונים 44px
 * עם badge external-link ו-tooltip.
 */
import { useState } from 'react'
import { EXTERNAL_SYSTEMS, type ExternalSystem } from '@/config/externalSystems'
import { cn } from '@/lib/utils/cn'
import { CollapsedTooltip } from './SidebarLink'
import {
  ChevronDownIcon,
  CubeIcon,
  ExternalLinkIcon,
  ExternalLinkMiniIcon,
} from './icons'

function SystemIcon({
  system,
  className,
}: {
  system: ExternalSystem
  className: string
}) {
  if (!system.iconSrc) {
    return (
      <span
        className={cn(
          'flex items-center justify-center bg-white/[0.06] text-[#8C97A4]',
          className,
        )}
      >
        <CubeIcon />
      </span>
    )
  }
  return (
    <span
      className={cn(
        'flex items-center justify-center overflow-hidden bg-white',
        className,
      )}
    >
      <img
        src={system.iconSrc}
        alt=""
        className="block h-full w-full rounded-[7px] object-cover"
      />
    </span>
  )
}

export function ExternalSystemsNav({ collapsed }: { collapsed: boolean }) {
  const [open, setOpen] = useState(true)
  const systems = EXTERNAL_SYSTEMS.filter((s) => s.enabled)

  if (collapsed) {
    return (
      <div className="mt-3.5 border-t border-white/[0.08] pt-3">
        <div className="flex flex-col items-center gap-1.5">
          {systems.map((system) => (
            <a
              key={system.id}
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              title={system.title}
              className="group relative flex h-11 w-11 items-center justify-center rounded-[11px] text-[#AEB9C6] no-underline transition-colors duration-150 hover:bg-[#20262F] hover:text-white"
            >
              <SystemIcon
                system={system}
                className="h-[30px] w-[30px] rounded-[9px]"
              />
              {/* badge external-link מוקטן — פינת ההתחלה העליונה (SideNav.dc.html) */}
              <span className="absolute start-[5px] top-[5px] flex h-[11px] w-[11px] items-center justify-center rounded bg-neutrals-charcoal text-[#6C7787]">
                <ExternalLinkMiniIcon />
              </span>
              <CollapsedTooltip label={system.label} />
            </a>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="mt-3.5 border-t border-white/[0.08] pt-3">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full cursor-pointer items-center gap-2 border-0 bg-transparent pb-2 ps-3 pe-3 pt-0.5 font-sans"
      >
        <span className="whitespace-nowrap text-[11px] font-bold tracking-[0.05em] text-[#6C7787]">
          מערכות ארגוניות
        </span>
        <span aria-hidden className="h-px flex-1 bg-white/[0.06]" />
        <ChevronDownIcon
          className={cn(
            'flex-none text-[#6C7787] transition-transform duration-200',
            open && 'rotate-180',
          )}
        />
      </button>
      {open && (
        <div className="flex flex-col gap-0.5">
          {systems.map((system) => (
            <a
              key={system.id}
              href={system.url}
              target="_blank"
              rel="noopener noreferrer"
              title={system.title}
              className="flex items-center gap-[11px] rounded-[11px] px-3 py-[9px] text-[#AEB9C6] no-underline transition-colors duration-150 hover:bg-[#20262F] hover:text-white"
            >
              <SystemIcon
                system={system}
                className="h-[30px] w-[30px] flex-none rounded-[9px]"
              />
              <span className="min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[14px] font-semibold">
                {system.label}
              </span>
              <ExternalLinkIcon className="flex-none text-[#5C6675]" />
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
