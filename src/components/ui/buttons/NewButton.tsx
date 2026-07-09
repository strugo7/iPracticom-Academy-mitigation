import { type ButtonHTMLAttributes, type ReactNode } from 'react'
import { ChevronDown } from './icons'

// "02 - New Buttons" set — the text-label button family.
// Variant axes from Figma: Type (Primary/Outlined/White/Red/Link),
// State (Default/Hover/Down/Disabled), DropDown (boolean).
export type NewButtonType = 'primary' | 'outlined' | 'white' | 'red' | 'link'
export type NewButtonState = 'default' | 'hover' | 'down' | 'disabled'

interface NewButtonProps extends Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'type'
> {
  buttonType?: NewButtonType
  /** Force a visual state for showcase purposes. Omit to use real CSS interaction states. */
  state?: NewButtonState
  dropdown?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center font-sans rounded-[20px] transition-all duration-150 select-none cursor-pointer disabled:cursor-not-allowed'

// Real interaction styles (used when `state` is not forced).
const interactive: Record<NewButtonType, string> = {
  primary:
    'text-white font-semibold text-small px-6 py-2 bg-accent-gradient hover:bg-[linear-gradient(45deg,#33C2FF,#2878EF)] active:bg-[linear-gradient(45deg,#1D83C1,#141AA9)] disabled:opacity-50',
  outlined:
    'text-accent font-semibold text-small px-6 py-2 border border-accent hover:bg-hues-sky active:border-neutrals-charcoal active:text-neutrals-charcoal disabled:opacity-50',
  white:
    'text-accent font-semibold text-small px-6 py-2 bg-white hover:border hover:border-accent active:border active:border-neutrals-charcoal active:text-neutrals-charcoal disabled:opacity-50',
  red: 'text-white font-semibold text-small px-6 py-2 bg-caution hover:bg-[#EF5D52] active:bg-[#992D24] disabled:opacity-50',
  link: 'text-accent font-normal text-small py-1 hover:font-semibold active:text-neutrals-charcoal disabled:opacity-50',
}

// Forced-state styles for the showcase (every Figma state rendered explicitly).
const forced: Record<NewButtonType, Record<NewButtonState, string>> = {
  primary: {
    default: 'text-white font-semibold text-small px-6 py-2 bg-accent-gradient',
    hover:
      'text-white font-semibold text-small px-6 py-2 bg-[linear-gradient(45deg,#33C2FF,#2878EF)]',
    down: 'text-white font-semibold text-small px-6 py-2 bg-[linear-gradient(45deg,#1D83C1,#141AA9)]',
    disabled:
      'text-white font-semibold text-small px-6 py-2 bg-accent-gradient opacity-50',
  },
  outlined: {
    default:
      'text-accent font-semibold text-small px-6 py-2 border border-accent',
    hover:
      'text-accent font-semibold text-small px-6 py-2 border border-accent bg-hues-sky',
    down: 'text-neutrals-charcoal font-semibold text-small px-6 py-2 border border-neutrals-charcoal',
    disabled:
      'text-accent font-semibold text-small px-6 py-2 border border-accent opacity-50',
  },
  white: {
    default: 'text-accent font-semibold text-small px-6 py-2 bg-white',
    hover:
      'text-accent font-semibold text-small px-6 py-2 bg-white border border-accent',
    down: 'text-neutrals-charcoal font-semibold text-small px-6 py-2 bg-white border border-neutrals-charcoal',
    disabled:
      'text-accent font-semibold text-small px-6 py-2 bg-white border border-accent opacity-50',
  },
  red: {
    default: 'text-white font-semibold text-small px-6 py-2 bg-caution',
    hover: 'text-white font-semibold text-small px-6 py-2 bg-[#EF5D52]',
    down: 'text-white font-semibold text-small px-6 py-2 bg-[#992D24]',
    disabled:
      'text-white font-semibold text-small px-6 py-2 bg-caution opacity-50',
  },
  link: {
    default: 'text-accent font-normal text-small py-1',
    hover: 'text-accent font-semibold text-small py-1',
    down: 'text-neutrals-charcoal font-normal text-small py-1',
    disabled: 'text-accent font-normal text-small py-1 opacity-50',
  },
}

export function NewButton({
  buttonType = 'primary',
  state,
  dropdown = false,
  children,
  className = '',
  ...props
}: NewButtonProps) {
  const variantClasses = state
    ? forced[buttonType][state]
    : interactive[buttonType]
  // Gap: 8px everywhere except the Link dropdown (4px) in Figma.
  const gap = dropdown && buttonType === 'link' ? 'gap-1' : 'gap-2'
  // Dropdown padding: non-link buttons L16/R24 (pl-4 over base px-6);
  // link dropdown L8/R16 (base link has no px, so set both explicitly).
  const dropdownPad = dropdown
    ? buttonType === 'link'
      ? 'pl-2 pr-4'
      : 'pl-4'
    : ''

  return (
    <button
      className={`${base} ${gap} ${variantClasses} ${dropdownPad} ${className}`}
      disabled={state === 'disabled' || props.disabled}
      {...props}
    >
      {/* The dropdown chevron sits on the LEFT of the label in Figma (RTL: last DOM child). */}
      <span>{children}</span>
      {dropdown && (
        <span className="shrink-0">
          <ChevronDown size={16} />
        </span>
      )}
    </button>
  )
}
