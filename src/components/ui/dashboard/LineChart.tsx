// Figma "Line Charts" set (node 1469:2982) — 5 variants:
//   "1 Line" / "Down" / "2 Lines" / "3 Lines" / "4 Graphs".
// Each variant is an exact reproduction of the Figma vector geometry (the path
// data + gradient stops below are copied verbatim from the Figma SVG export).
// Colors come straight from the design tokens / exact Figma hex:
//   line (blue)   = accent-gradient #282FEF -> #33B1FF
//   blue fill     = #37FFA8 -> rgba(80,162,255,0)
//   green stroke  = hues.green #51D5A5,  green fill  #37FFB7 -> rgba(80,255,234,0)
//   red stroke    = caution #C94236,     red fill    #FF3737 -> rgba(255,111,80,0)
//   yellow stroke = warning #F1C21B,     yellow fill #F6D971 -> #F1C21B
//   gray dashed   = neutrals.nickel #9EA5AD
// The SVGs are authored at the native Figma viewBox and scale to fit their box
// via preserveAspectRatio="none" so they fill any card width like in Figma.

export type LineVariant = '1 Line' | 'Down' | '2 Lines' | '3 Lines' | '4 Graphs'

interface LineChartProps {
  variant: LineVariant
  /** rendered width in px (or CSS length); defaults to fill container */
  width?: number | string
  height?: number
  className?: string
}

// page-unique id helper so multiple charts don't clash on <defs> ids
let _uid = 0
function nextId(prefix: string) {
  return `${prefix}-${++_uid}`
}

