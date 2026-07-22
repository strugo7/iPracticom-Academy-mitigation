import { useEffect, useRef, useState } from 'react'
import { Badge, Icon } from '@/components/ui'
import type { TutorialPosition, TutorialStep } from './types'

interface TutorialCardProps {
  step: TutorialStep
  currentStepIndex: number
  totalSteps: number
  onNext: () => void
  onPrev: () => void
  onSkip: () => void
  isOpen: boolean
}

export function TutorialCard({
  step,
  currentStepIndex,
  totalSteps,
  onNext,
  onPrev,
  onSkip,
  isOpen,
}: TutorialCardProps) {
  const cardRef = useRef<HTMLDivElement>(null)
  const [cardStyle, setCardStyle] = useState<React.CSSProperties>({})

  useEffect(() => {
    if (!isOpen) return

    const updatePosition = () => {
      if (!step.highlightSelector) {
        // מרכז המסך
        setCardStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        })
        return
      }

      const targetEl = document.querySelector(step.highlightSelector)
      if (!targetEl) {
        setCardStyle({
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
        })
        return
      }

      const bounds = targetEl.getBoundingClientRect()
      const pos: TutorialPosition = step.position ?? 'bottom'
      const margin = 16

      let top: number
      let left: number

      switch (pos) {
        case 'bottom':
          top = bounds.bottom + margin
          left = bounds.left + bounds.width / 2 - 180
          break
        case 'top':
          top = bounds.top - margin - 220
          left = bounds.left + bounds.width / 2 - 180
          break
        case 'left':
          top = bounds.top + bounds.height / 2 - 110
          left = bounds.left - margin - 360
          break
        case 'right':
          top = bounds.top + bounds.height / 2 - 110
          left = bounds.right + margin
          break
        case 'center':
        default:
          top = window.innerHeight / 2 - 110
          left = window.innerWidth / 2 - 180
          break
      }

      // שמירה על גבולות המסך (Screen boundary clamping)
      const maxLeft = window.innerWidth - 380
      const maxTop = window.innerHeight - 260

      left = Math.max(16, Math.min(left, maxLeft))
      top = Math.max(16, Math.min(top, maxTop))

      setCardStyle({
        position: 'fixed',
        top: `${top}px`,
        left: `${left}px`,
      })
    }

    updatePosition()
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true)

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [step, isOpen])

  if (!isOpen) return null

  const progressPercent = Math.round(
    ((currentStepIndex + 1) / totalSteps) * 100,
  )
  const isFirst = currentStepIndex === 0
  const isLast = currentStepIndex === totalSteps - 1

  return (
    <div
      ref={cardRef}
      dir="rtl"
      style={cardStyle}
      className="z-50 w-[360px] sm:w-[400px] overflow-hidden rounded-[20px] border border-white/40 bg-white/95 text-neutrals-charcoal shadow-2xl backdrop-blur-xl transition-all duration-300 animate-in fade-in zoom-in-95"
    >
      {/* פס התקדמות עליון */}
      <div className="w-full bg-neutrals-silver/40 h-1.5">
        <div
          className="bg-accent h-full transition-all duration-300"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* כותרת הכרטיס */}
      <div className="flex items-center justify-between px-5 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <Badge color="accent">{`שלב ${currentStepIndex + 1} מתוך ${totalSteps}`}</Badge>
          <span className="text-xs font-semibold text-neutrals-lead">
            מרכז העזרה
          </span>
        </div>
        <button
          type="button"
          onClick={onSkip}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-neutrals-lead hover:bg-neutrals-silver/50 hover:text-neutrals-charcoal transition-colors"
          title="דלג וסגור"
        >
          <Icon name="Close" size={16} />
        </button>
      </div>

      {/* תוכן הכרטיס */}
      <div className="px-5 py-2 space-y-3">
        <h3 className="m-0 text-lg font-bold text-neutrals-charcoal leading-snug">
          {step.title}
        </h3>
        <p className="m-0 text-sm leading-relaxed text-neutrals-lead">
          {step.content}
        </p>

        {/* תיבת טיפ ממרכז העזרה */}
        {step.tip && (
          <div className="flex items-start gap-2.5 rounded-xl bg-hues-sky/50 border border-accent/20 p-3">
            <span className="flex-none text-accent mt-0.5">
              <Icon name="Search" size={15} />
            </span>
            <p className="m-0 text-xs leading-relaxed text-accent font-medium">
              <strong className="font-bold">טיפ: </strong>
              {step.tip}
            </p>
          </div>
        )}
      </div>

      {/* פוטר וכפתורים */}
      <div className="flex items-center justify-between border-t border-neutrals-silver/50 px-5 py-3.5 bg-[#F8FBFE] mt-2">
        {/* נקודות אינדיקטורים */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalSteps }).map((_, idx) => (
            <span
              key={idx}
              className={`h-2 rounded-full transition-all duration-200 ${
                idx === currentStepIndex
                  ? 'w-5 bg-accent'
                  : 'w-2 bg-neutrals-silver'
              }`}
            />
          ))}
        </div>

        {/* כפתורי ניווט */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              type="button"
              onClick={onPrev}
              className="inline-flex items-center h-8 px-3 rounded-xl border border-neutrals-silver bg-white text-xs font-semibold text-neutrals-charcoal hover:bg-neutrals-whisper transition-colors cursor-pointer"
            >
              הקודם
            </button>
          )}
          <button
            type="button"
            onClick={onNext}
            className="inline-flex items-center h-8 px-4 rounded-xl bg-accent text-white text-xs font-semibold hover:bg-hues-cobalt transition-colors shadow-md cursor-pointer"
          >
            {isLast ? 'סיום' : 'הבא'}
          </button>
        </div>
      </div>
    </div>
  )
}
