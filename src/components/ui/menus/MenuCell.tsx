import { type ReactNode } from 'react'

// Figma "01 - Menu Cells \ Components"
// Two types:
//  - Item    303x40, pad L16/R16/T8/B8, gap 16.
//       content frame (gap 7): [tag] [label grow] [count]  + checkbox at the far (left) end.
//       In the base component tag + checkbox are hidden; menus turn them on per row.
//  - Actions 303x56, pad 16, gap 8, border #E1E6EC.
//       label (right) + "?" helper icon (16px #BCC3CB) + leading Phone icon (left). NO subtitle in base.
// States (REST-verified fills, set 1413:1957):
//   default  #FFFFFF        | hover    #F2F5F8 (1.0)
//   selected #C9EDFF @ 0.20 | expanded #F2F5F8 @ 0.50
// Color (Actions leading icon + label): default #181D24 | blue #0075DB | red #C94236.

export type MenuCellState = 'default' | 'hover' | 'selected' | 'expanded'
export type MenuCellColor = 'default' | 'blue' | 'red'

const cellBg: Record<MenuCellState, string> = {
  default: 'bg-white',
  hover: 'bg-neutrals-whisper',
  selected: 'bg-hues-sky/20',
  expanded: 'bg-neutrals-whisper/50',
}

const colorText: Record<MenuCellColor, string> = {
  default: 'text-neutrals-charcoal',
  blue: 'text-accent',
  red: 'text-caution',
}

// Helper tooltip icon — real Figma "question-fill" (3865:9304): a FILLED disc with a
// cut-out "?" (not a stroked outline), tinted #BCC3CB via currentColor.
function QuestionIcon({ size = 16 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className="shrink-0 text-neutrals-palladium"
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12C22 17.5228 17.5228 22 12 22ZM11 15V17H13V15H11ZM13 13.3551C14.4457 12.9248 15.5 11.5855 15.5 10C15.5 8.067 13.933 6.5 12 6.5C10.302 6.5 8.88637 7.70919 8.56731 9.31346L10.5288 9.70577C10.6656 9.01823 11.2723 8.5 12 8.5C12.8284 8.5 13.5 9.17157 13.5 10C13.5 10.8284 12.8284 11.5 12 11.5C11.4477 11.5 11 11.9477 11 12.5V14H13V13.3551Z"
        fill="currentColor"
      />
    </svg>
  )
}

