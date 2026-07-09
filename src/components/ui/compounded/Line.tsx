// Figma standalone "Line" (2650:18745) — a 1px divider in neutrals-silver (#E1E6EC).
// Supports horizontal (default) and vertical orientation.

interface LineProps {
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

export function Line({
  orientation = 'horizontal',
  className = '',
}: LineProps) {
  if (orientation === 'vertical') {
    return (
      <span
        className={`inline-block w-px self-stretch bg-neutrals-silver ${className}`}
      />
    )
  }
  return (
    <span className={`block h-px w-full bg-neutrals-silver ${className}`} />
  )
}
