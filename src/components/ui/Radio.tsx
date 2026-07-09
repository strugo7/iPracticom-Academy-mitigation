import { type ReactNode } from 'react'

type RadioState = 'default' | 'hover' | 'focused' | 'disabled'

interface RadioProps {
  checked: boolean
  onChange: () => void
  label?: ReactNode
  name?: string
  disabled?: boolean
  state?: RadioState
}

// Figma "03 - New Controls Input" — circle 24x24, border 1px palladium.
// Checked = palladium ring + inner accent dot 12px. Hover = silver fill.
// Focused = accent 2px ring. Disabled = whisper fill / silver border.
export function Radio({
  checked,
  onChange,
  label,
  name,
  disabled,
  state = 'default',
}: RadioProps) {
  const isDisabled = disabled || state === 'disabled'

  const ring = isDisabled
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
        className={`inline-flex items-center justify-center w-6 h-6 rounded-full border transition-colors duration-150 ${ring}`}
      >
        <input
          type="radio"
          name={name}
          className="sr-only"
          checked={checked}
          disabled={isDisabled}
          onChange={onChange}
        />
        {checked && <span className="w-3 h-3 rounded-full bg-accent" />}
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
