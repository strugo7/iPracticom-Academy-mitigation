// Figma "Cell" (set 2603:1769) — a 32x32 cell used in calendars / date ranges.
// REST-verified: the colored BACKGROUND is painted on the OUTER 32x32 component, which is
// SQUARE (no cornerRadius). The inner "Cell" frame has r=100 but fill=none → it paints
// nothing, so cells render SQUARE, not round. Text 16px, align center.
//  Default:  transparent bg, black text (#000000) 400              · square
//  Hover:    transparent bg, accent text (#0075DB) 400             · square
//  Selected: light-sky bg (#C9EDFF), accent text 400               · SQUARE (not round)
//  Start:    solid accent fill, white text 600, rCorners [0,8,8,0] → RIGHT side rounded
//  End:      solid accent fill, white text 600, rCorners [8,0,0,8] → LEFT side rounded
//  Disabled: transparent bg, black text (#000000) 400 (Figma shows no dimming on the cell itself)
// Note: the Figma Cell SET has 6 variants and NO "range" mid-bar — the sky bar is composed
//       in the calendar Row. "range" here is a helper to render that middle segment 1:1.
type CellState =
  | 'default'
  | 'hover'
  | 'selected'
  | 'single'
  | 'start'
  | 'end'
  | 'range'
  | 'disabled'
  | 'muted'

interface CellProps {
  state?: CellState
  children: React.ReactNode
  onClick?: () => void
}

const stateMap: Record<CellState, string> = {
  // SQUARE per REST (bg on the 32x32 component, which has no cornerRadius).
  default: 'bg-transparent text-black font-normal',
  hover: 'bg-transparent text-accent font-normal',
  selected: 'bg-hues-sky text-accent font-normal',
  // A single picked day = Start+End composed on ONE cell → solid accent, ALL corners r8, white text.
  single: 'bg-accent text-white font-semibold rounded-lg',
  // Range endpoints: solid accent, half-rounded (r8). Figma Start = r[0,8,8,0] → right side; End = r[8,0,0,8] → left side.
  start: 'bg-accent text-white font-semibold rounded-r-lg rounded-l-none',
  end: 'bg-accent text-white font-semibold rounded-l-lg rounded-r-none',
  // Middle of a range: filled SQUARE sky, no rounding → continuous bar between endpoints.
  range: 'bg-hues-sky text-accent font-normal',
  disabled: 'bg-transparent text-black font-normal cursor-not-allowed',
  // muted = secondary-month / out-of-range preview days (grey), per Full Calander.
  muted: 'bg-transparent text-neutrals-palladium font-normal',
}

export function Cell({ state = 'default', children, onClick }: CellProps) {
  return (
    <button
      type="button"
      disabled={state === 'disabled'}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-8 h-8 text-small font-sans transition-colors duration-150 ${stateMap[state]} ${
        state === 'disabled' ? '' : 'cursor-pointer'
      }`}
    >
      {children}
    </button>
  )
}
