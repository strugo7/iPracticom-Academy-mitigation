import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

/** פריט הוא לעיתים מחרוזת פשוטה ולעיתים אובייקט {text,...} — שתי הצורות אמיתיות. */
function itemHtml(item: ParsedBlockDataMap['list']['items'][number]): string {
  return typeof item === 'string' ? item : item.text
}

/** ordered (boolean) בחלק מהשיעורים, type ('unordered'|'ordered') באחרים. */
export function ListBlock({ data }: { data: ParsedBlockDataMap['list'] }) {
  const isOrdered = data.type === 'ordered' || data.ordered === true
  const Tag = isOrdered ? 'ol' : 'ul'
  return (
    <Tag
      className={`ms-5 flex flex-col gap-1.5 text-[15px] text-neutrals-charcoal ${
        isOrdered ? 'list-decimal' : 'list-disc'
      }`}
    >
      {data.items.map((item, i) => (
        <li
          key={i}
          // מסונן דרך sanitizeRichText (DOMPurify)
          dangerouslySetInnerHTML={{ __html: sanitizeRichText(itemHtml(item)) }}
        />
      ))}
    </Tag>
  )
}
