import { type ReactNode } from 'react'

// Figma "01 - Cell Content" component set. One axis: Content Type.
// Text 16/400 #181D24 · Sub Text 16/400 #9EA5AD · Tags pill #DDFFEA/#00857C ·
// Button pill text #0075DB w/ chevron · Checkbox 24 box r3 · Icon 16.
export type CellContentType =
  'text' | 'subText' | 'tags' | 'button' | 'checkbox' | 'icon'

interface CellContentProps {
  type?: CellContentType
  children?: ReactNode
  checked?: boolean
  onToggle?: (v: boolean) => void
}

// Icon/Outbound Call — design-system glyph (Figma main component, viewBox 16x16, two paths).
// fill follows currentColor.
function OutboundCallIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12.7822 6.92444C11.5022 9.44 9.44 11.4933 6.92444 12.7822L4.44423 10.6667L0 12.4444V15.1111C0 15.6 0.4 16 0.888889 16C9.23556 16 16 9.23556 16 0.888889C16 0.4 15.6 0 15.1111 0H12.4444L10.6667 4.44444L12.7822 6.92444Z"
        fill="currentColor"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0.888889 8H2.66667V3.92L7.63556 8.88889L8.88889 7.63556L3.92 2.66667H8V0.888889H0.888889V8Z"
        fill="currentColor"
      />
    </svg>
  )
}

function TagPill({ children }: { children: ReactNode }) {
  // 02 - Tags: h24, radius full (r40), pad 9px. Colored pill + text only — no dot.
  return (
    <span className="inline-flex items-center h-6 px-[9px] rounded-full bg-[#DDFFEA] text-[15px] font-sans text-hues-teal">
      <span>{children}</span>
    </span>
  )
}

function ButtonPill({ children }: { children: ReactNode }) {
  // 02 - New Buttons (Cell Content / Button variant, node 1492:5671). REST-verified: the
  // Chevron Down and BOTH Call End icons are visible:false — only the blue label shows.
  return (
    <span className="inline-flex items-center h-7 rounded-[20px] py-1 font-sans text-accent">
      <span className="text-small">{children}</span>
    </span>
  )
}

export function CellContent({
  type = 'text',
  children,
  checked = false,
  onToggle,
}: CellContentProps) {
  switch (type) {
    case 'tags':
      return <TagPill>{children}</TagPill>
    case 'subText':
      return (
        <span className="text-small font-sans text-neutrals-nickel leading-none">
          {children}
        </span>
      )
    case 'button':
      return <ButtonPill>{children}</ButtonPill>
    case 'checkbox':
      return (
        <label className="inline-flex items-center justify-center w-6 h-6 cursor-pointer">
          <input
            type="checkbox"
            className="sr-only"
            checked={checked}
            onChange={(e) => onToggle?.(e.target.checked)}
          />
          <span
            className={`inline-flex items-center justify-center w-6 h-6 rounded-[3px] border transition-colors ${
              checked
                ? 'bg-accent border-accent text-white'
                : 'bg-white border-neutrals-palladium'
            }`}
          >
            {checked && (
              <svg
                width="14"
                height="11"
                viewBox="0 0 16 12"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M2 6.5L6 10.5L14 1.5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </span>
        </label>
      )
    case 'icon':
      return (
        <span className="inline-flex w-4 h-4 text-neutrals-charcoal">
          <OutboundCallIcon />
        </span>
      )
    case 'text':
    default:
      return (
        <span className="text-small font-sans text-neutrals-charcoal leading-tight">
          {children}
        </span>
      )
  }
}
