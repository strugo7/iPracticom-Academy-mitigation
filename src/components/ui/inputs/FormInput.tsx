import { type ReactNode } from 'react'
import {
  SearchIcon,
  CalendarIcon,
  ArrowDropDownIcon,
  PreferencesIcon,
  ErrorIcon,
} from './icons'

// 03 - Input \ Components  (node 1426:3173)
// Axes: Type = Text | Text With Count | Dropdown,  State = Default | Hover | Focused | Filled | Error | Disabled
//
// Figma facts honored here (verified against REST data, not just the visual tree):
//  - Frame 904 header: the "Hint" text and the info-icon instance are visible:false in
//    EVERY variant — only the bold label "שם שדה" renders.
//  - New Input box: r=8, h=40, pad L16 R16 T8 B8, gap 8, fill #FFFFFF (Hover #F2F5F8).
//    Border: default/filled/disabled #BCC3CB w1, focused #0075DB w2, error #C94236 w1.
//  - Box content order in RTL (right→left): Search icon, Value, then a left-edge icon
//    (Preferences for Text; Arrow-Drop-Down for Dropdown).
//  - Value text 18px/400 — color #9EA5AD (nickel) when empty/placeholder, #181D24 (charcoal) when Filled.
//  - Error: a Warning Text row below the box — value text (14px/400 #C94236) on the right, error icon on the left.
//  - Text With Count: a footer row (top border #E1E6EC) holding, right→left, "0/70", "תווים", "(סמס 1)" and a left Preferences icon.
export type InputType = 'text' | 'count' | 'dropdown'
export type InputFieldState =
  'default' | 'hover' | 'focused' | 'filled' | 'error' | 'disabled'

interface FormInputProps {
  type?: InputType
  state?: InputFieldState
  /** field label — Figma: "שם שדה" */
  label?: string
  /** optional grey hint shown next to the label — Figma examples: "(שדה חובה)" */
  hint?: string
  /** hide the header/label row entirely — Figma example "No Headline" */
  hideLabel?: boolean
  /** width utility override for the outer wrapper (table cells pass their own) */
  widthClass?: string
  /** placeholder / value text — Figma: "ערך" */
  value?: string
  /** error message under the box — Figma: "יש לך כפילות בשעות הפתיחה" */
  errorText?: string
  /** count footer note — Figma: "(סמס 1)" */
  countNote?: string
  /** count footer label — Figma: "תווים" */
  countLabel?: string
  /** count footer counter — Figma: "0/70" */
  count?: string
  /** lead (left) icon override. Default: dropdown→caret, else preferences. 'none' hides it. */
  leadIcon?: 'preferences' | 'dropdown' | 'none'
  /** trail (right) icon override. Default: search. Examples use calendar / none. */
  trailIcon?: 'search' | 'calendar' | 'none'
  className?: string
  children?: ReactNode
}

// New Input box styling per state.
function boxClass(state: InputFieldState): string {
  switch (state) {
    case 'hover':
      return 'bg-neutrals-whisper border border-neutrals-palladium'
    case 'focused':
      return 'bg-white border-2 border-accent'
    case 'error':
      return 'bg-white border border-caution'
    case 'disabled':
      // Figma disabled: white fill + palladium border, with the whole component at 50% opacity.
      return 'bg-white border border-neutrals-palladium cursor-not-allowed'
    case 'filled':
    case 'default':
    default:
      return 'bg-white border border-neutrals-palladium'
  }
}

