import { TableHeader } from './TableHeader'
import { MoreVertIcon, DragHandle } from './TablePrimitives'

// Figma "03 - New Table Row" set. Axes: Type (Rows|Header), Responsive (Desktop|Mobile),
// State (Default|Hover|Selected), Gallery (true|false). Desktop row: pad 24, gap 32,
// border #E1E6EC; fill Default #FFF / Hover #F2F5F8 / Selected #C9EDFF. Header: radius 16,
// no fill, uses Table Header cells. Mobile: vertical stacked card. Mobile Gallery: 2-col grid.
export type RowState = 'default' | 'hover' | 'selected'

const stateFill: Record<RowState, string> = {
  default: 'bg-white',
  hover: 'bg-neutrals-whisper',
  selected: 'bg-hues-sky',
}

// Figma row "Frame 2" (node 1492:5782): a flat run of 11 cells (93px each, gap ~16). REST-
// verified the Default row shows ONLY values — no status Tag pill in the cells. First Figma
// child is rightmost (RTL). 9 numbers + 2 names per the Default variant.
type RowSample = { values: string[] }
const ROWS: RowSample[] = [
  {
    values: [
      '11',
      '10',
      '9',
      '8',
      '7',
      '6',
      '5',
      '4',
      '3',
      'אלונה לי א.',
      'אלונה לי א.',
    ],
  },
  {
    values: [
      '24',
      '21',
      '18',
      '15',
      '12',
      '9',
      '6',
      '3',
      '2',
      'דנה כהן',
      'דנה כהן',
    ],
  },
  {
    values: [
      '7',
      '6',
      '5',
      '4',
      '3',
      '2',
      '1',
      '0',
      '0',
      'יוסי לוי',
      'יוסי לוי',
    ],
  },
]

// ---- Desktop data row -------------------------------------------------------
// Figma: pad 24, gap 32; children [More Vert, Frame 2, Group 6427(drag)]. More Vert first =
// rightmost. Frame 2 gap=16. fill Default #FFF / Hover #F2F5F8 / Selected #C9EDFF; in the
// Selected variant the value text recolors to accent #0075DB.
export function TableRowDesktop({
  state = 'default',
  sample = ROWS[0],
}: {
  state?: RowState
  sample?: RowSample
}) {
  const valueClass = `text-small font-sans leading-tight ${state === 'selected' ? 'text-accent' : 'text-neutrals-charcoal'}`
  return (
    <div
      className={`flex items-center gap-4 px-6 py-6 border-b border-neutrals-silver font-sans last:border-b-0 ${stateFill[state]}`}
      dir="rtl"
    >
      {/* RTL: drag handle on the RIGHT (Figma x≈1278), More Vert on the LEFT (x=24). */}
      <span className="shrink-0">
        <DragHandle />
      </span>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {sample.values.map((v, i) => (
          // 93px cell, value only (no Tag pill — hidden in the Default row). Right-aligned (RTL).
          <div key={i} className="w-[72px] shrink-0 text-right truncate">
            <span className={valueClass}>{v}</span>
          </div>
        ))}
      </div>
      <span className="shrink-0">
        <MoreVertIcon />
      </span>
    </div>
  )
}

export { ROWS as tableRowSamples }
export type { RowSample }

// ---- Desktop header row -----------------------------------------------------
export function TableRowHeader() {
  const cols = Array.from({ length: 11 })
  return (
    <div
      className="flex items-center gap-4 px-6 py-6 rounded-2xl font-sans"
      dir="rtl"
    >
      {/* Right: invisible spacer matching the row's drag handle (10px) — no drag in header. */}
      <span className="shrink-0 w-[10px]" aria-hidden />
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {cols.map((_, i) => (
          // 93px column, label-only, right-aligned to match the value cells.
          <div key={i} className="w-[72px] shrink-0 text-right truncate">
            <TableHeader>כותרת</TableHeader>
          </div>
        ))}
      </div>
      {/* Left: invisible spacer (24px) matching the rows' See More — NO icon in the header. */}
      <span className="shrink-0 w-6" aria-hidden />
    </div>
  )
}

// One stacked mobile cell (Figma "02 - Cell Contianer", Mobile / node 1519:10741).
// REST-verified: inside each cell the More-Vert icon, the chevron, AND the status Tag are
// all visible:false. So the cell shows ONLY the title label + the value text.
function MobileStackCell({
  title = 'כותרת',
  value,
}: {
  title?: string
  value: string
}) {
  return (
    <div className="flex flex-col gap-[3px] py-4 border-b border-neutrals-silver last:border-b-0">
      <span className="text-tiny text-black">{title}</span>
      <span className="text-small text-neutrals-charcoal">{value}</span>
    </div>
  )
}

// ---- Mobile stacked card (node 1519:10741) ----------------------------------
// Figma: w320, r16, fill #FFF, border #E1E6EC, pad L/R/T 24 B 8, drop shadow
// 0/4 blur9 rgba(0,0,0,.09). Stacked cells with group-header strips between them. The
// group-header's sort arrow is visible:false → label only, no arrow.
export function TableRowMobile() {
  return (
    <div className="flex flex-col w-80 max-w-full rounded-2xl bg-white border border-neutrals-silver px-6 pt-6 pb-2 font-sans shadow-[0_4px_9px_rgba(0,0,0,0.09)]">
      <MobileStackCell title="כותרת" value="11" />
      <MobileStackCell title="כותרת" value="10" />
      <div className="flex items-center py-[5px] border-b border-neutrals-silver">
        <span className="text-[15px] text-neutrals-nickel">כותרת</span>
      </div>
      <MobileStackCell title="כותרת" value="9" />
      <MobileStackCell title="כותרת" value="8" />
    </div>
  )
}

// One bordered gallery cell (Figma "02 - Cell Contianer", Gallery / node 3283:9815).
// REST-verified: More-Vert, chevron and the status Tag are all visible:false → the cell
// shows ONLY the title label + value. 144 wide, r8, border #E1E6EC, pad 16.
function GalleryCell({
  title = 'כותרת',
  value = '11',
}: {
  title?: string
  value?: string
}) {
  return (
    <div className="flex flex-col gap-1 rounded-lg border border-neutrals-silver p-4">
      <span className="text-tiny text-black">{title}</span>
      <span className="text-small text-neutrals-charcoal">{value}</span>
    </div>
  )
}

// ---- Mobile gallery card (node 3283:9815) -----------------------------------
// Figma: w320, r16, fill #FFF, border #E1E6EC, pad 24. Five groups, each = a 2-col row of
// GalleryCells + a group-header separator. REST-verified: the separator's sort Icon is
// visible:false → label only, no arrow. Drop shadow 0/4 blur9 rgba(0,0,0,.09).
export function TableRowMobileGallery() {
  const groups = Array.from({ length: 5 })
  return (
    <div className="flex flex-col w-80 max-w-full rounded-2xl bg-white border border-neutrals-silver p-6 gap-6 font-sans shadow-[0_4px_9px_rgba(0,0,0,0.09)]">
      {groups.map((_, i) => (
        <div key={i} className="flex flex-col gap-2">
          <div className="grid grid-cols-2 gap-4">
            <GalleryCell value="11" />
            <GalleryCell value="10" />
          </div>
          {/* separator: label only — sort arrow hidden in Figma */}
          <div className="flex items-center py-[5px]">
            <span className="text-[15px] text-neutrals-nickel">כותרת</span>
          </div>
        </div>
      ))}
    </div>
  )
}