function OneLine({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1076 106"
      fill="none"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <path
        opacity="0.47"
        d="M14.7852 83.1803C61.4883 69.6912 622.006 -38.241 1070.05 16.8534V53.8226V87.7891H0L14.7852 83.1803Z"
        fill={`url(#${id}-f)`}
      />
      <path
        d="M33.5115 81.6896C205.97 31.0529 859.405 -28.5832 1063.99 20.0262"
        stroke={`url(#${id}-s)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${id}-s`}
          x1="555.914"
          y1="-37.2882"
          x2="543.833"
          y2="118.937"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#282FEF" />
          <stop offset="1" stopColor="#33B1FF" />
        </linearGradient>
        <linearGradient
          id={`${id}-f`}
          x1="541.445"
          y1="-102.87"
          x2="541.399"
          y2="95.2649"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFA8" />
          <stop offset="1" stopColor="#50A2FF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function Down({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1074 88"
      fill="none"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <path
        opacity="0.47"
        d="M490.294 2H2V88H1071.11V77.3608H531.413L490.294 2Z"
        fill={`url(#${id}-f)`}
      />
      <path
        d="M2 2H490.294L531.413 73.7491H1071.11"
        stroke={`url(#${id}-s)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${id}-f`}
          x1="542.968"
          y1="-101.581"
          x2="542.923"
          y2="95.4336"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFA8" />
          <stop offset="1" stopColor="#50A2FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-s`}
          x1="543.986"
          y1="-38.37"
          x2="531.691"
          y2="122.168"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#282FEF" />
          <stop offset="1" stopColor="#33B1FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function TwoLines({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1088 87"
      fill="none"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <path
        opacity="0.47"
        d="M588.103 7.28146C430.623 -14.446 138.418 21.199 12.0012 41.7374V83.9853H1081.13V37.2786C1070.9 38.7649 1029.12 41.7374 943.876 41.7374C837.835 41.7374 785.455 34.5105 590.92 7.67019L588.103 7.28146Z"
        fill={`url(#${id}-gf)`}
      />
      <path
        d="M14.057 41.7374C139.625 21.199 429.865 -14.446 586.286 7.28146C781.813 34.4408 833.833 41.7374 939.668 41.7374C1024.34 41.7374 1065.83 38.7649 1076 37.2786"
        stroke="#51D5A5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.47"
        d="M12.0012 36.2152C12.0012 36.2152 83.2676 24.86 158.727 25.2389C234.186 25.6178 461.805 37.7316 461.805 37.7316C461.805 37.7316 532.734 40.8548 608.746 37.7316C772.688 30.9957 1076 30.9714 1076 30.9714V68.2357H12.0012V36.2152Z"
        fill={`url(#${id}-bf)`}
      />
      <path
        d="M12.0012 36.2121C12.0012 36.2121 83.2676 24.8568 158.727 25.2357C234.186 25.6146 461.805 37.7285 461.805 37.7285C461.805 37.7285 532.734 40.8516 608.746 37.7285C772.688 30.9925 1076 30.9682 1076 30.9682"
        stroke={`url(#${id}-bs)`}
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${id}-gf`}
          x1="552.98"
          y1="-92.753"
          x2="552.941"
          y2="90.916"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#6BFF37" />
          <stop offset="1" stopColor="#7EFF50" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-bf`}
          x1="550.384"
          y1="-36.3493"
          x2="550.37"
          y2="72.3367"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFA8" />
          <stop offset="1" stopColor="#50A2FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-bs`}
          x1="551.397"
          y1="8.8278"
          x2="550.635"
          y2="48.8219"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#282FEF" />
          <stop offset="1" stopColor="#33B1FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function ThreeLines({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1091 92"
      fill="none"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <path
        opacity="0.47"
        d="M12.5109 57.0196C138.531 29.6157 429.814 -17.9356 586.791 11.0496C783.021 47.2811 835.227 57.0196 941.439 57.0196C1026.41 57.0196 1068.06 53.0561 1078.26 51.0744V91.3394H12.541L12.5109 57.0196Z"
        fill={`url(#${id}-rf)`}
      />
      <path
        d="M12.5668 57.0204C138.585 29.6181 429.867 -17.9392 586.849 11.0495C783.077 47.2854 835.284 57.0204 941.499 57.0204C1026.47 57.0204 1068.12 53.0545 1078.32 51.0715"
        stroke="#C94236"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M10.5092 54.6333C10.5092 54.6333 81.8325 26.6986 157.352 27.6307C232.872 28.5629 460.672 58.3637 460.672 58.3637C460.672 58.3637 531.657 66.0469 607.731 58.3637C683.804 50.6805 837.727 8.55594 915.327 12.0817C992.927 15.6075 1075.36 41.7331 1075.36 41.7331"
        stroke="#51D5A5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.47"
        d="M12.9113 54.7678C12.9113 54.7678 84.2334 26.8335 159.749 27.7643C235.265 28.6951 463.073 58.501 463.073 58.501C463.073 58.501 534.055 66.1877 610.131 58.501C686.207 50.8143 840.121 8.69767 917.729 12.2207C995.326 15.7438 1077.76 41.8765 1077.76 41.8765V73.3439H12.5109L12.9113 54.7678Z"
        fill={`url(#${id}-gf)`}
      />
      <path
        opacity="0.47"
        d="M10.5092 49.5517C10.5092 49.5517 82.1764 42.1781 158.06 42.4242C233.944 42.6703 462.843 50.5364 462.843 50.5364C462.843 50.5364 534.17 52.5644 610.61 50.5364C687.051 48.5083 841.715 37.3893 919.689 38.3199C997.664 39.2506 1080.49 46.1466 1080.49 46.1466V70.3442H10.5092V49.5517Z"
        fill={`url(#${id}-bf)`}
      />
      <path
        d="M10.5092 49.5498C10.5092 49.5498 82.1764 42.1762 158.06 42.4222C233.944 42.6683 462.843 50.5344 462.843 50.5344C462.843 50.5344 534.17 52.5625 610.61 50.5344C687.051 48.5064 841.715 37.3873 919.689 38.318C997.664 39.2486 1080.49 46.1447 1080.49 46.1447"
        stroke={`url(#${id}-bs)`}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${id}-rf`}
          x1="551.779"
          y1="-123.782"
          x2="551.708"
          y2="123.961"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF3737" />
          <stop offset="1" stopColor="#FF6F50" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-gf`}
          x1="551.526"
          y1="-56.4959"
          x2="551.505"
          y2="78.4355"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFB7" />
          <stop offset="1" stopColor="#50FFEA" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-bf`}
          x1="551.92"
          y1="2.43194"
          x2="551.914"
          y2="73.0074"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFA8" />
          <stop offset="1" stopColor="#50A2FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-bs`}
          x1="552.939"
          y1="31.7679"
          x2="552.619"
          y2="57.7436"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#282FEF" />
          <stop offset="1" stopColor="#33B1FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}

