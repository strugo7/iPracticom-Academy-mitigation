import { LineChart, type LineVariant } from './LineChart'

// Figma "Graph" set (node 1047:720). A white card (r=16, fill #FFFFFF, pad 21/23)
// containing a wide Line Chart + a legend. Type 1..4 picks the matching Line
// Charts variant (1 = "1 Line", 2 = "2 Lines", 3 = "3 Lines", 4 = "4 Graphs").
// Desktop: chart on the left, legend column on the right (RTL: legend = first,
// so it sits at the inline-start / right edge). Each legend row = count (18px
// charcoal) + label (16px charcoal) + a 9x9 r=3 color square.
// Mobile: big-number stats row (24px) on top, then chart + time axis.

export type GraphType = 1 | 2 | 3 | 4

interface LegendItem {
  count: string
  label: string
  color: string // exact Figma hex of the matching line
}

// Ordered top->bottom exactly as Figma. Colors match the line strokes.
const LEGENDS: Record<GraphType, LegendItem[]> = {
  4: [
    { count: '1', label: 'משימה', color: '#F1C21B' },
    { count: '6', label: 'זמינים', color: '#51D5A5' },
    { count: '2', label: 'בשיחה', color: '#C94236' },
    { count: '2', label: 'הפסקה', color: '#E1E6EC' },
  ],
  3: [
    { count: '6', label: 'זמינים', color: '#51D5A5' },
    { count: '2', label: 'משימה', color: '#C94236' },
    { count: '2', label: 'הפסקה', color: '#0075DB' },
  ],
  2: [
    { count: '6', label: 'זמינים', color: '#51D5A5' },
    { count: '2', label: 'הפסקה', color: '#0075DB' },
  ],
  1: [{ count: '2', label: 'הפסקה', color: '#0075DB' }],
}

const TYPE_TO_VARIANT: Record<GraphType, LineVariant> = {
  1: '1 Line',
  2: '2 Lines',
  3: '3 Lines',
  4: '4 Graphs',
}

const TIME_LABELS = ['08:00', '10:00', '12:00']

function TimeAxis() {
  return (
    <div className="flex justify-between">
      {TIME_LABELS.map((t) => (
        <span key={t} className="text-[13px] leading-5 text-neutrals-nickel">
          {t}
        </span>
      ))}
    </div>
  )
}

// Legend row (Figma "Frame 1984077957", width 160, space-between). REST x-coords + screenshot:
// the count (18px) is on the LEFT (x724), and the [label + dot] group on the RIGHT — within it
// the label (16px) then the 9x9 r3 color dot on the far RIGHT (x875), 6px apart.
// Forced dir="ltr" so it lays out count→left / dot→right (inheriting the card's RTL would mirror it).
function LegendRow({ item }: { item: LegendItem }) {
  return (
    <div dir="ltr" className="flex w-[160px] items-center justify-between">
      <span className="text-body text-neutrals-charcoal">{item.count}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-small text-neutrals-charcoal">{item.label}</span>
        <span
          className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
          style={{ backgroundColor: item.color }}
        />
      </div>
    </div>
  )
}

interface GraphProps {
  type?: GraphType
  responsive?: 'desktop' | 'mobile'
}

export function Graph({ type = 4, responsive = 'desktop' }: GraphProps) {
  const legend = LEGENDS[type]
  const variant = TYPE_TO_VARIANT[type]

  if (responsive === 'mobile') {
    // top stat row = first two legend rows as big numbers
    const stats = legend.slice(0, type === 1 ? 1 : 2)
    return (
      <div
        className="flex w-[320px] flex-col gap-5 rounded-2xl bg-white shadow-card"
        style={{ padding: '21px 23px' }}
        dir="rtl"
      >
        <div className="flex gap-12">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col gap-1.5">
              {/* RTL: color dot on the RIGHT of the label — consistent with desktop. */}
              <div className="flex items-center gap-1.5">
                <span
                  className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
                  style={{ backgroundColor: s.color }}
                />
                <span className="text-small text-neutrals-charcoal">
                  {s.label}
                </span>
              </div>
              <span className="text-[24px] leading-7 text-neutrals-charcoal">
                {s.label === 'זמינים'
                  ? '1,124'
                  : s.label === 'הפסקה'
                    ? '1,156'
                    : s.count}
              </span>
            </div>
          ))}
        </div>
        <div className="flex flex-col">
          <LineChart variant={variant} height={86} />
          <TimeAxis />
        </div>
      </div>
    )
  }

  return (
    <div
      className="flex items-center gap-12 rounded-2xl bg-white shadow-card"
      style={{ padding: '21px 23px' }}
      dir="rtl"
    >
      <div className="flex shrink-0 flex-col gap-[7px]">
        {legend.map((item) => (
          <LegendRow key={item.label} item={item} />
        ))}
      </div>
      <div className="flex min-w-0 flex-1 flex-col">
        <LineChart variant={variant} height={86} />
        <TimeAxis />
      </div>
    </div>
  )
}
