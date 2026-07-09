import { type ReactNode, useId } from 'react'
import { LOGO_PATH, LOGO_VIEWBOX } from './logoPath'

// iPracticom logo (exact Figma wordmark, node 15:402). One artwork, recolored per variant —
// never re-draw it. Plus an OPTIONAL badge slot (top-right) for future UI labels. The badge is
// intentionally text-free by default ("BETA" removed); pass a <Badge>…</Badge> when a label is needed.
//
//   <Logo />                        → gradient (brand #282FEF→#33B1FF), default
//   <Logo variant="white" />        → white, for dark backgrounds
//   <Logo variant="black" />        → charcoal #181D24
//   <Logo badge={<Badge>חדש</Badge>} → wordmark + a badge (future use)

export type LogoVariant = 'gradient' | 'white' | 'black'

interface LogoProps {
  variant?: LogoVariant
  /** rendered height in px; width scales to keep the aspect ratio (default 17 = Figma). */
  height?: number
  /** optional badge element shown top-right (e.g. <Badge color="accent">…</Badge>). */
  badge?: ReactNode
  className?: string
}

export function Logo({
  variant = 'gradient',
  height = 17,
  badge,
  className = '',
}: LogoProps) {
  const gid = useId()
  const [, , w, h] = LOGO_VIEWBOX.split(' ').map(Number)
  const width = (w / h) * height
  const colorCls =
    variant === 'white'
      ? 'text-white'
      : variant === 'black'
        ? 'text-neutrals-charcoal'
        : ''

  return (
    <span
      dir="ltr"
      className={`relative inline-flex items-start ${colorCls} ${className}`}
    >
      <svg
        width={width}
        height={height}
        viewBox={LOGO_VIEWBOX}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label="iPracticom"
      >
        {variant === 'gradient' && (
          <defs>
            <linearGradient id={gid} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0" stopColor="#282FEF" />
              <stop offset="1" stopColor="#33B1FF" />
            </linearGradient>
          </defs>
        )}
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d={LOGO_PATH}
          fill={variant === 'gradient' ? `url(#${gid})` : 'currentColor'}
        />
      </svg>
      {badge && <span className="ms-1 -translate-y-0.5 shrink-0">{badge}</span>}
    </span>
  )
}
