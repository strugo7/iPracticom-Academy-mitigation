import { type ReactNode } from 'react'

type Placement = 'top' | 'bottom' | 'right' | 'left'
type TooltipTheme = 'accent' | 'light'

interface TooltipProps {
  content: ReactNode
  placement?: Placement
  /** accent = Figma Default (blue, 16px white text). light = Network/Graph rich card. */
  theme?: TooltipTheme
  /** When provided, visibility is CONTROLLED (click-to-toggle); hover is ignored.
   *  When omitted, the tooltip shows on hover (default Figma behavior). */
  open?: boolean
  children: ReactNode
}

// Figma "02 - ToolTip":
//  Default  → accent #0075DB bg, r=4, white text 16px, pad 16, triangle pointer (Polygon).
//  Network/Graph → white card r=8, silver border 2px, pad L24 R24 T16 B24.
const boxPos: Record<Placement, string> = {
  top: 'bottom-full mb-2 right-1/2 translate-x-1/2',
  bottom: 'top-full mt-2 right-1/2 translate-x-1/2',
  right: 'left-full ml-2 top-1/2 -translate-y-1/2',
  left: 'right-full mr-2 top-1/2 -translate-y-1/2',
}

// accent theme: a solid blue triangle flush on the box edge.
const accentArrow: Record<Placement, string> = {
  top: 'top-full right-1/2 translate-x-1/2 -mt-px border-x-[8px] border-x-transparent border-t-[9px] border-t-accent',
  bottom:
    'bottom-full right-1/2 translate-x-1/2 -mb-px border-x-[8px] border-x-transparent border-b-[9px] border-b-accent',
  right:
    'right-full top-1/2 -translate-y-1/2 -mr-px border-y-[8px] border-y-transparent border-r-[9px] border-r-accent',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-px border-y-[8px] border-y-transparent border-l-[9px] border-l-accent',
}
// light theme (Network/Graph): a WHITE triangle with a 2px #E1E6EC outline (REST: white
// polygon + #E1E6EC w2). Built from a larger silver triangle behind + a white fill in front,
// the fill nudged toward the card so the silver shows as a border on the slanted edges + tip.
const lightOutline: Record<Placement, string> = {
  top: 'top-full right-1/2 translate-x-1/2 border-x-[9px] border-x-transparent border-t-[11px] border-t-neutrals-silver',
  bottom:
    'bottom-full right-1/2 translate-x-1/2 border-x-[9px] border-x-transparent border-b-[11px] border-b-neutrals-silver',
  right:
    'right-full top-1/2 -translate-y-1/2 border-y-[9px] border-y-transparent border-r-[11px] border-r-neutrals-silver',
  left: 'left-full top-1/2 -translate-y-1/2 border-y-[9px] border-y-transparent border-l-[11px] border-l-neutrals-silver',
}
const lightFill: Record<Placement, string> = {
  top: 'top-full right-1/2 translate-x-1/2 -mt-[2px] border-x-[8px] border-x-transparent border-t-[9px] border-t-white',
  bottom:
    'bottom-full right-1/2 translate-x-1/2 -mb-[2px] border-x-[8px] border-x-transparent border-b-[9px] border-b-white',
  right:
    'right-full top-1/2 -translate-y-1/2 -mr-[2px] border-y-[8px] border-y-transparent border-r-[9px] border-r-white',
  left: 'left-full top-1/2 -translate-y-1/2 -ml-[2px] border-y-[8px] border-y-transparent border-l-[9px] border-l-white',
}

// Figma: Default shadow 0/14/24 black@14%; Network/Graph shadow 0/11/30 #040D37@5% (shadow-card).
// accent: Figma "Type=Default" popup — 432px, r4, #0075DB, pad 16, 16px white text.
const themeBox: Record<TooltipTheme, string> = {
  accent:
    'rounded bg-accent p-4 text-small leading-6 text-white w-[432px] max-w-[432px] shadow-[0px_14px_24px_0px_rgba(0,0,0,0.14)]',
  light:
    'rounded-lg bg-white border-2 border-neutrals-silver px-6 pt-4 pb-6 text-neutrals-charcoal shadow-card w-max max-w-[443px]',
}

export function Tooltip({
  content,
  placement = 'top',
  theme = 'accent',
  open,
  children,
}: TooltipProps) {
  const controlled = open !== undefined
  // Visibility classes: controlled → driven by `open`; uncontrolled → hover.
  const vis = controlled
    ? open
      ? 'opacity-100 scale-100'
      : 'opacity-0 scale-95 pointer-events-none'
    : 'opacity-0 scale-95 pointer-events-none group-hover:opacity-100 group-hover:scale-100'
  return (
    <span className="relative inline-flex group">
      {children}
      <span
        role="tooltip"
        className={`absolute z-50 ${boxPos[placement]} ${themeBox[theme]} font-sans transition-all duration-150 ${vis}`}
      >
        {content}
        {theme === 'accent' ? (
          <span
            className={`absolute h-0 w-0 ${accentArrow[placement]}`}
            aria-hidden="true"
          />
        ) : (
          <>
            <span
              className={`absolute h-0 w-0 ${lightOutline[placement]}`}
              aria-hidden="true"
            />
            <span
              className={`absolute h-0 w-0 ${lightFill[placement]}`}
              aria-hidden="true"
            />
          </>
        )}
      </span>
    </span>
  )
}
