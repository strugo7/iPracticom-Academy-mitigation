import { Icon } from '@/components/ui'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/**
 * אין מקור Figma לבלוק-תוכן זה (כמו כל בלוקי הנגן — פער מתועד בתוכנית
 * ה-3.2) — טיפול ויזואלי סביר עם טוקני-DS, לא שחזור layout/cardColor מדויק.
 */
export function DesignedSectionBlock({
  data,
}: {
  data: ParsedBlockDataMap['designed_section']
}) {
  const cards = (data.cards ?? []).filter(
    (card) => card.title || (card.items && card.items.length > 0),
  )

  return (
    <section
      className={`overflow-hidden rounded-2xl border border-neutrals-silver bg-white ${data.fullBleed ? '' : 'p-5'}`}
    >
      <div
        className={
          data.fullBleed && data.imageUrl
            ? 'grid gap-0 sm:grid-cols-2'
            : 'flex flex-col gap-3'
        }
      >
        {data.imageUrl && (
          <img
            src={data.imageUrl}
            alt=""
            className={
              data.fullBleed
                ? 'h-full w-full object-cover'
                : 'mb-2 w-full rounded-lg object-cover'
            }
          />
        )}
        <div
          className={data.fullBleed && data.imageUrl ? 'flex flex-col justify-center gap-2 p-6' : ''}
        >
          {data.eyebrow && (
            <span className="text-[12px] font-semibold uppercase tracking-wide text-accent">
              {data.eyebrow}
            </span>
          )}
          {data.title && (
            <h3 className="m-0 text-[19px] font-semibold text-neutrals-charcoal">
              {data.title}
            </h3>
          )}
          {data.description && (
            <p className="m-0 text-[14.5px] text-neutrals-lead">
              {data.description}
            </p>
          )}
          {data.warningText && (
            <div className="mt-1 flex items-center gap-2 rounded-lg bg-hues-yellow/20 px-3 py-2 text-[13px] text-[#8A6E00]">
              <Icon name="Warning" size={14} />
              {data.warningText}
            </div>
          )}
        </div>
      </div>

      {cards.length > 0 && (
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
          {cards.map((card, i) => (
            <div key={i} className="rounded-lg border border-neutrals-silver p-3">
              {card.title && (
                <p className="m-0 mb-1 text-[13.5px] font-semibold text-neutrals-charcoal">
                  {card.title}
                </p>
              )}
              {card.items && card.items.length > 0 && (
                <ul className="ms-4 list-disc text-[13px] text-neutrals-lead">
                  {card.items.map((item, j) => (
                    <li key={j}>{String(item)}</li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
