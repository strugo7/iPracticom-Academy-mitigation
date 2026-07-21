/**
 * מגירת עוזר-ה-AI (שלב 6.5, מסמך 23 §2) — מעטפת overlay+aside שמנתבת בין תפריט
 * היצירה, מצב-הייצור ומצב-"מוכן". עיצוב מ-design-export/Lesson Editor.dc.html
 * (§AI ASSISTANT DRAWER). מבנה-המגירה עקבי עם VersionHistoryDrawer של העורך.
 */
import { IconButton, Icon } from '@/components/ui'
import { EditorIcon } from '../editorIcons'
import { STRINGS } from '../constants'
import type { AiAssistController } from '../hooks/useAiAssist'
import { AiAssistMenu } from './AiAssistMenu'
import { AiAssistJobView } from './AiAssistJobView'

interface AiAssistPanelProps {
  ai: AiAssistController
  onOpenTemplates: () => void
}

export function AiAssistPanel({ ai, onOpenTemplates }: AiAssistPanelProps) {
  if (!ai.open) return null

  return (
    <div className="fixed inset-0 z-[80] flex justify-start" role="dialog" aria-modal="true">
      {/* biome-ignore lint/a11y/useKeyWithClickEvents: לוח-אחורי; סגירה זמינה גם בכפתור ה-X */}
      <div
        className="absolute inset-0 bg-charcoal/35"
        onClick={ai.closePanel}
        aria-hidden
      />
      <aside
        dir="rtl"
        aria-label={STRINGS.aiAssistant}
        className="relative flex h-full w-[420px] max-w-full flex-col overflow-y-auto bg-white shadow-[0_0_60px_rgba(20,60,110,.3)]"
      >
        <div className="flex flex-none items-center justify-between gap-3 border-b border-neutrals-silver bg-gradient-to-l from-hues-sky to-white px-5 py-5">
          <div className="flex items-center gap-3">
            <span className="flex size-[42px] items-center justify-center rounded-xl bg-accent-gradient text-white shadow-[0_8px_18px_rgba(0,117,219,.32)]">
              <EditorIcon name="spark" size={22} aria-hidden />
            </span>
            <div>
              <h3 className="m-0 text-[18px] font-semibold text-neutrals-charcoal">
                {STRINGS.aiTitle}
              </h3>
              <p className="m-0 mt-0.5 text-[12.5px] font-semibold text-accent">
                {STRINGS.aiSubtitle}
              </p>
            </div>
          </div>
          <IconButton variant="ghost" size="md" aria-label={STRINGS.close} onClick={ai.closePanel}>
            <Icon name="Close" size={18} />
          </IconButton>
        </div>

        {ai.mode === 'menu' ? (
          <AiAssistMenu
            prompt={ai.prompt}
            onPromptChange={ai.setPrompt}
            onPickTask={ai.runTask}
            onOpenTemplates={onOpenTemplates}
          />
        ) : (
          <AiAssistJobView
            mode={ai.mode}
            step={ai.step}
            task={ai.task}
            onAccept={ai.accept}
            onRetry={() => ai.runTask(ai.task)}
          />
        )}
      </aside>
    </div>
  )
}