function CheckBox({ checked }: { checked: boolean }) {
  // Figma "03 - New Controls Input": 24x24, r=3, unchecked stroke #BCC3CB, checked fill #0075DB.
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center w-6 h-6 rounded-[3px] ${
        checked ? 'bg-accent text-white' : 'border border-neutrals-palladium'
      }`}
    >
      {checked && (
        <svg
          width="18"
          height="13"
          viewBox="0 0 18 13"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M2 7L7 12L16 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </span>
  )
}

function CountTag({ value, selected }: { value: string; selected?: boolean }) {
  // Figma "02 - Tags" (number chip): r=30, text #004E9B 13px, bg #C9EDFF (white when row selected).
  // NO dot — chip is just the pill + number.
  return (
    <span
      className={`inline-flex shrink-0 items-center rounded-full px-[7px] h-5 ${selected ? 'bg-white' : 'bg-hues-sky'}`}
    >
      <span className="text-[13px] text-hues-cobalt leading-none">{value}</span>
    </span>
  )
}

// Toggle switch (Figma "02 - Toggles"): 40x22 pill, blue #0075DB on / palladium off,
// 16px white knob. In RTL the knob sits on the LEFT when on.
function Toggle({ on, onClick }: { on?: boolean; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className={`relative h-[22px] w-10 shrink-0 rounded-full transition-colors ${on ? 'bg-accent' : 'bg-neutrals-palladium'}`}
    >
      <span
        className={`absolute top-[3px] h-4 w-4 rounded-full bg-white shadow-sm transition-all ${on ? 'left-[3px]' : 'right-[3px]'}`}
      />
    </button>
  )
}

interface MenuItemCellProps {
  label: string
  /** secondary text shown under the label (14/400 #757D86) */
  subtitle?: string
  count?: string
  tag?: string
  /** show a toggle switch on the left */
  toggle?: boolean
  toggleOn?: boolean
  onToggle?: () => void
  state?: MenuCellState
  selected?: boolean
  /** leading +/- expander glyph (Figma Icon/Plus | Icon/minus). */
  expander?: 'plus' | 'minus'
  /** show the trailing checkbox (Figma "03 - New Controls Input"). */
  checkbox?: boolean
  fullWidth?: boolean
}

// Item cell: a row used inside selection menus (40px, taller with a subtitle).
export function MenuItemCell({
  label,
  subtitle,
  count,
  tag,
  toggle,
  toggleOn,
  onToggle,
  state = 'default',
  selected,
  expander,
  checkbox,
  fullWidth,
}: MenuItemCellProps) {
  const isSelected = selected ?? state === 'selected'
  const effState: MenuCellState = isSelected ? 'selected' : state
  const emphasised = isSelected || expander === 'minus'
  const labelColor = emphasised ? 'text-accent' : 'text-neutrals-charcoal'
  const countColor = emphasised ? 'text-accent' : 'text-neutrals-charcoal'
  // base Item label is 400; count is always 600; selected/expanded header labels are 600.
  const labelWeight = emphasised ? 'font-semibold' : 'font-normal'
  return (
    <div
      dir="ltr"
      className={`flex min-h-10 items-center justify-between gap-4 px-4 py-2 font-sans ${fullWidth ? 'w-full' : 'w-[303px]'} ${cellBg[effState]}`}
    >
      {/* left cluster: [checkbox] [expander] [toggle] — pushed to the left edge */}
      <div className="flex shrink-0 items-center gap-[7px]">
        {checkbox && <CheckBox checked={isSelected} />}
        {expander && (
          <span
            className="flex h-6 w-6 shrink-0 items-center justify-center text-accent"
            aria-hidden="true"
          >
            {expander === 'minus' ? (
              <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
                <path
                  d="M0 1H16"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path
                  d="M7 0V14M0 7H14"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            )}
          </span>
        )}
        {toggle && <Toggle on={toggleOn} onClick={onToggle} />}
      </div>
      {/* right cluster (RTL): a column — [label · +2 · count] on top, optional subtitle below */}
      <div
        dir="rtl"
        className="flex flex-col items-start gap-0.5 overflow-hidden"
      >
        <div className="flex items-center gap-2">
          <span
            className={`truncate text-right text-[16px] ${labelWeight} ${labelColor}`}
          >
            {label}
          </span>
          {tag && <CountTag value={tag} selected={isSelected} />}
          {count && (
            <span className={`text-[16px] font-semibold ${countColor}`}>
              {count}
            </span>
          )}
        </div>
        {subtitle && (
          <span className="truncate text-right text-[14px] text-neutrals-lead">
            {subtitle}
          </span>
        )}
      </div>
    </div>
  )
}

interface MenuActionCellProps {
  label: string
  icon: ReactNode
  state?: MenuCellState
  color?: MenuCellColor
  selected?: boolean
  /** leading +/- expander (used by the Actions expandable). */
  expander?: 'plus' | 'minus'
  /** show the trailing "?" helper icon (on by default to match the base cell). */
  helper?: boolean
  fullWidth?: boolean
}

// Actions cell: 56px tall row with leading icon + helper "?" + label.
export function MenuActionCell({
  label,
  icon,
  state = 'default',
  color = 'default',
  selected,
  expander,
  helper = true,
  fullWidth,
}: MenuActionCellProps) {
  const isSelected = selected ?? state === 'selected'
  const effState: MenuCellState = isSelected ? 'selected' : state
  return (
    <div
      dir="rtl"
      className={`flex h-14 items-center gap-2 px-4 py-4 font-sans ${fullWidth ? 'w-full' : 'w-[303px]'} ${cellBg[effState]}`}
    >
      {/* RTL order right→left: label (rightmost), then the leading action icon, then the
          helper "?" on the far LEFT — i.e. the "?" sits to the LEFT of the action icon. */}
      <span
        className={`flex-1 truncate text-right text-[16px] ${isSelected ? 'font-semibold' : 'font-normal'} ${colorText[color]}`}
      >
        {label}
      </span>
      {expander ? (
        <span
          className="flex h-6 w-6 shrink-0 items-center justify-center text-accent"
          aria-hidden="true"
        >
          {expander === 'minus' ? (
            <svg width="16" height="2" viewBox="0 0 16 2" fill="none">
              <path
                d="M0 1H16"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          ) : (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path
                d="M7 0V14M0 7H14"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          )}
        </span>
      ) : (
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center ${colorText[color]}`}
        >
          {icon}
        </span>
      )}
      {helper && <QuestionIcon />}
    </div>
  )
}

