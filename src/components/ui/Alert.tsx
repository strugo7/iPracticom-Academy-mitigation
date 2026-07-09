import { type ReactNode } from 'react'

type AlertKind = 'info' | 'success' | 'warning' | 'error'

interface AlertProps {
  kind?: AlertKind
  title?: ReactNode
  onClose?: () => void
  children: ReactNode
}

const kindMap: Record<
  AlertKind,
  { wrap: string; icon: string; iconPath: ReactNode }
> = {
  info: {
    wrap: 'bg-hues-sky/40 border-accent/30 text-neutrals-charcoal',
    icon: 'text-accent',
    iconPath: (
      <>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M10 9v5M10 6.5h.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  success: {
    wrap: 'bg-hues-mint/40 border-success/30 text-neutrals-charcoal',
    icon: 'text-success',
    iconPath: (
      <>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M6.5 10.2l2.3 2.3 4.7-5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </>
    ),
  },
  warning: {
    wrap: 'bg-hues-yellow/20 border-warning/40 text-neutrals-charcoal',
    icon: 'text-[#8A6E00]',
    iconPath: (
      <>
        <path
          d="M10 2.5l8 14H2l8-14Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
        <path
          d="M10 8v3.5M10 14h.01"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
  error: {
    wrap: 'bg-hues-salmon/30 border-caution/30 text-neutrals-charcoal',
    icon: 'text-caution',
    iconPath: (
      <>
        <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" />
        <path
          d="M7.5 7.5l5 5M12.5 7.5l-5 5"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </>
    ),
  },
}

function CloseIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M2 2l10 10M12 2L2 12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Alert({ kind = 'info', title, onClose, children }: AlertProps) {
  const c = kindMap[kind]
  return (
    <div
      className={`flex items-start gap-3 rounded-xl border px-4 py-3 font-sans ${c.wrap}`}
      role="alert"
    >
      <span className={`shrink-0 mt-0.5 ${c.icon}`}>
        <svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          aria-hidden="true"
        >
          {c.iconPath}
        </svg>
      </span>
      <div className="flex-1 min-w-0">
        {title && <p className="text-small font-semibold mb-0.5">{title}</p>}
        <div className="text-tiny text-neutrals-lead">{children}</div>
      </div>
      {onClose && (
        <button
          onClick={onClose}
          className="shrink-0 mt-0.5 text-neutrals-nickel hover:text-neutrals-charcoal transition-colors cursor-pointer"
          aria-label="סגור"
        >
          <CloseIcon />
        </button>
      )}
    </div>
  )
}
