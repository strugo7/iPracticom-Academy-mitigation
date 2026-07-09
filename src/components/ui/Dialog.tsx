import { type ReactNode } from 'react'

interface DialogProps {
  open: boolean
  onClose: () => void
  title?: ReactNode
  footer?: ReactNode
  children: ReactNode
  size?: 'sm' | 'md' | 'lg'
}

// Figma "Dialog" set (1982:21089): r16, fill #FFFFFF, stroke #E1E6EC w1,
// pad 24 all, gap 32 VERTICAL, shadow offset(0,24) blur34 rgba(0,0,0,0.07).
// Desktop width 800, Mobile width 375. Title 28px/400 #181D24 RIGHT.
// Close button = transparent 40x40 circle with 14px #181D24 glyph, top-left.
// Footer = HORIZONTAL gap10, paddingTop 24, buttons start-aligned (left in RTL).
const sizeMap = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-[800px]' }

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
        d="M1.5 1.5l11 11M12.5 1.5L1.5 12.5"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Dialog({
  open,
  onClose,
  title,
  footer,
  children,
  size = 'md',
}: DialogProps) {
  if (!open) return null
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/40 backdrop-blur-sm"
      onClick={onClose}
      dir="rtl"
    >
      <div
        className={`w-full ${sizeMap[size]} flex flex-col gap-8 rounded-2xl border border-neutrals-silver bg-white p-6 font-sans animate-[fadeIn_0.15s_ease-out] shadow-[0_24px_34px_0_rgba(0,0,0,0.07)]`}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Header (RTL): title on the RIGHT, Close (×) on the LEFT — REST: Close Button @x = the
            LEFT edge of the header frame. title first → right; close last → left. */}
        <div className="flex items-center justify-between gap-4">
          {title && (
            <h3 className="flex-1 text-h3 font-normal text-neutrals-charcoal text-right">
              {title}
            </h3>
          )}
          <button
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutrals-charcoal hover:bg-neutrals-whisper transition-colors cursor-pointer"
            aria-label="סגור"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="text-body text-neutrals-charcoal">{children}</div>
        {/* Footer buttons sit at the LEFT edge (Figma 1982:21089). The dialog is RTL, so
            justify-end = left; this also lands the primary (gradient) button leftmost. */}
        {footer && (
          <div className="flex items-center justify-end gap-2.5 pt-6">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}
