import { createElement } from 'react'
import { sanitizeRichText } from '../sanitizeHtml'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'

const SIZE_CLASS_BY_LEVEL: Record<number, string> = {
  1: 'text-[26px] font-semibold',
  2: 'text-[22px] font-semibold',
  3: 'text-[19px] font-semibold',
  4: 'text-[17px] font-semibold',
  5: 'text-[15.5px] font-semibold',
  6: 'text-[14px] font-semibold',
}

/** text ו-content מופיעים יחד בפועל (כפילות בעורך) — text עדיף כשקיים. */
export function HeadingBlock({
  data,
}: {
  data: ParsedBlockDataMap['heading']
}) {
  const html = data.text ?? data.content ?? ''
  const level = Math.min(Math.max(Math.round(data.level) || 2, 1), 6)
  return createElement(`h${level}`, {
    className: `m-0 text-neutrals-charcoal ${SIZE_CLASS_BY_LEVEL[level]}`,
    // מסונן דרך sanitizeRichText (DOMPurify)
    dangerouslySetInnerHTML: { __html: sanitizeRichText(html) },
  })
}
