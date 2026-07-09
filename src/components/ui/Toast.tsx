import { type ReactNode } from 'react'

// Figma "Toast" component set — Type = {Success, Error, Error 2} × State = {Start, End}.
//   r=8, white bg, silver border (#E1E6EC) 1px, pad 24, gap 8, horizontal (RTL),
//   shadow 0/11/30 #040D37@5% (shadow-card). Icon rightmost, main text, action button leftmost.
//   Row: leading status icon (24px) + main text (16px #181D24) + text action button (accent).
//   Bottom: progress bar 4px (r=10) tinted by type — Start = empty, End = full.
//   Icon/progress fill: Success #51D5A5, Error #C94236, Error 2 #F1C21B.
type ToastKind = 'success' | 'error' | 'error2'
type ToastState = 'start' | 'end'

interface ToastProps {
  kind?: ToastKind
  state?: ToastState
  /** label for the trailing text action button (accent) */
  action?: ReactNode
  onAction?: () => void
  children: ReactNode
}

// Real Figma icons (filled), tinted by `color` via currentColor.
//   success → Icon/Success V (3358:30012): filled check-circle.
//   error / error2 → Icon/Warning (3358:30011): filled triangle + exclamation.
const SuccessGlyph = (
  <>
    <path
      d="M12 0C5.3832 0 0 5.3832 0 12C0 18.6168 5.3832 24 12 24C18.6168 24 24 18.6168 24 12C24 5.3832 18.6168 0 12 0ZM12 21.8182C6.58618 21.8182 2.18182 17.4137 2.18182 12C2.18182 6.58625 6.58618 2.18182 12 2.18182C17.4138 2.18182 21.8182 6.58625 21.8182 12C21.8182 17.4137 17.4137 21.8182 12 21.8182Z"
      fill="currentColor"
    />
    <path
      d="M16.4995 7.75736L10.3284 13.9285L7.49999 11.1C7.07402 10.6741 6.38326 10.674 5.95722 11.1C5.53119 11.526 5.53119 12.2167 5.95722 12.6427L9.55693 16.2426C9.76151 16.4472 10.039 16.5622 10.3283 16.5622H10.3284C10.6177 16.5622 10.8951 16.4472 11.0997 16.2427L18.0423 9.30019C18.4684 8.87416 18.4684 8.18347 18.0423 7.75743C17.6163 7.33139 16.9256 7.33132 16.4995 7.75736Z"
      fill="currentColor"
    />
  </>
)
const WarningGlyph = (
  <>
    <path
      d="M20.25 23.2485H3.75C1.68225 23.2485 0 21.5662 0 19.4985C0 18.8568 0.165094 18.2233 0.477562 17.6662L8.72555 2.66979C8.727 2.66716 8.72845 2.66459 8.72991 2.66196C10.1625 0.115102 13.8369 0.114164 15.2701 2.66196C15.2716 2.66454 15.273 2.66716 15.2745 2.66979L23.5225 17.6662C23.8349 18.2233 24 18.8568 24 19.4985C24 21.5662 22.3177 23.2485 20.25 23.2485ZM10.3661 3.57766L2.11847 18.5734C2.11702 18.576 2.11556 18.5786 2.11411 18.5812C1.95769 18.8593 1.875 19.1765 1.875 19.4985C1.875 20.5324 2.71613 21.3735 3.75 21.3735H20.25C21.2839 21.3735 22.125 20.5324 22.125 19.4985C22.125 19.1764 22.0423 18.8593 21.8859 18.5812C21.8844 18.5786 21.883 18.576 21.8815 18.5734L13.634 3.5779C12.9164 2.30815 11.0846 2.3067 10.3661 3.57766Z"
      fill="currentColor"
    />
    <path
      d="M12 14.811C11.4822 14.811 11.0625 14.3913 11.0625 13.8735V8.24848C11.0625 7.7307 11.4822 7.31098 12 7.31098C12.5178 7.31098 12.9375 7.7307 12.9375 8.24848V13.8735C12.9375 14.3913 12.5178 14.811 12 14.811Z"
      fill="currentColor"
    />
    <path
      d="M12 18.561C12.5178 18.561 12.9375 18.1412 12.9375 17.6235C12.9375 17.1057 12.5178 16.686 12 16.686C11.4822 16.686 11.0625 17.1057 11.0625 17.6235C11.0625 18.1412 11.4822 18.561 12 18.561Z"
      fill="currentColor"
    />
  </>
)
const kindMap: Record<ToastKind, { color: string; icon: ReactNode }> = {
  success: { color: '#51D5A5', icon: SuccessGlyph },
  error: { color: '#C94236', icon: WarningGlyph },
  error2: { color: '#F1C21B', icon: WarningGlyph },
}

export function Toast({
  kind = 'success',
  state = 'start',
  action,
  onAction,
  children,
}: ToastProps) {
  const c = kindMap[kind]
  return (
    <div
      dir="rtl"
      className="relative flex items-center gap-2 w-fit max-w-full overflow-hidden rounded-lg bg-white border border-neutrals-silver p-6 font-sans shadow-card"
      role="status"
    >
      <span className="shrink-0" style={{ color: c.color }}>
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden="true"
        >
          {c.icon}
        </svg>
      </span>
      <span className="text-small text-neutrals-charcoal whitespace-nowrap">
        {children}
      </span>
      {action && (
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 inline-flex items-center px-0 py-1 text-small text-accent font-normal whitespace-nowrap cursor-pointer hover:underline"
        >
          {action}
        </button>
      )}
      <span
        className="absolute bottom-0 right-0 h-1 rounded-full transition-all duration-300"
        style={{
          backgroundColor: c.color,
          width: state === 'end' ? '100%' : '4px',
        }}
      />
    </div>
  )
}
