// Figma set "Staus" (2650:18734) — colored status dots in three render types:
//   Time Line  → 9px core dot with a 4px white ring (used along a vertical timeline).
//   Map Dots / Default → solid 8px dot (a point on the map).
//   Map Dots / Hover   → solid 13px dot (grows on hover).
// Colors: Blue #0075DB / Yellow #F1C21B / Red #C94236 / Green #51D5A5 / Gray #D9D9D9.
// 5 colors × 3 types = 15 variants.

export type StatusDotColor = 'blue' | 'yellow' | 'red' | 'green' | 'gray'
export type StatusDotType = 'timeline' | 'mapDefault' | 'mapHover'

interface StatusDotProps {
  color?: StatusDotColor
  type?: StatusDotType
  /** override the rendered diameter in px (the map view uses many sizes) */
  size?: number
}

const colorMap: Record<StatusDotColor, string> = {
  blue: 'bg-accent', // #0075DB
  yellow: 'bg-warning', // #F1C21B
  red: 'bg-caution', // #C94236
  green: 'bg-hues-green', // #51D5A5
  gray: 'bg-[#D9D9D9]',
}

export function StatusDot({
  color = 'blue',
  type = 'timeline',
  size,
}: StatusDotProps) {
  if (type === 'timeline') {
    // 9px core + 4px white ring (the ring sits over the timeline rail)
    return (
      <span
        className={`inline-block rounded-full ring-4 ring-white ${colorMap[color]}`}
        style={{ width: size ?? 9, height: size ?? 9 }}
      />
    )
  }
  const diameter = size ?? (type === 'mapHover' ? 13 : 8)
  return (
    <span
      className={`inline-block rounded-full ${colorMap[color]}`}
      style={{ width: diameter, height: diameter }}
    />
  )
}
