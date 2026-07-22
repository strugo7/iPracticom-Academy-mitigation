import { Icon } from '@/components/ui'

export interface EditorStepItem {
  id: string
  text: string
  showMedia: boolean
  mediaUrl?: string
}

interface HelpArticleEditorStep2Props {
  steps: EditorStepItem[]
  onAddStep: () => void
  onRemoveStep: (id: string) => void
  onUpdateStepText: (id: string, text: string) => void
  onToggleStepMedia: (id: string) => void
  tip: string
  onTipChange: (tip: string) => void
}

export function HelpArticleEditorStep2({
  steps,
  onAddStep,
  onRemoveStep,
  onUpdateStepText,
  onToggleStepMedia,
  tip,
  onTipChange,
}: HelpArticleEditorStep2Props) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="mb-1">
        <h2 className="text-xl font-semibold text-neutrals-charcoal m-0">
          שלבי ההסבר
        </h2>
        <p className="text-sm text-neutrals-lead mt-1 m-0 leading-relaxed">
          פרקו את המאמר לצעדים ממוספרים. לכל צעד אפשר לצרף תמונה או GIF להמחשה
          מפורטת.
        </p>
      </div>

      {/* רשימת צעדים */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutrals-silver/60 flex flex-col gap-4">
        <div className="flex flex-col gap-4">
          {steps.map((st, idx) => (
            <div
              key={st.id}
              className="flex flex-col gap-3 border border-neutrals-silver rounded-xl p-4 bg-white"
            >
              <div className="flex items-start gap-3">
                <span className="flex-none mt-2 w-7 h-7 rounded-lg bg-hues-sky text-accent font-semibold text-xs flex items-center justify-center">
                  {idx + 1}
                </span>
                <textarea
                  value={st.text}
                  onChange={(e) => onUpdateStepText(st.id, e.target.value)}
                  placeholder="תארו את הצעד…"
                  className="flex-1 min-w-0 min-h-[54px] resize-y p-3 rounded-xl border border-neutrals-silver bg-white text-sm leading-relaxed text-neutrals-charcoal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
                />
                {steps.length > 1 && (
                  <button
                    type="button"
                    onClick={() => onRemoveStep(st.id)}
                    title="הסר צעד"
                    className="flex-none mt-2 h-8 w-8 flex items-center justify-center rounded-lg text-neutrals-lead hover:bg-hues-salmon/50 hover:text-caution transition-colors cursor-pointer"
                  >
                    <Icon name="Close" size={16} />
                  </button>
                )}
              </div>

              {/* מדיה לצעד אם פתוח */}
              {st.showMedia && (
                <div className="ps-10 pt-1">
                  <div className="w-full max-w-sm h-32 rounded-xl border-2 border-dashed border-neutrals-silver bg-neutrals-silver/20 flex flex-col items-center justify-center p-3 text-center">
                    <Icon
                      name="File"
                      size={24}
                      className="text-neutrals-lead mb-1"
                    />
                    <span className="text-xs font-semibold text-neutrals-lead">
                      גררו תמונה או GIF של הצעד
                    </span>
                  </div>
                </div>
              )}

              <div className="ps-10">
                <button
                  type="button"
                  onClick={() => onToggleStepMedia(st.id)}
                  className="inline-flex items-center gap-1.5 border-none bg-transparent p-0 font-sans font-semibold text-xs text-accent cursor-pointer hover:underline"
                >
                  <Icon name="Search" size={14} />
                  {st.showMedia ? 'הסתר מדיה' : 'הוסף תמונה / GIF להסבר'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* כפתור הוספת צעד */}
        <button
          type="button"
          onClick={onAddStep}
          className="mt-2 inline-flex items-center justify-center gap-2 w-full h-11 rounded-xl border border-dashed border-accent bg-white text-accent font-semibold text-sm hover:bg-hues-sky/30 transition-all cursor-pointer"
        >
          <span className="text-lg font-bold">+</span>
          הוסף צעד
        </button>
      </section>

      {/* תיבת טיפ */}
      <section className="bg-hues-sky/50 rounded-2xl p-6 border border-accent/20">
        <label className="block font-semibold text-xs text-neutrals-charcoal mb-2">
          טיפ למאמר
        </label>
        <textarea
          value={tip}
          onChange={(e) => onTipChange(e.target.value)}
          placeholder="עצה קצרה ושימושית שתופיע בתיבת הטיפ בתחתית המאמר…"
          className="w-full min-h-[64px] resize-y p-3 px-4 rounded-xl border border-neutrals-silver bg-white text-sm leading-relaxed text-neutrals-charcoal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
        />
      </section>
    </div>
  )
}
