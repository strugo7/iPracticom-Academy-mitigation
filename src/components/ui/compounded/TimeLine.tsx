// Figma set "TimeLine" (2813:17083) — ONE component with three variants, kept whole.
//   Activity : 320px white panel. Tabs ("מפה" / "יומן פעילות" active), a "שבוע אחרון"
//       outline dropdown button, then a vertical list of <TimeCell>s (each carries its own
//       rail + dot). A blue chevron-left round button floats off the LEFT edge.
//   Map      : 320px white panel. Same tabs ("מפה" active), then the map area. The map is a
//       RASTER image in Figma → rendered as a neutral labeled placeholder, with sized colored
//       Map-Dots scattered over it. Same floating chevron-left button.
//   Mini     : 48px collapsed strip — just the floating chevron button.

import { StatusDot, type StatusDotColor } from './StatusDot'
import { TimeCell } from './TimeCell'

export type TimeLineVariant = 'activity' | 'map' | 'mini'

interface TimeLineProps {
  variant?: TimeLineVariant
}

function Tabs({ active }: { active: 'map' | 'activity' }) {
  const tab = (id: 'map' | 'activity', label: string) => (
    <div className="flex flex-col items-center gap-1.5">
      <span
        className={`text-body font-sans text-neutrals-charcoal ${
          active === id ? 'font-semibold' : ''
        }`}
      >
        {label}
      </span>
      <span
        className={`h-1 w-[100px] rounded-full ${active === id ? 'bg-accent-gradient' : 'bg-transparent'}`}
      />
    </div>
  )
  // RTL: "מפה" sits on the right, "יומן פעילות" on the left.
  return (
    <div className="flex items-start justify-center gap-10 pt-2" dir="rtl">
      {tab('map', 'מפה')}
      {tab('activity', 'יומן פעילות')}
    </div>
  )
}

// Round chevron-left button (24px, accent gradient) that floats off the RIGHT edge of the
// panel (Figma: the button sits at the panel's right edge, x≈right edge, gradient #282FEF→#33B1FF).
function FloatBtn() {
  return (
    <span className="absolute -right-3 top-4 z-10 flex h-6 w-6 items-center justify-center rounded-full bg-accent-gradient shadow-md">
      <svg width="7" height="12" viewBox="0 0 7 12" fill="none" aria-hidden>
        <path
          d="M6 1 1 6l5 5"
          stroke="#fff"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  )
}

// Map dots — REST-exact positions (node 2650:18692). x/y are the dot CENTRE as a % of the
// map image (300x726), size = the visible ellipse diameter. Figma "Staus / Map Dots":
// green #51D5A5 / yellow #F1C21B / red #C94136. Positioning by % keeps them anchored as the
// placeholder scales.
const mapDots: { x: number; y: number; color: StatusDotColor; size: number }[] =
  [
    { x: 34.8, y: 55.0, size: 4, color: 'yellow' },
    { x: 47.5, y: 46.3, size: 8, color: 'green' },
    { x: 42.0, y: 36.7, size: 4, color: 'yellow' },
    { x: 55.5, y: 28.7, size: 4, color: 'yellow' },
    { x: 64.0, y: 26.4, size: 8, color: 'green' },
    { x: 48.5, y: 30.0, size: 12, color: 'green' },
    { x: 29.6, y: 67.8, size: 8, color: 'green' },
    { x: 40.4, y: 50.9, size: 19, color: 'green' },
    { x: 32.4, y: 59.1, size: 12, color: 'yellow' },
    { x: 38.9, y: 62.5, size: 19, color: 'green' },
    { x: 53.4, y: 38.0, size: 12, color: 'green' },
    { x: 53.2, y: 32.6, size: 23, color: 'red' },
    { x: 68.5, y: 20.6, size: 8, color: 'yellow' },
    { x: 65.5, y: 9.7, size: 8, color: 'green' },
    { x: 43.9, y: 43.4, size: 21, color: 'green' },
    { x: 22.5, y: 64.3, size: 8, color: 'red' },
    { x: 72.5, y: 13.4, size: 8, color: 'green' },
    { x: 64.3, y: 15.9, size: 4, color: 'yellow' },
    { x: 73.0, y: 18.2, size: 4, color: 'green' },
    { x: 68.5, y: 27.4, size: 4, color: 'green' },
    { x: 66.1, y: 18.1, size: 11, color: 'green' },
    { x: 75.5, y: 15.9, size: 8, color: 'green' },
    { x: 65.5, y: 12.8, size: 8, color: 'red' },
    { x: 44.5, y: 33.1, size: 8, color: 'green' },
    { x: 57.4, y: 35.4, size: 5, color: 'yellow' },
    { x: 72.5, y: 32.0, size: 8, color: 'green' },
    { x: 42.0, y: 39.1, size: 8, color: 'green' },
    { x: 49.8, y: 20.6, size: 8, color: 'red' },
    { x: 49.0, y: 35.7, size: 3, color: 'green' },
    { x: 54.2, y: 44.7, size: 8, color: 'green' },
    { x: 49.1, y: 39.7, size: 8, color: 'yellow' },
    { x: 39.1, y: 44.7, size: 8, color: 'red' },
    { x: 35.8, y: 47.9, size: 8, color: 'green' },
    { x: 83.8, y: 7.6, size: 8, color: 'yellow' },
  ]

