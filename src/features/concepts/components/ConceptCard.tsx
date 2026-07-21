/**
 * כרטיס מונח בגלריה (design-export/Concepts.dc.html שורות 107-132):
 * thumbnail עם אייקון-הקטגוריה ומונה-צפיות, Badge קטגוריה + Badge רמה,
 * המונח (LTR — מונחים טכניים באנגלית), תיאור קצר בשתי שורות, ותגיות.
 *
 * תג "מומלץ" של העיצוב הושמט — אין ל-Concept שדה `is_featured` בשום מקור-אמת.
 */
import { Badge, Icon } from '@/components/ui'
import type { Concept } from '@/types/entities'
import {
  CARD_TAGS_SHOWN,
  categoryMeta,
  DEFAULT_DIFFICULTY,
  DIFFICULTY_META,
  STATUS_META,
} from '../constants'
import { formatViews } from '../services/conceptSearch'

interface ConceptCardProps {
  concept: Concept
  onOpen: () => void
  onPickTag: (tag: string) => void
}

export function ConceptCard({ concept, onOpen, onPickTag }: ConceptCardProps) {
  const meta = categoryMeta(concept.category)
  const CategoryIcon = meta.icon
  const difficulty = DIFFICULTY_META[concept.difficulty_level ?? DEFAULT_DIFFICULTY]
  const tags = concept.related_terms ?? []
  const shown = tags.slice(0, CARD_TAGS_SHOWN)
  const hidden = tags.length - shown.length

  return (
    <article className="flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition-transform hover:-translate-y-1">
      <button
        type="button"
        onClick={onOpen}
        aria-label={`פתיחת המונח ${concept.term}`}
        className={`relative flex h-32 items-center justify-center overflow-hidden ${meta.bg}`}
      >
        <CategoryIcon size={46} className={meta.fg} />
        <span className="absolute top-3 inset-inline-end-3 flex items-center gap-1.5 rounded-full bg-neutrals-charcoal/60 px-2.5 py-1 text-[11.5px] text-white backdrop-blur-sm">
          <Icon name="View" size={13} />
          {formatViews(concept.view_count ?? 0)}
        </span>
      </button>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center gap-2">
          <Badge color={meta.color}>{concept.category}</Badge>
          <Badge color={difficulty.color}>{difficulty.label}</Badge>
          {concept.status === 'draft' && (
            <span className="ms-auto">
              <Badge color={STATUS_META.draft.color}>{STATUS_META.draft.label}</Badge>
            </span>
          )}
        </div>

        {/* dir="auto" ולא "ltr" כמו בעיצוב: 17 מ-96 המונחים בדאטה האמיתי הם
            בעברית ("רכזת גילוי אש"), ו-ltr קבוע היה שובר את סדר המילים שלהם.
            auto נגזר מהתו החזק הראשון — VLAN נשאר LTR, מונח עברי נשאר RTL. */}
        <button
          type="button"
          onClick={onOpen}
          dir="auto"
          className="text-start text-[19px] font-semibold leading-tight text-neutrals-charcoal"
        >
          {concept.term}
        </button>

        <p className="line-clamp-2 text-[13.5px] leading-relaxed text-neutrals-lead">
          {concept.short_description}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-1">
          {shown.map((tag) => (
            <button
              key={tag}
              type="button"
              onClick={() => onPickTag(tag)}
              className="rounded-md bg-neutrals-whisper px-2 py-1 text-[11.5px] text-neutrals-lead transition-colors hover:bg-hues-sky hover:text-accent"
            >
              {`#${tag}`}
            </button>
          ))}
          {hidden > 0 && (
            <span className="text-[11.5px] font-semibold text-neutrals-nickel">
              {`+${hidden}`}
            </span>
          )}
        </div>
      </div>
    </article>
  )
}