function FourGraphs({ id }: { id: string }) {
  return (
    <svg
      viewBox="0 0 1090 89"
      fill="none"
      preserveAspectRatio="none"
      width="100%"
      height="100%"
    >
      <path
        opacity="0.47"
        d="M587.214 9.54363C429.978 -19.4313 138.227 28.1034 12.0052 55.4926V88.8237H1079.48V49.5466C1069.26 51.5286 1027.55 55.4926 942.436 55.4926C836.559 55.4926 784.261 45.8552 590.027 10.0619L587.214 9.54363Z"
        fill={`url(#${id}-rf)`}
      />
      <path
        d="M14.0618 55.4926C140.283 28.1034 432.035 -19.4313 589.271 9.54363C785.815 45.7623 838.106 55.4926 944.493 55.4926C1029.6 55.4926 1071.32 51.5286 1081.53 49.5466"
        stroke="#C94236"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.0616 55.4926C140.283 40.1748 432.035 13.5903 589.271 29.795C785.815 50.0508 838.106 55.4926 944.493 55.4926C1029.6 55.4926 1071.32 53.2757 1081.53 52.1672"
        stroke="#9EA5AD"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray="6 5"
      />
      <path
        opacity="0.15"
        d="M587.214 39.588C429.978 25.9246 138.227 48.3401 12.0052 61.2557V87.8235H1079.48V58.4518C1069.26 59.3865 1027.55 61.2557 942.436 61.2557C836.559 61.2557 784.261 56.7111 590.027 39.8324L587.214 39.588Z"
        fill={`url(#${id}-yf)`}
      />
      <path
        d="M14.0616 61.2557C140.283 48.3401 432.035 25.9246 589.271 39.588C785.815 56.6673 838.106 61.2557 944.493 61.2557C1029.6 61.2557 1071.32 59.3865 1081.53 58.4518"
        stroke="#F1C21B"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        opacity="0.47"
        d="M12.0052 27.7819C12.0052 27.7819 83.5042 12.4297 159.21 12.942C234.916 13.4543 463.277 29.832 463.277 29.832C463.277 29.832 534.438 34.0545 610.698 29.832C686.959 25.6095 841.261 2.45894 919.052 4.39663C996.844 6.33432 1079.48 20.6922 1079.48 20.6922V71.0731H12.0052V27.7819Z"
        fill={`url(#${id}-gf)`}
      />
      <path
        d="M12.0052 27.7819C12.0052 27.7819 83.405 12.4297 159.006 12.942C234.606 13.4543 462.651 29.832 462.651 29.832C462.651 29.832 533.712 34.0545 609.868 29.832C686.023 25.6095 840.11 2.45894 917.793 4.39663C995.477 6.33432 1077.99 20.6922 1077.99 20.6922"
        stroke="#51D5A5"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <defs>
        <linearGradient
          id={`${id}-rf`}
          x1="552.146"
          y1="-123.858"
          x2="552.076"
          y2="121.075"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#FF3737" />
          <stop offset="1" stopColor="#FF6F50" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id={`${id}-yf`}
          x1="552.146"
          y1="-23.319"
          x2="552.13"
          y2="92.1819"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#F6D971" />
          <stop offset="1" stopColor="#F1C21B" />
        </linearGradient>
        <linearGradient
          id={`${id}-gf`}
          x1="552.146"
          y1="-70.3242"
          x2="552.121"
          y2="76.6178"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#37FFB7" />
          <stop offset="1" stopColor="#50FFEA" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

export function LineChart({
  variant,
  width = '100%',
  height = 86,
  className = '',
}: LineChartProps) {
  const id = nextId('lc')
  return (
    <div className={className} style={{ width, height }}>
      {variant === '1 Line' && <OneLine id={id} />}
      {variant === 'Down' && <Down id={id} />}
      {variant === '2 Lines' && <TwoLines id={id} />}
      {variant === '3 Lines' && <ThreeLines id={id} />}
      {variant === '4 Graphs' && <FourGraphs id={id} />}
    </div>
  )
}

export const LINE_VARIANTS: LineVariant[] = [
  '1 Line',
  'Down',
  '2 Lines',
  '3 Lines',
  '4 Graphs',
]
