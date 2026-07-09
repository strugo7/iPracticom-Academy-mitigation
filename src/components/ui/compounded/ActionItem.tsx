// Figma set "IVR Action Item Element" (1374:1539) — an IVR keypad action node.
// 414px wide card, radius 8, white fill. A light-blue accent bar (#C9EDFF) runs down the
// RIGHT inner edge (rounded). A dark "Dial" badge (charcoal pill, white number) overlaps the
// TOP-LEFT corner. Header row: a kebab (3 vertical blue dots) on the LEFT, and on the RIGHT
// the title — Zero: "בחר פעולה" + caret; Default/Selected: bold "נתב" + "|" + a placeholder
// ("הכנס שם פריט כאן") + caret.
// States:
//   zero / zeroHover : header only (~70px). Zero Hover = 1px #2EB4FF border.
//   default / hover / selected / selectedHover : header + a dropdown field + a footer
//       "הוסף הקשה ופעולה" with a gradient (+) button. Default field shows
//       "בחרו או צרפו הקלטה"; Selected field shows "שם פריט". Hover = 2px #2EB4FF border.

export type ActionItemState =
  'zero' | 'zeroHover' | 'default' | 'hover' | 'selected' | 'selectedHover'

interface ActionItemProps {
  state?: ActionItemState
  digit?: number | string
  /** bold action label in the header (Default/Selected), e.g. "נתב" */
  label?: string
  /** header placeholder after the "|" divider */
  titlePlaceholder?: string
  /** body field text */
  fieldText?: string
  /** right accent bar color (Tailwind class), per Action Type */
  accentClass?: string
  /** label shown in the ZERO state header (default "בחר פעולה"); e.g. "חזרה לתפריט ראשי" */
  zeroLabel?: string
  /** show the charcoal Dial badge (Back / Back To main hide it — Figma Dial visible:false) */
  showDial?: boolean
}

const isHover = (s: ActionItemState) =>
  s === 'hover' || s === 'selectedHover' || s === 'zeroHover'
const isZero = (s: ActionItemState) => s === 'zero' || s === 'zeroHover'
const isSelected = (s: ActionItemState) =>
  s === 'selected' || s === 'selectedHover'

function Kebab() {
  return (
    <span className="flex flex-col items-center gap-[3px]" aria-hidden>
      <span className="h-1 w-1 rounded-full bg-accent" />
      <span className="h-1 w-1 rounded-full bg-accent" />
      <span className="h-1 w-1 rounded-full bg-accent" />
    </span>
  )
}

// Figma caret = a FILLED blue down-triangle ("Color" 10x5 / "Icon/Arrow Drop Down"),
// not a stroked chevron.
function Caret() {
  return (
    <svg width="10" height="5" viewBox="0 0 10 5" fill="none" aria-hidden>
      <path d="M0 0H10L5 5L0 0Z" fill="#0075DB" />
    </svg>
  )
}

function GradientPlus() {
  return (
    <span
      className="flex h-5 w-5 items-center justify-center rounded-full bg-accent-gradient text-white"
      aria-hidden
    >
      <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
        <path
          d="M4.5 1v7M1 4.5h7"
          stroke="#fff"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  )
}

export function ActionItem({
  state = 'default',
  digit = 1,
  label = 'נתב',
  titlePlaceholder = 'הכנס שם פריט כאן',
  fieldText,
  accentClass = 'bg-hues-sky',
  zeroLabel = 'בחר פעולה',
  showDial = true,
}: ActionItemProps) {
  const zero = isZero(state)
  const hover = isHover(state)
  const selected = isSelected(state)
  const border = hover ? 'border-hues-indigo' : 'border-neutrals-silver'
  const borderWidth = hover && !zero ? 'border-2' : 'border'
  const body = fieldText ?? (selected ? 'שם פריט' : 'בחרו או צרפו הקלטה')
  // REST: a real/selected value is charcoal #181D24; the empty-state placeholder is nickel #9EA5AD.
  const bodyColor =
    selected || fieldText ? 'text-neutrals-charcoal' : 'text-neutrals-nickel'

  return (
    // The top padding only exists to let the Dial badge straddle the border. With no dial
    // (Back / Back To main) there's no dial → no top gap, so the header centres in the card.
    <div className={`relative w-[414px] ${showDial ? 'pt-4' : ''}`} dir="rtl">
      {/* Dial badge (34px charcoal pill) — STRADDLES the top-right border: ~half above the
          card edge, ~half below (Figma: dial centered on the top border, ~9px from the right).
          Hidden for Back / Back To main (Figma Dial visible:false). */}
      {showDial && (
        <span className="absolute top-0 right-[9px] z-10 flex h-[34px] min-w-[34px] items-center justify-center rounded-[20px] bg-neutrals-charcoal px-[13px] text-body font-sans text-white shadow-[0_4px_12px_rgba(0,0,0,0.05)]">
          {digit}
        </span>
      )}

      <div
        className={`relative overflow-hidden rounded-lg bg-white ${borderWidth} ${border} ${zero ? 'pb-4' : ''}`}
      >
        {/* accent bar runs down the RIGHT inner edge (rect r[10,0,0,10] → left corners rounded) */}
        <span
          className={`absolute right-0 top-0 bottom-0 w-1 rounded-l-[10px] ${accentClass}`}
        />

        {/* header row (RTL): title group on the RIGHT (first child), kebab on the LEFT (last).
            REST: title x≈right edge, kebab x≈left. Caret sits just left of the bold label. */}
        <div className="flex items-center justify-between gap-2 px-6 pt-6 pb-[5px]">
          <div className="flex items-center gap-2">
            {zero ? (
              <>
                {/* zero label — 18/600 #000000 (bold black). */}
                <span className="text-body-bold font-sans text-black">
                  {zeroLabel}
                </span>
                <Caret />
              </>
            ) : (
              <>
                <span className="text-body-bold font-sans text-black">
                  {label}
                </span>
                <Caret />
                <span className="text-body font-sans text-neutrals-silver">
                  |
                </span>
                <span className="text-body font-sans text-neutrals-nickel">
                  {titlePlaceholder}
                </span>
              </>
            )}
          </div>
          <Kebab />
        </div>

        {!zero && (
          <div className="flex flex-col gap-3 px-6 pb-4">
            {/* body dropdown field — text right-aligned, caret on the LEFT (RTL) */}
            <div className="flex items-center gap-2 rounded-lg border border-neutrals-palladium bg-white px-4 py-2">
              <span
                className={`flex-1 text-right text-body font-sans ${bodyColor}`}
              >
                {body}
              </span>
              <Caret />
            </div>
            {/* footer (Frame 135, pad-x 17): right-aligned cluster — gradient (+) is the
                RIGHTMOST element, the label "הוסף הקשה ופעולה" sits to its LEFT (REST: plus
                x≈1159 > text x≈1012). In RTL the first child renders rightmost. */}
            <div className="flex items-center gap-2 pt-1">
              <GradientPlus />
              <span className="text-body font-sans text-black">
                הוסף הקשה ופעולה
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