export function FormInput({
  type = 'text',
  state = 'default',
  label = 'שם שדה',
  hint,
  hideLabel = false,
  widthClass = 'w-full max-w-[427px]',
  value = 'ערך',
  errorText = 'יש לך כפילות בשעות הפתיחה',
  countNote = '(סמס 1)',
  countLabel = 'תווים',
  count = '0/70',
  leadIcon,
  trailIcon = 'search',
  className = '',
  children,
}: FormInputProps) {
  const valueColor =
    state === 'filled' ? 'text-neutrals-charcoal' : 'text-neutrals-nickel'
  // REST-verified icon sizes (node 1571:5603): Search 24×24, Calendar 24×24,
  // Preferences 18×18, Arrow Drop Down 18×18.
  const lead = leadIcon ?? (type === 'dropdown' ? 'dropdown' : 'preferences')
  const leftIcon =
    lead === 'none' ? null : lead === 'dropdown' ? (
      <ArrowDropDownIcon className="shrink-0 w-[18px] h-[18px] text-accent" />
    ) : (
      <PreferencesIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
    )
  // Search: frame is 24px but the GLYPH is only 17.5px (REST-verified) → render ~18px so
  // the magnifier isn't oversized. Calendar's glyph fills its 24 frame → keep 24.
  const rightIcon =
    trailIcon === 'none' ? null : trailIcon === 'calendar' ? (
      <CalendarIcon className="shrink-0 w-6 h-6 text-neutrals-lead" />
    ) : (
      <SearchIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
    )

  return (
    <div
      className={`flex flex-col gap-2 font-sans ${widthClass} ${
        state === 'disabled' ? 'opacity-50' : ''
      } ${className}`}
      dir="rtl"
    >
      {/* Frame 904 — header: bold label, plus the grey "(שדה חובה)" hint in examples */}
      {!hideLabel && (
        <div className="flex items-center gap-1.5 px-[15px]">
          <span className="text-small font-semibold text-neutrals-charcoal">
            {label}
          </span>
          {hint && (
            <span className="text-small font-normal text-neutrals-lead">
              {hint}
            </span>
          )}
        </div>
      )}

      {/* New Input box. Text/Dropdown = h40 single row. Text With Count = the EXPANDED
          field (Figma 131px): a tall value area over a count footer. Frame 1900 (footer)
          carries a TOP divider (#E1E6EC, 1px) — node 4145:29400. */}
      <div
        className={`flex items-center gap-2 rounded-lg ${
          type === 'count'
            ? 'h-[131px] px-0 py-2 items-stretch'
            : 'h-10 px-4 py-2'
        } ${boxClass(state)}`}
      >
        {type === 'count' ? (
          <div className="flex flex-1 flex-col gap-2">
            {/* expanded value area (Frame 1894 ≈73px) — content top-aligned; Search right */}
            <div className="flex flex-1 items-start gap-2 px-4">
              <SearchIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
              <span className={`flex-1 text-body leading-6 ${valueColor}`}>
                {value}
              </span>
            </div>
            {/* count footer (Frame 1900). Top divider #E1E6EC. REST x-positions: counts on
                the RIGHT ("0/70" rightmost, then "תווים", then "(סמס 1)"), Preferences icon
                on the LEFT. RTL → counts first (rightmost), icon last (leftmost). */}
            <div className="flex items-center gap-1 px-4 pt-2 border-t border-neutrals-silver">
              <span className="text-small text-neutrals-charcoal">{count}</span>
              <span className="text-small text-neutrals-charcoal">
                {countLabel}
              </span>
              <span className="text-small text-neutrals-nickel">
                {countNote}
              </span>
              <span className="flex-1" />
              <PreferencesIcon className="shrink-0 w-[18px] h-[18px] text-neutrals-lead" />
            </div>
          </div>
        ) : (
          <>
            {rightIcon}
            <span className={`flex-1 text-body leading-6 ${valueColor}`}>
              {value}
            </span>
            {leftIcon}
          </>
        )}
      </div>

      {/* Warning Text — Error state only. RTL: right-aligned (error icon rightmost,
          message to its left). `justify-end` previously pushed it to the LEFT in RTL. */}
      {state === 'error' && (
        <div className="flex items-center justify-start gap-2 px-[15px]">
          <ErrorIcon className="shrink-0 text-caution" />
          <span className="text-tiny text-caution text-right">{errorText}</span>
        </div>
      )}

      {children}
    </div>
  )
}