// ---------- Actions-menu leading icons ----------
// Each glyph is exported 1:1 from the iPracticom Figma "Menu TYpes" Actions set
// (exact viewBox + path data). Monochrome glyphs use fill="currentColor" so they
// inherit the cell's color (default charcoal / red). One icon per action row.

const ICON_BASE = {
  width: 18,
  height: 18,
  viewBox: '0 0 24 24',
  fill: 'none',
  'aria-hidden': true,
} as const

// Icon/Phone Left — עריכה (edit / incoming call)
// Back-compat alias: older consumers (Expandable, MenusSection) import `PhoneIcon`.
export const PhoneIcon = PhoneLeftIcon
export function PhoneLeftIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M17.38 10.79C15.94 13.62 13.62 15.93 10.79 17.38L7.99976 15L3 17V20C3 20.55 3.45 21 4 21C13.39 21 21 13.39 21 4C21 3.45 20.55 3 20 3H17L15 8L17.38 10.79Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Call Forwarding — העברת שיחה
export function CallForwardingIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M18.3312 7.45844C19.2823 10.408 19.2892 13.5989 18.3312 16.5416L14.5 17L12 22L14.7683 23.7157C15.1473 24.0948 15.7676 24.0948 16.1466 23.7157C22.6178 17.2445 22.6178 6.75549 16.1466 0.284279C15.7676 -0.0947595 15.1473 -0.0947595 14.7683 0.284279L12 2L14.5 7L18.3312 7.45844Z"
        fill="currentColor"
      />
      <path
        d="M8.41 8.41L7 7L2 12L7 17L8.42 15.59L5.83 13H14V11H5.83L8.41 8.41Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Audio Record — הקלטה
export function AudioRecordIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M12 0C9.16646 0 6.86119 2.30527 6.86119 5.13881V11.8334C6.86119 14.6669 9.16646 16.9721 12 16.9721C14.8336 16.9721 17.1388 14.6669 17.1388 11.8334V5.13881C17.1388 2.30527 14.8336 0 12 0Z"
        fill="currentColor"
      />
      <path
        d="M19.3792 11.5832C19.3792 15.6521 16.0689 18.9624 12 18.9624C7.93112 18.9624 4.62085 15.6521 4.62085 11.5832H3.2146C3.2146 13.921 4.13091 16.1247 5.79469 17.7885C7.29062 19.2844 9.22308 20.1756 11.2969 20.3403V24H12.7031V20.3404C14.7769 20.1757 16.7094 19.2845 18.2053 17.7886C19.8691 16.1247 20.7854 13.921 20.7854 11.5832H19.3792Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/In — יעד פנימי (internal destination)
