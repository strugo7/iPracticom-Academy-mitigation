// Inline icons used by the Input components, matched to the Figma vectors.

// Icon/Calendar — exact Figma vector (node 2053:10577), 24x24, fill via currentColor.
export function CalendarIcon({ className = '' }: { className?: string }) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M23.0625 2.67188H19.5V1.82812C19.5 1.31034 19.0803 0.890625 18.5625 0.890625C18.0447 0.890625 17.625 1.31034 17.625 1.82812V2.67188H12.9375V1.82812C12.9375 1.31034 12.5178 0.890625 12 0.890625C11.4822 0.890625 11.0625 1.31034 11.0625 1.82812V2.67188H6.375V1.82812C6.375 1.31034 5.95528 0.890625 5.4375 0.890625C4.91972 0.890625 4.5 1.31034 4.5 1.82812V2.67188H0.9375C0.419719 2.67188 0 3.09159 0 3.60938V22.1719C0 22.6897 0.419719 23.1094 0.9375 23.1094H23.0625C23.5803 23.1094 24 22.6897 24 22.1719V3.60938C24 3.09159 23.5803 2.67188 23.0625 2.67188ZM22.125 21.2344H1.875V10.0781H22.125V21.2344ZM22.125 8.20312H1.875V4.54688H4.5V5.39062C4.5 5.90841 4.91972 6.32812 5.4375 6.32812C5.95528 6.32812 6.375 5.90841 6.375 5.39062V4.54688H11.0625V5.39062C11.0625 5.90841 11.4822 6.32812 12 6.32812C12.5178 6.32812 12.9375 5.90841 12.9375 5.39062V4.54688H17.625V5.39062C17.625 5.90841 18.0447 6.32812 18.5625 6.32812C19.0803 6.32812 19.5 5.90841 19.5 5.39062V4.54688H22.125V8.20312Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Arrow West — exact Figma vector (node 0:968), 24x24, fill via currentColor.
export function ArrowWestIcon({ className = '' }: { className?: string }) {
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M9 5L10.41 6.41L5.83 11H22V13H5.83L10.42 17.59L9 19L2 12L9 5Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Search — exact Figma vector (node 1427:2450).
export function SearchIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M0 6.68945C0 10.3909 2.98795 13.3789 6.68945 13.3789C8.14527 13.3789 9.49072 12.9167 10.5874 12.1306L16.4663 17.9998L17.9998 16.4663L12.1306 10.5874C12.9167 9.49072 13.3789 8.14527 13.3789 6.68945C13.3789 2.98795 10.3909 0 6.68945 0C2.98795 0 0 2.98795 0 6.68945ZM6.68945 11.3206C4.12687 11.3206 2.05829 9.25202 2.05829 6.68945C2.05829 4.12687 4.12687 2.05829 6.68945 2.05829C9.25202 2.05829 11.3206 4.12687 11.3206 6.68945C11.3206 9.25202 9.25202 11.3206 6.68945 11.3206Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ArrowDropDownIcon({ className = '' }: { className?: string }) {
  // Exact Figma "Icon/Arrow Drop Down" (node 1426:3432): a FILLED solid caret, not a
  // stroked chevron. 18x18 viewBox, glyph 8x4, fill follows currentColor (#0075DB).
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M5.25 7.5L9 11.25L12.75 7.5H5.25Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function InfoIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
      <path
        d="M8 7V11"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
      />
      <circle cx="8" cy="4.8" r="0.85" fill="currentColor" />
    </svg>
  )
}

