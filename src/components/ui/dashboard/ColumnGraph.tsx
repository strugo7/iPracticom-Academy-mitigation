// Figma "05 - Dashboards \ Column Graph" (node 3121:43479) and its building
// block "04 - Dashboards \ Column Graph Mobile" (node 3038:12910).
//
// Each agent column is a stacked bar with three exact-token segments. In Figma
// every segment is a FILL at 10% opacity plus a 1px solid stroke of the full
// color (strokeAlign INSIDE), giving the light translucent look in the PNG:
//   green  = hues.green  #51D5A5  (נכנסות / incoming, top in vertical)
//   indigo = hues.indigo #2EB4FF  (יוצאות / outgoing, middle)
//   red    = caution     #C94236  (חייגן / dialer, bottom)
// Y axis labels 15/10/5/0 with #F2F5F8 gridlines. X axis = agent names
// (#757D86 13px). Legend on the right (RTL): נכנסות 6 / יוצאות 2 / חייגן 1,
// the dot colors are green / #0075DB / red as in Figma.
//
// Desktop: vertical columns. Mobile: a white card with the legend on top, then
// horizontal stacked bars per agent and a pagination footer.

interface ColSegments {
  green: number // px height (vertical) / px width (horizontal)
  indigo: number
  red: number
}

const C_GREEN = '#51D5A5'
const C_INDIGO = '#2EB4FF'
const C_RED = '#C94236'

// A stacked-bar segment: 10% color fill + 1px solid color border (Figma spec).
function segStyle(color: string): React.CSSProperties {
  return {
    backgroundColor: `${color}1A`, // 1A = 10% alpha
    boxShadow: `inset 0 0 0 1px ${color}`,
  }
}

// Sample data (Figma values, in px segment sizes from the spec)
const DESKTOP_COLUMNS: { name: string; seg: ColSegments }[] = [
  { name: 'אלונה לי א.', seg: { green: 42, indigo: 79, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 48, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 42, indigo: 79, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 48, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 78, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 22, indigo: 24, red: 22 } },
  { name: 'אלונה לי א.', seg: { green: 78, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 48, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 42, indigo: 79, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 48, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 78, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 48, indigo: 43, red: 24 } },
  { name: 'אלונה לי א.', seg: { green: 42, indigo: 79, red: 24 } },
]

const MOBILE_ROWS: { name: string; seg: ColSegments }[] = [
  { name: 'ליה אברהם', seg: { red: 21, indigo: 61, green: 134 } },
  { name: 'יובל לוי', seg: { red: 21, indigo: 21, green: 174 } },
  { name: 'עידן שוקד', seg: { red: 33, indigo: 15, green: 154 } },
  { name: 'מאיה כהן', seg: { red: 21, indigo: 40, green: 80 } },
  { name: 'תמר רותם', seg: { red: 21, indigo: 61, green: 100 } },
  { name: 'טל ברבוזי', seg: { red: 33, indigo: 30, green: 90 } },
  { name: 'מאור נמני', seg: { red: 21, indigo: 25, green: 120 } },
  { name: 'אוריה גוט', seg: { red: 21, indigo: 61, green: 134 } },
  { name: 'מועה פז', seg: { red: 21, indigo: 21, green: 70 } },
  { name: 'רועי בן דוד', seg: { red: 33, indigo: 40, green: 110 } },
  { name: 'שירה עוז', seg: { red: 21, indigo: 30, green: 95 } },
  { name: 'דניאל ברק', seg: { red: 21, indigo: 61, green: 140 } },
  { name: 'איתן סלע', seg: { red: 33, indigo: 20, green: 60 } },
]

const Y_LABELS = ['15', '10', '5', '0']

