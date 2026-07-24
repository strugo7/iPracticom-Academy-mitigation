/**
 * פאנל תיעוד-הסשן (מסמך 08 §1/§3) — ציר-זמן חי של הצעדים שבוצעו, מתעדכן בכל
 * מעבר. בדסקטופ גלוי-תמיד לצד הצומת; במובייל השובל בכותרת ממלא את התפקיד.
 * ייצוא-התיעוד (PDF/clipboard) שייך לשלב 7.4 ואינו כאן. עיצוב לפי שפת-צבעי-הצמתים.
 */
import { NODE_VISUALS } from '../constants'
import type { TimelineEntry } from '../types'
import { PlayerIcon } from './icons'

/** שעה בפורמט ישראלי (Asia/Jerusalem, HH:mm) — CLAUDE.md §3. */
function formatTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('he-IL', {
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jerusalem',
  }).format(date)
}

export function SessionLogPanel({ timeline }: { timeline: TimelineEntry[] }) {
  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-[#E3E9F0] px-5 py-4">
        <PlayerIcon name="clock" size={17} className="text-accent" />
        <div>
          <div className="text-[14px] font-bold">תיעוד הסשן</div>
          <div className="text-[11.5px] text-neutrals-lead">
            {timeline.length} צעדים
          </div>
        </div>
      </div>

      <ol className="flex-1 overflow-y-auto px-5 py-4">
        {timeline.map((entry, index) => {
          const visual = NODE_VISUALS[entry.type]
          const last = index === timeline.length - 1
          return (
            <li
              key={`${entry.nodeId}-${index}`}
              className="relative flex gap-3 pb-4 last:pb-0"
            >
              {!last && (
                <span className="absolute top-4 h-full w-px bg-[#E3E9F0] start-[5px]" />
              )}
              <span
                className="z-10 mt-1 h-[11px] w-[11px] flex-none rounded-full border-2 border-white"
                style={{
                  background: visual.accent,
                  boxShadow: `0 0 0 2px ${visual.pillBg}`,
                }}
              />
              <div className="min-w-0 flex-1">
                <div className="truncate text-[13px] font-semibold leading-snug">
                  {entry.label}
                </div>
                <div className="text-[11.5px] text-neutrals-lead">
                  {formatTime(entry.timestamp)}
                </div>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
