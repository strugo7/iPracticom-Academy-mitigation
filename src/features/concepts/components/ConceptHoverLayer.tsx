/**
 * שכבת ה-hover של סימוני-המונח בתוך תוכן שיעור (PRD §Concept: "מציגים tooltip").
 * עוטפת את אזור-התוכן ומאזינה בהאצלה (event delegation) ל-`.concept-term` —
 * כך אין צורך לגעת בכל בלוק-רינדור בנפרד; ה-HTML המסונן מכיל את ה-span-ים.
 *
 * hover → כרטיסון עם המונח + התיאור-הקצר (מהמאגר) + רמז "לחצו להרחבה".
 * click → ניווט לעמוד-המונח המלא (/concepts/:id) — כמו wiki-link.
 * מונח שנמחק מהמאגר: ה-span נשאר טקסט רגיל, בלי tooltip ובלי ניווט.
 */
import { type ReactNode, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api'
import type { Concept } from '@/types/entities'
import { listConcepts } from '../services/conceptService'
import { conceptsQueryKey } from '../hooks/useConceptGallery'

interface HoverState {
  concept: Concept
  top: number
  left: number
}

/** מרווח בין המילה המסומנת לכרטיסון, וקירוב-רוחב לצורך מיקום אופקי. */
const GAP = 8
const CARD_WIDTH = 320

export function ConceptHoverLayer({ children }: { children: ReactNode }) {
  const navigate = useNavigate()
  const rootRef = useRef<HTMLDivElement>(null)
  const [hover, setHover] = useState<HoverState | null>(null)

  const conceptsQuery = useQuery({
    queryKey: conceptsQueryKey,
    queryFn: () => listConcepts(apiClient),
  })

  const byId = useMemo(() => {
    const map = new Map<string, Concept>()
    for (const c of conceptsQuery.data ?? []) map.set(c.id, c)
    return map
  }, [conceptsQuery.data])

  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    const termFrom = (target: EventTarget | null): HTMLElement | null => {
      if (!(target instanceof Element)) return null
      const el = target.closest('[data-concept-id]')
      return el instanceof HTMLElement ? el : null
    }

    const onOver = (e: MouseEvent) => {
      const el = termFrom(e.target)
      if (!el) return
      const id = el.getAttribute('data-concept-id')
      const concept = id ? byId.get(id) : undefined
      if (!concept) return
      const rect = el.getBoundingClientRect()
      // ממורכז אופקית מתחת למילה, מוגבל לשוליי-החלון
      const centered = rect.left + rect.width / 2 - CARD_WIDTH / 2
      const left = Math.max(
        GAP,
        Math.min(centered, window.innerWidth - CARD_WIDTH - GAP),
      )
      setHover({ concept, top: rect.bottom + GAP, left })
    }

    const onOut = (e: MouseEvent) => {
      const el = termFrom(e.target)
      if (el) setHover(null)
    }

    const onClick = (e: MouseEvent) => {
      const el = termFrom(e.target)
      if (!el) return
      const id = el.getAttribute('data-concept-id')
      if (id && byId.has(id)) {
        e.preventDefault()
        setHover(null)
        navigate(`/concepts/${id}`)
      }
    }

    root.addEventListener('mouseover', onOver)
    root.addEventListener('mouseout', onOut)
    root.addEventListener('click', onClick)
    return () => {
      root.removeEventListener('mouseover', onOver)
      root.removeEventListener('mouseout', onOut)
      root.removeEventListener('click', onClick)
    }
  }, [byId, navigate])

  return (
    <div ref={rootRef}>
      {children}
      {hover && (
        <div
          dir="rtl"
          role="tooltip"
          className="pointer-events-none fixed z-50 rounded-xl border border-neutrals-silver bg-white p-4 shadow-[0_16px_38px_rgba(20,40,70,.18)]"
          style={{
            top: hover.top,
            left: hover.left,
            width: CARD_WIDTH,
          }}
        >
          <div className="mb-1.5 flex items-baseline gap-2">
            <span
              dir="auto"
              className="text-body font-semibold text-neutrals-charcoal"
            >
              {hover.concept.term}
            </span>
          </div>
          <p className="line-clamp-4 text-[13px] leading-relaxed text-neutrals-lead">
            {hover.concept.short_description}
          </p>
          <p className="mt-3 text-[11.5px] font-semibold text-accent">
            להרחבה — לחצו על המונח
          </p>
        </div>
      )}
    </div>
  )
}
