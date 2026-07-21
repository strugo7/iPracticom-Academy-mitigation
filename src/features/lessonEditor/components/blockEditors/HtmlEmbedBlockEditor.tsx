/**
 * עורך בלוק html_embed (שלב 6.5, מסמך 23 §1) — עיצוב מ-design-export/Lesson
 * Editor.dc.html (§html_embed). מתג URL↔קוד, שדה גובה, אזהרת תוכן-חיצוני
 * ותצוגה מקדימה מסונדקת. התצוגה משתמשת ב-HtmlEmbedBlock של הנגן AS-IS (iframe
 * sandbox — לעולם לא הזרקה ל-DOM של האפליקציה).
 */
import { useState } from 'react'
import { HtmlEmbedBlock } from '@/components/blocks/ai/HtmlEmbedBlock'
import type { ParsedBlockDataMap } from '@/features/lessonPlayer/blockSchemas'
import { Icon } from '@/components/ui'
import { EditorIcon } from '../../editorIcons'
import { STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

type EmbedMode = 'url' | 'code'

function readCode(data: Record<string, unknown>): string {
  return str(data.html) || str(data.html_content) || str(data.sanitized_html)
}

function readHeight(data: Record<string, unknown>): number {
  return typeof data.iframe_height === 'number' ? data.iframe_height : 420
}

export function HtmlEmbedBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const url = str(data.iframe_url)
  const code = readCode(data)
  const height = readHeight(data)
  const [mode, setMode] = useState<EmbedMode>(url || !code ? 'url' : 'code')
  const hasContent = Boolean(url || code)

  return (
    <div className="overflow-hidden rounded-2xl border border-neutrals-silver bg-white">
      <div className="flex items-center gap-2.5 border-b border-neutrals-silver bg-neutrals-whisper px-4 py-2.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-lg bg-neutrals-charcoal text-[#7CCBFF]">
          <EditorIcon name="html_embed" size={15} aria-hidden />
        </span>
        <span className="flex-1 text-[13.5px] font-semibold text-neutrals-charcoal">
          {STRINGS.htmlEmbedTitle}
        </span>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <div className="inline-flex w-fit gap-0.5 rounded-[10px] border border-neutrals-silver bg-neutrals-whisper p-0.5">
          {(['url', 'code'] as const).map((m) => (
            <button
              key={m}
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                setMode(m)
              }}
              className={`rounded-lg px-3 py-1.5 text-[12.5px] font-semibold transition-colors ${
                mode === m ? 'bg-white text-accent shadow-sm' : 'text-neutrals-lead'
              }`}
            >
              {m === 'url' ? STRINGS.htmlEmbedModeUrl : STRINGS.htmlEmbedModeCode}
            </button>
          ))}
        </div>

        {mode === 'url' ? (
          <input
            value={url}
            // מנקה את מסלול-הקוד כך שהנגן מעדיף iframe_url (סדר-עדיפות ב-BlockRenderer)
            onChange={(e) =>
              onChange({
                iframe_url: e.target.value,
                html: null,
                html_content: null,
                sanitized_html: null,
              })
            }
            placeholder={STRINGS.htmlEmbedUrlPlaceholder}
            dir="ltr"
            // biome-ignore lint/a11y/noAutofocus: הבלוק הנבחר ממקד את שדהו הראשי
            autoFocus={autoFocus}
            className="h-10 rounded-[10px] border border-neutrals-silver bg-white px-3 text-start text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        ) : (
          <textarea
            value={code}
            onChange={(e) => onChange({ html: e.target.value, iframe_url: null })}
            placeholder={STRINGS.htmlEmbedCodePlaceholder}
            dir="ltr"
            rows={4}
            className="resize-y rounded-[10px] border border-neutrals-silver bg-white px-3 py-2.5 text-start font-mono text-[12.5px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        )}

        <label className="flex w-fit items-center gap-2">
          <span className="text-[11.5px] font-semibold text-neutrals-lead">
            {STRINGS.htmlEmbedHeightLabel}
          </span>
          <input
            type="number"
            min={120}
            max={1200}
            value={height}
            onChange={(e) => onChange({ iframe_height: Number(e.target.value) || 420 })}
            className="h-9 w-24 rounded-[10px] border border-neutrals-silver bg-white px-3 text-[13px] text-neutrals-charcoal outline-none focus:border-accent"
          />
        </label>

        {hasContent ? (
          <HtmlEmbedBlock data={data as ParsedBlockDataMap['html_embed']} />
        ) : (
          <div className="flex h-40 w-full items-center justify-center rounded-lg border border-dashed border-neutrals-silver bg-neutrals-whisper px-4 text-center text-[13px] text-neutrals-lead">
            {STRINGS.htmlEmbedEmpty}
          </div>
        )}

        <div className="flex items-center gap-2 rounded-lg bg-hues-yellow/20 px-3 py-2 text-[12px] font-semibold text-[#8A6A12]">
          <Icon name="Warning" size={14} />
          {STRINGS.htmlEmbedWarning}
        </div>
      </div>
    </div>
  )
}
