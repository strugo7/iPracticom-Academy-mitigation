import { type HTMLAttributes } from 'react'
import { ChevronLeft, ChevronRight, NavigationArrow } from './icons'

/* ---------- 03 - Page : paged navigation pill ---------- */
// Figma "Property 1": Default / Hover Left / Hover Right.
// The set is a silver pill holding two 19px chevrons only — the Label node is
// hidden in Figma, so no text is rendered. Hover Left highlights the left (‹)
// chevron, Hover Right highlights the right (›) chevron with a white pill + accent.
export type PageNavState = 'default' | 'hoverLeft' | 'hoverRight'
interface PageNavButtonProps extends HTMLAttributes<HTMLDivElement> {
  state?: PageNavState
  onPrev?: () => void
  onNext?: () => void
}

// One chevron slot: highlighted form shows a white pill behind an accent chevron.
function NavChevron({
  dir,
  active,
  onClick,
}: {
  dir: 'left' | 'right'
  active: boolean
  onClick?: () => void
}) {
  const Icon = dir === 'left' ? ChevronLeft : ChevronRight
  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex items-center justify-center w-[19px] h-[19px] rounded-full transition-colors ${
        active ? 'bg-white text-accent' : 'text-neutrals-charcoal'
      }`}
      aria-label={dir === 'left' ? 'previous' : 'next'}
    >
      <Icon size={16} />
    </button>
  )
}

export function PageNavButton({
  state = 'default',
  onPrev,
  onNext,
  className = '',
  ...props
}: PageNavButtonProps) {
  return (
    <div
      className={`inline-flex items-center gap-2 h-[35px] px-4 py-2 rounded-[20px] bg-neutrals-silver ${className}`}
      {...props}
    >
      <NavChevron
        dir="right"
        active={state === 'hoverRight'}
        onClick={onNext}
      />
      <NavChevron dir="left" active={state === 'hoverLeft'} onClick={onPrev} />
    </div>
  )
}

/* ---------- Page / Navigation / Nav Button (standalone, 48x48) ---------- */
interface NavButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: never
}
export function NavButton({ className = '', ...props }: NavButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center w-12 h-12 rounded-full bg-neutrals-charcoal text-neutrals-whisper transition-all duration-150 cursor-pointer ${className}`}
      {...props}
    >
      <NavigationArrow size={24} />
    </button>
  )
}

/* ---------- Menu Button (standalone, 48x48) ----------
   48px round button with a #F2F5F8 hamburger glyph (two 16×2 bars). Figma has two
   color variants: charcoal #181D24 (node 0:1459) and accent #0075DB (node 3113:16178). */
export type MenuButtonColor = 'charcoal' | 'accent'
interface MenuButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: never
  color?: MenuButtonColor
}
const menuBtnBg: Record<MenuButtonColor, string> = {
  charcoal: 'bg-neutrals-charcoal',
  accent: 'bg-accent',
}
export function MenuButton({
  color = 'charcoal',
  className = '',
  ...props
}: MenuButtonProps) {
  return (
    <button
      aria-label="תפריט"
      className={`inline-flex items-center justify-center w-12 h-12 rounded-full transition-all duration-150 cursor-pointer ${menuBtnBg[color]} ${className}`}
      {...props}
    >
      <svg
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        aria-hidden="true"
      >
        <path d="M4 8H20V10H4V8Z" fill="#F2F5F8" />
        <path d="M4 14H20V16H4V14Z" fill="#F2F5F8" />
      </svg>
    </button>
  )
}
