// Figma "04 - Dashboards \ Columm Graph Mobile" set.
// A stacked bar of three segments (green #51D5A5, blue #2EB4FF, red #C94236)
// plus an agent-name label (Ploni 13px, #757D86).
//  - Mobile=False (desktop): VERTICAL bar, ~62px wide, total height ~124px,
//    label beneath. Segment order top->bottom: green, blue, red.
//  - Mobile=True: HORIZONTAL bar, ~23px tall, label leading.
// Segment values are proportional; total bar length stays fixed.

interface BarSegments {
  green: number
  blue: number
  red: number
}

interface StackedBarProps {
  segments: BarSegments
  label?: string
  orientation?: 'vertical' | 'horizontal'
  /** total px of the bar track (height for vertical, width for horizontal) */
  extent?: number
  thickness?: number
}

const GREEN = '#51D5A5'
const BLUE = '#2EB4FF'
const RED = '#C94236'

export function StackedBar({
  segments,
  label,
  orientation = 'vertical',
  extent = 124,
  thickness = 62,
}: StackedBarProps) {
  const total = segments.green + segments.blue + segments.red || 1
  const g = (segments.green / total) * extent
  const b = (segments.blue / total) * extent
  const r = (segments.red / total) * extent

  if (orientation === 'horizontal') {
    return (
      <div className="flex items-center gap-2 font-sans">
        {label && (
          <span className="text-[13px] text-neutrals-lead whitespace-nowrap">
            {label}
          </span>
        )}
        <div
          className="flex overflow-hidden"
          style={{ height: thickness, width: extent }}
        >
          {/* RTL order in Figma: red, blue, green */}
          <div style={{ width: r, background: RED }} />
          <div style={{ width: b, background: BLUE }} />
          <div style={{ width: g, background: GREEN }} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center gap-2 font-sans">
      <div
        className="flex flex-col overflow-hidden"
        style={{ width: thickness, height: extent }}
      >
        {/* top -> bottom: green, blue, red */}
        <div style={{ height: g, background: GREEN }} />
        <div style={{ height: b, background: BLUE }} />
        <div style={{ height: r, background: RED }} />
      </div>
      {label && <span className="text-[13px] text-neutrals-lead">{label}</span>}
    </div>
  )
}
