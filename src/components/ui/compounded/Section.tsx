// Figma set "Section" (2880:17341) — a collapsible config section card.
// Card: 945 wide, radius 16, white fill, border #E1E6EC, pad T/B 16, gap 16.
// Header row (pad L/R 24): chevron, "שם סקשן" title (18/600 charcoal), and a 24px
// checkbox (filled accent #0075DB radius 3 with a white check).
// Property 1 states:
//   Minimized (#FFFFFF) / Selected (#F4FBFF) / Hover (#F2F5F8) → header only, 64 tall.
//   Opened (InfraStructure / Instument / INFO) → header + N labeled dropdown input rows,
//       each separated by a top hairline (#E1E6EC). Field label is 16/600, hint 16/lead.

export type SectionState = 'minimized' | 'selected' | 'hover' | 'opened'
export type SectionType = 'default' | 'infrastructure' | 'instrument' | 'info'

interface SectionFieldDef {
  label: string
  placeholder?: string
}

interface SectionProps {
  state?: SectionState
  type?: SectionType
  title?: string
  checked?: boolean
  onToggle?: () => void
  fields?: SectionFieldDef[]
}

const fillByState: Record<SectionState, string> = {
  minimized: 'bg-white',
  selected: 'bg-[#F4FBFF]',
  hover: 'bg-neutrals-whisper',
  opened: 'bg-white',
}

const defaultFieldsByType: Record<SectionType, SectionFieldDef[]> = {
  default: [{ label: 'IP' }],
  infrastructure: [{ label: 'IP', placeholder: 'בחר ערך' }],
  instrument: [
    { label: 'IP', placeholder: 'בחר ערך' },
    { label: 'דגם', placeholder: 'בחר ערך' },
    { label: 'יצרן', placeholder: 'בחר ערך' },
  ],
  info: [
    { label: 'IP', placeholder: 'בחר ערך' },
    { label: 'מיקום', placeholder: 'בחר ערך' },
    { label: 'הערות', placeholder: 'בחר ערך' },
    { label: 'סטטוס', placeholder: 'בחר ערך' },
  ],
}

// Figma "Icon/Chevron Down" — points DOWN when collapsed; flips UP when opened.
function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={open ? 'rotate-180' : ''}
      aria-hidden
    >
      <path
        d="M6 9l6 6 6-6"
        stroke="#181D24"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Section({
  state = 'opened',
  type = 'infrastructure',
  title = 'שם סקשן',
  checked = true,
  onToggle,
  fields,
}: SectionProps) {
  const open = state === 'opened'
  const rows = fields ?? defaultFieldsByType[type]

  return (
    <div
      className={`w-[945px] max-w-full overflow-hidden rounded-2xl border border-neutrals-silver py-4 ${fillByState[state]}`}
      dir="rtl"
    >
      {/* header (RTL). Figma: checkbox is the RIGHTMOST element, the title "שם סקשן"
          (18/600, right-aligned) fills the row next to it, chevron is LEFTMOST.
          dir=rtl → first child renders rightmost. */}
      <div className="flex items-center gap-2.5 px-6">
        <button
          type="button"
          onClick={onToggle}
          aria-pressed={checked}
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-[3px] border ${
            checked
              ? 'border-accent bg-accent'
              : 'border-neutrals-palladium bg-white'
          }`}
        >
          {checked && (
            <svg
              width="16"
              height="12"
              viewBox="0 0 18 13"
              fill="none"
              aria-hidden
            >
              <path
                d="M1 6.5L6 11.5 17 1"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </button>
        <span className="flex-1 text-right text-body-bold font-sans text-neutrals-charcoal">
          {title}
        </span>
        <Chevron open={open} />
      </div>

      {open && (
        <div className="mt-4 flex flex-col">
          {rows.map((f, i) => (
            <div key={i} className="border-t border-neutrals-silver px-10 py-4">
              {/* label row — REST: only the "IP" label (16/600); the "(שדה חובה)" hint
                  is visible:false in Figma, so it is not rendered. */}
              <div className="mb-2 flex items-center px-4">
                <span className="text-small font-semibold font-sans text-neutrals-charcoal">
                  {f.label}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg border border-neutrals-palladium bg-white px-4 py-2">
                {/* Icon/Arrow Drop Down — filled blue triangle (#0075DB), not a stroked chevron. */}
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 18 18"
                  fill="none"
                  aria-hidden
                >
                  <path d="M5.25 7.5L9 11.25L12.75 7.5H5.25Z" fill="#0075DB" />
                </svg>
                <span className="flex-1 text-body font-sans text-neutrals-lead">
                  {f.placeholder ?? 'בחר ערך'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
