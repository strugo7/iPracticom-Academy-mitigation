import { type InputHTMLAttributes, type ReactNode } from 'react'

type InputState =
  'default' | 'focused' | 'filled' | 'hover' | 'error' | 'disabled'

interface InputProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  'size'
> {
  label?: string
  hint?: string
  error?: string
  leadingIcon?: ReactNode
  trailingIcon?: ReactNode
  state?: InputState
}

export function Input({
  label,
  hint,
  error,
  leadingIcon,
  trailingIcon,
  state = 'default',
  className = '',
  disabled,
  ...props
}: InputProps) {
  const isError = !!error || state === 'error'
  const isDisabled = disabled || state === 'disabled'

  const borderClass = isError
    ? 'border-caution focus-within:border-caution'
    : isDisabled
      ? 'border-neutrals-silver bg-neutrals-whisper'
      : 'border-neutrals-silver focus-within:border-accent hover:border-neutrals-palladium'

  return (
    <div className={`flex flex-col gap-1.5 font-sans ${className}`}>
      {label && (
        <label
          className={`text-tiny-bold ${isDisabled ? 'text-neutrals-palladium' : 'text-neutrals-charcoal'}`}
        >
          {label}
        </label>
      )}
      <div
        className={`
        flex items-center gap-2 h-10 px-3 rounded-lg border bg-white transition-colors
        ${borderClass}
        ${isDisabled ? 'cursor-not-allowed' : ''}
      `}
      >
        {leadingIcon && (
          <span
            className={`shrink-0 ${isDisabled ? 'text-neutrals-palladium' : 'text-neutrals-lead'}`}
          >
            {leadingIcon}
          </span>
        )}
        <input
          className={`
            flex-1 outline-none bg-transparent text-body placeholder:text-neutrals-nickel
            ${isDisabled ? 'text-neutrals-palladium cursor-not-allowed' : 'text-neutrals-charcoal'}
          `}
          disabled={isDisabled}
          {...props}
        />
        {trailingIcon && (
          <span
            className={`shrink-0 ${isDisabled ? 'text-neutrals-palladium' : 'text-neutrals-lead'}`}
          >
            {trailingIcon}
          </span>
        )}
      </div>
      {(hint || error) && (
        <p
          className={`text-tiny ${isError ? 'text-caution' : 'text-neutrals-lead'}`}
        >
          {error || hint}
        </p>
      )}
    </div>
  )
}
