// Local icon set for the Navigation category. Each icon inherits color via
// `currentColor` so callers control fill with Tailwind text-* classes.

export function ChevronLeftIcon({ className = '' }: { className?: string }) {
  // Breadcrumb separator (Icon/Chevron Left), 18x18 frame, 7x12 glyph.
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M11 4L6 9l5 5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowEastIcon({ className = '' }: { className?: string }) {
  // Back-button glyph (Icon/Arrow East), 24x24.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M4 12h15M13 6l6 6-6 6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ChevronVIcon({
  className = '',
  open = false,
}: {
  className?: string
  open?: boolean
}) {
  // Collapse-button arrow, 12x7 glyph in a 24x24 frame. Points down (open) / up.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={`${className} transition-transform ${open ? '' : 'rotate-180'}`}
      aria-hidden
    >
      <path
        d="M6 10l6 6 6-6"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function ArrowDropDownIcon({ className = '' }: { className?: string }) {
  // Icon/Arrow Drop Down, 24x24 frame, 10x5 glyph.
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M7 10l5 5 5-5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function PlusIcon({ className = '' }: { className?: string }) {
  // Icon/Plus, 16x16 frame, 9x9 glyph.
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M8 3.5v9M3.5 8h9"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Mini-navigation rail glyphs (19x19). Simple line icons matching Figma intent.
export function TelephoneIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 3h3l1.5 4-2 1.2a9 9 0 004.3 4.3L17 14.5V18a14 14 0 01-12-15z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function WorldwideIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="9.5"
        cy="9.5"
        r="7.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M2 9.5h15M9.5 2c2.5 2.5 2.5 12.5 0 15M9.5 2c-2.5 2.5-2.5 12.5 0 15"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}

export function IotIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <rect
        x="3"
        y="3"
        width="13"
        height="13"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <circle
        cx="9.5"
        cy="9.5"
        r="2.5"
        stroke="currentColor"
        strokeWidth="1.3"
      />
    </svg>
  )
}

export function FileIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 2h6l4 4v11H5z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M11 2v4h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function UserLineIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="9.5" cy="6" r="3.2" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M3.5 16.5a6 6 0 0112 0"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function InvoiceIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 2h9v15l-2.2-1.3L9.5 17l-2.3-1.3L5 17z"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinejoin="round"
      />
      <path
        d="M7.5 6h4M7.5 9h4"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function SettingsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 19 19"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle
        cx="9.5"
        cy="9.5"
        r="2.6"
        stroke="currentColor"
        strokeWidth="1.3"
      />
      <path
        d="M9.5 1.5l1 2 2.2-.6 1 1.7-1.4 1.8.9 2.1 2.3.5v2l-2.3.5-.9 2.1 1.4 1.8-1 1.7-2.2-.6-1 2h-2l-1-2-2.2.6-1-1.7 1.4-1.8-.9-2.1-2.3-.5v-2l2.3-.5.9-2.1-1.4-1.8 1-1.7 2.2.6 1-2z"
        stroke="currentColor"
        strokeWidth="1.1"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M16 16l4 4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// Mini Navigation rail logo mark (Figma 3308:2568) — two stacked #EFEFEF bars
// (top 24×~3, bottom 16×~3) inside a 24×14 frame.
export function MiniNavLogo({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="14"
      viewBox="0 0 24 14"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M0 0.0348008L23.9966 -9.1697e-06L24.0001 2.96253L0.00349839 2.99734L0 0.0348008ZM0.0122444 10.4037L16.01 10.3805L16.0135 13.343L0.0157427 13.3662L0.0122444 10.4037Z"
        fill="#EFEFEF"
      />
    </svg>
  )
}

// Close glyph (Icon/Close), 24x24 frame, 14x14 glyph. Used in the mobile Aside.
export function CloseIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      className={className}
      aria-hidden
    >
      <path
        d="M5 5l14 14M19 5L5 19"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

// iPracticom wordmark — gradient logo used in the Aside header.
export function IPracticomLogo({ className = '' }: { className?: string }) {
  // The real brand logo asset (served from public/).
  return (
    <img
      src={`${import.meta.env.BASE_URL}ipracticom-logo.svg`}
      alt="iPracticom"
      className={className}
      style={{ width: 109, height: 17 }}
    />
  )
}
