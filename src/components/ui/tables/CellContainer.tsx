import { CellContent } from './CellContent'
import { MonitorCell, MoreVertIcon, ChevronVector } from './TablePrimitives'

// Figma "02 - Cell Contianer" set. Axes: Responsive (Desktop|Mobile) × Container Type
// (Default | Input | Long Text | Monitoring). Desktop variants are bare inline content;
// Mobile variants wrap content in a bordered (#E1E6EC) cell with a 14px "כותרת" title.
export type ContainerType = 'default' | 'input' | 'longText' | 'monitoring'
export type Responsive = 'desktop' | 'mobile'

interface CellContainerProps {
  type?: ContainerType
  responsive?: Responsive
  title?: string
}

// 24 monitor bars sampled from the Figma Monitoring desktop variant (green w/ a few reds).
const monitorPattern: ('green' | 'red')[] = [
  'green',
  'green',
  'green',
  'green',
  'green',
  'green',
  'green',
  'green',
  'green',
  'red',
  'green',
  'green',
  'green',
  'green',
  'green',
  'green',
  'red',
  'green',
  'red',
  'green',
  'green',
  'green',
  'green',
  'green',
]

function DefaultBody() {
  // Figma child order [Tags, Agent Name]; first Figma child = rightmost under RTL, so the
  // Tags pill is the first DOM child (rightmost) and the name sits to its left. gap=8 (gap-2).
  return (
    <div className="flex items-center gap-2">
      <CellContent type="tags">בזמינות</CellContent>
      <CellContent type="text">אלונה לי א.</CellContent>
    </div>
  )
}

function LongTextBody() {
  return <CellContent type="text">84.228.101.20 | 192.168.10.100</CellContent>
}

function MonitoringBody() {
  return (
    <div className="flex items-end gap-1">
      {monitorPattern.map((c, i) => (
        <MonitorCell key={i} color={c} width={5} />
      ))}
    </div>
  )
}

// Cell Container "Input" variant (node 1492:5670). REST-verified: the label header
// (Frame 904 — "שם שדה" + "(שדה חובה)") is visible:false, as are the leading glyph,
// the grey number tag, the chevron and the search icon. Only the New Input box is
// shown, holding the value "ערך" (right) + a blue "+ הוספת חדש" pill (left). No header.
function InputBody() {
  return (
    <div className="flex items-center justify-between h-10 rounded-lg bg-white border border-neutrals-palladium px-4 w-[434px] max-w-full">
      <span className="text-body text-neutrals-nickel">ערך</span>
      <span className="text-accent text-small">+ הוספת חדש</span>
    </div>
  )
}

function bodyFor(type: ContainerType) {
  switch (type) {
    case 'input':
      return <InputBody />
    case 'longText':
      return <LongTextBody />
    case 'monitoring':
      return <MonitoringBody />
    case 'default':
    default:
      return <DefaultBody />
  }
}

// On mobile the value text is bumped to 18/600 (Figma) for Default and Long Text.
function MobileBody({ type }: { type: ContainerType }) {
  if (type === 'input') return <InputBody />
  if (type === 'longText') {
    return (
      <span className="text-body font-semibold text-neutrals-charcoal">
        84.228.101.20 | 192.168.10.100
      </span>
    )
  }
  if (type === 'monitoring') return <MonitoringBody />
  // default — Figma inner frame gap=4 (gap-1), child order [Tags, name]: tag rightmost,
  // name (18/600) to its left.
  return (
    <div className="flex items-center gap-1">
      <CellContent type="tags">בזמינות</CellContent>
      <span className="text-body font-semibold text-neutrals-charcoal">
        אלונה לי א.
      </span>
    </div>
  )
}

export function CellContainer({
  type = 'default',
  responsive = 'desktop',
  title = 'כותרת',
}: CellContainerProps) {
  if (responsive === 'mobile') {
    return (
      <div className="flex flex-col gap-[3px] py-4 border-b border-neutrals-silver font-sans w-[354px] max-w-full">
        <span className="text-tiny text-black">{title}</span>
        {type === 'input' ? (
          // Mobile Input: title + the input component directly, no More Vert icon column.
          <InputBody />
        ) : (
          <div className="flex items-center gap-2">
            {/* Icon group: More Vert (+ chevron only on the Default variant, Figma gap 3) */}
            <span className="shrink-0 inline-flex items-center gap-[3px]">
              <MoreVertIcon />
              {type === 'default' && <ChevronVector />}
            </span>
            <div className="flex-1 min-w-0">
              <MobileBody type={type} />
            </div>
          </div>
        )}
      </div>
    )
  }
  return (
    <div className="inline-flex items-center font-sans">{bodyFor(type)}</div>
  )
}
