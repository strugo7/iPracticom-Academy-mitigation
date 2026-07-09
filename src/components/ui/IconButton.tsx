import { type ButtonHTMLAttributes, type ReactNode } from 'react'

type Variant = 'icon' | 'ghost' | 'white' | 'gradient' | 'outline'
type Size = 'sm' | 'md' | 'lg' | 'xl' | 'xxl'

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
  size?: Size
  children: ReactNode
}

const base =
  'inline-flex items-center justify-center rounded-full transition-all duration-150 cursor-pointer select-none shrink-0 disabled:cursor-not-allowed font-sans'

const sizes: Record<Size, string> = {
  sm: 'w-8 h-8 text-small',
  md: 'w-10 h-10',
  lg: 'w-12 h-12',
  xl: 'w-14 h-14',
  xxl: 'w-16 h-16 text-h4',
}

const variants: Record<Variant, string> = {
  // transparent → whisper hover → accent down; icon: accent→accent→white; disabled: silver icon
  icon: 'bg-transparent text-accent hover:bg-neutrals-whisper active:bg-accent active:text-white disabled:text-neutrals-silver disabled:bg-transparent disabled:pointer-events-none',
  // outline circle → sky+accent border hover → charcoal down
  outline:
    'bg-transparent text-neutrals-nickel border border-neutrals-palladium hover:bg-hues-sky hover:border-accent hover:text-accent active:bg-neutrals-charcoal active:text-white active:border-neutrals-charcoal disabled:opacity-50',
  // whisper bg → silver hover → charcoal down; icon: accent→accent→white
  ghost:
    'bg-neutrals-whisper text-accent hover:bg-neutrals-silver active:bg-neutrals-charcoal active:text-white disabled:opacity-50',
  // white bg → whisper hover → whisper+charcoal down
  white:
    'bg-white text-accent hover:bg-neutrals-whisper active:bg-neutrals-whisper active:text-neutrals-charcoal disabled:opacity-50',
  // gradient → lighter gradient hover → charcoal down; icon: white
  gradient:
    'bg-accent-gradient text-white active:bg-neutrals-charcoal disabled:opacity-50',
}

export function IconButton({
  variant = 'ghost',
  size = 'md',
  children,
  className = '',
  disabled,
  ...props
}: IconButtonProps) {
  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  )
}
