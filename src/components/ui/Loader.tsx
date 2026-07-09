interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  color?: 'accent' | 'white' | 'charcoal'
  label?: string
}

// Figma "02 - Loader / Spinner": 48px ring, silver track (#E1E6EC), accent arc.
const sizeMap = {
  sm: 'w-5 h-5 border-2',
  md: 'w-8 h-8 border-[3px]',
  lg: 'w-12 h-12 border-4',
}

const colorMap = {
  accent: 'border-neutrals-silver border-t-accent',
  white: 'border-white/30 border-t-white',
  charcoal: 'border-neutrals-silver border-t-neutrals-charcoal',
}

export function Loader({ size = 'lg', color = 'accent', label }: LoaderProps) {
  return (
    <span
      className="inline-flex items-center gap-2 font-sans"
      role="status"
      aria-live="polite"
    >
      <span
        className={`inline-block rounded-full animate-spin ${sizeMap[size]} ${colorMap[color]}`}
      />
      {label && <span className="text-small text-neutrals-lead">{label}</span>}
    </span>
  )
}
