// Figma set "Icon" (2887:19342): a 105px circle with a centered glyph.
// Variants: Warning (salmon bg / red glyph), Success (green bg / white check),
// Blue (sky bg / blue info glyph).

export type DialogIconKind = 'warning' | 'success' | 'blue'

interface DialogIconProps {
  kind: DialogIconKind
  /** circle diameter in px (Figma = 105) */
  size?: number
}

// Figma circle fills: Warning = salmon @ 30% opacity, Success = green @ 20%,
// Blue = sky @ 100%.
const circleBg: Record<DialogIconKind, string> = {
  warning: 'bg-hues-salmon/30',
  success: 'bg-hues-green/20',
  blue: 'bg-hues-sky',
}

function Glyph({ kind }: { kind: DialogIconKind }) {
  if (kind === 'warning') {
    // exclamation mark in caution red
    return (
      <svg
        width="46"
        height="42"
        viewBox="0 0 46 42"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M23 3 44 39H2L23 3Z"
          stroke="#C94236"
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <rect x="21" y="16" width="4" height="13" rx="2" fill="#C94236" />
        <rect x="21" y="31" width="4" height="4" rx="2" fill="#C94236" />
      </svg>
    )
  }
  if (kind === 'success') {
    // Figma: checkmark stroke is green (#51D5A5), not white.
    return (
      <svg
        width="37"
        height="26"
        viewBox="0 0 37 26"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M3 14 13 23 34 3"
          stroke="#51D5A5"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }
  // blue: info "i" inside a ring circle, all in accent (#0075DB)
  return (
    <svg
      width="62"
      height="62"
      viewBox="0 0 62 62"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="31" cy="31" r="28" stroke="#0075DB" strokeWidth="5" />
      <circle cx="31" cy="18" r="4" fill="#0075DB" />
      <rect x="27" y="26" width="8" height="22" rx="4" fill="#0075DB" />
    </svg>
  )
}

export function DialogIcon({ kind, size = 105 }: DialogIconProps) {
  return (
    <div
      className={`flex items-center justify-center rounded-full shrink-0 ${circleBg[kind]}`}
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      <Glyph kind={kind} />
    </div>
  )
}
