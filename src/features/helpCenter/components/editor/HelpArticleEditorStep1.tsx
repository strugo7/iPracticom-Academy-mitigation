import { Icon } from '@/components/ui'
import { HELP_CATEGORIES, CATEGORY_ORDER } from '../../constants'
import type { CategoryKey } from '../../types'

interface HelpArticleEditorStep1Props {
  title: string
  onTitleChange: (v: string) => void
  shortDesc: string
  onShortDescChange: (v: string) => void
  status: 'draft' | 'published'
  onStatusChange: (status: 'draft' | 'published') => void
  categoryKey: CategoryKey
  onCategoryKeyChange: (catKey: CategoryKey) => void
}

export function HelpArticleEditorStep1({
  title,
  onTitleChange,
  shortDesc,
  onShortDescChange,
  status,
  onStatusChange,
  categoryKey,
  onCategoryKeyChange,
}: HelpArticleEditorStep1Props) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="mb-1">
        <h2 className="text-xl font-semibold text-neutrals-charcoal m-0">
          פרטי בסיס
        </h2>
        <p className="text-sm text-neutrals-lead mt-1 m-0 leading-relaxed">
          הכותרת והתיאור שיופיעו על כרטיס המאמר בעץ ובגריד.
        </p>
      </div>

      {/* כותרת, תיאור וסטטוס */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutrals-silver/60 flex flex-col gap-5">
        <div>
          <label className="block font-semibold text-xs text-neutrals-charcoal mb-2">
            כותרת המאמר <span className="text-caution">*</span>
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="לדוגמה: הגדרת שלוחות SoftPhone"
            className="w-full h-12 px-4 rounded-xl border border-neutrals-silver bg-white text-base font-semibold text-neutrals-charcoal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="font-semibold text-xs text-neutrals-charcoal">
              תיאור קצר{' '}
              <span className="font-normal text-neutrals-lead">
                · מוצג על הכרטיס
              </span>
            </label>
            <span className="text-xs text-neutrals-lead font-mono">
              {shortDesc.length} / 160
            </span>
          </div>
          <textarea
            value={shortDesc}
            onChange={(e) => onShortDescChange(e.target.value.slice(0, 160))}
            maxLength={160}
            placeholder="משפט אחד שמסביר במה עוסק המאמר…"
            className="w-full min-h-[76px] resize-y p-3 px-4 rounded-xl border border-neutrals-silver bg-white text-sm leading-relaxed text-neutrals-charcoal outline-none focus:border-accent focus:ring-2 focus:ring-accent/20 transition-all"
          />
        </div>

        <div>
          <label className="block font-semibold text-xs text-neutrals-charcoal mb-2">
            סטטוס פרסום
          </label>
          <div className="flex items-center gap-2 p-1 bg-neutrals-silver/30 rounded-xl max-w-xs">
            <button
              type="button"
              onClick={() => onStatusChange('draft')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                status === 'draft'
                  ? 'bg-white text-neutrals-charcoal shadow-sm'
                  : 'text-neutrals-lead hover:text-neutrals-charcoal'
              }`}
            >
              טיוטה
            </button>
            <button
              type="button"
              onClick={() => onStatusChange('published')}
              className={`flex-1 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                status === 'published'
                  ? 'bg-accent text-white shadow-sm'
                  : 'text-neutrals-lead hover:text-neutrals-charcoal'
              }`}
            >
              פורסם
            </button>
          </div>
        </div>
      </section>

      {/* בחירת קטגוריה */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutrals-silver/60">
        <label className="block font-semibold text-xs text-neutrals-charcoal mb-3">
          קטגוריה במרכז העזרה <span className="text-caution">*</span>
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {CATEGORY_ORDER.map((key) => {
            const cat = HELP_CATEGORIES[key]
            const isSelected = categoryKey === key
            return (
              <button
                key={key}
                type="button"
                onClick={() => onCategoryKeyChange(key)}
                className={`flex flex-col items-start gap-2 border-[1.5px] rounded-xl p-3.5 cursor-pointer text-start transition-all font-sans ${
                  isSelected
                    ? 'border-accent bg-hues-sky/40 shadow-sm'
                    : 'border-neutrals-silver bg-white hover:border-neutrals-lead/40'
                }`}
              >
                <span
                  className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'bg-accent text-white'
                      : 'bg-neutrals-silver/40 text-neutrals-lead'
                  }`}
                >
                  <Icon name="File" size={16} />
                </span>
                <span
                  className={`font-semibold text-xs ${
                    isSelected ? 'text-accent' : 'text-neutrals-charcoal'
                  }`}
                >
                  {cat.label}
                </span>
              </button>
            )
          })}
        </div>
      </section>
    </div>
  )
}
