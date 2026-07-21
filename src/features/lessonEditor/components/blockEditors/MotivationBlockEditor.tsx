/** עורך תיבה-מעוררת (שלב 6.3) — כותרת-נקייה + מסר עשיר, במסגרת המודגשת של
 *  MotivationBlock (הנגן מרנדר content=message כ-HTML). */
import { PlainInline } from '../../richtext/PlainInline'
import { RichTextField } from '../../richtext/RichTextField'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

export function MotivationBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const message = str(data.message) || str(data.content)
  return (
    <div className="flex items-start gap-3 rounded-xl border border-accent/20 bg-hues-sky/30 px-4 py-3">
      <div className="min-w-0 flex-1">
        <PlainInline
          value={str(data.title)}
          onChange={(t) => onChange({ title: t })}
          placeholder={STRINGS.motivationTitlePlaceholder}
          ariaLabel={STRINGS.motivationTitlePlaceholder}
          className="mb-1 text-[14.5px] font-semibold text-neutrals-charcoal"
        />
        <RichTextField
          value={message}
          onChange={(html) => onChange({ message: html })}
          placeholder={STRINGS.motivationMessagePlaceholder}
          ariaLabel={STRINGS.motivationMessagePlaceholder}
          autoFocus={autoFocus}
          className="text-[14.5px] leading-relaxed text-neutrals-charcoal"
        />
      </div>
    </div>
  )
}
