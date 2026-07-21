/** עורך תמונה (שלב 6.3) — בחירת-מדיה + alt (חובה, מסמך 20) + כיתוב. עובד על
 *  צורת-התמונה-הבודדת (url/alt/caption); מאפס images[] כדי שהנגן ייפול למסלול
 *  ה-url. חיווי-נגישות ל-alt לפי design-export. */
import { PlainInline } from '../../richtext/PlainInline'
import { MediaField } from '../MediaField'
import { STRINGS } from '../../constants'
import { Icon } from '@/components/ui'
import { type BlockEditorProps, str } from './types'

function readUrl(data: Record<string, unknown>): string {
  if (str(data.url)) return str(data.url)
  const images = data.images
  if (Array.isArray(images) && images[0] && typeof images[0] === 'object') {
    return str((images[0] as { url?: unknown }).url)
  }
  return ''
}

export function ImageBlockEditor({ data, onChange }: BlockEditorProps) {
  const url = readUrl(data)
  const alt = str(data.alt)

  return (
    <div className="flex flex-col gap-3">
      <MediaField
        url={url}
        kind="image"
        ariaLabel={STRINGS.mediaUrlLabel}
        // מאפס images[] כך שהנגן משתמש בצורת ה-url הבודדת
        onChange={(next) => onChange({ url: next, images: null })}
      />

      <label className="flex flex-col gap-1">
        <span className="flex items-center gap-1.5 text-[11.5px] font-semibold text-neutrals-lead">
          {STRINGS.altLabel}
          {alt ? (
            <span className="inline-flex items-center gap-1 rounded-full bg-hues-mint px-2 py-0.5 text-[10.5px] text-success">
              <Icon name="Check" size={11} />
              {STRINGS.altPresent}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-full bg-hues-salmon px-2 py-0.5 text-[10.5px] text-caution">
              {STRINGS.altMissing}
            </span>
          )}
        </span>
        <input
          value={alt}
          onChange={(e) => onChange({ alt: e.target.value })}
          placeholder={STRINGS.altPlaceholder}
          className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-[11.5px] font-semibold text-neutrals-lead">
          {STRINGS.captionLabel}
        </span>
        <PlainInline
          value={str(data.caption)}
          onChange={(c) => onChange({ caption: c })}
          placeholder={STRINGS.captionPlaceholder}
          ariaLabel={STRINGS.captionLabel}
          className="min-h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 py-2.5 text-[13px] text-neutrals-charcoal"
        />
      </label>
    </div>
  )
}