// Icon/Preferences — exact Figma vector (node 1427:2656).
export function PreferencesIcon({ className = '' }: { className?: string }) {
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
        d="M5.00485 19.2C5.49905 17.8018 6.83254 16.8 8.4 16.8C9.96744 16.8 11.301 17.8018 11.7952 19.2H24V21.6H11.7952C11.301 22.9982 9.96744 24 8.4 24C6.83254 24 5.49905 22.9982 5.00485 21.6H0V19.2H5.00485ZM12.2048 10.8C12.699 9.40177 14.0326 8.4 15.6 8.4C17.1674 8.4 18.501 9.40177 18.9952 10.8H24V13.2H18.9952C18.501 14.5982 17.1674 15.6 15.6 15.6C14.0326 15.6 12.699 14.5982 12.2048 13.2H0V10.8H12.2048ZM5.00485 2.4C5.49905 1.00177 6.83254 0 8.4 0C9.96744 0 11.301 1.00177 11.7952 2.4H24V4.8H11.7952C11.301 6.19823 9.96744 7.2 8.4 7.2C6.83254 7.2 5.49905 6.19823 5.00485 4.8H0V2.4H5.00485ZM8.4 4.8C9.06274 4.8 9.6 4.26274 9.6 3.6C9.6 2.93726 9.06274 2.4 8.4 2.4C7.73726 2.4 7.2 2.93726 7.2 3.6C7.2 4.26274 7.73726 4.8 8.4 4.8ZM15.6 13.2C16.2628 13.2 16.8 12.6628 16.8 12C16.8 11.3372 16.2628 10.8 15.6 10.8C14.9372 10.8 14.4 11.3372 14.4 12C14.4 12.6628 14.9372 13.2 15.6 13.2ZM8.4 21.6C9.06274 21.6 9.6 21.0628 9.6 20.4C9.6 19.7372 9.06274 19.2 8.4 19.2C7.73726 19.2 7.2 19.7372 7.2 20.4C7.2 21.0628 7.73726 21.6 8.4 21.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Location Line — exact Figma vector (node 2809:3).
export function LocationIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="24"
      viewBox="0 0 20 24"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M9.99999 20.8758L15.4996 15.4084C18.5371 12.389 18.5371 7.49332 15.4996 4.47379C12.4623 1.45426 7.53768 1.45426 4.50027 4.47379C1.46286 7.49332 1.46286 12.389 4.50027 15.4084L9.99999 20.8758ZM9.99999 24L2.92893 16.9706C-0.97631 13.0883 -0.97631 6.79395 2.92893 2.91169C6.83417 -0.970564 13.1658 -0.970564 17.0711 2.91169C20.9763 6.79395 20.9763 13.0883 17.0711 16.9706L9.99999 24ZM9.99999 12.1503C11.2273 12.1503 12.2222 11.1612 12.2222 9.94114C12.2222 8.72106 11.2273 7.73199 9.99999 7.73199C8.77265 7.73199 7.77777 8.72106 7.77777 9.94114C7.77777 11.1612 8.77265 12.1503 9.99999 12.1503ZM9.99999 14.3594C7.54539 14.3594 5.55555 12.3812 5.55555 9.94114C5.55555 7.50098 7.54539 5.52285 9.99999 5.52285C12.4545 5.52285 14.4444 7.50098 14.4444 9.94114C14.4444 12.3812 12.4545 14.3594 9.99999 14.3594Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Emotiocons — exact Figma vector (node 182:545).
export function EmoticonsIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <path
        d="M10 20C4.477 20 0 15.523 0 10C0 4.477 4.477 0 10 0C15.523 0 20 4.477 20 10C20 15.523 15.523 20 10 20ZM10 18C12.1217 18 14.1566 17.1571 15.6569 15.6569C17.1571 14.1566 18 12.1217 18 10C18 7.87827 17.1571 5.84344 15.6569 4.34315C14.1566 2.84285 12.1217 2 10 2C7.87827 2 5.84344 2.84285 4.34315 4.34315C2.84285 5.84344 2 7.87827 2 10C2 12.1217 2.84285 14.1566 4.34315 15.6569C5.84344 17.1571 7.87827 18 10 18ZM6 11H14C14 12.0609 13.5786 13.0783 12.8284 13.8284C12.0783 14.5786 11.0609 15 10 15C8.93913 15 7.92172 14.5786 7.17157 13.8284C6.42143 13.0783 6 12.0609 6 11ZM6 9C5.60218 9 5.22064 8.84196 4.93934 8.56066C4.65804 8.27936 4.5 7.89782 4.5 7.5C4.5 7.10218 4.65804 6.72064 4.93934 6.43934C5.22064 6.15804 5.60218 6 6 6C6.39782 6 6.77936 6.15804 7.06066 6.43934C7.34196 6.72064 7.5 7.10218 7.5 7.5C7.5 7.89782 7.34196 8.27936 7.06066 8.56066C6.77936 8.84196 6.39782 9 6 9ZM14 9C13.6022 9 13.2206 8.84196 12.9393 8.56066C12.658 8.27936 12.5 7.89782 12.5 7.5C12.5 7.10218 12.658 6.72064 12.9393 6.43934C13.2206 6.15804 13.6022 6 14 6C14.3978 6 14.7794 6.15804 15.0607 6.43934C15.342 6.72064 15.5 7.10218 15.5 7.5C15.5 7.89782 15.342 8.27936 15.0607 8.56066C14.7794 8.84196 14.3978 9 14 9Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Image Round — exact Figma vector (node 4019:16237). A photo/landscape glyph in a circle.
export function ImageRoundIcon({ className = '' }: { className?: string }) {
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
        d="M21.0913 15.0917L16.448 10.4484C15.9794 9.97968 15.2196 9.97968 14.751 10.4484L5.83781 19.3615C3.7363 17.6005 2.4 14.9563 2.4 12C2.4 6.69806 6.69806 2.4 12 2.4C17.302 2.4 21.6 6.69806 21.6 12C21.6 13.0817 21.4211 14.1215 21.0913 15.0917ZM7.90712 20.6863L15.5995 12.994L19.9655 17.3599C18.239 19.9204 15.3136 21.5998 11.9995 21.5998C10.5342 21.5998 9.14814 21.2722 7.90712 20.6863ZM12 24C18.6274 24 24 18.6274 24 12C24 5.37258 18.6274 0 12 0C5.37258 0 0 5.37258 0 12C0 18.6274 5.37258 24 12 24ZM10.8 9.6C10.8 10.9255 9.72552 12 8.4 12C7.07452 12 6 10.9255 6 9.6C6 8.27452 7.07452 7.2 8.4 7.2C9.72552 7.2 10.8 8.27452 10.8 9.6Z"
        fill="currentColor"
      />
    </svg>
  )
}

export function ErrorIcon({ className = '' }: { className?: string }) {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      <circle cx="8" cy="8" r="7" fill="currentColor" />
      <path
        d="M8 4.5V8.5"
        stroke="white"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <circle cx="8" cy="11.2" r="0.9" fill="white" />
    </svg>
  )
}

export function PlayIcon({ className = '' }: { className?: string }) {
  // Exact Figma "Icon/Play" (node 0:1076): an OUTLINED (hollow) play triangle, not a
  // solid one — evenodd fill of an outer triangle minus an inner one. fill currentColor.
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
        fillRule="evenodd"
        clipRule="evenodd"
        d="M10 8.64L15.27 12L10 15.36V8.64ZM8 5V19L19 12L8 5Z"
        fill="currentColor"
      />
    </svg>
  )
}
