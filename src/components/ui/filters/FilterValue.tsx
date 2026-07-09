import { CloseIcon } from './icons'

// Figma "Filter Row / Filter Button / Filter Value" set — 3 variants.
//  Default     : plain text, charcoal 16px / 400.            (h20)
//  One Selected : blue pill #C9EDFF, text #0075DB 600, close. (h20, r4, pad8, gap8)
//  Multi Select : blue pill #C9EDFF, text #0075DB 400, close. (h20, r4, pad8, gap8)
export type FilterValueState = 'default' | 'one-selected' | 'multi-select'

interface FilterValueProps {
  state?: FilterValueState
  /** Text shown inside the value. */
  children: React.ReactNode
  onClear?: () => void
}

// Figma: the count text "2 נבחרו" has a character-style override on the leading
// number (PloniMLv2AAA DemiBold / 600) while the rest stays 400. Reproduce that by
// bolding ONLY a leading numeric token; non-numeric children pass through unchanged.
function withBoldNumber(children: React.ReactNode): React.ReactNode {
  if (typeof children !== 'string') return children
  const m = children.match(/^(\d[\d,]*)(\s+)(.*)$/)
  if (!m) return children
  return (
    <>
      <span className="font-semibold">{m[1]}</span>
      {m[2]}
      {m[3]}
    </>
  )
}

export function FilterValue({
  state = 'default',
  children,
  onClear,
}: FilterValueProps) {
  if (state === 'default') {
    return (
      <span className="font-sans font-normal text-[16px] leading-5 text-neutrals-charcoal">
        {withBoldNumber(children)}
      </span>
    )
  }

  const selected = state === 'one-selected'
  return (
    <span
      className={`inline-flex h-5 items-center gap-2 rounded-[4px] bg-hues-sky px-2 font-sans text-[16px] leading-5 text-accent ${
        selected ? 'font-semibold' : 'font-normal'
      }`}
    >
      {withBoldNumber(children)}
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          onClear?.()
        }}
        aria-label="הסר ערך"
        className="shrink-0 inline-flex items-center justify-center text-hues-cobalt cursor-pointer"
      >
        <CloseIcon />
      </button>
    </span>
  )
}
