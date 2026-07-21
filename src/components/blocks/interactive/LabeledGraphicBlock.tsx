import { useState } from 'react'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

type LabeledGraphicData = ParsedBlockDataMap['labeled_graphic']
type Hotspot = NonNullable<LabeledGraphicData['hotspots']>[number]

/** מנרמל את שתי הצורות האמיתיות (hotspots ברמת-הבלוק / images[].hotspots) לפאנל אחיד. */
function resolvePanel(
  data: LabeledGraphicData,
): { url: string; hotspots: Hotspot[] } | null {
  const fromGallery = data.images?.[0]
  if (fromGallery) {
    return { url: fromGallery.url, hotspots: fromGallery.hotspots ?? [] }
  }
  const url = data.image_url || data.imageUrl
  if (url) return { url, hotspots: data.hotspots ?? [] }
  return null
}

/**
 * left/top פיזיים במכוון (לא insetInlineStart) — הקואורדינטות הן % על-גבי
 * תמונה/צילום שאינם מתהפכים ב-RTL (חריגת "כיווניות מדיה", CLAUDE.md §3).
 */
export function LabeledGraphicBlock({ data }: { data: LabeledGraphicData }) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null)
  const panel = resolvePanel(data)
  if (!panel) return null
  const active = activeIndex !== null ? panel.hotspots[activeIndex] : null

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-lg">
        <img src={panel.url} alt="" className="w-full" />
        {panel.hotspots.map((hotspot, i) => (
          <button
            key={hotspot.id}
            type="button"
            onClick={() => setActiveIndex(i === activeIndex ? null : i)}
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            aria-label={hotspot.title}
            className={`absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 border-white text-[12px] font-semibold text-white shadow-[0_2px_6px_rgba(0,0,0,0.35)] transition-colors ${
              i === activeIndex ? 'bg-accent' : 'bg-accent/80'
            }`}
          >
            {i + 1}
          </button>
        ))}
      </div>
      {active && (
        <div className="rounded-lg bg-neutrals-whisper p-3">
          <p className="m-0 text-[14.5px] font-semibold text-neutrals-charcoal">
            {active.title}
          </p>
          {active.description && (
            <p className="mt-1 whitespace-pre-line text-[13.5px] text-neutrals-lead">
              {active.description}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
