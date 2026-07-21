/** עורך כותרת (שלב 6.3) — טקסט-רגיל inline + בורר-רמה H1-H3. הנגן מזריק את
 *  data.text ל-h{level}, לכן שומרים טקסט-נקי (PlainInline) בלי תגיות-בלוק. */
import { PlainInline } from '../../richtext/PlainInline'
import { HEADING_LEVELS, STRINGS } from '../../constants'
import { type BlockEditorProps, str } from './types'

const SIZE_BY_LEVEL: Record<number, string> = {
  1: 'text-[26px]',
  2: 'text-[22px]',
  3: 'text-[19px]',
}

export function HeadingBlockEditor({ data, onChange, autoFocus }: BlockEditorProps) {
  const text = str(data.text) || str(data.content)
  const level = Math.min(Math.max(Math.round(Number(data.level)) || 2, 1), 3)

  return (
    <div className="flex flex-col gap-2">
      <div
        role="group"
        aria-label={STRINGS.headingLevel}
        className="flex w-fit gap-0.5 rounded-[10px] border border-neutrals-silver bg-neutrals-whisper p-0.5"
      >
        {HEADING_LEVELS.map((opt) => (
          <button
            key={opt.level}
            type="button"
            aria-pressed={level === opt.level}
            onClick={() => onChange({ level: opt.level })}
            className={`rounded-md px-2.5 py-1 text-[12px] font-semibold transition-all ${
              level === opt.level ? 'bg-white text-accent shadow-sm' : 'text-neutrals-lead'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
      <PlainInline
        value={text}
        onChange={(t) => onChange({ text: t })}
        placeholder={STRINGS.headingPlaceholder}
        ariaLabel={STRINGS.headingPlaceholder}
        autoFocus={autoFocus}
        className={`font-semibold leading-[1.22] text-neutrals-charcoal ${SIZE_BY_LEVEL[level]}`}
      />
    </div>
  )
}
