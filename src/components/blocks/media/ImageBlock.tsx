import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/**
 * גלריה (images[]) כשקיים, אחרת תמונה בודדת (url/caption) — שתי הצורות אמיתיות.
 * גם בתוך images[] יש בפועל פריטים עם url ריק (למשל layout "image-right-text-left"
 * שמסתמך על textContent ברמת-הבלוק ולא על תמונה אמיתית) — לא מרנדרים <img> ריק.
 */
export function ImageBlock({ data }: { data: ParsedBlockDataMap['image'] }) {
  const images = (
    data.images?.length
      ? data.images
      : data.url
        ? [
            {
              url: data.url,
              alt: data.alt,
              caption: data.caption,
              richText: null,
            },
          ]
        : []
  ).filter((image) => image.url)

  const hasText = Boolean(data.textTitle || data.textContent)
  if (images.length === 0 && !hasText) return null

  const gridClass =
    data.layout === 'two-horizontal' || images.length > 1
      ? 'grid grid-cols-1 gap-3 sm:grid-cols-2'
      : 'flex flex-col gap-3'

  return (
    <div className={gridClass}>
      {images.map((image, i) => (
        <figure key={i} className="m-0">
          <img
            src={image.url}
            alt={image.alt ?? ''}
            className="w-full rounded-lg object-cover"
          />
          {image.caption && (
            <figcaption className="mt-1.5 text-[13px] text-neutrals-lead">
              {image.caption}
            </figcaption>
          )}
          {image.richText && (
            <div
              className="mt-1.5 text-[13.5px] text-neutrals-charcoal"
              // מסונן דרך sanitizeRichText (DOMPurify)
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(image.richText),
              }}
            />
          )}
        </figure>
      ))}
      {hasText && (
        <div>
          {data.textTitle && (
            <p className="m-0 mb-1 text-[15px] font-semibold text-neutrals-charcoal">
              {data.textTitle}
            </p>
          )}
          {data.textContent && (
            <div
              className="text-[14.5px] text-neutrals-charcoal"
              // מסונן דרך sanitizeRichText (DOMPurify)
              dangerouslySetInnerHTML={{
                __html: sanitizeRichText(data.textContent),
              }}
            />
          )}
        </div>
      )}
    </div>
  )
}
