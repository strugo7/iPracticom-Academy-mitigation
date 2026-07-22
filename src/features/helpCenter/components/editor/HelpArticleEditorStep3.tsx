import { Icon } from '@/components/ui'

interface HelpArticleEditorStep3Props {
  heroCoverUrl?: string
  onHeroCoverUrlChange: (url?: string) => void
  heroGifUrl?: string
  onHeroGifUrlChange: (url?: string) => void
}

export function HelpArticleEditorStep3({
  heroCoverUrl,
  heroGifUrl,
}: HelpArticleEditorStep3Props) {
  return (
    <div className="flex flex-col gap-5 animate-in fade-in duration-200">
      <div className="mb-1">
        <h2 className="text-xl font-semibold text-neutrals-charcoal m-0">
          מדיה ראשית
        </h2>
        <p className="text-sm text-neutrals-lead mt-1 m-0 leading-relaxed">
          תמונת נושא ל-Hero, והדגמה מונפשת אופציונלית (GIF) שתוצג בראש המאמר.
        </p>
      </div>

      {/* תמונת נושא (Hero Cover) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutrals-silver/60">
        <label className="block font-semibold text-xs text-neutrals-charcoal mb-3">
          תמונת נושא (Hero Cover)
        </label>
        <div className="w-full h-48 rounded-2xl border-2 border-dashed border-neutrals-silver bg-neutrals-silver/20 flex flex-col items-center justify-center p-4 text-center hover:border-accent transition-colors cursor-pointer">
          <Icon name="File" size={32} className="text-neutrals-lead mb-2" />
          <span className="text-sm font-semibold text-neutrals-charcoal mb-1">
            {heroCoverUrl ? 'תמונה נבחרה' : 'גררו תמונה שתוצג בראש המאמר'}
          </span>
          <span className="text-xs text-neutrals-lead">
            PNG, JPG או WebP עד 5MB
          </span>
        </div>
      </section>

      {/* הדגמה מונפשת (GIF) */}
      <section className="bg-white rounded-2xl p-6 shadow-sm border border-neutrals-silver/60">
        <label className="block font-semibold text-xs text-neutrals-charcoal mb-3">
          הדגמה מונפשת (GIF){' '}
          <span className="font-normal text-neutrals-lead">· אופציונלי</span>
        </label>
        <div className="w-full h-48 rounded-2xl border-2 border-dashed border-neutrals-silver bg-neutrals-silver/20 flex flex-col items-center justify-center p-4 text-center hover:border-accent transition-colors cursor-pointer">
          <Icon name="Search" size={32} className="text-accent mb-2" />
          <span className="text-sm font-semibold text-neutrals-charcoal mb-1">
            {heroGifUrl ? 'קובץ GIF נבחר' : 'גררו קובץ GIF שממחיש את הפעולה'}
          </span>
          <span className="text-xs text-neutrals-lead">GIF מונפש עד 10MB</span>
        </div>
        <p className="text-xs text-neutrals-lead mt-3 m-0 leading-relaxed">
          GIF קצר (עד כ-10 שניות) שממחיש רצף לחיצות במסך משפר משמעותית את ההבנה
          לעומת תמונה סטטית.
        </p>
      </section>
    </div>
  )
}
