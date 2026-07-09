import { Name } from './Name'

export type HeaderAction = 'save' | 'callEnd' | 'play' | 'uTurn'

interface HeaderProps {
  breadcrumbs?: string[]
  primaryLabel?: string
  title?: string
  tag?: string
  /** which round action icons to show (Figma examples vary the count) + the order */
  actions?: HeaderAction[]
  /** show the primary gradient pill ("כיתוב") — toggleable like in Figma */
  showPrimary?: boolean
}

/* Icon/Chevron Left — 18x18, vector #181D24 */
function ChevronLeftIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M11 4.5 6.5 9l4.5 4.5"
        stroke="#181D24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Icon/Arrow East — 24x24, vector #181D24 (back button) */
function ArrowEastIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 12h16M13 5l7 7-7 7"
        stroke="#181D24"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

/* Icon/Call End — 24x24, #0075DB (circle button) */
function CallEndIcon({ color = '#0075DB' }: { color?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M9.5 7c-2.6 0-5 .6-6.9 1.7-.4.2-.6.6-.6 1V11c0 .3.1.5.3.7l1.7 1.3c.2.2.5.2.7.1.9-.4 1.9-.7 2.9-.8.3 0 .5-.3.5-.6v-1.4c1.2-.4 2.6-.4 3.8 0v1.4c0 .3.2.6.5.6 1 .1 2 .4 2.9.8.2.1.5.1.7-.1l1.7-1.3c.2-.2.3-.4.3-.7V9.7c0-.4-.2-.8-.6-1C14.5 7.6 12.1 7 9.5 7Z"
        fill={color}
      />
    </svg>
  )
}

/* Icon/Save — 24x24, #0075DB */
function SaveIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M5 3h11l3 3v15a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Zm2 2v5h8V5H7Zm6 1h-2v3h2V6Z"
        fill="#0075DB"
      />
    </svg>
  )
}

/* Icon/Play — 24x24, #0075DB */
function PlayIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M8 5v14l11-7L8 5Z" fill="#0075DB" />
    </svg>
  )
}

/* Icon/Arrow U Turn Left — 24x24, #0075DB */
function UTurnLeftIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M8 7 4 11l4 4M4 11h10a5 5 0 0 1 0 10h-3"
        stroke="#0075DB"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  )
}

/* 00 - Page / Breadcrumbs instance. Figma: the row is right-aligned — the crumb text
   sits on the right and the Back Button (Arrow East) is the rightmost element, flush to
   the right edge so it lines up with the start (right edge) of the Name title below.
   Frame gap = 8 between the crumb row and the back button. */
function Breadcrumbs({ items }: { items: string[] }) {
  // RTL: render reversed so the last item (Home / "ראשי") lands rightmost.
  const reversed = [...items].reverse()
  return (
    <div className="flex items-center gap-2 self-start">
      {/* Back Button (Arrow East) — rightmost in RTL, flush to the right edge so it
          lines up with the start (right edge) of the Name title below. */}
      <button
        type="button"
        className="flex items-center justify-center w-6 h-6 rounded-full bg-transparent shrink-0"
        aria-label="חזרה"
      >
        <ArrowEastIcon />
      </button>
      <div className="flex items-center gap-1">
        {reversed.map((label, i) => (
          <div key={i} className="flex items-center gap-1">
            <span className="text-small font-sans text-accent">{label}</span>
            {i < reversed.length - 1 && <ChevronLeftIcon />}
          </div>
        ))}
      </div>
    </div>
  )
}

/* Circular white icon button — 56x56 (02 - New Buttons) */
function CircleButton({
  children,
  label,
}: {
  children: React.ReactNode
  label: string
}) {
  return (
    <button
      type="button"
      aria-label={label}
      className="flex items-center justify-center w-14 h-14 rounded-full bg-white shadow-[0_6px_13px_rgba(0,0,0,0.1)]"
    >
      {children}
    </button>
  )
}

// Round action icons, keyed (Figma "Frame 95" set). Order here = Figma left→right.
const ACTION_ICON: Record<
  HeaderAction,
  { label: string; icon: React.ReactNode }
> = {
  save: { label: 'שמירה', icon: <SaveIcon /> },
  callEnd: { label: 'ניתוק', icon: <CallEndIcon color="#0075DB" /> },
  play: { label: 'ניגון', icon: <PlayIcon /> },
  uTurn: { label: 'חזרה', icon: <UTurnLeftIcon /> },
}

export function Header({
  breadcrumbs = ['כיתוב', 'כיתוב', 'כיתוב', 'ראשי'],
  primaryLabel = 'כיתוב',
  title = 'נתב 1',
  tag = 'פעיל',
  actions = ['save', 'callEnd', 'play', 'uTurn'],
  showPrimary = true,
}: HeaderProps) {
  return (
    <div
      dir="rtl"
      // Figma HEADER (node 1942:22254): FIXED 136px tall. Rectangle 5 = white fill + a 1px
      // #E1E6EC border on the BOTTOM ONLY (no full frame, no rounding). Children are pinned
      // to the exact Figma y-coordinates: breadcrumbs y=22 (top-right), name y=63, action
      // buttons y=110 (left) → straddling the 136 bottom edge and floating ~30px below it.
      className="relative w-full h-[136px] bg-white border-b border-neutrals-silver"
    >
      {/* Right cluster: breadcrumbs (y=22) + name (y=63), pinned top-right (px-8 ≈ x=32).
          items-start = RIGHT in RTL, so the breadcrumb back-arrow and the title share the
          same right edge (as in Figma). */}
      <div className="absolute top-[22px] right-8 flex flex-col items-start gap-px">
        <Breadcrumbs items={breadcrumbs} />
        <Name state="default" title={title} tag={tag} />
      </div>

      {/* Left cluster: action buttons (Frame 95, node 1942:19424) at y=110 → they float
          across the bottom edge (~30px below). Figma order left→right is fixed:
          pill, save, call-end, play, u-turn (x = 0, 110, 193, 276, 359). This cluster is
          forced dir="ltr" so the flex lays the children out in that exact source order —
          inheriting the header's RTL would mirror the icons. gap = 27px matches Figma. */}
      <div
        dir="ltr"
        className="absolute top-[110px] left-8 flex items-center gap-[27px]"
      >
        {/* Primary pill — gradient, leftmost (x=0). Toggleable (Figma examples vary it). */}
        {showPrimary && (
          <button
            type="button"
            className="inline-flex items-center justify-center rounded-[20px] bg-accent-gradient px-6 py-2 text-small font-semibold text-white leading-5 shrink-0"
          >
            <span>{primaryLabel}</span>
          </button>
        )}
        {actions.map((a) => (
          <CircleButton key={a} label={ACTION_ICON[a].label}>
            {ACTION_ICON[a].icon}
          </CircleButton>
        ))}
      </div>
    </div>
  )
}
