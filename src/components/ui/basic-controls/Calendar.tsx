import { useState, type ReactNode } from 'react'
import { Cell } from './Cell'

// Figma calendar family (unit set 2603:1814 / Full 2603:22374).
// Week starts Sunday on the RIGHT (RTL): א ב ג ד ה ו ש.
// Cells 32x32 (SQUARE per REST — bg on the square component), grid gap 8. Days header 14px. Month title 20px/600 (#000).
// Calander Unit / Independent: r16 white card + silver border + shadow 0/4/9 black@9%,
//   a PURPLE (#5856D6) header card on top (year #EBEBF5 + "Mon, Jan 13" #FFFFFF, 20px),
//   then content pad 32/24 gap 16 (Month Paging + Month grid). NO footer in this set.
// Full Calander (2603:22374): r16 card, two units side by side (each with purple header +
//   a small r2 arrow-box nav row), a divider, then ONE centered gradient "כיתוב" button (r20).

const WEEKDAYS = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'] // Sun → Sat

export function Days(): ReactNode {
  // RTL flow: first child (א) lands on the right, last (ש) on the left.
  return (
    <div className="flex font-sans" dir="rtl">
      {WEEKDAYS.map((d, i) => (
        <span key={i} className="flex-1 text-center text-tiny text-[#3C3C43]">
          {d}
        </span>
      ))}
    </div>
  )
}

interface RowProps {
  /** seven day numbers; null renders an empty pad cell */
  days: (number | null)[]
  selected?: number
  rangeStart?: number
  rangeEnd?: number
  disabled?: number[]
  /** grey "preview" days (secondary month / out-of-range) */
  muted?: number[]
  onPick?: (day: number) => void
}

// Normalize a possibly-reversed range into [lo, hi].
function rangeBounds(a?: number, b?: number): [number, number] | null {
  if (a == null || b == null) return null
  return a <= b ? [a, b] : [b, a]
}

type DayState =
  | 'disabled'
  | 'start'
  | 'end'
  | 'range'
  | 'selected'
  | 'single'
  | 'default'
  | 'muted'

function dayState(
  d: number,
  selected?: number,
  rangeStart?: number,
  rangeEnd?: number,
  disabled: number[] = [],
): DayState {
  if (disabled.includes(d)) return 'disabled'
  const bounds = rangeBounds(rangeStart, rangeEnd)
  if (bounds) {
    const [lo, hi] = bounds
    if (lo === hi) {
      // start === end → a single day = Start+End composed = solid accent, fully rounded.
      if (d === lo) return 'single'
    } else {
      // RTL: the LOWER day sits to the right (range start), the HIGHER to the left (range end).
      if (d === lo) return 'start'
      if (d === hi) return 'end'
      if (d > lo && d < hi) return 'range'
    }
  } else if (rangeStart != null && d === rangeStart) {
    // first click only — the lone picked endpoint reads as a single solid day until the
    // second click closes the range.
    return 'single'
  }
  // single-day picker: the picked day is a solid accent day (Start+End on one cell).
  if (d === selected) return 'single'
  return 'default'
}

