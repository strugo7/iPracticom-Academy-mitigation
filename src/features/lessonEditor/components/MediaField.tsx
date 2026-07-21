/**
 * בורר-מדיה של עורך-הבלוקים (שלב 6.3, מסמך 20 §3) — מקור לתמונה/וידאו/PDF.
 * מבוסס אזור-ה-media ב-design-export/Lesson Editor.dc.html: כפתור "בחר מספריית
 * מדיה" + תצוגה מקדימה. ספריית-המדיה המלאה (מסמך 15) נבנית בשלב 6.7 — עד אז
 * הזנת-כתובת ישירה היא המסלול, וכפתור-הספרייה חושף את שדה-הכתובת עם הבהרה.
 */
import { useState } from 'react'
import { Icon } from '@/components/ui'
import { STRINGS } from '../constants'
import { EditorIcon } from '../editorIcons'

type MediaKind = 'image' | 'video' | 'pdf'

interface MediaFieldProps {
  url: string
  onChange: (url: string) => void
  kind: MediaKind
  ariaLabel?: string
}

function Preview({ url, kind }: { url: string; kind: MediaKind }) {
  if (kind === 'image') {
    return <img src={url} alt="" className="max-h-64 w-full rounded-xl object-cover" />
  }
  if (kind === 'video') {
    return (
      // biome-ignore lint/a11y/useMediaCaption: כתוביות נבחרות בשדה נפרד בעורך הווידאו
      <video src={url} controls className="max-h-64 w-full rounded-xl bg-neutrals-charcoal" />
    )
  }
  return (
    <div className="flex items-center gap-3 rounded-xl border border-neutrals-silver bg-white p-4">
      <span className="flex size-10 flex-none items-center justify-center rounded-lg bg-hues-salmon text-caution">
        <Icon name="File" size={20} />
      </span>
      <span className="truncate text-[13.5px] text-neutrals-lead" dir="ltr">
        {url}
      </span>
    </div>
  )
}

export function MediaField({ url, onChange, kind, ariaLabel }: MediaFieldProps) {
  const [showUrl, setShowUrl] = useState(!url)

  return (
    <div className="flex flex-col gap-2.5">
      {url ? (
        <div className="relative">
          <Preview url={url} kind={kind} />
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-[10px] border border-neutrals-silver bg-white px-3 py-2 text-[12.5px] font-semibold text-neutrals-lead shadow-[0_4px_12px_rgba(20,60,110,.12)] transition-colors hover:text-accent"
          >
            <EditorIcon name="image" size={15} />
            {STRINGS.mediaReplace}
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-neutrals-silver bg-neutrals-whisper px-6 py-9 text-center">
          <span className="text-neutrals-palladium">
            <EditorIcon name={kind === 'video' ? 'video' : kind === 'pdf' ? 'pdf' : 'image'} size={40} />
          </span>
          <button
            type="button"
            onClick={() => setShowUrl(true)}
            className="inline-flex items-center gap-2 rounded-[10px] border border-neutrals-silver bg-white px-4 py-2.5 text-[13px] font-semibold text-neutrals-lead transition-colors hover:border-accent hover:text-accent"
          >
            <EditorIcon name="image" size={16} />
            {STRINGS.mediaPick}
          </button>
          <p className="m-0 max-w-xs text-[11.5px] leading-relaxed text-neutrals-nickel">
            {STRINGS.mediaLibrarySoon}
          </p>
        </div>
      )}

      {showUrl && (
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-neutrals-lead">
            {STRINGS.mediaUrlLabel}
          </span>
          <input
            value={url}
            dir="ltr"
            aria-label={ariaLabel ?? STRINGS.mediaUrlLabel}
            placeholder={STRINGS.mediaUrlPlaceholder}
            onChange={(e) => onChange(e.target.value)}
            className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        </label>
      )}
    </div>
  )
}
