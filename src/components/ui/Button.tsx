import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'primary' | 'outlined' | 'white' | 'red' | 'link'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  dropdown?: boolean
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center font-sans transition-all duration-150 cursor-pointer select-none disabled:cursor-not-allowed'

const variants: Record<Variant, string> = {
  primary:
    'bg-accent-gradient text-white font-semibold text-small px-6 py-2 gap-2 rounded-[20px] disabled:opacity-50',
  outlined:
    'bg-transparent text-accent font-semibold text-small px-6 py-2 gap-2 rounded-[20px] border border-accent hover:bg-[#C9EDFF] active:border-neutrals-charcoal active:text-neutrals-charcoal disabled:opacity-50',
  white:
    'bg-transparent text-accent font-semibold text-small px-6 py-2 gap-2 rounded-[20px] hover:border hover:border-accent active:border active:border-neutrals-charcoal active:text-neutrals-charcoal disabled:opacity-50',
  red: 'bg-caution text-white font-semibold text-small px-6 py-2 gap-2 rounded-[20px] hover:bg-[#EF5D51] active:bg-[#992D24] disabled:opacity-50',
  link: 'bg-transparent text-accent font-normal text-small py-1 gap-2 hover:underline active:text-neutrals-charcoal disabled:opacity-50',
}

function ChevronDown() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M4 6L8 10L12 6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Button({
  variant = 'primary',
  leadingIcon,
  trailingIcon,
  dropdown = false,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {leadingIcon && <span className="shrink-0">{leadingIcon}</span>}
      {children}
      {dropdown && (
        <span className="shrink-0">
          <ChevronDown />
        </span>
      )}
      {trailingIcon && <span className="shrink-0">{trailingIcon}</span>}
    </button>
  )
}
