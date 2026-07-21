/** כותרת ה-ExamPlayer (מסמך 14 + design-export/Exam Player.dc.html — HEADER). */
import { Icon, ProgressBar } from '@/components/ui'
import { ExamTimer } from './ExamTimer'
import { GridToggleButton } from './GridToggleButton'

export interface ExamPlayerHeaderProps {
  examTitle: string
  currentIndex: number
  total: number
  secondsLeft: number
  onSubmit: () => void
  onToggleGrid: () => void
}

export function ExamPlayerHeader({
  examTitle,
  currentIndex,
  total,
  secondsLeft,
  onSubmit,
  onToggleGrid,
}: ExamPlayerHeaderProps) {
  return (
    <header className="flex-none border-b border-neutrals-silver bg-white shadow-[0_1px_3px_rgba(20,60,110,0.05)]">
      <div className="flex items-center justify-between gap-4 px-6 py-3">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <span className="flex h-10 w-10 flex-none items-center justify-center rounded-xl bg-accent-gradient text-white">
            <Icon name="File" size={18} />
          </span>
          <div className="min-w-0">
            <h1 className="truncate text-small font-semibold text-neutrals-charcoal">
              {examTitle}
            </h1>
            <p className="text-tiny text-neutrals-nickel">
              שאלה {currentIndex + 1} מתוך {total}
            </p>
          </div>
        </div>

        <ExamTimer secondsLeft={secondsLeft} />

        <div className="flex flex-1 items-center justify-start gap-2">
          <div className="lg:hidden">
            <GridToggleButton onClick={onToggleGrid} />
          </div>
          <button
            type="button"
            onClick={onSubmit}
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-accent-gradient px-4 text-tiny-bold text-white shadow-[0_8px_22px_rgba(0,117,219,0.26)]"
          >
            <Icon name="SuccessV" size={18} />
            <span className="hidden lg:inline">הגש מבחן</span>
          </button>
        </div>
      </div>
      <ProgressBar percent={((currentIndex + 1) / total) * 100} />
    </header>
  )
}
