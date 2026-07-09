// Inline icons used by the Filters components, matched to the Figma vectors.

export function ChevronDownIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M6 9.5L12 15.5L18 9.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserLineIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle
        cx="8"
        cy="4.5"
        r="2.75"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2.5 13.5C2.5 10.9 5 9.5 8 9.5C11 9.5 13.5 10.9 13.5 13.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SortZAIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M4.5 2.5V13.5M4.5 13.5L2 11M4.5 13.5L7 11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.5 3.5H13.5M9.5 7H12.5M9.5 10.5H11.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function ClearIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M3.5 5.5H15.5M7.5 5.5V4C7.5 3.4 8 3 8.5 3H10.5C11 3 11.5 3.4 11.5 4V5.5M5.5 5.5L6.2 15C6.2 15.6 6.7 16 7.3 16H11.7C12.3 16 12.8 15.6 12.8 15L13.5 5.5"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="8"
      height="8"
      viewBox="0 0 8 8"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M1.5 1.5L6.5 6.5M6.5 1.5L1.5 6.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}
