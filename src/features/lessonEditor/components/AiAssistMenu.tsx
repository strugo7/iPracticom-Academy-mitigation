/**
 * תפריט עוזר-ה-AI (שלב 6.5, מסמך 23 §2) — שדה-הנחיה, ארבע אפשרויות היצירה,
 * וקישור לגלריית-התבניות. עיצוב מ-design-export/Lesson Editor.dc.html (§AI menu).
 */
import { Icon } from '@/components/ui'
import { EditorIcon } from '../editorIcons'
import { STRINGS } from '../constants'
import { AI_TASK_OPTIONS, type AiTask } from '../services/aiAssistService'

interface AiAssistMenuProps {
  prompt: string
  onPromptChange: (value: string) => void
  onPickTask: (task: AiTask) => void
  onOpenTemplates: () => void
}

export function AiAssistMenu({
  prompt,
  onPromptChange,
  onPickTask,
  onOpenTemplates,
}: AiAssistMenuProps) {
  return (
    <div className="flex-1 p-5">
      <textarea
        value={prompt}
        onChange={(e) => onPromptChange(e.target.value)}
        placeholder={STRINGS.aiPromptPlaceholder}
        aria-label={STRINGS.aiPromptPlaceholder}
        rows={3}
        className="mb-4 min-h-[84px] w-full resize-none rounded-[13px] border border-neutrals-silver bg-neutrals-whisper px-3.5 py-3 text-[14px] leading-relaxed text-neutrals-lead outline-none transition-colors focus:border-accent focus:bg-white"
      />

      <div className="mb-2.5 text-[11.5px] font-semibold tracking-wide text-neutrals-nickel">
        {STRINGS.aiWhatToDo}
      </div>

      <div className="flex flex-col gap-2.5">
        {AI_TASK_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => onPickTask(opt.key)}
            className="flex items-center gap-3 rounded-[13px] border border-neutrals-silver bg-white p-3.5 text-start transition-colors hover:border-accent hover:bg-hues-sky/40"
          >
            <span
              className={`flex size-10 flex-none items-center justify-center rounded-[11px] ${opt.toneBg} ${opt.toneFg}`}
            >
              <EditorIcon name={opt.icon} size={18} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[14.5px] font-semibold text-neutrals-charcoal">
                {opt.label}
              </span>
              <span className="mt-0.5 block text-[12.5px] text-neutrals-nickel">
                {opt.desc}
              </span>
            </span>
            <Icon name="ChevronRight" size={17} className="flex-none text-neutrals-palladium" />
          </button>
        ))}
      </div>

      <button
        type="button"
        onClick={onOpenTemplates}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-hues-indigo bg-neutrals-whisper p-3 text-[13.5px] font-semibold text-accent transition-colors hover:bg-hues-sky/50"
      >
        <EditorIcon name="grid" size={16} aria-hidden />
        {STRINGS.aiOrTemplate}
      </button>
    </div>
  )
}
