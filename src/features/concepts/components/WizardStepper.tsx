/**
 * מחוון-שלבים של האשף — פער-DS מאומת (Stepper אינו מבין 78 קומפוננטות ה-DS,
 * CLAUDE.md §6.1). מומש לפי נוהל-הפער שלב 1, מ-`design-export/Term Editor.dc.html`
 * שורות 48-58: עיגול 40px + קו-חיבור 3px, שלב שהושלם מוצג עם וי (אייקון DS).
 */
import { Icon } from '@/components/ui'
import { WIZARD_STEPS } from '../constants'

interface WizardStepperProps {
  current: number
  onPick: (step: number) => void
}

export function WizardStepper({ current, onPick }: WizardStepperProps) {
  return (
    <ol className="mx-auto flex max-w-[720px] items-center">
      {WIZARD_STEPS.map((item, index) => {
        const done = item.step < current
        const active = item.step === current
        const circle = done
          ? 'bg-accent text-white border-accent'
          : active
            ? 'bg-white text-accent border-accent shadow-card'
            : 'bg-white text-neutrals-nickel border-neutrals-silver'

        return (
          // השלב הראשון הוא כפתור בלבד; משלב 2 והלאה ה-li מכיל גם קו-חיבור שגדל
          <li
            key={item.step}
            className={`flex items-center ${index === 0 ? 'flex-none' : 'flex-1'}`}
          >
            {index > 0 && (
              <span
                aria-hidden="true"
                className={`mb-6 h-[3px] flex-1 rounded-sm transition-colors ${
                  done || active ? 'bg-accent' : 'bg-neutrals-silver'
                }`}
              />
            )}
            <button
              type="button"
              onClick={() => onPick(item.step)}
              aria-current={active ? 'step' : undefined}
              className="flex w-24 flex-none flex-col items-center gap-2"
            >
              <span
                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 text-[15px] font-semibold transition-all ${circle}`}
              >
                {done ? <Icon name="Check" size={18} /> : item.step}
              </span>
              <span
                className={`whitespace-nowrap text-small transition-colors ${
                  active
                    ? 'font-semibold text-neutrals-charcoal'
                    : 'text-neutrals-lead'
                }`}
              >
                {item.label}
              </span>
            </button>
          </li>
        )
      })}
    </ol>
  )
}
