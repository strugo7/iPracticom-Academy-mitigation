import { type ReactNode } from 'react'
import { ChevronLeftIcon, ArrowEastIcon } from './icons'

// Figma "00 - Page / Breadcrumbs" set. Navigation = 2 | 3 | 4 Items.
// Crumb labels = 16px/400 accent #0075DB, separated by an 18px Chevron-Left (charcoal).
// RTL: the crumb group sits on the RIGHT (Home "ראשי" rightmost, leaf leftmost),
// the 40x40 round back button (Icon/Arrow East, → glyph) sits on the LEFT.
// Parent gap = 8 (gap-2); inner crumb gap = 4 (gap-1).
export interface Crumb {
  label: ReactNode
  onClick?: () => void
}

interface BreadcrumbsProps {
  /** Ordered root → leaf, i.e. "ראשי" (home) first. In RTL the first item renders
   *  rightmost, matching Figma where Home sits on the right and the leaf on the left. */
  items: Crumb[]
  showBack?: boolean
  onBack?: () => void
}

export function Breadcrumbs({
  items,
  showBack = true,
  onBack,
}: BreadcrumbsProps) {
  return (
    <div className="flex h-10 items-center gap-2 font-sans" dir="rtl">
      {/* RTL flow: crumbs first (rightmost — Home on the right), back button last (leftmost). */}
      <nav className="flex items-center gap-1">
        {items.map((item, i) => (
          <span key={i} className="flex items-center gap-1">
            <button
              type="button"
              onClick={item.onClick}
              className="text-small text-accent hover:underline cursor-pointer"
            >
              {item.label}
            </button>
            {i < items.length - 1 && (
              <span className="text-neutrals-charcoal" aria-hidden>
                <ChevronLeftIcon />
              </span>
            )}
          </span>
        ))}
      </nav>
      {showBack && (
        <button
          type="button"
          onClick={onBack}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-neutrals-charcoal transition-colors hover:bg-neutrals-whisper cursor-pointer"
          aria-label="חזרה"
        >
          <ArrowEastIcon />
        </button>
      )}
    </div>
  )
}
