/** עורך תיבת-הערה (שלב 6.3) — בורר-וריאנט (info/אזהרה/טיפ) + כותרת-נקייה +
 *  תוכן עשיר. משתמש ברכיב Alert של ה-DS AS-IS (כלל CLAUDE.md §6.1) עם שדות
 *  ניתנים-לעריכה בפנים; הנגן (NoteBlock) מרנדר אותו מבנה בדיוק. */
import { Alert } from '@/components/ui'
import { PlainInline } from '../../richtext/PlainInline'
import { RichTextField } from '../../richtext/RichTextField'
import { NOTE_TONE_OPTIONS, STRINGS } from '../../constants'
import { EditorIcon } from '../../editorIcons'
import { type BlockEditorProps, str } from './types'

const TONE_TO_KIND: Record<string, 'info' | 'success' | 'warning'> = {
  info: 'info',
  success: 'success',
  warning: 'warning',
}

export function NoteBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const tone = str(data.tone, 'info')
  const kind = TONE_TO_KIND[tone] ?? 'info'
  const content = str(data.content) || str(data.text)

  return (
    <div className="flex flex-col gap-2.5">
      <div role="group" aria-label={STRINGS.noteTone} className="flex flex-wrap gap-1.5">
        {NOTE_TONE_OPTIONS.map((opt) => {
          const active = tone === opt.value
          return (
            <button
              key={opt.value}
              type="button"
              aria-pressed={active}
              onClick={() => onChange({ tone: opt.value })}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-[11.5px] font-semibold transition-colors ${
                active
                  ? 'border-accent bg-hues-sky text-accent'
                  : 'border-neutrals-silver text-neutrals-lead'
              }`}
            >
              <EditorIcon name="note" size={13} />
              {opt.label}
            </button>
          )
        })}
      </div>

      {/* הכותרת מרונדרת בתוך גוף ה-Alert (לא ב-prop title, שעוטף ב-<p> ואוסר
          div בתוכו) — עדיין באותו מבנה חזותי של NoteBlock. */}
      <Alert kind={kind}>
        <div className="flex flex-col gap-1">
          <PlainInline
            value={str(data.title)}
            onChange={(t) => onChange({ title: t })}
            placeholder={STRINGS.noteTitlePlaceholder}
            ariaLabel={STRINGS.noteTitlePlaceholder}
            className="text-small font-semibold text-neutrals-charcoal"
          />
          <RichTextField
            value={content}
            onChange={(html) => onChange({ content: html })}
            placeholder={STRINGS.noteContentPlaceholder}
            ariaLabel={STRINGS.noteContentPlaceholder}
            autoFocus={autoFocus}
            className="text-[14px] leading-relaxed text-neutrals-charcoal"
          />
        </div>
      </Alert>
    </div>
  )
}
