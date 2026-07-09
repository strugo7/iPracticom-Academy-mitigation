// Figma "Ring Pie" set (node 1047:477). Two types:
//  - Progress: a 164x164 circular ring. Track = silver #E1E6EC (~10px stroke),
//    progress arc drawn with a gradient. Center = "<value>%" with the number in
//    charcoal 48px and the "%" in #9EACC2 ~30px.
//    The PNG ground truth shows four ring accent colors keyed off value:
//      86 -> blue accent gradient (#282FEF -> #33B1FF)
//      50 -> solid yellow #F1C21B,  25 -> solid red #C94236,
//      100 -> teal/green gradient (#4AFF93 -> #33C2FF).
//    Default is the blue accent gradient. The arc carries a drop shadow
//    (rgba(0,0,0,0.25), y 18, blur 19 @164px). The center number + "%" group is
//    centered as a single unit in the absolute center of the ring.
//  - Pie: a 4-segment donut (exact Figma vector geometry) — red #C94236,
//    silver #E1E6EC, blue #0075DB, yellow #F1C21B — with a center value.

export type RingColor = 'blue' | 'yellow' | 'red' | 'teal'

// Exact Figma arc fills. The 86% / 100% variants paint the arc with a gradient
// ("Vector (Stroke)" node); 50% / 25% paint it with a single solid token. A
// `null` second stop = solid fill (no gradient).
const RING_STOPS: Record<RingColor, [string, string | null]> = {
  blue: ['#282FEF', '#33B1FF'],
  teal: ['#4AFF93', '#33C2FF'],
  yellow: ['#F1C21B', null],
  red: ['#C94236', null],
}

interface RingProgressProps {
  value: number // 0..100, drives the arc length
  /** center number override; defaults to the value */
  label?: string
  /** show the "%" sign (Figma shows it on the progress variant) */
  showPercent?: boolean
  color?: RingColor
  size?: number
}

let _uid = 0
function nextId(p: string) {
  return `${p}-${++_uid}`
}

