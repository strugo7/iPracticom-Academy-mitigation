/**
 * מצבי-הריצה של עוזר-ה-AI (שלב 6.5, מסמך 23 §2): "מייצר…" עם 4 שלבי-הצינור
 * (מחלץ→חוקר→מייצר→מסיים), ו-"מוכן" עם הוספה-לקנבס. עיצוב מ-design-export/
 * Lesson Editor.dc.html (§generating / §done).
 */
import { Icon } from '@/components/ui'
import { EditorIcon } from '../editorIcons'
import { STRINGS } from '../constants'
import { AI_PIPELINE_STEPS, AI_TASK_LABEL, type AiTask } from '../services/aiAssistService'

interface AiAssistJobViewProps {
  mode: 'generating' | 'done'
  step: number
  task: AiTask
  onAccept: () => void
  onRetry: () => void
}

export function AiAssistJobView({ mode, step, task, onAccept, onRetry }: AiAssistJobViewProps) {
  const taskLabel = AI_TASK_LABEL[task]

  if (mode === 'generating') {
    return (
      <div className="flex flex-1 flex-col justify-center px-7 py-6">
        <div className="mb-6 flex flex-col items-center text-center">
          <span className="mb-4 flex size-16 animate-pulse items-center justify-center rounded-[18px] bg-accent-gradient text-white shadow-[0_12px_30px_rgba(0,117,219,.4)]">
            <EditorIcon name="ai_generated" size={30} aria-hidden />
          </span>
          <div className="text-[18px] font-semibold text-neutrals-charcoal">
            {STRINGS.aiGeneratingTitle(taskLabel)}
          </div>
          <div className="mt-1 text-[13px] text-neutrals-nickel">
            {STRINGS.aiGeneratingHint}
          </div>
        </div>

        <ol className="flex flex-col gap-0.5">
          {AI_PIPELINE_STEPS.map((label, i) => {
            const done = step > i
            const active = step === i
            return (
              <li key={label} className="flex items-center gap-3 px-1.5 py-2.5">
                <span
                  className={`flex size-[26px] flex-none items-center justify-center rounded-full transition-colors ${
                    done
                      ? 'bg-success text-white'
                      : active
                        ? 'bg-accent text-white'
                        : 'bg-hues-sky text-neutrals-palladium'
                  }`}
                >
                  {done ? (
                    <Icon name="Check" size={14} />
                  ) : active ? (
                    <span className="size-3 animate-spin rounded-full border-2 border-white/50 border-t-white" />
                  ) : null}
                </span>
                <span
                  className={`flex-1 text-[14.5px] transition-colors ${
                    step >= i
                      ? 'font-semibold text-neutrals-charcoal'
                      : 'text-neutrals-nickel'
                  }`}
                >
                  {label}
                </span>
              </li>
            )
          })}
        </ol>
      </div>
    )
  }

  // done
  return (
    <div className="flex flex-1 flex-col p-5">
      <div className="mb-3.5 flex items-center gap-2.5">
        <span className="flex size-[30px] items-center justify-center rounded-[9px] bg-hues-mint text-success">
          <Icon name="Check" size={17} />
        </span>
        <div className="text-[15.5px] font-semibold text-neutrals-charcoal">
          {STRINGS.aiReadyTitle(taskLabel)}
        </div>
      </div>

      <div className="flex-1 rounded-[13px] border border-hues-sky bg-neutrals-whisper p-4">
        <div className="mb-1.5 text-[15px] font-semibold text-neutrals-charcoal">
          {taskLabel}
        </div>
        <p className="m-0 text-[14px] leading-relaxed text-neutrals-lead">
          {STRINGS.aiGenReviewNote}
        </p>
        <span className="mt-3 inline-flex items-center rounded-full border border-hues-sky bg-white px-2.5 py-1 text-[11.5px] font-semibold text-accent">
          {STRINGS.aiResultTagParagraph}
        </span>
      </div>

      <div className="mt-3.5 flex gap-2.5">
        <button
          type="button"
          onClick={onRetry}
          className="flex flex-none items-center gap-1.5 rounded-[11px] border border-hues-indigo bg-white px-4 py-2.5 text-[13.5px] font-semibold text-accent transition-colors hover:bg-neutrals-whisper"
        >
          <EditorIcon name="refresh" size={15} aria-hidden />
          {STRINGS.aiRetry}
        </button>
        <button
          type="button"
          onClick={onAccept}
          className="flex flex-1 items-center justify-center gap-2 rounded-[11px] bg-accent px-4 py-2.5 text-[14px] font-semibold text-white shadow-[0_8px_20px_rgba(0,117,219,.26)] transition-colors hover:bg-[#0059A8]"
        >
          <Icon name="Plus" size={16} />
          {STRINGS.aiAddToCanvas}
        </button>
      </div>
    </div>
  )
}
