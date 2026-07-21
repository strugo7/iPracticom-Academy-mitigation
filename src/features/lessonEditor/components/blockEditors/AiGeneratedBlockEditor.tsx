/**
 * עורך בלוק ai_generated (שלב 6.5, מסמך 23 §1) — עיצוב מ-design-export/Lesson
 * Editor.dc.html (§ai_generated). שדה prompt, כפתור "צור מחדש", תוצאה עשירה
 * ניתנת-לעריכה, תג-מודל ותזכורת-אוצרות. שמות-שדות תואמים לסכמת-הנגן
 * (prompt/generatedContent).
 */
import { RichTextField } from '../../richtext/RichTextField'
import { EditorIcon } from '../../editorIcons'
import { STRINGS } from '../../constants'
import { regenerateAiContent } from '../../services/aiAssistService'
import { type BlockEditorProps, str } from './types'

export function AiGeneratedBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const prompt = str(data.prompt)

  return (
    <div className="overflow-hidden rounded-2xl border border-hues-sky bg-gradient-to-b from-neutrals-whisper to-white">
      <div className="flex items-center gap-2.5 border-b border-hues-sky bg-hues-sky px-4 py-2.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-accent-gradient text-white">
          <EditorIcon name="ai_generated" size={16} aria-hidden />
        </span>
        <span className="flex-1 text-[13.5px] font-semibold text-hues-cobalt">
          תוכן שנוצר ב-AI
        </span>
        <span className="inline-flex flex-none items-center gap-1.5 rounded-full border border-hues-sky bg-white px-2.5 py-1 text-[10.5px] font-semibold text-accent">
          <span className="size-1.5 rounded-full bg-accent" />
          {STRINGS.aiGenModelTag}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] font-semibold text-neutrals-lead">
            {STRINGS.aiGenPromptLabel}
          </span>
          <div className="flex items-start gap-2.5">
            <textarea
              value={prompt}
              onChange={(e) => onChange({ prompt: e.target.value })}
              placeholder={STRINGS.aiGenPromptPlaceholder}
              // biome-ignore lint/a11y/noAutofocus: הבלוק הנבחר ממקד את שדהו הראשי
              autoFocus={autoFocus}
              rows={2}
              className="min-h-11 flex-1 resize-y rounded-[11px] border border-hues-sky bg-white px-3 py-2.5 text-[13.5px] leading-relaxed text-neutrals-lead outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onChange({ generatedContent: regenerateAiContent(prompt) })
              }}
              className="flex flex-none items-center gap-1.5 self-stretch rounded-[11px] bg-accent px-3.5 text-[13px] font-semibold text-white shadow-[0_6px_16px_rgba(0,117,219,.28)] transition-colors hover:bg-[#0059A8]"
            >
              <EditorIcon name="refresh" size={15} aria-hidden />
              {STRINGS.aiGenRegenerate}
            </button>
          </div>
        </label>

        <div className="flex items-center gap-2">
          <span className="flex-none text-[11px] font-semibold text-neutrals-lead">
            {STRINGS.aiGenResultLabel}
          </span>
          <span className="h-px flex-1 bg-hues-sky" />
        </div>

        <RichTextField
          value={str(data.generatedContent)}
          onChange={(html) => onChange({ generatedContent: html })}
          placeholder={STRINGS.aiGenResultPlaceholder}
          ariaLabel={STRINGS.aiGenResultLabel}
          className="rounded-[11px] border border-hues-sky bg-white px-4 py-3 text-[15px] leading-loose text-neutrals-charcoal"
        />

        <div className="flex items-center gap-1.5 text-[11.5px] text-neutrals-lead">
          <EditorIcon name="note" size={13} aria-hidden />
          {STRINGS.aiGenReviewNote}
        </div>
      </div>
    </div>
  )
}
