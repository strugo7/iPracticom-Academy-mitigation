/** עורך ציטוט (שלב 6.3) — טקסט-ציטוט + מקור. הנגן מרנדר את שניהם כטקסט-נקי
 *  ({data.text}, {data.author}), לכן PlainInline. משמר את מסגרת-הציטוט. */
import { PlainInline } from '../../richtext/PlainInline'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

export function QuoteBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  return (
    <blockquote className="m-0 border-s-4 border-accent bg-hues-sky/30 py-3 ps-4 pe-3">
      <PlainInline
        value={str(data.text)}
        onChange={(t) => onChange({ text: t })}
        placeholder={STRINGS.quotePlaceholder}
        ariaLabel={STRINGS.quotePlaceholder}
        autoFocus={autoFocus}
        className="text-[15px] italic leading-relaxed text-neutrals-charcoal"
      />
      <footer className="mt-2 flex items-center gap-1.5 text-[13px] text-neutrals-lead">
        <span className="text-accent">—</span>
        <PlainInline
          value={str(data.author)}
          onChange={(a) => onChange({ author: a || null })}
          placeholder={STRINGS.quoteAuthorPlaceholder}
          ariaLabel={STRINGS.quoteAuthorPlaceholder}
          className="font-semibold"
        />
      </footer>
    </blockquote>
  )
}
