/** עורך פסקת-טקסט (שלב 6.3) — עריכת inline עשירה דרך RichTextField, כותב ל-
 *  data.content (הנגן מעדיף content ?? text). */
import { RichTextField } from '../../richtext/RichTextField'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

export function TextBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const value = str(data.content) || str(data.text)
  return (
    <RichTextField
      value={value}
      onChange={(html) => onChange({ content: html })}
      placeholder={STRINGS.textPlaceholder}
      ariaLabel={STRINGS.paletteTitle}
      autoFocus={autoFocus}
      className="text-[15px] leading-relaxed text-neutrals-charcoal"
    />
  )
}