export function TimeLine({ variant = 'activity' }: TimeLineProps) {
  if (variant === 'mini') {
    return (
      <div className="relative h-[108px] w-12 rounded-lg border border-neutrals-silver bg-white">
        <FloatBtn />
      </div>
    )
  }

  if (variant === 'map') {
    return (
      <div className="relative w-[320px] rounded-lg border border-neutrals-silver bg-white pb-3 pt-2">
        <FloatBtn />
        <Tabs active="map" />
        {/* Real Figma map image (300x726 in Figma → keep the aspect so the %-based dot
            positions land exactly), with the status dots overlaid on top. */}
        <div className="relative mx-2.5 mt-2 aspect-[300/726] overflow-hidden rounded-md bg-neutrals-whisper">
          <img
            src={`${import.meta.env.BASE_URL}assets/timeline-map.png`}
            alt="מפה"
            className="absolute inset-0 h-full w-full object-cover"
          />
          {mapDots.map((d, i) => (
            <span
              key={i}
              className="absolute -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${d.x}%`, top: `${d.y}%` }}
            >
              <StatusDot color={d.color} type="mapDefault" size={d.size} />
            </span>
          ))}
        </div>
      </div>
    )
  }

  // activity
  const cells = [
    { event: '500 מתגים נותקו', dotColor: 'yellow' as StatusDotColor },
    {
      event: '50 מתגים הופעלו 50 מתגנים הופעלו',
      dotColor: 'gray' as StatusDotColor,
    },
    { event: 'יוסי כהן הוריד מתג', dotColor: 'green' as StatusDotColor },
    { event: 'שם ארוע', dotColor: 'gray' as StatusDotColor },
    { event: 'שם ארוע', dotColor: 'gray' as StatusDotColor },
    { event: 'שם ארוע', dotColor: 'yellow' as StatusDotColor },
  ]
  return (
    <div className="relative w-[320px] rounded-lg border border-neutrals-silver bg-white pb-4 pt-2">
      <FloatBtn />
      <Tabs active="activity" />
      {/* date-range dropdown — REST: right-aligned (~42px from the panel's right edge), not centered. */}
      <div className="mt-4 flex justify-start px-[42px]" dir="rtl">
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-[20px] border border-accent px-5 py-1.5 text-small font-semibold font-sans text-accent"
        >
          שבוע אחרון
          <svg width="12" height="8" viewBox="0 0 12 8" fill="none" aria-hidden>
            <path
              d="M1 1.5 6 6.5 11 1.5"
              stroke="#0075DB"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
      {/* timeline list */}
      <div className="mt-3 px-4" dir="rtl">
        {cells.map((c, i) => (
          <TimeCell
            key={i}
            event={c.event}
            dotColor={c.dotColor}
            rail={i < cells.length - 1}
          />
        ))}
      </div>
    </div>
  )
}
