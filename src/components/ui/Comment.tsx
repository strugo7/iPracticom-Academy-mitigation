import { type ReactNode } from 'react'

// REST-verified — Comment (2650:17734) + Warning/Input (72:471):
//  - comment: white bg, silver border (#E1E6EC) 1px, r=16, pad T14 R24 B14 L24, gap 10,
//             shadow 0/11/30 #040D37@5% (shadow-card). Icon/Error = 32px box w/ 20px glyph (#F1C21B);
//             text 16px #181D24.
//  - warning: beige bg (#F5E9D0), r=8, pad 8, gap 4, same Icon/Error, text 16px #181D24.
//  RTL (per REST x-coords): the ICON sits on the RIGHT (start), the text to its LEFT.
type CommentVariant = 'comment' | 'warning'

interface CommentProps {
  variant?: CommentVariant
  icon?: ReactNode
  children: ReactNode
}

// Figma "Icon/Error" — amber (#F1C21B) caution triangle, 20px glyph (rendered inside a 32px box).
function ErrorIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path d="M12 3l9.5 16.5H2.5L12 3Z" fill="#F1C21B" />
      <path
        d="M12 9.5v4M12 16.5h.01"
        stroke="#FFFFFF"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Comment({ variant = 'comment', icon, children }: CommentProps) {
  const isWarning = variant === 'warning'
  return (
    <div
      dir="rtl"
      className={`flex items-center font-sans ${
        isWarning
          ? 'gap-1 rounded-lg bg-[#F5E9D0] p-2'
          : 'gap-2.5 rounded-2xl bg-white border border-neutrals-silver px-6 py-3.5 shadow-card'
      }`}
    >
      {/* icon FIRST → lands on the RIGHT in RTL (Figma x≈8489, rightmost) */}
      <span className="shrink-0 w-8 h-8 flex items-center justify-center">
        {icon ?? <ErrorIcon />}
      </span>
      <span className="flex-1 text-small text-neutrals-charcoal text-right">
        {children}
      </span>
    </div>
  )
}