function LegendDesktop() {
  const rows = [
    { count: '6', label: 'נכנסות', color: C_GREEN },
    { count: '2', label: 'יוצאות', color: '#0075DB' },
    { count: '1', label: 'חייגן', color: C_RED },
  ]
  // Figma legend frame is 160 wide, rows space-between (count at the right edge,
  // [label 16px + 9x9 r3 dot] at the left), 7px between rows.
  return (
    <div className="flex w-[160px] shrink-0 flex-col gap-[7px]">
      {rows.map((r) => (
        <div key={r.label} className="flex items-center justify-between">
          <span className="text-small text-neutrals-charcoal">{r.count}</span>
          <div className="flex items-center gap-1.5">
            <span className="text-small text-neutrals-charcoal">{r.label}</span>
            <span
              className="h-[9px] w-[9px] rounded-[3px]"
              style={{ backgroundColor: r.color }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

export function ColumnGraph() {
  const plotHeight = 146
  // The desktop "05 - Column Graph" COMPONENT has NO fill / radius / shadow — it
  // is a transparent container (pad T24 B24, gap 40 between plot and legend).
  return (
    <div className="flex items-center gap-10 py-6" dir="rtl">
      <LegendDesktop />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex gap-3">
          {/* y axis */}
          <div
            className="flex flex-col justify-between pb-6"
            style={{ height: plotHeight + 24 }}
          >
            {Y_LABELS.map((l) => (
              <span
                key={l}
                className="text-[13px] leading-none text-neutrals-nickel"
              >
                {l}
              </span>
            ))}
          </div>
          {/* plot */}
          <div className="relative min-w-0 flex-1">
            {/* gridlines */}
            <div
              className="absolute inset-x-0 top-0 flex flex-col justify-between"
              style={{ height: plotHeight }}
            >
              {Y_LABELS.map((l) => (
                <div key={l} className="border-t border-neutrals-whisper" />
              ))}
            </div>
            {/* columns */}
            <div
              className="relative flex items-end justify-between gap-[15px]"
              style={{ height: plotHeight }}
            >
              {DESKTOP_COLUMNS.map((c, i) => (
                <div
                  key={i}
                  className="flex flex-1 flex-col"
                  style={{ minWidth: 0 }}
                >
                  <div style={{ height: c.seg.green, ...segStyle(C_GREEN) }} />
                  <div
                    style={{ height: c.seg.indigo, ...segStyle(C_INDIGO) }}
                  />
                  <div style={{ height: c.seg.red, ...segStyle(C_RED) }} />
                </div>
              ))}
            </div>
            {/* x axis labels */}
            <div className="mt-1.5 flex justify-between gap-[15px]">
              {DESKTOP_COLUMNS.map((c, i) => (
                <span
                  key={i}
                  className="flex-1 truncate text-center text-[13px] leading-none text-neutrals-lead"
                >
                  {c.name}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function PagerButton({
  children,
  disabled,
}: {
  children: React.ReactNode
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className="flex h-8 w-8 items-center justify-center rounded-lg border border-neutrals-silver text-neutrals-lead disabled:opacity-40"
    >
      {children}
    </button>
  )
}

export function ColumnGraphMobile() {
  // horizontal bars; max total width for scaling
  const maxTotal = Math.max(
    ...MOBILE_ROWS.map((r) => r.seg.red + r.seg.indigo + r.seg.green),
  )
  return (
    <div
      className="flex w-[330px] flex-col gap-5 rounded-2xl border border-neutrals-silver bg-white p-6 shadow-card"
      dir="rtl"
    >
      {/* legend */}
      <div className="flex items-center justify-center gap-5">
        {[
          { count: '1', label: 'חייגן', color: C_RED },
          { count: '2', label: 'יוצאות', color: '#0075DB' },
          { count: '6', label: 'נכנסות', color: C_GREEN },
        ].map((r) => (
          <div key={r.label} className="flex items-center gap-1.5">
            <span className="text-tiny text-neutrals-charcoal">{r.count}</span>
            <span className="text-tiny text-neutrals-charcoal">{r.label}</span>
            <span
              className="h-[9px] w-[9px] rounded-[3px]"
              style={{ backgroundColor: r.color }}
            />
          </div>
        ))}
      </div>
      <div className="border-t border-neutrals-silver" />
      {/* rows */}
      <div className="flex flex-col gap-4">
        {MOBILE_ROWS.map((r, i) => {
          const total = r.seg.red + r.seg.indigo + r.seg.green
          return (
            <div key={i} className="flex items-center gap-2">
              <span className="w-[58px] shrink-0 truncate text-[13px] leading-none text-neutrals-lead">
                {r.name}
              </span>
              <div
                className="flex h-[23px] min-w-0 flex-1"
                style={{ width: `${(total / maxTotal) * 100}%` }}
              >
                <div style={{ flex: r.seg.red, ...segStyle(C_RED) }} />
                <div style={{ flex: r.seg.indigo, ...segStyle(C_INDIGO) }} />
                <div style={{ flex: r.seg.green, ...segStyle(C_GREEN) }} />
              </div>
            </div>
          )
        })}
      </div>
      {/* x axis scale */}
      <div className="flex justify-between pr-[66px] text-[13px] leading-none text-neutrals-nickel">
        <span>0</span>
        <span>5</span>
        <span>15</span>
        <span>10</span>
      </div>
      <div className="border-t border-neutrals-silver" />
      {/* pagination */}
      <div className="flex items-center justify-center gap-4">
        <div className="flex items-center gap-2">
          <PagerButton disabled>{'‹'}</PagerButton>
          <PagerButton>{'›'}</PagerButton>
        </div>
        <span className="text-tiny text-neutrals-lead">מתוך 22</span>
        <div className="flex h-9 w-12 items-center justify-center rounded-lg border border-neutrals-silver text-tiny text-neutrals-charcoal">
          1
        </div>
      </div>
    </div>
  )
}
