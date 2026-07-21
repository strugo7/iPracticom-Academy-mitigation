/**
 * עורך בלוק designed_section (שלב 6.5, מסמך 23 §1) — בורר-וריאנט (hero/callout/
 * card → data.layout) + שדות eyebrow/title/description. עיצוב מ-design-export/
 * Lesson Editor.dc.html (§designed_section). הנגן (DesignedSectionBlock) מרנדר
 * את השדות הגנריים; ה-layout נשמר עבור העיבוד העתידי (פער-נגן מתועד).
 */
import { PlainInline } from '../../richtext/PlainInline'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

const VARIANTS: { value: string; label: string }[] = [
  { value: 'hero', label: STRINGS.designedVariantHero },
  { value: 'callout', label: STRINGS.designedVariantCallout },
  { value: 'card', label: STRINGS.designedVariantCard },
]

export function DesignedSectionBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const layout = str(data.layout, 'callout')

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-neutrals-silver bg-white p-4">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold text-neutrals-nickel">
          {STRINGS.designedVariantLabel}:
        </span>
        {VARIANTS.map((v) => {
          const active = layout === v.value
          return (
            <button
              key={v.value}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ layout: v.value })
              }}
              className={`rounded-lg px-3 py-1 text-[12px] font-semibold transition-colors ${
                active
                  ? 'border border-hues-indigo bg-hues-sky text-accent'
                  : 'border border-neutrals-silver bg-white text-neutrals-lead hover:border-accent hover:text-accent'
              }`}
            >
              {v.label}
            </button>
          )
        })}
      </div>

      <div className="flex flex-col gap-2 rounded-xl border border-neutrals-silver bg-neutrals-whisper p-3.5">
        <PlainInline
          value={str(data.eyebrow)}
          onChange={(eyebrow) => onChange({ eyebrow })}
          placeholder={STRINGS.designedEyebrowPlaceholder}
          ariaLabel={STRINGS.designedEyebrowPlaceholder}
          className="min-h-8 rounded-lg bg-white px-3 py-1.5 text-[12px] font-semibold uppercase tracking-wide text-accent"
        />
        <PlainInline
          value={str(data.title)}
          onChange={(title) => onChange({ title })}
          placeholder={STRINGS.designedTitlePlaceholder}
          ariaLabel={STRINGS.designedTitlePlaceholder}
          autoFocus={autoFocus}
          className="min-h-10 rounded-lg bg-white px-3 py-2 text-[19px] font-semibold text-neutrals-charcoal"
        />
        <PlainInline
          value={str(data.description)}
          onChange={(description) => onChange({ description })}
          placeholder={STRINGS.designedDescPlaceholder}
          ariaLabel={STRINGS.designedDescPlaceholder}
          className="min-h-12 rounded-lg bg-white px-3 py-2 text-[14.5px] leading-relaxed text-neutrals-lead"
        />
      </div>
    </div>
  )
}
