import { RingProgress, RingPieChart } from './RingPie'
import { LineChart } from './LineChart'

// Figma "Dashboards Components" set (node 1465:6310). 10 variants:
//   Warning / Cube / Progress Bar (D+M) / Chart (D+M) / Pie / Pie Vertical /
//   Multi Value Cube (D+M).
// Cards are white, r=16, 1px #E1E6EC border, 24px padding (Chart uses 19/10).
// All text uses design tokens; Hebrew content is right-to-left.

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

function CardShell({
  children,
  className = '',
  style,
  shadowClass = 'shadow-card',
}: {
  children: React.ReactNode
  className?: string
  style?: React.CSSProperties
  /** override the default card shadow (Multi Value Cube uses a lighter one) */
  shadowClass?: string
}) {
  return (
    <div
      className={`rounded-2xl border border-neutrals-silver bg-white p-6 ${shadowClass} ${className}`}
      style={style}
      dir="rtl"
    >
      {children}
    </div>
  )
}

// --- Warning ----------------------------------------------------------------
// A card with a red-tinted alert box ("ממתינות" + caution triangle + big red 6)
// and below it "זמן הממתין הארוך ביותר" + a 36px timer "00:08:23".
export function WarningCard() {
  return (
    <CardShell className="w-[294px]">
      <div className="flex flex-col gap-[25px]">
        {/* Figma: the box content is STACKED and right-aligned — label "ממתינות" on top,
            then [caution triangle (left) + "6" (right)] below. */}
        <div className="flex flex-col items-start gap-1 rounded-[10px] border border-caution bg-[#FFF1F1] px-4 py-2">
          <span className="text-small text-neutrals-charcoal">ממתינות</span>
          <div className="flex items-center gap-2">
            <span className="text-h2 text-caution">6</span>
            {/* Exact Figma "Icon/Caution" (node 1465:6343): filled warning triangle, #181D24. */}
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M21.2278 19.3945L11.1445 1.97781L1.06113 19.3945H21.2278ZM10.2278 16.6445V14.8111H12.0611V16.6445H10.2278ZM10.2278 12.9778H12.0611V9.31114H10.2278V12.9778Z"
                fill="#181D24"
              />
            </svg>
          </div>
        </div>
        <div className="flex flex-col gap-1.5">
          <span className="text-small text-neutrals-charcoal">
            זמן הממתין הארוך ביותר
          </span>
          <span className="text-h2 text-neutrals-charcoal">00:08:23</span>
        </div>
      </div>
    </CardShell>
  )
}

// --- Cube -------------------------------------------------------------------
// Small tile: icon + "שלוחות" label, then a "15" big number with a green
// "בזמינות" tag and a small blue dropdown chip.
export function CubeCard() {
  return (
    <CardShell className="w-[252px]">
      {/* Frame 1872: vertical, gap 4. Row 1 = "שלוחות" (the Figma leading icon is
          visible:false → not rendered). Row 2 (RTL, gap 6) = big "15" (36px) on the
          right, the green "בזמינות" tag (r40, #DDFFEA, 15px #00857C), then a blue
          "כיתוב" pill (#0075DB, r20) on the left. */}
      <div className="flex flex-col gap-1">
        <span className="text-small text-neutrals-charcoal">שלוחות</span>
        <div className="flex items-center gap-1.5">
          <span className="text-h2 leading-none text-neutrals-charcoal">
            15
          </span>
          <span className="flex shrink-0 items-center rounded-[40px] bg-[#DDFFEA] px-[9px] py-[3px] text-[15px] leading-none text-success">
            בזמינות
          </span>
          <span className="inline-flex shrink-0 items-center rounded-[20px] py-1 text-small text-accent">
            כיתוב
          </span>
        </div>
      </div>
    </CardShell>
  )
}

// --- Progress Bar -----------------------------------------------------------
// "רמת שירות" title + a 164 RingProgress at 86% (blue accent gradient).
export function ProgressBarCard() {
  return (
    <CardShell className="flex w-[212px] flex-col items-center gap-5">
      <span className="self-start px-2.5 text-small text-neutrals-charcoal">
        רמת שירות
      </span>
      <RingProgress value={86} color="blue" size={164} />
    </CardShell>
  )
}

// --- Chart ------------------------------------------------------------------
// "נכנסות" 2 stat (with a small missed-call chip) + a "1 Line" spark chart with
// time axis. Desktop = side by side; Mobile = stacked.
function ChartStat() {
  return (
    <div className="flex flex-col gap-[5px]">
      <span className="flex h-[27px] w-[27px] items-center justify-center rounded-full bg-neutrals-whisper">
        {/* Real filled Figma "Icon material-call-missed" (Material call_missed), fill #9EA5AD. */}
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M19.59 7L12 14.59 6.41 9H11V7H3v8h2v-4.59l7 7 9-9L19.59 7z"
            fill="#9EA5AD"
          />
        </svg>
      </span>
      <span className="text-small text-neutrals-charcoal">נכנסות</span>
      <span className="text-[48px] leading-none text-neutrals-charcoal">2</span>
    </div>
  )
}

export function ChartCard({
  responsive = 'desktop',
}: {
  responsive?: 'desktop' | 'mobile'
}) {
  if (responsive === 'mobile') {
    return (
      <CardShell className="w-[298px]" style={{ padding: '10px 19px' }}>
        <div className="flex flex-col gap-5 py-2">
          <ChartStat />
          <div className="flex flex-col">
            <LineChart variant="1 Line" height={86} />
            <TimeAxis />
          </div>
        </div>
      </CardShell>
    )
  }
  return (
    <CardShell className="w-[389px]" style={{ padding: '10px 19px' }}>
      <div className="flex items-center gap-5 py-2">
        <ChartStat />
        <div className="flex min-w-0 flex-1 flex-col">
          <LineChart variant="1 Line" height={86} />
          <TimeAxis />
        </div>
      </div>
    </CardShell>
  )
}

