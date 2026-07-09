// Inline SVG icons used by the Buttons category, traced from the Figma vectors.
// All use currentColor so the parent text color controls the fill/stroke.

interface IconProps {
  size?: number
  className?: string
}

export function ChevronDown({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M3.5 5.5L8 10L12.5 5.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronLeft({ size = 19, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M12 4.5L6.5 9.5L12 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronRight({ size = 19, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M7 4.5L12.5 9.5L7 14.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

// Icon/Call End glyph — exact Figma vector (1942:22060), a wide hang-up phone.
// Spans the full 24px width; fill follows currentColor.
export function PhoneIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M16.5416 9.66877C13.5989 8.71084 10.408 8.71773 7.45844 9.66877L7 13.5L2 16L0.284279 13.2317C-0.0947595 12.8527 -0.0947595 12.2324 0.284279 11.8534C6.75549 5.3822 17.2445 5.3822 23.7157 11.8534C24.0948 12.2324 24.0948 12.8527 23.7157 13.2317L22 16L17 13.5L16.5416 9.66877Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Up-arrow navigation glyph used by the standalone Nav Button.
export function NavigationArrow({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M5 14L12 8L19 14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M8 3V13M3 8H13"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function EditIcon({ size = 24, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        d="M4 16.5V20h3.5L18 9.5 14.5 6 4 16.5zM20.7 7.3a1 1 0 0 0 0-1.4l-2.6-2.6a1 1 0 0 0-1.4 0L15 5l3.5 3.5 2.2-1.2z"
        fill="currentColor"
      />
    </svg>
  )
}

export function InfoIcon({ size = 16, className }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8 0a8 8 0 1 0 0 16A8 8 0 0 0 8 0zm.9 4.5a.9.9 0 1 1-1.8 0 .9.9 0 0 1 1.8 0zM7.2 6.8h1.6v5.4H7.2V6.8z"
        fill="currentColor"
      />
    </svg>
  )
}
