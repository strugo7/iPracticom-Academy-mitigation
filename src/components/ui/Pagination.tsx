import { useEffect, useState } from 'react'

// Figma "Pagination" set (3161:7290): a [prev/next arrow pair] + ["X מתוך Y" count]
// + [a "go to page" numeric field], gap 16 (RTL). NOT numbered 1-2-3 buttons.
//  Arrows: 40x40, white bg, silver border, 8px rounded outer ends, accent chevron.
//  Count : 16px lead-gray "מתוך".  Field: 40px, r=8, white, silver border, value 18px.
interface PaginationProps {
  page: number
  pageCount: number
  onChange: (page: number) => void
}

function Chevron({ dir }: { dir: 'left' | 'right' }) {
  // left = chevron pointing left "<"; right = chevron pointing right ">"
  const d = dir === 'left' ? 'M8.5 1L3.5 7l5 6' : 'M5.5 1L10.5 7l-5 6'
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      aria-hidden="true"
    >
      <path
        d={d}
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function Pagination({ page, pageCount, onChange }: PaginationProps) {
  const [draft, setDraft] = useState(String(page))
  useEffect(() => {
    setDraft(String(page))
  }, [page])

  const commit = () => {
    const n = Math.min(Math.max(parseInt(draft, 10) || 1, 1), pageCount)
    setDraft(String(n))
    if (n !== page) onChange(n)
  }

  const arrow =
    'inline-flex items-center justify-center w-10 h-10 border border-neutrals-silver bg-white font-sans transition-colors duration-150 disabled:text-neutrals-silver disabled:cursor-not-allowed enabled:text-accent enabled:cursor-pointer enabled:hover:bg-neutrals-whisper'

  return (
    <nav
      className="inline-flex items-center gap-4 font-sans"
      dir="rtl"
      aria-label="עימוד"
    >
      {/* prev / next pair — outer ends rounded 8px. RTL convention:
         RIGHT cell = previous "›" (back), LEFT cell = next "‹" (forward). */}
      <div className="inline-flex">
        <button
          type="button"
          className={`${arrow} rounded-r-lg`}
          disabled={page <= 1}
          onClick={() => onChange(page - 1)}
          aria-label="הקודם"
        >
          <Chevron dir="right" />
        </button>
        <button
          type="button"
          className={`${arrow} rounded-l-lg border-r-0`}
          disabled={page >= pageCount}
          onClick={() => onChange(page + 1)}
          aria-label="הבא"
        >
          <Chevron dir="left" />
        </button>
      </div>

      {/* page field + count read together: "[page] מתוך N" */}
      <span className="inline-flex items-center gap-2">
        <span className="inline-flex items-center justify-center w-10 h-10 rounded-lg border border-neutrals-silver bg-white focus-within:border-accent transition-colors">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value.replace(/\D/g, ''))}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') commit()
            }}
            className="w-full h-full bg-transparent text-center text-body text-neutrals-charcoal outline-none"
            aria-label="מספר עמוד"
            inputMode="numeric"
          />
        </span>
        <span className="text-small text-neutrals-lead whitespace-nowrap">
          מתוך {pageCount}
        </span>
      </span>
    </nav>
  )
}
