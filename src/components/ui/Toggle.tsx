import { type ReactNode } from 'react'

interface ToggleProps {
  checked: boolean
  onChange: (checked: boolean) => void
  label?: ReactNode
  disabled?: boolean
  size?: 'sm' | 'big'
}

// Figma "02 - Toggles": Big 40x22 (knob 16), Small 24x16 (knob 12).
// Active fill #0075DB (accent), inactive #BCC3CB (palladium), knob #FFF.
const sizes = {
  big: {
    track: 'w-10 h-[22px]',
    knob: 'w-4 h-4',
    off: 'translate-x-0',
    on: '-translate-x-[18px]',
  },
  sm: {
    track: 'w-6 h-4',
    knob: 'w-3 h-3',
    off: 'translate-x-0',
    on: '-translate-x-[6px]',
  },
}

export function Toggle({
  checked,
  onChange,
  label,
  disabled,
  size = 'big',
}: ToggleProps) {
  const s = sizes[size]
  return (
    <label
      className={`inline-flex items-center gap-3 font-sans select-none ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
    >
      <span className="relative inline-flex shrink-0">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span
          className={`${s.track} rounded-full bg-neutrals-palladium peer-checked:bg-accent transition-colors duration-200`}
        />
        <span
          className={`absolute top-1/2 -translate-y-1/2 right-[3px] ${s.knob} rounded-full bg-white shadow-sm transition-transform duration-200 ${checked ? s.on : s.off}`}
        />
      </span>
      {label && (
        <span className="text-small text-neutrals-charcoal">{label}</span>
      )}
    </label>
  )
}