export function InIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M23.4583 21.1226C23.7755 21.0477 24 20.7641 24 20.438C24 13.0717 18.007 7.07862 10.6407 7.07862H9.93754V3.56299C9.93754 3.29042 9.77962 3.04184 9.5324 2.92648C9.28729 2.80976 8.99409 2.84749 8.78395 3.02262L0.252979 10.0539C0.082683 10.196 -0.0106931 10.4103 0.000977294 10.632C0.0133522 10.8531 0.128714 11.0564 0.313401 11.1793L8.84437 16.8043C9.05999 16.9471 9.3374 16.9622 9.56606 16.8393C9.79471 16.7171 9.93754 16.4788 9.93754 16.2192V12.7036H10.6407C17.2558 12.7036 20.8326 17.0803 22.6679 20.7525C22.8102 21.0379 23.1325 21.1977 23.4583 21.1226Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Out — יעד חיצוני (external destination)
export function OutIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M0.541773 21.1226C0.224522 21.0477 -9.53674e-06 20.7641 -9.53674e-06 20.438C-9.53674e-06 13.0717 5.99305 7.07862 13.3594 7.07862H14.0625V3.56299C14.0625 3.29042 14.2204 3.04184 14.4676 2.92648C14.7127 2.80976 15.0059 2.84749 15.2161 3.02262L23.7471 10.0539C23.9173 10.196 24.0107 10.4103 23.9991 10.632C23.9867 10.8531 23.8713 11.0564 23.6866 11.1793L15.1557 16.8043C14.94 16.9471 14.6626 16.9622 14.434 16.8393C14.2053 16.7171 14.0625 16.4788 14.0625 16.2192V12.7036H13.3594C6.74422 12.7036 3.16747 17.0803 1.33208 20.7525C1.18982 21.0379 0.867506 21.1977 0.541773 21.1226Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Sms — סמס
export function SmsIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M0 2.39062V18.1337H15.2886L19.1909 21.6037V18.1337H24V2.39063L0 2.39062ZM5.93628 13.0587C4.84589 13.0587 3.95874 12.1714 3.95874 11.081H5.36499C5.36499 11.3961 5.62134 11.6525 5.93628 11.6525C6.2514 11.6525 6.50757 11.3961 6.50757 11.081C6.50757 10.7661 6.2514 10.5097 5.93628 10.5097C4.92847 10.5097 4.10852 9.68976 4.10852 8.68195C4.10852 7.67413 4.92847 6.85437 5.93628 6.85437C6.94409 6.85437 7.76404 7.67413 7.76404 8.68195H6.35779C6.35779 8.44958 6.16864 8.26062 5.93628 8.26062C5.70392 8.26062 5.51477 8.44958 5.51477 8.68195C5.51477 8.91431 5.70392 9.10345 5.93628 9.10345C7.02686 9.10345 7.91382 9.9906 7.91382 11.081C7.91382 12.1714 7.02667 13.0587 5.93628 13.0587ZM15.2521 12.9668H13.8459V8.83191C13.8459 8.51678 13.5895 8.26062 13.2746 8.26062C12.9595 8.26062 12.7031 8.51678 12.7031 8.83191V12.9668H11.2969V8.83191C11.2969 8.51678 11.0405 8.26062 10.7256 8.26062C10.4105 8.26062 10.1541 8.51678 10.1541 8.83191V12.9668H8.74786V8.83191C8.74786 7.74133 9.63501 6.85437 10.7256 6.85437C11.2108 6.85437 11.6556 7.03033 12 7.32147C12.3444 7.03033 12.7892 6.85437 13.2744 6.85437C14.365 6.85437 15.2521 7.74152 15.2521 8.83191V12.9668ZM18.0637 13.0587C16.9731 13.0587 16.0862 12.1714 16.0862 11.081H17.4924C17.4924 11.3961 17.7486 11.6525 18.0637 11.6525C18.3787 11.6525 18.635 11.3961 18.635 11.081C18.635 10.7661 18.3787 10.5097 18.0637 10.5097C17.0559 10.5097 16.236 9.68976 16.236 8.68195C16.236 7.67413 17.0559 6.85437 18.0637 6.85437C19.0715 6.85437 19.8915 7.67413 19.8915 8.68195H18.4852C18.4852 8.44958 18.2961 8.26062 18.0637 8.26062C17.8314 8.26062 17.6422 8.44958 17.6422 8.68195C17.6422 8.91431 17.8314 9.10345 18.0637 9.10345C19.1541 9.10345 20.0413 9.9906 20.0413 11.081C20.0413 12.1714 19.1541 13.0587 18.0637 13.0587Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Whatsapp — ווצאפ
export function WhatsappIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M20.6327 3.36731C18.4613 1.19583 15.5742 0 12.5033 0C9.43242 0 6.5453 1.19583 4.37381 3.36731C2.20233 5.5388 1.00655 8.42583 1.00655 11.4967C1.00655 13.442 1.49897 15.3535 2.43366 17.0468L0 24L6.95311 21.5664C8.64642 22.501 10.558 22.9935 12.5033 22.9935C15.5741 22.9935 18.4613 21.7976 20.6326 19.6261C22.8041 17.4547 24 14.5676 24 11.4967C24 8.42578 22.8041 5.53875 20.6327 3.36731ZM18.1868 15.7676L16.8595 17.0948C15.76 18.1943 12.6403 16.8574 9.89147 14.1085C7.14263 11.3597 5.80561 8.24002 6.90516 7.14047L8.23237 5.81325C8.50725 5.53837 8.95294 5.53837 9.22781 5.81325L10.8869 7.4723C11.1617 7.74717 11.1617 8.19286 10.8869 8.46773L9.89142 9.46317C10.857 11.5016 12.4984 13.143 14.5368 14.1085L15.5323 13.1131C15.8071 12.8382 16.2528 12.8382 16.5277 13.1131L18.1868 14.7721C18.4617 15.0471 18.4617 15.4927 18.1868 15.7676Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Cancel Forward — ביטול העברת שיחות
export function CancelForwardIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        d="M20.7561 17.2853C19.2299 17.2853 17.7648 17.0411 16.3973 16.5893C15.97 16.455 15.4938 16.5527 15.152 16.8824L12.4659 19.5684C9.01059 17.8103 6.17799 14.9899 4.41983 11.5224L7.10591 8.82411C7.44778 8.50666 7.54545 8.03049 7.41115 7.60316C6.9594 6.2357 6.71521 4.77057 6.71521 3.24438C6.71521 2.57286 6.16578 2.02344 5.49426 2.02344H1.22095C0.549426 2.02344 0 2.57286 0 3.24438C0 14.7091 9.29141 24.0005 20.7561 24.0005C21.4276 24.0005 21.977 23.451 21.977 22.7795V18.5062C21.977 17.8347 21.4276 17.2853 20.7561 17.2853Z"
        fill="currentColor"
      />
      <path
        d="M18.82 6.90671L21.41 9.49673L19.6833 11.2234L17.0933 8.63339L14.5033 11.2234L12.7766 9.49673L15.3666 6.90671L12.7766 4.3167L14.5033 2.59002L17.0933 5.18003L19.6833 2.59002L21.41 4.3167L18.82 6.90671Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Settings — הגדרות