export function RingProgress({
  value,
  label,
  showPercent = true,
  color = 'blue',
  size = 164,
}: RingProgressProps) {
  const gid = nextId('ring')
  const sid = nextId('ringshadow')
  const stroke = (9.94 / 164) * size
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const pct = Math.max(0, Math.min(100, value))
  const dash = (pct / 100) * c
  const center = size / 2
  const [from, to] = RING_STOPS[color]
  const arcStroke = to ? `url(#${gid})` : from
  const numFont = (48 / 164) * size
  const pctFont = (31 / 164) * size
  // Figma drop shadow on the progress arc (subtle soft shadow below the ring). The SVG is
  // rotated -90°, so a local dx maps to a screen-down shadow: local (dx=-offset, dy=0) →
  // screen (0, +offset). Kept tight (small blur) so it matches Figma and isn't a wide band.
  const shadowOffset = (13 / 164) * size

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {/* overflow-visible so the arc's drop shadow renders as a soft curve below the ring
          instead of being clipped to the SVG's square viewport (the "square shadow" bug). */}
      <svg
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 overflow-visible"
      >
        <defs>
          {to && (
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
              <stop stopColor={from} />
              <stop offset="1" stopColor={to} />
            </linearGradient>
          )}
          <filter id={sid} x="-50%" y="-50%" width="200%" height="200%">
            <feDropShadow
              dx={-shadowOffset}
              dy="0"
              stdDeviation={(6 / 164) * size}
              floodColor="#000000"
              floodOpacity="0.2"
            />
          </filter>
        </defs>
        {/* track — carries the drop shadow so EVERY ring shows the same soft shadow,
            regardless of how far the progress arc goes (25% looked shadowless when the
            shadow sat only on the small top arc). */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#E1E6EC"
          strokeWidth={stroke}
          filter={`url(#${sid})`}
        />
        {/* progress arc */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={arcStroke}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${dash} ${c}`}
        />
      </svg>
      {/* Center value: vertically + horizontally centered. The [number %] is one
          LTR group (baseline-aligned) so it reads "100%" with the % to the right. */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex items-baseline" dir="ltr">
          <span
            className="text-neutrals-charcoal"
            style={{ fontSize: numFont, lineHeight: 1 }}
          >
            {label ?? String(value)}
          </span>
          {showPercent && (
            <span
              className="text-[#9EACC2]"
              style={{ fontSize: pctFont, lineHeight: 1 }}
            >
              %
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

interface RingPieChartProps {
  /** center value (Figma sample = "10") */
  center?: string
  size?: number
}

// Exact Figma vector geometry for the 4-segment pie (node 2006:3002),
// authored on a 196x196 canvas. The center number is rendered as live text
// (charcoal) instead of the baked glyph path so the value can change.
export function RingPieChart({ center = '10', size = 164 }: RingPieChartProps) {
  const pieShadowId = nextId('pieshadow')
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox="0 0 196 196" fill="none">
        <defs>
          {/* Uniform with the Progress rings: ~13px down / 6px blur / 0.20 at display,
              scaled into the 196 viewBox (×196/size). */}
          <filter id={pieShadowId} x="-40%" y="-40%" width="180%" height="180%">
            <feDropShadow
              dx="0"
              dy={(13 * 196) / size}
              stdDeviation={(6 * 196) / size}
              floodColor="#000000"
              floodOpacity="0.2"
            />
          </filter>
        </defs>
        <g filter={`url(#${pieShadowId})`}>
          <path
            d="M100.718 5.66179C100.718 5.00706 100.855 4.35959 101.122 3.76111C101.388 3.16263 101.778 2.62641 102.265 2.18703C102.752 1.74787 103.326 1.41518 103.949 1.21039C104.573 1.0056 105.233 0.933252 105.887 0.997993C121.375 2.53665 136.069 8.57181 148.146 18.3549C160.223 28.1379 169.152 41.2384 173.825 56.0313C178.499 70.8241 178.711 86.6584 174.435 101.57C170.16 116.482 161.585 129.815 149.775 139.916C137.964 150.016 123.438 156.44 107.997 158.39C92.5562 160.341 76.8805 157.731 62.9143 150.887C62.3248 150.598 61.8025 150.189 61.3813 149.686C60.96 149.184 60.649 148.599 60.4683 147.97C60.2877 147.341 60.2414 146.68 60.3325 146.032C60.4235 145.384 60.6499 144.762 60.997 144.206C61.6133 143.219 62.5753 142.496 63.6965 142.176C64.8178 141.857 66.0182 141.963 67.0649 142.476C79.3786 148.511 93.1997 150.812 106.814 149.092C120.428 147.373 133.235 141.709 143.648 132.803C154.061 123.898 161.621 112.143 165.391 98.9957C169.16 85.8487 168.973 71.8883 164.853 58.8462C160.733 45.8039 152.861 34.2537 142.213 25.6283C131.565 17.0029 118.61 11.6818 104.955 10.3251C103.794 10.2098 102.717 9.66865 101.934 8.80679C101.151 7.94492 100.718 6.82386 100.718 5.66132V5.66179Z"
            fill="#C94236"
          />
          <path
            d="M26.622 58.6579C25.9858 58.4943 25.3911 58.1997 24.8762 57.7931C24.3613 57.3865 23.9375 56.8769 23.6323 56.2972C23.3271 55.7174 23.1472 55.0804 23.1042 54.4271C23.0611 53.7738 23.156 53.1188 23.3825 52.5042C30.451 33.3303 44.6806 17.6185 63.0996 8.65021C63.6896 8.36309 64.3335 8.20225 64.9896 8.17803C65.6458 8.15382 66.2999 8.26676 66.9096 8.50961C67.5197 8.75275 68.0719 9.12054 68.5306 9.5893C68.9893 10.0581 69.3443 10.6174 69.5729 11.2312C69.9786 12.3211 69.9633 13.5224 69.53 14.6017C69.0967 15.6811 68.2763 16.5614 67.228 17.0718C50.9891 24.9795 38.4441 38.8324 32.2129 55.7376C31.8106 56.8288 31.0157 57.7321 29.9826 58.2721C28.9494 58.8122 27.7517 58.9503 26.622 58.6598V58.6579Z"
            fill="#E1E6EC"
          />
          <path
            d="M56.3819 141.346C56.0348 141.902 55.5747 142.379 55.0312 142.747C54.4876 143.115 53.8727 143.365 53.2262 143.482C52.5796 143.599 51.9157 143.579 51.2772 143.424C50.6387 143.27 50.0398 142.984 49.5191 142.584C38.2367 133.933 29.493 122.422 24.2016 109.253C18.9102 96.0838 17.2653 81.7407 19.4387 67.7218C19.5389 67.0747 19.7742 66.4558 20.1292 65.9049C20.4842 65.3539 20.9511 64.8832 21.4998 64.5231C22.0485 64.1629 22.6668 63.9213 23.315 63.8138C23.9631 63.7062 24.6266 63.7352 25.2628 63.8988C26.3925 64.1894 27.3734 64.8879 28.0152 65.8587C28.6569 66.8295 28.9137 68.0033 28.7356 69.1522C26.8194 81.5121 28.2697 94.1581 32.935 105.769C37.6003 117.379 45.3093 127.528 55.2568 135.156C56.1813 135.865 56.8085 136.891 57.0164 138.035C57.2243 139.179 56.9982 140.359 56.3819 141.346Z"
            fill="#0075DB"
          />
          <path
            d="M74.6672 9.34789C74.4386 8.73405 74.3417 8.0793 74.3826 7.42585C74.4235 6.77239 74.6013 6.13473 74.9047 5.55396C75.208 4.9732 75.6301 4.4622 76.1438 4.05391C76.6574 3.64561 77.2512 3.34907 77.8869 3.18339C81.8986 2.13801 85.9862 1.40698 90.1124 0.997016C90.766 0.932274 91.4259 1.00463 92.0497 1.20942C92.6735 1.41421 93.2473 1.74689 93.7343 2.18605C94.2214 2.62544 94.6108 3.16165 94.8772 3.76013C95.1437 4.35862 95.2814 5.00608 95.2813 5.66081C95.2814 6.82335 94.8478 7.94442 94.0648 8.80628C93.2818 9.66814 92.2052 10.2093 91.0442 10.3246C87.407 10.6862 83.8038 11.3307 80.2674 12.2523C79.1387 12.5464 77.9405 12.4121 76.9056 11.8753C75.8707 11.3386 75.0729 10.4378 74.6672 9.34789Z"
            fill="#F1C21B"
          />
        </g>
        {/* Center number: the donut's visual centre is ~(98, 80) in this 196 viewBox
            (segments span y≈1–160), not (98, 98). 57.49px on the 158 pie ≈ 71 viewBox units. */}
        <text
          x="98"
          y="80"
          textAnchor="middle"
          dominantBaseline="central"
          fill="#181D24"
          style={{ fontSize: 71, fontFamily: 'inherit' }}
        >
          {center}
        </text>
      </svg>
    </div>
  )
}