// --- Pie / Pie Vertical -----------------------------------------------------
// "מצב נציגים" title + 4-segment pie ("10") + a legend (label/dot + count):
//   פנויים 6 (green), שיחה 3 (red), הפסקה 2 (silver), משימה 1 (yellow).
const PIE_LEGEND = [
  { label: 'פנויים', count: '6', color: '#51D5A5' },
  { label: 'שיחה', count: '3', color: '#C94236' },
  { label: 'הפסקה', count: '2', color: '#E1E6EC' },
  { label: 'משימה', count: '1', color: '#F1C21B' },
]

function PieLegend() {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col gap-[7px]">
        {PIE_LEGEND.map((r) => (
          // RTL row: the colored dot is on the RIGHT, the status label to its LEFT.
          <div key={r.label} className="flex items-center gap-1.5">
            <span
              className="h-[9px] w-[9px] shrink-0 rounded-[3px]"
              style={{ backgroundColor: r.color }}
            />
            <span className="text-small text-neutrals-charcoal">{r.label}</span>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-[7px]">
        {PIE_LEGEND.map((r) => (
          <span key={r.label} className="text-small text-neutrals-charcoal">
            {r.count}
          </span>
        ))}
      </div>
    </div>
  )
}

export function PieCard() {
  return (
    <CardShell className="w-[653px]">
      <div className="flex flex-col gap-5">
        <span className="self-start text-small text-neutrals-charcoal">
          מצב נציגים
        </span>
        {/* RTL: legend (agents) on the RIGHT, pie on the LEFT. dir=rtl → first child = right. */}
        <div className="flex items-center justify-between gap-[84px]">
          <PieLegend />
          <RingPieChart center="10" size={158} />
        </div>
      </div>
    </CardShell>
  )
}

export function PieVerticalCard() {
  return (
    <CardShell
      className="flex w-[298px] flex-col items-center gap-5"
      style={{ padding: '24px 64px' }}
    >
      <span className="self-start text-small text-neutrals-charcoal">
        מצב נציגים
      </span>
      {/* Frame 1870: VERTICAL, gap 84 — pie on top, legend below. */}
      <div className="flex flex-col items-center gap-[84px]">
        <RingPieChart center="10" size={158} />
        <PieLegend />
      </div>
    </CardShell>
  )
}

// --- Multi Value Cube -------------------------------------------------------
// Row of stats; the last ("נכנסות 10") separated by a vertical divider.
//   Desktop: בקשה לשיחה חוזרת 1 | לא נענו 1 | נענו 4 | נכנסות 10
//   Mobile: top row (שיחה חוזרת 1 / לא נענו 1 / נענו 4) then נכנסות 10 below.
export function MultiValueCubeCard({
  responsive = 'desktop',
}: {
  responsive?: 'desktop' | 'mobile'
}) {
  if (responsive === 'mobile') {
    return (
      <CardShell
        className="w-[320px] !border-[#CFD6DD]"
        shadowClass="shadow-[0_6px_7px_0_rgba(0,0,0,0.07)]"
      >
        <div className="flex flex-col gap-4">
          <div className="flex items-stretch justify-between gap-4">
            {[
              { count: '1', label: 'שיחה חוזרת' },
              { count: '1', label: 'לא נענו' },
              { count: '4', label: 'נענו' },
            ].map((s, i) => (
              <div key={s.label} className="flex flex-1 items-stretch gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-[25px] leading-none text-neutrals-charcoal">
                    {s.count}
                  </span>
                  <span className="text-small text-neutrals-charcoal">
                    {s.label}
                  </span>
                </div>
                {i < 2 && (
                  <div className="w-px self-stretch bg-neutrals-silver" />
                )}
              </div>
            ))}
          </div>
          <div className="border-t border-[#BCC3CB]" />
          <div className="flex flex-col gap-1">
            <span className="text-small text-neutrals-charcoal">נכנסות</span>
            <span className="text-h2 text-neutrals-charcoal">10</span>
          </div>
        </div>
      </CardShell>
    )
  }
  // Figma desktop: HORIZONTAL container, gap 96 between all four items
  // ([stat][stat][stat][divider + נכנסות]). Each stat is label (16px) on top,
  // number (36px) below. Frame 1909 = a #BCC3CB divider (gap 34) then נכנסות 10.
  return (
    <CardShell
      className="w-[656px] !border-[#CFD6DD]"
      shadowClass="shadow-[0_6px_7px_0_rgba(0,0,0,0.07)]"
      style={{ padding: '24px 24px 11px 70px' }}
    >
      <div className="flex items-end gap-24">
        {[
          { count: '1', label: 'בקשה לשיחה חוזרת' },
          { count: '1', label: 'לא נענו' },
          { count: '4', label: 'נענו' },
        ].map((s) => (
          <div key={s.label} className="flex flex-col gap-1">
            <span className="text-small text-neutrals-charcoal">{s.label}</span>
            <span className="text-h2 text-neutrals-charcoal">{s.count}</span>
          </div>
        ))}
        <div className="flex items-end gap-[34px]">
          <div className="h-14 w-px bg-[#BCC3CB]" />
          <div className="flex flex-col gap-1">
            <span className="text-small text-neutrals-charcoal">נכנסות</span>
            <span className="text-h2 text-neutrals-charcoal">10</span>
          </div>
        </div>
      </div>
    </CardShell>
  )
}
