/**
 * מעטפת הנגן — כותרת דביקה (חזרה/כותרת/התחל-מחדש/סגירה) + פס-התקדמות +
 * שובל-מסלול, גוף הצומת (children), CTA מעוגן, ופוטר-מותג.
 * מובייל: עמודה אחת עם גלילת-עמוד (מסמך 07). דסקטופ: פריסה דו-חטיבתית בגובה-קבוע
 * — אזור-הצומת (ימין) + פאנל תיעוד-הסשן (שמאל, `sidePanel`) — מסמך 08 §1.
 */
import type { ReactNode } from 'react'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ProgressBar } from '@/components/ui'
import type { PrimaryCta } from '../constants'
import type { TrailEntry } from '../types'
import { PlayerIcon } from './icons'
import { PathTrail } from './PathTrail'

interface FlowPlayerChromeProps {
  title: string
  subtitle?: string
  progress: number
  trail: TrailEntry[]
  canGoBack: boolean
  onBack: () => void
  onRestart: () => void
  closeTo: string
  cta: PrimaryCta | null
  onCta: () => void
  /** פאנל צד לדסקטופ (תיעוד-הסשן) — מוסתר במובייל (השובל ממלא את מקומו). */
  sidePanel?: ReactNode
  children: ReactNode
}

const GLASS = 'rgba(244,251,255,.92)'
const CHROME_BTN =
  'flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#E3E9F0] bg-white transition hover:border-[#CFD8E3]'

export function FlowPlayerChrome({
  title,
  subtitle,
  progress,
  trail,
  canGoBack,
  onBack,
  onRestart,
  closeTo,
  cta,
  onCta,
  sidePanel,
  children,
}: FlowPlayerChromeProps) {
  const [trailOpen, setTrailOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-[#F4FBFF] text-neutrals-charcoal md:h-svh md:max-w-[960px] md:overflow-hidden">
      <header
        className="sticky top-0 z-20 flex-none border-b border-[#E3E9F0] backdrop-blur-[10px] md:static"
        style={{ background: GLASS }}
      >
        <div className="flex items-center justify-between gap-2.5 px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="חזרה"
            className={`${CHROME_BTN} text-[#3D4753] enabled:active:scale-95 disabled:opacity-40`}
          >
            <PlayerIcon name="back" size={20} />
          </button>
          <div className="min-w-0 text-center">
            <div className="truncate text-[15px] font-bold leading-tight">
              {title}
            </div>
            {subtitle && (
              <div className="text-[11.5px] text-neutrals-lead">{subtitle}</div>
            )}
          </div>
          <div className="flex flex-none items-center gap-2">
            <button
              type="button"
              onClick={onRestart}
              aria-label="התחל מחדש"
              className={`${CHROME_BTN} text-neutrals-lead active:scale-95`}
            >
              <PlayerIcon name="restart" size={18} />
            </button>
            <Link
              to={closeTo}
              aria-label="סגירה"
              className={`${CHROME_BTN} text-neutrals-lead no-underline`}
            >
              <PlayerIcon name="close" size={19} />
            </Link>
          </div>
        </div>
        <div className="px-4 pb-3">
          <ProgressBar percent={progress * 100} className="mb-2.5 !h-1" />
          <PathTrail
            trail={trail}
            open={trailOpen}
            onToggle={() => setTrailOpen((v) => !v)}
          />
        </div>
      </header>

      <div className="flex flex-1 flex-col md:min-h-0 md:flex-row">
        <div className="flex flex-1 flex-col md:min-h-0 md:min-w-0">
          <main className="flex flex-1 flex-col px-5 py-6 md:overflow-y-auto">
            {children}
          </main>
          {cta && (
            <div
              className="sticky bottom-0 flex-none border-t border-[#E3E9F0] px-5 py-3.5 backdrop-blur-[10px] md:static"
              style={{ background: GLASS }}
            >
              <button
                type="button"
                onClick={onCta}
                className="flex w-full items-center justify-center gap-2.5 rounded-[15px] border-0 px-4 py-4 text-[16.5px] font-bold text-white transition hover:brightness-95 active:scale-[.99]"
                style={{ background: cta.background, boxShadow: cta.shadow }}
              >
                {cta.label}
                <PlayerIcon name="arrowStart" size={20} />
              </button>
            </div>
          )}
        </div>

        {sidePanel && (
          <aside className="hidden flex-none border-s border-[#E3E9F0] bg-white/50 md:block md:w-[320px] md:overflow-y-auto">
            {sidePanel}
          </aside>
        )}
      </div>

      <footer className="flex-none border-t border-[#EEF2F7] bg-white px-5 py-3 text-center text-[11.5px] text-neutrals-nickel">
        © iPracticom Academy — לשימוש פנימי בלבד
      </footer>
    </div>
  )
}
