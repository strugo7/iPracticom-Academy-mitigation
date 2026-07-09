import { type ReactNode } from 'react'

type CheckboxState = 'default' | 'hover' | 'focused' | 'disabled'

interface CheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  indeterminate?: boolean
  disabled?: boolean
  state?: CheckboxState
}

function CheckMark() {
  // Figma: white check, 24x24 box
  return (
    <svg
      width="16"
      height="12"
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
  )
}

// Figma "03 - New Controls Input" — box 24x24, radius 3px.
export function Checkbox({
  checked,
  onChange,
  label,
  indeterminate,
  disabled,
  state = 'default',
}: CheckboxProps) {
  const active = checked || indeterminate
  const isDisabled = disabled || state === 'disabled'

  const box = active
    ? 'bg-accent border-accent text-white'
    : isDisabled
      ? 'bg-neutrals-whisper border-neutrals-silver'
      : state === 'focused'
        ? 'bg-neutrals-silver border-accent border-2'
        : state === 'hover'
          ? 'bg-neutrals-silver border-neutrals-palladium'
          : 'bg-white border-neutrals-palladium'

  return (
    <label
      className={`inline-flex items-center gap-2.5 font-sans select-none ${isDisabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span
        className={`inline-flex items-center justify-center w-6 h-6 rounded-[3px] border transition-colors duration-150 ${box}`}
      >
        <input
          type="checkbox"
          className="sr-only"
          checked={checked}
          disabled={isDisabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        {indeterminate ? (
          <span className="w-4 h-0.5 rounded-full bg-white" />
        ) : (
          checked && <CheckMark />
        )}
      </span>
      {label && (
        <span
          className={`text-small ${isDisabled ? 'text-neutrals-palladium' : 'text-neutrals-charcoal'}`}
        >
          {label}
        </span>
      )}
    </label>
  )
}
