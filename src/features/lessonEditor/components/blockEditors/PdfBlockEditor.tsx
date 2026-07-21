/** עורך מסמך-PDF (שלב 6.3) — מקור-מסמך + כותרת. שומר {url, title} כפי שהנגן
 *  (PdfBlock) מצפה. */
import { PlainInline } from '../../richtext/PlainInline'
import { MediaField } from '../MediaField'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

export function PdfBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <MediaField
        url={str(data.url)}
        kind="pdf"
        ariaLabel={STRINGS.mediaUrlLabel}
        onChange={(next) => onChange({ url: next })}
      />
      <label className="flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-neutrals-lead">
          {STRINGS.pdfTitleLabel}
        </span>
        <PlainInline
          value={str(data.title)}
          onChange={(t) => onChange({ title: t })}
          placeholder={STRINGS.pdfTitlePlaceholder}
          ariaLabel={STRINGS.pdfTitleLabel}
          autoFocus={autoFocus}
          className="min-h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 py-2.5 text-[13px] font-semibold text-neutrals-charcoal"
        />
      </label>
    </div>
  )
}
