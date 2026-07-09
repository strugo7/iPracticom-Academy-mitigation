/**
 * הפאנל המותגי של מסך ההתחברות — 1:1 מ-design-export/Login.dc.html:
 * גרדיאנט 45° + מוטיב טופולוגיית רשת + משושים; דסקטופ = פאנל צד, מובייל = באנר עליון.
 */
import { Logo } from '@/components/ui'

/** מוטיב הרשת (צמתים + חיבורים מונפשים) — SVG מקורי מה-export. */
function NetworkMotif() {
  return (
    <svg
      viewBox="0 0 520 800"
      preserveAspectRatio="xMidYMid slice"
      className="absolute inset-0 h-full w-full opacity-50"
      aria-hidden="true"
    >
      <g stroke="rgba(255,255,255,.34)" strokeWidth="1.5" fill="none">
        <path
          className="lg-node-motif"
          strokeDasharray="5 7"
          d="M120 150 L300 230 M300 230 L430 140 M300 230 L250 420 M250 420 L90 470 M250 420 L380 540 M380 540 L450 700 M380 540 L210 660 M90 470 L150 660"
        />
      </g>
      <g fill="#fff">
        {(
          [
            [120, 150, 5, 0],
            [430, 140, 5, 0.4],
            [250, 420, 6, 0.8],
            [90, 470, 5, 1.2],
            [380, 540, 5, 1.6],
            [450, 700, 4, 2],
            [210, 660, 4, 2.4],
            [150, 660, 4, 1],
          ] as const
        ).map(([cx, cy, r, delay]) => (
          <circle
            key={`${cx}-${cy}`}
            cx={cx}
            cy={cy}
            r={r}
            style={{ animation: `lgPulse 3s ease-in-out ${delay}s infinite` }}
          />
        ))}
      </g>
      <g fill="rgba(255,255,255,.5)">
        <circle cx="300" cy="230" r="9" />
      </g>
    </svg>
  )
}

const HEX_CLIP = 'polygon(50% 0,93% 25%,93% 75%,50% 100%,7% 75%,7% 25%)'

/** אייקון טופולוגיית הרשת שבתוך המשושה — SVG מקורי מה-export. */
function NetworkIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="2.4" />
      <circle cx="5" cy="19" r="2.4" />
      <circle cx="19" cy="19" r="2.4" />
      <path d="M12 7.4v5M11 13 6.5 17M13 13l4.5 4" />
    </svg>
  )
}

function LockIcon({ size }: { size: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <rect x="3" y="11" width="18" height="11" rx="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  )
}

export function BrandPanel() {
  return (
    <div className="relative order-first flex flex-none flex-col overflow-hidden bg-[linear-gradient(45deg,#33B1FF_0%,#282FEF_100%)] text-white lg:order-2 lg:w-[46%] lg:max-w-[620px]">
      <NetworkMotif />
      {/* זוהרי משושים — מיקומים לוגיים כמו ב-export (inset-inline) */}
      <span
        className="absolute -top-[60px] h-60 w-60 bg-white/10 end-[-70px]"
        style={{ clipPath: HEX_CLIP }}
        aria-hidden="true"
      />
      <span
        className="absolute bottom-[90px] h-40 w-40 bg-white/[.07] start-[-50px]"
        style={{ clipPath: HEX_CLIP }}
        aria-hidden="true"
      />

      {/* דסקטופ: תוכן מלא */}
      <div className="relative hidden flex-1 flex-col justify-center px-[54px] py-14 lg:flex">
        <span
          className="lg-float mb-[26px] inline-flex h-16 w-16 items-center justify-center bg-white/[.18]"
          style={{ clipPath: HEX_CLIP }}
        >
          <NetworkIcon size={32} />
        </span>
        <Logo variant="white" height={30} className="mb-6 self-start" />
        <h2 className="mb-3.5 max-w-[380px] text-[34px] font-semibold leading-[1.25]">
          הידע הארגוני שלכם,
          <br />
          תחת קורת גג אחת
        </h2>
        <p className="max-w-[360px] text-[16px] leading-[1.7] text-[#DCEEFF]">
          הכשרות, מבחנים ומדריכים — במקום אחד, מאובטח ומסודר. כל מה שצוות התמיכה
          צריך כדי לעבוד בראש שקט.
        </p>
      </div>
      <div className="relative hidden items-center gap-2 border-t border-white/[.16] px-[54px] py-[22px] text-[13px] text-[#DCEEFF] lg:flex">
        <LockIcon size={15} />© iPracticom Academy — לשימוש פנימי בלבד
      </div>

      {/* מובייל: באנר עליון מצומצם */}
      <div className="relative flex items-center gap-3.5 px-[26px] pb-6 pt-[26px] lg:hidden">
        <span
          className="inline-flex h-[46px] w-[46px] flex-none items-center justify-center bg-white/20"
          style={{ clipPath: HEX_CLIP }}
        >
          <NetworkIcon size={24} />
        </span>
        <div>
          <Logo variant="white" height={22} />
          <div className="mt-1 text-[12.5px] text-[#DCEEFF]">
            מרכז ההכשרה הארגוני
          </div>
        </div>
      </div>
    </div>
  )
}
