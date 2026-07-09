import { type ReactNode } from 'react'

// Figma "02 - Tags" — exact fills. height 24, radius full, pad 9px.
// Just a colored pill + text (default 400, hover bolds to 600) — NO dot.
// "number" variant is smaller (13px / 20h).
type TagType = 'red' | 'mission' | 'free' | 'blue' | 'break' | 'number'

interface TagProps {
  type?: TagType
  onRemove?: () => void
  children: ReactNode
}

const typeMap: Record<TagType, { bg: string; color: string }> = {
  red: { bg: '#FFDCD8', color: '#C94236' },
  mission: { bg: '#FFEBA4', color: '#8B700E' },
  free: { bg: '#DDFFEA', color: '#00857C' },
  blue: { bg: '#C9EDFF', color: '#0075DB' },
  break: { bg: '#E1E6EC', color: '#757D86' },
  number: { bg: '#C9EDFF', color: '#004E9B' },
}

function CloseIcon() {
  return (
    <svg
      width="10"
      height="10"
      viewBox="0 0 10 10"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M1.5 1.5L8.5 8.5M8.5 1.5L1.5 8.5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Tag({ type = 'blue', onRemove, children }: TagProps) {
  const t = typeMap[type]
  const small = type === 'number'
  return (
    <span
      className={`group inline-flex items-center gap-1 rounded-full font-sans font-normal hover:font-semibold ${
        small ? 'h-5 px-[7px] text-[13px]' : 'h-6 px-[9px] text-[15px]'
      }`}
      style={{ backgroundColor: t.bg, color: t.color }}
    >
      {children}
      {onRemove && (
        <button
          onClick={onRemove}
          className="shrink-0 -ml-0.5 inline-flex items-center justify-center opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
          aria-label="הסר"
        >
          <CloseIcon />
        </button>
      )}
    </span>
  )
}
