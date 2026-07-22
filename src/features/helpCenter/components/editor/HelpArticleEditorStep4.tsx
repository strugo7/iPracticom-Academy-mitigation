import { Icon } from '@/components/ui'
import type { CategoryKey } from '../../types'
import { HELP_CATEGORIES } from '../../constants'
import type { EditorStepItem } from './HelpArticleEditorStep2'

interface HelpArticleEditorStep4Props {
  title: string
  shortDesc: string
  categoryKey: CategoryKey
  steps: EditorStepItem[]
  tip: string
}

export function HelpArticleEditorStep4({
  title,
  shortDesc,
  categoryKey,
  steps,
  tip,
}: HelpArticleEditorStep4Props) {
  const categoryLabel =
    HELP_CATEGORIES[categoryKey]?.label || 'איך המערכת בנויה'
  const validSteps = steps.filter((s) => s.text.trim().length > 0)

  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="mb-1">
        <h2 className="text-xl font-semibold text-neutrals-charcoal m-0">
          תצוגה מקדימה ופרסום
        </h2>
        <p className="text-sm text-neutrals-lead mt-1 m-0 leading-relaxed">
          כך יראה המאמר בעמוד מרכז העזרה עבור המשתמשים.
        </p>
      </div>

      {/* תצוגה מקדימה מוגמרת */}
      <article className="bg-white border border-neutrals-silver rounded-[20px] p-7 sm:p-8 shadow-sm space-y-4">
        {/* פירורי לחם */}
        <div className="flex items-center gap-2 text-xs text-neutrals-lead">
          <span>מרכז עזרה</span>
          <span>›</span>
          <span>{categoryLabel}</span>
          <span>›</span>
          <span className="font-semibold text-neutrals-charcoal">
            {title || 'כותרת המאמר'}
          </span>
        </div>

        {/* כותרת ותיאור */}
        <h1 className="font-semibold text-2xl leading-snug text-neutrals-charcoal m-0">
          {title || 'כותרת המאמר'}
        </h1>
        <p className="text-sm leading-relaxed text-neutrals-lead m-0 max-w-xl">
          {shortDesc || 'תיאור קצר של המאמר יופיע כאן.'}
        </p>

        {/* צעדים */}
        <div className="flex flex-col gap-3 pt-2">
          {validSteps.length > 0 ? (
            validSteps.map((st, idx) => (
              <div key={st.id} className="flex items-start gap-3">
                <span className="flex-none w-6 h-6 rounded-full bg-hues-sky text-accent font-semibold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <p className="flex-1 m-0 mt-0.5 text-sm leading-relaxed text-neutrals-charcoal">
                  {st.text}
                </p>
              </div>
            ))
          ) : (
            <p className="text-xs text-neutrals-nickel italic">
              טרם הוגדרו צעדים למאמר זה.
            </p>
          )}
        </div>

        {/* תיבת טיפ */}
        {tip && (
          <div className="flex items-start gap-3 bg-hues-sky/60 border border-accent/20 rounded-xl p-4 mt-4">
            <span className="flex-none w-6 h-6 rounded-lg bg-accent text-white flex items-center justify-center">
              <Icon name="Search" size={14} />
            </span>
            <p className="flex-1 m-0 mt-0.5 text-xs leading-relaxed text-accent font-medium">
              <strong className="font-semibold">טיפ: </strong>
              {tip}
            </p>
          </div>
        )}
      </article>

      {/* הערת מנהלים */}
      <section className="bg-neutrals-whisper rounded-2xl p-5 border border-neutrals-silver/60 flex items-center gap-3.5">
        <span className="flex-none size-9 rounded-xl bg-white text-accent flex items-center justify-center shadow-sm">
          <Icon name="File" size={18} />
        </span>
        <p className="m-0 text-xs leading-relaxed text-neutrals-lead">
          רק משתמשים בתפקיד "מנהל מערכת" רואים את כפתורי העריכה הללו. כל שאר
          המשתמשים יראו את המאמר בתצוגת קריאה בלבד.
        </p>
      </section>
    </div>
  )
}
