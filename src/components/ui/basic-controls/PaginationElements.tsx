import { type ReactNode } from 'react'

// Figma "Pagination Eelements" — atomic pagination controls.
//  Arrow:  40x40, white bg, silver border, r=[8,0,0,8] → left edge rounded, chevron.
//          Default chevron accent; Hover bg whisper; Disabled chevron silver.
//  Number: 40px-tall input-like cell, white bg, silver border, r=8, value 18px.
//          Focused = accent border. Used as the "go to page" field.
type ArrowState = 'default' | 'hover' | 'disabled'
type NumberState = 'default' | 'focused'

function ChevronLeft({ className = '' }: { className?: string }) {
  return (
    <svg
      width="8"
      height="14"
      viewBox="0 0 8 14"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M6.5 1L1.5 7l5 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PaginationArrow({
  state = 'default',
  onClick,
}: {
  state?: ArrowState
  onClick?: () => void
}): ReactNode {
  const disabled = state === 'disabled'
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-l-lg rounded-r-none border border-neutrals-silver font-sans transition-colors duration-150 ${
        state === 'hover' ? 'bg-neutrals-whisper' : 'bg-white'
      } ${disabled ? 'cursor-not-allowed text-neutrals-silver' : 'cursor-pointer text-accent'}`}
      aria-label="עמוד"
    >
      <ChevronLeft />
    </button>
  )
}

export function PaginationNumber({
  state = 'default',
  value,
  onChange,
}: {
  state?: NumberState
  value: string
  onChange?: (v: string) => void
}): ReactNode {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-lg border bg-white font-sans transition-colors duration-150 ${
        state === 'focused' ? 'border-accent' : 'border-neutrals-silver'
      }`}
    >
      <input
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="w-full h-full bg-transparent text-center text-body text-neutrals-charcoal outline-none"
        aria-label="מספר עמוד"
      />
    </span>
  )
}
