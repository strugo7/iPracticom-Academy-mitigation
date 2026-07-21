import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** בפועל content בחלק מהשיעורים, text באחרים — אותו שדה-תוכן, שני שמות. */
export function TextBlock({ data }: { data: ParsedBlockDataMap['text'] }) {
  const html = data.content ?? data.text ?? ''
  return (
    <div
      className="text-[15px] leading-relaxed text-neutrals-charcoal [&_a]:text-accent [&_a]:underline [&_strong]:font-semibold"
      // eslint-disable-next-line react/no-danger -- מסונן דרך sanitizeRichText (DOMPurify)
      dangerouslySetInnerHTML={{ __html: sanitizeRichText(html) }}
    />
  )
}
