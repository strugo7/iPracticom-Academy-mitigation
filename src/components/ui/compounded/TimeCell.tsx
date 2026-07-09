// Figma standalone "Time Cell" (2650:18721) — a single entry on the activity timeline.
// RTL layout (matches ground-truth PNG): on the RIGHT a vertical rail (#BCC3CB) carrying a
// blue Time-Line status dot at the top; to its LEFT the content block:
//   • a meta line  "21:05 • 21.03.25"  (16/400 nickel, bullet 12px)
//   • the event title "שם ארוע"        (20/600 charcoal)
//   • a "עוד פרטים <<" link            (16/400 accent)
// padding 8, gap 8.

import { StatusDot, type StatusDotColor } from './StatusDot'

interface TimeCellProps {
  time?: string
  date?: string
  event?: string
  link?: string
  dotColor?: StatusDotColor
  /** show the vertical rail below the dot (false on the last cell) */
  rail?: boolean
}

export function TimeCell({
  time = '21:05',
  date = '21.03.25',
  event = 'שם ארוע',
  link = 'עוד פרטים >>',
  dotColor = 'blue',
  rail = true,
}: TimeCellProps) {
  return (
    <div className="flex items-stretch gap-2 p-2 text-right" dir="rtl">
      {/* rail + dot — RIGHTMOST in RTL (Figma: status dot x≈224, rail on the right edge) */}
      <div className="relative flex w-3 shrink-0 flex-col items-center pt-1">
        <StatusDot color={dotColor} type="timeline" />
        {rail && <span className="mt-1 w-px flex-1 bg-neutrals-palladium" />}
      </div>

      {/* content — to the LEFT of the rail. RTL → items-start aligns rows to the RIGHT
          (REST: time/date row + title + link all right-aligned, x flush to the rail). */}
      <div className="flex flex-1 flex-col items-start gap-2 text-right">
        <div
          className="flex items-center gap-1 text-small font-sans text-neutrals-nickel"
          dir="rtl"
        >
          <span>{time}</span>
          <span className="text-[12px]">•</span>
          <span>{date}</span>
        </div>
        <span className="w-full text-right text-[20px] leading-none font-semibold font-sans text-neutrals-charcoal">
          {event}
        </span>
        <button
          type="button"
          className="w-full text-right text-small font-sans text-accent"
        >
          {link}
        </button>
      </div>
    </div>
  )
}
