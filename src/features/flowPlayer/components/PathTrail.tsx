/**
 * שובל-המסלול — הבחירות שנעשו עד כה, כצ'יפים לפי שפת-צבעי-הצמתים (מסמך 07 §3).
 * collapsible ועדין; נשלט מ-FlowPlayerChrome. עיצוב 1:1 מ-FlowPlayer.dc.html.
 */
import { NODE_VISUALS } from '../constants'
import type { TrailEntry } from '../types'
import { PlayerIcon } from './icons'

interface PathTrailProps {
  trail: TrailEntry[]
  open: boolean
  onToggle: () => void
}

export function PathTrail({ trail, open, onToggle }: PathTrailProps) {
  return (
    <div>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 border-0 bg-transparent p-0 text-neutrals-lead"
      >
        <PlayerIcon
          name="chevronDown"
          size={15}
          className="flex-none transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
        <span className="text-[12.5px] font-semibold">
          המסלול שלך · {trail.length} צעדים
        </span>
      </button>
      {open && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {trail.map((entry, index) => {
            const visual = NODE_VISUALS[entry.type]
            return (
              <span
                key={`${entry.nodeId}-${index}`}
                className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-[3px] text-[11.5px] font-semibold"
                style={{ color: visual.accent, background: visual.pillBg }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: visual.accent }}
                />
                {entry.label}
              </span>
            )
          })}
        </div>
      )}
    </div>
  )
}