export function Row({
  days,
  selected,
  rangeStart,
  rangeEnd,
  disabled = [],
  muted = [],
  onPick,
}: RowProps): ReactNode {
  const bounds = rangeBounds(rangeStart, rangeEnd)
  // Visual row-edge indices of in-range cells (RTL: index 0 = rightmost). Used to round the sky
  // bar's OUTER cap when a range continues across a week boundary.
  let rightmostIdx = -1
  let leftmostIdx = -1
  if (bounds) {
    const [lo, hi] = bounds
    const idxs = days
      .map((d, i) => (d != null && d >= lo && d <= hi ? i : -1))
      .filter((i) => i >= 0)
    if (idxs.length) {
      rightmostIdx = Math.min(...idxs)
      leftmostIdx = Math.max(...idxs)
    }
  }
  return (
    <div className="flex font-sans" dir="rtl">
      {days.map((d, i) => {
        if (d == null) return <span key={i} className="flex-1" />
        let state = dayState(d, selected, rangeStart, rangeEnd, disabled)
        if (state === 'default' && muted.includes(d)) state = 'muted'

        // CONTINUOUS sky bar. Dark accent endpoint (start/end) = the rounded cap; NO sky past it on
        // the OUTER side, so the endpoint carries sky on its INNER HALF only (50% gradient — the
        // opaque dark cell hides the seam). Middle cells = full square sky; a middle cell sitting at
        // the row's visual edge (range continues to the next week) gets a rounded OUTER cap.
        let track = ''
        let trackStyle: React.CSSProperties | undefined
        if (bounds) {
          const [lo, hi] = bounds
          const inSpan = d >= lo && d <= hi
          if (inSpan && hi > lo) {
            const SKY = '#C9EDFF'
            if (state === 'range') {
              track = 'bg-hues-sky'
              if (i === leftmostIdx) track += ' rounded-l-lg' // grid-LEFT edge cap
              if (i === rightmostIdx) track += ' rounded-r-lg' // grid-RIGHT edge cap
            } else if (state === 'start')
              trackStyle = {
                background: `linear-gradient(to right, ${SKY} 50%, transparent 50%)`,
              }
            else if (state === 'end')
              trackStyle = {
                background: `linear-gradient(to right, transparent 50%, ${SKY} 50%)`,
              }
          }
        }

        return (
          <span
            key={i}
            className={`flex-1 flex items-center justify-center ${track}`}
            style={trackStyle}
          >
            <Cell state={state} onClick={() => onPick?.(d)}>
              {d}
            </Cell>
          </span>
        )
      })}
    </div>
  )
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  const d = dir === 'left' ? 'M8 2L3 7l5 5' : 'M4 2l5 5-5 5'
  return (
    <svg
      width="12"
      height="14"
      viewBox="0 0 12 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="#0A7AFF"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Centered month title flanked by blue chevrons. RTL: prev ">" on the right, next "<" on the left.
export function MonthPaging({
  label = 'אוגוסט 2023',
  onPrev,
  onNext,
}: {
  label?: string
  onPrev?: () => void
  onNext?: () => void
}): ReactNode {
  return (
    <div className="flex items-center justify-between font-sans" dir="rtl">
      <button
        onClick={onPrev}
        className="cursor-pointer p-1"
        aria-label="חודש קודם"
      >
        <Chevron dir="right" />
      </button>
      <span className="text-[20px] font-bold text-black text-center">
        {label}
      </span>
      <button
        onClick={onNext}
        className="cursor-pointer p-1"
        aria-label="חודש הבא"
      >
        <Chevron dir="left" />
      </button>
    </div>
  )
}

// A month grid. `startOffset` = empty pad cells before day 1 (RTL alignment).
function buildWeeks(
  daysInMonth: number,
  startOffset: number,
): (number | null)[][] {
  const cells: (number | null)[] = Array(startOffset).fill(null)
  for (let d = 1; d <= daysInMonth; d++) cells.push(d)
  while (cells.length % 7 !== 0) cells.push(null)
  const weeks: (number | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))
  return weeks
}

interface MonthProps {
  daysInMonth?: number
  startOffset?: number
  selected?: number
  rangeStart?: number
  rangeEnd?: number
  disabled?: number[]
  muted?: number[]
  onPick?: (day: number) => void
}

// Plain day-number grid (weekday header + week rows). Charcoal numbers, gap 8.
export function Month({
  daysInMonth = 31,
  startOffset = 2,
  selected,
  rangeStart,
  rangeEnd,
  disabled,
  muted,
  onPick,
}: MonthProps): ReactNode {
  const weeks = buildWeeks(daysInMonth, startOffset)
  return (
    <div className="flex flex-col gap-2 font-sans">
      <Days />
      {weeks.map((w, i) => (
        <Row
          key={i}
          days={w}
          selected={selected}
          rangeStart={rangeStart}
          rangeEnd={rangeEnd}
          disabled={disabled}
          muted={muted}
          onPick={onPick}
        />
      ))}
    </div>
  )
}

interface CalendarUnitProps {
  /** independent = white card (r16) + silver border + purple date header + month-paging + grid.
   *  nested = just the days + grid (no border, no header, no month-paging). */
  variant?: 'independent' | 'nested'
  /** mobile = narrower card (full-width column), same anatomy. */
  mobile?: boolean
  monthLabel?: string
  headerYear?: string
  headerDate?: string
  selected?: number
  rangeStart?: number
  rangeEnd?: number
  disabled?: number[]
  muted?: number[]
  startOffset?: number
  daysInMonth?: number
  onPrev?: () => void
  onNext?: () => void
  onPick?: (day: number) => void
}

export function CalendarUnit({
  variant = 'independent',
  mobile = false,
  monthLabel = 'אוגוסט 2023',
  // headerYear / headerDate are part of CalendarUnitProps but drive the purple
  // `_Current date` header, which is a `visible:false` Figma layer we don't render.
  // Kept on the interface for API parity; not destructured (unused → noUnusedLocals).
  selected,
  rangeStart,
  rangeEnd,
  disabled,
  muted,
  startOffset = 2,
  daysInMonth = 31,
  onPrev,
  onNext,
  onPick,
}: CalendarUnitProps): ReactNode {
  const grid = (
    <Month
      daysInMonth={daysInMonth}
      startOffset={startOffset}
      selected={selected}
      rangeStart={rangeStart}
      rangeEnd={rangeEnd}
      disabled={disabled}
      muted={muted}
      onPick={onPick}
    />
  )

  if (variant === 'nested') {
    return (
      <div
        className={`${mobile ? 'w-[280px]' : 'w-full'} max-w-full bg-white font-sans`}
        dir="rtl"
      >
        {grid}
      </div>
    )
  }

  // Independent: r16 white card + silver border + shadow 0/4/9 black@9%.
  return (
    <div
      className={`${mobile ? 'w-[320px]' : 'w-[364px]'} max-w-full overflow-hidden rounded-2xl border border-neutrals-silver bg-white font-sans shadow-[0px_4px_9px_0px_rgba(0,0,0,0.09)]`}
      dir="rtl"
    >
      {/* Figma "_Current date" purple header is visible:false → not rendered. */}
      <div className="flex flex-col gap-4 px-8 py-6">
        <MonthPaging label={monthLabel} onPrev={onPrev} onNext={onNext} />
        {grid}
      </div>
    </div>
  )
}

// Figma Full-Calendar nav (2603:35023): a 48×40 bordered box (r2, border silver #E1E6EC, no fill)
// holding the real "Icon/Arrow East" glyph (24×24, fill #181D24) — NOT a chevron. Only the two OUTER
// boxes render (the inner 40×32 boxes are opacity:0 in Figma). Left panel → ← box flush top-left;
// right panel → → box flush top-right. The arrow points right (East); the left box mirrors it.
function ArrowBox({ dir: d }: { dir: 'left' | 'right' }) {
  return (
    <button
      type="button"
      className="flex h-10 w-12 shrink-0 items-center justify-center rounded-[2px] border border-neutrals-silver bg-white cursor-pointer"
      aria-label={d === 'right' ? 'חודש קודם' : 'חודש הבא'}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M15 5L13.59 6.41L18.17 11L2 11L2 13L18.17 13L13.58 17.59L15 19L22 12L15 5Z"
          fill="#181D24"
          transform={d === 'left' ? 'matrix(-1 0 0 1 24 0)' : undefined}
        />
      </svg>
    </button>
  )
}

function MonthPanel({
  label,
  mirror,
  selected,
  rangeStart,
  rangeEnd,
  disabled,
  muted,
  startOffset,
  daysInMonth,
}: {
  label: string
  mirror?: boolean
  selected?: number
  rangeStart?: number
  rangeEnd?: number
  disabled?: number[]
  muted?: number[]
  startOffset: number
  daysInMonth: number
}) {
  return (
    <div className="flex w-[364px] max-w-full flex-col gap-4">
      {/* REST header strip (Frame 6460, 364×40): month title CENTERED in the panel (18px/600/black),
          the single 48×40 arrow box pinned flush to the OUTER top corner (left panel → left, right
          panel → right). Title centering is independent of the box (absolute), matching Figma. */}
      <div className="relative flex h-10 items-center justify-center">
        <span className="text-[18px] font-semibold leading-[26px] text-black">
          {label}
        </span>
        <span className={`absolute top-0 ${mirror ? 'right-0' : 'left-0'}`}>
          <ArrowBox dir={mirror ? 'right' : 'left'} />
        </span>
      </div>
      <CalendarUnit
        variant="nested"
        monthLabel={label}
        selected={selected}
        rangeStart={rangeStart}
        rangeEnd={rangeEnd}
        disabled={disabled}
        muted={muted}
        startOffset={startOffset}
        daysInMonth={daysInMonth}
      />
    </div>
  )
}

// Figma "Full Calander" (REST 2603:35023): r16 white card + silver border + shadow 0/4/9 black@9%,
// HORIZONTAL gap32. Two sections:
//   • RIGHT: presets panel (147w, pad 24/16, left divider) — 5 range presets, selected = accent/600.
//   • LEFT : two month panels side by side, a divider, then a SPACE_BETWEEN footer with two date
//            fields on the RIGHT and a gradient "כיתוב" button (r20) on the LEFT.
const PRESETS = [
  'שבוע אחרון',
  'חודש אחרון',
  '3 חודשים אחרונים',
  '12 חודשים אחרונים',
  'מתחילת שנה',
]

// Footer field (Figma "03 - Input"): label "שם שדה" above, a bordered field with the grey "ערך"
// placeholder and a leading CLOCK glyph (time field).
function DateField() {
  return (
    <div className="flex flex-col gap-2" dir="rtl">
      <span className="text-small font-semibold text-neutrals-charcoal">
        שם שדה
      </span>
      <div className="flex h-10 w-[187px] items-center gap-2 rounded-lg border border-neutrals-palladium px-4">
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          className="text-neutrals-lead shrink-0"
          aria-hidden="true"
        >
          <circle cx="9" cy="9" r="7" stroke="currentColor" strokeWidth="1.4" />
          <path
            d="M9 5v4l2.5 1.5"
            stroke="currentColor"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <span className="text-body text-neutrals-nickel">ערך</span>
      </div>
    </div>
  )
}

export function FullCalendar(): ReactNode {
  const [preset, setPreset] = useState('12 חודשים אחרונים')
  return (
    <div
      className="inline-flex rounded-2xl border border-neutrals-silver bg-white font-sans shadow-[0px_4px_9px_0px_rgba(0,0,0,0.09)]"
      dir="rtl"
    >
      {/* RIGHT: presets panel (first child → right in RTL). Left divider separates it from the months. */}
      <div className="flex flex-col gap-[21px] border-l border-neutrals-silver px-4 py-6">
        {/* RTL: items-start = RIGHT — the preset shortcuts align to the panel's right edge */}
        <div className="flex flex-col items-start gap-[13px]">
          {PRESETS.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPreset(p)}
              className={`text-right text-[16px] leading-6 cursor-pointer ${
                preset === p
                  ? 'font-semibold text-accent'
                  : 'font-normal text-black'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* LEFT: two months + divider + footer. August shows a selected range 3–14; July's late days
          (23–30) are muted grey — matching the Figma instance. */}
      <div className="flex flex-col px-6">
        {/* RTL row: first child → RIGHT. Per shira's reference screenshot: the LATER month sits on
            the LEFT with a ← box at its far-left edge, the EARLIER month on the RIGHT with a → box at
            its far-right edge (arrows on the two OUTER edges). אוגוסט = later → LEFT (←), יולי =
            earlier → RIGHT (→). So render יולי FIRST with `mirror` (right-edge → box) and אוגוסט
            SECOND without mirror (left-edge ← box). */}
        <div className="flex flex-wrap gap-8 pt-[30px] pb-[10px]">
          <MonthPanel
            label="יולי 2023"
            startOffset={6}
            daysInMonth={31}
            mirror
            muted={[23, 24, 25, 26, 27, 28, 29, 30]}
          />
          <MonthPanel
            label="אוגוסט 2023"
            startOffset={6}
            daysInMonth={31}
            rangeStart={3}
            rangeEnd={14}
          />
        </div>
        <hr className="border-neutrals-silver" />
        {/* footer: SPACE_BETWEEN → date fields on the RIGHT (first), button on the LEFT (last). */}
        <div className="flex items-end justify-between gap-2.5 pt-[13px] pb-[30px]">
          <div className="flex items-end gap-2.5">
            <DateField />
            <DateField />
          </div>
          <button
            type="button"
            className="inline-flex items-center justify-center gap-2 rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold leading-5 text-white cursor-pointer"
          >
            כיתוב
          </button>
        </div>
      </div>
    </div>
  )
}
