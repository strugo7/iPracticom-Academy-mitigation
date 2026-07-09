// Figma standalone "Zero States" (2289:9276) — empty-state panel: a dashed/soft bordered
// card (radius 15, stroke #E3EBFD) with a centered "add" icon (accent), a 23px nickel title,
// and a gradient CTA button (radius 20, gradient #282FEF→#33B1FF, white 16/600 label).

interface ZeroStatesProps {
  title?: string
  cta?: string
  onCreate?: () => void
}

export function ZeroStates({
  title = 'לא יצרת עדיין שלוחות',
  cta = 'לחץ כאן ליצירה',
  onCreate,
}: ZeroStatesProps) {
  return (
    <div
      className="flex items-center justify-center rounded-[15px] border border-[#E3EBFD] bg-white px-12 py-16 w-full"
      dir="rtl"
    >
      <div className="flex flex-col items-center gap-5">
        {/* "new document" icon — a page with a folded corner and a centered + (light blue) */}
        <svg width="56" height="64" viewBox="0 0 56 64" fill="none" aria-hidden>
          <path
            d="M6 6a4 4 0 0 1 4-4h26l14 14v42a4 4 0 0 1-4 4H10a4 4 0 0 1-4-4V6Z"
            stroke="#B7D2F2"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M36 2v12a2 2 0 0 0 2 2h12"
            stroke="#B7D2F2"
            strokeWidth="4"
            strokeLinejoin="round"
          />
          <path
            d="M28 28v16M20 36h16"
            stroke="#B7D2F2"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>
        <h4 className="text-h3 font-sans text-neutrals-nickel text-center">
          {title}
        </h4>
        <button
          type="button"
          onClick={onCreate}
          className="inline-flex items-center justify-center rounded-[20px] px-8 py-2.5 bg-accent-gradient text-white text-small font-semibold font-sans"
        >
          {cta}
        </button>
      </div>
    </div>
  )
}
