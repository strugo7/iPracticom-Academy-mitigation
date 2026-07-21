/**
 * עורך בלוק gamma_embed (שלב 6.5, מסמך 23 §1) — עיצוב מ-design-export/Lesson
 * Editor.dc.html (§gamma_embed). שדה קישור-הטמעה + כותרת + תצוגה מקדימה. Gamma
 * היא אינטגרציה מאושרת (CLAUDE.md — תשתיות שנשארות). שמות-שדות: embed_url/title.
 */
import { EditorIcon } from '../../editorIcons'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

export function GammaEmbedBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const embedUrl = str(data.embed_url)
  const title = str(data.title)

  return (
    <div className="overflow-hidden rounded-2xl border border-neutrals-silver bg-white">
      <div className="flex items-center gap-2.5 border-b border-neutrals-silver bg-neutrals-whisper px-4 py-2.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-gradient-to-br from-hues-cobalt to-hues-bronze text-white">
          <EditorIcon name="gamma_embed" size={16} aria-hidden />
        </span>
        <span className="flex-1 text-[13.5px] font-semibold text-neutrals-charcoal">
          {STRINGS.gammaTitle}
        </span>
        {embedUrl && (
          <span className="flex-none rounded-full bg-hues-sky px-2.5 py-1 text-[11px] font-semibold text-accent">
            {STRINGS.gammaLinked}
          </span>
        )}
      </div>

      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-neutrals-lead">
            {STRINGS.gammaUrlLabel}
          </span>
          <input
            value={embedUrl}
            onChange={(e) => onChange({ embed_url: e.target.value })}
            placeholder={STRINGS.gammaUrlPlaceholder}
            dir="ltr"
            // biome-ignore lint/a11y/noAutofocus: הבלוק הנבחר ממקד את שדהו הראשי
            autoFocus={autoFocus}
            className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-start text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="text-[11.5px] font-semibold text-neutrals-lead">
            {STRINGS.gammaTitleLabel}
          </span>
          <input
            value={title}
            onChange={(e) => onChange({ title: e.target.value })}
            placeholder={STRINGS.gammaTitlePlaceholder}
            className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        </label>

        {embedUrl ? (
          <iframe
            src={embedUrl}
            title={title || STRINGS.gammaTitle}
            className="aspect-video w-full rounded-lg border border-neutrals-silver"
            allow="fullscreen"
            loading="lazy"
          />
        ) : (
          <div className="flex aspect-video w-full items-center justify-center rounded-lg border border-dashed border-neutrals-silver bg-neutrals-whisper px-4 text-center text-[13px] text-neutrals-lead">
            {STRINGS.gammaEmpty}
          </div>
        )}
      </div>
    </div>
  )
}
