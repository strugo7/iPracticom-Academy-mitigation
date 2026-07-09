// Figma set "Info Cell" (3439:31993) — a compact info row built from cell containers.
//   Default  : 472x63, radius 8, white fill, pad L/R 20. A title (14/400), a row with a
//       more-vert handle, an availability tag (mint #DDFFEA / teal text) and an agent
//       number (18/600 charcoal).
//   Variant2 : same metrics but whisper (#F2F5F8) fill and a leading edit/duplicate
//       action group (accent icons).

export type InfoCellVariant = 'default' | 'variant2'

interface InfoCellProps {
  variant?: InfoCellVariant
  title?: string
  tag?: string
  agent?: string
}

function MoreVert() {
  return (
    <span className="flex flex-col items-center gap-[3px]" aria-hidden>
      <span className="h-1 w-1 rounded-full bg-neutrals-charcoal" />
      <span className="h-1 w-1 rounded-full bg-neutrals-charcoal" />
      <span className="h-1 w-1 rounded-full bg-neutrals-charcoal" />
    </span>
  )
}

export function InfoCell({
  variant = 'default',
  title = 'כותרת',
  tag = 'בזמינות',
  agent = '11',
}: InfoCellProps) {
  return (
    <div
      className={`flex items-center gap-8 rounded-lg px-5 py-3 w-[472px] ${
        variant === 'variant2' ? 'bg-neutrals-whisper' : 'bg-white'
      }`}
      dir="rtl"
    >
      {variant === 'variant2' && (
        <div
          className="flex items-center gap-2 shrink-0 text-accent"
          aria-hidden
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path
              d="M2 12.5V14h1.5L12 5.5 10.5 4 2 12.5z"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <rect
              x="5"
              y="5"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
            <rect
              x="2"
              y="2"
              width="9"
              height="9"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
            />
          </svg>
        </div>
      )}

      <div className="flex flex-col gap-0.5 flex-1">
        <span className="text-tiny font-sans text-black">{title}</span>
        <div className="flex items-center gap-2">
          <MoreVert />
          <span className="inline-flex items-center rounded-full bg-[#DDFFEA] px-2.5 py-0.5 text-[15px] font-sans text-success">
            {tag}
          </span>
          <span className="text-body-bold font-sans text-neutrals-charcoal">
            {agent}
          </span>
        </div>
      </div>
    </div>
  )
}
