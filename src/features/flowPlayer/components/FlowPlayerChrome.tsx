/**
 * מעטפת הנגן — כותרת דביקה (חזרה/כותרת/סגירה) + פס-התקדמות + שובל-מסלול,
 * גוף הצומת (children), כפתור-פעולה ראשי מעוגן לתחתית, ופוטר-מותג. mobile-first
 * עם עמודת-קריאה ממורכזת בדסקטופ (מסמך 07 §92). עיצוב 1:1 מ-FlowPlayer.dc.html.
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
  closeTo: string
  cta: PrimaryCta | null
  onCta: () => void
  children: ReactNode
}

const GLASS = 'rgba(244,251,255,.92)'

export function FlowPlayerChrome({
  title,
  subtitle,
  progress,
  trail,
  canGoBack,
  onBack,
  closeTo,
  cta,
  onCta,
  children,
}: FlowPlayerChromeProps) {
  const [trailOpen, setTrailOpen] = useState(false)

  return (
    <div className="mx-auto flex min-h-svh w-full max-w-[480px] flex-col bg-[#F4FBFF] text-neutrals-charcoal md:max-w-[680px]">
      <header
        className="sticky top-0 z-20 border-b border-[#E3E9F0] backdrop-blur-[10px]"
        style={{ background: GLASS }}
      >
        <div className="flex items-center justify-between gap-2.5 px-4 py-3.5">
          <button
            type="button"
            onClick={onBack}
            disabled={!canGoBack}
            aria-label="חזרה"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#E3E9F0] bg-white text-[#3D4753] transition enabled:hover:border-[#CFD8E3] enabled:active:scale-95 disabled:opacity-40"
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
          <Link
            to={closeTo}
            aria-label="סגירה"
            className="flex h-10 w-10 flex-none items-center justify-center rounded-xl border border-[#E3E9F0] bg-white text-neutrals-lead no-underline transition hover:border-[#CFD8E3]"
          >
            <PlayerIcon name="close" size={19} />
          </Link>
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

      <main className="flex flex-1 flex-col px-5 py-6">{children}</main>

      {cta && (
        <div
          className="sticky bottom-0 border-t border-[#E3E9F0] px-5 py-3.5 backdrop-blur-[10px]"
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

      <footer className="flex-none border-t border-[#EEF2F7] bg-white px-5 py-3 text-center text-[11.5px] text-neutrals-nickel">
        © iPracticom Academy — לשימוש פנימי בלבד
      </footer>
    </div>
  )
}
