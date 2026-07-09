// Shared table primitives reproduced from the Figma "Tables" page.
// Includes: chevron Vector, sort Icon (A-Z / Z-A), Monitor Cell bar, filter glyph,
// more-vert and drag-handle glyphs used across the table sets.

type SortDir = 'A-Z' | 'Z-A'

// All glyphs below use `currentColor`, so callers set the color with a text-* class.
// Figma uses the color to signal emphasis/state: charcoal #181D24 = active/emphasized,
// palladium #BCC3CB / nickel #9EA5AD = de-emphasized or disabled. Each icon defaults to
// its original Figma fill so existing call sites render unchanged.

// Figma "Vector" set — 12x7 chevron, fill #181D24. Variant2 = flipped (pointing up).
export function ChevronVector({
  direction = 'down',
  className = 'text-neutrals-charcoal',
}: {
  direction?: 'down' | 'up'
  className?: string
}) {
  return (
    <svg
      width="12"
      height="7"
      viewBox="0 0 12 7"
      fill="none"
      aria-hidden="true"
      className={`${className} ${direction === 'up' ? 'rotate-180' : ''}`}
    >
      <path
        d="M1 1L6 6L11 1"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Figma "Icon" set — Arrow North 16x16 (fill #181D24). A-Z up, Z-A flips it.
export function SortIcon({
  dir = 'A-Z',
  className = 'text-neutrals-charcoal',
}: {
  dir?: SortDir
  className?: string
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={`${className} ${dir === 'Z-A' ? 'rotate-180' : ''}`}
    >
      <path
        d="M8 2.5V13.5M8 2.5L4 6.5M8 2.5L12 6.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Figma "02 - New Buttons" filter glyph inside the header — 16x16, fill #BCC3CB.
export function FilterIcon({
  className = 'text-neutrals-palladium',
}: {
  className?: string
}) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1.5 3H14.5L9.5 9V14L6.5 12.5V9L1.5 3Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Icon/More Vert — 24x24 box, three dots, fill #181D24.
export function MoreVertIcon({
  className = 'text-neutrals-charcoal',
}: {
  className?: string
}) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="12" cy="5" r="2" fill="currentColor" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <circle cx="12" cy="19" r="2" fill="currentColor" />
    </svg>
  )
}

// "Group 6427" — drag handle grid of 6 dots, fill #BCC3CB.
export function DragHandle({
  className = 'text-neutrals-palladium',
}: {
  className?: string
}) {
  return (
    <svg
      width="10"
      height="16"
      viewBox="0 0 10 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {[3, 8, 13].map((y) =>
        [2, 8].map((x) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="2" fill="currentColor" />
        )),
      )}
    </svg>
  )
}

export type MonitorColor = 'green' | 'red'
export type MonitorState = 'default' | 'hover'

const monitorFill: Record<MonitorColor, string> = {
  green: '#51D5A5',
  red: '#C94236',
}

// Figma "Monitor Cell" set — thin bar w=3, radius 2. Default h=16, Hover h=20.
// (Inside the Cell Container "Monitoring" variant the bar is 5px wide — pass width={5}.)
export function MonitorCell({
  color = 'green',
  state = 'default',
  width = 3,
}: {
  color?: MonitorColor
  state?: MonitorState
  width?: number
}) {
  return (
    <span
      className="inline-block rounded-[2px] align-bottom"
      style={{
        width,
        height: state === 'hover' ? 20 : 16,
        backgroundColor: monitorFill[color],
      }}
    />
  )
}
