import { type MonitorColor } from './TablePrimitives'

// Figma standalone "02 - Extended Monitoring" — total width 1013, 36 bars each 24px wide,
// h=32 with top corners rounded 4px, gap 4, top padding 10. Exact Figma sequence:
// green, red, 22×green, 11×red, green (#51D5A5 / #C94236).
const pattern: MonitorColor[] = [
  'green',
  'red',
  ...Array<MonitorColor>(22).fill('green'),
  ...Array<MonitorColor>(11).fill('red'),
  'green',
]

const fill: Record<MonitorColor, string> = {
  green: '#51D5A5',
  red: '#C94236',
}

export function ExtendedMonitoring({
  cells = pattern,
}: {
  cells?: MonitorColor[]
}) {
  return (
    <div className="flex items-end gap-1 pt-2.5 overflow-x-auto">
      {cells.map((c, i) => (
        <span
          key={i}
          className="shrink-0 rounded-t-[4px]"
          style={{ width: 24, height: 32, backgroundColor: fill[c] }}
        />
      ))}
    </div>
  )
}
