/**
 * הצגת מדיה בנגן — תמונות/GIF כעזר ויזואלי לטכנאי, עם הגדלה בלחיצה (lightbox),
 * לפי מסמך 07 ("הוסף הגדלת מדיה בלחיצה — טכנאי צריך לראות תמונת עזר בגדול").
 * `MediaThumb` = תמונה קטנה על אופציה; `NodeMedia` = רצועת-מדיה מלאה על צומת.
 */
import { useEffect, useState } from 'react'
import type { FlowMedia } from '../schemas'
import { PlayerIcon } from './icons'

function firstViewable(media: FlowMedia[]): FlowMedia | undefined {
  return media.find((m) => m.type === 'image' || m.type === 'gif')
}

function Lightbox({
  media,
  onClose,
}: {
  media: FlowMedia
  onClose: () => void
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={media.alt ?? 'תצוגת מדיה'}
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-6 backdrop-blur-sm"
    >
      <button
        type="button"
        onClick={onClose}
        aria-label="סגירה"
        className="absolute end-5 top-5 flex h-11 w-11 items-center justify-center rounded-xl border border-white/30 bg-white/10 text-white"
      >
        <PlayerIcon name="close" size={22} />
      </button>
      <img
        src={media.url}
        alt={media.alt ?? ''}
        onClick={(e) => e.stopPropagation()}
        className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
      />
    </div>
  )
}

/** תמונת-עזר קטנה (על אופציה) — 54×54 מעוגלת עם סימון-מדיה, פותחת lightbox. */
export function MediaThumb({ media }: { media: FlowMedia[] }) {
  const [open, setOpen] = useState(false)
  const item = firstViewable(media)
  if (!item) return null

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation()
          setOpen(true)
        }}
        aria-label="הגדלת תמונת עזר"
        className="relative flex h-[54px] w-[54px] flex-none items-center justify-center overflow-hidden rounded-xl border border-[#E3E9F0] bg-gradient-to-br from-[#DCEBFB] to-[#F0F7FF] text-accent"
      >
        <img
          src={item.url}
          alt={item.alt ?? ''}
          className="h-full w-full object-cover"
        />
        <span className="absolute -top-1.5 -start-1.5 h-[18px] w-[18px] rounded-full border-2 border-white bg-[#22C55E] shadow-[0_0_0_3px_rgba(34,197,94,.25)]" />
      </button>
      {open && <Lightbox media={item} onClose={() => setOpen(false)} />}
    </>
  )
}

/** רצועת-מדיה מלאה על צומת (start/question/action) — תמונות גדולות לחיצות. */
export function NodeMedia({ media }: { media: FlowMedia[] }) {
  const [active, setActive] = useState<FlowMedia | null>(null)
  const items = media.filter((m) => m.type === 'image' || m.type === 'gif')
  if (items.length === 0) return null

  return (
    <>
      <div className="mt-4 flex flex-col gap-3">
        {items.map((item, index) => (
          <button
            key={item.id ?? item.url ?? index}
            type="button"
            onClick={() => setActive(item)}
            className="overflow-hidden rounded-2xl border border-[#E3E9F0] bg-white"
          >
            <img
              src={item.url}
              alt={item.alt ?? ''}
              className="max-h-64 w-full object-cover"
            />
          </button>
        ))}
      </div>
      {active && <Lightbox media={active} onClose={() => setActive(null)} />}
    </>
  )
}
