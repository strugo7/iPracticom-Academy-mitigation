/**
 * רדאר ביצועים — SVG. גיאומטריה מדויקת מ-design-export/UserProfile.dc.html
 * (cx=180, cy=148, R=104, זווית ראשונה -90°, 360°/n בין צירים). קומפוננטת
 * dataviz ייחודית ל-feature (לא פרימיטיב DS גנרי) — לכן חיה כאן, לא ב-ui/.
 */
import { Icon } from '@/components/ui'
import type { PerformanceRadarPoint } from '../types'

const CX = 180
const CY = 148
const RADIUS = 104
const RING_FRACTIONS = [0.25, 0.5, 0.75, 1]

function pointAt(index: number, count: number, radius: number): [number, number] {
  const angle = ((-90 + index * (360 / count)) * Math.PI) / 180
  return [CX + radius * Math.cos(angle), CY + radius * Math.sin(angle)]
}

export function PerformanceRadar({ radar }: { radar: PerformanceRadarPoint[] }) {
  return (
    <div className="flex h-full flex-col rounded-2xl bg-white p-6 shadow-card">
      <div className="mb-1 flex items-center gap-2">
        <Icon name="Worldwide" size={18} className="text-accent" />
        <div className="text-small font-semibold text-neutrals-charcoal">
          רדאר ביצועים
        </div>
      </div>
      <div className="mb-2 text-tiny text-neutrals-lead">ציון ממוצע לפי תחום</div>

      {radar.length < 3 ? (
        <p className="m-0 flex flex-1 items-center justify-center text-center text-tiny text-neutrals-lead">
          עוד אין מספיק תוצאות מבחנים כדי להציג רדאר ביצועים.
        </p>
      ) : (
        <svg viewBox="0 0 360 320" className="h-auto w-full">
          {RING_FRACTIONS.map((fraction) => (
            <polygon
              key={fraction}
              points={radar
                .map((_, i) => pointAt(i, radar.length, RADIUS * fraction).join(','))
                .join(' ')}
              fill="none"
              stroke="#E1E6EC"
              strokeWidth={1.2}
            />
          ))}
          {radar.map((_, i) => {
            const [x, y] = pointAt(i, radar.length, RADIUS)
            return (
              <line
                key={i}
                x1={CX}
                y1={CY}
                x2={x}
                y2={y}
                stroke="#E1E6EC"
                strokeWidth={1.2}
              />
            )
          })}
          <polygon
            points={radar
              .map((p, i) => pointAt(i, radar.length, (RADIUS * p.score) / 100).join(','))
              .join(' ')}
            fill="rgba(0,117,219,.16)"
            stroke="#0075DB"
            strokeWidth={2.4}
            strokeLinejoin="round"
          />
          {radar.map((p, i) => {
            const [x, y] = pointAt(i, radar.length, (RADIUS * p.score) / 100)
            return <circle key={i} cx={x} cy={y} r={3.6} fill="#0075DB" />
          })}
          {radar.map((p, i) => {
            const [x, y] = pointAt(i, radar.length, RADIUS + 22)
            const cos = Math.cos(((-90 + i * (360 / radar.length)) * Math.PI) / 180)
            const anchor = cos > 0.3 ? 'start' : cos < -0.3 ? 'end' : 'middle'
            return (
              <text
                key={i}
                x={x}
                y={y}
                textAnchor={anchor}
                fontFamily="var(--font-sans)"
                fontSize={12.5}
                fontWeight={600}
                fill="#3D4753"
              >
                {p.category}
                <tspan x={x} y={y + 15} fill="#0075DB">
                  {p.score}
                </tspan>
              </text>
            )
          })}
        </svg>
      )}
    </div>
  )
}