export function SettingsIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M19.14 12.9404C19.18 12.6404 19.2 12.3304 19.2 12.0004C19.2 11.6804 19.18 11.3604 19.13 11.0604L21.16 9.48039C21.34 9.34039 21.39 9.07039 21.28 8.87039L19.36 5.55039C19.24 5.33039 18.99 5.26039 18.77 5.33039L16.38 6.29039C15.88 5.91039 15.35 5.59039 14.76 5.35039L14.4 2.81039C14.36 2.57039 14.16 2.40039 13.92 2.40039H10.08C9.83999 2.40039 9.64999 2.57039 9.60999 2.81039L9.24999 5.35039C8.65999 5.59039 8.11999 5.92039 7.62999 6.29039L5.23999 5.33039C5.01999 5.25039 4.76999 5.33039 4.64999 5.55039L2.73999 8.87039C2.61999 9.08039 2.65999 9.34039 2.85999 9.48039L4.88999 11.0604C4.83999 11.3604 4.79999 11.6904 4.79999 12.0004C4.79999 12.3104 4.81999 12.6404 4.86999 12.9404L2.83999 14.5204C2.65999 14.6604 2.60999 14.9304 2.71999 15.1304L4.63999 18.4504C4.75999 18.6704 5.00999 18.7404 5.22999 18.6704L7.61999 17.7104C8.11999 18.0904 8.64999 18.4104 9.23999 18.6504L9.59999 21.1904C9.64999 21.4304 9.83999 21.6004 10.08 21.6004H13.92C14.16 21.6004 14.36 21.4304 14.39 21.1904L14.75 18.6504C15.34 18.4104 15.88 18.0904 16.37 17.7104L18.76 18.6704C18.98 18.7504 19.23 18.6704 19.35 18.4504L21.27 15.1304C21.39 14.9104 21.34 14.6604 21.15 14.5204L19.14 12.9404ZM12 15.6004C10.02 15.6004 8.39999 13.9804 8.39999 12.0004C8.39999 10.0204 10.02 8.40039 12 8.40039C13.98 8.40039 15.6 10.0204 15.6 12.0004C15.6 13.9804 13.98 15.6004 12 15.6004Z"
        fill="currentColor"
      />
    </svg>
  )
}

// Icon/Remove — מחיקה (rendered red via the cell's `red` color prop → currentColor)
export function RemoveIcon() {
  return (
    <svg {...ICON_BASE}>
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M6 19C6 20.1 6.9 21 8 21H16C17.1 21 18 20.1 18 19V7H6V19ZM8.46 11.88L9.87 10.47L12 12.59L14.12 10.47L15.53 11.88L13.41 14L15.53 16.12L14.12 17.53L12 15.41L9.88 17.53L8.47 16.12L10.59 14L8.46 11.88ZM15.5 4L14.5 3H9.5L8.5 4H5V6H19V4H15.5Z"
        fill="currentColor"
      />
    </svg>
  )
}
