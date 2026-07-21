import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

export function MotivationBlock({
  data,
}: {
  data: ParsedBlockDataMap['motivation']
}) {
  const html = data.message ?? data.content ?? ''
  return (
    <div
      className="flex items-start gap-3 rounded-xl border border-accent/20 bg-hues-sky/30 px-4 py-3"
      style={
        data.background_color ? { backgroundColor: data.background_color } : undefined
      }
    >
      {data.emoji && <span className="text-[22px] leading-none">{data.emoji}</span>}
      <div className="min-w-0 flex-1 text-[14.5px] text-neutrals-charcoal">
        {data.title && <p className="m-0 mb-1 font-semibold">{data.title}</p>}
        <div
          // eslint-disable-next-line react/no-danger -- מסונן דרך sanitizeRichText (DOMPurify)
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
        />
      </div>
    </div>
  )
}
