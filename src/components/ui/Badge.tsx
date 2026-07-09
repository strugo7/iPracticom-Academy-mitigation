import { type ReactNode } from 'react'

type Color =
  | 'accent'
  | 'success'
  | 'caution'
  | 'warning'
  | 'neutral'
  | 'focus'
  | 'bronze'
  | 'cobalt'
  | 'denim'
  | 'green'
  | 'indigo'
  | 'mint'
  | 'red'
  | 'salmon'
  | 'sky'
  | 'strawberry'
  | 'teal'
  | 'yellow'
  | 'latte'

interface BadgeProps {
  color?: Color
  children: ReactNode
}

const colorMap: Record<Color, { bg: string; text: string }> = {
  accent: { bg: 'bg-hues-sky', text: 'text-hues-cobalt' },
  success: { bg: 'bg-hues-mint', text: 'text-hues-teal' },
  caution: { bg: 'bg-hues-salmon', text: 'text-hues-strawberry' },
  warning: { bg: 'bg-hues-yellow/30', text: 'text-[#8A6E00]' },
  neutral: { bg: 'bg-neutrals-silver', text: 'text-neutrals-lead' },
  focus: { bg: 'bg-hues-latte/30', text: 'text-hues-bronze' },
  bronze: { bg: 'bg-hues-latte/30', text: 'text-hues-bronze' },
  cobalt: { bg: 'bg-hues-sky', text: 'text-hues-cobalt' },
  denim: { bg: 'bg-hues-sky', text: 'text-hues-denim' },
  green: { bg: 'bg-hues-mint', text: 'text-hues-teal' },
  indigo: { bg: 'bg-hues-sky/50', text: 'text-hues-cobalt' },
  mint: { bg: 'bg-hues-mint', text: 'text-hues-teal' },
  red: { bg: 'bg-hues-salmon', text: 'text-hues-red' },
  salmon: { bg: 'bg-hues-salmon/30', text: 'text-hues-red' },
  sky: { bg: 'bg-hues-sky', text: 'text-hues-cobalt' },
  strawberry: { bg: 'bg-hues-salmon', text: 'text-hues-strawberry' },
  teal: { bg: 'bg-hues-mint', text: 'text-hues-teal' },
  yellow: { bg: 'bg-hues-yellow/30', text: 'text-[#8A6E00]' },
  latte: { bg: 'bg-hues-latte/30', text: 'text-hues-bronze' },
}

export function Badge({ color = 'neutral', children }: BadgeProps) {
  const { bg, text } = colorMap[color]
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-full text-small font-normal font-sans ${bg} ${text}`}
    >
      {children}
    </span>
  )
}
