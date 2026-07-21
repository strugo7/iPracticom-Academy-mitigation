/** עורך וידאו (שלב 6.3) — מקור-וידאו + פוסטר + כתוביות (URL). שומר
 *  {url, poster, captions} כפי שהנגן (VideoBlock) מצפה. */
import { MediaField } from '../MediaField'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

function UrlField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="text-[11.5px] font-semibold text-neutrals-lead">{label}</span>
      <input
        value={value}
        dir="ltr"
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder ?? STRINGS.mediaUrlPlaceholder}
        className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
      />
    </label>
  )
}

export function VideoBlockEditor({ data, onChange }: BlockEditorProps) {
  return (
    <div className="flex flex-col gap-3">
      <MediaField
        url={str(data.url)}
        kind="video"
        ariaLabel={STRINGS.mediaUrlLabel}
        onChange={(next) => onChange({ url: next })}
      />
      <UrlField
        label={STRINGS.videoPosterLabel}
        value={str(data.poster)}
        onChange={(v) => onChange({ poster: v || null })}
      />
      <UrlField
        label={STRINGS.videoCaptionsLabel}
        value={str(data.captions)}
        onChange={(v) => onChange({ captions: v || null })}
      />
    </div>
  )
}
