import { type HTMLAttributes, type ReactNode } from 'react'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'sm' | 'md' | 'lg'
  border?: boolean
}

const paddingMap = { sm: 'p-4', md: 'p-6', lg: 'p-8' }

export function Card({
  children,
  padding = 'md',
  border = false,
  className = '',
  ...props
}: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-card
        ${border ? 'border border-neutrals-silver' : ''}
        ${paddingMap[padding]}
        ${className}
      `}
      {...props}
    >
      {children}
    </div>
  )
}
