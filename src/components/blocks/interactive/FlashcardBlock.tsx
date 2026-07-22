import { useState } from 'react'
import { Icon, ProgressBar } from '@/components/ui'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function FlashcardBlock({
  data,
}: {
  data: ParsedBlockDataMap['flashcard']
}) {
  const [index, setIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const total = data.items.length
  const card = data.items[index]

  if (!card) return null

  return (
    <div className="flex flex-col gap-3">
      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        className="flex min-h-[160px] flex-col items-center justify-center gap-2 rounded-2xl border border-neutrals-silver bg-white p-6 text-center shadow-card transition-colors hover:bg-neutrals-whisper"
      >
        <div
          className="text-[16px] text-neutrals-charcoal"
          // מסונן דרך sanitizeRichText (DOMPurify)
          dangerouslySetInnerHTML={{
            __html: sanitizeRichText(flipped ? card.back : card.front),
          }}
        />
        <span className="text-[12px] text-neutrals-nickel">
          {flipped ? 'לחצו לצד הקדמי' : 'לחצו לצד האחורי'}
        </span>
      </button>

      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => {
            setFlipped(false)
            setIndex((i) => Math.max(i - 1, 0))
          }}
          disabled={index === 0}
          aria-label="הקודם"
          className="flex-none text-neutrals-lead disabled:opacity-30"
        >
          <Icon name="ArrowEast" size={16} />
        </button>
        <ProgressBar percent={((index + 1) / total) * 100} className="flex-1" />
        <button
          type="button"
          onClick={() => {
            setFlipped(false)
            setIndex((i) => Math.min(i + 1, total - 1))
          }}
          disabled={index === total - 1}
          aria-label="הבא"
          className="flex-none text-neutrals-lead disabled:opacity-30"
        >
          <Icon name="ArrowWest" size={16} />
        </button>
      </div>
      <div className="text-center text-[12.5px] text-neutrals-lead">
        כרטיס {index + 1} מתוך {total}
      </div>
    </div>
  )
}
