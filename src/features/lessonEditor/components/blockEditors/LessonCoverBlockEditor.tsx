/** עורך עטיפת-שיעור (שלב 6.3) — כותרת-שער מעוצבת: כותרת + תת-כותרת (טקסט-נקי
 *  לבן), בורר-gradient מותגי, ותמונת-רקע. שומר {title, subtitle, image,
 *  gradient} כפי שהנגן (LessonCoverBlock) מצפה. */
import { PlainInline } from '../../richtext/PlainInline'
import { MediaField } from '../MediaField'
import { COVER_GRADIENT_OPTIONS, STRINGS } from '../../constants'
import { Icon } from '@/components/ui'
import { type BlockEditorProps, str } from './types'

const WHITE_PLACEHOLDER = '[&:empty]:before:text-white/60'

export function LessonCoverBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const gradient = typeof data.gradient === 'string' ? data.gradient : null
  const image = str(data.image)

  return (
    <div className="flex flex-col gap-3">
      <div
        className="flex flex-col items-center justify-center gap-2 rounded-2xl bg-accent-gradient px-8 py-12 text-center"
        style={{
          ...(gradient ? { background: gradient } : {}),
          ...(image
            ? { backgroundImage: `linear-gradient(rgba(10,30,60,.55),rgba(10,30,60,.55)),url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }
            : {}),
        }}
      >
        <PlainInline
          value={str(data.title)}
          onChange={(t) => onChange({ title: t })}
          placeholder={STRINGS.coverTitlePlaceholder}
          ariaLabel={STRINGS.coverTitlePlaceholder}
          autoFocus={autoFocus}
          className={`text-[24px] font-semibold text-white ${WHITE_PLACEHOLDER}`}
        />
        <PlainInline
          value={str(data.subtitle)}
          onChange={(s) => onChange({ subtitle: s || null })}
          placeholder={STRINGS.coverSubtitlePlaceholder}
          ariaLabel={STRINGS.coverSubtitlePlaceholder}
          className={`text-[15px] text-white/90 ${WHITE_PLACEHOLDER}`}
        />
      </div>

      <div>
        <span className="mb-1.5 block text-[11.5px] font-semibold text-neutrals-lead">
          {STRINGS.coverGradientLabel}
        </span>
        <div className="flex flex-wrap items-center gap-2">
          {COVER_GRADIENT_OPTIONS.map((opt) => {
            const active = gradient === opt.value
            return (
              <button
                key={opt.label}
                type="button"
                aria-label={opt.label}
                aria-pressed={active}
                onClick={() => onChange({ gradient: opt.value })}
                style={{ background: opt.preview }}
                className={`flex size-9 items-center justify-center rounded-[10px] transition-transform hover:scale-105 ${
                  active ? 'ring-2 ring-accent ring-offset-2' : ''
                }`}
              >
                {active && <Icon name="Check" size={15} className="text-white" />}
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <span className="mb-1.5 block text-[11.5px] font-semibold text-neutrals-lead">
          {STRINGS.coverImageLabel}
        </span>
        <MediaField
          url={image}
          kind="image"
          ariaLabel={STRINGS.coverImageLabel}
          onChange={(next) => onChange({ image: next || null })}
        />
      </div>
    </div>
  )
}
