// Figma set "Category" (1373:1279) — a category editor block.
//   Default  : 1443x517, radius 16, white, pad L/R 48 T40 B56, gap 16. A header with a
//       blue "+"-ish glyph, an edit icon, a 20/600 charcoal title and a 3-dot menu; a
//       "הכנס שאלות:" hint (16/lead); then a list of numbered question rows — each a
//       bordered input (radius 8, stroke #BCC3CB) with a leading icon and a ".N" dial badge.
//   Variant2 : 1443x63, radius 8, a single collapsed row — "N שאלות | title" + 3-dot menu.

export type CategoryVariant = 'default' | 'variant2'

interface CategoryProps {
  variant?: CategoryVariant
  title?: string
  questions?: string[]
}

function PlusGlyph() {
  return (
    <span className="relative inline-block h-[15px] w-[15px]" aria-hidden>
      <span className="absolute left-1/2 top-0 h-[15px] w-[3px] -translate-x-1/2 bg-accent" />
      <span className="absolute top-1/2 left-0 h-[3px] w-[15px] -translate-y-1/2 bg-accent" />
    </span>
  )
}

function Dots() {
  return (
    <span className="flex flex-col items-center gap-[2px]" aria-hidden>
      <span className="h-1 w-1 rounded-full bg-neutrals-nickel" />
      <span className="h-1 w-1 rounded-full bg-neutrals-nickel" />
      <span className="h-1 w-1 rounded-full bg-neutrals-nickel" />
    </span>
  )
}

export function Category({
  variant = 'default',
  title = 'שם קטגוריה',
  questions = [
    'הכנס שאלה כאן',
    'הכנס שאלה כאן',
    'הכנס שאלה כאן',
    'הכנס שאלה כאן',
  ],
}: CategoryProps) {
  if (variant === 'variant2') {
    return (
      <div
        className="flex items-center gap-3 rounded-lg bg-white px-12 py-3.5 w-full shadow-[0_10px_60px_rgba(27,56,89,0.05),0_12px_12px_rgba(34,57,84,0.30)]"
        dir="rtl"
      >
        <PlusGlyph />
        <div className="flex items-center gap-3 flex-1">
          <span className="text-body font-sans text-neutrals-nickel">
            {questions.length} שאלות
          </span>
          <span className="text-[20px] font-sans text-neutrals-charcoal">
            |
          </span>
          <span className="text-[20px] font-semibold font-sans text-neutrals-charcoal">
            {title}
          </span>
        </div>
        <Dots />
      </div>
    )
  }

  return (
    <div
      className="flex flex-col gap-4 rounded-2xl bg-white px-12 pt-10 pb-14 w-full shadow-[0_10px_60px_rgba(27,56,89,0.05),0_12px_12px_rgba(34,57,84,0.30)]"
      dir="rtl"
    >
      <div className="flex items-center gap-3">
        <PlusGlyph />
        <div className="flex items-center gap-1 flex-1">
          {/* edit icon */}
          <svg
            width="15"
            height="15"
            viewBox="0 0 15 15"
            fill="none"
            aria-hidden
          >
            <path
              d="M2 11.5V13.5h2L12 5.5l-2-2L2 11.5z"
              stroke="#181D24"
              strokeWidth="1.3"
              strokeLinejoin="round"
            />
          </svg>
          <span className="text-[20px] font-semibold font-sans text-neutrals-charcoal">
            {title}
          </span>
        </div>
        <Dots />
      </div>

      <span className="text-small font-sans text-neutrals-lead">
        הכנס שאלות:
      </span>

      <div className="flex flex-col gap-4">
        {questions.map((q, i) => (
          <div key={i} className="flex items-center gap-3">
            {/* leading move/handle icon */}
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 6h8M5 9h8M5 12h8"
                stroke="#181D24"
                strokeWidth="1.4"
                strokeLinecap="round"
              />
            </svg>
            <div className="flex-1 rounded-lg border border-neutrals-palladium bg-white px-4 py-2">
              <span className="text-body font-sans text-neutrals-lead">
                {q}
              </span>
            </div>
            <span className="flex h-9 min-w-[20px] items-center justify-center rounded-full px-1 text-small font-semibold font-sans text-neutrals-lead">
              .{i + 1}
            </span>
          </div>
        ))}
      </div>

      {/* add-question action (16/400 accent), Figma 1373:1279 */}
      <button
        type="button"
        className="flex w-fit items-center gap-1 px-10 text-small font-sans text-accent"
      >
        + הוסף שאלה
      </button>

      {/* hairline divider */}
      <span className="block h-px w-full bg-neutrals-silver" />

      {/* answer field */}
      <div className="flex flex-col gap-2.5">
        <span className="text-small font-semibold font-sans text-neutrals-charcoal">
          תשובה
        </span>
        <div className="rounded-lg border border-neutrals-palladium bg-white px-4 py-2">
          <span className="text-body font-sans text-neutrals-lead">
            הכנס תשובה כאן
          </span>
        </div>
      </div>
    </div>
  )
}
