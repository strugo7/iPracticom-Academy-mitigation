/** ניווט-סקשנים צדדי (design-export שורות 53-65) — אנכי בדסקטופ, פס אופקי-גולל במובייל. */
import type { ReactNode } from 'react'
import { Icon } from '@/components/ui'
import { SECTION_DEFS } from '../constants'
import { LockIcon, LoginArrowIcon, PaletteIcon, PlugIcon, SlidersIcon } from '../icons'
import type { SettingsSectionKey } from '../types'

const SECTION_ICONS: Record<SettingsSectionKey, ReactNode> = {
  security: <LockIcon size={19} />,
  users: <Icon name="User" size={19} />,
  // אייקון-רגיסטר של ה-DS (UserLine, קו) — מבדיל את סקשן הגיוס מ-User המלא של
  // ניהול-המשתמשים. אין גליף-גיוס ייעודי ב-109; לאישור שירה בשלב הבנייה.
  recruitment: <Icon name="UserLine" size={19} />,
  branding: <PaletteIcon size={19} />,
  defaults: <SlidersIcon size={19} />,
  integrations: <PlugIcon size={19} />,
  logins: <LoginArrowIcon size={19} />,
  documents: <Icon name="File" size={19} />,
}

interface Props {
  active: SettingsSectionKey
  onPick: (key: SettingsSectionKey) => void
}

export function SectionNav({ active, onPick }: Props) {
  return (
    <aside className="flex-none border-b border-neutrals-silver bg-white p-2.5 lg:w-[266px] lg:border-b-0 lg:border-e lg:p-4">
      <div className="hidden px-3 pb-2.5 pt-1.5 text-tiny font-semibold tracking-wide text-neutrals-nickel lg:block">
        הגדרות
      </div>
      <div className="flex gap-1.5 overflow-x-auto pb-0.5 lg:flex-col lg:overflow-visible">
        {SECTION_DEFS.map((s) => {
          const on = s.key === active
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => onPick(s.key)}
              className={`relative flex flex-none items-center gap-2.5 rounded-xl border-0 px-3 py-2.5 text-start font-sans transition-colors lg:w-full ${
                on ? 'bg-[linear-gradient(135deg,rgba(46,180,255,.10),rgba(0,117,219,.13))]' : 'hover:bg-neutrals-whisper'
              }`}
            >
              {on && (
                <span className="absolute inset-inline-start-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-full bg-hues-indigo" />
              )}
              <span
                className={`flex size-9 flex-none items-center justify-center rounded-[10px] ${
                  on ? 'bg-accent text-white' : 'bg-neutrals-whisper text-neutrals-lead'
                }`}
              >
                {SECTION_ICONS[s.key]}
              </span>
              <span className="hidden min-w-0 lg:block">
                <span
                  className={`block whitespace-nowrap text-[14.5px] leading-tight ${
                    on ? 'font-semibold text-accent' : 'font-normal text-neutrals-lead'
                  }`}
                >
                  {s.label}
                </span>
                <span className="mt-0.5 block whitespace-nowrap text-tiny text-neutrals-nickel">
                  {s.desc}
                </span>
              </span>
            </button>
          )
        })}
      </div>
    </aside>
  )
}
